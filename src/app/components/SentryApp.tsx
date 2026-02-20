import { useState, useMemo } from 'react';
import {
  AlertTriangle, CheckCircle2, Clock, XCircle,
  ChevronDown, ChevronRight, Search, ExternalLink,
  TrendingUp, TrendingDown, Users, Eye,
  BarChart3, Activity, Layers, ArrowUp,
  Filter, MoreHorizontal, User, GitBranch,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { cn } from "@/lib/utils";

// ─── Types ───

interface SentryIssue {
  id: string;
  title: string;
  culprit: string;
  level: 'fatal' | 'error' | 'warning' | 'info';
  events: number;
  users: number;
  firstSeen: string;
  lastSeen: string;
  status: 'unresolved' | 'resolved' | 'ignored';
  assignee: string | null;
  trend: number[];
  isNew: boolean;
  isRegression: boolean;
  release?: string;
}

// ─── Mock Data ───

const sentryIssues: SentryIssue[] = [
  {
    id: 'SENTRY-1842', title: 'TypeError: Cannot read property "id" of undefined',
    culprit: 'api/users.ts in getUserById at line 142',
    level: 'error', events: 847, users: 23, firstSeen: '2 hrs ago', lastSeen: '5 min ago',
    status: 'unresolved', assignee: 'BJ', trend: [2, 5, 3, 12, 45, 120, 340, 180, 90, 50, 30, 15],
    isNew: false, isRegression: true, release: 'v2.13.1',
  },
  {
    id: 'SENTRY-1841', title: 'TimeoutError: Request to payment gateway timed out',
    culprit: 'services/payment.ts in processPayment at line 89',
    level: 'fatal', events: 23, users: 18, firstSeen: '45 min ago', lastSeen: '12 min ago',
    status: 'unresolved', assignee: 'CB', trend: [0, 0, 0, 0, 1, 3, 5, 8, 4, 2, 0, 1],
    isNew: true, isRegression: false, release: 'v2.13.1',
  },
  {
    id: 'SENTRY-1839', title: 'ReferenceError: regeneratorRuntime is not defined',
    culprit: 'components/Dashboard.tsx in useEffect at line 34',
    level: 'error', events: 156, users: 12, firstSeen: '1 day ago', lastSeen: '3 hrs ago',
    status: 'unresolved', assignee: null, trend: [20, 30, 25, 40, 35, 20, 15, 10, 8, 5, 3, 2],
    isNew: false, isRegression: false,
  },
  {
    id: 'SENTRY-1836', title: 'NetworkError: Failed to fetch — CORS preflight',
    culprit: 'utils/api.ts in fetchWithRetry at line 22',
    level: 'warning', events: 89, users: 7, firstSeen: '3 days ago', lastSeen: '6 hrs ago',
    status: 'resolved', assignee: 'AW', trend: [50, 45, 30, 20, 15, 10, 5, 2, 0, 0, 0, 0],
    isNew: false, isRegression: false,
  },
  {
    id: 'SENTRY-1833', title: 'SyntaxError: Unexpected token in JSON at position 0',
    culprit: 'services/config.ts in parseConfig at line 56',
    level: 'error', events: 34, users: 4, firstSeen: '5 days ago', lastSeen: '1 day ago',
    status: 'ignored', assignee: 'BJ', trend: [10, 8, 6, 4, 3, 2, 1, 1, 0, 0, 1, 0],
    isNew: false, isRegression: false,
  },
];

const errorTrendData = [
  { time: '00:00', errors: 12, warnings: 5 },
  { time: '02:00', errors: 8, warnings: 3 },
  { time: '04:00', errors: 5, warnings: 2 },
  { time: '06:00', errors: 3, warnings: 1 },
  { time: '08:00', errors: 15, warnings: 8 },
  { time: '10:00', errors: 45, warnings: 12 },
  { time: '12:00', errors: 120, warnings: 25 },
  { time: '14:00', errors: 340, warnings: 30 },
  { time: '15:00', errors: 180, warnings: 18 },
  { time: '16:00', errors: 90, warnings: 10 },
  { time: '17:00', errors: 50, warnings: 7 },
  { time: '18:00', errors: 35, warnings: 4 },
];

const transactionData = [
  { name: '/api/users', p50: 45, p95: 180, p99: 420, throughput: 1240, errorRate: 2.3 },
  { name: '/api/checkout', p50: 120, p95: 890, p99: 1240, throughput: 340, errorRate: 4.1 },
  { name: '/api/products', p50: 32, p95: 95, p99: 210, throughput: 2100, errorRate: 0.2 },
  { name: '/api/auth/login', p50: 85, p95: 240, p99: 560, throughput: 890, errorRate: 1.1 },
  { name: '/api/webhooks', p50: 15, p95: 45, p99: 120, throughput: 450, errorRate: 0.5 },
];

const releases = [
  { version: 'v2.13.1', date: '2 hrs ago', commits: 3, newIssues: 1, resolved: 0, authors: ['BJ'] },
  { version: 'v2.13.0', date: '1 day ago', commits: 18, newIssues: 2, resolved: 5, authors: ['BJ', 'CB', 'AW'] },
  { version: 'v2.12.4', date: '4 days ago', commits: 7, newIssues: 0, resolved: 3, authors: ['CB'] },
];

// ─── Helpers ───

function LevelBadge({ level }: { level: SentryIssue['level'] }) {
  const map: Record<string, string> = {
    fatal: 'bg-[#FA4453] text-white',
    error: 'bg-[#FA4453]/10 text-[#FA4453] border border-[#FA4453]/20',
    warning: 'bg-[#F5B000]/10 text-[#D4890C] border border-[#F5B000]/20',
    info: 'bg-[#6C5FC7]/10 text-[#6C5FC7] border border-[#6C5FC7]/20',
  };
  return (
    <span className={cn('text-[8px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider', map[level])}>
      {level}
    </span>
  );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <svg width="60" height="20" className="shrink-0">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={data.map((v, i) => `${(i / (data.length - 1)) * 58 + 1},${18 - (v / max) * 16 + 1}`).join(' ')}
      />
    </svg>
  );
}

