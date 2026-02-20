import { useState } from 'react';
import {
  GitMerge, GitPullRequest, AlertCircle, CheckCircle2, Clock,
  ChevronDown, ChevronRight, Search, Plus, ExternalLink,
  Play, XCircle, RotateCcw, Tag, Users,
  MessageSquare, Layers,
  Circle, ArrowRight, Timer, Zap, Copy,
  GitBranch, GitCommit,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from "@/lib/utils";

// ─── Types ───

interface MergeRequest {
  id: number;
  title: string;
  author: string;
  authorAvatar: string;
  branch: string;
  targetBranch: string;
  status: 'open' | 'merged' | 'closed';
  pipeline: 'passed' | 'failed' | 'running' | 'pending';
  reviewers: string[];
  approvals: number;
  approvalsRequired: number;
  comments: number;
  changes: { additions: number; deletions: number };
  labels: { name: string; color: string }[];
  updatedAgo: string;
  draft: boolean;
}

interface PipelineStage {
  name: string;
  status: 'success' | 'failed' | 'running' | 'pending' | 'skipped';
  duration?: string;
  jobs: { name: string; status: 'success' | 'failed' | 'running' | 'pending' | 'skipped'; duration?: string }[];
}

interface Issue {
  id: number;
  title: string;
  author: string;
  labels: { name: string; color: string }[];
  milestone: string;
  assignee: string;
  weight: number;
  updatedAgo: string;
  commentCount: number;
}

// ─── Mock Data ───

const mergeRequests: MergeRequest[] = [
  {
    id: 482, title: 'Add WebSocket reconnection logic', author: 'Bob Johnson', authorAvatar: 'BJ',
    branch: 'feat/websocket-reconnect', targetBranch: 'main', status: 'open', pipeline: 'passed',
    reviewers: ['CB', 'AW'], approvals: 1, approvalsRequired: 2, comments: 5,
    changes: { additions: 312, deletions: 45 },
    labels: [{ name: 'feature', color: '#428BCA' }, { name: 'backend', color: '#7F8C8D' }],
    updatedAgo: '12 min ago', draft: false,
  },
  {
    id: 479, title: 'Refactor payment service for idempotency', author: 'Charlie Brown', authorAvatar: 'CB',
    branch: 'refactor/payment-idempotency', targetBranch: 'main', status: 'open', pipeline: 'running',
    reviewers: ['BJ'], approvals: 0, approvalsRequired: 2, comments: 3,
    changes: { additions: 89, deletions: 234 },
    labels: [{ name: 'refactor', color: '#A8D695' }, { name: 'payments', color: '#D9534F' }],
    updatedAgo: '1 hr ago', draft: false,
  },
  {
    id: 475, title: 'Upgrade React Router to v7', author: 'Alice Williams', authorAvatar: 'AW',
    branch: 'chore/react-router-v7', targetBranch: 'main', status: 'open', pipeline: 'passed',
    reviewers: ['BJ', 'CB'], approvals: 2, approvalsRequired: 2, comments: 8,
    changes: { additions: 56, deletions: 78 },
    labels: [{ name: 'dependencies', color: '#0E8A16' }, { name: 'frontend', color: '#FBCA04' }],
    updatedAgo: '3 hrs ago', draft: false,
  },
  {
    id: 471, title: 'WIP: Add dark mode to settings page', author: 'Bob Johnson', authorAvatar: 'BJ',
    branch: 'feat/settings-dark-mode', targetBranch: 'develop', status: 'open', pipeline: 'failed',
    reviewers: [], approvals: 0, approvalsRequired: 2, comments: 1,
    changes: { additions: 142, deletions: 23 },
    labels: [{ name: 'feature', color: '#428BCA' }, { name: 'UI', color: '#E4E669' }],
    updatedAgo: 'Yesterday', draft: true,
  },
];

const pipelineStages: PipelineStage[] = [
  {
    name: 'build', status: 'success', duration: '1m 42s',
    jobs: [
      { name: 'compile', status: 'success', duration: '58s' },
      { name: 'docker-build', status: 'success', duration: '1m 42s' },
    ],
  },
  {
    name: 'test', status: 'success', duration: '4m 15s',
    jobs: [
      { name: 'unit-tests', status: 'success', duration: '2m 30s' },
      { name: 'integration-tests', status: 'success', duration: '4m 15s' },
      { name: 'lint', status: 'success', duration: '32s' },
    ],
  },
  {
    name: 'security', status: 'success', duration: '1m 08s',
    jobs: [
      { name: 'sast', status: 'success', duration: '45s' },
      { name: 'dependency-scan', status: 'success', duration: '1m 08s' },
    ],
  },
  {
    name: 'staging', status: 'running', duration: '2m 14s',
    jobs: [
      { name: 'deploy-staging', status: 'running', duration: '2m 14s' },
      { name: 'e2e-tests', status: 'pending' },
    ],
  },
  {
    name: 'production', status: 'pending',
    jobs: [
      { name: 'deploy-prod', status: 'pending' },
      { name: 'smoke-tests', status: 'pending' },
    ],
  },
];

const issues: Issue[] = [
  { id: 318, title: 'API returns 500 on malformed pagination token', author: 'Charlie Brown', labels: [{ name: 'bug', color: '#D9534F' }, { name: 'P1', color: '#E11D48' }], milestone: 'v2.14', assignee: 'BJ', weight: 3, updatedAgo: '45 min ago', commentCount: 4 },
  { id: 315, title: 'Add rate limiting headers to all API endpoints', author: 'Bob Johnson', labels: [{ name: 'feature', color: '#428BCA' }], milestone: 'v2.14', assignee: 'CB', weight: 5, updatedAgo: '2 hrs ago', commentCount: 2 },
  { id: 312, title: 'Optimize dashboard query performance', author: 'Alice Williams', labels: [{ name: 'performance', color: '#FFA500' }], milestone: 'v2.15', assignee: 'BJ', weight: 8, updatedAgo: '1 day ago', commentCount: 6 },
  { id: 310, title: 'Update onboarding flow copy', author: 'Jane Smith', labels: [{ name: 'UX', color: '#7F8C8D' }], milestone: 'v2.14', assignee: 'AW', weight: 2, updatedAgo: '2 days ago', commentCount: 1 },
];

// ─── Helpers ───

function PipelineIcon({ status, size = 14 }: { status: string; size?: number }) {
  switch (status) {
    case 'success': return <CheckCircle2 size={size} className="text-[#108548]" />;
    case 'failed': return <XCircle size={size} className="text-[#DD2B0E]" />;
    case 'running': return <Play size={size} className="text-[#1F75CB] animate-pulse" />;
    case 'pending': return <Clock size={size} className="text-[#8B8680]" />;
    case 'skipped': return <RotateCcw size={size} className="text-[#8B8680]" />;
    default: return <Circle size={size} className="text-[#8B8680]" />;
  }
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    success: 'bg-[#108548]/10 text-[#108548] border-[#108548]/20',
    passed: 'bg-[#108548]/10 text-[#108548] border-[#108548]/20',
    failed: 'bg-[#DD2B0E]/10 text-[#DD2B0E] border-[#DD2B0E]/20',
    running: 'bg-[#1F75CB]/10 text-[#1F75CB] border-[#1F75CB]/20',
    pending: 'bg-[#8B8680]/10 text-[#8B8680] border-[#8B8680]/20',
    open: 'bg-[#108548]/10 text-[#108548] border-[#108548]/20',
    merged: 'bg-[#1F75CB]/10 text-[#1F75CB] border-[#1F75CB]/20',
    closed: 'bg-[#DD2B0E]/10 text-[#DD2B0E] border-[#DD2B0E]/20',
  };
  return (
    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize', map[status] || map.pending)}>
      {status}
    </span>
  );
}

