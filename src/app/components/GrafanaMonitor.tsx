import { useState, useMemo } from 'react';
import {
  Activity, AlertTriangle, CheckCircle2, Clock, RefreshCw,
  ChevronDown, Search, ExternalLink, Maximize2,
  Server, Cpu, HardDrive, Wifi, Database,
  TrendingUp, TrendingDown, ArrowUp, ArrowDown,
  MoreHorizontal, Eye, Bell, Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { cn } from "@/lib/utils";

// ─── Mock time-series data ───

function genSeries(base: number, variance: number, count = 24) {
  return Array.from({ length: count }, (_, i) => ({
    t: `${String(i).padStart(2, '0')}:00`,
    v: Math.max(0, base + (Math.random() - 0.5) * variance * 2 + Math.sin(i / 3) * variance * 0.5),
  }));
}

const cpuData = genSeries(42, 15);
const memData = genSeries(68, 8);
const netInData = genSeries(120, 40);
const netOutData = genSeries(85, 30);
const diskIOData = genSeries(35, 20);
const latencyData = genSeries(48, 25);
const requestsData = genSeries(2400, 800);
const errRateData = genSeries(0.8, 0.6);

const httpStatusData = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2, '0')}:00`,
  '2xx': 2200 + Math.random() * 400,
  '3xx': 120 + Math.random() * 60,
  '4xx': 30 + Math.random() * 40,
  '5xx': 2 + Math.random() * 8,
}));

const nodeData = [
  { name: 'node-prod-1', cpu: 38, mem: 72, disk: 45, status: 'healthy', pods: 24, region: 'us-east-1' },
  { name: 'node-prod-2', cpu: 52, mem: 81, disk: 38, status: 'healthy', pods: 18, region: 'us-east-1' },
  { name: 'node-prod-3', cpu: 84, mem: 92, disk: 67, status: 'warning', pods: 31, region: 'us-west-2' },
  { name: 'node-prod-4', cpu: 23, mem: 45, disk: 22, status: 'healthy', pods: 12, region: 'us-west-2' },
  { name: 'node-prod-5', cpu: 61, mem: 68, disk: 55, status: 'healthy', pods: 20, region: 'eu-west-1' },
  { name: 'node-staging', cpu: 15, mem: 32, disk: 18, status: 'healthy', pods: 8, region: 'us-east-1' },
];

const alerts = [
  { id: 'a1', title: 'CPU > 80% on node-prod-3', severity: 'warning', fired: '12 min ago', status: 'firing' },
  { id: 'a2', title: 'Memory > 90% on node-prod-3', severity: 'critical', fired: '8 min ago', status: 'firing' },
  { id: 'a3', title: 'Error rate > 2% on /api/checkout', severity: 'warning', fired: '45 min ago', status: 'resolved' },
  { id: 'a4', title: 'P95 latency > 500ms on payment-svc', severity: 'warning', fired: '2 hrs ago', status: 'resolved' },
];

const services = [
  { name: 'api-gateway', status: 'healthy', latency: 12, errorRate: 0.1, rps: 3400 },
  { name: 'user-service', status: 'healthy', latency: 45, errorRate: 2.3, rps: 1240 },
  { name: 'payment-service', status: 'degraded', latency: 890, errorRate: 4.1, rps: 340 },
  { name: 'product-service', status: 'healthy', latency: 32, errorRate: 0.2, rps: 2100 },
  { name: 'notification-svc', status: 'healthy', latency: 28, errorRate: 0.3, rps: 560 },
  { name: 'auth-service', status: 'healthy', latency: 85, errorRate: 1.1, rps: 890 },
];

// ─── Helpers ───

function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    healthy: 'bg-[#73BF69]',
    warning: 'bg-[#FF9830]',
    degraded: 'bg-[#FF5630]',
    critical: 'bg-[#FF4444]',
    firing: 'bg-[#FF4444] animate-pulse',
    resolved: 'bg-[#73BF69]',
  };
  return <span className={cn('w-2 h-2 rounded-full inline-block shrink-0', colorMap[status] || 'bg-gray-400')} />;
}

function GaugeBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden flex-1">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

// ─── Panel Component ───

function Panel({ title, children, className, span = 1 }: {
  title: string; children: React.ReactNode; className?: string; span?: number;
}) {
  return (
    <div className={cn(
      'bg-[#181B1F] border border-[#2a2d32] rounded-lg overflow-hidden flex flex-col',
      span === 2 && 'col-span-2',
      span === 3 && 'col-span-3',
      className,
    )}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2a2d32] bg-[#1a1d21]">
        <span className="text-[11px] font-medium text-[#d8d9da]">{title}</span>
        <div className="flex items-center gap-1">
          <button className="p-0.5 rounded hover:bg-[#2a2d32] text-[#6e7681] transition-colors">
            <Eye size={10} />
          </button>
          <button className="p-0.5 rounded hover:bg-[#2a2d32] text-[#6e7681] transition-colors">
            <Maximize2 size={10} />
          </button>
        </div>
      </div>
      <div className="flex-1 p-3">
        {children}
      </div>
    </div>
  );
}

// ─── Stat panel ───

function StatPanel({ title, value, unit, change, changeType, color }: {
  title: string; value: string; unit?: string; change?: string; changeType?: 'up' | 'down' | 'neutral'; color: string;
}) {
  return (
    <div className="bg-[#181B1F] border border-[#2a2d32] rounded-lg p-3 flex flex-col items-center justify-center">
      <span className="text-[9px] text-[#6e7681] uppercase tracking-wider">{title}</span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-xl font-bold" style={{ color }}>{value}</span>
        {unit && <span className="text-[10px] text-[#6e7681]">{unit}</span>}
      </div>
      {change && (
        <span className={cn(
          'text-[9px] mt-0.5 flex items-center gap-0.5',
          changeType === 'up' ? 'text-[#FF5630]' : changeType === 'down' ? 'text-[#73BF69]' : 'text-[#6e7681]',
        )}>
          {changeType === 'up' ? <ArrowUp size={8} /> : changeType === 'down' ? <ArrowDown size={8} /> : null}
          {change}
        </span>
      )}
    </div>
  );
}

// ─── Main Component ───

export function GrafanaMonitor() {
  const [timeRange, setTimeRange] = useState('Last 24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  return (
    <div className="space-y-4">
      {/* Dashboard Header — dark theme like Grafana */}
      <div className="bg-[#181B1F] rounded-xl border border-[#2a2d32] overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF9830] to-[#F2495C] flex items-center justify-center shadow-sm">
              <Activity size={16} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#d8d9da]">Infrastructure Overview</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#73BF69]/15 text-[#73BF69] font-bold border border-[#73BF69]/20">LIVE</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#6e7681]">
                <span className="flex items-center gap-1"><Server size={9} /> 6 nodes</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Cpu size={9} /> 113 pods</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Bell size={9} className="text-[#FF9830]" /> 2 firing alerts</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-[#2a2d32] text-[11px] text-[#d8d9da] border border-[#3a3d42] outline-none font-medium"
            >
              <option>Last 1h</option>
              <option>Last 6h</option>
              <option>Last 24h</option>
              <option>Last 7d</option>
              <option>Last 30d</option>
            </select>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors border',
                autoRefresh
                  ? 'bg-[#73BF69]/10 text-[#73BF69] border-[#73BF69]/20'
                  : 'bg-[#2a2d32] text-[#6e7681] border-[#3a3d42]',
              )}
            >
              <RefreshCw size={11} className={autoRefresh ? 'animate-spin' : ''} style={{ animationDuration: '3s' }} />
              {autoRefresh ? '10s' : 'Off'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-6 gap-2">
        <StatPanel title="CPU Usage" value="44" unit="%" change="+3%" changeType="up" color="#5794F2" />
        <StatPanel title="Memory" value="68" unit="%" change="+2%" changeType="up" color="#B877D9" />
        <StatPanel title="Requests" value="2.4K" unit="/s" change="+12%" changeType="neutral" color="#73BF69" />
        <StatPanel title="Error Rate" value="0.8" unit="%" change="-0.3%" changeType="down" color="#FF5630" />
        <StatPanel title="P95 Latency" value="48" unit="ms" change="-5ms" changeType="down" color="#FF9830" />
        <StatPanel title="Uptime" value="99.97" unit="%" change="30d" changeType="neutral" color="#73BF69" />
      </div>

      {/* Main Charts Grid — Grafana dark theme */}
      <div className="grid grid-cols-3 gap-2" style={{ minHeight: 200 }}>
        {/* CPU */}
        <Panel title="CPU Usage (%)">
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={cpuData}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5794F2" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#5794F2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d32" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 8, fill: '#6e7681' }} axisLine={false} tickLine={false} interval={5} />
              <YAxis tick={{ fontSize: 8, fill: '#6e7681' }} axisLine={false} tickLine={false} width={25} domain={[0, 100]} />
              <RTooltip
                contentStyle={{ fontSize: 10, borderRadius: 6, backgroundColor: '#1a1d21', border: '1px solid #2a2d32', color: '#d8d9da' }}
                formatter={(v: number) => [`${v.toFixed(1)}%`, 'CPU']}
              />
              <Area type="monotone" dataKey="v" stroke="#5794F2" fill="url(#cpuGrad)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        {/* Memory */}
        <Panel title="Memory Usage (%)">
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={memData}>
              <defs>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B877D9" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#B877D9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d32" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 8, fill: '#6e7681' }} axisLine={false} tickLine={false} interval={5} />
              <YAxis tick={{ fontSize: 8, fill: '#6e7681' }} axisLine={false} tickLine={false} width={25} domain={[0, 100]} />
              <RTooltip
                contentStyle={{ fontSize: 10, borderRadius: 6, backgroundColor: '#1a1d21', border: '1px solid #2a2d32', color: '#d8d9da' }}
                formatter={(v: number) => [`${v.toFixed(1)}%`, 'Memory']}
              />
              <Area type="monotone" dataKey="v" stroke="#B877D9" fill="url(#memGrad)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        {/* Network */}
        <Panel title="Network I/O (MB/s)">
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={netInData.map((d, i) => ({ t: d.t, in: d.v, out: netOutData[i].v }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d32" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 8, fill: '#6e7681' }} axisLine={false} tickLine={false} interval={5} />
              <YAxis tick={{ fontSize: 8, fill: '#6e7681' }} axisLine={false} tickLine={false} width={25} />
              <RTooltip
                contentStyle={{ fontSize: 10, borderRadius: 6, backgroundColor: '#1a1d21', border: '1px solid #2a2d32', color: '#d8d9da' }}
              />
              <Line type="monotone" dataKey="in" stroke="#73BF69" strokeWidth={1.5} dot={false} name="Inbound" />
              <Line type="monotone" dataKey="out" stroke="#5794F2" strokeWidth={1.5} dot={false} name="Outbound" />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Second row of charts */}
      <div className="grid grid-cols-3 gap-2" style={{ minHeight: 200 }}>
        {/* HTTP Status */}
        <Panel title="HTTP Status Codes" span={2}>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={httpStatusData} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d32" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 8, fill: '#6e7681' }} axisLine={false} tickLine={false} interval={5} />
              <YAxis tick={{ fontSize: 8, fill: '#6e7681' }} axisLine={false} tickLine={false} width={30} />
              <RTooltip
                contentStyle={{ fontSize: 10, borderRadius: 6, backgroundColor: '#1a1d21', border: '1px solid #2a2d32', color: '#d8d9da' }}
              />
              <Bar dataKey="2xx" fill="#73BF69" stackId="s" radius={[0, 0, 0, 0]} name="2xx" />
              <Bar dataKey="3xx" fill="#5794F2" stackId="s" name="3xx" />
              <Bar dataKey="4xx" fill="#FF9830" stackId="s" name="4xx" />
              <Bar dataKey="5xx" fill="#F2495C" stackId="s" radius={[2, 2, 0, 0]} name="5xx" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        {/* Latency */}
        <Panel title="P95 Latency (ms)">
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={latencyData}>
              <defs>
                <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF9830" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#FF9830" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d32" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 8, fill: '#6e7681' }} axisLine={false} tickLine={false} interval={5} />
              <YAxis tick={{ fontSize: 8, fill: '#6e7681' }} axisLine={false} tickLine={false} width={25} />
              <RTooltip
                contentStyle={{ fontSize: 10, borderRadius: 6, backgroundColor: '#1a1d21', border: '1px solid #2a2d32', color: '#d8d9da' }}
                formatter={(v: number) => [`${v.toFixed(0)}ms`, 'P95']}
              />
              <Area type="monotone" dataKey="v" stroke="#FF9830" fill="url(#latGrad)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Nodes & Alerts */}
      <div className="grid grid-cols-2 gap-2">
        {/* Node Table */}
        <div className="bg-[#181B1F] rounded-lg border border-[#2a2d32] overflow-hidden">
          <div className="px-3 py-2 border-b border-[#2a2d32] bg-[#1a1d21] flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#d8d9da]">Cluster Nodes</span>
            <span className="text-[9px] text-[#6e7681]">{nodeData.length} nodes</span>
          </div>
          <div className="divide-y divide-[#2a2d32]">
            {/* Header */}
            <div className="grid grid-cols-7 gap-1 px-3 py-1.5 text-[8px] font-bold text-[#6e7681] uppercase tracking-wider">
              <span className="col-span-2">Node</span>
              <span>CPU</span>
              <span>MEM</span>
              <span>Disk</span>
              <span>Pods</span>
              <span>Region</span>
            </div>
            {nodeData.map(node => (
              <div key={node.name} className="grid grid-cols-7 gap-1 px-3 py-2 items-center hover:bg-[#1e2127] transition-colors">
                <div className="col-span-2 flex items-center gap-1.5">
                  <StatusDot status={node.status} />
                  <span className="text-[10px] text-[#d8d9da] font-mono truncate">{node.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GaugeBar value={node.cpu} color={node.cpu > 80 ? '#F2495C' : node.cpu > 60 ? '#FF9830' : '#73BF69'} />
                  <span className="text-[9px] text-[#6e7681] w-6 text-right">{node.cpu}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <GaugeBar value={node.mem} color={node.mem > 90 ? '#F2495C' : node.mem > 75 ? '#FF9830' : '#B877D9'} />
                  <span className="text-[9px] text-[#6e7681] w-6 text-right">{node.mem}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <GaugeBar value={node.disk} color={node.disk > 80 ? '#F2495C' : '#5794F2'} />
                  <span className="text-[9px] text-[#6e7681] w-6 text-right">{node.disk}%</span>
                </div>
                <span className="text-[10px] text-[#d8d9da]">{node.pods}</span>
                <span className="text-[9px] text-[#6e7681] font-mono truncate">{node.region}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts + Services */}
        <div className="space-y-2">
          {/* Active alerts */}
          <div className="bg-[#181B1F] rounded-lg border border-[#2a2d32] overflow-hidden">
            <div className="px-3 py-2 border-b border-[#2a2d32] bg-[#1a1d21] flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#d8d9da] flex items-center gap-1.5">
                <Bell size={11} className="text-[#FF9830]" />
                Alerts
              </span>
              <span className="text-[9px] text-[#F2495C] font-bold">{alerts.filter(a => a.status === 'firing').length} firing</span>
            </div>
            <div className="divide-y divide-[#2a2d32]">
              {alerts.map(alert => (
                <div key={alert.id} className="flex items-center gap-2 px-3 py-2 hover:bg-[#1e2127] transition-colors">
                  <StatusDot status={alert.status} />
                  <span className={cn(
                    'text-[8px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider shrink-0',
                    alert.severity === 'critical' ? 'bg-[#F2495C]/15 text-[#F2495C]' : 'bg-[#FF9830]/15 text-[#FF9830]',
                  )}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-[#d8d9da] flex-1 truncate">{alert.title}</span>
                  <span className="text-[9px] text-[#6e7681] shrink-0">{alert.fired}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Service health */}
          <div className="bg-[#181B1F] rounded-lg border border-[#2a2d32] overflow-hidden">
            <div className="px-3 py-2 border-b border-[#2a2d32] bg-[#1a1d21]">
              <span className="text-[11px] font-medium text-[#d8d9da]">Service Health</span>
            </div>
            <div className="divide-y divide-[#2a2d32]">
              {services.map(svc => (
                <div key={svc.name} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#1e2127] transition-colors">
                  <StatusDot status={svc.status} />
                  <span className="text-[10px] text-[#d8d9da] font-mono flex-1">{svc.name}</span>
                  <span className={cn(
                    'text-[9px] font-mono',
                    svc.latency > 500 ? 'text-[#F2495C]' : svc.latency > 100 ? 'text-[#FF9830]' : 'text-[#6e7681]',
                  )}>
                    {svc.latency}ms
                  </span>
                  <span className={cn(
                    'text-[9px] font-mono w-10 text-right',
                    svc.errorRate > 3 ? 'text-[#F2495C]' : svc.errorRate > 1 ? 'text-[#FF9830]' : 'text-[#73BF69]',
                  )}>
                    {svc.errorRate}%
                  </span>
                  <span className="text-[9px] text-[#6e7681] w-14 text-right">{svc.rps.toLocaleString()} rps</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
