'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Search, Filter, MessageCircle, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [emotionFilter, setEmotionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const router = useRouter();
  const logsPerPage = 10;

  useEffect(() => {
    fetchLogs();
  }, [currentPage, dateFilter, emotionFilter]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        fetchLogs();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      let url = `/api/logs?limit=${logsPerPage}&offset=${(currentPage - 1) * logsPerPage}`;
      
      // Add date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate, endDate;
        
        switch (dateFilter) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
            break;
          case '3months':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        }
        
        if (startDate) url += `&startDate=${startDate.toISOString()}`;
        if (endDate) url += `&endDate=${endDate.toISOString()}`;
      }

      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        let filteredLogs = data.data.logs || [];
        
        // Apply client-side filters
        if (searchTerm) {
          filteredLogs = filteredLogs.filter(log =>
            log.userText.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (emotionFilter !== 'all') {
          filteredLogs = filteredLogs.filter(log =>
            log.detectedEmotions?.some(emotion => 
              emotion.emotion.toLowerCase() === emotionFilter.toLowerCase()
            )
          );
        }
        
        setLogs(filteredLogs);
        setTotalCount(data.data.pagination?.total || filteredLogs.length);
        setTotalPages(Math.ceil((data.data.pagination?.total || filteredLogs.length) / logsPerPage));
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      joy: 'emotion-joy',
      happiness: 'emotion-joy',
      sadness: 'emotion-sadness',
      anger: 'emotion-anger',
      fear: 'emotion-fear',
      anxiety: 'emotion-fear',
      surprise: 'emotion-surprise',
      neutral: 'emotion-neutral'
    };
    return colors[emotion?.toLowerCase()] || 'emotion-neutral';
  };

  const getAllEmotions = () => {
    const emotions = new Set();
    logs.forEach(log => {
      log.detectedEmotions?.forEach(emotion => {
        emotions.add(emotion.emotion);
      });
    });
    return Array.from(emotions).sort();
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900">Your Journal Entries</h2>
          <p className="text-neutral-600 mt-1">
            {totalCount} {totalCount === 1 ? 'entry' : 'entries'} in your emotional journey
          </p>
        </div>
        
        <Link href="/dashboard/daily-log" className="btn-primary">
          New Entry
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search your entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              <option value="all">All time</option>
              <option value="week">Past week</option>
              <option value="month">This month</option>
              <option value="3months">Past 3 months</option>
            </select>
          </div>

          {/* Emotion Filter */}
          <div className="relative">
            <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <select
              value={emotionFilter}
              onChange={(e) => setEmotionFilter(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              <option value="all">All emotions</option>
              {getAllEmotions().map(emotion => (
                <option key={emotion} value={emotion}>
                  {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {logs.length > 0 ? (
        <>
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="card-hover cursor-pointer"
                onClick={() => router.push(`/dashboard/introspection/${log.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <Calendar className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900">
                        {format(parseISO(log.date), 'EEEE, MMMM d, yyyy')}
                      </h3>
                      <p className="text-sm text-neutral-500">
                        {format(parseISO(log.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {log.detectedEmotions?.slice(0, 3).map((emotion, index) => (
                      <span
                        key={index}
                        className={`emotion-badge ${getEmotionColor(emotion.emotion)} text-xs`}
                      >
                        {emotion.emotion}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-neutral-700 mb-4 line-clamp-3">
                  {log.userText}
                </p>

                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {log.detectedEmotions?.length || 0} emotions
                    </span>
                    {log.questionnaire && (
                      <span className="flex items-center text-green-600">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Questionnaire completed
                      </span>
                    )}
                    {log.chatSession?.messages?.length > 0 && (
                      <span className="flex items-center text-blue-600">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {log.chatSession.messages.length} chat messages
                      </span>
                    )}
                  </div>
                  <span className="text-primary-600 hover:text-primary-700">
                    Explore →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">
                Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, totalCount)} of {totalCount} entries
              </p>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn-ghost disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded text-sm ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-ghost disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card text-center py-12">
          {searchTerm || dateFilter !== 'all' || emotionFilter !== 'all' ? (
            <>
              <Search className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No entries match your filters</h3>
              <p className="text-neutral-600 mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('all');
                  setEmotionFilter('all');
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No entries yet</h3>
              <p className="text-neutral-600 mb-4">
                Start your emotional awareness journey by creating your first entry.
              </p>
              <Link href="/dashboard/daily-log" className="btn-primary">
                Create First Entry
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}