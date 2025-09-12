
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext.js';
import { Brain, Heart, Users, TrendingUp, Shield, Lightbulb, Sparkles, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && user && mounted) {
      router.push('/dashboard');
    }
  }, [user, loading, router, mounted]);

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-primary-50 to-secondary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="glass-effect border-b border-white/20 sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-1.5 sm:p-2 bg-gradient-primary rounded-xl">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-800" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold text-neutral-800">EmotiSense AI</span>
                <p className="text-xs text-neutral-600 hidden sm:block">Emotional Awareness Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/auth/login" className="btn-ghost px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base">
                Sign In
              </Link>
              <Link href="/auth/register" className="btn-primary px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative py-16 sm:py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-neutral-50 to-primary-50">
          <div className="absolute inset-0">
            <div className="absolute top-10 left-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-primary-200/20 rounded-full blur-3xl animate-gentle-bounce"></div>
            <div className="absolute bottom-10 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-secondary-200/15 rounded-full blur-3xl animate-gentle-bounce" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-6 sm:mb-8">
              <div className="inline-flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-primary-200/50 mb-4 sm:mb-6">
                <Sparkles className="h-4 w-4 text-primary-600" />
                <span className="text-xs sm:text-sm font-medium text-neutral-800">Designed for Neurodivergent Minds</span>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-7xl font-bold text-neutral-900 mb-6 sm:mb-8 tracking-tight leading-tight">
              Understanding Your{' '}
                Emotional World
            </h1>
            
            <p className="text-base sm:text-lg lg:text-2xl text-neutral-700 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
              A compassionate AI platform designed specifically for neurodivergent individuals 
              to explore, understand, and articulate their emotional experiences without judgment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
              <Link href="/auth/register" className="w-full sm:w-auto btn-primary text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 group">
                Start Your Journey
              </Link>
              <Link href="#learn-more" className="w-full sm:w-auto btn-secondary text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4">
                Learn More
              </Link>
            </div>
            
            <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto px-4">
              <div className="card text-center p-4 sm:p-6 bg-white/90 backdrop-blur-sm border border-white/50">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2 text-sm sm:text-base">AI-Powered Insights</h3>
                <p className="text-xs sm:text-sm text-neutral-600">Gentle emotion detection that respects neurodivergent communication patterns</p>
              </div>
              
              <div className="card text-center p-4 sm:p-6 bg-white/90 backdrop-blur-sm border border-white/50">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-secondary-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2 text-sm sm:text-base">Safe Expression</h3>
                <p className="text-xs sm:text-sm text-neutral-600">Express yourself through sensations, thoughts, or any form that feels natural</p>
              </div>
              
              <div className="card text-center p-4 sm:p-6 bg-white/90 backdrop-blur-sm border border-white/50 sm:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2 text-sm sm:text-base">Personal Growth</h3>
                <p className="text-xs sm:text-sm text-neutral-600">Track patterns and build self-understanding at your own pace</p>
              </div>
            </div>
          </div>
        </section>

        <section id="learn-more" className="py-16 sm:py-20 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 sm:mb-6 tracking-tight">
                Built for Neurodivergent Understanding
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                Research shows that 50-60% of autistic individuals experience alexithymia. 
                You're not alone, and understanding is absolutely possible.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="card-hover text-center group bg-white">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-neutral-900">Gentle Detection</h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  AI that understands neurodivergent communication patterns and helps identify 
                  emotions without imposing neurotypical frameworks.
                </p>
              </div>

              <div className="card-hover text-center group bg-white">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-neutral-900">Personal Introspection</h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  Dynamic questionnaires that adapt to your unique experiences, helping you 
                  explore connections between thoughts, feelings, and sensations.
                </p>
              </div>

              <div className="card-hover text-center group bg-white">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-neutral-900">Pattern Recognition</h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  Track your emotional vocabulary growth and discover patterns in your 
                  experiences over time, building genuine self-understanding.
                </p>
              </div>

              <div className="card-hover text-center group bg-white">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-neutral-900">Sensory-Aware</h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  Recognizes that emotions often manifest through sensory experiences and 
                  physical sensations rather than traditional emotional language.
                </p>
              </div>

              <div className="card-hover text-center group bg-white">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-100 to-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-neutral-900">Safe & Private</h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  Your emotional journey is personal. All data is encrypted and protected, 
                  with no judgment or interpretation imposed on your experiences.
                </p>
              </div>

              <div className="card-hover text-center group bg-white">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-neutral-900">Built by Understanding</h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  Created with input from neurodivergent individuals and based on current 
                  research in alexithymia and autism spectrum experiences.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 lg:py-24 gradient-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-6 sm:mb-8 tracking-tight">
              Your Emotional Understanding Starts Here
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-black-100 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
              Join a supportive platform designed specifically for minds like yours. 
              Begin exploring your emotional world with patience, understanding, and AI guidance.
            </p>
            <Link href="/auth/register" className="inline-flex items-center bg-white text-primary-600 hover:bg-primary-50 font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl group text-sm sm:text-base">
              Create Your Account
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-neutral-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white">Understanding Alexithymia</h3>
                <p className="text-neutral-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Alexithymia affects how people identify, understand, and describe emotions. 
                  It's particularly common in neurodivergent individuals and isn't a limitation—it's 
                  a different way of experiencing the world.
                </p>
                <p className="text-neutral-300 leading-relaxed text-sm sm:text-base">
                  Our platform respects these differences and provides tools that work with your 
                  natural communication style, not against it.
                </p>
              </div>
              <div className="card bg-neutral-800/80 backdrop-blur-sm border-neutral-700">
                <h4 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-primary">Research-Based Statistics</h4>
                <ul className="space-y-3 sm:space-y-4 text-black text-sm sm:text-base">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>50-60% of autistic individuals experience alexithymia</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-secondary-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Traditional emotion tools often don't match neurodivergent experiences</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Sensory processing differences affect emotional awareness</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Personalized approaches show significantly better outcomes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div>
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-gradient-primary rounded-xl">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <span className="text-base sm:text-lg font-semibold">EmotiSense AI</span>
                  <p className="text-xs text-neutral-400">Emotional Awareness</p>
                </div>
              </div>
              <p className="text-neutral-400 leading-relaxed text-sm sm:text-base">
                Supporting neurodivergent individuals in understanding their emotional experiences 
                with compassion and AI-powered insights.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 sm:mb-6 text-sm sm:text-base">Platform</h4>
              <ul className="space-y-2 sm:space-y-3 text-neutral-400 text-sm sm:text-base">
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link href="/assessment" className="hover:text-white transition-colors">Assessment</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 sm:mb-6 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 sm:space-y-3 text-neutral-400 text-sm sm:text-base">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/research" className="hover:text-white transition-colors">Research</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-neutral-400">
            <p className="text-white text-xs sm:text-sm">&copy; 2025 EmotiSense AI. Supporting neurodivergent emotional understanding.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}