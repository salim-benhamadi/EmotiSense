'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Heart, MessageCircle, Calendar, BarChart3, Book as BookOpen, Sparkles, Target } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { format, subDays, parseISO } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

export default function AnalyticsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [stats, setStats] = useState({
    totalEntries: 0,
    avgEmotionsPerEntry: 0,
    mostCommonEmotion: '',
    streakDays: 0
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const startDate = subDays(new Date(), parseInt(timeRange));
      
      const response = await fetch(
        `/api/logs?startDate=${startDate.toISOString()}&limit=100`,
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.data.logs || []);
        calculateStats(data.data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (logData) => {
    if (logData.length === 0) {
      setStats({ totalEntries: 0, avgEmotionsPerEntry: 0, mostCommonEmotion: '', streakDays: 0 });
      return;
    }

    const totalEntries = logData.length;
    const totalEmotions = logData.reduce((sum, log) => sum + (log.detectedEmotions?.length || 0), 0);
    const avgEmotionsPerEntry = totalEmotions / totalEntries;

    const emotionCounts = {};
    logData.forEach(log => {
      log.detectedEmotions?.forEach(emotion => {
        emotionCounts[emotion.emotion] = (emotionCounts[emotion.emotion] || 0) + 1;
      });
    });
    
    const mostCommonEmotion = Object.keys(emotionCounts).length > 0 
      ? Object.keys(emotionCounts).reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b)
      : '';

    const sortedDates = logData
      .map(log => format(parseISO(log.date), 'yyyy-MM-dd'))
      .sort()
      .reverse();
    
    let streakDays = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    let currentDate = today;
    
    for (const logDate of sortedDates) {
      if (logDate === currentDate) {
        streakDays++;
        currentDate = format(subDays(parseISO(currentDate), 1), 'yyyy-MM-dd');
      } else {
        break;
      }
    }

    setStats({
      totalEntries,
      avgEmotionsPerEntry: Math.round(avgEmotionsPerEntry * 10) / 10,
      mostCommonEmotion,
      streakDays
    });
  };

  const getEmotionTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, 'yyyy-MM-dd');
    });

    const emotionCounts = last7Days.map(date => {
      const dayLogs = logs.filter(log => format(parseISO(log.date), 'yyyy-MM-dd') === date);
      return dayLogs.reduce((sum, log) => sum + (log.detectedEmotions?.length || 0), 0);
    });

    return {
      labels: last7Days.map(date => format(parseISO(date), 'MMM d')),
      datasets: [
        {
          label: 'Emotions Detected',
          data: emotionCounts,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    };
  };

  const getEmotionDistribution = () => {
    const emotionCounts = {};
    logs.forEach(log => {
      log.detectedEmotions?.forEach(emotion => {
        emotionCounts[emotion.emotion] = (emotionCounts[emotion.emotion] || 0) + 1;
      });
    });

    const emotions = Object.keys(emotionCounts).slice(0, 6);
    const counts = emotions.map(emotion => emotionCounts[emotion]);

    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'
    ];

    return {
      labels: emotions.map(emotion => emotion.charAt(0).toUpperCase() + emotion.slice(1)),
      datasets: [
        {
          data: counts,
          backgroundColor: colors.slice(0, emotions.length),
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverBorderWidth: 4
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 11
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
    },
    cutout: '60%'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 animate-pulse">Loading your insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-50 rounded-full border border-primary-200/50 mb-4">
            <Sparkles className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">Personal Insights</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight">Analytics Dashboard</h2>
          <p className="text-lg text-neutral-600 mt-2">
            Discover patterns and insights from your emotional journey
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Target className="h-5 w-5 text-neutral-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field w-auto min-w-[140px]"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card group hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:scale-110 transition-transform">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">Total Entries</p>
              <p className="text-3xl font-bold text-neutral-900">{stats.totalEntries}</p>
            </div>
          </div>
        </div>

        <div className="card group hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:scale-110 transition-transform">
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">Avg Emotions</p>
              <p className="text-3xl font-bold text-neutral-900">{stats.avgEmotionsPerEntry}</p>
            </div>
          </div>
        </div>

        <div className="card group hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">Most Common</p>
              <p className="text-lg font-semibold text-neutral-900 capitalize">
                {stats.mostCommonEmotion || 'None yet'}
              </p>
            </div>
          </div>
        </div>

        <div className="card group hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl group-hover:scale-110 transition-transform">
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-600 uppercase tracking-wide">Current Streak</p>
              <p className="text-3xl font-bold text-neutral-900">{stats.streakDays} days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg mr-3">
              <BarChart3 className="h-5 w-5 text-primary-600" />
            </div>
            7-Day Emotion Trend
          </h3>
          <div className="h-80">
            <Line data={getEmotionTrendData()} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
            <div className="p-2 bg-secondary-100 rounded-lg mr-3">
              <Heart className="h-5 w-5 text-secondary-600" />
            </div>
            Emotion Distribution
          </h3>
          <div className="h-80">
            <Doughnut data={getEmotionDistribution()} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
          <div className="p-2 bg-green-100 rounded-lg mr-3">
            <MessageCircle className="h-5 w-5 text-green-600" />
          </div>
          Recent Insights
        </h3>
        
        {logs.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-2xl border border-primary-200">
                <h4 className="font-semibold text-primary-800 mb-3">Vocabulary Growth</h4>
                <p className="text-sm text-primary-700 leading-relaxed">
                  You've used <span className="font-bold">{new Set(logs.flatMap(log => log.detectedEmotions?.map(e => e.emotion) || [])).size}</span> different emotional descriptors in your recent entries, showing expanding self-awareness.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 p-6 rounded-2xl border border-secondary-200">
                <h4 className="font-semibold text-secondary-800 mb-3">Reflection Consistency</h4>
                <p className="text-sm text-secondary-700 leading-relaxed">
                  You've maintained a <span className="font-bold">{stats.streakDays}-day streak</span>. 
                  {stats.streakDays > 0 ? ' Excellent consistency in your self-reflection journey!' : ' Consider setting a gentle daily reminder.'}
                </p>
              </div>
            </div>

            {stats.mostCommonEmotion && (
              <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 rounded-2xl border border-neutral-200">
                <h4 className="font-semibold text-neutral-800 mb-3">Pattern Observation</h4>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  <span className="font-bold capitalize">"{stats.mostCommonEmotion}"</span> appears frequently in your recent entries. 
                  This recurring pattern might be worth exploring deeper through introspection sessions or conversations with the AI.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-neutral-400" />
            </div>
            <h4 className="text-lg font-semibold text-neutral-900 mb-2">No data available yet</h4>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              Start logging your daily experiences to see meaningful insights and patterns emerge over time.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard/daily-log'}
              className="btn-primary"
            >
              Create Your First Entry
            </button>
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-neutral-900 mb-6">
            Your Emotional Vocabulary
          </h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {Array.from(new Set(logs.flatMap(log => log.detectedEmotions?.map(e => e.emotion) || [])))
              .slice(0, 20)
              .map((emotion, index) => (
                <span
                  key={index}
                  className="emotion-badge emotion-neutral hover:scale-105 transition-transform cursor-default"
                >
                  {emotion}
                </span>
              ))}
          </div>
          <p className="text-sm text-neutral-600 p-4 bg-neutral-50 rounded-xl leading-relaxed">
            These emotional patterns have been identified in your writing. Remember, your personal vocabulary 
            and way of experiencing emotions may be different, and that's completely valid and meaningful.
          </p>
        </div>
      )}

      <div className="card bg-gradient-to-r from-primary-50 via-white to-secondary-50 border-primary-200/50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-3">
            Continue Your Journey
          </h3>
          <p className="text-neutral-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Regular reflection builds emotional awareness over time. Consider exploring deeper patterns 
            through the TAS-20 assessment to gain additional insights into your emotional processing style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/dashboard/daily-log'}
              className="btn-primary"
            >
              Add New Entry
            </button>
            <button
              onClick={() => window.location.href = '/assessment/tas20'}
              className="btn-secondary"
            >
              Take Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}