// ─── Sub-views ───

type TabId = 'merge_requests' | 'pipelines' | 'issues';

const navItems: { id: TabId; label: string; icon: typeof GitMerge; count?: number }[] = [
  { id: 'merge_requests', label: 'Merge requests', icon: GitMerge, count: mergeRequests.filter(m => m.status === 'open').length },
  { id: 'pipelines', label: 'CI/CD Pipelines', icon: Layers, count: undefined },
  { id: 'issues', label: 'Issues', icon: AlertCircle, count: issues.length },
];

// ─── Main Component ───

export function GitLabApp() {
  const [activeTab, setActiveTab] = useState<TabId>('merge_requests');
  const [expandedMR, setExpandedMR] = useState<number | null>(482);
  const [expandedStage, setExpandedStage] = useState<string | null>('test');

  return (
    <div className="space-y-4">
      {/* Project Header */}
      <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* GitLab tanuki icon */}
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FC6D26] to-[#E24329] flex items-center justify-center shadow-sm">
              <svg width="18" height="17" viewBox="0 0 380 360" fill="none">
                <path d="M190 350L280 110H100L190 350Z" fill="#E24329"/>
                <path d="M190 350L100 110H20L190 350Z" fill="#FC6D26"/>
                <path d="M20 110L2 165C0.5 169.5 2 174.5 6 177L190 350L20 110Z" fill="#FCA326"/>
                <path d="M20 110H100L65 2C63.5 -2.5 57 -2.5 55.5 2L20 110Z" fill="#E24329"/>
                <path d="M190 350L280 110H360L190 350Z" fill="#FC6D26"/>
                <path d="M360 110L378 165C379.5 169.5 378 174.5 374 177L190 350L360 110Z" fill="#FCA326"/>
                <path d="M360 110H280L315 2C316.5 -2.5 323 -2.5 324.5 2L360 110Z" fill="#E24329"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#8a8a8a]">company /</span>
                <span className="text-sm font-semibold text-[#242424] dark:text-[#f0f0f0]">main-app</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f0f0f0] dark:bg-[#333] text-[#616161] dark:text-[#8a8a8a] font-medium">Private</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#8a8a8a]">
                <span className="flex items-center gap-1"><GitBranch size={9} /> 24 branches</span>
                <span className="flex items-center gap-1"><Tag size={9} /> 18 tags</span>
                <span className="flex items-center gap-1"><GitCommit size={9} /> 1,247 commits</span>
                <span className="flex items-center gap-1"><Users size={9} /> 8 members</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#f0f0f0] dark:bg-[#333] hover:bg-[#e5e5e5] dark:hover:bg-[#3d3d3d] text-[#242424] dark:text-[#e0e0e0] text-xs font-medium transition-colors">
              <GitBranch size={12} />
              main
              <ChevronDown size={10} />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FC6D26] hover:bg-[#E24329] text-white text-xs font-medium transition-colors">
              <ExternalLink size={12} />
              Open in GitLab
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-[#f0f0f0] dark:border-[#333] px-5 flex items-center gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 text-[12px] font-medium border-b-2 -mb-px transition-all',
                activeTab === item.id
                  ? 'border-[#FC6D26] text-[#FC6D26] dark:text-[#FC6D26]'
                  : 'border-transparent text-[#616161] dark:text-[#8a8a8a] hover:text-[#242424] dark:hover:text-[#e0e0e0] hover:border-[#d1d1d1] dark:hover:border-[#3d3d3d]',
              )}
            >
              <item.icon size={14} />
              {item.label}
              {item.count !== undefined && (
                <span className={cn(
                  'text-[10px] px-1.5 py-0 rounded-full font-medium',
                  activeTab === item.id
                    ? 'bg-[#FC6D26]/10 text-[#FC6D26]'
                    : 'bg-[#f0f0f0] dark:bg-[#333] text-[#616161] dark:text-[#8a8a8a]',
                )}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'merge_requests' && (
            <div className="space-y-3">
              {/* MR Filters */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-[#252525] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d]">
                    <Search size={12} className="text-[#8a8a8a]" />
                    <input placeholder="Filter merge requests..." className="bg-transparent text-xs text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] outline-none w-48" />
                  </div>
                  <div className="flex items-center gap-1">
                    {['Open', 'Merged', 'All'].map((f, i) => (
                      <button
                        key={f}
                        className={cn(
                          'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors',
                          i === 0
                            ? 'bg-[#FC6D26]/10 text-[#FC6D26] border border-[#FC6D26]/20'
                            : 'text-[#616161] dark:text-[#8a8a8a] hover:bg-[#f5f5f5] dark:hover:bg-[#333]',
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#108548] hover:bg-[#0d6e3e] text-white text-xs font-medium transition-colors">
                  <Plus size={12} />
                  New merge request
                </button>
              </div>

              {/* MR List */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden divide-y divide-[#f0f0f0] dark:divide-[#333]">
                {mergeRequests.map(mr => (
                  <div key={mr.id}>
                    <button
                      onClick={() => setExpandedMR(expandedMR === mr.id ? null : mr.id)}
                      className="w-full text-left px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {/* Status icon */}
                        <div className="mt-0.5">
                          {mr.status === 'merged'
                            ? <GitMerge size={16} className="text-[#1F75CB]" />
                            : mr.status === 'closed'
                            ? <XCircle size={16} className="text-[#DD2B0E]" />
                            : <GitPullRequest size={16} className="text-[#108548]" />
                          }
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {mr.draft && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#8B8680]/10 text-[#8B8680] border border-[#8B8680]/20 font-medium">Draft</span>
                            )}
                            <span className="text-sm font-medium text-[#242424] dark:text-[#f0f0f0]">{mr.title}</span>
                            {mr.labels.map(label => (
                              <span
                                key={label.name}
                                className="text-[9px] px-1.5 py-0.5 rounded-full font-medium border"
                                style={{
                                  backgroundColor: `${label.color}15`,
                                  color: label.color,
                                  borderColor: `${label.color}30`,
                                }}
                              >
                                {label.name}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-[#8a8a8a]">
                            <span>!{mr.id}</span>
                            <span>· opened by {mr.author}</span>
                            <span>· updated {mr.updatedAgo}</span>
                          </div>
                        </div>

                        {/* Right: pipeline, approvals, comments */}
                        <div className="flex items-center gap-3 shrink-0">
                          <PipelineIcon status={mr.pipeline} size={14} />
                          <div className="flex items-center gap-1 text-[10px] text-[#8a8a8a]">
                            <CheckCircle2 size={10} className={mr.approvals >= mr.approvalsRequired ? 'text-[#108548]' : 'text-[#8B8680]'} />
                            {mr.approvals}/{mr.approvalsRequired}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-[#8a8a8a]">
                            <MessageSquare size={10} />
                            {mr.comments}
                          </div>
                          <div className="text-[10px] font-mono text-[#108548]">
                            +{mr.changes.additions}
                          </div>
                          <div className="text-[10px] font-mono text-[#DD2B0E]">
                            -{mr.changes.deletions}
                          </div>
                          {/* Reviewer avatars */}
                          <div className="flex -space-x-1">
                            {mr.reviewers.map((r, i) => (
                              <div
                                key={i}
                                className="w-5 h-5 rounded-full border border-white dark:border-[#252525] bg-[#FC6D26] flex items-center justify-center text-white text-[7px] font-bold"
                              >
                                {r}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded MR Detail */}
                    <AnimatePresence>
                      {expandedMR === mr.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1 bg-[#faf9f8] dark:bg-[#1e1f22] border-t border-[#f0f0f0] dark:border-[#333]">
                            {/* Branch info */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-[#eef2ff] dark:bg-[#1F75CB]/10 rounded text-[10px] font-mono text-[#1F75CB]">
                                <GitBranch size={10} />
                                {mr.branch}
                              </div>
                              <ArrowRight size={10} className="text-[#8a8a8a]" />
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-[#eef2ff] dark:bg-[#1F75CB]/10 rounded text-[10px] font-mono text-[#1F75CB]">
                                <GitBranch size={10} />
                                {mr.targetBranch}
                              </div>
                              <button className="p-1 rounded hover:bg-[#eee] dark:hover:bg-[#333] text-[#8a8a8a]">
                                <Copy size={10} />
                              </button>
                            </div>

                            {/* Pipeline mini-view */}
                            <div className="flex items-center gap-1 mb-3">
                              <span className="text-[10px] font-medium text-[#616161] dark:text-[#8a8a8a] mr-2">Pipeline:</span>
                              {pipelineStages.map((stage, i) => (
                                <div key={stage.name} className="flex items-center gap-1">
                                  <div className={cn(
                                    'w-6 h-6 rounded flex items-center justify-center',
                                    stage.status === 'success' && 'bg-[#108548]/10',
                                    stage.status === 'failed' && 'bg-[#DD2B0E]/10',
                                    stage.status === 'running' && 'bg-[#1F75CB]/10',
                                    stage.status === 'pending' && 'bg-[#8B8680]/10',
                                  )}>
                                    <PipelineIcon status={stage.status} size={12} />
                                  </div>
                                  {i < pipelineStages.length - 1 && (
                                    <div className="w-4 h-px bg-[#d1d1d1] dark:bg-[#3d3d3d]" />
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2">
                              <button
                                disabled={mr.approvals < mr.approvalsRequired}
                                className={cn(
                                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                                  mr.approvals >= mr.approvalsRequired
                                    ? 'bg-[#108548] hover:bg-[#0d6e3e] text-white'
                                    : 'bg-[#f0f0f0] dark:bg-[#333] text-[#8a8a8a] cursor-not-allowed',
                                )}
                              >
                                <GitMerge size={12} />
                                Merge
                              </button>
                              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#eef2ff] dark:bg-[#1F75CB]/10 text-[#1F75CB] text-xs font-medium hover:bg-[#dde6ff] dark:hover:bg-[#1F75CB]/20 transition-colors">
                                <CheckCircle2 size={12} />
                                Approve
                              </button>
                              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[#616161] dark:text-[#8a8a8a] text-xs font-medium hover:bg-[#f0f0f0] dark:hover:bg-[#333] transition-colors">
                                <MessageSquare size={12} />
                                Comment
                              </button>
                              <button className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[#FC6D26] text-xs font-medium hover:bg-[#FC6D26]/10 transition-colors">
                                <ExternalLink size={12} />
                                View in GitLab
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

          {activeTab === 'pipelines' && (
            <div className="space-y-3">
              {/* Pipeline Header */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PipelineIcon status="running" size={18} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#242424] dark:text-[#f0f0f0]">Pipeline #8,547</span>
                        <StatusBadge status="running" />
                      </div>
                      <div className="text-[10px] text-[#8a8a8a] mt-0.5 flex items-center gap-2">
                        <span className="flex items-center gap-1"><GitBranch size={9} /> feat/websocket-reconnect</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><GitCommit size={9} /> a3f7b2c</span>
                        <span>·</span>
                        <span>triggered 6 min ago by Bob Johnson</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[#DD2B0E] text-[11px] font-medium hover:bg-[#DD2B0E]/10 transition-colors">
                      <XCircle size={12} />
                      Cancel
                    </button>
                    <button className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[#1F75CB] text-[11px] font-medium hover:bg-[#1F75CB]/10 transition-colors">
                      <RotateCcw size={12} />
                      Retry
                    </button>
                  </div>
                </div>

                {/* Pipeline Graph */}
                <div className="px-4 py-5">
                  <div className="flex items-start gap-0">
                    {pipelineStages.map((stage, i) => (
                      <div key={stage.name} className="flex items-start">
                        <div className="flex flex-col items-center">
                          {/* Stage header */}
                          <button
                            onClick={() => setExpandedStage(expandedStage === stage.name ? null : stage.name)}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all min-w-[130px]',
                              stage.status === 'success' && 'border-[#108548]/30 bg-[#108548]/5 hover:bg-[#108548]/10',
                              stage.status === 'failed' && 'border-[#DD2B0E]/30 bg-[#DD2B0E]/5 hover:bg-[#DD2B0E]/10',
                              stage.status === 'running' && 'border-[#1F75CB]/30 bg-[#1F75CB]/5 hover:bg-[#1F75CB]/10',
                              stage.status === 'pending' && 'border-[#8B8680]/20 bg-[#8B8680]/5 hover:bg-[#8B8680]/10',
                            )}
                          >
                            <PipelineIcon status={stage.status} size={14} />
                            <div className="text-left">
                              <p className="text-[11px] font-semibold text-[#242424] dark:text-[#f0f0f0] capitalize">{stage.name}</p>
                              <p className="text-[9px] text-[#8a8a8a]">
                                {stage.duration || 'waiting'}
                                {' · '}{stage.jobs.length} jobs
                              </p>
                            </div>
                          </button>

                          {/* Jobs dropdown */}
                          <AnimatePresence>
                            {expandedStage === stage.name && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden w-full mt-1"
                              >
                                <div className="bg-white dark:bg-[#2a2a2a] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg shadow-sm">
                                  {stage.jobs.map((job, j) => (
                                    <div
                                      key={j}
                                      className={cn(
                                        'flex items-center gap-2 px-3 py-1.5 text-[10px]',
                                        j > 0 && 'border-t border-[#f0f0f0] dark:border-[#333]',
                                      )}
                                    >
                                      <PipelineIcon status={job.status} size={10} />
                                      <span className="text-[#242424] dark:text-[#e0e0e0] font-medium flex-1">{job.name}</span>
                                      {job.duration && <span className="text-[#8a8a8a] font-mono">{job.duration}</span>}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Connector line */}
                        {i < pipelineStages.length - 1 && (
                          <div className="flex items-center mt-5 px-1.5">
                            <div className="w-6 h-0.5 bg-[#d1d1d1] dark:bg-[#3d3d3d]" />
                            <ChevronRight size={10} className="text-[#d1d1d1] dark:text-[#3d3d3d] -ml-1" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Pipelines */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#f0f0f0] dark:border-[#333] bg-[#faf9f8] dark:bg-[#1e1f22]">
                  <span className="text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a]">Recent Pipelines</span>
                </div>
                <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
                  {[
                    { id: 8547, status: 'running', branch: 'feat/websocket-reconnect', commit: 'a3f7b2c', ago: '6 min ago', author: 'BJ', duration: '6m 14s' },
                    { id: 8546, status: 'success', branch: 'main', commit: 'd82e1a4', ago: '1 hr ago', author: 'CB', duration: '8m 42s' },
                    { id: 8545, status: 'success', branch: 'fix/cors-headers', commit: 'f19c3b7', ago: '2 hrs ago', author: 'AW', duration: '7m 15s' },
                    { id: 8544, status: 'failed', branch: 'feat/settings-dark-mode', commit: 'b44d9e1', ago: '3 hrs ago', author: 'BJ', duration: '4m 08s' },
                    { id: 8543, status: 'success', branch: 'main', commit: '917ab2f', ago: '5 hrs ago', author: 'CB', duration: '9m 01s' },
                  ].map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors">
                      <PipelineIcon status={p.status} size={14} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-[#242424] dark:text-[#e0e0e0]">#{p.id}</span>
                          <span className="text-[10px] font-mono text-[#1F75CB] bg-[#eef2ff] dark:bg-[#1F75CB]/10 px-1.5 py-0.5 rounded">{p.branch}</span>
                        </div>
                        <div className="text-[9px] text-[#8a8a8a] mt-0.5 flex items-center gap-2">
                          <span>{p.commit}</span>
                          <span>· {p.ago}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-[#8a8a8a]">
                        <Timer size={9} />
                        {p.duration}
                      </div>
                      <div className="w-5 h-5 rounded-full bg-[#FC6D26] flex items-center justify-center text-white text-[7px] font-bold">
                        {p.author}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'issues' && (
            <div className="space-y-3">
              {/* Issue Filters */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-[#252525] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d]">
                    <Search size={12} className="text-[#8a8a8a]" />
                    <input placeholder="Search issues..." className="bg-transparent text-xs text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] outline-none w-40" />
                  </div>
                  <select className="px-2.5 py-1.5 rounded-md bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d] text-[11px] text-[#616161] dark:text-[#8a8a8a] outline-none">
                    <option>Milestone: v2.14</option>
                    <option>Milestone: v2.15</option>
                    <option>All milestones</option>
                  </select>
                  <select className="px-2.5 py-1.5 rounded-md bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d] text-[11px] text-[#616161] dark:text-[#8a8a8a] outline-none">
                    <option>Label: All</option>
                    <option>bug</option>
                    <option>feature</option>
                  </select>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#108548] hover:bg-[#0d6e3e] text-white text-xs font-medium transition-colors">
                  <Plus size={12} />
                  New issue
                </button>
              </div>

              {/* Issue List */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden divide-y divide-[#f0f0f0] dark:divide-[#333]">
                {issues.map(issue => (
                  <div key={issue.id} className="px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={16} className="text-[#108548] mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-[#242424] dark:text-[#f0f0f0]">{issue.title}</span>
                          {issue.labels.map(label => (
                            <span
                              key={label.name}
                              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium border"
                              style={{
                                backgroundColor: `${label.color}15`,
                                color: label.color,
                                borderColor: `${label.color}30`,
                              }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-[#8a8a8a]">
                          <span>#{issue.id}</span>
                          <span>· by {issue.author}</span>
                          <span>· {issue.updatedAgo}</span>
                          <span className="flex items-center gap-1"><Tag size={8} /> {issue.milestone}</span>
                          <span className="flex items-center gap-1"><Zap size={8} /> weight: {issue.weight}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1 text-[10px] text-[#8a8a8a]">
                          <MessageSquare size={10} />
                          {issue.commentCount}
                        </div>
                        <div className="w-5 h-5 rounded-full bg-[#FC6D26] flex items-center justify-center text-white text-[7px] font-bold">
                          {issue.assignee}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Issue Board Mini Preview */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#f0f0f0] dark:border-[#333] bg-[#faf9f8] dark:bg-[#1e1f22] flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a]">Issue Board — v2.14</span>
                  <button className="text-[10px] text-[#FC6D26] font-medium hover:underline flex items-center gap-1">
                    Open board <ExternalLink size={9} />
                  </button>
                </div>
                <div className="p-4 flex gap-3 overflow-x-auto scrollbar-on-hover">
                  {[
                    { label: 'Open', color: '#108548', count: 4, items: ['API pagination fix', 'Rate limiting headers'] },
                    { label: 'In Progress', color: '#1F75CB', count: 3, items: ['WebSocket reconnect', 'Payment refactor'] },
                    { label: 'In Review', color: '#FC6D26', count: 2, items: ['React Router upgrade'] },
                    { label: 'Closed', color: '#8B8680', count: 12, items: ['Auth flow v2', 'Dashboard filters'] },
                  ].map(col => (
                    <div key={col.label} className="min-w-[160px] flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                        <span className="text-[10px] font-semibold text-[#242424] dark:text-[#e0e0e0]">{col.label}</span>
                        <span className="text-[9px] text-[#8a8a8a] bg-[#f0f0f0] dark:bg-[#333] rounded-full px-1.5">{col.count}</span>
                      </div>
                      <div className="space-y-1.5">
                        {col.items.map((item, i) => (
                          <div key={i} className="px-2.5 py-2 bg-[#faf9f8] dark:bg-[#1e1f22] rounded-lg border border-[#e5e5e5] dark:border-[#333] text-[10px] text-[#242424] dark:text-[#e0e0e0]">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Open MRs', value: String(mergeRequests.filter(m => m.status === 'open').length), sub: '1 ready to merge' },
          { label: 'Pipeline Success', value: '94%', sub: 'Last 30 days' },
          { label: 'Open Issues', value: String(issues.length), sub: '1 critical (P1)' },
          { label: 'Last Deploy', value: '1 hr ago', sub: 'v2.13.1 → production' },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] px-4 py-3"
          >
            <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">{stat.label}</p>
            <p className="text-lg font-bold text-[#242424] dark:text-[#f0f0f0] mt-0.5">{stat.value}</p>
            <p className="text-[10px] text-[#b9bbbe] dark:text-[#5a5a5a]">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}