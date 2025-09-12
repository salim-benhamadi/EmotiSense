
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Send, Loader2, Heart, MessageCircle, Sparkles, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function DailyLogPage() {
  const [text, setText] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [emotions, setEmotions] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    fetchRecentLogs();
  }, []);

  const fetchRecentLogs = async () => {
    try {
      const response = await fetch('/api/logs?limit=5', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentLogs(data.data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching recent logs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          text: text.trim(),
          date: selectedDate
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create log');
      }

      setEmotions(data.data.detectedEmotions);
      setShowSuccess(true);
      setText('');
      fetchRecentLogs();

      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      joy: 'emotion-joy',
      happiness: 'emotion-joy',
      excitement: 'emotion-joy',
      sadness: 'emotion-sadness',
      anger: 'emotion-anger',
      fear: 'emotion-fear',
      anxiety: 'emotion-fear',
      surprise: 'emotion-surprise',
      disgust: 'emotion-disgust',
      neutral: 'emotion-neutral',
      uncertain: 'emotion-neutral'
    };
    
    return colors[emotion?.toLowerCase()] || 'emotion-neutral';
  };

  const handleLogClick = (logId) => {
    router.push(`/dashboard/introspection/${logId}`);
  };

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-50 rounded-full border border-primary-200/50">
          <Sparkles className="h-4 w-4 text-primary-600" />
          <span className="text-sm font-medium text-primary-700">
            {isToday ? "Today's Reflection" : "Past Reflection"}
          </span>
        </div>
        
        <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight">
          How are you feeling{isToday ? ' today' : ''}?
        </h2>
        
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Share what's on your mind. There's no right or wrong way to express yourself.
        </p>
      </div>

      <div className="card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-semibold text-neutral-700 mb-3">
                <Calendar className="inline h-4 w-4 mr-2" />
                Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-3">
                <Clock className="inline h-4 w-4 mr-2" />
                Word Count
              </label>
              <div className="px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="font-medium text-neutral-900">{wordCount}</span>
                <span className="text-neutral-600 text-sm ml-2">words</span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="log-text" className="block text-sm font-semibold text-neutral-700 mb-3">
              What happened? How are you feeling?
            </label>
            <div className="relative">
              <textarea
                id="log-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share whatever comes to mind... You might describe situations, physical sensations, thoughts, or anything else you noticed today. There's no need to use specific emotion words if they don't feel right."
                className="textarea-field min-h-[200px] text-base leading-relaxed"
                maxLength={5000}
              />
              <div className="absolute bottom-4 right-4 text-xs text-neutral-400">
                {text.length}/5000
              </div>
            </div>
            <p className="text-sm text-neutral-500 mt-2 italic">
              Take your time. Any form of expression is valid and meaningful.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {showSuccess && (
            <div className="bg-green-50 border-2 border-green-200 text-green-700 px-6 py-4 rounded-xl text-sm font-medium flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Your reflection has been saved successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing your entry...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                <span>Save & Analyze</span>
              </div>
            )}
          </button>
        </form>

        {emotions && emotions.length > 0 && (
          <div className="mt-8 p-8 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border-2 border-primary-100">
            <h3 className="font-semibold text-primary-800 mb-6 text-lg flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Emotional Patterns Detected
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {emotions.map((emotion, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <span className={`emotion-badge ${getEmotionColor(emotion.emotion)} font-medium`}>
                      {emotion.emotion}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-600">
                    <span className="font-medium">{Math.round(emotion.confidence * 100)}%</span>
                    <span className="text-xs ml-1">confidence</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-primary-700 mt-6 p-4 bg-white/40 rounded-xl">
              These are gentle suggestions based on your words. You know your experience best, 
              and these patterns are just one way to understand what you've shared.
            </p>
          </div>
        )}
      </div>

      {recentLogs.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-neutral-900">
              Recent Entries
            </h3>
            <div className="text-sm text-neutral-500 px-3 py-1 bg-neutral-100 rounded-full">
              {recentLogs.length} entries
            </div>
          </div>
          
          <div className="grid gap-4">
            {recentLogs.map((log, index) => (
              <div
                key={log.id}
                onClick={() => handleLogClick(log.id)}
                className="group p-6 border-2 border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-neutral-700 px-3 py-1 bg-neutral-100 rounded-full group-hover:bg-white">
                    {format(new Date(log.date), 'EEEE, MMMM d')}
                  </span>
                  <div className="flex items-center space-x-2">
                    {log.detectedEmotions?.slice(0, 3).map((emotion, emotionIndex) => (
                      <span
                        key={emotionIndex}
                        className={`text-xs px-3 py-1 rounded-full font-medium ${getEmotionColor(emotion.emotion)}`}
                      >
                        {emotion.emotion}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-neutral-700 line-clamp-2 leading-relaxed mb-4">
                  {log.userText}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 flex items-center">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Click to explore deeper
                  </span>
                  <div className="text-primary-600 group-hover:text-primary-700 font-medium text-sm group-hover:translate-x-1 transition-transform">
                    Explore →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-neutral-100 to-neutral-200 rounded-2xl p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h4 className="font-semibold text-neutral-800 mb-3 text-lg">
            Gentle Reminder
          </h4>
          <p className="text-neutral-600 leading-relaxed">
            Your experiences are valid exactly as they are. This space is for you to explore 
            and understand yourself without judgment. Take your time, and share only what feels 
            comfortable and meaningful to you.
          </p>
        </div>
      </div>
    </div>
  );
}
