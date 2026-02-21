import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AlertTriangle, ChevronDown, Clock, Users, Zap, Activity,
  CheckCircle2, XCircle, AlertCircle, ArrowDown, ArrowUp,
  Send, Paperclip, ImageIcon, ChevronRight, Play, Pause,
  BookOpen, Lightbulb, MessageSquare, Timer, Shield, Radio,
  Circle, Minus, ExternalLink, RotateCcw, Eye, User,
  Hash, Bot, Code2, FileText, ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";
import { MarkdownContent } from '@/components/ui';

// ─── Types ───

type Severity = 'P1' | 'P2' | 'P3' | 'P4';
type IncidentStatus = 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';
type ServiceHealth = 'HEALTHY' | 'RECOVERING' | 'WARNING' | 'DOWN';

interface ServiceNode {
  name: string;
  status: ServiceHealth;
}

interface TimelineEvent {
  time: string;
  icon: 'alert' | 'check' | 'error' | 'info' | 'action' | 'person' | 'rollback' | 'pager';
  text: string;
  highlight?: boolean;
}

interface ChatMessage {
  id: string;
  user: string;
  initials: string;
  color: string;
  time: string;
  content: string;
  isBot?: boolean;
  isCode?: boolean;
}

interface IncidentChannel {
  id: string;
  name: string;
  label: string;
  hasActivity?: boolean;
  messages: ChatMessage[];
}

interface Incident {
  id: string;
  code: string;
  severity: Severity;
  status: IncidentStatus;
  title: string;
  startTime: string;
  durationSeconds: number;
  affectedServices: string[];
  affectedUsersLabel: string;
  respondersCount: number;
  actionsCount: number;
  affectedCount: string;
  metrics: {
    errorRate: { value: string; change: string; direction: 'up' | 'down'; trend: number[] };
    latency: { value: string; change: string; direction: 'up' | 'down'; trend: number[] };
    ordersPerMin: { value: string; change: string; direction: 'up' | 'down' };
    activePods: { current: number; total: number; recovering: boolean };
  };
  serviceMap: ServiceNode[];
  timeline: TimelineEvent[];
  channels: IncidentChannel[];
  hypothesis: { status: 'CONFIRMED' | 'TESTING' | 'REJECTED'; text: string };
  runbook: { title: string; steps: string[] };
}

// ─── Mock Data ───

