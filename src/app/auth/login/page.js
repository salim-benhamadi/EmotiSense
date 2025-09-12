'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext.js';
import { Brain, Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Heart  } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && mounted) {
      router.push('/dashboard');
    }
  }, [user, router, mounted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-gentle-bounce"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl animate-gentle-bounce" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-4 mb-8 group">
            <div className="p-3 bg-gradient-primary rounded-xl group-hover:scale-105 transition-transform">
              <Brain className="h-10 w-10 text-black" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold text-neutral-800">EmotiSense AI</span>
              <p className="text-sm text-neutral-600">Emotional Awareness</p>
            </div>
          </Link>
          
          <div className="mb-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-full border border-white/20 mb-4">
              <Sparkles className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-neutral-700">Welcome Back</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">
            Continue your journey
          </h2>
          <p className="text-neutral-600 leading-relaxed">
            Sign in to access your emotional awareness tools
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-3">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12 text-base"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 pr-12 text-base"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-neutral-100 rounded-r-xl transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm text-neutral-700 font-medium">
                  Remember me
                </label>
              </div>

              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <span>Sign in</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-primary-600 hover:text-primary-500 font-semibold hover:underline">
                Create one here
              </Link>
            </p>
          </div>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-primary-800 mb-3 flex items-center">
            <Heart className="h-4 w-4 mr-2" />
            Secure & Private
          </h3>
          <ul className="text-xs text-primary-700 space-y-2">
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Your data is encrypted and protected</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>No judgment, only understanding and support</span>
            </li>
            <li className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Designed specifically for neurodivergent minds</span>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <p className="text-xs text-neutral-500 leading-relaxed">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-primary-600 hover:text-primary-500 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-500 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}