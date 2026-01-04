'use client';

import { useEffect, useState } from 'react';
import AdminGate from '@/components/AdminGate';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Video, CheckCircle2, XCircle, Trash2, Eye, RefreshCw,
  Filter, ChevronLeft, ChevronRight, Play, Clock, User,
  Shield, AlertTriangle, ExternalLink, Search
} from 'lucide-react';

interface Drill {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  skill_category: string;
  age_range: string;
  is_published: boolean;
  is_private: boolean;
  publish_requested: boolean;
  created_at: string;
  published_at: string | null;
  owner: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  } | null;
  instructor: {
    id: string;
    role: string;
    affiliation: string;
    facility_name: string | null;
  } | null;
}

interface Stats {
  total: number;
  published: number;
  pending: number;
  private: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FilterOptions {
  instructors: string[];
  categories: string[];
  ageRanges: string[];
}

type FilterType = 'all' | 'pending' | 'published' | 'private';

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#0F1123]/80 border border-white/[0.08] rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

function StatCard({ value, label, icon: Icon, color = 'white', active = false, onClick }: {
  value: number;
  label: string;
  icon: typeof Video;
  color?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const colorClasses: Record<string, string> = {
    white: 'text-white',
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all ${
        active
          ? 'bg-white/10 border-white/20'
          : 'bg-[#0F1123]/60 border-white/[0.08] hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
        <div className="text-left">
          <p className={`text-xl font-bold ${colorClasses[color]}`}>{value}</p>
          <p className="text-xs text-white/50">{label}</p>
        </div>
      </div>
    </button>
  );
}

function DrillCard({ drill, onAction, selected, onSelect }: {
  drill: Drill;
  onAction: (action: string, drillId: string) => void;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);

  const getStatusBadge = () => {
    if (drill.is_published) {
      return <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">Published</span>;
    }
    if (drill.publish_requested) {
      return <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full">Pending Review</span>;
    }
    return <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded-full">Private</span>;
  };

  const getAffiliationBadge = () => {
    if (!drill.instructor?.affiliation) return null;
    const colors: Record<string, string> = {
      facility: 'bg-blue-500/20 text-blue-400',
      verified: 'bg-emerald-500/20 text-emerald-400',
      independent: 'bg-gray-500/20 text-gray-400',
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] rounded ${colors[drill.instructor.affiliation] || colors.independent}`}>
        {drill.instructor.affiliation}
      </span>
    );
  };

  return (
    <>
      <Card className={`overflow-hidden transition-all ${selected ? 'ring-2 ring-cyan-500' : ''}`}>
        <div className="flex">
          {/* Checkbox */}
          <div className="p-4 flex items-start">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelect(drill.id)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500"
            />
          </div>

          {/* Thumbnail */}
          <div className="relative w-32 h-24 flex-shrink-0 bg-black/30 my-4">
            {drill.thumbnail_url ? (
              <img
                src={drill.thumbnail_url}
                alt={drill.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-orange-500/20 rounded-lg">
                <Video className="w-8 h-8 text-orange-500/60" />
              </div>
            )}
            <button
              onClick={() => setShowPreview(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg"
            >
              <Play className="w-8 h-8 text-white" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">{drill.title}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {getStatusBadge()}
                  <span className="px-2 py-0.5 text-[10px] bg-white/10 text-white/60 rounded">
                    {drill.skill_category}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] bg-white/10 text-white/60 rounded">
                    {drill.age_range}
                  </span>
                </div>
              </div>
            </div>

            {/* Owner info */}
            {drill.owner && (
              <div className="flex items-center gap-2 mt-3">
                {drill.owner.avatar_url ? (
                  <img src={drill.owner.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <User className="w-3 h-3 text-orange-500" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/70">{drill.owner.name}</span>
                  {getAffiliationBadge()}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="flex items-center gap-4 mt-2 text-[11px] text-white/40">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(drill.created_at).toLocaleDateString()}
              </span>
              {drill.published_at && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Published {new Date(drill.published_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 flex flex-col gap-2 border-l border-white/5">
            {drill.publish_requested && !drill.is_published && (
              <>
                <button
                  onClick={() => onAction('approve', drill.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => onAction('reject', drill.id)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            {drill.is_published && (
              <button
                onClick={() => onAction('unpublish', drill.id)}
                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition text-sm"
              >
                <Shield className="w-4 h-4" />
                Unpublish
              </button>
            )}
            <button
              onClick={() => onAction('delete', drill.id)}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </Card>

      {/* Video Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">{drill.title}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-white/60 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <video
              src={drill.video_url}
              controls
              autoPlay
              className="w-full rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
}

function VaultModerationContent() {
  const { getPassword } = useAdminAuth();
  const [drills, setDrills] = useState<Drill[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, pending: 0, private: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ instructors: [], categories: [], ageRanges: [] });
  const [filter, setFilter] = useState<FilterType>('all');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [ageRangeFilter, setAgeRangeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDrills = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        filter,
        page: page.toString(),
        limit: '20',
      });
      if (instructorFilter) params.set('instructor', instructorFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      if (ageRangeFilter) params.set('ageRange', ageRangeFilter);

      const response = await fetch(`/api/admin/vault?${params.toString()}`, {
        headers: { 'X-Admin-Password': getPassword() },
      });
      const data = await response.json();

      if (data.error) {
        console.error('Error:', data.error);
        return;
      }

      setDrills(data.drills || []);
      setStats(data.stats);
      setPagination(data.pagination);
      if (data.filterOptions) {
        setFilterOptions(data.filterOptions);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, instructorFilter, categoryFilter, ageRangeFilter]);

  const handleAction = async (action: string, drillId?: string) => {
    const targetIds = drillId ? [drillId] : Array.from(selectedIds);

    if (targetIds.length === 0) return;

    // Confirm delete
    if (action === 'delete') {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${targetIds.length} drill(s)? This cannot be undone.`
      );
      if (!confirmed) return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/vault', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': getPassword(),
        },
        body: JSON.stringify({ action, drillIds: targetIds }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedIds(new Set());
        fetchDrills(pagination.page);
      } else {
        alert(`Action failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Action error:', error);
      alert('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === drills.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(drills.map(d => d.id)));
    }
  };

  const filteredDrills = drills.filter(d =>
    !searchQuery ||
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.owner?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">The Vault Moderation</h1>
          <p className="text-white/50 text-sm mt-1">Review and manage drill content</p>
        </div>
        <button
          onClick={() => fetchDrills()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white/70 rounded-xl hover:bg-white/10 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          value={stats.total}
          label="Total Drills"
          icon={Video}
          color="white"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <StatCard
          value={stats.pending}
          label="Pending Review"
          icon={AlertTriangle}
          color="orange"
          active={filter === 'pending'}
          onClick={() => setFilter('pending')}
        />
        <StatCard
          value={stats.published}
          label="Published"
          icon={CheckCircle2}
          color="green"
          active={filter === 'published'}
          onClick={() => setFilter('published')}
        />
        <StatCard
          value={stats.private}
          label="Private"
          icon={Shield}
          color="purple"
          active={filter === 'private'}
          onClick={() => setFilter('private')}
        />
      </div>

      {/* Toolbar */}
      <Card className="p-4 mb-4">
        <div className="flex flex-col gap-4">
          {/* Filter dropdowns */}
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4 text-white/40" />

            {/* Instructor filter */}
            <select
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/20 min-w-[160px]"
            >
              <option value="">All Instructors</option>
              {filterOptions.instructors.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/20 min-w-[140px]"
            >
              <option value="">All Categories</option>
              {filterOptions.categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>

            {/* Age range filter */}
            <select
              value={ageRangeFilter}
              onChange={(e) => setAgeRangeFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/20 min-w-[130px]"
            >
              <option value="">All Ages</option>
              {filterOptions.ageRanges.map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>

            {/* Clear filters button */}
            {(instructorFilter || categoryFilter || ageRangeFilter) && (
              <button
                onClick={() => {
                  setInstructorFilter('');
                  setCategoryFilter('');
                  setAgeRangeFilter('');
                }}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Search and actions row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search drills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 w-64"
                />
              </div>

              {/* Select all */}
              <button
                onClick={selectAll}
                className="text-sm text-white/60 hover:text-white transition"
              >
                {selectedIds.size === drills.length && drills.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Bulk actions */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/50">{selectedIds.size} selected</span>
                {filter === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition text-sm disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve All
                    </button>
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition text-sm disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject All
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleAction('delete')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Drills List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-white/40 animate-spin" />
        </div>
      ) : filteredDrills.length === 0 ? (
        <Card className="p-12 text-center">
          <Video className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">No drills found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDrills.map(drill => (
            <DrillCard
              key={drill.id}
              drill={drill}
              onAction={handleAction}
              selected={selectedIds.has(drill.id)}
              onSelect={toggleSelect}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => fetchDrills(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white/70 rounded-xl hover:bg-white/10 transition disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-white/50 text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchDrills(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages || loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white/70 rounded-xl hover:bg-white/10 transition disabled:opacity-50"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function VaultModerationPage() {
  return (
    <AdminGate>
      <VaultModerationContent />
    </AdminGate>
  );
}