const mockIncidents: Incident[] = [
  {
    id: 'inc-1',
    code: 'INC-2026-0247',
    severity: 'P1',
    status: 'INVESTIGATING',
    title: 'Payment Service — Complete Outage',
    startTime: '14:02',
    durationSeconds: 3317,
    affectedServices: ['payment-api', 'stripe-webhook', 'order-service'],
    affectedUsersLabel: '~12,400 users unable to complete checkout',
    respondersCount: 5,
    actionsCount: 5,
    affectedCount: '12.4k',
    metrics: {
      errorRate: { value: '12.3%', change: '52.1%', direction: 'down', trend: [45, 62, 78, 85, 72, 58, 42, 35, 28, 22, 18, 15] },
      latency: { value: '1,240ms', change: '8,200', direction: 'down', trend: [1200, 3500, 6800, 8200, 7500, 5200, 3100, 2400, 1800, 1500, 1300, 1240] },
      ordersPerMin: { value: '89', change: '0', direction: 'up' },
      activePods: { current: 12, total: 12, recovering: false },
    },
    serviceMap: [
      { name: 'API Gateway', status: 'HEALTHY' },
      { name: 'payment-api', status: 'RECOVERING' },
      { name: 'stripe-webhook', status: 'RECOVERING' },
      { name: 'order-service', status: 'RECOVERING' },
      { name: 'user-service', status: 'HEALTHY' },
      { name: 'PostgreSQL', status: 'RECOVERING' },
      { name: 'Redis', status: 'HEALTHY' },
      { name: 'Kafka', status: 'WARNING' },
    ],
    timeline: [
      { time: '14:02', icon: 'alert', text: 'PagerDuty alert: payment-api 5xx rate > 50%' },
      { time: '14:03', icon: 'check', text: 'Marcus Johnson acknowledged alert' },
      { time: '14:05', icon: 'error', text: 'P1 declared — War room activated', highlight: true },
      { time: '14:06', icon: 'info', text: 'Slack channels created: #inc-247-command, #inc-247-technical' },
      { time: '14:07', icon: 'person', text: 'Sarah Chen joined as Incident Commander' },
      { time: '14:08', icon: 'action', text: 'IC: All hands on payment-api. Marcus, take point on investigation.' },
      { time: '14:12', icon: 'info', text: 'Marcus: Seeing connection pool exhaustion on payment-api pods. DB connections maxed.' },
      { time: '14:15', icon: 'pager', text: 'Paging Yuki Tanaka (Infrastructure SME) for DB investigation' },
      { time: '14:18', icon: 'info', text: "David: Status page updated — 'Investigating payment processing issues'" },
      { time: '14:22', icon: 'error', text: 'Yuki: RDS connection limit hit. Suspect connection leak from deploy v2.14.3 (deployed 13:45)' },
      { time: '14:25', icon: 'action', text: 'Hypothesis: Connection pool leak introduced in v2.14.3 payment-retry logic' },
      { time: '14:30', icon: 'action', text: 'IC: Approved rollback to v2.14.2. Marcus coordinating deployment.', highlight: true },
      { time: '14:35', icon: 'rollback', text: 'Rollback to v2.14.2 initiated across 12 pods' },
      { time: '14:42', icon: 'check', text: 'Rollback complete. DB connections draining.' },
    ],
    channels: [
      {
        id: 'command', name: 'command', label: 'Command',
        messages: [
          { id: 'c1', user: 'Sarah Chen', initials: 'SC', color: '#5b5fc7', time: '14:07', content: 'I\'m taking IC. Marcus on investigation, David on comms.' },
          { id: 'c2', user: 'Sarah Chen', initials: 'SC', color: '#5b5fc7', time: '14:30', content: 'Approved rollback to v2.14.2. Marcus, please coordinate.' },
          { id: 'c3', user: 'Marcus Johnson', initials: 'MJ', color: '#d4820c', time: '14:31', content: 'Copy. Initiating rollback across all 12 pods now.' },
        ],
      },
      {
        id: 'technical', name: 'technical', label: 'Technical', hasActivity: true,
        messages: [
          { id: 't1', user: 'Marcus Johnson', initials: 'MJ', color: '#d4820c', time: '14:11', content: '187 idle-in-transaction connections. Something is opening connections and never closing them.' },
          { id: 't2', user: 'Yuki Tanaka', initials: 'YT', color: '#237b4b', time: '14:22', isBot: true, content: 'Found it in the diff:\n```java\n// v2.14.3 PaymentRetryHandler.java L142\nConnection conn = pool.getConnection();\ntry {\n  retryPayment(conn, order);\n} catch (TimeoutException e) {\n  log.warn("Retry timed out");\n  // BUG: conn never released on timeout!\n}\n```' },
          { id: 't3', user: 'Marcus Johnson', initials: 'MJ', color: '#d4820c', time: '14:24', content: 'Classic. Missing finally block. Under load this bleeds connections fast. Rollback is the right call.' },
          { id: 't4', user: 'Yuki Tanaka', initials: 'YT', color: '#237b4b', time: '14:38', content: 'Post-rollback metrics: • Connections: 188 → 165 → 142 (draining ~5/min) • 5xx: 52% → 28% → 12% • Orders/min: 0 → 34 → 89' },
        ],
      },
      {
        id: 'comms', name: 'comms', label: 'Comms',
        messages: [
          { id: 'cm1', user: 'David Park', initials: 'DP', color: '#8764b8', time: '14:18', content: 'Status page updated: "Investigating payment processing issues"' },
          { id: 'cm2', user: 'David Park', initials: 'DP', color: '#8764b8', time: '14:35', content: 'Updated status: "Fix identified and deployed. Monitoring recovery."' },
        ],
      },
      {
        id: 'timeline', name: 'timeline', label: 'Timeline',
        messages: [
          { id: 'tl1', user: 'System', initials: 'SY', color: '#616161', time: '14:02', content: 'Incident INC-2026-0247 created. Severity: P1.' },
          { id: 'tl2', user: 'System', initials: 'SY', color: '#616161', time: '14:05', content: 'War room activated. Channels provisioned.' },
          { id: 'tl3', user: 'System', initials: 'SY', color: '#616161', time: '14:35', content: 'Rollback deployment initiated.' },
        ],
      },
    ],
    hypothesis: { status: 'CONFIRMED', text: 'Connection pool leak in **v2.14.3** payment-retry logic. New retry opens DB connections without releasing on timeout.' },
    runbook: {
      title: 'Payment Outage Recovery',
      steps: ['Confirm alert & assess severity', 'Activate war room', 'Check recent deploys', 'Identify root cause', 'Rollback or hotfix', 'Monitor recovery', 'Post-incident review'],
    },
  },
  {
    id: 'inc-2',
    code: 'INC-2026-0248',
    severity: 'P2',
    status: 'MONITORING',
    title: 'Search Index — Degraded Results',
    startTime: '11:30',
    durationSeconds: 12600,
    affectedServices: ['search-api', 'elasticsearch'],
    affectedUsersLabel: '~3,200 users experiencing slow or empty search results',
    respondersCount: 3,
    actionsCount: 4,
    affectedCount: '3.2k',
    metrics: {
      errorRate: { value: '2.1%', change: '8.5%', direction: 'down', trend: [8, 12, 18, 15, 10, 6, 4, 3, 2.5, 2.1] },
      latency: { value: '890ms', change: '3,400', direction: 'down', trend: [800, 1200, 2400, 3400, 2800, 1900, 1200, 950, 900, 890] },
      ordersPerMin: { value: '245', change: '12', direction: 'up' },
      activePods: { current: 8, total: 8, recovering: false },
    },
    serviceMap: [
      { name: 'API Gateway', status: 'HEALTHY' },
      { name: 'search-api', status: 'RECOVERING' },
      { name: 'elasticsearch', status: 'RECOVERING' },
      { name: 'user-service', status: 'HEALTHY' },
      { name: 'Redis', status: 'HEALTHY' },
    ],
    timeline: [
      { time: '11:30', icon: 'alert', text: 'Alert: search-api p95 latency > 2000ms' },
      { time: '11:32', icon: 'check', text: 'Alex Kim acknowledged alert' },
      { time: '11:35', icon: 'info', text: 'ES cluster showing high CPU on 2 of 5 nodes' },
      { time: '11:45', icon: 'action', text: 'Identified: large reindex job consuming cluster resources' },
      { time: '12:00', icon: 'action', text: 'Throttled reindex job, added resource limits', highlight: true },
      { time: '12:15', icon: 'check', text: 'Latency returning to normal' },
    ],
    channels: [
      {
        id: 'command', name: 'command', label: 'Command',
        messages: [
          { id: 's-c1', user: 'Alex Kim', initials: 'AK', color: '#0078d4', time: '11:35', content: 'Taking IC. ES cluster under pressure from reindex job.' },
        ],
      },
      {
        id: 'technical', name: 'technical', label: 'Technical', hasActivity: true,
        messages: [
          { id: 's-t1', user: 'Alex Kim', initials: 'AK', color: '#0078d4', time: '11:40', content: 'Nodes es-prod-3 and es-prod-5 at 95% CPU. Reindex consuming all I/O budget.' },
          { id: 's-t2', user: 'Lisa Wang', initials: 'LW', color: '#c4314b', time: '11:50', content: 'Throttling the reindex to 5 docs/sec. Should free resources within 15 min.' },
        ],
      },
    ],
    hypothesis: { status: 'CONFIRMED', text: 'Unbounded reindex job saturating ES cluster CPU and I/O on 2 of 5 nodes.' },
    runbook: {
      title: 'Search Degradation Recovery',
      steps: ['Check ES cluster health', 'Identify heavy operations', 'Throttle or cancel job', 'Monitor recovery', 'Add resource guards'],
    },
  },
  {
    id: 'inc-3',
    code: 'INC-2026-0245',
    severity: 'P3',
    status: 'RESOLVED',
    title: 'Email Notifications — Delayed Delivery',
    startTime: '09:15',
    durationSeconds: 7200,
    affectedServices: ['notification-service', 'ses-gateway'],
    affectedUsersLabel: '~800 users experiencing delayed email notifications',
    respondersCount: 2,
    actionsCount: 3,
    affectedCount: '800',
    metrics: {
      errorRate: { value: '0.3%', change: '4.2%', direction: 'down', trend: [4, 6, 8, 6, 3, 1, 0.5, 0.3] },
      latency: { value: '120ms', change: '450', direction: 'down', trend: [100, 200, 350, 450, 300, 180, 140, 120] },
      ordersPerMin: { value: '520', change: '5', direction: 'up' },
      activePods: { current: 4, total: 4, recovering: false },
    },
    serviceMap: [
      { name: 'notification-service', status: 'HEALTHY' },
      { name: 'ses-gateway', status: 'HEALTHY' },
      { name: 'Kafka', status: 'HEALTHY' },
      { name: 'Redis', status: 'HEALTHY' },
    ],
    timeline: [
      { time: '09:15', icon: 'alert', text: 'SES bounce rate alert triggered' },
      { time: '09:20', icon: 'check', text: 'Tom Lee acknowledged' },
      { time: '09:30', icon: 'info', text: 'SES sending rate throttled by AWS' },
      { time: '09:45', icon: 'action', text: 'Requested SES limit increase', highlight: true },
      { time: '10:15', icon: 'check', text: 'AWS approved limit increase' },
      { time: '10:30', icon: 'check', text: 'Queue drained, delivery normalized' },
      { time: '11:15', icon: 'check', text: 'Incident resolved' },
    ],
    channels: [
      {
        id: 'command', name: 'command', label: 'Command',
        messages: [
          { id: 'e-c1', user: 'Tom Lee', initials: 'TL', color: '#237b4b', time: '09:20', content: 'Taking lead. SES rate limit issue.' },
        ],
      },
      {
        id: 'technical', name: 'technical', label: 'Technical',
        messages: [
          { id: 'e-t1', user: 'Tom Lee', initials: 'TL', color: '#237b4b', time: '09:35', content: 'We hit the SES sending limit. Queue backing up. Requesting increase from AWS.' },
        ],
      },
    ],
    hypothesis: { status: 'CONFIRMED', text: 'SES sending rate limit reached due to marketing campaign blast overlapping with transactional emails.' },
    runbook: {
      title: 'Email Delivery Recovery',
      steps: ['Check SES metrics', 'Identify rate limit', 'Request limit increase', 'Monitor queue drain'],
    },
  },
];

