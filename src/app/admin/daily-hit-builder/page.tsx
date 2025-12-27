'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminGate from '@/components/AdminGate';
import {
  Calendar, Mic, FileText, Sparkles, Play, Pause, Check, X,
  ChevronLeft, ChevronRight, AlertCircle, RefreshCw, Trash2,
  Eye, Edit3, Send, Clock, CheckCircle, XCircle, Loader2,
  Volume2, Download, Plus, Search, Filter, BarChart3
} from 'lucide-react';

// Types
interface CalendarDay {
  day_of_year: number;
  content_id: string | null;
  content_title: string | null;
  content_status: string | null;
  draft_id: string | null;
  draft_title: string | null;
  draft_status: string | null;
  slot_status: 'published' | 'draft' | 'pending_review' | 'approved' | 'empty';
}

interface CalendarStats {
  total: number;
  published: number;
  drafts: number;
  pendingReview: number;
  empty: number;
}

interface Topic {
  id: string;
  title: string;
  category: string;
  suggested_hook: string;
  main_theme: string;
  tone: string;
  opening_style: string;
  sport_context: string;
  priority_tier: number;
  status: string;
}

interface Draft {
  id: string;
  title: string;
  push_text: string;
  headline: string;
  body: string;
  challenge: string;
  tags: string[];
  day_of_year: number | null;
  audio_script: string;
  audio_url: string | null;
  tts_audio_url: string | null;
  audio_generation_status: string;
  audio_error: string | null;
  status: string;
  created_at: string;
  source_topic_id: string | null;
}

interface GeneratedContent {
  title: string;
  pushText: string;
  headline: string;
  body: string;
  challenge: string;
  audioScript: string;
  tags: string[];
  keyTakeaway: string;
}

