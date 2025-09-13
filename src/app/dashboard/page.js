'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext.js';
import { 
  Book as BookOpen, 
  MessageCircle, 
  TrendingUp, 
  Calendar, 
  Heart, 
  PlusCircle,
  BarChart3,
  Clock
} from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEntries: 0,
    weeklyEntries: 0,
    streak: 0,
    hasEntryToday: false
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent logs
      const response = await fetch('/api/logs?limit=5', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const logs = data.data.logs || [];
        setRecentLogs(logs);
        
        // Calculate stats
        const totalEntries = data.data.pagination?.total || logs.length;
        const weeklyEntries = logs.filter(log => {
          const logDate = new Date(log.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return logDate >= weekAgo;
        }).length;
        
        const hasEntryToday = logs.some(log => isToday(new Date(log.date)));
        
        // Simple streak calculation
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const hasEntry = logs.some(log => {
            const logDate = new Date(log.date);
            return logDate.toDateString() === checkDate.toDateString();
          });
          if (hasEntry) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }
        
        setStats({
          totalEntries,
          weeklyEntries,
          streak,
          hasEntryToday
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
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
      neutral: 'emotion-neutral'
    };
    return colors[emotion?.toLowerCase()] || 'emotion-neutral';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
          {getGreeting()}, {user?.name}
        </h1>
        <p className="text-lg text-neutral-600">
          {stats.hasEntryToday 
            ? "You've shared your thoughts today. How are you feeling about exploring them deeper?"
            : "Ready to explore your emotional landscape today?"
          }
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          href="/dashboard/daily-log"
          className="card-hover group cursor-pointer transform transition-all duration-200 hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 p-3 rounded-lg group-hover:bg-primary-200 transition-colors">
              <PlusCircle className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">
                {stats.hasEntryToday ? 'Add Another Entry' : 'Today\'s Entry'}
              </h3>
              <p className="text-sm text-neutral-600">
                {stats.hasEntryToday ? 'Continue reflecting' : 'Share your experience'}
              </p>
            </div>
          </div>
        </Link>

        <Link 
          href="/dashboard/analytics"
          className="card-hover group cursor-pointer transform transition-all duration-200 hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-secondary-100 p-3 rounded-lg group-hover:bg-secondary-200 transition-colors">
              <TrendingUp className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">View Analytics</h3>
              <p className="text-sm text-neutral-600">Explore your patterns</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/assessment/tas20"
          className="card-hover group cursor-pointer transform transition-all duration-200 hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">Take Assessment</h3>
              <p className="text-sm text-neutral-600">TAS-20 evaluation</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen className="h-6 w-6 text-primary-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.totalEntries}</p>
          <p className="text-sm text-neutral-600">Total Entries</p>
        </div>

        <div className="card text-center">
          <div className="bg-secondary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="h-6 w-6 text-secondary-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.weeklyEntries}</p>
          <p className="text-sm text-neutral-600">This Week</p>
        </div>

        <div className="card text-center">
          <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats.streak}</p>
          <p className="text-sm text-neutral-600">Day Streak</p>
        </div>

        <div className="card text-center">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <Heart className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            {stats.hasEntryToday ? '✓' : '○'}
          </p>
          <p className="text-sm text-neutral-600">Today's Entry</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Logs */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-neutral-900 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary-600" />
              Recent Entries
            </h3>
            <Link 
              href="/dashboard/daily-log"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>

          {recentLogs.length > 0 ? (
            <div className="space-y-4">
              {recentLogs.slice(0, 3).map((log) => (
                <Link
                  key={log.id}
                  href={`/dashboard/introspection/${log.id}`}
                  className="block p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">
                      {format(new Date(log.date), 'MMM d, yyyy')}
                    </span>
                    {log.detectedEmotions?.length > 0 && (
                      <span className={`emotion-badge ${getEmotionColor(log.detectedEmotions[0].emotion)} text-xs`}>
                        {log.detectedEmotions[0].emotion}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {log.userText}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600 mb-2">No entries yet</p>
              <p className="text-sm text-neutral-500 mb-4">
                Start your emotional awareness journey by creating your first entry.
              </p>
              <Link href="/dashboard/daily-log" className="btn-primary">
                Create First Entry
              </Link>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="card">
          <h3 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-secondary-600" />
            Today's Reflection
          </h3>

          <div className="space-y-4">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h4 className="font-medium text-primary-800 mb-2">Gentle Reminder</h4>
              <p className="text-sm text-primary-700">
                There's no "right" way to express emotions. Your experiences are valid exactly as they are, 
                whether you use traditional emotion words or describe sensations, thoughts, or situations.
              </p>
            </div>

            <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
              <h4 className="font-medium text-secondary-800 mb-2">Reflection Prompt</h4>
              <p className="text-sm text-secondary-700">
                "What did I notice in my body today? What thoughts kept returning? 
                What situations felt different than usual?"
              </p>
            </div>

            {!stats.hasEntryToday && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Ready to Begin?</h4>
                <p className="text-sm text-green-700 mb-3">
                  Take a moment to check in with yourself. What would you like to explore today?
                </p>
                <Link href="/dashboard/daily-log" className="btn-primary text-sm py-2 px-3">
                  Start Today's Entry
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      {stats.totalEntries >= 3 && !user?.tas20Score && (
        <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Ready for Deeper Understanding?
            </h3>
            <p className="text-neutral-700 mb-4">
              You've been consistently reflecting on your experiences. Consider taking the TAS-20 assessment 
              to gain additional insights into your emotional awareness patterns.
            </p>
            <Link href="/assessment/tas20" className="btn-primary">
              Take TAS-20 Assessment
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