// ─── Helpers ───

const severityConfig: Record<Severity, { bg: string; text: string; border: string }> = {
  P1: { bg: 'bg-[#c4314b]', text: 'text-white', border: 'border-[#c4314b]' },
  P2: { bg: 'bg-[#d4820c]', text: 'text-white', border: 'border-[#d4820c]' },
  P3: { bg: 'bg-[#0078d4]', text: 'text-white', border: 'border-[#0078d4]' },
  P4: { bg: 'bg-[#616161]', text: 'text-white', border: 'border-[#616161]' },
};

const statusConfig: Record<IncidentStatus, { bg: string; text: string; label: string }> = {
  INVESTIGATING: { bg: 'bg-[#fef7ec] dark:bg-[#d4820c]/20', text: 'text-[#d4820c] dark:text-[#f0b850]', label: 'INVESTIGATING' },
  IDENTIFIED: { bg: 'bg-[#ecf5fe] dark:bg-[#0078d4]/20', text: 'text-[#0078d4] dark:text-[#6cb8f6]', label: 'IDENTIFIED' },
  MONITORING: { bg: 'bg-[#edf7f0] dark:bg-[#237b4b]/20', text: 'text-[#237b4b] dark:text-[#57ab5a]', label: 'MONITORING' },
  RESOLVED: { bg: 'bg-[#edf7f0] dark:bg-[#237b4b]/20', text: 'text-[#237b4b] dark:text-[#57ab5a]', label: 'RESOLVED' },
};

