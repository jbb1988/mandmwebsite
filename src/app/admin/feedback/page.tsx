'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Filter, RefreshCw, Smartphone, Globe, Bug, Lightbulb, MessageCircle, Sparkles } from 'lucide-react';
import { LiquidGlass } from '@/components/LiquidGlass';
import { LiquidButton } from '@/components/LiquidButton';

interface Feedback {
  id: string;
  category: string;
  source: string;
  subject: string;
  message: string;
  contact_name: string | null;
  contact_email: string | null;
  user_name: string | null;
  user_email: string | null;
  app_version: string | null;
  device_info: any;
  url: string | null;
  created_at: string;
}

const categoryIcons: Record<string, React.ComponentType<any>> = {
  bug_report: Bug,
  feature_request: Lightbulb,
  general_feedback: MessageCircle,
  ai_coach_feedback: Sparkles,
};

const categoryColors: Record<string, string> = {
  bug_report: 'bg-red-500/20 text-red-400 border-red-500/30',
  feature_request: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  general_feedback: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  ai_coach_feedback: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export default function FeedbackDashboard() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const router = useRouter();

  const fetchFeedback = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedSource !== 'all') params.append('source', selectedSource);

      const response = await fetch(`/api/admin/feedback?${params.toString()}`);

      if (response.status === 401) {
        // Not authenticated - redirect to login
        router.push('/admin/login?returnUrl=/admin/feedback');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch feedback');
      }

      setFeedback(data.feedback || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [selectedCategory, selectedSource]);

  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatSource = (source: string) => {
    return source === 'mobile_app' ? 'Mobile App' : 'Website';
  };

  const CategoryIcon = ({ category }: { category: string }) => {
    const Icon = categoryIcons[category] || MessageCircle;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <LiquidGlass variant="blue" className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-block p-3 rounded-xl bg-neon-cortex-blue/20">
                <MessageSquare className="w-6 h-6 text-neon-cortex-blue" />
              </div>
              <div>
                <h1 className="text-3xl font-black">Feedback Dashboard</h1>
                <p className="text-text-secondary text-sm">
                  {feedback.length} total submission{feedback.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <LiquidButton onClick={fetchFeedback} variant="blue" size="md" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </LiquidButton>
          </div>
        </LiquidGlass>

        {/* Filters */}
        <LiquidGlass variant="neutral" className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-text-secondary" />
              <span className="text-sm font-semibold">Filters:</span>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors text-sm"
            >
              <option value="all">All Categories</option>
              <option value="bug_report">Bug Reports</option>
              <option value="feature_request">Feature Requests</option>
              <option value="general_feedback">General Feedback</option>
              <option value="ai_coach_feedback">AI Coach Feedback</option>
            </select>

            {/* Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-neon-cortex-blue focus:outline-none transition-colors text-sm"
            >
              <option value="all">All Sources</option>
              <option value="mobile_app">Mobile App</option>
              <option value="website">Website</option>
            </select>
          </div>
        </LiquidGlass>

        {/* Error State */}
        {error && (
          <LiquidGlass variant="neutral" className="p-6">
            <p className="text-red-400">{error}</p>
          </LiquidGlass>
        )}

        {/* Loading State */}
        {loading && (
          <LiquidGlass variant="neutral" className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cortex-blue mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading feedback...</p>
          </LiquidGlass>
        )}

        {/* Feedback List */}
        {!loading && feedback.length === 0 && (
          <LiquidGlass variant="neutral" className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No Feedback Yet</h3>
            <p className="text-text-secondary">
              {selectedCategory !== 'all' || selectedSource !== 'all'
                ? 'No feedback matches your filters.'
                : 'Feedback submissions will appear here.'}
            </p>
          </LiquidGlass>
        )}

        {!loading && feedback.length > 0 && (
          <div className="space-y-4">
            {feedback.map((item) => (
              <LiquidGlass
                key={item.id}
                variant="neutral"
                className="p-6 cursor-pointer hover:border-neon-cortex-blue/50 transition-all"
                onClick={() => setSelectedFeedback(item)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${categoryColors[item.category]}`}>
                        <CategoryIcon category={item.category} />
                        {formatCategory(item.category)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-text-secondary border border-white/10">
                        {item.source === 'mobile_app' ? <Smartphone className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                        {formatSource(item.source)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-1">{item.subject}</h3>
                    <p className="text-text-secondary text-sm line-clamp-2">{item.message}</p>
                  </div>
                  <div className="text-right text-xs text-text-secondary ml-4">
                    <p>{new Date(item.created_at).toLocaleDateString()}</p>
                    <p>{new Date(item.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-text-secondary pt-4 border-t border-white/10">
                  {(item.user_name || item.contact_name) && (
                    <span>
                      <strong>From:</strong> {item.user_name || item.contact_name}
                    </span>
                  )}
                  {(item.user_email || item.contact_email) && (
                    <span>
                      <strong>Email:</strong> {item.user_email || item.contact_email}
                    </span>
                  )}
                  {item.app_version && (
                    <span>
                      <strong>Version:</strong> {item.app_version}
                    </span>
                  )}
                </div>
              </LiquidGlass>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedFeedback && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedFeedback(null)}
          >
            <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <LiquidGlass variant="blue" className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${categoryColors[selectedFeedback.category]}`}>
                      <CategoryIcon category={selectedFeedback.category} />
                      {formatCategory(selectedFeedback.category)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-text-secondary border border-white/10">
                      {selectedFeedback.source === 'mobile_app' ? <Smartphone className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                      {formatSource(selectedFeedback.source)}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedFeedback(null)}
                    className="text-text-secondary hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <h2 className="text-2xl font-black mb-2">{selectedFeedback.subject}</h2>
                <p className="text-sm text-text-secondary mb-6">
                  Submitted {new Date(selectedFeedback.created_at).toLocaleString()}
                </p>

                <div className="p-6 bg-white/5 rounded-lg border border-white/10 mb-6">
                  <p className="whitespace-pre-wrap">{selectedFeedback.message}</p>
                </div>

                {/* User Info */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {(selectedFeedback.user_name || selectedFeedback.contact_name) && (
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs text-text-secondary mb-1">Name</p>
                      <p className="font-semibold">{selectedFeedback.user_name || selectedFeedback.contact_name}</p>
                    </div>
                  )}
                  {(selectedFeedback.user_email || selectedFeedback.contact_email) && (
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs text-text-secondary mb-1">Email</p>
                      <p className="font-semibold">{selectedFeedback.user_email || selectedFeedback.contact_email}</p>
                    </div>
                  )}
                  {selectedFeedback.app_version && (
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs text-text-secondary mb-1">App Version</p>
                      <p className="font-semibold">{selectedFeedback.app_version}</p>
                    </div>
                  )}
                  {selectedFeedback.url && (
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-xs text-text-secondary mb-1">Page URL</p>
                      <p className="font-semibold text-sm break-all">{selectedFeedback.url}</p>
                    </div>
                  )}
                </div>

                {/* Device Info */}
                {selectedFeedback.device_info && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-text-secondary mb-2">Device/Browser Information</p>
                    <pre className="text-xs font-mono overflow-x-auto">
                      {JSON.stringify(selectedFeedback.device_info, null, 2)}
                    </pre>
                  </div>
                )}
              </LiquidGlass>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
