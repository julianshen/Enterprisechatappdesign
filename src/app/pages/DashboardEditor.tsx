import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3, Rocket, Shield, GitPullRequest, Layers, Target, Calendar,
  Megaphone, Users, BookOpen, Plus, X, GripVertical, ChevronLeft,
  Save, Eye, Trash2, Settings2, Palette, Type, LayoutGrid, Check,
  TrendingUp, TrendingDown, Minus, ExternalLink, List, Link2,
  Activity, PenLine, Copy, ArrowUp, ArrowDown, Maximize2, Minimize2,
  Sparkles, LayoutDashboard, FileText, AlertCircle,
  Search, Star, Zap, Bug, Clock, Gauge, FolderKanban, Globe,
  CircleDot, Milestone, PieChart, UserCheck, Briefcase, Tag,
  type LucideIcon,
} from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import {
  spaces, users,
  type SpaceDashboard, type DashboardWidget,
  type MetricData, type ListData, type ProgressData, type MembersData, type LinksData,
} from '../data/mockData';
import {
  saveCustomDashboard,
  getCustomDashboardsForSpace,
  MY_SPACE_ID,
} from '../data/customDashboards';
import { renderMyWidget, isMyWidgetType } from '../components/MyWidgets';
import { useI18n } from '../context/I18nContext';

// ─── Icon map ───
const DASHBOARD_ICONS: { id: string; icon: LucideIcon; label: string }[] = [
  { id: 'bar-chart', icon: BarChart3, label: 'Bar Chart' },
  { id: 'rocket', icon: Rocket, label: 'Rocket' },
  { id: 'shield', icon: Shield, label: 'Shield' },
  { id: 'git-pull-request', icon: GitPullRequest, label: 'Git PR' },
  { id: 'layers', icon: Layers, label: 'Layers' },
  { id: 'target', icon: Target, label: 'Target' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'megaphone', icon: Megaphone, label: 'Megaphone' },
  { id: 'users', icon: Users, label: 'Users' },
  { id: 'book-open', icon: BookOpen, label: 'Book' },
];

const WIDGET_COLORS: { id: string; label: string; hex: string }[] = [
  { id: 'purple', label: 'Purple', hex: '#5b5fc7' },
  { id: 'blue', label: 'Blue', hex: '#0078d4' },
  { id: 'green', label: 'Green', hex: '#237b4b' },
  { id: 'orange', label: 'Orange', hex: '#d4820c' },
  { id: 'red', label: 'Red', hex: '#c4314b' },
  { id: 'gray', label: 'Gray', hex: '#616161' },
];

const colorMap: Record<string, { border: string; bg: string; text: string; light: string }> = {
  purple: { border: 'border-[#5b5fc7]/20', bg: 'bg-[#eeeef8] dark:bg-[#5b5fc7]/15', text: 'text-[#5b5fc7] dark:text-[#a6a9dc]', light: 'bg-[#f5f5fc] dark:bg-[#5b5fc7]/5' },
  blue: { border: 'border-[#0078d4]/20', bg: 'bg-[#ecf5fe] dark:bg-[#0078d4]/15', text: 'text-[#0078d4] dark:text-[#6cb8f6]', light: 'bg-[#f5faff] dark:bg-[#0078d4]/5' },
  green: { border: 'border-[#237b4b]/20', bg: 'bg-[#edf7f0] dark:bg-[#237b4b]/15', text: 'text-[#237b4b] dark:text-[#57ab5a]', light: 'bg-[#f5fbf7] dark:bg-[#237b4b]/5' },
  orange: { border: 'border-[#d4820c]/20', bg: 'bg-[#fef7ec] dark:bg-[#d4820c]/15', text: 'text-[#d4820c] dark:text-[#f0b850]', light: 'bg-[#fffbf5] dark:bg-[#d4820c]/5' },
  red: { border: 'border-[#c4314b]/20', bg: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15', text: 'text-[#c4314b] dark:text-[#f47067]', light: 'bg-[#fef8f8] dark:bg-[#c4314b]/5' },
  gray: { border: 'border-[#616161]/15', bg: 'bg-[#f0f0f0] dark:bg-[#3d3d3d]', text: 'text-[#616161] dark:text-[#b9bbbe]', light: 'bg-[#fafafa] dark:bg-[#2a2a2a]' },
};

const progressColorMap: Record<string, string> = {
  blue: 'bg-[#0078d4]', green: 'bg-[#237b4b]', orange: 'bg-[#d4820c]',
  red: 'bg-[#c4314b]', purple: 'bg-[#5b5fc7]', gray: 'bg-[#616161]',
};

const statusColorMap: Record<string, string> = {
  blue: 'bg-[#ecf5fe] dark:bg-[#0078d4]/15 text-[#0078d4] dark:text-[#6cb8f6]',
  green: 'bg-[#edf7f0] dark:bg-[#237b4b]/15 text-[#237b4b] dark:text-[#57ab5a]',
  orange: 'bg-[#fef7ec] dark:bg-[#d4820c]/15 text-[#d4820c] dark:text-[#f0b850]',
  red: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15 text-[#c4314b] dark:text-[#f47067]',
  gray: 'bg-[#f0f0f0] dark:bg-[#3d3d3d] text-[#616161] dark:text-[#b9bbbe]',
  purple: 'bg-[#eeeef8] dark:bg-[#5b5fc7]/15 text-[#5b5fc7] dark:text-[#a6a9dc]',
};

// ─── Widget type definitions & templates ───

type WidgetType = DashboardWidget['type'];

const WIDGET_TYPES: { id: WidgetType; label: string; description: string; icon: LucideIcon }[] = [
  { id: 'metric', label: 'Metrics', description: 'KPIs with optional trends', icon: Activity },
  { id: 'list', label: 'List', description: 'Items with status badges', icon: List },
  { id: 'progress', label: 'Progress', description: 'Progress bars & goals', icon: BarChart3 },
  { id: 'members', label: 'Members', description: 'Team member status', icon: Users },
  { id: 'links', label: 'Links', description: 'Quick link collection', icon: Link2 },
  { id: 'my-calendar', label: 'Calendar', description: 'Interactive month view', icon: Calendar },
  { id: 'my-meetings', label: 'Meetings', description: 'Upcoming meetings', icon: Clock },
  { id: 'my-services', label: 'Services', description: 'Common services', icon: Briefcase },
  { id: 'my-requests', label: 'Requests', description: 'Space requests', icon: FolderKanban },
  { id: 'my-approvals', label: 'Approvals', description: 'Pending approvals', icon: AlertCircle },
  { id: 'my-unread', label: 'Unread', description: 'Unread channels', icon: Globe },
  { id: 'my-threads', label: 'Threads', description: 'Active threads', icon: List },
];

function createTemplateWidget(type: WidgetType): DashboardWidget {
  const id = `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const base = { id, color: 'purple' as const, wide: false };

  switch (type) {
    case 'metric':
      return {
        ...base, type: 'metric', title: 'Key Metrics',
        data: {
          items: [
            { label: 'Total', value: '128', change: '+12%', changeType: 'up' },
            { label: 'Active', value: '94', change: '+5%', changeType: 'up' },
            { label: 'Pending', value: '22', change: '-3%', changeType: 'down' },
            { label: 'Closed', value: '12', changeType: 'neutral' },
          ],
        } as MetricData,
      };
    case 'list':
      return {
        ...base, type: 'list', title: 'Task List',
        data: {
          items: [
            { id: 'li-1', label: 'Setup CI/CD pipeline', sublabel: 'DevOps · 5 pts', status: 'In Progress', statusColor: 'blue', badge: 'High', badgeColor: 'red' },
            { id: 'li-2', label: 'Write API documentation', sublabel: 'Docs · 3 pts', status: 'To Do', statusColor: 'gray' },
            { id: 'li-3', label: 'Fix login redirect bug', sublabel: 'Bug · 2 pts', status: 'Done', statusColor: 'green' },
          ],
        } as ListData,
      };
    case 'progress':
      return {
        ...base, type: 'progress', title: 'Sprint Progress',
        data: {
          items: [
            { label: 'Frontend', value: 72, max: 100, color: 'purple' },
            { label: 'Backend', value: 58, max: 100, color: 'blue' },
            { label: 'QA', value: 30, max: 100, color: 'green' },
          ],
        } as ProgressData,
      };
    case 'members':
      return {
        ...base, type: 'members', title: 'Team Members',
        data: {
          members: users.slice(0, 4).map(u => ({
            name: u.name, avatar: u.avatar,
            role: 'Team Member',
            status: (['online', 'away', 'busy', 'offline'] as const)[Math.floor(Math.random() * 4)],
          })),
        } as MembersData,
      };
    case 'links':
      return {
        ...base, type: 'links', title: 'Quick Links',
        data: {
          items: [
            { label: 'Project Wiki', url: '#', icon: 'book', description: 'Internal documentation' },
            { label: 'Design System', url: '#', icon: 'palette', description: 'Component library' },
            { label: 'CI Dashboard', url: '#', icon: 'activity', description: 'Build status' },
          ],
        } as LinksData,
      };
    case 'my-calendar':
      return { ...base, type: 'my-calendar', title: 'Working Calendar', color: 'purple', data: null };
    case 'my-meetings':
      return { ...base, type: 'my-meetings', title: 'Incoming Meetings', color: 'blue', data: null };
    case 'my-services':
      return { ...base, type: 'my-services', title: 'Common Services', color: 'purple', data: null };
    case 'my-requests':
      return { ...base, type: 'my-requests', title: 'My Requests', color: 'blue', data: null };
    case 'my-approvals':
      return { ...base, type: 'my-approvals', title: 'Pending Approvals', color: 'orange', data: null };
    case 'my-unread':
      return { ...base, type: 'my-unread', title: 'Unread Channels', color: 'green', data: null };
    case 'my-threads':
      return { ...base, type: 'my-threads', title: 'Active Threads', color: 'red', data: null };
    default:
      return { ...base, type: 'metric', title: 'Widget', data: { items: [] } as MetricData };
  }
}

// ─── Mini widget previews (for type picker) ───

function MiniMetricPreview() {
  return (
    <div className="flex gap-2">
      {['128', '94', '22'].map((v, i) => (
        <div key={i} className="flex-1 text-center">
          <div className="text-[11px] font-bold text-[#242424] dark:text-[#f0f0f0]">{v}</div>
          <div className="text-[7px] text-[#999]">{t('dashboardEditor.field.label')}</div>
        </div>
      ))}
    </div>
  );
}

function MiniListPreview() {
  return (
    <div className="space-y-1">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-full h-1.5 rounded bg-[#e8e8e8] dark:bg-[#333]" />
          <div className="w-6 h-2.5 rounded-full bg-[#5b5fc7]/20 shrink-0" />
        </div>
      ))}
    </div>
  );
}

function MiniProgressPreview() {
  return (
    <div className="space-y-1.5">
      {[75, 50, 30].map((v, i) => (
        <div key={i}>
          <div className="h-1.5 bg-[#e8e8e8] dark:bg-[#333] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-[#5b5fc7]" style={{ width: `${v}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniMembersPreview() {
  return (
    <div className="flex -space-x-1.5">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="w-5 h-5 rounded-full bg-[#5b5fc7]/20 border-2 border-white dark:border-[#2b2d31]" />
      ))}
    </div>
  );
}

function MiniLinksPreview() {
  return (
    <div className="space-y-1">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#5b5fc7]/15 shrink-0" />
          <div className="w-full h-1.5 rounded bg-[#e8e8e8] dark:bg-[#333]" />
        </div>
      ))}
    </div>
  );
}

