'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  AlertTriangle, CheckCircle2, Clock, RefreshCw, XCircle,
  Eye, EyeOff, Play, Filter, Search, ChevronDown, ChevronUp,
  AlertCircle, Activity, Server, Database, Zap, Shield
} from 'lucide-react';

interface LogAuditIssue {
  id: string;
  error_signature: string;
  path: string;
  method: string;
  status_code: number;
  error_pattern: string;
  service: string;
  first_seen_at: string;
  last_seen_at: string;
  occurrence_count: number;
  status: 'new' | 'investigating' | 'resolved' | 'ignored' | 'recurring';
  resolution_notes: string | null;
  resolved_at: string | null;
  alert_sent_at: string | null;
  suppress_alerts: boolean;
}

interface AuditRun {
  id: string;
  started_at: string;
  completed_at: string | null;
  logs_scanned: number;
  errors_found: number;
  new_issues: number;
  recurring_issues: number;
  services_checked: string[];
  audit_error: string | null;
}

interface AuditStats {
  totalIssues: number;
  newIssues: number;
  investigatingIssues: number;
  resolvedIssues: number;
  ignoredIssues: number;
  recurringIssues: number;
  lastAuditRun: AuditRun | null;
}

const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-red-500/20 text-red-400', icon: AlertTriangle },
  investigating: { label: 'Investigating', color: 'bg-yellow-500/20 text-yellow-400', icon: Eye },
  resolved: { label: 'Resolved', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
  ignored: { label: 'Ignored', color: 'bg-gray-500/20 text-gray-400', icon: EyeOff },
  recurring: { label: 'Recurring', color: 'bg-orange-500/20 text-orange-400', icon: RefreshCw },
};

const SERVICE_ICONS: Record<string, typeof Server> = {
  api: Server,
  'edge-function': Zap,
  auth: Shield,
  postgres: Database,
};

