import { useState, useMemo } from 'react';
import {
  Rocket, GitBranch, CheckCircle2, XCircle, Clock, AlertTriangle,
  Play, RotateCcw, ChevronRight, ExternalLink, Search, Filter,
  Box, Layers, ArrowRight, Activity, Eye, Terminal, RefreshCw,
  CircleDot, Timer, TrendingUp, Shield, Zap, Server, Globe,
  ChevronDown, MoreHorizontal, Copy, Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './ui/utils';

// ─── Types ───

type DeployStatus = 'success' | 'running' | 'failed' | 'pending' | 'cancelled' | 'rolling-back';
type StepStatus = 'success' | 'running' | 'failed' | 'pending' | 'skipped';
type CheckStatus = 'pass' | 'fail' | 'running' | 'pending' | 'warning';
type Environment = 'development' | 'staging' | 'production';

interface PipelineStep {
  id: string;
  name: string;
  status: StepStatus;
  duration?: string;
  startedAt?: string;
  logs?: string[];
}

interface PostCheck {
  id: string;
  name: string;
  category: 'health' | 'smoke' | 'performance' | 'security' | 'canary';
  status: CheckStatus;
  detail?: string;
  duration?: string;
  metric?: string;
}

interface Deployment {
  id: string;
  version: string;
  service: string;
  environment: Environment;
  status: DeployStatus;
  triggeredBy: string;
  triggeredAt: string;
  completedAt?: string;
  commit: string;
  commitMessage: string;
  branch: string;
  steps: PipelineStep[];
  postChecks: PostCheck[];
  rollbackVersion?: string;
  tags: string[];
}

// ─── Mock Data ───

const mockDeployments: Deployment[] = [
  {
    id: 'deploy-1',
    version: 'v2.14.0',
    service: 'main-app',
    environment: 'production',
    status: 'running',
    triggeredBy: 'Bob Johnson',
    triggeredAt: '2026-02-19T14:22:00',
    commit: 'a3f7b21',
    commitMessage: 'feat: WebSocket reconnection logic + new dashboard widgets',
    branch: 'main',
    steps: [
      { id: 's1', name: 'Build', status: 'success', duration: '2m 14s', startedAt: '14:22:05', logs: ['Installing dependencies...', 'Compiling TypeScript...', 'Bundle size: 1.42 MB (gzip: 412 KB)', 'Build completed successfully.'] },
      { id: 's2', name: 'Unit Tests', status: 'success', duration: '1m 48s', startedAt: '14:24:19', logs: ['Running 847 tests across 42 suites...', 'All 847 tests passed.', 'Coverage: 91.2% (statements), 87.4% (branches)'] },
      { id: 's3', name: 'Integration Tests', status: 'success', duration: '3m 22s', startedAt: '14:26:07', logs: ['Spinning up test containers...', 'Running 124 integration tests...', '124/124 passed. No flaky tests detected.'] },
      { id: 's4', name: 'Security Scan', status: 'success', duration: '1m 05s', startedAt: '14:29:29', logs: ['Scanning dependencies with Trivy...', '0 critical, 0 high, 2 medium, 5 low', 'No blocking vulnerabilities found.'] },
      { id: 's5', name: 'Deploy to Staging', status: 'success', duration: '2m 31s', startedAt: '14:30:34', logs: ['Pushing image to registry...', 'Updating Kubernetes deployment...', 'Waiting for rollout... 3/3 pods ready.', 'Staging deploy complete.'] },
      { id: 's6', name: 'Staging Smoke Tests', status: 'success', duration: '0m 58s', startedAt: '14:33:05', logs: ['Running smoke test suite...', '12/12 smoke tests passed.', 'All critical paths verified.'] },
      { id: 's7', name: 'Approval Gate', status: 'success', duration: '8m 12s', startedAt: '14:34:03', logs: ['Awaiting manual approval...', 'Approved by Charlie Brown at 14:42:15'] },
      { id: 's8', name: 'Deploy to Production', status: 'running', duration: '1m 30s...', startedAt: '14:42:15', logs: ['Pushing image to production registry...', 'Rolling update in progress... 2/5 pods updated'] },
      { id: 's9', name: 'Post-Deploy Verification', status: 'pending' },
    ],
    postChecks: [
      { id: 'pc1', name: 'Health Check', category: 'health', status: 'pending', detail: 'Waiting for deployment to complete' },
      { id: 'pc2', name: 'API Endpoints', category: 'smoke', status: 'pending' },
      { id: 'pc3', name: 'Auth Flow', category: 'smoke', status: 'pending' },
      { id: 'pc4', name: 'Latency Baseline', category: 'performance', status: 'pending' },
      { id: 'pc5', name: 'Error Rate', category: 'performance', status: 'pending' },
      { id: 'pc6', name: 'Canary Analysis', category: 'canary', status: 'pending' },
      { id: 'pc7', name: 'OWASP Scan', category: 'security', status: 'pending' },
    ],
    tags: ['release', 'sprint-14'],
  },
  {
    id: 'deploy-2',
    version: 'v2.13.1',
    service: 'main-app',
    environment: 'production',
    status: 'success',
    triggeredBy: 'Bob Johnson',
    triggeredAt: '2026-02-18T09:15:00',
    completedAt: '2026-02-18T09:42:00',
    commit: 'e8c4d19',
    commitMessage: 'fix: payment gateway timeout handling',
    branch: 'hotfix/payment-timeout',
    steps: [
      { id: 's1', name: 'Build', status: 'success', duration: '1m 58s', startedAt: '09:15:05' },
      { id: 's2', name: 'Unit Tests', status: 'success', duration: '1m 42s', startedAt: '09:17:03' },
      { id: 's3', name: 'Integration Tests', status: 'success', duration: '3m 10s', startedAt: '09:18:45' },
      { id: 's4', name: 'Security Scan', status: 'success', duration: '0m 55s', startedAt: '09:21:55' },
      { id: 's5', name: 'Deploy to Staging', status: 'success', duration: '2m 18s', startedAt: '09:22:50' },
      { id: 's6', name: 'Staging Smoke Tests', status: 'success', duration: '0m 52s', startedAt: '09:25:08' },
      { id: 's7', name: 'Approval Gate', status: 'success', duration: '5m 20s', startedAt: '09:26:00' },
      { id: 's8', name: 'Deploy to Production', status: 'success', duration: '3m 05s', startedAt: '09:31:20' },
      { id: 's9', name: 'Post-Deploy Verification', status: 'success', duration: '4m 35s', startedAt: '09:34:25' },
    ],
    postChecks: [
      { id: 'pc1', name: 'Health Check', category: 'health', status: 'pass', detail: 'All 5 pods healthy', duration: '8s', metric: '5/5 healthy' },
      { id: 'pc2', name: 'API Endpoints', category: 'smoke', status: 'pass', detail: '24/24 endpoints responding', duration: '32s', metric: '100%' },
      { id: 'pc3', name: 'Auth Flow', category: 'smoke', status: 'pass', detail: 'Login, token refresh, logout OK', duration: '12s', metric: 'Pass' },
      { id: 'pc4', name: 'Latency Baseline', category: 'performance', status: 'pass', detail: 'P95 at 142ms (baseline: 180ms)', duration: '60s', metric: '142ms' },
      { id: 'pc5', name: 'Error Rate', category: 'performance', status: 'pass', detail: '0.02% error rate (threshold: 1%)', duration: '60s', metric: '0.02%' },
      { id: 'pc6', name: 'Canary Analysis', category: 'canary', status: 'pass', detail: 'No regression detected vs baseline', duration: '180s', metric: 'Score: 98' },
      { id: 'pc7', name: 'OWASP Scan', category: 'security', status: 'pass', detail: '0 critical, 0 high findings', duration: '45s', metric: 'Clean' },
    ],
    tags: ['hotfix', 'payment'],
  },
  {
    id: 'deploy-3',
    version: 'v1.8.2',
    service: 'auth-service',
    environment: 'production',
    status: 'success',
    triggeredBy: 'Charlie Brown',
    triggeredAt: '2026-02-18T11:30:00',
    completedAt: '2026-02-18T11:55:00',
    commit: 'b2d9f45',
    commitMessage: 'feat: add OAuth PKCE support for mobile clients',
    branch: 'main',
    steps: [
      { id: 's1', name: 'Build', status: 'success', duration: '1m 32s', startedAt: '11:30:05' },
      { id: 's2', name: 'Unit Tests', status: 'success', duration: '0m 58s', startedAt: '11:31:37' },
      { id: 's3', name: 'Integration Tests', status: 'success', duration: '2m 15s', startedAt: '11:32:35' },
      { id: 's4', name: 'Security Scan', status: 'success', duration: '0m 48s', startedAt: '11:34:50' },
      { id: 's5', name: 'Deploy to Staging', status: 'success', duration: '1m 55s', startedAt: '11:35:38' },
      { id: 's6', name: 'Staging Smoke Tests', status: 'success', duration: '0m 42s', startedAt: '11:37:33' },
      { id: 's7', name: 'Approval Gate', status: 'success', duration: '6m 00s', startedAt: '11:38:15' },
      { id: 's8', name: 'Deploy to Production', status: 'success', duration: '2m 20s', startedAt: '11:44:15' },
      { id: 's9', name: 'Post-Deploy Verification', status: 'success', duration: '3m 25s', startedAt: '11:46:35' },
    ],
    postChecks: [
      { id: 'pc1', name: 'Health Check', category: 'health', status: 'pass', detail: 'All 3 pods healthy', duration: '6s', metric: '3/3 healthy' },
      { id: 'pc2', name: 'API Endpoints', category: 'smoke', status: 'pass', detail: '18/18 endpoints OK', duration: '22s', metric: '100%' },
      { id: 'pc3', name: 'Auth Flow', category: 'smoke', status: 'pass', detail: 'PKCE flow verified', duration: '15s', metric: 'Pass' },
      { id: 'pc4', name: 'Latency Baseline', category: 'performance', status: 'pass', detail: 'P95 at 65ms', duration: '60s', metric: '65ms' },
      { id: 'pc5', name: 'Error Rate', category: 'performance', status: 'pass', detail: '0.01% error rate', duration: '60s', metric: '0.01%' },
      { id: 'pc6', name: 'Canary Analysis', category: 'canary', status: 'pass', detail: 'All metrics within tolerance', duration: '120s', metric: 'Score: 99' },
      { id: 'pc7', name: 'OWASP Scan', category: 'security', status: 'pass', detail: '0 findings', duration: '30s', metric: 'Clean' },
    ],
    tags: ['feature', 'oauth'],
  },
  {
    id: 'deploy-4',
    version: 'v4.2.0-rc.2',
    service: 'payment-gateway',
    environment: 'staging',
    status: 'failed',
    triggeredBy: 'Jane Smith',
    triggeredAt: '2026-02-18T16:05:00',
    completedAt: '2026-02-18T16:18:00',
    commit: 'f91a8c3',
    commitMessage: 'feat: add Apple Pay integration',
    branch: 'feat/apple-pay',
    steps: [
      { id: 's1', name: 'Build', status: 'success', duration: '2m 42s', startedAt: '16:05:05' },
      { id: 's2', name: 'Unit Tests', status: 'success', duration: '1m 15s', startedAt: '16:07:47' },
      { id: 's3', name: 'Integration Tests', status: 'failed', duration: '2m 50s', startedAt: '16:09:02', logs: ['Running 89 integration tests...', '85/89 passed, 4 FAILED', 'FAIL: test_apple_pay_tokenization — timeout after 30s', 'FAIL: test_apple_pay_refund — AssertionError: expected 200 got 502', 'FAIL: test_payment_webhook_retry — Connection refused', 'FAIL: test_idempotency_key — Duplicate key violation'] },
      { id: 's4', name: 'Security Scan', status: 'skipped' },
      { id: 's5', name: 'Deploy to Staging', status: 'skipped' },
      { id: 's6', name: 'Staging Smoke Tests', status: 'skipped' },
      { id: 's7', name: 'Approval Gate', status: 'skipped' },
      { id: 's8', name: 'Deploy to Production', status: 'skipped' },
      { id: 's9', name: 'Post-Deploy Verification', status: 'skipped' },
    ],
    postChecks: [],
    tags: ['feature', 'apple-pay'],
  },
  {
    id: 'deploy-5',
    version: 'v2.5.0',
    service: 'notification-service',
    environment: 'production',
    status: 'success',
    triggeredBy: 'Alice Williams',
    triggeredAt: '2026-02-17T10:00:00',
    completedAt: '2026-02-17T10:28:00',
    commit: 'c7e2a84',
    commitMessage: 'feat: push notification batching + rate limiting',
    branch: 'main',
    steps: [
      { id: 's1', name: 'Build', status: 'success', duration: '1m 22s', startedAt: '10:00:05' },
      { id: 's2', name: 'Unit Tests', status: 'success', duration: '0m 45s', startedAt: '10:01:27' },
      { id: 's3', name: 'Integration Tests', status: 'success', duration: '1m 58s', startedAt: '10:02:12' },
      { id: 's4', name: 'Security Scan', status: 'success', duration: '0m 40s', startedAt: '10:04:10' },
      { id: 's5', name: 'Deploy to Staging', status: 'success', duration: '1m 45s', startedAt: '10:04:50' },
      { id: 's6', name: 'Staging Smoke Tests', status: 'success', duration: '0m 38s', startedAt: '10:06:35' },
      { id: 's7', name: 'Approval Gate', status: 'success', duration: '12m 00s', startedAt: '10:07:13' },
      { id: 's8', name: 'Deploy to Production', status: 'success', duration: '2m 10s', startedAt: '10:19:13' },
      { id: 's9', name: 'Post-Deploy Verification', status: 'success', duration: '3m 37s', startedAt: '10:21:23' },
    ],
    postChecks: [
      { id: 'pc1', name: 'Health Check', category: 'health', status: 'pass', detail: 'All 2 pods healthy', duration: '5s', metric: '2/2 healthy' },
      { id: 'pc2', name: 'API Endpoints', category: 'smoke', status: 'pass', detail: '8/8 endpoints OK', duration: '14s', metric: '100%' },
      { id: 'pc3', name: 'Push Delivery', category: 'smoke', status: 'pass', detail: 'Test push delivered in 1.2s', duration: '8s', metric: 'Pass' },
      { id: 'pc4', name: 'Latency Baseline', category: 'performance', status: 'pass', detail: 'P95 at 88ms', duration: '60s', metric: '88ms' },
      { id: 'pc5', name: 'Error Rate', category: 'performance', status: 'pass', detail: '0.00% error rate', duration: '60s', metric: '0.00%' },
      { id: 'pc6', name: 'Canary Analysis', category: 'canary', status: 'warning', detail: 'Minor memory increase (+8MB), within tolerance', duration: '120s', metric: 'Score: 92' },
      { id: 'pc7', name: 'OWASP Scan', category: 'security', status: 'pass', detail: '0 findings', duration: '25s', metric: 'Clean' },
    ],
    tags: ['feature'],
  },
  {
    id: 'deploy-6',
    version: 'v3.1.0',
    service: 'search-indexer',
    environment: 'production',
    status: 'success',
    triggeredBy: 'Bob Johnson',
    triggeredAt: '2026-02-16T14:30:00',
    completedAt: '2026-02-16T15:02:00',
    commit: 'd4f5e22',
    commitMessage: 'perf: elasticsearch query optimization + caching layer',
    branch: 'main',
    steps: [
      { id: 's1', name: 'Build', status: 'success', duration: '1m 48s', startedAt: '14:30:05' },
      { id: 's2', name: 'Unit Tests', status: 'success', duration: '1m 12s', startedAt: '14:31:53' },
      { id: 's3', name: 'Integration Tests', status: 'success', duration: '2m 35s', startedAt: '14:33:05' },
      { id: 's4', name: 'Security Scan', status: 'success', duration: '0m 52s', startedAt: '14:35:40' },
      { id: 's5', name: 'Deploy to Staging', status: 'success', duration: '2m 00s', startedAt: '14:36:32' },
      { id: 's6', name: 'Staging Smoke Tests', status: 'success', duration: '0m 45s', startedAt: '14:38:32' },
      { id: 's7', name: 'Approval Gate', status: 'success', duration: '15m 00s', startedAt: '14:39:17' },
      { id: 's8', name: 'Deploy to Production', status: 'success', duration: '2m 30s', startedAt: '14:54:17' },
      { id: 's9', name: 'Post-Deploy Verification', status: 'success', duration: '5m 13s', startedAt: '14:56:47' },
    ],
    postChecks: [
      { id: 'pc1', name: 'Health Check', category: 'health', status: 'pass', detail: 'All 4 pods healthy', duration: '7s', metric: '4/4 healthy' },
      { id: 'pc2', name: 'API Endpoints', category: 'smoke', status: 'pass', detail: '12/12 endpoints OK', duration: '18s', metric: '100%' },
      { id: 'pc3', name: 'Search Quality', category: 'smoke', status: 'pass', detail: 'MRR score: 0.94 (baseline 0.91)', duration: '45s', metric: 'Pass' },
      { id: 'pc4', name: 'Latency Baseline', category: 'performance', status: 'pass', detail: 'P95 at 38ms (was 95ms)', duration: '60s', metric: '38ms' },
      { id: 'pc5', name: 'Error Rate', category: 'performance', status: 'pass', detail: '0.00% error rate', duration: '60s', metric: '0.00%' },
      { id: 'pc6', name: 'Canary Analysis', category: 'canary', status: 'pass', detail: 'Significant latency improvement detected', duration: '120s', metric: 'Score: 100' },
      { id: 'pc7', name: 'OWASP Scan', category: 'security', status: 'pass', detail: '0 findings', duration: '28s', metric: 'Clean' },
    ],
    tags: ['performance'],
  },
];

// ─── Status helpers ───

const deployStatusConfig: Record<DeployStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle2 }> = {
  success: { label: 'Deployed', color: 'text-[#237b4b] dark:text-[#57ab5a]', bgColor: 'bg-[#edf7f0] dark:bg-[#237b4b]/15', icon: CheckCircle2 },
  running: { label: 'Deploying', color: 'text-[#0078d4] dark:text-[#6cb8f6]', bgColor: 'bg-[#ecf5fe] dark:bg-[#0078d4]/15', icon: RefreshCw },
  failed: { label: 'Failed', color: 'text-[#c4314b] dark:text-[#f47067]', bgColor: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15', icon: XCircle },
  pending: { label: 'Pending', color: 'text-[#8a8a8a] dark:text-[#b9bbbe]', bgColor: 'bg-[#f0f0f0] dark:bg-[#3d3d3d]', icon: Clock },
  cancelled: { label: 'Cancelled', color: 'text-[#8a8a8a] dark:text-[#b9bbbe]', bgColor: 'bg-[#f0f0f0] dark:bg-[#3d3d3d]', icon: XCircle },
  'rolling-back': { label: 'Rolling Back', color: 'text-[#d4820c] dark:text-[#f0b850]', bgColor: 'bg-[#fef7ec] dark:bg-[#d4820c]/15', icon: RotateCcw },
};

const stepStatusConfig: Record<StepStatus, { color: string; bgDot: string }> = {
  success: { color: 'text-[#237b4b] dark:text-[#57ab5a]', bgDot: 'bg-[#237b4b]' },
  running: { color: 'text-[#0078d4] dark:text-[#6cb8f6]', bgDot: 'bg-[#0078d4]' },
  failed: { color: 'text-[#c4314b] dark:text-[#f47067]', bgDot: 'bg-[#c4314b]' },
  pending: { color: 'text-[#8a8a8a] dark:text-[#b9bbbe]', bgDot: 'bg-[#d1d1d1] dark:bg-[#4d4d4d]' },
  skipped: { color: 'text-[#b9bbbe] dark:text-[#6d6f78]', bgDot: 'bg-[#d1d1d1] dark:bg-[#3d3d3d]' },
};

const checkStatusConfig: Record<CheckStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  pass: { label: 'Pass', color: 'text-[#237b4b] dark:text-[#57ab5a]', bg: 'bg-[#edf7f0] dark:bg-[#237b4b]/15', icon: CheckCircle2 },
  fail: { label: 'Fail', color: 'text-[#c4314b] dark:text-[#f47067]', bg: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15', icon: XCircle },
  running: { label: 'Running', color: 'text-[#0078d4] dark:text-[#6cb8f6]', bg: 'bg-[#ecf5fe] dark:bg-[#0078d4]/15', icon: RefreshCw },
  pending: { label: 'Pending', color: 'text-[#8a8a8a] dark:text-[#b9bbbe]', bg: 'bg-[#f0f0f0] dark:bg-[#3d3d3d]', icon: Clock },
  warning: { label: 'Warning', color: 'text-[#d4820c] dark:text-[#f0b850]', bg: 'bg-[#fef7ec] dark:bg-[#d4820c]/15', icon: AlertTriangle },
};

const envColors: Record<Environment, { label: string; color: string; bg: string }> = {
  development: { label: 'Dev', color: 'text-[#616161] dark:text-[#b9bbbe]', bg: 'bg-[#f0f0f0] dark:bg-[#3d3d3d]' },
  staging: { label: 'Staging', color: 'text-[#d4820c] dark:text-[#f0b850]', bg: 'bg-[#fef7ec] dark:bg-[#d4820c]/15' },
  production: { label: 'Production', color: 'text-[#c4314b] dark:text-[#f47067]', bg: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15' },
};

const checkCategoryIcons: Record<string, typeof Shield> = {
  health: Activity,
  smoke: Zap,
  performance: TrendingUp,
  security: Shield,
  canary: Eye,
};

// ─── Helper Components ───

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'success') return <CheckCircle2 size={16} className="text-[#237b4b] dark:text-[#57ab5a]" />;
  if (status === 'running') return <RefreshCw size={16} className="text-[#0078d4] dark:text-[#6cb8f6] animate-spin" />;
  if (status === 'failed') return <XCircle size={16} className="text-[#c4314b] dark:text-[#f47067]" />;
  if (status === 'skipped') return <CircleDot size={16} className="text-[#b9bbbe] dark:text-[#6d6f78]" />;
  return <Clock size={16} className="text-[#d1d1d1] dark:text-[#4d4d4d]" />;
}