function MiniCalendarPreview() {
  return (
    <div className="grid grid-cols-7 gap-0.5">
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className={`w-2 h-2 rounded-sm ${i === 5 ? 'bg-[#5b5fc7]' : 'bg-[#e8e8e8] dark:bg-[#333]'}`} />
      ))}
    </div>
  );
}

function MiniLivePreview() {
  return (
    <div className="space-y-1">
      {[1, 2].map(i => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-1 h-3 rounded-full bg-[#5b5fc7]/30" />
          <div className="w-full h-1.5 rounded bg-[#e8e8e8] dark:bg-[#333]" />
        </div>
      ))}
    </div>
  );
}

function MiniServicesPreview() {
  return (
    <div className="grid grid-cols-3 gap-1">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="w-4 h-4 rounded bg-[#5b5fc7]/10 mx-auto" />
      ))}
    </div>
  );
}

const MINI_PREVIEW: Record<string, React.FC> = {
  metric: MiniMetricPreview,
  list: MiniListPreview,
  progress: MiniProgressPreview,
  members: MiniMembersPreview,
  links: MiniLinksPreview,
  'my-calendar': MiniCalendarPreview,
  'my-meetings': MiniLivePreview,
  'my-services': MiniServicesPreview,
  'my-requests': MiniListPreview,
  'my-approvals': MiniListPreview,
  'my-unread': MiniListPreview,
  'my-threads': MiniListPreview,
};

// ─── Live widget renderers (same as TeamDashboard but smaller) ───