export default function LogAuditPage() {
  const { isAuthenticated } = useAdminAuth();
  const [issues, setIssues] = useState<LogAuditIssue[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [recentRuns, setRecentRuns] = useState<AuditRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningAudit, setRunningAudit] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  async function fetchData() {
    setLoading(true);
    try {
      const [issuesRes, statsRes, runsRes] = await Promise.all([
        fetch('/api/admin/log-audit/issues'),
        fetch('/api/admin/log-audit/stats'),
        fetch('/api/admin/log-audit/runs'),
      ]);

      if (issuesRes.ok) setIssues(await issuesRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
      if (runsRes.ok) setRecentRuns(await runsRes.json());
    } catch (error) {
      console.error('Error fetching log audit data:', error);
    }
    setLoading(false);
  }

  async function runAudit() {
    setRunningAudit(true);
    try {
      const res = await fetch('/api/admin/log-audit/run', { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        alert(`Audit complete: ${result.new_issues} new issues, ${result.recurring_issues} recurring`);
        fetchData();
      } else {
        alert('Audit failed');
      }
    } catch (error) {
      console.error('Audit error:', error);
      alert('Audit failed');
    }
    setRunningAudit(false);
  }

  async function updateIssueStatus(issueId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/log-audit/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setIssues(issues.map(i => i.id === issueId ? { ...i, status: newStatus as any } : i));
      }
    } catch (error) {
      console.error('Error updating issue:', error);
    }
  }

  async function updateIssueNotes(issueId: string, notes: string) {
    try {
      const res = await fetch(`/api/admin/log-audit/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution_notes: notes }),
      });
      if (res.ok) {
        setIssues(issues.map(i => i.id === issueId ? { ...i, resolution_notes: notes } : i));
        setEditingNotes(null);
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  }

  async function toggleSuppressAlerts(issueId: string, suppress: boolean) {
    try {
      const res = await fetch(`/api/admin/log-audit/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suppress_alerts: suppress }),
      });
      if (res.ok) {
        setIssues(issues.map(i => i.id === issueId ? { ...i, suppress_alerts: suppress } : i));
      }
    } catch (error) {
      console.error('Error toggling alerts:', error);
    }
  }

  const filteredIssues = issues.filter(issue => {
    if (selectedStatus !== 'all' && issue.status !== selectedStatus) return false;
    if (selectedService !== 'all' && issue.service !== selectedService) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        issue.path.toLowerCase().includes(query) ||
        issue.error_pattern?.toLowerCase().includes(query) ||
        issue.method.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const uniqueServices = [...new Set(issues.map(i => i.service))];

  if (!isAuthenticated) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Log Audit</h1>
          <p className="text-white/60">Monitor and resolve API errors automatically</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={runAudit}
            disabled={runningAudit}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl text-cyan-400 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {runningAudit ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Audit Now
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            label="Total Issues"
            value={stats.totalIssues}
            icon={AlertCircle}
            color="text-white"
          />
          <StatCard
            label="New"
            value={stats.newIssues}
            icon={AlertTriangle}
            color="text-red-400"
          />
          <StatCard
            label="Investigating"
            value={stats.investigatingIssues}
            icon={Eye}
            color="text-yellow-400"
          />
          <StatCard
            label="Resolved"
            value={stats.resolvedIssues}
            icon={CheckCircle2}
            color="text-green-400"
          />
          <StatCard
            label="Recurring"
            value={stats.recurringIssues}
            icon={RefreshCw}
            color="text-orange-400"
          />
          <StatCard
            label="Ignored"
            value={stats.ignoredIssues}
            icon={EyeOff}
            color="text-gray-400"
          />
        </div>
      )}

      {/* Last Audit Run */}
      {stats?.lastAuditRun && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span className="text-white/80">Last Audit Run</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-white/60">
                {new Date(stats.lastAuditRun.started_at).toLocaleString()}
              </span>
              <span className="text-white/40">|</span>
              <span className="text-white/60">
                {stats.lastAuditRun.logs_scanned.toLocaleString()} logs scanned
              </span>
              <span className="text-white/40">|</span>
              <span className="text-white/60">
                {stats.lastAuditRun.errors_found} errors found
              </span>
              {stats.lastAuditRun.new_issues > 0 && (
                <>
                  <span className="text-white/40">|</span>
                  <span className="text-red-400">
                    {stats.lastAuditRun.new_issues} new
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search paths, errors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 w-64"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
        >
          <option value="all">All Services</option>
          {uniqueServices.map(service => (
            <option key={service} value={service}>{service}</option>
          ))}
        </select>

        <span className="text-white/40 text-sm ml-auto">
          {filteredIssues.length} issues
        </span>
      </div>

      {/* Issues List */}
      {loading ? (
        <div className="text-center py-12 text-white/60">Loading...</div>
      ) : filteredIssues.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className="text-white/60">No issues found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIssues.map((issue) => {
            const StatusIcon = STATUS_CONFIG[issue.status].icon;
            const ServiceIcon = SERVICE_ICONS[issue.service] || Server;
            const isExpanded = expandedIssue === issue.id;

            return (
              <div
                key={issue.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                {/* Main Row */}
                <div
                  className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${STATUS_CONFIG[issue.status].color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {STATUS_CONFIG[issue.status].label}
                    </span>

                    {/* Status Code */}
                    <span className={`px-2 py-1 rounded text-xs font-mono ${
                      issue.status_code >= 500 ? 'bg-red-500/20 text-red-400' :
                      issue.status_code >= 400 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {issue.status_code}
                    </span>

                    {/* Method */}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      issue.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                      issue.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                      issue.method === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {issue.method}
                    </span>

                    {/* Path */}
                    <span className="text-white font-mono text-sm flex-1 truncate">
                      {issue.path}
                    </span>

                    {/* Service */}
                    <span className="flex items-center gap-1.5 text-white/40 text-xs">
                      <ServiceIcon className="w-3 h-3" />
                      {issue.service}
                    </span>

                    {/* Count */}
                    <span className="text-white/60 text-sm">
                      {issue.occurrence_count}x
                    </span>

                    {/* Last Seen */}
                    <span className="text-white/40 text-xs">
                      {new Date(issue.last_seen_at).toLocaleDateString()}
                    </span>

                    {/* Expand Icon */}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-white/10 p-4 bg-white/[0.02]">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Error Pattern */}
                      <div>
                        <p className="text-white/40 text-xs uppercase mb-2">Error Pattern</p>
                        <p className="text-white/80 text-sm font-mono bg-black/30 p-3 rounded-lg overflow-x-auto">
                          {issue.error_pattern || 'No pattern captured'}
                        </p>
                      </div>

                      {/* Timeline */}
                      <div>
                        <p className="text-white/40 text-xs uppercase mb-2">Timeline</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/60">First seen:</span>
                            <span className="text-white">{new Date(issue.first_seen_at).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Last seen:</span>
                            <span className="text-white">{new Date(issue.last_seen_at).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Total occurrences:</span>
                            <span className="text-white">{issue.occurrence_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-4">
                      <p className="text-white/40 text-xs uppercase mb-2">Resolution Notes</p>
                      {editingNotes === issue.id ? (
                        <div className="flex gap-2">
                          <textarea
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                            rows={3}
                            placeholder="Add notes about this issue..."
                          />
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => updateIssueNotes(issue.id, notesValue)}
                              className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNotes(null)}
                              className="px-3 py-1 bg-white/5 text-white/60 rounded-lg text-sm hover:bg-white/10"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNotes(issue.id);
                            setNotesValue(issue.resolution_notes || '');
                          }}
                          className="bg-black/30 p-3 rounded-lg text-sm text-white/60 cursor-pointer hover:bg-black/40"
                        >
                          {issue.resolution_notes || 'Click to add notes...'}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-white/40 text-xs">Change status:</span>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <button
                            key={key}
                            onClick={() => updateIssueStatus(issue.id, key)}
                            className={`px-3 py-1 rounded-full text-xs transition-colors ${
                              issue.status === key
                                ? config.color
                                : 'bg-white/5 text-white/40 hover:bg-white/10'
                            }`}
                          >
                            {config.label}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => toggleSuppressAlerts(issue.id, !issue.suppress_alerts)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-colors ${
                          issue.suppress_alerts
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-white/5 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {issue.suppress_alerts ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Alerts Suppressed
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            Suppress Alerts
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof AlertCircle;
  color: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-white/40 text-xs">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