// ─── Tabs ───

type TabId = 'issues' | 'performance' | 'releases';

// ─── Main Component ───

export function SentryApp() {
  const [activeTab, setActiveTab] = useState<TabId>('issues');
  const [issueFilter, setIssueFilter] = useState<'unresolved' | 'all' | 'resolved' | 'ignored'>('unresolved');
  const [expandedIssue, setExpandedIssue] = useState<string | null>('SENTRY-1842');

  const filteredIssues = useMemo(() => {
    if (issueFilter === 'all') return sentryIssues;
    return sentryIssues.filter(i => i.status === issueFilter);
  }, [issueFilter]);

  return (
    <div className="space-y-4">
      {/* Project Header */}
      <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#362D59] to-[#6C5FC7] flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 72 66" fill="none">
                <path d="M29 2.26a3.68 3.68 0 0 0-6.38 0L1.05 41.06A3.68 3.68 0 0 0 4.24 46.5h11.1a3.68 3.68 0 0 0 3.19-1.85l14-24.27a8.67 8.67 0 0 1 7.5-4.33 8.67 8.67 0 0 1 7.5 4.33l14 24.27a3.68 3.68 0 0 0 3.19 1.85h11.1a3.68 3.68 0 0 0 3.19-5.43L58.38 2.26a3.68 3.68 0 0 0-6.38 0L36 30.06 29 2.26z" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#1D1127] dark:text-[#f0f0f0]">main-app</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FAD4D6] dark:bg-[#FA4453]/15 text-[#BF2A2F] font-bold">3 unresolved</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#80708F] dark:text-[#8a8a8a]">
                <span className="flex items-center gap-1"><Activity size={9} /> 1,149 events/hr</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Users size={9} /> 64 users affected</span>
                <span>·</span>
                <span className="flex items-center gap-1"><GitBranch size={9} /> v2.13.1</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-2.5 py-1.5 rounded-md bg-[#f0f0f0] dark:bg-[#333] text-[11px] text-[#1D1127] dark:text-[#e0e0e0] border-none outline-none font-medium">
              <option>Last 24 hours</option>
              <option>Last 48 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#6C5FC7] hover:bg-[#5B4FBA] text-white text-xs font-medium transition-colors">
              <ExternalLink size={12} />
              Open in Sentry
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-[#f0f0f0] dark:border-[#333] px-5 flex items-center gap-1">
          {([
            { id: 'issues' as TabId, label: 'Issues', count: sentryIssues.filter(i => i.status === 'unresolved').length },
            { id: 'performance' as TabId, label: 'Performance' },
            { id: 'releases' as TabId, label: 'Releases' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 text-[12px] font-medium border-b-2 -mb-px transition-all',
                activeTab === tab.id
                  ? 'border-[#6C5FC7] text-[#6C5FC7]'
                  : 'border-transparent text-[#80708F] dark:text-[#8a8a8a] hover:text-[#1D1127] dark:hover:text-[#e0e0e0]',
              )}
            >
              {tab.label}
              {'count' in tab && tab.count !== undefined && (
                <span className={cn(
                  'text-[9px] px-1.5 rounded-full font-bold',
                  activeTab === tab.id ? 'bg-[#6C5FC7]/10 text-[#6C5FC7]' : 'bg-[#f0f0f0] dark:bg-[#333] text-[#80708F]',
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'issues' && (
            <div className="space-y-3">
              {/* Error trend chart */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-[#1D1127] dark:text-[#e0e0e0]">Error Trend — Last 24h</span>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FA4453]" /> Errors</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F5B000]" /> Warnings</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={errorTrendData}>
                    <defs>
                      <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FA4453" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#FA4453" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="warnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F5B000" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#F5B000" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#80708F' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#80708F' }} axisLine={false} tickLine={false} width={30} />
                    <RTooltip
                      contentStyle={{ fontSize: 10, borderRadius: 8, border: '1px solid #e5e5e5' }}
                    />
                    <Area type="monotone" dataKey="errors" stroke="#FA4453" fill="url(#errGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="warnings" stroke="#F5B000" fill="url(#warnGrad)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                {(['unresolved', 'all', 'resolved', 'ignored'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setIssueFilter(f)}
                    className={cn(
                      'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors capitalize',
                      issueFilter === f
                        ? 'bg-[#6C5FC7]/10 text-[#6C5FC7] border border-[#6C5FC7]/20'
                        : 'text-[#80708F] hover:bg-[#f5f5f5] dark:hover:bg-[#333]',
                    )}
                  >
                    {f}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-[#252525] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d]">
                  <Search size={12} className="text-[#80708F]" />
                  <input placeholder="Search issues..." className="bg-transparent text-xs text-[#1D1127] dark:text-[#e0e0e0] placeholder-[#B9A6C9] outline-none w-36" />
                </div>
              </div>

              {/* Issue list */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden divide-y divide-[#f0f0f0] dark:divide-[#333]">
                {filteredIssues.map(issue => (
                  <div key={issue.id}>
                    <button
                      onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                      className="w-full text-left px-4 py-3 hover:bg-[#FAF9FB] dark:hover:bg-[#2a2a2a] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 shrink-0">
                          <LevelBadge level={issue.level} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-medium text-[#1D1127] dark:text-[#f0f0f0] truncate">{issue.title}</span>
                            {issue.isNew && (
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#6C5FC7] text-white uppercase">New</span>
                            )}
                            {issue.isRegression && (
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#FA4453]/10 text-[#FA4453] border border-[#FA4453]/20 uppercase">Regression</span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#80708F] dark:text-[#8a8a8a] mt-0.5 font-mono truncate">{issue.culprit}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <MiniSparkline data={issue.trend} color={issue.level === 'fatal' ? '#FA4453' : issue.level === 'warning' ? '#F5B000' : '#FA4453'} />
                          <div className="text-right">
                            <p className="text-[11px] font-bold text-[#1D1127] dark:text-[#e0e0e0]">{issue.events.toLocaleString()}</p>
                            <p className="text-[9px] text-[#80708F]">events</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] font-bold text-[#1D1127] dark:text-[#e0e0e0]">{issue.users}</p>
                            <p className="text-[9px] text-[#80708F]">users</p>
                          </div>
                          {issue.assignee ? (
                            <div className="w-5 h-5 rounded-full bg-[#6C5FC7] flex items-center justify-center text-white text-[7px] font-bold">
                              {issue.assignee}
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-dashed border-[#D6C9E4] dark:border-[#3d3d3d]" />
                          )}
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedIssue === issue.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1 bg-[#FAF9FB] dark:bg-[#1e1f22] border-t border-[#f0f0f0] dark:border-[#333]">
                            {/* Stack trace */}
                            <div className="bg-[#1D1127] rounded-lg p-3 mb-3 font-mono text-[10px] leading-relaxed overflow-x-auto">
                              <div className="text-[#FA4453]">{issue.title}</div>
                              <div className="text-[#80708F] mt-1">
                                <div className="text-[#A89BB5]">  at {issue.culprit.split(' in ')[1]?.split(' at ')[0] || 'anonymous'} <span className="text-[#6C5FC7]">({issue.culprit.split(' in ')[0]})</span></div>
                                <div className="text-[#A89BB5]">  at processRequest <span className="text-[#6C5FC7]">(server/handler.ts:28)</span></div>
                                <div className="text-[#A89BB5]">  at Router.handle <span className="text-[#6C5FC7]">(router/index.ts:142)</span></div>
                              </div>
                            </div>

                            {/* Meta info */}
                            <div className="grid grid-cols-4 gap-3 mb-3">
                              {[
                                { label: 'First seen', value: issue.firstSeen },
                                { label: 'Last seen', value: issue.lastSeen },
                                { label: 'Release', value: issue.release || '—' },
                                { label: 'Status', value: issue.status },
                              ].map(m => (
                                <div key={m.label}>
                                  <p className="text-[9px] text-[#80708F] uppercase tracking-wider">{m.label}</p>
                                  <p className="text-[11px] text-[#1D1127] dark:text-[#e0e0e0] font-medium capitalize">{m.value}</p>
                                </div>
                              ))}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {issue.status === 'unresolved' && (
                                <>
                                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#6C5FC7] hover:bg-[#5B4FBA] text-white text-xs font-medium transition-colors">
                                    <CheckCircle2 size={12} />
                                    Resolve
                                  </button>
                                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#f0f0f0] dark:bg-[#333] text-[#1D1127] dark:text-[#e0e0e0] text-xs font-medium hover:bg-[#e5e5e5] dark:hover:bg-[#3d3d3d] transition-colors">
                                    <User size={12} />
                                    Assign
                                  </button>
                                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[#80708F] text-xs font-medium hover:bg-[#f0f0f0] dark:hover:bg-[#333] transition-colors">
                                    <XCircle size={12} />
                                    Ignore
                                  </button>
                                </>
                              )}
                              <button className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[#6C5FC7] text-xs font-medium hover:bg-[#6C5FC7]/10 transition-colors">
                                <ExternalLink size={12} />
                                View in Sentry
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-3">
              {/* Performance overview */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-[#1D1127] dark:text-[#e0e0e0]">Transaction Performance</span>
                  <div className="flex items-center gap-2 text-[10px] text-[#80708F]">
                    <span>Sorted by: P95 Latency</span>
                  </div>
                </div>
                <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
                  {/* Header */}
                  <div className="grid grid-cols-6 gap-2 px-4 py-2 bg-[#FAF9FB] dark:bg-[#1e1f22] text-[9px] font-bold text-[#80708F] uppercase tracking-wider">
                    <span className="col-span-2">Transaction</span>
                    <span className="text-right">P50</span>
                    <span className="text-right">P95</span>
                    <span className="text-right">Throughput</span>
                    <span className="text-right">Error Rate</span>
                  </div>
                  {transactionData.map(tx => (
                    <div key={tx.name} className="grid grid-cols-6 gap-2 px-4 py-2.5 hover:bg-[#FAF9FB] dark:hover:bg-[#2a2a2a] transition-colors items-center">
                      <span className="col-span-2 text-[11px] font-mono text-[#6C5FC7] truncate">{tx.name}</span>
                      <span className="text-[11px] text-[#1D1127] dark:text-[#e0e0e0] text-right font-mono">{tx.p50}ms</span>
                      <span className={cn(
                        'text-[11px] text-right font-mono font-medium',
                        tx.p95 > 500 ? 'text-[#FA4453]' : tx.p95 > 200 ? 'text-[#F5B000]' : 'text-[#1D1127] dark:text-[#e0e0e0]',
                      )}>
                        {tx.p95}ms
                      </span>
                      <span className="text-[11px] text-[#1D1127] dark:text-[#e0e0e0] text-right">{tx.throughput.toLocaleString()}/hr</span>
                      <span className={cn(
                        'text-[11px] text-right font-medium',
                        tx.errorRate > 3 ? 'text-[#FA4453]' : tx.errorRate > 1 ? 'text-[#F5B000]' : 'text-[#36B37E]',
                      )}>
                        {tx.errorRate}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apdex + vital chart */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-4">
                  <span className="text-[11px] font-semibold text-[#1D1127] dark:text-[#e0e0e0] block mb-3">Web Vitals</span>
                  <div className="space-y-2">
                    {[
                      { label: 'LCP', value: '1.8s', target: '< 2.5s', status: 'good' },
                      { label: 'FID', value: '45ms', target: '< 100ms', status: 'good' },
                      { label: 'CLS', value: '0.12', target: '< 0.1', status: 'needs-improvement' },
                      { label: 'TTFB', value: '320ms', target: '< 800ms', status: 'good' },
                    ].map(v => (
                      <div key={v.label} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#80708F] w-8">{v.label}</span>
                        <div className="flex-1 h-2 bg-[#f0f0f0] dark:bg-[#333] rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              v.status === 'good' ? 'bg-[#36B37E]' : 'bg-[#F5B000]',
                            )}
                            style={{ width: v.status === 'good' ? '75%' : '55%' }}
                          />
                        </div>
                        <span className="text-[10px] text-[#1D1127] dark:text-[#e0e0e0] font-mono w-12 text-right">{v.value}</span>
                        <span className={cn(
                          'text-[8px] font-bold px-1.5 py-0.5 rounded',
                          v.status === 'good'
                            ? 'bg-[#36B37E]/10 text-[#36B37E]'
                            : 'bg-[#F5B000]/10 text-[#D4890C]',
                        )}>
                          {v.status === 'good' ? 'GOOD' : 'MEH'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-4">
                  <span className="text-[11px] font-semibold text-[#1D1127] dark:text-[#e0e0e0] block mb-3">Throughput — Last 24h</span>
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={errorTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="time" tick={{ fontSize: 8, fill: '#80708F' }} axisLine={false} tickLine={false} />
                      <Bar dataKey="errors" fill="#6C5FC7" radius={[2, 2, 0, 0]} opacity={0.7} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'releases' && (
            <div className="space-y-3">
              {releases.map(rel => (
                <div key={rel.version} className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#6C5FC7]/10 flex items-center justify-center">
                        <Layers size={14} className="text-[#6C5FC7]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-[#1D1127] dark:text-[#e0e0e0] font-mono">{rel.version}</span>
                          {rel.newIssues > 0 && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#FA4453]/10 text-[#FA4453]">
                              {rel.newIssues} new issue{rel.newIssues > 1 ? 's' : ''}
                            </span>
                          )}
                          {rel.resolved > 0 && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#36B37E]/10 text-[#36B37E]">
                              {rel.resolved} resolved
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#80708F] mt-0.5 flex items-center gap-2">
                          <span>{rel.date}</span>
                          <span>·</span>
                          <span>{rel.commits} commits</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center -space-x-1">
                      {rel.authors.map((a, i) => (
                        <div key={i} className="w-5 h-5 rounded-full bg-[#6C5FC7] border border-white dark:border-[#252525] flex items-center justify-center text-white text-[7px] font-bold">
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Unresolved', value: String(sentryIssues.filter(i => i.status === 'unresolved').length), sub: '1 regression, 1 new' },
          { label: 'Events (24h)', value: '1,149', sub: '↑ 340% spike at 14:00' },
          { label: 'Crash Free', value: '99.2%', sub: 'Users — last 7 days' },
          { label: 'Apdex', value: '0.87', sub: 'Threshold: 300ms' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] px-4 py-3">
            <p className="text-[10px] text-[#80708F] dark:text-[#6d6f78] uppercase tracking-wider">{stat.label}</p>
            <p className="text-lg font-bold text-[#1D1127] dark:text-[#f0f0f0] mt-0.5">{stat.value}</p>
            <p className="text-[10px] text-[#B9A6C9] dark:text-[#5a5a5a]">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
