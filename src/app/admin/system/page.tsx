'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  Clock, Database, Zap, Flag, Webhook, Server,
  RefreshCw, Play, Pause, CheckCircle2, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, Search, Filter, Plus, Trash2, Edit2,
  Activity, HardDrive, Layers, ToggleLeft, ToggleRight, Eye, EyeOff,
  ArrowRight, AlertCircle, Timer, TrendingUp, Box, FileSearch, Shield
} from 'lucide-react';

type TabType = 'cron' | 'functions' | 'database' | 'queues' | 'flags' | 'webhooks' | 'errors' | 'log-audit';

interface CronJob {
  jobid: number;
  jobname: string;
  schedule: string;
  active: boolean;
  success_24h: number;
  failed_24h: number;
  last_run: string | null;
  last_status: string | null;
  last_message: string | null;
  avg_duration_ms: number | null;
}

interface EdgeFunction {
  function_name: string;
  total_calls: number;
  success_count: number;
  error_count: number;
  avg_duration_ms: number;
  last_invoked: string | null;
  last_status: string | null;
  last_error_message?: string;
  last_error_time?: string;
}

interface TableStat {
  table_name: string;
  row_count: number;
  dead_tuples: number;
  total_size: string;
  size_bytes: number;
  last_autovacuum: string | null;
}

interface QueueStats {
  queue_name: string;
  display_name: string;
  total_items: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  oldest_pending: string | null;
}

interface FeatureFlag {
  id: string;
  flag_key: string;
  flag_name: string;
  description: string | null;
  enabled: boolean;
  rollout_percentage: number;
  allowed_tiers: string[];
  updated_at: string;
}

interface WebhookStats {
  source: string;
  total: number;
  processed: number;
  failed: number;
  last_24h: number;
  avg_processing_time: number;
  last_received: string;
}

interface SystemError {
  id: string;
  error_type: string;
  source: string;
  error_message: string;
  error_details: any;
  severity: string;
  created_at: string;
  acknowledged_at: string | null;
}

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