function LiveMetricWidget({ widget }: { widget: DashboardWidget }) {
  const data = widget.data as MetricData;
  const c = colorMap[widget.color];
  return (
    <div className={`bg-white dark:bg-[#252525] rounded-xl border ${c.border} shadow-sm overflow-hidden h-full`}>
      <div className={`px-3 py-2 border-b border-[#f0f0f0] dark:border-[#333] ${c.light}`}>
        <h3 className="font-semibold text-[12px] text-[#242424] dark:text-[#f0f0f0]">{widget.title}</h3>
      </div>
      <div className={`grid gap-0 divide-x divide-[#f0f0f0] dark:divide-[#333] ${data.items.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {data.items.map((item, i) => (
          <div key={i} className="px-3 py-3 text-center">
            <p className="text-[18px] font-bold text-[#242424] dark:text-[#f0f0f0] mb-0.5">{item.value}</p>
            <p className="text-[10px] text-[#616161] dark:text-[#8a8a8a]">{item.label}</p>
            {item.change && (
              <div className="flex items-center justify-center gap-0.5 mt-0.5">
                {item.changeType === 'up' && <TrendingUp size={9} className="text-[#237b4b]" />}
                {item.changeType === 'down' && <TrendingDown size={9} className="text-[#c4314b]" />}
                {item.changeType === 'neutral' && <Minus size={9} className="text-[#616161]" />}
                <span className={`text-[9px] font-medium ${
                  item.changeType === 'up' ? 'text-[#237b4b]' :
                  item.changeType === 'down' ? 'text-[#c4314b]' : 'text-[#616161]'
                }`}>{item.change}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveListWidget({ widget }: { widget: DashboardWidget }) {
  const data = widget.data as ListData;
  const c = colorMap[widget.color];
  return (
    <div className={`bg-white dark:bg-[#252525] rounded-xl border ${c.border} shadow-sm overflow-hidden h-full`}>
      <div className={`px-3 py-2 border-b border-[#f0f0f0] dark:border-[#333] flex items-center justify-between ${c.light}`}>
        <h3 className="font-semibold text-[12px] text-[#242424] dark:text-[#f0f0f0]">{widget.title}</h3>
        <span className="text-[10px] text-[#8a8a8a]">{data.items.length} items</span>
      </div>
      <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
        {data.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-[#242424] dark:text-[#e0e0e0] truncate">{item.label}</p>
              {item.sublabel && <p className="text-[10px] text-[#8a8a8a] truncate">{item.sublabel}</p>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {item.badge && (
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${statusColorMap[item.badgeColor || 'gray']}`}>{item.badge}</span>
              )}
              {item.status && (
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap ${statusColorMap[item.statusColor || 'gray']}`}>{item.status}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveProgressWidget({ widget }: { widget: DashboardWidget }) {
  const data = widget.data as ProgressData;
  const c = colorMap[widget.color];
  return (
    <div className={`bg-white dark:bg-[#252525] rounded-xl border ${c.border} shadow-sm overflow-hidden h-full`}>
      <div className={`px-3 py-2 border-b border-[#f0f0f0] dark:border-[#333] ${c.light}`}>
        <h3 className="font-semibold text-[12px] text-[#242424] dark:text-[#f0f0f0]">{widget.title}</h3>
      </div>
      <div className="p-3 space-y-3">
        {data.items.map((item, i) => {
          const pct = Math.min(Math.round((item.value / item.max) * 100), 100);
          const barColor = progressColorMap[item.color || 'blue'];
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[#242424] dark:text-[#e0e0e0]">{item.label}</span>
                <span className="text-[10px] text-[#8a8a8a] font-medium">{pct}%</span>
              </div>
              <div className="h-1.5 bg-[#f0f0f0] dark:bg-[#3d3d3d] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveMembersWidget({ widget }: { widget: DashboardWidget }) {
  const data = widget.data as MembersData;
  const c = colorMap[widget.color];
  const statusDot: Record<string, string> = {
    online: 'bg-[#92c353]', away: 'bg-[#ffaa44]', busy: 'bg-[#c4314b]', offline: 'bg-[#858585]',
  };
  return (
    <div className={`bg-white dark:bg-[#252525] rounded-xl border ${c.border} shadow-sm overflow-hidden h-full`}>
      <div className={`px-3 py-2 border-b border-[#f0f0f0] dark:border-[#333] flex items-center justify-between ${c.light}`}>
        <h3 className="font-semibold text-[12px] text-[#242424] dark:text-[#f0f0f0]">{widget.title}</h3>
        <span className="text-[10px] text-[#8a8a8a]">{data.members.length}</span>
      </div>
      <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
        {data.members.map((m, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2">
            <div className="relative shrink-0">
              <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full" />
              <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 ${statusDot[m.status]} rounded-full border border-white dark:border-[#252525]`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#242424] dark:text-[#e0e0e0] font-medium truncate">{m.name}</p>
              <p className="text-[9px] text-[#8a8a8a]">{m.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveLinksWidget({ widget }: { widget: DashboardWidget }) {
  const data = widget.data as LinksData;
  const c = colorMap[widget.color];
  return (
    <div className={`bg-white dark:bg-[#252525] rounded-xl border ${c.border} shadow-sm overflow-hidden h-full`}>
      <div className={`px-3 py-2 border-b border-[#f0f0f0] dark:border-[#333] ${c.light}`}>
        <h3 className="font-semibold text-[12px] text-[#242424] dark:text-[#f0f0f0]">{widget.title}</h3>
      </div>
      <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
        {data.items.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3 py-2 group">
            <div className={`w-6 h-6 rounded-md ${c.bg} flex items-center justify-center shrink-0`}>
              <ExternalLink size={11} className={c.text} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#242424] dark:text-[#e0e0e0] font-medium truncate">{item.label}</p>
              {item.description && <p className="text-[9px] text-[#8a8a8a] truncate">{item.description}</p>}
            </div>
            <ExternalLink size={10} className="text-[#d1d1d1] dark:text-[#3d3d3d] shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveMyWidgetCard({ widget }: { widget: DashboardWidget }) {
  const c = colorMap[widget.color];
  return (
    <div className={`bg-white dark:bg-[#252525] rounded-xl border ${c.border} shadow-sm overflow-hidden h-full`}>
      <div className={`px-3 py-2 border-b border-[#f0f0f0] dark:border-[#333] ${c.light}`}>
        <h3 className="font-semibold text-[12px] text-[#242424] dark:text-[#f0f0f0]">{widget.title}</h3>
      </div>
      <div className="overflow-hidden">
        {renderMyWidget(widget.type)}
      </div>
    </div>
  );
}

function LiveWidgetRenderer({ widget }: { widget: DashboardWidget }) {
  if (isMyWidgetType(widget.type)) {
    return <LiveMyWidgetCard widget={widget} />;
  }
  switch (widget.type) {
    case 'metric': return <LiveMetricWidget widget={widget} />;
    case 'list': return <LiveListWidget widget={widget} />;
    case 'progress': return <LiveProgressWidget widget={widget} />;
    case 'members': return <LiveMembersWidget widget={widget} />;
    case 'links': return <LiveLinksWidget widget={widget} />;
    default: return null;
  }
}

// ─── Widget Config Panel ───

function WidgetConfigPanel({
  widget,
  onUpdate,
  onDelete,
  onClose,
}: {
  widget: DashboardWidget;
  onUpdate: (w: DashboardWidget) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'general' | 'data'>('general');

  const updateField = <K extends keyof DashboardWidget>(key: K, value: DashboardWidget[K]) => {
    onUpdate({ ...widget, [key]: value });
  };

  // For metric data editing
  const metricData = widget.type === 'metric' ? widget.data as MetricData : null;
  const listData = widget.type === 'list' ? widget.data as ListData : null;
  const progressData = widget.type === 'progress' ? widget.data as ProgressData : null;
  const linksData = widget.type === 'links' ? widget.data as LinksData : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-[320px] bg-white dark:bg-[#252525] border-l border-[#e8e8e8] dark:border-[#333] flex flex-col overflow-hidden shrink-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e8e8] dark:border-[#333] bg-[#faf9f8] dark:bg-[#2a2a2a] shrink-0">
        <div className="flex items-center gap-2">
          <Settings2 size={14} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
          <span className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{t('dashboardEditor.widgetSettings')}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded text-[#999] hover:text-[#242424] dark:text-[#666] dark:hover:text-[#f0f0f0] hover:bg-[#f0f0f0] dark:hover:bg-[#333] transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e8e8e8] dark:border-[#333] shrink-0">
        {(['general', 'data'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-3 py-2.5 text-[12px] font-medium transition-colors capitalize ${
              tab === t
                ? 'text-[#5b5fc7] dark:text-[#a6a9dc] border-b-2 border-[#5b5fc7]'
                : 'text-[#616161] dark:text-[#999] hover:text-[#242424] dark:hover:text-[#f0f0f0]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {tab === 'general' && (
          <>
            {/* Title */}
            <div>
              <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={widget.title}
                onChange={e => updateField('title', e.target.value)}
                className="w-full px-3 py-2 text-[13px] bg-[#f5f5f5] dark:bg-[#1e1f22] text-[#242424] dark:text-[#f0f0f0] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg outline-none focus:ring-2 focus:ring-[#5b5fc7]/30"
              />
            </div>

            {/* Widget type display */}
            <div>
              <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">
                Type
              </label>
              <div className="px-3 py-2 bg-[#f5f5f5] dark:bg-[#1e1f22] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] text-[13px] text-[#242424] dark:text-[#f0f0f0] capitalize flex items-center gap-2">
                {(() => {
                  const wt = WIDGET_TYPES.find(t => t.id === widget.type);
                  const WIcon = wt?.icon || LayoutGrid;
                  return <><WIcon size={14} className="text-[#5b5fc7]" />{wt?.label || widget.type}</>;
                })()}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">
                Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {WIDGET_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => updateField('color', c.id as DashboardWidget['color'])}
                    className={`w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center ${
                      widget.color === c.id ? 'border-[#242424] dark:border-[#f0f0f0] scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex + '20' }}
                  >
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.hex }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Wide toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider">
                  Wide Widget
                </label>
                <p className="text-[10px] text-[#999]">{t('dashboardEditor.spansMultipleColumns')}</p>
              </div>
              <button
                onClick={() => updateField('wide', !widget.wide)}
                className={`w-10 h-5.5 rounded-full transition-colors relative ${
                  widget.wide ? 'bg-[#5b5fc7]' : 'bg-[#d1d1d1] dark:bg-[#3d3d3d]'
                }`}
              >
                <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${
                  widget.wide ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </>
        )}

        {tab === 'data' && (
          <>
            {/* Metric data editor */}
            {metricData && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider">
                    Metric Items
                  </label>
                  <button
                    onClick={() => {
                      const newItems = [...metricData.items, { label: 'New', value: '0' }];
                      onUpdate({ ...widget, data: { items: newItems } });
                    }}
                    className="text-[10px] font-medium text-[#5b5fc7] hover:underline flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Add
                  </button>
                </div>
                {metricData.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-[#f5f5f5] dark:bg-[#1e1f22] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.label}
                        onChange={e => {
                          const newItems = [...metricData.items];
                          newItems[idx] = { ...newItems[idx], label: e.target.value };
                          onUpdate({ ...widget, data: { items: newItems } });
                        }}
                        className="flex-1 px-2 py-1 text-[12px] bg-white dark:bg-[#2b2d31] text-[#242424] dark:text-[#f0f0f0] rounded border border-[#e1dfdd] dark:border-[#3d3d3d] outline-none"
                        placeholder={t('dashboardEditor.field.label')}
                      />
                      <input
                        type="text"
                        value={item.value}
                        onChange={e => {
                          const newItems = [...metricData.items];
                          newItems[idx] = { ...newItems[idx], value: e.target.value };
                          onUpdate({ ...widget, data: { items: newItems } });
                        }}
                        className="w-16 px-2 py-1 text-[12px] bg-white dark:bg-[#2b2d31] text-[#242424] dark:text-[#f0f0f0] rounded border border-[#e1dfdd] dark:border-[#3d3d3d] outline-none text-center"
                        placeholder={t('dashboardEditor.field.value')}
                      />
                      <button
                        onClick={() => {
                          const newItems = metricData.items.filter((_, i) => i !== idx);
                          onUpdate({ ...widget, data: { items: newItems } });
                        }}
                        className="p-1 text-[#c4314b] hover:bg-[#c4314b]/10 rounded transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.change || ''}
                        onChange={e => {
                          const newItems = [...metricData.items];
                          newItems[idx] = { ...newItems[idx], change: e.target.value };
                          onUpdate({ ...widget, data: { items: newItems } });
                        }}
                        className="flex-1 px-2 py-1 text-[11px] bg-white dark:bg-[#2b2d31] text-[#242424] dark:text-[#f0f0f0] rounded border border-[#e1dfdd] dark:border-[#3d3d3d] outline-none"
                        placeholder={t('dashboardEditor.field.changeExample')}
                      />
                      <select
                        value={item.changeType || 'neutral'}
                        onChange={e => {
                          const newItems = [...metricData.items];
                          newItems[idx] = { ...newItems[idx], changeType: e.target.value as 'up' | 'down' | 'neutral' };
                          onUpdate({ ...widget, data: { items: newItems } });
                        }}
                        className="px-2 py-1 text-[11px] bg-white dark:bg-[#2b2d31] text-[#242424] dark:text-[#f0f0f0] rounded border border-[#e1dfdd] dark:border-[#3d3d3d] outline-none"
                      >
                        <option value="up">{t('dashboardEditor.direction.up')}</option>
                        <option value="down">{t('dashboardEditor.direction.down')}</option>
                        <option value="neutral">{t('dashboardEditor.direction.neutral')}</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List data editor */}
            {listData && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider">
                    List Items
                  </label>
                  <button
                    onClick={() => {
                      const newItems = [...listData.items, { id: `li-${Date.now()}`, label: 'New item', sublabel: '', status: 'To Do', statusColor: 'gray' }];
                      onUpdate({ ...widget, data: { items: newItems } });
                    }}
                    className="text-[10px] font-medium text-[#5b5fc7] hover:underline flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Add
                  </button>
                </div>
                {listData.items.map((item, idx) => (
                  <div key={item.id} className="p-2.5 bg-[#f5f5f5] dark:bg-[#1e1f22] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.label}
                        onChange={e => {
                          const newItems = [...listData.items];
                          newItems[idx] = { ...newItems[idx], label: e.target.value };
                          onUpdate({ ...widget, data: { items: newItems } });
                        }}
                        className="flex-1 px-2 py-1 text-[12px] bg-white dark:bg-[#2b2d31] text-[#242424] dark:text-[#f0f0f0] rounded border border-[#e1dfdd] dark:border-[#3d3d3d] outline-none"
                        placeholder={t('dashboardEditor.field.itemLabel')}
                      />
                      <button
                        onClick={() => {
                          const newItems = listData.items.filter((_, i) => i !== idx);
                          onUpdate({ ...widget, data: { items: newItems } });
                        }}
                        className="p-1 text-[#c4314b] hover:bg-[#c4314b]/10 rounded transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.sublabel || ''}
                        onChange={e => {
                          const newItems = [...listData.items];
                          newItems[idx] = { ...newItems[idx], sublabel: e.target.value };
                          onUpdate({ ...widget, data: { items: newItems } });
                        }}
                        className="flex-1 px-2 py-1 text-[11px] bg-white dark:bg-[#2b2d31] text-[#242424] dark:text-[#f0f0f0] rounded border border-[#e1dfdd] dark:border-[#3d3d3d] outline-none"
                        placeholder={t('dashboardEditor.field.sublabel')}
                      />
                      <select
                        value={item.statusColor || 'gray'}
                        onChange={e => {
                          const newItems = [...listData.items];
                          newItems[idx] = { ...newItems[idx], statusColor: e.target.value };
                          onUpdate({ ...widget, data: { items: newItems } });
                        }}
                        className="px-2 py-1 text-[11px] bg-white dark:bg-[#2b2d31] text-[#242424] dark:text-[#f0f0f0] rounded border border-[#e1dfdd] dark:border-[#3d3d3d] outline-none"
                      >
                        <option value="blue">{t('dashboardEditor.color.blue')}</option>
                        <option value="green">{t('dashboardEditor.color.green')}</option>
                        <option value="orange">{t('dashboardEditor.color.orange')}</option>
                        <option value="red">{t('dashboardEditor.color.red')}</option>
                        <option value="gray">{t('dashboardEditor.color.gray')}</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={item.status || ''}
                      onChange={e => {
                        const newItems = [...listData.items];
                        newItems[idx] = { ...newItems[idx], status: e.target.value };
                        onUpdate({ ...widget, data: { items: newItems } });
                      }}
                      className="w-full px-2 py-1 text-[11px] bg-white dark:bg-[#2b2d31] text-[#242424] dark:text-[#f0f0f0] rounded border border-[#e1dfdd] dark:border-[#3d3d3d] outline-none"
                      placeholder={t('dashboardEditor.field.statusLabel')}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Progress data editor */}
            {progressData && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider">
                    Progress Bars
                  </label>
                  <button
                    onClick={() => {
                      const newItems = [...progressData.items, { label: 'New', value: 50, max: 100, color: 'purple' }];
                      onUpdate({ ...widget, data: { items: newItems } });
                    }}
                    className="text-[10px] font-medium text-[#5b5fc7] hover:underline flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Add
                  </button>
                </div>
                {progressData.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-[#f5f5f5] dark:bg-[#1e1f22] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.label}
                        onChange={e => {
                          const newItems = [...progressData.items];
                          newItems[idx] = { ...newItems[idx], label: e.target.value };
                          onUpdate({ ...widget, data: { items: newItems } });
                        }}
                        className="flex-1 px-2 py-1 text-[12px] bg-white dark:bg-[#2b2d31] text-[#242424] dark:text-[#f0f0f0] rounded border border-[#e1dfdd] dark:border-[#3d3d3d] outline-none"
                        placeholder={t('dashboardEditor.field.label')}
                      />
                      <button
                        onClick={() => {
                          const newItems = progressData.items.filter((_, i) => i !== idx);
                          onUpdate({ ...widget, data: { items: newItems } });
                        }}
                        className="p-1 text-[#c4314b] hover:bg-[#c4314b]/10 rounded transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="range"
                          min={0}
                          max={item.max}
                          value={item.value}
                          onChange={e => {
                            const newItems = [...progressData.items];
                            newItems[idx] = { ...newItems[idx], value: parseInt(e.target.value) };
                            onUpdate({ ...widget, data: { items: newItems } });
                          }}
                          className="w-full accent-[#5b5fc7]"
                        />
                      </div>
                      <span className="text-[11px] text-[#616161] dark:text-[#999] w-10 text-right">{item.value}%</span>
                      <select
                        value={item.color || 'purple'}
                        onChange={e => {
                          const newItems = [...progressData.items];
                          newItems[idx] = { ...newItems[idx], color: e.target.value };
                          onUpdate({ ...widget, data: { items: newItems } });
                        }}
                        className="px-1.5 py-1 text-[10px] bg-white dark:bg-[#2b2d31] text-[#242424] dark:text-[#f0f0f0] rounded border border-[#e1dfdd] dark:border-[#3d3d3d] outline-none"
                      >
                        {WIDGET_COLORS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Links data editor */}
            {linksData && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider">
                    Links
                  </label>
                  <button
                    onClick={() => {
                      const newItems = [...linksData.items, { label: 'New Link', url: '#', icon: 'link', description: '' }];
                      onUpdate({ ...widget, data: { items: newItems } });
                    }}
                    className="text-[10px] font-medium text-[#5b5fc7] hover:underline flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Add
                  </button>
                </div>
                {linksData.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-[#f5f5f5] dark:bg-[#1e1f22] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.label}
                        onChange={e => {
                          const newItems = [...linksData.items];
                          newItems[idx] = { ...newItems[idx], label: e.target.value };
                          onUpdate({ ...widget, data: { items: newItems } });
                        }}
                        className="flex-1 px-2 py-1 text-[12px] bg-white dark:bg-[#2b2d31] text-[#242424] dark:text-[#f0f0f0] rounded border border-[#e1dfdd] dark:border-[#3d3d3d] outline-none"
                        placeholder={t('dashboardEditor.field.linkTitle')}
                      />
                      <button
                        onClick={() => {
                          const newItems = linksData.items.filter((_, i) => i !== idx);
                          onUpdate({ ...widget, data: { items: newItems } });
                        }}
                        className="p-1 text-[#c4314b] hover:bg-[#c4314b]/10 rounded transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.url}
                      onChange={e => {
                        const newItems = [...linksData.items];
                        newItems[idx] = { ...newItems[idx], url: e.target.value };
                        onUpdate({ ...widget, data: { items: newItems } });
                      }}
                      className="w-full px-2 py-1 text-[11px] bg-white dark:bg-[#2b2d31] text-[#242424] dark:text-[#f0f0f0] rounded border border-[#e1dfdd] dark:border-[#3d3d3d] outline-none"
                      placeholder={t('dashboardEditor.field.url')}
                    />
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={e => {
                        const newItems = [...linksData.items];
                        newItems[idx] = { ...newItems[idx], description: e.target.value };
                        onUpdate({ ...widget, data: { items: newItems } });
                      }}
                      className="w-full px-2 py-1 text-[11px] bg-white dark:bg-[#2b2d31] text-[#242424] dark:text-[#f0f0f0] rounded border border-[#e1dfdd] dark:border-[#3d3d3d] outline-none"
                      placeholder={t('dashboardEditor.field.description')}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Members type — just info */}
            {widget.type === 'members' && (
              <div className="text-center py-6">
                <Users size={28} className="text-[#d1d1d1] dark:text-[#444] mx-auto mb-2" />
                <p className="text-[12px] text-[#616161] dark:text-[#999]">
                  Members widget auto-populates from the space team roster.
                </p>
              </div>
            )}

            {/* My-* widget types — live content, no editable data */}
            {isMyWidgetType(widget.type) && (
              <div className="text-center py-6">
                <Sparkles size={28} className="text-[#5b5fc7] dark:text-[#a6a9dc] mx-auto mb-2" />
                <p className="text-[12px] text-[#616161] dark:text-[#999]">
                  This is a live widget that displays real-time data automatically. No data configuration needed.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#e8e8e8] dark:border-[#333] p-3 shrink-0">
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium text-[#c4314b] hover:bg-[#c4314b]/8 rounded-lg transition-colors"
        >
          <Trash2 size={13} />
          Remove Widget
        </button>
      </div>
    </motion.div>
  );
}

// ─── Widget Marketplace ───

interface MarketplaceWidget {
  id: string;
  name: string;
  description: string;
  type: WidgetType;
  icon: LucideIcon;
  category: string;
  tags: string[];
  featured?: boolean;
  templateOverrides?: Partial<DashboardWidget>;
}

const MARKETPLACE_CATEGORIES = [
  { id: 'all', label: 'All Widgets', icon: LayoutGrid },
  { id: 'featured', label: 'Featured', icon: Star },
  { id: 'personal', label: 'Personal', icon: UserCheck },
  { id: 'data', label: 'Data & Analytics', icon: PieChart },
  { id: 'project', label: 'Project Tracking', icon: FolderKanban },
  { id: 'team', label: 'Team & People', icon: Users },
  { id: 'navigation', label: 'Navigation', icon: Globe },
];

const MARKETPLACE_WIDGETS: MarketplaceWidget[] = [
  // Data & Analytics
  {
    id: 'kpi-dashboard', name: 'KPI Dashboard', description: 'Track key performance indicators with trend arrows and change percentages',
    type: 'metric', icon: Gauge, category: 'data', tags: ['kpi', 'metrics', 'analytics', 'trends', 'numbers'], featured: true,
  },
  {
    id: 'release-metrics', name: 'Release Metrics', description: 'Monitor deployment frequency, lead time, and failure rates',
    type: 'metric', icon: Rocket, category: 'data', tags: ['release', 'deploy', 'devops', 'dora'],
    templateOverrides: { title: 'Release Metrics', color: 'blue' as const },
  },
  {
    id: 'performance-stats', name: 'Performance Stats', description: 'Application performance metrics like uptime, latency, and throughput',
    type: 'metric', icon: Zap, category: 'data', tags: ['performance', 'uptime', 'latency', 'speed'],
    templateOverrides: { title: 'Performance Stats', color: 'green' as const },
  },
  {
    id: 'sprint-progress', name: 'Sprint Progress', description: 'Visual progress bars for tracking sprint completion across workstreams',
    type: 'progress', icon: BarChart3, category: 'data', tags: ['sprint', 'progress', 'agile', 'completion'], featured: true,
  },
  {
    id: 'okr-tracker', name: 'OKR Tracker', description: 'Track objectives and key results with percentage progress indicators',
    type: 'progress', icon: Target, category: 'data', tags: ['okr', 'objectives', 'goals', 'key results'],
    templateOverrides: { title: 'OKR Tracker', color: 'orange' as const },
  },
  {
    id: 'milestone-progress', name: 'Milestone Progress', description: 'Track project milestones and their completion status over time',
    type: 'progress', icon: Milestone, category: 'data', tags: ['milestones', 'timeline', 'roadmap', 'delivery'],
    templateOverrides: { title: 'Milestones', color: 'purple' as const },
  },
  // Project Tracking
  {
    id: 'task-list', name: 'Task List', description: 'Prioritized task list with status badges, assignees, and story points',
    type: 'list', icon: List, category: 'project', tags: ['tasks', 'todo', 'items', 'work', 'backlog'], featured: true,
  },
  {
    id: 'bug-tracker', name: 'Bug Tracker', description: 'Active bugs and issues with severity levels and resolution status',
    type: 'list', icon: Bug, category: 'project', tags: ['bugs', 'issues', 'defects', 'errors', 'sentry'],
    templateOverrides: { title: 'Active Bugs', color: 'red' as const },
  },
  {
    id: 'recent-activity', name: 'Recent Activity', description: 'Timeline of recent project events, commits, and updates',
    type: 'list', icon: Clock, category: 'project', tags: ['activity', 'recent', 'history', 'feed', 'timeline'],
    templateOverrides: { title: 'Recent Activity', color: 'gray' as const },
  },
  {
    id: 'pr-reviews', name: 'PR Reviews', description: 'Open pull requests awaiting review with labels and reviewers',
    type: 'list', icon: GitPullRequest, category: 'project', tags: ['pull requests', 'code review', 'github', 'merge'],
    templateOverrides: { title: 'PR Reviews', color: 'purple' as const },
  },
  {
    id: 'incidents', name: 'Incident Log', description: 'Active and recent incidents with severity and response status',
    type: 'list', icon: AlertCircle, category: 'project', tags: ['incidents', 'alerts', 'outages', 'on-call'],
    templateOverrides: { title: 'Incidents', color: 'red' as const },
  },
  // Team & People
  {
    id: 'team-overview', name: 'Team Overview', description: 'Team member cards with online status, roles, and avatars',
    type: 'members', icon: Users, category: 'team', tags: ['team', 'members', 'people', 'status'], featured: true,
  },
  {
    id: 'team-availability', name: 'Team Availability', description: 'See who is available, busy, away, or offline at a glance',
    type: 'members', icon: UserCheck, category: 'team', tags: ['availability', 'schedule', 'online', 'presence'],
    templateOverrides: { title: 'Availability', color: 'green' as const },
  },
  {
    id: 'stakeholders', name: 'Stakeholders', description: 'Key stakeholders and decision makers with contact roles',
    type: 'members', icon: Briefcase, category: 'team', tags: ['stakeholders', 'leadership', 'contacts', 'sponsors'],
    templateOverrides: { title: 'Stakeholders', color: 'blue' as const },
  },
  // Personal
  {
    id: 'working-calendar', name: 'Working Calendar', description: 'Interactive month view calendar with meeting indicators',
    type: 'my-calendar' as WidgetType, icon: Calendar, category: 'personal', tags: ['calendar', 'schedule', 'meetings', 'month'], featured: true,
  },
  {
    id: 'incoming-meetings', name: 'Incoming Meetings', description: 'Upcoming meetings with attendees, time, and location',
    type: 'my-meetings' as WidgetType, icon: Clock, category: 'personal', tags: ['meetings', 'upcoming', 'schedule', 'video'],
  },
  {
    id: 'common-services', name: 'Common Services', description: 'Quick access to leave, overtime, expense, travel, IT support, and room booking',
    type: 'my-services' as WidgetType, icon: Briefcase, category: 'personal', tags: ['services', 'leave', 'expense', 'travel', 'booking'],
  },
  {
    id: 'my-requests', name: 'My Requests', description: 'Track your submitted space requests and their approval status',
    type: 'my-requests' as WidgetType, icon: FolderKanban, category: 'personal', tags: ['requests', 'approval', 'status', 'spaces'],
  },
  {
    id: 'pending-approvals', name: 'Pending Approvals', description: 'Items requiring your review and action',
    type: 'my-approvals' as WidgetType, icon: AlertCircle, category: 'personal', tags: ['approvals', 'pending', 'action', 'review'],
  },
  {
    id: 'unread-channels', name: 'Unread Channels', description: 'Channels with unread messages across all spaces',
    type: 'my-unread' as WidgetType, icon: Globe, category: 'personal', tags: ['unread', 'channels', 'messages', 'notifications'],
  },
  {
    id: 'active-threads', name: 'Active Threads', description: 'Threads you are participating in with recent replies',
    type: 'my-threads' as WidgetType, icon: List, category: 'personal', tags: ['threads', 'replies', 'conversations', 'discussions'],
  },
  // Navigation
  {
    id: 'quick-links', name: 'Quick Links', description: 'Frequently used links to tools, docs, and external resources',
    type: 'links', icon: Link2, category: 'navigation', tags: ['links', 'bookmarks', 'resources', 'shortcuts'], featured: true,
  },
  {
    id: 'documentation', name: 'Documentation', description: 'Links to wikis, API docs, runbooks, and knowledge base articles',
    type: 'links', icon: BookOpen, category: 'navigation', tags: ['docs', 'wiki', 'knowledge', 'runbook', 'api'],
    templateOverrides: { title: 'Documentation', color: 'blue' as const },
  },
  {
    id: 'tool-integrations', name: 'Tool Integrations', description: 'Direct links to integrated tools like GitHub, Figma, and Sentry',
    type: 'links', icon: Layers, category: 'navigation', tags: ['tools', 'integrations', 'apps', 'services', 'figma', 'github'],
    templateOverrides: { title: 'Integrations', color: 'purple' as const },
  },
];

function AddWidgetModal({
  onAdd,
  onClose,
}: {
  onAdd: (type: WidgetType, overrides?: Partial<DashboardWidget>) => void;
  onClose: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus search on open
    const timer = setTimeout(() => searchInputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const filteredWidgets = useMemo(() => {
    let results = MARKETPLACE_WIDGETS;

    // Filter by category
    if (activeCategory === 'featured') {
      results = results.filter(w => w.featured);
    } else if (activeCategory !== 'all') {
      results = results.filter(w => w.category === activeCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter(w =>
        w.name.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.tags.some(t => t.includes(q)) ||
        w.category.includes(q)
      );
    }

    return results;
  }, [searchQuery, activeCategory]);

  const featuredWidgets = useMemo(() =>
    MARKETPLACE_WIDGETS.filter(w => w.featured),
  []);

  const showFeatured = activeCategory === 'all' && !searchQuery.trim();

  const handleAddWidget = (mw: MarketplaceWidget) => {
    onAdd(mw.type, mw.templateOverrides);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-[780px] max-h-[85vh] bg-white dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8] px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5 text-white">
              <Sparkles size={20} />
              <div>
                <h2 className="text-[16px] font-bold">{t('dashboardEditor.marketplaceTitle')}</h2>
                <p className="text-[11px] text-white/70">{t('dashboardEditor.marketplaceSubtitle')}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              <X size={18} />
            </button>
          </div>
          {/* Search bar */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('dashboardEditor.searchWidgets')}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/15 text-white placeholder-white/40 text-[13px] outline-none focus:bg-white/20 transition-colors border border-white/10 focus:border-white/25"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Category sidebar */}
          <div className="w-[190px] shrink-0 border-r border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#252525] py-3 px-2 overflow-y-auto">
            <p className="text-[9px] font-bold text-[#999] dark:text-[#666] uppercase tracking-wider px-2 mb-2">{t('dashboardEditor.categories')}</p>
            {MARKETPLACE_CATEGORIES.map(cat => {
              const count = cat.id === 'all' ? MARKETPLACE_WIDGETS.length
                : cat.id === 'featured' ? MARKETPLACE_WIDGETS.filter(w => w.featured).length
                : MARKETPLACE_WIDGETS.filter(w => w.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all mb-0.5 ${
                    activeCategory === cat.id
                      ? 'bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/15 text-[#5b5fc7] dark:text-[#a6a9dc]'
                      : 'text-[#616161] dark:text-[#999] hover:bg-[#f0f0f0] dark:hover:bg-[#333]'
                  }`}
                >
                  <cat.icon size={14} className={activeCategory === cat.id ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : ''} />
                  <span className="text-[12px] font-medium flex-1">{cat.label}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat.id
                      ? 'bg-[#5b5fc7]/15 text-[#5b5fc7] dark:text-[#a6a9dc]'
                      : 'bg-[#e8e8e8] dark:bg-[#3d3d3d] text-[#999]'
                  }`}>{count}</span>
                </button>
              );
            })}

            {/* Widget type legend */}
            <div className="mt-4 pt-3 border-t border-[#e1dfdd] dark:border-[#3d3d3d] px-2">
              <p className="text-[9px] font-bold text-[#999] dark:text-[#666] uppercase tracking-wider mb-2">{t('dashboardEditor.widgetTypes')}</p>
              {WIDGET_TYPES.map(wt => (
                <div key={wt.id} className="flex items-center gap-2 py-1">
                  <wt.icon size={11} className="text-[#999] dark:text-[#666]" />
                  <span className="text-[10px] text-[#999] dark:text-[#666]">{wt.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget grid */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Search results label */}
            {searchQuery.trim() && (
              <div className="flex items-center gap-2 mb-4">
                <Search size={13} className="text-[#999]" />
                <p className="text-[12px] text-[#616161] dark:text-[#8a8a8a]">
                  {filteredWidgets.length} result{filteredWidgets.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            )}

            {/* Featured section */}
            {showFeatured && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star size={14} className="text-[#d4820c]" />
                  <h3 className="text-[13px] font-bold text-[#242424] dark:text-[#f0f0f0]">{t('dashboardEditor.featured')}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {featuredWidgets.map(mw => {
                    const Preview = MINI_PREVIEW[mw.type];
                    return (
                      <button
                        key={mw.id}
                        onClick={() => handleAddWidget(mw)}
                        className="group text-left p-4 rounded-xl border-2 border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7] dark:hover:border-[#5b5fc7] transition-all hover:shadow-md bg-white dark:bg-[#252525] relative overflow-hidden"
                      >
                        <div className="absolute top-2 right-2">
                          <Star size={10} className="text-[#d4820c] fill-[#d4820c]" />
                        </div>
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="w-9 h-9 rounded-lg bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/15 flex items-center justify-center group-hover:bg-[#5b5fc7]/20 transition-colors">
                            <mw.icon size={18} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0] truncate">{mw.name}</p>
                            <p className="text-[10px] text-[#999] dark:text-[#666] truncate">{mw.description}</p>
                          </div>
                        </div>
                        <div className="h-[48px] bg-[#faf9f8] dark:bg-[#1e1f22] rounded-lg p-2.5 flex items-center">
                          <div className="w-full"><Preview /></div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#5b5fc7]/10 text-[#5b5fc7] dark:text-[#a6a9dc]">
                            {WIDGET_TYPES.find(wt => wt.id === mw.type)?.label}
                          </span>
                          {mw.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#f0f0f0] dark:bg-[#3d3d3d] text-[#999] dark:text-[#666]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filtered/All widgets heading */}
            {showFeatured && (
              <div className="flex items-center gap-2 mb-3">
                <LayoutGrid size={14} className="text-[#616161] dark:text-[#999]" />
                <h3 className="text-[13px] font-bold text-[#242424] dark:text-[#f0f0f0]">{t('dashboardEditor.allWidgets')}</h3>
              </div>
            )}

            {!showFeatured && !searchQuery.trim() && (
              <div className="flex items-center gap-2 mb-3">
                {(() => {
                  const cat = MARKETPLACE_CATEGORIES.find(c => c.id === activeCategory);
                  const CatIcon = cat?.icon || LayoutGrid;
                  return <CatIcon size={14} className="text-[#616161] dark:text-[#999]" />;
                })()}
                <h3 className="text-[13px] font-bold text-[#242424] dark:text-[#f0f0f0]">
                  {MARKETPLACE_CATEGORIES.find(c => c.id === activeCategory)?.label || 'Widgets'}
                </h3>
              </div>
            )}

            {/* Widget cards */}
            {filteredWidgets.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {(showFeatured ? MARKETPLACE_WIDGETS : filteredWidgets).map(mw => {
                  const Preview = MINI_PREVIEW[mw.type];
                  return (
                    <button
                      key={mw.id}
                      onClick={() => handleAddWidget(mw)}
                      className="group text-left p-3.5 rounded-xl border border-[#e8e8e8] dark:border-[#3d3d3d] hover:border-[#5b5fc7] dark:hover:border-[#5b5fc7] transition-all hover:shadow-md bg-white dark:bg-[#252525]"
                    >
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/15 flex items-center justify-center group-hover:bg-[#5b5fc7]/20 transition-colors shrink-0">
                          <mw.icon size={15} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-[#242424] dark:text-[#f0f0f0] truncate">{mw.name}</p>
                          <p className="text-[10px] text-[#999] dark:text-[#666] line-clamp-1">{mw.description}</p>
                        </div>
                      </div>
                      <div className="h-[40px] bg-[#faf9f8] dark:bg-[#1e1f22] rounded-lg p-2 flex items-center">
                        <div className="w-full"><Preview /></div>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#5b5fc7]/10 text-[#5b5fc7] dark:text-[#a6a9dc]">
                          {WIDGET_TYPES.find(wt => wt.id === mw.type)?.label}
                        </span>
                        {mw.featured && <Star size={9} className="text-[#d4820c] fill-[#d4820c] ml-0.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#f0f0f0] dark:bg-[#333] flex items-center justify-center mb-4">
                  <Search size={24} className="text-[#ccc] dark:text-[#555]" />
                </div>
                <p className="text-[14px] font-semibold text-[#616161] dark:text-[#999] mb-1">{t('dashboardEditor.noWidgetsFound')}</p>
                <p className="text-[12px] text-[#999] dark:text-[#666] max-w-[240px]">
                  Try a different search term or browse another category
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="mt-3 text-[12px] font-medium text-[#5b5fc7] dark:text-[#a6a9dc] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Dashboard Icon Picker Modal ───

function IconPickerPopover({
  selected,
  onSelect,
  isOpen,
  onClose,
}: {
  selected: string;
  onSelect: (icon: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="absolute top-full left-0 mt-1 bg-white dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-xl z-20 p-3"
    >
      <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-2">{t('dashboardEditor.chooseIcon')}</p>
      <div className="grid grid-cols-5 gap-1.5">
        {DASHBOARD_ICONS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => { onSelect(id); onClose(); }}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              selected === id
                ? 'bg-[#5b5fc7] text-white scale-110'
                : 'bg-[#f5f5f5] dark:bg-[#333] text-[#616161] dark:text-[#999] hover:bg-[#5b5fc7]/15 hover:text-[#5b5fc7]'
            }`}
            title={label}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Drag & Drop Widget Card ───

const WIDGET_DND_TYPE = 'DASHBOARD_WIDGET';

interface DragItem {
  id: string;
  index: number;
}

function DraggableWidgetCard({
  widget,
  index,
  isPreview,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onToggleWide,
  onDuplicate,
  onDelete,
  onMoveWidget,
  totalCount,
}: {
  widget: DashboardWidget;
  index: number;
  isPreview: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleWide: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveWidget: (fromIndex: number, toIndex: number) => void;
  totalCount: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: WIDGET_DND_TYPE,
    item: (): DragItem => ({ id: widget.id, index }),
    canDrag: !isPreview,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: WIDGET_DND_TYPE,
    canDrop: () => !isPreview,
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the item's height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onMoveWidget(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Connect drag handle to the grip icon, and preview + drop to the card
  drag(dragHandleRef);
  dragPreview(drop(ref));

  return (
    <div
      ref={ref}
      className={`relative group ${widget.wide ? 'lg:col-span-2 xl:col-span-3' : ''} transition-all duration-200 ${
        isDragging ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
      } ${isOver && canDrop ? 'ring-2 ring-[#5b5fc7]/40 ring-offset-2 rounded-xl' : ''}`}
    >
      {/* Widget overlay controls (edit mode only) */}
      {!isPreview && (
        <div
          className={`absolute inset-0 z-10 rounded-xl border-2 transition-colors cursor-pointer ${
            isSelected
              ? 'border-[#5b5fc7] shadow-lg shadow-[#5b5fc7]/10'
              : 'border-transparent hover:border-[#5b5fc7]/30'
          }`}
          onClick={onSelect}
        >
          {/* Drag handle */}
          <div
            ref={dragHandleRef}
            className="absolute -left-1 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-0.5 p-1 bg-white dark:bg-[#2b2d31] rounded-lg shadow-lg border border-[#e1dfdd] dark:border-[#3d3d3d]">
              <GripVertical size={14} className="text-[#999] dark:text-[#666]" />
            </div>
          </div>

          {/* Control bar */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-[#2b2d31] rounded-lg shadow-lg border border-[#e1dfdd] dark:border-[#3d3d3d] px-1 py-0.5 z-20">
            <button
              onClick={e => { e.stopPropagation(); onMoveUp(); }}
              disabled={index === 0}
              className="p-1 rounded text-[#616161] dark:text-[#999] hover:bg-[#f0f0f0] dark:hover:bg-[#333] disabled:opacity-30 transition-colors"
              title={t('dashboardEditor.action.moveUp')}
            >
              <ArrowUp size={11} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onMoveDown(); }}
              disabled={index === totalCount - 1}
              className="p-1 rounded text-[#616161] dark:text-[#999] hover:bg-[#f0f0f0] dark:hover:bg-[#333] disabled:opacity-30 transition-colors"
              title={t('dashboardEditor.action.moveDown')}
            >
              <ArrowDown size={11} />
            </button>
            <div className="w-px h-3 bg-[#e1dfdd] dark:bg-[#3d3d3d] mx-0.5" />
            <button
              onClick={e => { e.stopPropagation(); onToggleWide(); }}
              className="p-1 rounded text-[#616161] dark:text-[#999] hover:bg-[#f0f0f0] dark:hover:bg-[#333] transition-colors"
              title={widget.wide ? 'Shrink' : 'Expand'}
            >
              {widget.wide ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDuplicate(); }}
              className="p-1 rounded text-[#616161] dark:text-[#999] hover:bg-[#f0f0f0] dark:hover:bg-[#333] transition-colors"
              title={t('dashboardEditor.action.duplicate')}
            >
              <Copy size={11} />
            </button>
            <div className="w-px h-3 bg-[#e1dfdd] dark:bg-[#3d3d3d] mx-0.5" />
            <button
              onClick={e => { e.stopPropagation(); onDelete(); }}
              className="p-1 rounded text-[#c4314b] hover:bg-[#c4314b]/10 transition-colors"
              title={t('common.delete')}
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      )}

      {/* Actual widget */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <LiveWidgetRenderer widget={widget} />
      </motion.div>
    </div>
  );
}

// ─── Main Editor ───

export function DashboardEditor() {
  const { t } = useI18n();
  const { spaceId: rawSpaceId, dashboardId } = useParams();
  const navigate = useNavigate();

  // Support both /space/:spaceId/dashboard/... and /my/dashboard/...
  const spaceId = rawSpaceId || MY_SPACE_ID;
  const isMyDashboard = spaceId === MY_SPACE_ID;
  const space = isMyDashboard ? null : spaces.find(s => s.id === spaceId);

  const isEditMode = dashboardId && dashboardId !== 'new';

  // Load existing dashboard if editing — prefer custom override, then built-in
  const existingDashboard = useMemo(() => {
    if (!isEditMode) return null;
    const custom = getCustomDashboardsForSpace(spaceId).find(d => d.id === dashboardId);
    if (custom) return custom;
    const builtIn = space?.dashboards.find(d => d.id === dashboardId);
    return builtIn || null;
  }, [isEditMode, spaceId, dashboardId, space]);

  // Dashboard state
  const [name, setName] = useState(existingDashboard?.name || '');
  const [description, setDescription] = useState(existingDashboard?.description || '');
  const [icon, setIcon] = useState(existingDashboard?.icon || 'bar-chart');
  const [widgets, setWidgets] = useState<DashboardWidget[]>(existingDashboard?.widgets || []);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => { setHasChanges(true); }, [name, description, icon, widgets]);

  const selectedWidget = widgets.find(w => w.id === selectedWidgetId) || null;

  const IconComp = DASHBOARD_ICONS.find(i => i.id === icon)?.icon || BarChart3;

  const handleAddWidget = useCallback((type: WidgetType, overrides?: Partial<DashboardWidget>) => {
    const base = createTemplateWidget(type);
    const newWidget = overrides ? { ...base, ...overrides, id: base.id } : base;
    setWidgets(prev => [...prev, newWidget]);
    setSelectedWidgetId(newWidget.id);
    setHasChanges(true);
  }, []);

  const handleUpdateWidget = useCallback((updated: DashboardWidget) => {
    setWidgets(prev => prev.map(w => w.id === updated.id ? updated : w));
  }, []);

  const handleDeleteWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    setSelectedWidgetId(null);
  }, []);

  const handleMoveWidget = useCallback((widgetId: string, direction: 'up' | 'down') => {
    setWidgets(prev => {
      const idx = prev.findIndex(w => w.id === widgetId);
      if (idx < 0) return prev;
      const next = [...prev];
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  const handleDndMoveWidget = useCallback((fromIndex: number, toIndex: number) => {
    setWidgets(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setHasChanges(true);
  }, []);

  const handleDuplicateWidget = useCallback((widgetId: string) => {
    setWidgets(prev => {
      const source = prev.find(w => w.id === widgetId);
      if (!source) return prev;
      const clone = { ...source, id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title: `${source.title} (Copy)` };
      const idx = prev.findIndex(w => w.id === widgetId);
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!name.trim()) return;
    const dashboard: SpaceDashboard = {
      id: isEditMode ? dashboardId! : `custom-${Date.now()}`,
      name: name.trim(),
      icon: icon as SpaceDashboard['icon'],
      description: description.trim(),
      widgets,
    };
    saveCustomDashboard(spaceId, dashboard);
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => {
      if (isMyDashboard) {
        navigate('/recent');
      } else {
        navigate(`/space/${spaceId}/dashboard/${dashboard.id}`);
      }
    }, 600);
  }, [spaceId, name, icon, description, widgets, isEditMode, dashboardId, navigate, isMyDashboard]);

  if (!space && !isMyDashboard) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#1f1f1f]">
        <p className="text-[#616161]">{t('dashboardEditor.spaceNotFound')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f8] dark:bg-[#1f1f1f] overflow-hidden">
      {/* ── Top Bar ── */}
      <div className="shrink-0 bg-white dark:bg-[#252525] border-b border-[#e1dfdd] dark:border-[#3d3d3d]">
        {/* Breadcrumb + actions */}
        <div className="h-[52px] px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-lg text-[#616161] dark:text-[#999] hover:bg-[#f0f0f0] dark:hover:bg-[#333] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="w-px h-5 bg-[#e1dfdd] dark:bg-[#3d3d3d]" />
            <div className="flex items-center gap-2">
              <LayoutDashboard size={16} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
              <span className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0]">
                {isEditMode ? t('dashboardEditor.editDashboard') : t('dashboardEditor.newDashboard')}
              </span>
            </div>
            {hasChanges && !saved && (
              <span className="text-[11px] text-[#d4820c] font-medium ml-2">{t('dashboardEditor.unsavedChanges')}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                isPreview
                  ? 'bg-[#5b5fc7]/10 text-[#5b5fc7] dark:text-[#a6a9dc]'
                  : 'text-[#616161] dark:text-[#999] hover:bg-[#f0f0f0] dark:hover:bg-[#333]'
              }`}
            >
              <Eye size={14} />
              {isPreview ? t('dashboardEditor.editing') : t('common.preview')}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 text-[12px] font-medium text-[#616161] dark:text-[#999] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || saved}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#5b5fc7] hover:bg-[#4a4eb5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm"
            >
              {saved ? <><Check size={14} />{t('dashboardEditor.saved')}</> : <><Save size={14} />{t('dashboardEditor.saveDashboard')}</>}
            </button>
          </div>
        </div>

        {/* Dashboard metadata */}
        {!isPreview && (
          <div className="px-5 pb-4">
            <div className="flex items-start gap-4">
              {/* Icon picker */}
              <div className="relative">
                <button
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5b5fc7] to-[#7b4db8] flex items-center justify-center shrink-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <IconComp size={22} className="text-white" strokeWidth={1.5} />
                  <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <PenLine size={12} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
                <AnimatePresence>
                  <IconPickerPopover
                    selected={icon}
                    onSelect={setIcon}
                    isOpen={showIconPicker}
                    onClose={() => setShowIconPicker(false)}
                  />
                </AnimatePresence>
              </div>

              {/* Name + description */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('dashboardEditor.dashboardName')}
                  className="w-full text-[20px] font-bold text-[#242424] dark:text-[#f0f0f0] bg-transparent outline-none placeholder-[#ccc] dark:placeholder-[#555]"
                  autoFocus
                />
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={t('dashboardEditor.addDescription')}
                  className="w-full text-[13px] text-[#616161] dark:text-[#8a8a8a] bg-transparent outline-none placeholder-[#ccc] dark:placeholder-[#555]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Preview mode header */}
        {isPreview && name && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5b5fc7] to-[#7b4db8] flex items-center justify-center shrink-0 shadow-sm">
                <IconComp size={20} className="text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-[20px] font-bold text-[#242424] dark:text-[#f0f0f0]">{name}</h1>
                {description && <p className="text-[13px] text-[#616161] dark:text-[#8a8a8a]">{description}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 overflow-y-auto p-6">
          {widgets.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center max-w-[400px]"
              >
                <div className="w-20 h-20 rounded-2xl bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/15 flex items-center justify-center mx-auto mb-5">
                  <LayoutGrid size={36} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#242424] dark:text-[#f0f0f0] mb-2">
                  Start building your dashboard
                </h3>
                <p className="text-[14px] text-[#616161] dark:text-[#8a8a8a] mb-6">
                  Add widgets to display metrics, lists, progress bars, team members, and quick links.
                </p>
                <button
                  onClick={() => setShowAddWidget(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5b5fc7] hover:bg-[#4a4eb5] text-white text-[13px] font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  Add Your First Widget
                </button>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Widget grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {widgets.map((widget, idx) => (
                  <DraggableWidgetCard
                    key={widget.id}
                    widget={widget}
                    index={idx}
                    isPreview={isPreview}
                    isSelected={selectedWidgetId === widget.id}
                    onSelect={() => setSelectedWidgetId(selectedWidgetId === widget.id ? null : widget.id)}
                    onMoveUp={() => handleMoveWidget(widget.id, 'up')}
                    onMoveDown={() => handleMoveWidget(widget.id, 'down')}
                    onToggleWide={() => handleUpdateWidget({ ...widget, wide: !widget.wide })}
                    onDuplicate={() => handleDuplicateWidget(widget.id)}
                    onDelete={() => handleDeleteWidget(widget.id)}
                    onMoveWidget={handleDndMoveWidget}
                    totalCount={widgets.length}
                  />
                ))}

                {/* Add widget card */}
                {!isPreview && (
                  <motion.button
                    layout
                    onClick={() => setShowAddWidget(true)}
                    className="min-h-[120px] rounded-xl border-2 border-dashed border-[#d1d1d1] dark:border-[#3d3d3d] hover:border-[#5b5fc7] dark:hover:border-[#5b5fc7] flex flex-col items-center justify-center gap-2 transition-all hover:bg-[#5b5fc7]/3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/15 flex items-center justify-center group-hover:bg-[#5b5fc7]/20 transition-colors">
                      <Plus size={20} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
                    </div>
                    <span className="text-[12px] font-medium text-[#616161] dark:text-[#999] group-hover:text-[#5b5fc7] dark:group-hover:text-[#a6a9dc] transition-colors">
                      Add Widget
                    </span>
                  </motion.button>
                )}
              </div>

              {/* Widget count footer */}
              {!isPreview && (
                <div className="mt-6 text-center">
                  <p className="text-[11px] text-[#999] dark:text-[#666]">
                    {widgets.length} widget{widgets.length !== 1 ? 's' : ''} · Click to configure · Drag to reorder
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Config Panel */}
        <AnimatePresence>
          {!isPreview && selectedWidget && (
            <WidgetConfigPanel
              key={selectedWidget.id}
              widget={selectedWidget}
              onUpdate={handleUpdateWidget}
              onDelete={() => handleDeleteWidget(selectedWidget.id)}
              onClose={() => setSelectedWidgetId(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Add Widget Modal */}
      <AnimatePresence>
        {showAddWidget && (
          <AddWidgetModal
            onAdd={handleAddWidget}
            onClose={() => setShowAddWidget(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
