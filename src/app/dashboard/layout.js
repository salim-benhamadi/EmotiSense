'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext.js';
import { 
  Brain, 
  Book as BookOpen, 
  MessageCircle, 
  TrendingUp, 
  Settings, 
  LogOut,
  Menu,
  X,
  User,
  Calendar,
  BarChart3,
  Heart
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user && mounted) {
      router.push('/auth/login');
    }
  }, [user, loading, router, mounted]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-primary-50 to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 animate-pulse">Loading your space...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navigation = [
    {
      name: 'Daily Log',
      href: '/dashboard/daily-log',
      icon: BookOpen,
      description: 'Record your daily experiences',
      color: 'text-blue-600'
    },
    {
      name: 'Previous Logs',
      href: '/dashboard/logs',
      icon: Calendar,
      description: 'View past entries',
      color: 'text-purple-600'
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: TrendingUp,
      description: 'Insights and patterns',
      color: 'text-green-600'
    },
    {
      name: 'Assessment',
      href: '/assessment/tas20',
      icon: BarChart3,
      description: 'TAS-20 evaluation',
      color: 'text-orange-600'
    }
  ];

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-secondary-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-25 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 glass-effect transform transition-all duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:bg-white/90 lg:backdrop-blur-xl
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-8 border-b border-white/20">
            <Link href="/dashboard" className="flex items-center space-x-4 group">
              <div className="p-2 bg-gradient-primary rounded-xl group-hover:scale-105 transition-transform">
                <Brain className="h-8 w-8 text-black" />
              </div>
              <div>
                <span className="text-xl font-bold text-neutral-800">EmotiSense</span>
                <p className="text-xs text-neutral-600">Emotional Awareness</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-8 py-6 border-b border-white/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl">
                <User className="h-6 w-6 text-primary-700" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900">{user.name}</p>
                <p className="text-sm text-neutral-600 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-6 space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02]
                  ${isActive(item.href)
                    ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 border border-primary-200/50 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/40 hover:backdrop-blur-sm'
                  }
                `}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive(item.href) 
                    ? 'bg-primary-100' 
                    : 'bg-neutral-100 group-hover:bg-neutral-200'
                }`}>
                  <item.icon className={`h-5 w-5 ${isActive(item.href) ? item.color : 'text-neutral-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{item.name}</div>
                  <div className="text-xs text-neutral-500 truncate">{item.description}</div>
                </div>
                {isActive(item.href) && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-gentle-bounce"></div>
                )}
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t border-white/20 space-y-2">
            <Link
              href="/dashboard/settings"
              className="flex items-center space-x-4 px-4 py-3 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-white/40 transition-all duration-200 group"
            >
              <div className="p-2 bg-neutral-100 group-hover:bg-neutral-200 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </div>
              <span className="font-medium">Settings</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-neutral-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
            >
              <div className="p-2 bg-neutral-100 group-hover:bg-red-100 rounded-lg transition-colors">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="font-medium">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="lg:ml-80">
        <div className="glass-effect border-b border-white/20 px-6 py-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-white/20 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                  {pathname === '/dashboard' && 'Dashboard'}
                  {pathname === '/dashboard/daily-log' && 'Daily Log'}
                  {pathname === '/dashboard/logs' && 'Previous Logs'}
                  {pathname === '/dashboard/analytics' && 'Analytics'}
                  {pathname.startsWith('/dashboard/introspection') && 'Introspection'}
                  {pathname.startsWith('/dashboard/chat') && 'AI Chat'}
                  {pathname === '/assessment/tas20' && 'TAS-20 Assessment'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/40 rounded-xl backdrop-blur-sm">
                <Calendar className="h-4 w-4 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="p-2 bg-white/40 rounded-xl backdrop-blur-sm">
                <Heart className="h-4 w-4 text-red-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <main className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}