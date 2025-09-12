'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Save, BarChart3, Info } from 'lucide-react';

const TAS20_QUESTIONS = [
  { id: 1, text: "I have feelings that I can't quite identify.", category: "DIF" },
 { id: 2, text: "It is difficult for me to find the right words for my feelings.", category: "DDF" },
  { id: 3, text: "I have physical sensations that even doctors don't understand.", category: "EOT" },
  { id: 4, text: "I am able to describe my feelings easily.", category: "DDF", reverse: true },
  { id: 5, text: "I prefer to analyze problems rather than just describe them.", category: "EOT" },
  { id: 6, text: "When I am upset, I don't know if I am sad, frightened, or angry.", category: "DIF" },
  { id: 7, text: "I am often puzzled by sensations in my body.", category: "DIF" },
  { id: 8, text: "I prefer to just let things happen rather than to understand why they turned out that way.", category: "EOT", reverse: true },
  { id: 9, text: "I have some of my feelings that I don't quite understand.", category: "DIF" },
  { id: 10, text: "Being in touch with emotions is essential.", category: "EOT", reverse: true },
  { id: 11, text: "I find it hard to describe how I feel about people.", category: "DDF" },
  { id: 12, text: "People tell me to describe my feelings more.", category: "DDF" },
  { id: 13, text: "I don't know what's going on inside me.", category: "DIF" },
  { id: 14, text: "I often don't know why I am angry.", category: "DIF" },
  { id: 15, text: "I prefer talking to people about their daily activities rather than their feelings.", category: "EOT" },
  { id: 16, text: "I prefer entertainment shows rather than psychological dramas.", category: "EOT" },
  { id: 17, text: "It is difficult for me to reveal my innermost feelings, even to close friends.", category: "DDF" },
  { id: 18, text: "I can feel close to someone, even in moments of silence.", category: "EOT", reverse: true },
  { id: 19, text: "I find examination of my feelings useful in solving personal problems.", category: "EOT", reverse: true },
  { id: 20, text: "Looking for hidden meanings in movies or plays distracts from their enjoyment.", category: "EOT" }
];

const SCALE_OPTIONS = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Moderately disagree" },
  { value: 3, label: "Neither agree nor disagree" },
  { value: 4, label: "Moderately agree" },
  { value: 5, label: "Strongly agree" }
];

