'use client';

import { useEffect, useState } from 'react';
import AdminGate from '@/components/AdminGate';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Package, Sparkles, Check, Copy, Trash2, RefreshCw,
  Loader2, FileText, GitCommit, Calendar, CheckCircle,
  Clock, Edit2, X, ChevronDown, ChevronUp, Plus
} from 'lucide-react';

function Card({ children, className = '', variant = 'default' }: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
}) {
  const variantClasses = {
    default: 'bg-[#0F1123]/80 border border-white/[0.08]',
    elevated: 'bg-gradient-to-br from-[#0F1123] to-[#1B1F39] border border-white/[0.12] shadow-xl',
    bordered: 'bg-[#0A0B14]/60 border-2 border-white/[0.1]',
  };

  return (
    <div className={`rounded-xl ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface AppRelease {
  id: string;
  version: string;
  raw_notes: string;
  polished_notes: string | null;
  status: 'draft' | 'polished' | 'published';
  platform: 'ios' | 'android' | 'both';
  commit_count: number;
  tag_name: string | null;
  commit_sha: string | null;
  created_at: string;
  polished_at: string | null;
  published_at: string | null;
  created_by: string;
}

interface Stats {
  total: number;
  draft: number;
  polished: number;
  published: number;
}

const statusConfig = {
  draft: { color: 'yellow', label: 'Draft', icon: FileText },
  polished: { color: 'blue', label: 'Ready', icon: Sparkles },
  published: { color: 'green', label: 'Published', icon: CheckCircle },
};

export default function ReleasesPage() {
  const { getPassword } = useAdminAuth();
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchReleases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/releases', {
        headers: { 'X-Admin-Password': getPassword() },
      });
      const data = await res.json();

      if (data.success) {
        setReleases(data.releases);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch releases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    if (!newVersion.trim()) {
      alert('Version is required');
      return;
    }

    setCreating(true);
    try {
      // Create release - API will auto-fetch commits from GitHub
      const res = await fetch('/api/admin/releases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword(),
        },
        body: JSON.stringify({
          action: 'create',
          version: newVersion.replace(/^v/, ''),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewVersion('');
        fetchReleases();

        // Auto-polish the new release
        if (data.release?.id) {
          handlePolish(data.release.id);
        }
      } else {
        alert(data.error || 'Failed to create release');
      }
    } catch (error) {
      console.error('Failed to create:', error);
    } finally {
      setCreating(false);
    }
  };

  const handlePolish = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/releases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword(),
        },
        body: JSON.stringify({ action: 'polish', id }),
      });

      const data = await res.json();
      if (data.success) {
        fetchReleases();
      } else {
        alert(data.error || 'Failed to polish');
      }
    } catch (error) {
      console.error('Failed to polish:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveEdit = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/releases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword(),
        },
        body: JSON.stringify({ action: 'update', id, polished_notes: editingNotes }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        fetchReleases();
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/releases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword(),
        },
        body: JSON.stringify({ action: 'publish', id }),
      });

      const data = await res.json();
      if (data.success) {
        fetchReleases();
      }
    } catch (error) {
      console.error('Failed to publish:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this release?')) return;

    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/releases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword(),
        },
        body: JSON.stringify({ action: 'delete', id }),
      });

      const data = await res.json();
      if (data.success) {
        fetchReleases();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const startEdit = (release: AppRelease) => {
    setEditingId(release.id);
    setEditingNotes(release.polished_notes || release.raw_notes);
  };

  return (
    <AdminGate>
      <div className="min-h-screen bg-gradient-to-br from-[#0A0B14] via-[#0F1123] to-[#0A0B14] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 flex items-center justify-center">
                <Package className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Release Notes</h1>
                <p className="text-white/50 text-sm">Manage app store release notes</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                New Release
              </button>
              <button
                onClick={fetchReleases}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <Card className="p-4">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-white/50 text-sm">Total Releases</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-yellow-400">{stats.draft}</div>
                <div className="text-white/50 text-sm">Drafts</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-blue-400">{stats.polished}</div>
                <div className="text-white/50 text-sm">Ready to Publish</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-green-400">{stats.published}</div>
                <div className="text-white/50 text-sm">Published</div>
              </Card>
            </div>
          )}

          {/* Releases List */}
          <Card variant="elevated" className="overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              </div>
            ) : releases.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">No releases yet</p>
                <p className="text-white/30 text-sm">Push a version tag (e.g., v1.2.3) to create a release</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {releases.map((release) => {
                  const StatusIcon = statusConfig[release.status].icon;
                  const statusColor = statusConfig[release.status].color;
                  const isExpanded = expandedId === release.id;
                  const isEditing = editingId === release.id;

                  return (
                    <div key={release.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Version Badge */}
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-white">v{release.version}</span>
                          <span className="text-xs text-white/50">{release.commit_count} commits</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"
                              style={{
                                backgroundColor: `color-mix(in srgb, ${statusColor === 'yellow' ? '#eab308' : statusColor === 'blue' ? '#3b82f6' : '#22c55e'} 20%, transparent)`,
                                color: statusColor === 'yellow' ? '#eab308' : statusColor === 'blue' ? '#3b82f6' : '#22c55e'
                              }}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig[release.status].label}
                            </span>
                            {release.tag_name && (
                              <span className="px-2 py-0.5 rounded bg-white/10 text-white/60 text-xs flex items-center gap-1">
                                <GitCommit className="w-3 h-3" />
                                {release.tag_name}
                              </span>
                            )}
                          </div>

                          {/* Preview of notes */}
                          <p className="text-white/60 text-sm mb-2 line-clamp-2">
                            {release.polished_notes || release.raw_notes}
                          </p>

                          <div className="flex flex-wrap gap-3 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Created: {formatDate(release.created_at)}
                            </span>
                            {release.polished_at && (
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Polished: {formatDate(release.polished_at)}
                              </span>
                            )}
                            {release.published_at && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Published: {formatDate(release.published_at)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : release.id)}
                            className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                            title="Expand"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                          {release.status === 'draft' && (
                            <button
                              onClick={() => handlePolish(release.id)}
                              disabled={actionLoading === release.id}
                              className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                              title="Polish with AI"
                            >
                              {actionLoading === release.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {release.polished_notes && (
                            <button
                              onClick={() => handleCopy(release.polished_notes!, release.id)}
                              className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                              title="Copy to clipboard"
                            >
                              {copiedId === release.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          )}

                          {release.status !== 'published' && release.polished_notes && (
                            <button
                              onClick={() => handlePublish(release.id)}
                              disabled={actionLoading === release.id}
                              className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                              title="Mark as published"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(release.id)}
                            disabled={actionLoading === release.id}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                          {/* Raw Notes */}
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                              <GitCommit className="w-4 h-4" />
                              Raw Commits
                            </div>
                            <pre className="bg-white/5 rounded-lg p-4 text-sm text-white/60 whitespace-pre-wrap break-words max-h-[300px] overflow-y-auto">
                              {release.raw_notes}
                            </pre>
                          </div>

                          {/* Polished Notes */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-sm font-medium text-white/70">
                                <Sparkles className="w-4 h-4" />
                                Polished Notes
                              </div>
                              {!isEditing && (
                                <button
                                  onClick={() => startEdit(release)}
                                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  Edit
                                </button>
                              )}
                            </div>

                            {isEditing ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingNotes}
                                  onChange={(e) => setEditingNotes(e.target.value)}
                                  rows={12}
                                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none resize-y min-h-[200px]"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEdit(release.id)}
                                    disabled={actionLoading === release.id}
                                    className="px-3 py-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    {actionLoading === release.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : release.polished_notes ? (
                              <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                                <pre className="text-sm text-white/80 whitespace-pre-wrap break-words">{release.polished_notes}</pre>
                              </div>
                            ) : (
                              <div className="bg-white/5 rounded-lg p-4 text-center">
                                <p className="text-white/40 text-sm">Not polished yet</p>
                                <button
                                  onClick={() => handlePolish(release.id)}
                                  disabled={actionLoading === release.id}
                                  className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
                                >
                                  {actionLoading === release.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Sparkles className="w-4 h-4" />
                                  )}
                                  Polish with AI
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Copy for App Stores */}
                          {release.polished_notes && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCopy(release.polished_notes!, release.id + '-btn')}
                                className="flex-1 py-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 hover:from-emerald-500/30 hover:to-blue-500/30 border border-emerald-500/30 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                              >
                                {copiedId === release.id + '-btn' ? (
                                  <>
                                    <Check className="w-4 h-4 text-green-400" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    Copy for App Stores
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* How it works */}
          <Card className="mt-8 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              How It Works
            </h3>
            <div className="grid sm:grid-cols-4 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <div className="font-medium text-white/90">New Release</div>
                  <div className="text-white/50">Click button or push a git tag</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <div className="font-medium text-white/90">Enter Notes</div>
                  <div className="text-white/50">Paste your changes or commits</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <div className="font-medium text-white/90">AI Polish</div>
                  <div className="text-white/50">Claude transforms to user-friendly notes</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                <div>
                  <div className="font-medium text-white/90">Copy & Submit</div>
                  <div className="text-white/50">Paste into App Store Connect / Play Console</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Create Release Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <Card variant="elevated" className="w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-400" />
                    New Release
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Version Number
                    </label>
                    <input
                      type="text"
                      value={newVersion}
                      onChange={(e) => setNewVersion(e.target.value)}
                      placeholder="1.2.3"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none text-lg"
                    />
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <GitCommit className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-300 font-medium">Auto-fetches from GitHub</p>
                        <p className="text-xs text-white/50 mt-1">
                          Commits since last published release will be pulled automatically and polished by AI
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={creating || !newVersion.trim()}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Fetching & Polishing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Create Release
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminGate>
  );
}