export default function SystemDashboardPage() {
  const { isAuthenticated } = useAdminAuth();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'cron';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cron state
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [cronHistory, setCronHistory] = useState<any[]>([]);
  const [selectedCronJob, setSelectedCronJob] = useState<number | null>(null);

  // Edge functions state
  const [edgeFunctions, setEdgeFunctions] = useState<EdgeFunction[]>([]);
  const [functionStats, setFunctionStats] = useState({ totalFunctions: 0, activeFunctions: 0, erroringFunctions: 0 });

  // Database state
  const [dbStats, setDbStats] = useState<any>(null);

  // Queues state
  const [queues, setQueues] = useState<QueueStats[]>([]);

  // Feature flags state
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  // Webhooks state
  const [webhookStats, setWebhookStats] = useState<WebhookStats[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);

  // Errors state
  const [systemErrors, setSystemErrors] = useState<SystemError[]>([]);
  const [errorStats, setErrorStats] = useState({ total: 0, critical: 0, unacknowledged: 0 });

  // Log Audit state
  const [auditIssues, setAuditIssues] = useState<LogAuditIssue[]>([]);
  const [auditStats, setAuditStats] = useState<AuditStats | null>(null);
  const [auditRuns, setAuditRuns] = useState<AuditRun[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Sync with URL param changes
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'cron':
          await loadCronData();
          break;
        case 'functions':
          await loadFunctionData();
          break;
        case 'database':
          await loadDatabaseData();
          break;
        case 'queues':
          await loadQueueData();
          break;
        case 'flags':
          await loadFlagData();
          break;
        case 'webhooks':
          await loadWebhookData();
          break;
        case 'errors':
          await loadErrorData();
          break;
        case 'log-audit':
          await loadLogAuditData();
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  }

  async function loadCronData() {
    const [jobsRes, historyRes] = await Promise.all([
      fetch('/api/admin/system/cron-jobs'),
      fetch('/api/admin/system/cron-jobs/history?limit=50')
    ]);
    if (jobsRes.ok) setCronJobs(await jobsRes.json());
    if (historyRes.ok) setCronHistory(await historyRes.json());
  }

  async function loadFunctionData() {
    const res = await fetch('/api/admin/system/edge-functions');
    if (res.ok) {
      const data = await res.json();
      setEdgeFunctions(data.functions || []);
      setFunctionStats({
        totalFunctions: data.totalFunctions || 0,
        activeFunctions: data.activeFunctions || 0,
        erroringFunctions: data.erroringFunctions || 0
      });
    }
  }

  async function loadDatabaseData() {
    const res = await fetch('/api/admin/system/database');
    if (res.ok) setDbStats(await res.json());
  }

  async function loadQueueData() {
    const res = await fetch('/api/admin/system/queues');
    if (res.ok) setQueues(await res.json());
  }

  async function loadFlagData() {
    const res = await fetch('/api/admin/system/feature-flags');
    if (res.ok) setFlags(await res.json());
  }

  async function loadWebhookData() {
    const res = await fetch('/api/admin/system/webhooks');
    if (res.ok) {
      const data = await res.json();
      setWebhookStats(data.stats || []);
      setWebhookLogs(data.logs || []);
    }
  }

  async function loadErrorData() {
    const res = await fetch('/api/admin/system/errors?hours=24');
    if (res.ok) {
      const data = await res.json();
      setSystemErrors(data.errors || []);
      setErrorStats(data.stats || { total: 0, critical: 0, unacknowledged: 0 });
    }
  }

  async function loadLogAuditData() {
    const [issuesRes, statsRes, runsRes] = await Promise.all([
      fetch('/api/admin/log-audit/issues'),
      fetch('/api/admin/log-audit/stats'),
      fetch('/api/admin/log-audit/runs'),
    ]);
    if (issuesRes.ok) setAuditIssues(await issuesRes.json());
    if (statsRes.ok) setAuditStats(await statsRes.json());
    if (runsRes.ok) setAuditRuns(await runsRes.json());
  }

  async function acknowledgeErrors(errorIds: string[]) {
    const res = await fetch('/api/admin/system/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'acknowledge', errorIds })
    });
    if (res.ok) loadErrorData();
  }

  async function toggleCronJob(jobId: number) {
    const res = await fetch('/api/admin/system/cron-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', jobId })
    });
    if (res.ok) loadCronData();
  }

  async function toggleFlag(flag: FeatureFlag) {
    const res = await fetch('/api/admin/system/feature-flags', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: flag.id, enabled: !flag.enabled })
    });
    if (res.ok) loadFlagData();
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const TABS = [
    { id: 'cron' as TabType, label: 'Cron Jobs', icon: Clock, count: cronJobs.length },
    { id: 'functions' as TabType, label: 'Edge Functions', icon: Zap, count: functionStats.totalFunctions },
    { id: 'database' as TabType, label: 'Database', icon: Database },
    { id: 'queues' as TabType, label: 'Queues', icon: Layers, count: queues.reduce((a, q) => a + q.pending, 0) },
    { id: 'flags' as TabType, label: 'Feature Flags', icon: Flag, count: flags.filter(f => f.enabled).length },
    { id: 'webhooks' as TabType, label: 'Webhooks', icon: Webhook },
    { id: 'errors' as TabType, label: 'Error Log', icon: AlertCircle, count: errorStats.unacknowledged, alert: errorStats.critical > 0 },
    { id: 'log-audit' as TabType, label: 'Log Audit', icon: FileSearch, count: auditStats?.newIssues || 0, alert: (auditStats?.newIssues || 0) > 0 },
  ];

  if (!isAuthenticated) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">System Monitor</h1>
          <p className="text-white/60">Monitor infrastructure health and manage system settings</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  isActive ? 'bg-cyan-500/30' : 'bg-white/10'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-white/40 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'cron' && (
            <CronJobsTab
              jobs={cronJobs}
              history={cronHistory}
              onToggle={toggleCronJob}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          {activeTab === 'functions' && (
            <EdgeFunctionsTab
              functions={edgeFunctions}
              stats={functionStats}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          {activeTab === 'database' && (
            <DatabaseTab stats={dbStats} />
          )}
          {activeTab === 'queues' && (
            <QueuesTab queues={queues} onRefresh={loadQueueData} />
          )}
          {activeTab === 'flags' && (
            <FeatureFlagsTab
              flags={flags}
              onToggle={toggleFlag}
              onRefresh={loadFlagData}
            />
          )}
          {activeTab === 'webhooks' && (
            <WebhooksTab stats={webhookStats} logs={webhookLogs} />
          )}
          {activeTab === 'errors' && (
            <ErrorLogTab
              errors={systemErrors}
              stats={errorStats}
              onAcknowledge={acknowledgeErrors}
              onRefresh={loadErrorData}
            />
          )}
          {activeTab === 'log-audit' && (
            <LogAuditTab
              issues={auditIssues}
              stats={auditStats}
              onRefresh={loadLogAuditData}
            />
          )}
        </>
      )}
    </div>
  );
}