// Card Component
function Card({ children, className = '', variant = 'default' }: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated';
}) {
  const baseClasses = 'rounded-2xl transition-all duration-200';
  const variantClasses = {
    default: 'bg-[#0F1123]/80 border border-white/[0.08]',
    elevated: 'bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] shadow-xl',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

// Tab Button Component
function TabButton({ active, onClick, children, icon: Icon }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: typeof Calendar;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        active
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          : 'text-white/60 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    approved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pending_review: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    empty: 'bg-red-500/20 text-red-400 border-red-500/30',
    complete: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    generating: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border ${styles[status] || styles.draft}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

// Month names for calendar
const MONTHS = [
  { name: 'Jan', days: 31, startDay: 1 },
  { name: 'Feb', days: 28, startDay: 32 },
  { name: 'Mar', days: 31, startDay: 60 },
  { name: 'Apr', days: 30, startDay: 91 },
  { name: 'May', days: 31, startDay: 121 },
  { name: 'Jun', days: 30, startDay: 152 },
  { name: 'Jul', days: 31, startDay: 182 },
  { name: 'Aug', days: 31, startDay: 213 },
  { name: 'Sep', days: 30, startDay: 244 },
  { name: 'Oct', days: 31, startDay: 274 },
  { name: 'Nov', days: 30, startDay: 305 },
  { name: 'Dec', days: 31, startDay: 335 },
];

export default function DailyHitBuilderPage() {
  // State
  const [activeTab, setActiveTab] = useState<'calendar' | 'drafts' | 'create' | 'topics'>('calendar');
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState<Partial<GeneratedContent>>({});
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [sourceContent, setSourceContent] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetDayOfYear, setTargetDayOfYear] = useState<number | null>(null);

  // Fetch data
  const fetchCalendar = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/daily-hit?view=calendar');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCalendar(data.calendar || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch calendar');
    }
  }, []);

  const fetchDrafts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/daily-hit?view=drafts');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDrafts(data.drafts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch drafts');
    }
  }, []);

  const fetchTopics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/daily-hit?view=topics');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTopics(data.topics || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch topics');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCalendar(), fetchDrafts(), fetchTopics()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchCalendar, fetchDrafts, fetchTopics]);

  // Generate content from AI
  const generateContent = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/daily-hit/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: selectedTopic?.id,
          sourceContent: sourceContent || undefined,
          prompt: customPrompt || undefined,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setCreateForm(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save draft
  const saveDraft = async (status: 'draft' | 'pending_review' = 'draft') => {
    if (!createForm.title || !createForm.body) {
      setError('Title and body are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/daily-hit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: createForm.title,
          pushText: createForm.pushText,
          headline: createForm.headline,
          body: createForm.body,
          challenge: createForm.challenge,
          tags: createForm.tags,
          dayOfYear: targetDayOfYear,
          audioScript: createForm.audioScript,
          sourceTopicId: selectedTopic?.id,
          sourceContent: sourceContent || undefined,
          status,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Reset form and refresh drafts
      setCreateForm({});
      setSelectedTopic(null);
      setSourceContent('');
      setCustomPrompt('');
      setTargetDayOfYear(null);
      await fetchDrafts();
      await fetchCalendar();
      setActiveTab('drafts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate audio for draft
  const generateAudio = async (draft: Draft) => {
    setIsGeneratingAudio(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/daily-hit/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId: draft.id,
          script: draft.audio_script,
          title: draft.title,
          combineWithIntroOutro: true,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      await fetchDrafts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Publish draft
  const publishDraft = async (draft: Draft) => {
    if (!draft.audio_url) {
      setError('Generate audio before publishing');
      return;
    }

    try {
      const res = await fetch('/api/admin/daily-hit/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId: draft.id,
          dayOfYear: draft.day_of_year,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      await fetchDrafts();
      await fetchCalendar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish');
    }
  };

  // Delete draft
  const deleteDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;

    try {
      const res = await fetch(`/api/admin/daily-hit?id=${draftId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      await fetchDrafts();
      await fetchCalendar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete draft');
    }
  };

  // Play audio preview
  const playAudio = (url: string) => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
    const player = new Audio(url);
    player.onended = () => setIsPlaying(false);
    player.play();
    setAudioPlayer(player);
    setIsPlaying(true);
  };

  const stopAudio = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      setIsPlaying(false);
    }
  };

  // Get days for current month view
  const getMonthDays = (monthIndex: number) => {
    const month = MONTHS[monthIndex];
    return calendar.filter(
      (day) => day.day_of_year >= month.startDay && day.day_of_year < month.startDay + month.days
    );
  };

  // Get day number within month
  const getDayInMonth = (dayOfYear: number, monthIndex: number) => {
    return dayOfYear - MONTHS[monthIndex].startDay + 1;
  };

  // Render calendar view
  const renderCalendar = () => {
    const monthDays = getMonthDays(selectedMonth);

    return (
      <div className="space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-5 gap-4">
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-white/50">Total Days</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{stats.published}</p>
              <p className="text-xs text-white/50">Published</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.drafts}</p>
              <p className="text-xs text-white/50">Drafts</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{stats.pendingReview}</p>
              <p className="text-xs text-white/50">Pending</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{stats.empty}</p>
              <p className="text-xs text-white/50">Empty</p>
            </Card>
          </div>
        )}

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedMonth(Math.max(0, selectedMonth - 1))}
            className="p-2 rounded-lg hover:bg-white/10"
            disabled={selectedMonth === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">{MONTHS[selectedMonth].name}</h2>
          <button
            onClick={() => setSelectedMonth(Math.min(11, selectedMonth + 1))}
            className="p-2 rounded-lg hover:bg-white/10"
            disabled={selectedMonth === 11}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-white/40 text-sm py-2">
              {d}
            </div>
          ))}

          {/* Empty cells for day offset */}
          {Array.from({ length: new Date(2025, selectedMonth, 1).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {monthDays.map((day) => {
            const dayNum = getDayInMonth(day.day_of_year, selectedMonth);
            const statusColors: Record<string, string> = {
              published: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
              approved: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
              pending_review: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
              draft: 'bg-gray-500/20 border-gray-500/40 text-gray-400',
              empty: 'bg-red-500/10 border-red-500/20 text-red-400/50',
            };

            return (
              <button
                key={day.day_of_year}
                onClick={() => {
                  setSelectedDay(day);
                  if (day.slot_status === 'empty') {
                    setTargetDayOfYear(day.day_of_year);
                    setActiveTab('create');
                  }
                }}
                className={`p-2 rounded-lg border text-center transition-all hover:scale-105 ${
                  statusColors[day.slot_status]
                }`}
                title={day.content_title || day.draft_title || 'Empty'}
              >
                <span className="text-sm font-medium">{dayNum}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                Day {selectedDay.day_of_year} - {selectedDay.content_title || selectedDay.draft_title || 'Empty'}
              </h3>
              <StatusBadge status={selectedDay.slot_status} />
            </div>
            {selectedDay.slot_status === 'empty' ? (
              <button
                onClick={() => {
                  setTargetDayOfYear(selectedDay.day_of_year);
                  setActiveTab('create');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
              >
                <Plus className="w-4 h-4" />
                Create Content for Day {selectedDay.day_of_year}
              </button>
            ) : (
              <p className="text-white/60 text-sm">
                {selectedDay.content_title || selectedDay.draft_title}
              </p>
            )}
          </Card>
        )}
      </div>
    );
  };

  // Render drafts list
  const renderDrafts = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Content Drafts</h2>
        <button
          onClick={fetchDrafts}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {drafts.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60">No drafts yet</p>
          <button
            onClick={() => setActiveTab('create')}
            className="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
          >
            Create Your First Draft
          </button>
        </Card>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <Card key={draft.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{draft.title}</h3>
                    <StatusBadge status={draft.status} />
                    {draft.day_of_year && (
                      <span className="px-2 py-0.5 bg-white/10 rounded text-xs">
                        Day {draft.day_of_year}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/60 mb-2">{draft.push_text}</p>
                  <div className="flex items-center gap-2">
                    {draft.audio_url ? (
                      <button
                        onClick={() => isPlaying ? stopAudio() : playAudio(draft.audio_url!)}
                        className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs"
                      >
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {isPlaying ? 'Stop' : 'Play'}
                      </button>
                    ) : draft.audio_generation_status === 'generating' || draft.audio_generation_status === 'combining' ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Generating...
                      </span>
                    ) : draft.audio_generation_status === 'failed' ? (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                        Audio failed: {draft.audio_error}
                      </span>
                    ) : (
                      <button
                        onClick={() => generateAudio(draft)}
                        disabled={isGeneratingAudio || !draft.audio_script}
                        className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs disabled:opacity-50"
                      >
                        <Mic className="w-3 h-3" />
                        Generate Audio
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {draft.status !== 'published' && draft.audio_url && (
                    <button
                      onClick={() => publishDraft(draft)}
                      className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      title="Publish"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteDraft(draft.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Render create form
  const renderCreate = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Create Daily Hit</h2>
        {targetDayOfYear && (
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg">
            Target: Day {targetDayOfYear}
          </span>
        )}
      </div>

      {/* Generation Options */}
      <Card className="p-4">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          AI Content Generation
        </h3>

        <div className="space-y-4">
          {/* Topic Selection */}
          <div>
            <label className="block text-sm text-white/60 mb-2">From Topic Library</label>
            <select
              value={selectedTopic?.id || ''}
              onChange={(e) => {
                const topic = topics.find(t => t.id === e.target.value);
                setSelectedTopic(topic || null);
              }}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="">Select a topic...</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title} ({topic.category})
                </option>
              ))}
            </select>
          </div>

          {/* Source Content */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Or Paste Source Content</label>
            <textarea
              value={sourceContent}
              onChange={(e) => setSourceContent(e.target.value)}
              placeholder="Paste motivational content to transform into Mind & Muscle style..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white h-24 resize-none"
            />
          </div>

          {/* Custom Prompt */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Or Custom Prompt</label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe the content you want to create..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>

          <button
            onClick={generateContent}
            disabled={isGenerating || (!selectedTopic && !sourceContent && !customPrompt)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Content
              </>
            )}
          </button>
        </div>
      </Card>

      {/* Content Editor */}
      {createForm.title && (
        <Card className="p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-400" />
            Edit Content
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Title</label>
              <input
                type="text"
                value={createForm.title || ''}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Push Text</label>
              <input
                type="text"
                value={createForm.pushText || ''}
                onChange={(e) => setCreateForm({ ...createForm, pushText: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Body (with emojis)</label>
              <textarea
                value={createForm.body || ''}
                onChange={(e) => setCreateForm({ ...createForm, body: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white h-48 resize-none font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Challenge</label>
              <input
                type="text"
                value={createForm.challenge || ''}
                onChange={(e) => setCreateForm({ ...createForm, challenge: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Audio Script (for TTS - no intro/outro)</label>
              <textarea
                value={createForm.audioScript || ''}
                onChange={(e) => setCreateForm({ ...createForm, audioScript: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white h-32 resize-none"
              />
              <p className="text-xs text-white/40 mt-1">
                {(createForm.audioScript || '').split(/\s+/).filter(Boolean).length} words (~
                {Math.round((createForm.audioScript || '').split(/\s+/).filter(Boolean).length / 2.5)} seconds)
              </p>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Target Day of Year</label>
              <input
                type="number"
                min="1"
                max="365"
                value={targetDayOfYear || ''}
                onChange={(e) => setTargetDayOfYear(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="1-365"
                className="w-32 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => saveDraft('draft')}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                Save as Draft
              </button>
              <button
                onClick={() => saveDraft('pending_review')}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                Submit for Review
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  // Render topics browser
  const renderTopics = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Topic Library</h2>
        <button
          onClick={fetchTopics}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid gap-3">
        {topics.map((topic) => (
          <Card key={topic.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{topic.title}</h3>
                  <span className="px-2 py-0.5 bg-white/10 rounded text-xs">{topic.category}</span>
                </div>
                <p className="text-sm text-white/60 italic">"{topic.suggested_hook}"</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                  <span>Theme: {topic.main_theme}</span>
                  {topic.tone && <span>Tone: {topic.tone}</span>}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedTopic(topic);
                  setActiveTab('create');
                }}
                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30"
              >
                Use Topic
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <AdminGate title="Daily Hit Builder" description="Create and manage Daily Hit content">
      <div className="min-h-screen bg-[#0A0B14] text-white">
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-orange-900/5 pointer-events-none" />

        <div className="relative z-10 py-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-white/10">
                  <Mic className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Daily Hit Builder</h1>
                  <p className="text-white/50 text-sm">Create, manage, and publish Daily Hit content</p>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                  <button onClick={() => setError(null)} className="ml-auto">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <TabButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={Calendar}>
                  Calendar
                </TabButton>
                <TabButton active={activeTab === 'drafts'} onClick={() => setActiveTab('drafts')} icon={FileText}>
                  Drafts ({drafts.length})
                </TabButton>
                <TabButton active={activeTab === 'create'} onClick={() => setActiveTab('create')} icon={Plus}>
                  Create
                </TabButton>
                <TabButton active={activeTab === 'topics'} onClick={() => setActiveTab('topics')} icon={Sparkles}>
                  Topics ({topics.length})
                </TabButton>
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              </div>
            ) : (
              <>
                {activeTab === 'calendar' && renderCalendar()}
                {activeTab === 'drafts' && renderDrafts()}
                {activeTab === 'create' && renderCreate()}
                {activeTab === 'topics' && renderTopics()}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