export default function TAS20Assessment({ token }) {
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: parseInt(value)
    }));
  };

  const calculateResults = () => {
    let difScore = 0; // Difficulty Identifying Feelings
    let ddfScore = 0; // Difficulty Describing Feelings
    let eotScore = 0; // Externally Oriented Thinking

    TAS20_QUESTIONS.forEach(question => {
      const response = responses[question.id];
      if (response) {
        const score = question.reverse ? (6 - response) : response;
        
        switch (question.category) {
          case 'DIF':
            difScore += score;
            break;
          case 'DDF':
            ddfScore += score;
            break;
          case 'EOT':
            eotScore += score;
            break;
        }
      }
    });

    const totalScore = difScore + ddfScore + eotScore;
    
    let interpretation = '';
    if (totalScore <= 51) {
      interpretation = 'Non-alexithymic';
    } else if (totalScore <= 61) {
      interpretation = 'Possible alexithymic';
    } else {
      interpretation = 'Alexithymic';
    }

    return {
      totalScore,
      difScore,
      ddfScore,
      eotScore,
      interpretation,
      completedAt: new Date().toISOString()
    };
  };

  const handleSubmit = async () => {
    const allAnswered = TAS20_QUESTIONS.every(q => responses[q.id]);
    
    if (!allAnswered) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const assessmentResults = calculateResults();

      
      const response = await fetch('/api/assessment/tas20', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          responses,
          results: assessmentResults
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save assessment');
      }

      setResults(assessmentResults);
      setCompleted(true);

    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const canGoNext = () => {
    return currentQuestion < TAS20_QUESTIONS.length - 1 && responses[TAS20_QUESTIONS[currentQuestion].id];
  };

  const canGoPrev = () => {
    return currentQuestion > 0;
  };

  const progress = ((currentQuestion + 1) / TAS20_QUESTIONS.length) * 100;
  const answeredCount = Object.keys(responses).length;

  if (completed && results) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Assessment Complete
          </h2>
          <p className="text-neutral-600">
            Thank you for taking the time to complete the TAS-20 assessment.
          </p>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-neutral-900 mb-6">Your Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="bg-primary-50 p-4 rounded-lg">
                <h4 className="font-medium text-primary-800 mb-2">Total Score</h4>
                <p className="text-2xl font-bold text-primary-900">{results.totalScore}/100</p>
                <p className="text-sm text-primary-700">{results.interpretation}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Difficulty Identifying Feelings</span>
                  <span className="font-medium">{results.difScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Difficulty Describing Feelings</span>
                  <span className="font-medium">{results.ddfScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Externally Oriented Thinking</span>
                  <span className="font-medium">{results.eotScore}</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-lg">
              <h4 className="font-medium text-neutral-800 mb-3 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Understanding Your Results
              </h4>
              <div className="text-sm text-neutral-700 space-y-2">
                {results.interpretation === 'Non-alexithymic' && (
                  <p>Your scores suggest you generally have good awareness of your emotions and can describe them well.</p>
                )}
                {results.interpretation === 'Possible alexithymic' && (
                  <p>Your scores suggest you may sometimes have difficulty identifying or describing emotions. This is quite common and normal.</p>
                )}
                {results.interpretation === 'Alexithymic' && (
                  <p>Your scores suggest you may often find it challenging to identify and describe emotions, which is a common experience for many people.</p>
                )}
                <p className="mt-3 font-medium">
                  Remember: This assessment is for self-understanding only and is not a medical diagnosis.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <h4 className="font-medium text-primary-800 mb-3">Next Steps</h4>
            <p className="text-sm text-primary-700 mb-4">
              These results can help inform your emotional awareness journey. Consider using EmotiSense's 
              daily logging and introspection features to explore your emotional experiences further.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push('/dashboard/daily-log')}
                className="btn-primary"
              >
                Start Daily Logging
              </button>
              <button
                onClick={() => router.push('/dashboard/analytics')}
                className="btn-secondary"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = TAS20_QUESTIONS[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-neutral-600 hover:text-neutral-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to dashboard
        </button>
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          TAS-20 Assessment
        </h2>
        <p className="text-neutral-600">
          Toronto Alexithymia Scale - Understanding your emotional awareness
        </p>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">
            Question {currentQuestion + 1} of {TAS20_QUESTIONS.length}
          </h3>
          <span className="text-sm text-neutral-500">
            {answeredCount}/{TAS20_QUESTIONS.length} answered
          </span>
        </div>

        <div className="w-full bg-neutral-200 rounded-full h-2 mb-8">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question */}
        <div className="space-y-6">
          <div className="bg-neutral-50 p-6 rounded-lg">
            <h4 className="text-xl font-medium text-neutral-800 mb-4">
              {question.text}
            </h4>
            
            <div className="space-y-3">
              {SCALE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.value}
                    checked={responses[question.id] === option.value}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                  />
                  <span className="text-neutral-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={!canGoPrev()}
            className="btn-ghost disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </button>

          <div className="flex space-x-3">
            {currentQuestion === TAS20_QUESTIONS.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={saving || !responses[question.id]}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Complete Assessment
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                disabled={!canGoNext()}
                className="btn-primary disabled:opacity-50"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <h4 className="font-medium text-primary-800 mb-2 flex items-center">
          <Info className="h-4 w-4 mr-2" />
          About This Assessment
        </h4>
        <p className="text-sm text-primary-700">
          The TAS-20 is a validated tool for measuring alexithymia. It explores three dimensions: 
          difficulty identifying feelings, difficulty describing feelings, and externally oriented thinking. 
          This assessment is for self-understanding only and is not a medical diagnosis.
        </p>
      </div>
    </div>
  );
}