// ============ CRON JOBS TAB ============
function CronJobsTab({
  jobs,
  history,
  onToggle,
  searchQuery,
  setSearchQuery
}: {
  jobs: CronJob[];
  history: any[];
  onToggle: (id: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) {
  const [expandedJob, setExpandedJob] = useState<number | null>(null);
  const [showFailingOnly, setShowFailingOnly] = useState(false);

  const failingJobs = jobs.filter(j => j.failed_24h > 0);
  const activeJobs = jobs.filter(j => j.active);
  const recentFailures = history.filter(h => h.status === 'failed').slice(0, 10);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobname.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFailingFilter = !showFailingOnly || job.failed_24h > 0;
    return matchesSearch && matchesFailingFilter;
  });

  return (
    <div className="space-y-6">
      {/* Stats - Clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div onClick={() => setShowFailingOnly(false)} className="cursor-pointer">
          <StatCard label="Total Jobs" value={jobs.length} icon={Clock} />
        </div>
        <StatCard label="Active" value={activeJobs.length} icon={Play} color="green" />
        <div
          onClick={() => setShowFailingOnly(!showFailingOnly)}
          className={`cursor-pointer rounded-xl transition-all ${showFailingOnly ? 'ring-2 ring-red-500' : ''}`}
        >
          <StatCard label="Failing (24h) ←Click" value={failingJobs.length} icon={AlertTriangle} color={failingJobs.length > 0 ? 'red' : 'green'} />
        </div>
        <StatCard label="Runs (24h)" value={history.length} icon={Activity} />
      </div>

      {/* Filter indicator */}
      {showFailingOnly && (
        <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm">Showing only failing jobs</span>
          <button onClick={() => setShowFailingOnly(false)} className="ml-auto text-white/60 hover:text-white text-sm">
            Clear filter
          </button>
        </div>
      )}

      {/* Recent Failures Alert - Shows prominently if there are failures */}
      {recentFailures.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-red-400 font-semibold">Recent Failures ({recentFailures.length})</h3>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {recentFailures.map((failure, i) => (
              <div key={failure.runid || i} className="bg-black/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{failure.jobname}</span>
                  <span className="text-white/40 text-xs">
                    {new Date(failure.start_time).toLocaleString()}
                  </span>
                </div>
                {failure.return_message && (
                  <pre className="text-xs text-red-300/80 bg-black/30 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words font-mono max-h-24 overflow-y-auto">
                    {failure.return_message}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend for status colors */}
      <div className="flex flex-wrap gap-4 text-xs text-white/60 bg-white/5 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Running successfully</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Has failures in 24h</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span>Active but no runs yet in 24h</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-500" />
          <span>Disabled/Inactive</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Search cron jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40"
        />
      </div>

      {/* Jobs List */}
      <div className="space-y-2">
        {filteredJobs.map((job) => (
          <div
            key={job.jobid}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
          >
            <div
              className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => setExpandedJob(expandedJob === job.jobid ? null : job.jobid)}
            >
              <div className="flex items-center gap-4">
                {/* Status indicator */}
                <div className={`w-2 h-2 rounded-full ${
                  !job.active ? 'bg-gray-500' :
                  job.failed_24h > 0 ? 'bg-red-500' :
                  job.success_24h > 0 ? 'bg-green-500' :
                  'bg-yellow-500'
                }`} />

                {/* Name */}
                <span className="text-white font-medium flex-1">{job.jobname}</span>

                {/* Schedule */}
                <span className="text-white/40 text-sm font-mono">{job.schedule}</span>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-400">{job.success_24h} ✓</span>
                  <span className={job.failed_24h > 0 ? 'text-red-400' : 'text-white/40'}>
                    {job.failed_24h} ✗
                  </span>
                </div>

                {/* Toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggle(job.jobid); }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    job.active
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-white/10 text-white/40 hover:bg-white/20'
                  }`}
                >
                  {job.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>

                {/* Expand */}
                {expandedJob === job.jobid ? (
                  <ChevronUp className="w-4 h-4 text-white/40" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/40" />
                )}
              </div>
            </div>

            {expandedJob === job.jobid && (
              <div className="border-t border-white/10 p-4 bg-white/[0.02]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-white/40 mb-1">Last Run</p>
                    <p className="text-white">
                      {job.last_run ? new Date(job.last_run).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 mb-1">Last Status</p>
                    <p className={job.last_status === 'succeeded' ? 'text-green-400' : 'text-red-400'}>
                      {job.last_status || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 mb-1">Avg Duration</p>
                    <p className="text-white">
                      {job.avg_duration_ms ? `${Math.round(job.avg_duration_ms)}ms` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 mb-1">Job ID</p>
                    <p className="text-white font-mono">{job.jobid}</p>
                  </div>
                </div>
                {job.last_message && job.last_status === 'failed' && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm font-mono break-all">{job.last_message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent History */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Run History</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 sticky top-0">
                <tr>
                  <th className="text-left p-3 text-white/60">Job</th>
                  <th className="text-left p-3 text-white/60">Status</th>
                  <th className="text-left p-3 text-white/60">Time</th>
                  <th className="text-left p-3 text-white/60">Duration</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 30).map((run, i) => (
                  <tr key={run.runid || i} className="border-t border-white/5">
                    <td className="p-3 text-white">{run.jobname}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        run.status === 'succeeded'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="p-3 text-white/60">
                      {new Date(run.start_time).toLocaleString()}
                    </td>
                    <td className="p-3 text-white/60">
                      {run.duration_ms ? `${Math.round(run.duration_ms)}ms` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ EDGE FUNCTIONS TAB ============
function EdgeFunctionsTab({
  functions,
  stats,
  searchQuery,
  setSearchQuery
}: {
  functions: EdgeFunction[];
  stats: { totalFunctions: number; activeFunctions: number; erroringFunctions: number };
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) {
  const [expandedFunction, setExpandedFunction] = useState<string | null>(null);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);

  const filtered = functions.filter(f => {
    const matchesSearch = f.function_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesErrorFilter = !showErrorsOnly || f.error_count > 0;
    return matchesSearch && matchesErrorFilter;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Functions" value={stats.totalFunctions} icon={Zap} />
        <StatCard label="Active (24h)" value={stats.activeFunctions} icon={Activity} color="green" />
        <StatCard label="With Errors" value={stats.erroringFunctions} icon={AlertTriangle} color={stats.erroringFunctions > 0 ? 'red' : 'green'} />
        <StatCard label="Total Calls" value={functions.reduce((a, f) => a + f.total_calls, 0)} icon={TrendingUp} />
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search functions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40"
          />
        </div>
        <button
          onClick={() => setShowErrorsOnly(!showErrorsOnly)}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
            showErrorsOnly
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Errors Only
        </button>
      </div>

      {/* Functions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((fn) => (
          <div
            key={fn.function_name}
            className={`bg-white/5 border rounded-xl overflow-hidden transition-all ${
              fn.error_count > 0 ? 'border-red-500/30' : 'border-white/10'
            }`}
          >
            <div
              className={`p-4 ${fn.error_count > 0 ? 'cursor-pointer hover:bg-white/5' : ''}`}
              onClick={() => fn.error_count > 0 && setExpandedFunction(
                expandedFunction === fn.function_name ? null : fn.function_name
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-white font-medium text-sm truncate flex-1">{fn.function_name}</h4>
                <div className="flex items-center gap-2">
                  {fn.error_count > 0 && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded flex items-center gap-1">
                      {fn.error_count} errors
                      {expandedFunction === fn.function_name ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-white/40">Calls (24h)</p>
                  <p className="text-white font-medium">{fn.total_calls}</p>
                </div>
                <div>
                  <p className="text-white/40">Success Rate</p>
                  <p className={`font-medium ${
                    fn.total_calls === 0 ? 'text-white/40' :
                    fn.success_count / fn.total_calls > 0.95 ? 'text-green-400' :
                    fn.success_count / fn.total_calls > 0.8 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {fn.total_calls > 0 ? `${Math.round((fn.success_count / fn.total_calls) * 100)}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-white/40">Avg Duration</p>
                  <p className="text-white">{fn.avg_duration_ms ? `${Math.round(fn.avg_duration_ms)}ms` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-white/40">Last Run</p>
                  <p className="text-white/60 text-xs">
                    {fn.last_invoked ? new Date(fn.last_invoked).toLocaleTimeString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            {/* Error Details Panel */}
            {expandedFunction === fn.function_name && fn.last_error_message && (
              <div className="border-t border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-xs font-medium">Latest Error</span>
                  {fn.last_error_time && (
                    <span className="text-white/40 text-xs">
                      {new Date(fn.last_error_time).toLocaleString()}
                    </span>
                  )}
                </div>
                <pre className="text-xs text-red-300/80 bg-black/20 p-3 rounded-lg overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap break-words font-mono">
                  {fn.last_error_message}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ DATABASE TAB ============
function DatabaseTab({ stats }: { stats: any }) {
  if (!stats) return <div className="text-white/60">No data available</div>;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Database Size"
          value={stats.databaseSize?.database_size || '0'}
          icon={HardDrive}
        />
        <StatCard
          label="Active Connections"
          value={`${stats.connections?.active_connections || 0}/${stats.connections?.max_connections || 100}`}
          icon={Server}
          color={stats.connections?.active_connections > 80 ? 'red' : 'green'}
        />
        <StatCard
          label="Tables"
          value={stats.tables?.length || 0}
          icon={Database}
        />
        <StatCard
          label="Need Vacuum"
          value={stats.vacuumNeeded?.length || 0}
          icon={AlertTriangle}
          color={stats.vacuumNeeded?.length > 0 ? 'yellow' : 'green'}
        />
      </div>

      {/* Tables */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Largest Tables</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-3 text-white/60">Table</th>
                <th className="text-right p-3 text-white/60">Rows</th>
                <th className="text-right p-3 text-white/60">Size</th>
                <th className="text-right p-3 text-white/60">Dead Tuples</th>
                <th className="text-left p-3 text-white/60">Last Vacuum</th>
              </tr>
            </thead>
            <tbody>
              {stats.tables?.slice(0, 20).map((table: TableStat) => (
                <tr key={table.table_name} className="border-t border-white/5">
                  <td className="p-3 text-white font-mono text-xs">{table.table_name}</td>
                  <td className="p-3 text-right text-white">{table.row_count?.toLocaleString()}</td>
                  <td className="p-3 text-right text-white/60">{table.total_size}</td>
                  <td className="p-3 text-right">
                    <span className={table.dead_tuples > 1000 ? 'text-yellow-400' : 'text-white/60'}>
                      {table.dead_tuples?.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3 text-white/40 text-xs">
                    {table.last_autovacuum ? new Date(table.last_autovacuum).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Index Usage */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Most Used Indexes</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-3 text-white/60">Index</th>
                <th className="text-left p-3 text-white/60">Table</th>
                <th className="text-right p-3 text-white/60">Scans</th>
                <th className="text-right p-3 text-white/60">Size</th>
              </tr>
            </thead>
            <tbody>
              {stats.indexes?.slice(0, 15).map((idx: any) => (
                <tr key={idx.index_name} className="border-t border-white/5">
                  <td className="p-3 text-white font-mono text-xs">{idx.index_name}</td>
                  <td className="p-3 text-white/60">{idx.table_name}</td>
                  <td className="p-3 text-right text-white">{idx.scans?.toLocaleString()}</td>
                  <td className="p-3 text-right text-white/60">{idx.index_size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============ QUEUES TAB ============
function QueuesTab({ queues, onRefresh }: { queues: (QueueStats & { recentItems?: any[] })[]; onRefresh: () => void }) {
  const [expandedQueue, setExpandedQueue] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleQueueAction(queueName: string, action: string, itemIds?: string[]) {
    setActionLoading(`${queueName}-${action}`);
    try {
      const res = await fetch('/api/admin/system/queues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, queueName, itemIds })
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error('Queue action failed:', e);
    }
    setActionLoading(null);
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Pending"
          value={queues.reduce((a, q) => a + (q.pending || 0), 0)}
          icon={Timer}
          color="yellow"
        />
        <StatCard
          label="Processing"
          value={queues.reduce((a, q) => a + (q.processing || 0), 0)}
          icon={Activity}
          color="blue"
        />
        <StatCard
          label="Completed"
          value={queues.reduce((a, q) => a + (q.completed || 0), 0)}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label="Failed"
          value={queues.reduce((a, q) => a + (q.failed || 0), 0)}
          icon={XCircle}
          color={queues.reduce((a, q) => a + (q.failed || 0), 0) > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Queue Cards */}
      <div className="space-y-4">
        {queues.map((queue) => {
          const isExpanded = expandedQueue === queue.queue_name;
          const failedItems = queue.recentItems?.filter((item: any) => item.status === 'failed' || item.status === 'error') || [];

          return (
            <div
              key={queue.queue_name}
              className={`bg-white/5 border rounded-xl overflow-hidden ${
                (queue.failed || 0) > 0 ? 'border-red-500/30' : 'border-white/10'
              }`}
            >
              {/* Queue Header */}
              <div
                className="p-5 cursor-pointer hover:bg-white/5"
                onClick={() => setExpandedQueue(isExpanded ? null : queue.queue_name)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h4 className="text-white font-medium">{queue.display_name}</h4>
                    <span className="text-white/40 text-xs font-mono">{queue.queue_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(queue.failed || 0) > 0 && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                        {queue.failed} failed
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{queue.pending || 0}</p>
                    <p className="text-xs text-white/40">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{queue.processing || 0}</p>
                    <p className="text-xs text-white/40">Processing</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{queue.completed || 0}</p>
                    <p className="text-xs text-white/40">Done</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${(queue.failed || 0) > 0 ? 'text-red-400' : 'text-white/40'}`}>
                      {queue.failed || 0}
                    </p>
                    <p className="text-xs text-white/40">Failed</p>
                  </div>
                </div>

                {queue.oldest_pending && (
                  <p className="text-xs text-white/40 mt-3">
                    Oldest pending: {new Date(queue.oldest_pending).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Expanded Section */}
              {isExpanded && (
                <div className="border-t border-white/10 p-4 bg-white/[0.02]">
                  {/* Actions */}
                  <div className="flex gap-2 mb-4">
                    {(queue.failed || 0) > 0 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQueueAction(queue.queue_name, 'retry', failedItems.map((i: any) => i.id));
                          }}
                          disabled={actionLoading === `${queue.queue_name}-retry`}
                          className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 disabled:opacity-50"
                        >
                          {actionLoading === `${queue.queue_name}-retry` ? 'Retrying...' : 'Retry Failed'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQueueAction(queue.queue_name, 'clear_failed');
                          }}
                          disabled={actionLoading === `${queue.queue_name}-clear_failed`}
                          className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 disabled:opacity-50"
                        >
                          {actionLoading === `${queue.queue_name}-clear_failed` ? 'Clearing...' : 'Clear Failed'}
                        </button>
                      </>
                    )}
                    {(queue.completed || 0) > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQueueAction(queue.queue_name, 'clear_completed');
                        }}
                        disabled={actionLoading === `${queue.queue_name}-clear_completed`}
                        className="px-3 py-1.5 bg-white/10 text-white/60 rounded-lg text-sm hover:bg-white/20 disabled:opacity-50"
                      >
                        {actionLoading === `${queue.queue_name}-clear_completed` ? 'Clearing...' : 'Clear Old Completed'}
                      </button>
                    )}
                  </div>

                  {/* Recent Items */}
                  {queue.recentItems && queue.recentItems.length > 0 ? (
                    <div>
                      <h5 className="text-white/60 text-sm mb-2">Recent Items</h5>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {queue.recentItems.slice(0, 10).map((item: any, i: number) => (
                          <div key={item.id || i} className="bg-black/20 rounded-lg p-3 text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                item.status === 'completed' || item.status === 'done' ? 'bg-green-500/20 text-green-400' :
                                item.status === 'failed' || item.status === 'error' ? 'bg-red-500/20 text-red-400' :
                                item.status === 'processing' || item.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {item.status}
                              </span>
                              <span className="text-white/40 text-xs">
                                {new Date(item.created_at).toLocaleString()}
                              </span>
                            </div>
                            {item.error_message && (
                              <pre className="text-xs text-red-300/80 bg-black/30 p-2 rounded mt-2 overflow-x-auto whitespace-pre-wrap">
                                {item.error_message}
                              </pre>
                            )}
                            {item.generation_type && (
                              <p className="text-white/60 text-xs mt-1">Type: {item.generation_type}</p>
                            )}
                            {item.user_id && (
                              <p className="text-white/40 text-xs mt-1 font-mono">User: {item.user_id.slice(0, 8)}...</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/40 text-sm">No recent items</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ FEATURE FLAGS TAB ============
function FeatureFlagsTab({
  flags,
  onToggle,
  onRefresh
}: {
  flags: FeatureFlag[];
  onToggle: (flag: FeatureFlag) => void;
  onRefresh: () => void;
}) {
  const enabledCount = flags.filter(f => f.enabled).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Flags" value={flags.length} icon={Flag} />
        <StatCard label="Enabled" value={enabledCount} icon={ToggleRight} color="green" />
        <StatCard label="Disabled" value={flags.length - enabledCount} icon={ToggleLeft} color="gray" />
      </div>

      {/* Flags List */}
      <div className="space-y-3">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className={`bg-white/5 border rounded-xl p-4 flex items-center gap-4 ${
              flag.enabled ? 'border-green-500/30' : 'border-white/10'
            }`}
          >
            <button
              onClick={() => onToggle(flag)}
              className={`p-2 rounded-lg transition-colors ${
                flag.enabled
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-white/10 text-white/40 hover:bg-white/20'
              }`}
            >
              {flag.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-white font-medium">{flag.flag_name}</h4>
                <span className="text-white/40 text-xs font-mono">({flag.flag_key})</span>
              </div>
              {flag.description && (
                <p className="text-white/60 text-sm mt-1">{flag.description}</p>
              )}
            </div>

            <div className="text-right">
              <p className="text-white/40 text-xs">Rollout</p>
              <p className="text-white font-medium">{flag.rollout_percentage}%</p>
            </div>

            {flag.allowed_tiers && flag.allowed_tiers.length > 0 && (
              <div className="flex gap-1">
                {flag.allowed_tiers.map(tier => (
                  <span key={tier} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                    {tier}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 pt-4 border-t border-white/10">
        <button
          onClick={() => {
            // Enable all
            flags.forEach(f => !f.enabled && onToggle(f));
          }}
          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors"
        >
          Enable All
        </button>
        <button
          onClick={() => {
            // Maintenance mode
            const maintenanceFlag = flags.find(f => f.flag_key === 'maintenance_mode');
            if (maintenanceFlag) onToggle(maintenanceFlag);
          }}
          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
        >
          Toggle Maintenance Mode
        </button>
      </div>
    </div>
  );
}

// ============ WEBHOOKS TAB ============
function WebhooksTab({ stats, logs }: { stats: WebhookStats[]; logs: any[] }) {
  return (
    <div className="space-y-6">
      {/* Stats by Source */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.length > 0 ? stats.map((stat) => (
          <div
            key={stat.source}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium capitalize">{stat.source}</h4>
              <span className={`px-2 py-1 rounded text-xs ${
                stat.failed > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {stat.failed > 0 ? `${stat.failed} failed` : 'Healthy'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/40">Total</p>
                <p className="text-white font-medium">{stat.total}</p>
              </div>
              <div>
                <p className="text-white/40">Last 24h</p>
                <p className="text-white font-medium">{stat.last_24h}</p>
              </div>
              <div>
                <p className="text-white/40">Avg Time</p>
                <p className="text-white">{stat.avg_processing_time ? `${Math.round(stat.avg_processing_time)}ms` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-white/40">Last Received</p>
                <p className="text-white/60 text-xs">
                  {stat.last_received ? new Date(stat.last_received).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-8 text-white/40">
            <Webhook className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No webhook data yet</p>
            <p className="text-sm mt-2">Webhooks will be logged as they arrive</p>
          </div>
        )}
      </div>

      {/* Recent Logs */}
      {logs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Recent Webhook Events</h3>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 sticky top-0">
                  <tr>
                    <th className="text-left p-3 text-white/60">Source</th>
                    <th className="text-left p-3 text-white/60">Event</th>
                    <th className="text-left p-3 text-white/60">Status</th>
                    <th className="text-left p-3 text-white/60">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 30).map((log, i) => (
                    <tr key={log.id || i} className="border-t border-white/5">
                      <td className="p-3 text-white capitalize">{log.source}</td>
                      <td className="p-3 text-white/60">{log.event_type}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.status === 'processed'
                            ? 'bg-green-500/20 text-green-400'
                            : log.status === 'failed'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-white/40">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ ERROR LOG TAB ============
function ErrorLogTab({
  errors,
  stats,
  onAcknowledge,
  onRefresh
}: {
  errors: SystemError[];
  stats: { total: number; critical: number; unacknowledged: number };
  onAcknowledge: (ids: string[]) => void;
  onRefresh: () => void;
}) {
  const [selectedErrors, setSelectedErrors] = useState<string[]>([]);
  const [expandedError, setExpandedError] = useState<string | null>(null);

  const severityColors = {
    critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    error: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
    warning: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Errors (24h)" value={stats.total} icon={AlertCircle} />
        <StatCard label="Critical" value={stats.critical} icon={XCircle} color={stats.critical > 0 ? 'red' : 'green'} />
        <StatCard label="Unacknowledged" value={stats.unacknowledged} icon={AlertTriangle} color={stats.unacknowledged > 0 ? 'yellow' : 'green'} />
        <StatCard label="Acknowledged" value={stats.total - stats.unacknowledged} icon={CheckCircle2} color="green" />
      </div>

      {/* Bulk Actions */}
      {selectedErrors.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-xl">
          <span className="text-white/60 text-sm">{selectedErrors.length} selected</span>
          <button
            onClick={() => {
              onAcknowledge(selectedErrors);
              setSelectedErrors([]);
            }}
            className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30"
          >
            Acknowledge Selected
          </button>
          <button
            onClick={() => setSelectedErrors([])}
            className="px-3 py-1.5 bg-white/10 text-white/60 rounded-lg text-sm hover:bg-white/20"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Errors List */}
      {errors.length === 0 ? (
        <div className="text-center py-12 text-white/40">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No errors in the last 24 hours</p>
          <p className="text-sm mt-2">System is running smoothly!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {errors.map((error) => {
            const colors = severityColors[error.severity as keyof typeof severityColors] || severityColors.error;
            const isExpanded = expandedError === error.id;
            const isSelected = selectedErrors.includes(error.id);

            return (
              <div
                key={error.id}
                className={`bg-white/5 border rounded-xl overflow-hidden ${
                  error.acknowledged_at ? 'border-white/10 opacity-60' : colors.border
                }`}
              >
                <div
                  className="p-4 cursor-pointer hover:bg-white/5"
                  onClick={() => setExpandedError(isExpanded ? null : error.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        setSelectedErrors(prev =>
                          isSelected ? prev.filter(id => id !== error.id) : [...prev, error.id]
                        );
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs ${colors.bg} ${colors.text}`}>
                          {error.severity}
                        </span>
                        <span className="px-2 py-0.5 bg-white/10 text-white/60 rounded text-xs">
                          {error.error_type}
                        </span>
                        <span className="text-white font-medium text-sm">{error.source}</span>
                        {error.acknowledged_at && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                            Acknowledged
                          </span>
                        )}
                      </div>
                      <p className="text-white/80 text-sm truncate">{error.error_message}</p>
                      <p className="text-white/40 text-xs mt-1">
                        {new Date(error.created_at).toLocaleString()}
                      </p>
                    </div>

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
                    <div className="mb-3">
                      <p className="text-white/40 text-xs mb-1">Full Error Message</p>
                      <pre className="text-sm text-white/80 bg-black/20 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-words font-mono">
                        {error.error_message}
                      </pre>
                    </div>
                    {error.error_details && (
                      <div className="mb-3">
                        <p className="text-white/40 text-xs mb-1">Error Details</p>
                        <pre className="text-xs text-white/60 bg-black/20 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap break-words font-mono max-h-48 overflow-y-auto">
                          {JSON.stringify(error.error_details, null, 2)}
                        </pre>
                      </div>
                    )}
                    {!error.acknowledged_at && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAcknowledge([error.id]);
                        }}
                        className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30"
                      >
                        Acknowledge
                      </button>
                    )}
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

// ============ LOG AUDIT TAB ============
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

function LogAuditTab({
  issues,
  stats,
  onRefresh
}: {
  issues: LogAuditIssue[];
  stats: AuditStats | null;
  onRefresh: () => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [runningAudit, setRunningAudit] = useState(false);

  async function runAudit() {
    setRunningAudit(true);
    try {
      const res = await fetch('/api/admin/log-audit/run', { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        alert(`Audit complete: ${result.new_issues} new issues, ${result.recurring_issues} recurring`);
        onRefresh();
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
        onRefresh();
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
        onRefresh();
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
        onRefresh();
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

  return (
    <div className="space-y-6">
      {/* Header with Run Audit button */}
      <div className="flex items-center justify-between">
        <p className="text-white/60 text-sm">Track and resolve API errors by pattern</p>
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Issues" value={stats.totalIssues} icon={AlertCircle} />
          <StatCard label="New" value={stats.newIssues} icon={AlertTriangle} color={stats.newIssues > 0 ? 'red' : 'green'} />
          <StatCard label="Investigating" value={stats.investigatingIssues} icon={Eye} color="yellow" />
          <StatCard label="Resolved" value={stats.resolvedIssues} icon={CheckCircle2} color="green" />
          <StatCard label="Recurring" value={stats.recurringIssues} icon={RefreshCw} color={stats.recurringIssues > 0 ? 'yellow' : 'green'} />
          <StatCard label="Ignored" value={stats.ignoredIssues} icon={EyeOff} color="gray" />
        </div>
      )}

      {/* Last Audit Run */}
      {stats?.lastAuditRun && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
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
                {(stats.lastAuditRun.logs_scanned ?? 0).toLocaleString()} logs scanned
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
      <div className="flex flex-wrap items-center gap-4">
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
      {filteredIssues.length === 0 ? (
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
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
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

// ============ STAT CARD COMPONENT ============
function StatCard({
  label,
  value,
  icon: Icon,
  color = 'white'
}: {
  label: string;
  value: number | string;
  icon: typeof Clock;
  color?: 'white' | 'green' | 'red' | 'yellow' | 'blue' | 'gray';
}) {
  const colorClasses = {
    white: 'text-white',
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
    gray: 'text-gray-400',
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${colorClasses[color]}`} />
        <span className="text-white/40 text-xs">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
    </div>
  );
}
