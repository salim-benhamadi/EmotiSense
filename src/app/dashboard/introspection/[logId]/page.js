'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Save, MessageCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function IntrospectionPage() {
  const [log, setLog] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  
  const router = useRouter();
  const params = useParams();
  const logId = params.logId;

  useEffect(() => {
    if (logId) {
      fetchLogAndQuestions();
    }
  }, [logId]);

  const fetchLogAndQuestions = async () => {
    try {
      setLoading(true);
      
      // Fetch log details
      const logResponse = await fetch(`/api/logs/${logId}`, {
        credentials: 'include'
      });
      
      if (!logResponse.ok) {
        throw new Error('Log not found');
      }
      
      const logData = await logResponse.json();
      setLog(logData.data);

      // Generate questions
      const questionsResponse = await fetch('/api/questionnaire/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ logId }),
      });

      if (!questionsResponse.ok) {
        throw new Error('Failed to generate questions');
      }

      const questionsData = await questionsResponse.json();
      setQuestions(questionsData.data.questions || []);

      // Load existing responses if any
      if (logData.data.questionnaire?.responses) {
        setResponses(logData.data.questionnaire.responses);
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/logs/${logId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          questionnaire: {
            questions,
            responses,
            completedAt: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save responses');
      }

      // Navigate to chat
      router.push(`/dashboard/chat/${logId}`);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderQuestion = (question) => {
    const value = responses[question.id] || '';

    switch (question.type) {
      case 'open':
        return (
          <textarea
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Take your time to reflect..."
            className="textarea-field min-h-[120px]"
          />
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    if (e.target.checked) {
                      handleResponseChange(question.id, [...currentValues, option]);
                    } else {
                      handleResponseChange(question.id, currentValues.filter(v => v !== option));
                    }
                  }}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded mt-1"
                />
                <span className="text-sm text-neutral-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                />
                <span className="text-sm text-neutral-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'scale':
        return (
          <div className="space-y-4">
            <input
              type="range"
              min={question.scale?.min || 1}
              max={question.scale?.max || 10}
              value={value || question.scale?.min || 1}
              onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-neutral-600">
              <span>{question.scale?.labels?.[question.scale.min] || question.scale?.min || 1}</span>
              <span className="font-medium text-primary-600">
                {value || question.scale?.min || 1}
              </span>
              <span>{question.scale?.labels?.[question.scale.max] || question.scale?.max || 10}</span>
            </div>
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="input-field"
          >
            <option value="">Select an option...</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Your response..."
            className="input-field"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600">Generating personalized questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!log || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <p className="text-neutral-600 mb-4">No questions available for this log.</p>
          <button
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const canProceed = currentStep < questions.length - 1;
  const canGoBack = currentStep > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-neutral-600 hover:text-neutral-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to logs
        </button>
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          Exploring Your Experience
        </h2>
        <p className="text-neutral-600">
          {log.date && format(new Date(log.date), 'MMMM d, yyyy')}
        </p>
      </div>

      {/* Original log */}
      <div className="card bg-neutral-50">
        <h3 className="font-semibold text-neutral-800 mb-3">Your Original Entry</h3>
        <p className="text-neutral-700 italic">"{log.userText}"</p>
        
        {log.detectedEmotions && log.detectedEmotions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {log.detectedEmotions.map((emotion, index) => (
              <span
                key={index}
                className={`emotion-badge emotion-${emotion.emotion} text-xs`}
              >
                {emotion.emotion}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-800">
            Question {currentStep + 1} of {questions.length}
          </h3>
          <span className="text-sm text-neutral-500">
            {Math.round(((currentStep + 1) / questions.length) * 100)}% complete
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-neutral-200 rounded-full h-2 mb-8">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Current question */}
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-medium text-neutral-800 mb-4">
              {currentQuestion.text}
            </h4>
            {currentQuestion.category && (
              <p className="text-sm text-neutral-500 mb-4">
                Category: {currentQuestion.category}
              </p>
            )}
          </div>

          {renderQuestion(currentQuestion)}

          {!currentQuestion.required && (
            <p className="text-xs text-neutral-500">
              This question is optional. Feel free to skip if it doesn't resonate with you.
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={!canGoBack}
            className="btn-ghost disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </button>

          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-secondary"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Progress
            </button>

            {canProceed ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="btn-primary"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <MessageCircle className="h-4 w-4 mr-2" />
                )}
                Continue to Chat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Help text */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <h4 className="font-medium text-primary-800 mb-2">
          Gentle Reminder
        </h4>
        <p className="text-sm text-primary-700">
          These questions are designed to help you explore your own understanding. 
          There are no right or wrong answers. Answer only what feels comfortable and meaningful to you.
        </p>
      </div>
    </div>
  );
}