const healthColors: Record<ServiceHealth, { bg: string; text: string; border: string }> = {
  HEALTHY: { bg: 'bg-[#edf7f0] dark:bg-[#237b4b]/20', text: 'text-[#237b4b] dark:text-[#57ab5a]', border: 'border-[#237b4b]/20 dark:border-[#237b4b]/40' },
  RECOVERING: { bg: 'bg-[#fef7ec] dark:bg-[#d4820c]/20', text: 'text-[#d4820c] dark:text-[#f0b850]', border: 'border-[#d4820c]/20 dark:border-[#d4820c]/40' },
  WARNING: { bg: 'bg-[#fef7ec] dark:bg-[#d4820c]/20', text: 'text-[#d4820c] dark:text-[#f0b850]', border: 'border-[#d4820c]/20 dark:border-[#d4820c]/40' },
  DOWN: { bg: 'bg-[#fdf0f2] dark:bg-[#c4314b]/20', text: 'text-[#c4314b] dark:text-[#f47067]', border: 'border-[#c4314b]/20 dark:border-[#c4314b]/40' },
};

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600).toString().padStart(2, '0');
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function TimelineIcon({ type }: { type: TimelineEvent['icon'] }) {
  switch (type) {
    case 'alert': return <AlertTriangle size={12} className="text-[#d4820c] dark:text-[#f97316]" />;
    case 'check': return <CheckCircle2 size={12} className="text-[#237b4b] dark:text-[#57ab5a]" />;
    case 'error': return <XCircle size={12} className="text-[#c4314b] dark:text-[#f47067]" />;
    case 'info': return <AlertCircle size={12} className="text-[#0078d4] dark:text-[#6cb8f6]" />;
    case 'action': return <Play size={12} className="text-[#d4820c] dark:text-[#f0b850]" />;
    case 'person': return <User size={12} className="text-[#8764b8] dark:text-[#c49ded]" />;
    case 'rollback': return <RotateCcw size={12} className="text-[#d4820c] dark:text-[#f0b850]" />;
    case 'pager': return <Radio size={12} className="text-[#d4820c] dark:text-[#f97316]" />;
  }
}

// ─── Sparkline ───

