'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Send, Loader2, Bot, User } from 'lucide-react';
import { format } from 'date-fns';

// ---- Utilities: robust timestamp handling ----
const toDate = (ts) => {
  if (!ts) return null;
  if (ts instanceof Date) return isNaN(ts.getTime()) ? null : ts;
  if (typeof ts === 'number') {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof ts === 'object') {
    // Firestore-like { seconds, nanoseconds }
    if (typeof ts.seconds === 'number') {
      const d = new Date(ts.seconds * 1000);
      return isNaN(d.getTime()) ? null : d;
    }
    // { _seconds } or other shapes
    if (typeof ts._seconds === 'number') {
      const d = new Date(ts._seconds * 1000);
      return isNaN(d.getTime()) ? null : d;
    }
  }
  // string
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
};

const normalizeMessage = (m) => {
  const d = toDate(m?.timestamp);
  return {
    ...m,
    timestamp: d ? d.toISOString() : null, // keep storage consistent
  };
};

const formatTime = (timestamp) => {
  const d = toDate(timestamp);
  if (!d) return '';
  try {
    return format(d, 'h:mm a');
  } catch {
    return '';
  }
};

export default function ChatPage() {
  const [log, setLog] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const params = useParams();
  const logId = params?.logId;
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (logId) {
      fetchLogAndMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchLogAndMessages = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/logs/${logId}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Log not found');

      const data = await response.json();
      setLog(data.data);

      const existing = data?.data?.chatSession?.messages || [];
      if (existing.length) {
        // Normalize any incoming timestamps
        setMessages(existing.map(normalizeMessage));
      } else {
        await sendInitialGreeting(data.data);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const sendInitialGreeting = async (logData) => {
    const greetingMessage = `Thank you for sharing your experience${
      logData.userText ? '. What you wrote feels meaningful' : ''
    }. I'm here to help you explore and understand what you've experienced. What would you like to reflect on together?`;

    const initialMessages = [
      {
        role: 'assistant',
        content: greetingMessage,
        timestamp: new Date().toISOString(),
      },
    ];

    setMessages(initialMessages);
    await updateChatSession(initialMessages);
  };

  const updateChatSession = async (updatedMessages) => {
    try {
      await fetch(`/api/logs/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          chatSession: {
            messages: updatedMessages,
            lastActivity: new Date().toISOString(),
          },
        }),
      });
    } catch (err) {
      console.error('Error updating chat session:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const userMessage = {
      role: 'user',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(), // always ISO
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setNewMessage('');
    setSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          logId,
          message: userMessage.content,
          messages: updatedMessages,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      const aiMessageRaw = data?.data?.message || {};
      const aiMessage = normalizeMessage({
        role: aiMessageRaw.role || 'assistant',
        content: aiMessageRaw.content || '',
        timestamp: aiMessageRaw.timestamp || new Date().toISOString(),
      });

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      await updateChatSession(finalMessages);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading your conversation...</p>
        </div>
      </div>
    );
  }

  if (error && !log) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => router.back()} className="btn-secondary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-neutral-600 hover:text-neutral-800 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to introspection
          </button>
          <h2 className="text-2xl font-bold text-neutral-900">Reflective Conversation</h2>
          {log?.date && (
            <p className="text-neutral-600 text-sm">{format(new Date(log.date), 'MMMM d, yyyy')}</p>
          )}
        </div>
      </div>

      {/* Context card */}
      {log && (
        <div className="card mb-6 bg-neutral-50">
          <h3 className="font-medium text-neutral-800 mb-2">Your Experience</h3>
          <p className="text-sm text-neutral-700 italic line-clamp-2">"{log.userText}"</p>
          {Array.isArray(log.detectedEmotions) && log.detectedEmotions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {log.detectedEmotions.slice(0, 3).map((emotion, index) => (
                <span key={index} className="emotion-badge emotion-neutral text-xs">
                  {emotion.emotion}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 card overflow-hidden flex flex-col">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={`${index}-${message.timestamp ?? 'notime'}`}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-secondary-100 text-secondary-600'
                }`}
              >
                {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`flex-1 max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user' ? 'bg-primary-600 text-white ml-auto' : 'bg-neutral-100 text-neutral-800'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                {formatTime(message.timestamp) && (
                  <p
                    className={`text-xs mt-2 opacity-75 ${
                      message.role === 'user' ? 'text-primary-200' : 'text-neutral-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-neutral-100 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                  <span className="text-sm text-neutral-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="border-t border-neutral-200 p-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share what's on your mind..."
              className="flex-1 input-field"
              disabled={sending}
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="btn-primary px-4 py-2 disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>

          <p className="text-xs text-neutral-500 mt-2">
            This AI is here to help you explore your thoughts and feelings. It won't diagnose or interpret—just help you
            understand yourself better.
          </p>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-between items-center mt-6">
        <button onClick={() => router.push('/dashboard/daily-log')} className="btn-ghost">
          New Log Entry
        </button>

        <button onClick={() => router.push('/dashboard/analytics')} className="btn-secondary">
          View Analytics
        </button>
      </div>
    </div>
  );
}