function StatusBadge({ status }: { status: DeployStatus }) {
  const cfg = deployStatusConfig[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', cfg.bgColor, cfg.color)}>
      <Icon size={12} className={status === 'running' ? 'animate-spin' : ''} />
      {cfg.label}
    </span>
  );
}

// ─── Pipeline Visualization ───

function PipelineSteps({ steps, expanded, onToggle }: { steps: PipelineStep[]; expanded: string | null; onToggle: (id: string) => void }) {
  return (
    <div className="space-y-0.5">
      {steps.map((step, i) => {
        const isExpanded = expanded === step.id;
        const stepCfg = stepStatusConfig[step.status];
        const isLast = i === steps.length - 1;

        return (
          <div key={step.id}>
            <button
              onClick={() => step.logs?.length ? onToggle(step.id) : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all',
                'hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]',
                isExpanded && 'bg-[#f5f5f5] dark:bg-[#2a2a2a]',
              )}
            >
              {/* Timeline connector */}
              <div className="relative flex flex-col items-center">
                <StepIcon status={step.status} />
                {!isLast && (
                  <div className={cn(
                    'absolute top-[20px] w-0.5 h-[calc(100%+4px)]',
                    step.status === 'success' ? 'bg-[#237b4b]/30' :
                    step.status === 'running' ? 'bg-[#0078d4]/30' :
                    step.status === 'failed' ? 'bg-[#c4314b]/30' :
                    'bg-[#e1dfdd] dark:bg-[#3d3d3d]'
                  )} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm font-medium', stepCfg.color)}>{step.name}</span>
                  {step.status === 'skipped' && (
                    <span className="text-[10px] text-[#b9bbbe] dark:text-[#6d6f78] uppercase tracking-wider">Skipped</span>
                  )}
                </div>
                {step.startedAt && (
                  <span className="text-xs text-[#8a8a8a] dark:text-[#6d6f78]">
                    Started {step.startedAt}{step.duration ? ` · ${step.duration}` : ''}
                  </span>
                )}
              </div>

              {step.logs?.length ? (
                <ChevronDown size={14} className={cn(
                  'text-[#8a8a8a] transition-transform shrink-0',
                  isExpanded && 'rotate-180'
                )} />
              ) : null}
            </button>

            <AnimatePresence>
              {isExpanded && step.logs && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-[44px] mr-4 mb-3 bg-[#1e1e1e] dark:bg-[#0d1117] rounded-lg p-3 font-mono text-xs text-[#d4d4d4] space-y-0.5 overflow-x-auto">
                    {step.logs.map((line, li) => (
                      <div key={li} className="flex gap-2">
                        <span className="text-[#6d6f78] select-none shrink-0">{li + 1}</span>
                        <span className={cn(
                          line.includes('FAIL') ? 'text-[#f47067]' :
                          line.includes('passed') || line.includes('success') || line.includes('complete') || line.includes('Approved') ? 'text-[#57ab5a]' :
                          line.includes('Running') || line.includes('progress') ? 'text-[#6cb8f6]' :
                          'text-[#d4d4d4]'
                        )}>{line}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Post-Deploy Checks Panel ───

function PostChecksPanel({ checks, deployStatus, onRunChecks }: {
  checks: PostCheck[];
  deployStatus: DeployStatus;
  onRunChecks: () => void;
}) {
  if (checks.length === 0) return null;

  const allPending = checks.every(c => c.status === 'pending');
  const allDone = checks.every(c => c.status === 'pass' || c.status === 'fail' || c.status === 'warning');
  const passCount = checks.filter(c => c.status === 'pass').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warnCount = checks.filter(c => c.status === 'warning').length;

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, PostCheck[]> = {};
    checks.forEach(c => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, [checks]);

  return (
    <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#f0f0f0] dark:border-[#333] bg-[#faf9f8] dark:bg-[#1e1f22] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5b5fc7] to-[#7b7fd7] flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[#242424] dark:text-[#f0f0f0]">Post-Deploy Checks</h3>
            {allDone && (
              <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78]">
                {passCount} passed{warnCount > 0 ? `, ${warnCount} warnings` : ''}{failCount > 0 ? `, ${failCount} failed` : ''}
              </p>
            )}
          </div>
        </div>

        {allPending && deployStatus !== 'running' && deployStatus !== 'pending' && (
          <button
            onClick={onRunChecks}
            className="flex items-center gap-2 px-4 py-2 bg-[#5b5fc7] hover:bg-[#4b4fb7] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Play size={14} />
            Run Checks
          </button>
        )}
        {allPending && (deployStatus === 'running' || deployStatus === 'pending') && (
          <span className="text-xs text-[#8a8a8a] dark:text-[#6d6f78] italic">Waiting for deploy...</span>
        )}
        {allDone && (
          <button
            onClick={onRunChecks}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#5b5fc7] dark:text-[#a6a9dc] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-lg transition-colors"
          >
            <RotateCcw size={12} />
            Re-run
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {Object.entries(grouped).map(([category, categoryChecks]) => {
          const CatIcon = checkCategoryIcons[category] || Activity;
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <CatIcon size={14} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
                <h4 className="text-xs font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider">
                  {category}
                </h4>
              </div>
              <div className="space-y-2">
                {categoryChecks.map(check => {
                  const cfg = checkStatusConfig[check.status];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={check.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg border transition-all',
                        check.status === 'fail' ? 'border-[#c4314b]/30 dark:border-[#f47067]/20 bg-[#fdf0f2]/50 dark:bg-[#c4314b]/5' :
                        check.status === 'warning' ? 'border-[#d4820c]/30 dark:border-[#f0b850]/20 bg-[#fef7ec]/50 dark:bg-[#d4820c]/5' :
                        'border-[#e1dfdd] dark:border-[#3d3d3d]'
                      )}
                    >
                      <Icon size={16} className={cn(cfg.color, check.status === 'running' && 'animate-spin')} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#242424] dark:text-[#f0f0f0]">{check.name}</div>
                        {check.detail && (
                          <div className="text-xs text-[#8a8a8a] dark:text-[#6d6f78] mt-0.5">{check.detail}</div>
                        )}
                      </div>
                      {check.metric && (
                        <span className={cn('text-xs font-mono font-medium px-2 py-0.5 rounded', cfg.bg, cfg.color)}>
                          {check.metric}
                        </span>
                      )}
                      {check.duration && (
                        <span className="text-xs text-[#b9bbbe] dark:text-[#6d6f78] flex items-center gap-1">
                          <Timer size={10} />
                          {check.duration}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Deployment Detail View ───

function DeploymentDetail({ deploy, onBack }: { deploy: Deployment; onBack: () => void }) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [checks, setChecks] = useState(deploy.postChecks);
  const [activeDetailTab, setActiveDetailTab] = useState<'pipeline' | 'checks'>('pipeline');

  const handleToggleStep = (id: string) => {
    setExpandedStep(prev => prev === id ? null : id);
  };

  const handleRunChecks = () => {
    // Simulate running checks sequentially
    const newChecks = [...checks];
    let delay = 0;
    newChecks.forEach((check, i) => {
      delay += 400 + Math.random() * 800;
      setTimeout(() => {
        setChecks(prev => prev.map((c, ci) =>
          ci === i ? { ...c, status: 'running' as CheckStatus } : c
        ));
      }, delay);
      delay += 800 + Math.random() * 1200;
      setTimeout(() => {
        setChecks(prev => prev.map((c, ci) =>
          ci === i ? {
            ...c,
            status: (deploy.postChecks[i]?.status !== 'pending' ? deploy.postChecks[i].status : 'pass') as CheckStatus,
            detail: deploy.postChecks[i]?.detail || 'Check passed',
            duration: deploy.postChecks[i]?.duration || `${(Math.random() * 30 + 5).toFixed(0)}s`,
            metric: deploy.postChecks[i]?.metric || 'Pass',
          } : c
        ));
      }, delay);
    });
  };

  const completedSteps = deploy.steps.filter(s => s.status === 'success').length;
  const totalSteps = deploy.steps.length;
  const skippedSteps = deploy.steps.filter(s => s.status === 'skipped').length;

  const envCfg = envColors[deploy.environment];
  const statusCfg = deployStatusConfig[deploy.status];

  return (
    <div className="h-full flex flex-col -m-6">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 bg-white dark:bg-[#252525] border-b border-[#e1dfdd] dark:border-[#3d3d3d]">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-[#5b5fc7] dark:text-[#a6a9dc] hover:underline"
          >
            <ChevronRight size={14} className="rotate-180" />
            All Deployments
          </button>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              deploy.status === 'success' ? 'bg-[#edf7f0] dark:bg-[#237b4b]/15' :
              deploy.status === 'running' ? 'bg-[#ecf5fe] dark:bg-[#0078d4]/15' :
              deploy.status === 'failed' ? 'bg-[#fdf0f2] dark:bg-[#c4314b]/15' :
              'bg-[#f0f0f0] dark:bg-[#3d3d3d]'
            )}>
              <Rocket size={22} className={statusCfg.color} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-[#242424] dark:text-[#f0f0f0]">
                  {deploy.service} <span className="text-[#5b5fc7] dark:text-[#a6a9dc]">{deploy.version}</span>
                </h2>
                <StatusBadge status={deploy.status} />
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', envCfg.bg, envCfg.color)}>
                  {envCfg.label}
                </span>
              </div>
              <p className="text-sm text-[#616161] dark:text-[#8a8a8a] mt-0.5">
                {deploy.commitMessage}
              </p>
              <div className="flex items-center gap-4 mt-1.5 text-xs text-[#8a8a8a] dark:text-[#6d6f78]">
                <span className="flex items-center gap-1"><GitBranch size={11} />{deploy.branch}</span>
                <span className="flex items-center gap-1"><Terminal size={11} />{deploy.commit}</span>
                <span>by {deploy.triggeredBy}</span>
                <span>{new Date(deploy.triggeredAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {deploy.status === 'running' && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#c4314b] dark:text-[#f47067] hover:bg-[#fdf0f2] dark:hover:bg-[#c4314b]/10 rounded-lg transition-colors">
                <XCircle size={14} />
                Cancel
              </button>
            )}
            {deploy.status === 'success' && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#d4820c] dark:text-[#f0b850] hover:bg-[#fef7ec] dark:hover:bg-[#d4820c]/10 rounded-lg transition-colors">
                <RotateCcw size={14} />
                Rollback
              </button>
            )}
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#616161] dark:text-[#8a8a8a] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-lg transition-colors">
              <ExternalLink size={14} />
              Logs
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5 text-xs text-[#616161] dark:text-[#8a8a8a]">
            <span>{completedSteps}/{totalSteps - skippedSteps} steps completed</span>
            {deploy.completedAt && (
              <span className="flex items-center gap-1">
                <Timer size={11} />
                Total: {(() => {
                  const start = new Date(deploy.triggeredAt).getTime();
                  const end = new Date(deploy.completedAt).getTime();
                  const mins = Math.round((end - start) / 60000);
                  return `${mins}m`;
                })()}
              </span>
            )}
          </div>
          <div className="h-2 bg-[#f0f0f0] dark:bg-[#3d3d3d] rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                deploy.status === 'success' ? 'bg-[#237b4b]' :
                deploy.status === 'running' ? 'bg-[#0078d4]' :
                deploy.status === 'failed' ? 'bg-[#c4314b]' :
                'bg-[#8a8a8a]'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${(completedSteps / (totalSteps - skippedSteps)) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-4 -mb-4">
          {[
            { id: 'pipeline' as const, label: 'Pipeline Steps', icon: <Layers size={14} /> },
            { id: 'checks' as const, label: `Post-Deploy Checks${checks.length > 0 ? ` (${checks.length})` : ''}`, icon: <Shield size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveDetailTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
                activeDetailTab === tab.id
                  ? 'border-[#5b5fc7] text-[#5b5fc7] dark:text-[#a6a9dc] dark:border-[#a6a9dc]'
                  : 'border-transparent text-[#616161] dark:text-[#8a8a8a] hover:text-[#242424] dark:hover:text-[#e0e0e0] hover:border-[#d1d1d1] dark:hover:border-[#3d3d3d]'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-on-hover">
        <AnimatePresence mode="wait">
          {activeDetailTab === 'pipeline' && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
            >
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#f0f0f0] dark:border-[#333] bg-[#faf9f8] dark:bg-[#1e1f22] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5b5fc7] to-[#7b7fd7] flex items-center justify-center">
                      <Layers size={16} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-[#242424] dark:text-[#f0f0f0]">Pipeline Steps</h3>
                  </div>
                  <span className="text-xs text-[#8a8a8a] dark:text-[#6d6f78]">Click a step to view logs</span>
                </div>
                <div className="p-4">
                  <PipelineSteps steps={deploy.steps} expanded={expandedStep} onToggle={handleToggleStep} />
                </div>
              </div>
            </motion.div>
          )}

          {activeDetailTab === 'checks' && (
            <motion.div
              key="checks"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              {checks.length > 0 ? (
                <PostChecksPanel checks={checks} deployStatus={deploy.status} onRunChecks={handleRunChecks} />
              ) : (
                <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-12 text-center">
                  <Shield size={32} className="mx-auto mb-3 text-[#d1d1d1] dark:text-[#4d4d4d]" />
                  <p className="text-sm text-[#616161] dark:text-[#8a8a8a]">No post-deploy checks available for this deployment</p>
                  <p className="text-xs text-[#b9bbbe] dark:text-[#6d6f78] mt-1">Checks are available when the pipeline reaches the production stage</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Deployment Row ───

function DeploymentRow({ deploy, onClick }: { deploy: Deployment; onClick: () => void }) {
  const envCfg = envColors[deploy.environment];
  const completedSteps = deploy.steps.filter(s => s.status === 'success').length;
  const totalSteps = deploy.steps.filter(s => s.status !== 'skipped').length;

  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] border-b border-[#f0f0f0] dark:border-[#2d2d2d] last:border-b-0 group"
      whileHover={{ x: 2 }}
    >
      {/* Status icon */}
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
        deploy.status === 'success' ? 'bg-[#edf7f0] dark:bg-[#237b4b]/15' :
        deploy.status === 'running' ? 'bg-[#ecf5fe] dark:bg-[#0078d4]/15' :
        deploy.status === 'failed' ? 'bg-[#fdf0f2] dark:bg-[#c4314b]/15' :
        'bg-[#f0f0f0] dark:bg-[#3d3d3d]'
      )}>
        {deploy.status === 'success' && <CheckCircle2 size={18} className="text-[#237b4b] dark:text-[#57ab5a]" />}
        {deploy.status === 'running' && <RefreshCw size={18} className="text-[#0078d4] dark:text-[#6cb8f6] animate-spin" />}
        {deploy.status === 'failed' && <XCircle size={18} className="text-[#c4314b] dark:text-[#f47067]" />}
        {deploy.status === 'pending' && <Clock size={18} className="text-[#8a8a8a]" />}
      </div>

      {/* Service + version */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#242424] dark:text-[#f0f0f0] truncate">{deploy.service}</span>
          <span className="text-sm font-mono text-[#5b5fc7] dark:text-[#a6a9dc]">{deploy.version}</span>
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', envCfg.bg, envCfg.color)}>
            {envCfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-[#8a8a8a] dark:text-[#6d6f78]">
          <span className="flex items-center gap-1"><GitBranch size={10} />{deploy.branch}</span>
          <span className="truncate max-w-[280px]">{deploy.commitMessage}</span>
        </div>
      </div>

      {/* Pipeline mini progress */}
      <div className="hidden xl:flex items-center gap-1.5 shrink-0">
        {deploy.steps.map(step => (
          <div
            key={step.id}
            className={cn(
              'w-5 h-1.5 rounded-full transition-all',
              step.status === 'success' ? 'bg-[#237b4b]' :
              step.status === 'running' ? 'bg-[#0078d4] animate-pulse' :
              step.status === 'failed' ? 'bg-[#c4314b]' :
              step.status === 'skipped' ? 'bg-[#e1dfdd] dark:bg-[#3d3d3d]' :
              'bg-[#e1dfdd] dark:bg-[#4d4d4d]'
            )}
            title={`${step.name}: ${step.status}`}
          />
        ))}
      </div>

      {/* Meta */}
      <div className="text-right shrink-0 hidden sm:block">
        <StatusBadge status={deploy.status} />
        <div className="text-xs text-[#8a8a8a] dark:text-[#6d6f78] mt-1.5">
          {deploy.triggeredBy} · {new Date(deploy.triggeredAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
        </div>
      </div>

      <ChevronRight size={16} className="text-[#d1d1d1] dark:text-[#4d4d4d] shrink-0 group-hover:text-[#5b5fc7] dark:group-hover:text-[#a6a9dc] transition-colors" />
    </motion.button>
  );
}

// ─── Main Component ───

export function ReleaseManagementApp() {
  const [selectedDeploy, setSelectedDeploy] = useState<Deployment | null>(null);
  const [filterStatus, setFilterStatus] = useState<DeployStatus | 'all'>('all');
  const [filterService, setFilterService] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const services = useMemo(() =>
    [...new Set(mockDeployments.map(d => d.service))].sort(),
    []
  );

  const filtered = useMemo(() => {
    return mockDeployments.filter(d => {
      if (filterStatus !== 'all' && d.status !== filterStatus) return false;
      if (filterService !== 'all' && d.service !== filterService) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return d.version.toLowerCase().includes(q) ||
          d.service.toLowerCase().includes(q) ||
          d.commitMessage.toLowerCase().includes(q) ||
          d.commit.toLowerCase().includes(q) ||
          d.triggeredBy.toLowerCase().includes(q);
      }
      return true;
    });
  }, [filterStatus, filterService, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    total: mockDeployments.length,
    success: mockDeployments.filter(d => d.status === 'success').length,
    running: mockDeployments.filter(d => d.status === 'running').length,
    failed: mockDeployments.filter(d => d.status === 'failed').length,
  }), []);

  if (selectedDeploy) {
    return <DeploymentDetail deploy={selectedDeploy} onBack={() => setSelectedDeploy(null)} />;
  }

  return (
    <div className="h-full flex flex-col -m-6">
      {/* Header */}
      <div className="shrink-0 px-6 py-5 bg-white dark:bg-[#252525] border-b border-[#e1dfdd] dark:border-[#3d3d3d]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5b5fc7] to-[#8764b8] flex items-center justify-center">
              <Rocket size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#242424] dark:text-[#f0f0f0]">Release Management</h1>
              <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78]">Deploy pipeline &amp; production releases</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#5b5fc7] hover:bg-[#4b4fb7] text-white rounded-lg text-sm font-medium transition-colors">
            <Rocket size={14} />
            New Deploy
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-[#242424] dark:text-[#f0f0f0]', bg: 'bg-[#f5f5f5] dark:bg-[#2a2a2a]' },
            { label: 'Deployed', value: stats.success, color: 'text-[#237b4b] dark:text-[#57ab5a]', bg: 'bg-[#edf7f0] dark:bg-[#237b4b]/10' },
            { label: 'In Progress', value: stats.running, color: 'text-[#0078d4] dark:text-[#6cb8f6]', bg: 'bg-[#ecf5fe] dark:bg-[#0078d4]/10' },
            { label: 'Failed', value: stats.failed, color: 'text-[#c4314b] dark:text-[#f47067]', bg: 'bg-[#fdf0f2] dark:bg-[#c4314b]/10' },
          ].map(stat => (
            <div key={stat.label} className={cn('rounded-xl px-4 py-3', stat.bg)}>
              <div className={cn('text-xl font-semibold', stat.color)}>{stat.value}</div>
              <div className="text-xs text-[#8a8a8a] dark:text-[#6d6f78]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b9bbbe]" />
            <input
              type="text"
              placeholder="Search deployments..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#f5f5f5] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] text-sm text-[#242424] dark:text-[#f0f0f0] placeholder-[#b9bbbe] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/30 focus:border-[#5b5fc7]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as DeployStatus | 'all')}
            className="px-3 py-2 rounded-lg bg-[#f5f5f5] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] text-sm text-[#242424] dark:text-[#f0f0f0] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/30"
          >
            <option value="all">All Status</option>
            <option value="success">Deployed</option>
            <option value="running">In Progress</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={filterService}
            onChange={e => setFilterService(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#f5f5f5] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] text-sm text-[#242424] dark:text-[#f0f0f0] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/30"
          >
            <option value="all">All Services</option>
            {services.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Deploy List */}
      <div className="flex-1 overflow-y-auto scrollbar-on-hover">
        <div className="bg-white dark:bg-[#252525]">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Rocket size={32} className="mx-auto mb-3 text-[#d1d1d1] dark:text-[#4d4d4d]" />
              <p className="text-sm text-[#616161] dark:text-[#8a8a8a]">No deployments match your filters</p>
            </div>
          ) : (
            filtered.map(deploy => (
              <DeploymentRow
                key={deploy.id}
                deploy={deploy}
                onClick={() => setSelectedDeploy(deploy)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