function Sparkline({ data, color, height = 32 }: { data: number[]; color: string; height?: number }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Responder Avatars ───

const responderColors = ['#5b5fc7', '#d4820c', '#8764b8', '#c4314b', '#237b4b', '#0078d4'];
const responderInitials = ['SC', 'MJ', 'PP', 'DK', 'AR', 'YT', 'EW'];

function ResponderAvatars({ count }: { count: number }) {
  const shown = Math.min(count, 7);
  return (
    <div className="flex -space-x-1.5">
      {Array.from({ length: shown }).map((_, i) => (
        <div
          key={i}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-white dark:border-[#252525]"
          style={{ backgroundColor: responderColors[i % responderColors.length] }}
        >
          {responderInitials[i]}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───

export function WarRoom() {
  const [selectedIncidentId, setSelectedIncidentId] = useState(mockIncidents[0].id);
  const [showIncidentPicker, setShowIncidentPicker] = useState(false);
  const [activeTimelineTab, setActiveTimelineTab] = useState<'timeline' | 'actions'>('timeline');
  const [activeChatChannel, setActiveChatChannel] = useState('technical');
  const [chatInput, setChatInput] = useState('');
  const [duration, setDuration] = useState(mockIncidents[0].durationSeconds);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const incident = mockIncidents.find(i => i.id === selectedIncidentId) || mockIncidents[0];
  const channel = incident.channels.find(c => c.id === activeChatChannel) || incident.channels[0];

  // Duration timer
  useEffect(() => {
    if (incident.status === 'RESOLVED') return;
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, [incident.status, selectedIncidentId]);

  // Reset duration on incident switch
  useEffect(() => {
    setDuration(incident.durationSeconds);
    setActiveChatChannel(incident.channels.find(c => c.hasActivity)?.id || incident.channels[0]?.id || 'command');
  }, [selectedIncidentId]);

  // Auto-scroll chat
  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [activeChatChannel]);

  // Close picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowIncidentPicker(false);
    }
    if (showIncidentPicker) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showIncidentPicker]);

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    // Mock - in real app this would send to backend
    setChatInput('');
  }, [chatInput]);

  const sev = severityConfig[incident.severity];
  const stat = statusConfig[incident.status];

  const slashCommands = ['/status', '/page', '/runbook', '/escalate'];

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f8] dark:bg-[#1f1f1f] text-[#242424] dark:text-[#e0e0e0] overflow-hidden">
      {/* ─── Incident Header ─── */}
      <div className="shrink-0 border-b border-[#e1dfdd] dark:border-[#3d3d3d]">
        {/* Top row */}
        <div className="px-4 py-3 flex items-center gap-3 bg-white dark:bg-[#252525]">
          {/* Severity badge */}
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-black shrink-0', sev.bg, sev.text)}>
            {incident.severity}
          </div>

          {/* Incident info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[12px] text-[#8a8a8a] dark:text-[#8a8d9e] font-mono">{incident.code}</span>
              <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold tracking-wider', stat.bg, stat.text)}>
                {stat.label}
              </span>
            </div>
            <h1 className="text-[16px] font-bold text-[#242424] dark:text-[#f0f0f0] truncate">{incident.title}</h1>
          </div>

          {/* Incident switcher */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowIncidentPicker(!showIncidentPicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f5f5f5] dark:bg-[#2a2a2a] border border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/40 text-[11px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:text-[#242424] dark:hover:text-[#f0f0f0] transition-all"
            >
              <Radio size={12} />
              Switch Incident
              <ChevronDown size={12} />
            </button>
            <AnimatePresence>
              {showIncidentPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-[360px] bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-[#e1dfdd] dark:border-[#3d3d3d]">
                    <span className="text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">Active Incidents</span>
                  </div>
                  {mockIncidents.map(inc => {
                    const s = severityConfig[inc.severity];
                    const st = statusConfig[inc.status];
                    return (
                      <button
                        key={inc.id}
                        onClick={() => { setSelectedIncidentId(inc.id); setShowIncidentPicker(false); }}
                        className={cn(
                          'w-full px-3 py-2.5 flex items-center gap-2.5 text-left transition-colors',
                          inc.id === selectedIncidentId
                            ? 'bg-[#eeeef8] dark:bg-[#5b5fc7]/10 border-l-2 border-l-[#5b5fc7]'
                            : 'hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] border-l-2 border-l-transparent'
                        )}
                      >
                        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0', s.bg, s.text)}>
                          {inc.severity}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-[#242424] dark:text-[#f0f0f0] truncate">{inc.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] font-mono">{inc.code}</span>
                            <span className={cn('text-[9px] font-bold', st.text)}>{st.label}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">{inc.affectedCount} affected</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Key stats */}
          <div className="flex items-center gap-5 shrink-0 ml-2">
            <div className="text-center">
              <p className="text-[9px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">Duration</p>
              <p className="text-[20px] font-mono font-bold text-[#d4820c] dark:text-[#fbbf24] tabular-nums">{formatDuration(duration)}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">Responders</p>
              <p className="text-[20px] font-bold text-[#242424] dark:text-[#f0f0f0]">{incident.respondersCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">Actions</p>
              <p className="text-[20px] font-bold text-[#242424] dark:text-[#f0f0f0]">{incident.actionsCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">Affected</p>
              <p className="text-[20px] font-bold text-[#c4314b] dark:text-[#f47067]">{incident.affectedCount}</p>
            </div>
          </div>
        </div>

        {/* Affected services row */}
        <div className="px-4 pb-2.5 pt-1.5 flex items-center gap-2 bg-white dark:bg-[#252525]">
          <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider font-semibold shrink-0">Affected:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {incident.affectedServices.map(svc => (
              <span key={svc} className="px-2 py-0.5 rounded bg-[#fdf0f2] dark:bg-[#c4314b]/20 text-[#c4314b] dark:text-[#f47067] text-[11px] font-medium border border-[#c4314b]/20 dark:border-[#c4314b]/30">
                {svc}
              </span>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-[#616161] dark:text-[#b9bbbe]">
            <AlertCircle size={12} className="text-[#8a8a8a] dark:text-[#6d6f78]" />
            <span>{incident.affectedUsersLabel}</span>
          </div>
        </div>
      </div>

      {/* ─── Three-column body ─── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ─── LEFT: Timeline ─── */}
        <div className="w-[280px] shrink-0 border-r border-[#e1dfdd] dark:border-[#3d3d3d] flex flex-col bg-white dark:bg-[#252525]">
          {/* Tabs */}
          <div className="shrink-0 flex border-b border-[#e1dfdd] dark:border-[#3d3d3d]">
            {(['timeline', 'actions'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTimelineTab(tab)}
                className={cn(
                  'flex-1 py-2.5 text-[12px] font-semibold uppercase tracking-wider transition-colors border-b-2',
                  activeTimelineTab === tab
                    ? 'text-[#5b5fc7] dark:text-[#a6a9dc] border-[#5b5fc7]'
                    : 'text-[#8a8a8a] dark:text-[#6d6f78] border-transparent hover:text-[#616161] dark:hover:text-[#b9bbbe]'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Timeline list */}
          <div className="flex-1 overflow-y-auto scrollbar-on-hover">
            {activeTimelineTab === 'timeline' && (
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[22px] top-0 bottom-0 w-px bg-[#e1dfdd] dark:bg-[#3d3d3d]" />
                {incident.timeline.map((evt, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex gap-2 px-3 py-2 relative',
                      evt.highlight && 'bg-[#eeeef8] dark:bg-[#5b5fc7]/5 border-l-2 border-l-[#5b5fc7]'
                    )}
                  >
                    <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] font-mono w-[36px] shrink-0 pt-0.5">{evt.time}</span>
                    <div className="w-5 h-5 rounded-full bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d] flex items-center justify-center shrink-0 z-10">
                      <TimelineIcon type={evt.icon} />
                    </div>
                    <p className="text-[11px] text-[#616161] dark:text-[#b9bbbe] leading-relaxed flex-1">{evt.text}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTimelineTab === 'actions' && (
              <div className="p-3 space-y-2">
                {incident.timeline
                  .filter(e => e.icon === 'action' || e.highlight)
                  .map((evt, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#f5f5f5] dark:bg-[#2a2a2a] border border-[#e1dfdd] dark:border-[#3d3d3d]">
                      <div className="flex items-center gap-2 mb-1">
                        <Play size={10} className="text-[#d4820c] dark:text-[#f0b850]" />
                        <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] font-mono">{evt.time}</span>
                      </div>
                      <p className="text-[11px] text-[#616161] dark:text-[#b9bbbe]">{evt.text}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── CENTER: Metrics + Service Map + Hypothesis/Runbook ─── */}
        <div className="flex-1 overflow-y-auto border-r border-[#e1dfdd] dark:border-[#3d3d3d]">
          <div className="p-3 space-y-3">
            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* 5XX Error Rate */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider font-semibold">5xx Error Rate</span>
                  <div className="w-2 h-2 rounded-full bg-[#d4820c] animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[24px] font-bold text-[#242424] dark:text-[#f0f0f0] tabular-nums">{incident.metrics.errorRate.value}</span>
                  <div className="flex items-center gap-0.5">
                    <ArrowDown size={10} className="text-[#237b4b] dark:text-[#57ab5a]" />
                    <span className="text-[11px] text-[#237b4b] dark:text-[#57ab5a]">{incident.metrics.errorRate.change}</span>
                  </div>
                </div>
                <div className="mt-1.5 h-[32px]">
                  <Sparkline data={incident.metrics.errorRate.trend} color="#d4820c" />
                </div>
              </div>

              {/* P95 Latency */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider font-semibold">P95 Latency</span>
                  <div className="w-2 h-2 rounded-full bg-[#d4820c] animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[24px] font-bold text-[#242424] dark:text-[#f0f0f0] tabular-nums">{incident.metrics.latency.value}</span>
                  <div className="flex items-center gap-0.5">
                    <ArrowDown size={10} className="text-[#237b4b] dark:text-[#57ab5a]" />
                    <span className="text-[11px] text-[#237b4b] dark:text-[#57ab5a]">{incident.metrics.latency.change}</span>
                  </div>
                </div>
                <div className="mt-1.5 h-[32px]">
                  <Sparkline data={incident.metrics.latency.trend} color="#0078d4" />
                </div>
              </div>

              {/* Orders/Min */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider font-semibold">Orders/Min</span>
                  <Activity size={12} className="text-[#237b4b] dark:text-[#57ab5a]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[24px] font-bold text-[#242424] dark:text-[#f0f0f0] tabular-nums">{incident.metrics.ordersPerMin.value}</span>
                  <div className="flex items-center gap-0.5">
                    <ArrowUp size={10} className="text-[#237b4b] dark:text-[#57ab5a]" />
                    <span className="text-[11px] text-[#237b4b] dark:text-[#57ab5a]">{incident.metrics.ordersPerMin.change}</span>
                  </div>
                </div>
              </div>

              {/* Active Pods */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider font-semibold">Active Pods</span>
                  <Shield size={12} className="text-[#237b4b] dark:text-[#57ab5a]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[24px] font-bold text-[#242424] dark:text-[#f0f0f0] tabular-nums">
                    {incident.metrics.activePods.current}/{incident.metrics.activePods.total}
                  </span>
                  {incident.metrics.activePods.recovering && (
                    <span className="text-[10px] text-[#d4820c] dark:text-[#f0b850]">recovering</span>
                  )}
                  {!incident.metrics.activePods.recovering && incident.metrics.activePods.current === incident.metrics.activePods.total && (
                    <span className="text-[10px] text-[#237b4b] dark:text-[#57ab5a]">all healthy</span>
                  )}
                </div>
              </div>
            </div>

            {/* Service Map */}
            <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-3">
              <h3 className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider font-semibold mb-3">Service Map</h3>
              <div className="flex flex-wrap gap-2">
                {incident.serviceMap.map(svc => {
                  const h = healthColors[svc.status];
                  return (
                    <div
                      key={svc.name}
                      className={cn('px-3 py-2 rounded-lg border flex flex-col items-center gap-1 min-w-[100px]', h.bg, h.border)}
                    >
                      <span className="text-[11px] font-medium text-[#242424] dark:text-[#f0f0f0]">{svc.name}</span>
                      <span className={cn('text-[9px] font-bold uppercase tracking-wider', h.text)}>{svc.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hypothesis + Runbook */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Hypothesis */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-3">
                <h3 className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider font-semibold mb-2">Hypothesis</h3>
                <div className="flex items-start gap-2">
                  <div className={cn(
                    'shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mt-0.5',
                    incident.hypothesis.status === 'CONFIRMED' && 'bg-[#edf7f0] dark:bg-[#237b4b]/20 text-[#237b4b] dark:text-[#57ab5a]',
                    incident.hypothesis.status === 'TESTING' && 'bg-[#fef7ec] dark:bg-[#d4820c]/20 text-[#d4820c] dark:text-[#f0b850]',
                    incident.hypothesis.status === 'REJECTED' && 'bg-[#fdf0f2] dark:bg-[#c4314b]/20 text-[#c4314b] dark:text-[#f47067]',
                  )}>
                    <div className="flex items-center gap-1">
                      <Lightbulb size={9} />
                      {incident.hypothesis.status}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-[#616161] dark:text-[#b9bbbe] leading-relaxed">
                  <MarkdownContent content={incident.hypothesis.text} />
                </div>
              </div>

              {/* Runbook */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-3">
                <h3 className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider font-semibold mb-2">Runbook</h3>
                <div className="flex items-center gap-1.5 mb-2">
                  <BookOpen size={12} className="text-[#0078d4] dark:text-[#6cb8f6]" />
                  <span className="text-[12px] font-medium text-[#0078d4] dark:text-[#6cb8f6]">{incident.runbook.title}</span>
                </div>
                <div className="space-y-1.5">
                  {incident.runbook.steps.map((step, i) => {
                    const completed = i <= 3; // mock progress
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <div className={cn(
                          'w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-px border',
                          completed
                            ? 'bg-[#edf7f0] dark:bg-[#237b4b]/30 border-[#237b4b]/30 dark:border-[#57ab5a]/40'
                            : 'bg-transparent border-[#d1d1d1] dark:border-[#5a5a5a]'
                        )}>
                          {completed ? (
                            <CheckCircle2 size={10} className="text-[#237b4b] dark:text-[#57ab5a]" />
                          ) : (
                            <Circle size={8} className="text-[#d1d1d1] dark:text-[#5a5a5a]" />
                          )}
                        </div>
                        <span className={cn(
                          'text-[11px]',
                          completed ? 'text-[#8a8a8a] dark:text-[#6d6f78] line-through' : 'text-[#616161] dark:text-[#b9bbbe]'
                        )}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Responders */}
            <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-3">
              <h3 className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider font-semibold mb-2">Responders</h3>
              <ResponderAvatars count={incident.respondersCount} />
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Chat Channels ─── */}
        <div className="w-[360px] shrink-0 flex flex-col bg-white dark:bg-[#252525]">
          {/* Channel tabs */}
          <div className="shrink-0 flex items-center gap-0 px-1 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#252525]">
            {incident.channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChatChannel(ch.id)}
                className={cn(
                  'px-3 py-2.5 text-[12px] font-medium transition-colors relative',
                  activeChatChannel === ch.id
                    ? 'text-[#5b5fc7] dark:text-[#a6a9dc]'
                    : 'text-[#8a8a8a] dark:text-[#6d6f78] hover:text-[#616161] dark:hover:text-[#b9bbbe]'
                )}
              >
                {ch.label}
                {ch.hasActivity && activeChatChannel !== ch.id && (
                  <div className="absolute top-2 right-1 w-2 h-2 rounded-full bg-[#237b4b] dark:bg-[#57ab5a]" />
                )}
                {activeChatChannel === ch.id && (
                  <motion.div
                    layoutId="chat-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5b5fc7]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Channel header */}
          <div className="shrink-0 px-4 py-2 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#252525]">
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
              <span className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0]">#inc-247-{channel?.name}</span>
              <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">·</span>
              <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">{channel?.messages.length} messages</span>
              <div className="ml-auto">
                <ResponderAvatars count={Math.min(incident.respondersCount, 4)} />
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {channel?.messages.map(msg => (
              <div key={msg.id} className="flex gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: msg.color }}
                >
                  {msg.isBot ? <Bot size={14} /> : msg.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{msg.user}</span>
                    <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">{msg.time}</span>
                    {msg.isBot && (
                      <span className="px-1.5 py-px rounded text-[8px] font-bold bg-[#eeeef8] dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc] uppercase">Bot</span>
                    )}
                  </div>
                  <div className="text-[13px] text-[#616161] dark:text-[#b9bbbe] leading-relaxed">
                    <MarkdownContent content={msg.content} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slash command buttons */}
          <div className="shrink-0 px-4 py-1.5 flex items-center gap-1.5 border-t border-[#e1dfdd] dark:border-[#3d3d3d]">
            {slashCommands.map(cmd => (
              <button
                key={cmd}
                onClick={() => setChatInput(cmd + ' ')}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#f0f0f0] dark:bg-[#2a2a2a] border border-[#e1dfdd] dark:border-[#3d3d3d] text-[#616161] dark:text-[#b9bbbe] hover:border-[#5b5fc7]/40 hover:text-[#242424] dark:hover:text-[#f0f0f0] transition-all"
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Chat input */}
          <div className="shrink-0 px-4 py-3 border-t border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#252525]">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
                  placeholder={`Message #inc-247-${channel?.name}...`}
                  className="w-full px-3 py-2 bg-white dark:bg-[#2a2a2a] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-[13px] text-[#242424] dark:text-[#f0f0f0] placeholder-[#b9bbbe] dark:placeholder-[#5a5a5a] focus:outline-none focus:ring-1 focus:ring-[#5b5fc7]/50 transition-all"
                />
              </div>
              <button className="p-2 rounded-lg text-[#8a8a8a] dark:text-[#6d6f78] hover:text-[#242424] dark:hover:text-[#f0f0f0] hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] transition-colors">
                <Paperclip size={16} />
              </button>
              <button className="p-2 rounded-lg text-[#8a8a8a] dark:text-[#6d6f78] hover:text-[#242424] dark:hover:text-[#f0f0f0] hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] transition-colors">
                <ImageIcon size={16} />
              </button>
              <button
                onClick={handleSendChat}
                className={cn(
                  'p-2 rounded-lg transition-all',
                  chatInput.trim()
                    ? 'bg-[#5b5fc7] text-white hover:bg-[#4a4eb5]'
                    : 'bg-[#f0f0f0] dark:bg-[#2a2a2a] text-[#b9bbbe] dark:text-[#5a5a5a]'
                )}
              >
                <ArrowUpRight size={16} />
              </button>
            </div>

            {/* Responders at bottom */}
            <div className="mt-2">
              <ResponderAvatars count={incident.respondersCount} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
