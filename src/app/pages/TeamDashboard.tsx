import { useParams, Link } from 'react-router';
import {
  BarChart3, Rocket, Shield, GitPullRequest, Layers, Target, Calendar, Megaphone,
  Users, BookOpen, TrendingUp, TrendingDown, Minus, ExternalLink,
  PenLine,
  type LucideIcon,
} from 'lucide-react';
import {
  spaces,
  type DashboardWidget,
  type MetricData,
  type ListData,
  type ProgressData,
  type MembersData,
  type LinksData,
} from '../data/mockData';
import { getCustomDashboardsForSpace, MY_SPACE_ID } from '../data/customDashboards';
import { renderMyWidget, isMyWidgetType } from '../components/MyWidgets';

// ─── Icon mapping ───
const dashboardIcons: Record<string, LucideIcon> = {
  'bar-chart': BarChart3,
  'rocket': Rocket,
  'shield': Shield,
  'git-pull-request': GitPullRequest,
  'layers': Layers,
  'target': Target,
  'calendar': Calendar,
  'megaphone': Megaphone,
  'users': Users,
  'book-open': BookOpen,
};

// ─── Color palette ───
const colorMap: Record<string, { border: string; bg: string; text: string; light: string }> = {
  purple: { border: 'border-[#5b5fc7]/20', bg: 'bg-[#eeeef8] dark:bg-[#5b5fc7]/15', text: 'text-[#5b5fc7] dark:text-[#a6a9dc]', light: 'bg-[#f5f5fc] dark:bg-[#5b5fc7]/5' },
  blue: { border: 'border-[#0078d4]/20', bg: 'bg-[#ecf5fe] dark:bg-[#0078d4]/15', text: 'text-[#0078d4] dark:text-[#6cb8f6]', light: 'bg-[#f5faff] dark:bg-[#0078d4]/5' },
  green: { border: 'border-[#237b4b]/20', bg: 'bg-[#edf7f0] dark:bg-[#237b4b]/15', text: 'text-[#237b4b] dark:text-[#57ab5a]', light: 'bg-[#f5fbf7] dark:bg-[#237b4b]/5' },
  orange: { border: 'border-[#d4820c]/20', bg: 'bg-[#fef7ec] dark:bg-[#d4820c]/15', text: 'text-[#d4820c] dark:text-[#f0b850]', light: 'bg-[#fffbf5] dark:bg-[#d4820c]/5' },
  red: { border: 'border-[#c4314b]/20', bg: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15', text: 'text-[#c4314b] dark:text-[#f47067]', light: 'bg-[#fef8f8] dark:bg-[#c4314b]/5' },
  gray: { border: 'border-[#616161]/15', bg: 'bg-[#f0f0f0] dark:bg-[#3d3d3d]', text: 'text-[#616161] dark:text-[#b9bbbe]', light: 'bg-[#fafafa] dark:bg-[#2a2a2a]' },
};

const statusColorMap: Record<string, string> = {
  blue: 'bg-[#ecf5fe] dark:bg-[#0078d4]/15 text-[#0078d4] dark:text-[#6cb8f6]',
  green: 'bg-[#edf7f0] dark:bg-[#237b4b]/15 text-[#237b4b] dark:text-[#57ab5a]',
  orange: 'bg-[#fef7ec] dark:bg-[#d4820c]/15 text-[#d4820c] dark:text-[#f0b850]',
  red: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15 text-[#c4314b] dark:text-[#f47067]',
  gray: 'bg-[#f0f0f0] dark:bg-[#3d3d3d] text-[#616161] dark:text-[#b9bbbe]',
  purple: 'bg-[#eeeef8] dark:bg-[#5b5fc7]/15 text-[#5b5fc7] dark:text-[#a6a9dc]',
};

const progressColorMap: Record<string, string> = {
  blue: 'bg-[#0078d4]',
  green: 'bg-[#237b4b]',
  orange: 'bg-[#d4820c]',
  red: 'bg-[#c4314b]',
  purple: 'bg-[#5b5fc7]',
  gray: 'bg-[#616161]',
};

// ─── Widget renderers ───
function MetricWidget({ widget }: { widget: DashboardWidget }) {
  const data = widget.data as MetricData;
  const c = colorMap[widget.color];
  return (
    <div className={`bg-white dark:bg-[#252525] rounded-xl border ${c.border} shadow-sm overflow-hidden ${widget.wide ? 'lg:col-span-2 xl:col-span-3' : ''}`}>
      <div className={`px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] flex items-center gap-2.5 ${c.light}`}>
        <h3 className="font-semibold text-[13px] text-[#242424] dark:text-[#f0f0f0]">{widget.title}</h3>
      </div>
      <div className={`grid gap-0 divide-x divide-[#f0f0f0] dark:divide-[#333] ${data.items.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {data.items.map((item, i) => (
          <div key={i} className="px-4 py-4 text-center">
            <p className="text-[22px] font-bold text-[#242424] dark:text-[#f0f0f0] mb-0.5">{item.value}</p>
            <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a] mb-1">{item.label}</p>
            {item.change && (
              <div className="flex items-center justify-center gap-1">
                {item.changeType === 'up' && <TrendingUp size={11} className="text-[#237b4b] dark:text-[#57ab5a]" />}
                {item.changeType === 'down' && <TrendingDown size={11} className="text-[#c4314b] dark:text-[#f47067]" />}
                {item.changeType === 'neutral' && <Minus size={11} className="text-[#616161] dark:text-[#8a8a8a]" />}
                <span className={`text-[10px] font-medium ${
                  item.changeType === 'up' ? 'text-[#237b4b] dark:text-[#57ab5a]' :
                  item.changeType === 'down' ? 'text-[#c4314b] dark:text-[#f47067]' :
                  'text-[#616161] dark:text-[#8a8a8a]'
                }`}>{item.change}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ListWidget({ widget }: { widget: DashboardWidget }) {
  const data = widget.data as ListData;
  const c = colorMap[widget.color];
  return (
    <div className={`bg-white dark:bg-[#252525] rounded-xl border ${c.border} shadow-sm overflow-hidden ${widget.wide ? 'lg:col-span-2 xl:col-span-3' : ''}`}>
      <div className={`px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] flex items-center justify-between ${c.light}`}>
        <h3 className="font-semibold text-[13px] text-[#242424] dark:text-[#f0f0f0]">{widget.title}</h3>
        <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">{data.items.length} items</span>
      </div>
      <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
        {data.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#242424] dark:text-[#e0e0e0] truncate">{item.label}</p>
              {item.sublabel && <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78] truncate mt-0.5">{item.sublabel}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {item.badge && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColorMap[item.badgeColor || 'gray']}`}>
                  {item.badge}
                </span>
              )}
              {item.status && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${statusColorMap[item.statusColor || 'gray']}`}>
                  {item.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressWidget({ widget }: { widget: DashboardWidget }) {
  const data = widget.data as ProgressData;
  const c = colorMap[widget.color];
  return (
    <div className={`bg-white dark:bg-[#252525] rounded-xl border ${c.border} shadow-sm overflow-hidden ${widget.wide ? 'lg:col-span-2 xl:col-span-3' : ''}`}>
      <div className={`px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] ${c.light}`}>
        <h3 className="font-semibold text-[13px] text-[#242424] dark:text-[#f0f0f0]">{widget.title}</h3>
      </div>
      <div className="p-4 space-y-4">
        {data.items.map((item, i) => {
          const pct = Math.min(Math.round((item.value / item.max) * 100), 100);
          const barColor = progressColorMap[item.color || 'blue'];
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-[#242424] dark:text-[#e0e0e0]">{item.label}</span>
                <span className="text-xs text-[#8a8a8a] dark:text-[#6d6f78] font-medium">
                  {item.max === 100 ? `${pct}%` : `${item.value} / ${item.max}`}
                </span>
              </div>
              <div className="h-2 bg-[#f0f0f0] dark:bg-[#3d3d3d] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MembersWidget({ widget }: { widget: DashboardWidget }) {
  const data = widget.data as MembersData;
  const c = colorMap[widget.color];
  const statusDot: Record<string, string> = {
    online: 'bg-[#92c353]',
    away: 'bg-[#ffaa44]',
    busy: 'bg-[#c4314b]',
    offline: 'bg-[#858585]',
  };
  return (
    <div className={`bg-white dark:bg-[#252525] rounded-xl border ${c.border} shadow-sm overflow-hidden ${widget.wide ? 'lg:col-span-2 xl:col-span-3' : ''}`}>
      <div className={`px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] flex items-center justify-between ${c.light}`}>
        <h3 className="font-semibold text-[13px] text-[#242424] dark:text-[#f0f0f0]">{widget.title}</h3>
        <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">{data.members.length} members</span>
      </div>
      <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
        {data.members.map((m, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors">
            <div className="relative shrink-0">
              <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full" />
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${statusDot[m.status]} rounded-full border-2 border-white dark:border-[#252525]`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#242424] dark:text-[#e0e0e0] font-medium truncate">{m.name}</p>
              <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78]">{m.role}</p>
            </div>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${
              m.status === 'online' ? 'bg-[#edf7f0] dark:bg-[#237b4b]/15 text-[#237b4b] dark:text-[#57ab5a]' :
              m.status === 'away' ? 'bg-[#fef7ec] dark:bg-[#d4820c]/15 text-[#d4820c] dark:text-[#f0b850]' :
              m.status === 'busy' ? 'bg-[#fdf0f2] dark:bg-[#c4314b]/15 text-[#c4314b] dark:text-[#f47067]' :
              'bg-[#f0f0f0] dark:bg-[#3d3d3d] text-[#616161] dark:text-[#b9bbbe]'
            }`}>{m.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinksWidget({ widget }: { widget: DashboardWidget }) {
  const data = widget.data as LinksData;
  const c = colorMap[widget.color];
  return (
    <div className={`bg-white dark:bg-[#252525] rounded-xl border ${c.border} shadow-sm overflow-hidden ${widget.wide ? 'lg:col-span-2 xl:col-span-3' : ''}`}>
      <div className={`px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] ${c.light}`}>
        <h3 className="font-semibold text-[13px] text-[#242424] dark:text-[#f0f0f0]">{widget.title}</h3>
      </div>
      <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
        {data.items.map((item, i) => (
          <a
            key={i}
            href={item.url}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors group"
          >
            <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
              <ExternalLink size={14} className={c.text} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#242424] dark:text-[#e0e0e0] font-medium group-hover:text-[#5b5fc7] dark:group-hover:text-[#a6a9dc] transition-colors truncate">{item.label}</p>
              {item.description && <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78] truncate">{item.description}</p>}
            </div>
            <ExternalLink size={12} className="text-[#d1d1d1] dark:text-[#3d3d3d] group-hover:text-[#8a8a8a] transition-colors shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── "My" widget wrapper ───
function MyWidgetCard({ widget }: { widget: DashboardWidget }) {
  const c = colorMap[widget.color];
  return (
    <div className={`bg-white dark:bg-[#252525] rounded-xl border ${c.border} shadow-sm overflow-hidden ${widget.wide ? 'lg:col-span-2 xl:col-span-3' : ''}`}>
      <div className={`px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] flex items-center gap-2.5 ${c.light}`}>
        <h3 className="font-semibold text-[13px] text-[#242424] dark:text-[#f0f0f0]">{widget.title}</h3>
      </div>
      <div className="flex-1 overflow-hidden">
        {renderMyWidget(widget.type)}
      </div>
    </div>
  );
}

// ─── Widget factory ───
export function WidgetRenderer({ widget }: { widget: DashboardWidget }) {
  // Handle "my-*" specialized widget types
  if (isMyWidgetType(widget.type)) {
    return <MyWidgetCard widget={widget} />;
  }
  switch (widget.type) {
    case 'metric': return <MetricWidget widget={widget} />;
    case 'list': return <ListWidget widget={widget} />;
    case 'progress': return <ProgressWidget widget={widget} />;
    case 'members': return <MembersWidget widget={widget} />;
    case 'links': return <LinksWidget widget={widget} />;
    default: return null;
  }
}

// ─── Main Page ───
export function TeamDashboard() {
  const { spaceId, dashboardId } = useParams();

  const isMyDashboard = spaceId === MY_SPACE_ID;
  const space = isMyDashboard ? null : spaces.find(s => s.id === spaceId);

  // Prefer custom (edited) version over built-in
  const dashboard = spaceId
    ? getCustomDashboardsForSpace(spaceId).find(d => d.id === dashboardId)
      || space?.dashboards.find(d => d.id === dashboardId)
    : undefined;

  if ((!space && !isMyDashboard) || !dashboard) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#1f1f1f]">
        <div className="text-center">
          <p className="text-[#242424] dark:text-[#f0f0f0] font-medium mb-1">Dashboard not found</p>
          <p className="text-sm text-[#616161] dark:text-[#8a8a8a]">The dashboard you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const DashIcon = dashboardIcons[dashboard.icon] || BarChart3;
  const editUrl = isMyDashboard
    ? `/my/dashboard/${dashboardId}/edit`
    : `/space/${spaceId}/dashboard/${dashboardId}/edit`;
  const breadcrumbLink = isMyDashboard
    ? '/recent'
    : `/space/${spaceId}/${space!.channels[0]?.id}`;
  const breadcrumbLabel = isMyDashboard ? 'My' : space!.name;

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f8] dark:bg-[#1f1f1f] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 pt-5 pb-4 bg-white dark:bg-[#252525] border-b border-[#e1dfdd] dark:border-[#3d3d3d]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-[#8a8a8a] dark:text-[#6d6f78]">
            <Link
              to={breadcrumbLink}
              className="hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc] transition-colors"
            >
              {breadcrumbLabel}
            </Link>
            <span className="text-[#d1d1d1] dark:text-[#3d3d3d]">/</span>
            <span className="text-[#424242] dark:text-[#c8c8c8]">{dashboard.name}</span>
          </div>
          <Link
            to={editUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#616161] dark:text-[#999] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-lg transition-colors"
          >
            <PenLine size={13} />
            Edit Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5b5fc7] to-[#7b7dd8] flex items-center justify-center shrink-0 shadow-sm">
            <DashIcon size={20} className="text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-[#242424] dark:text-[#f0f0f0]">{dashboard.name}</h1>
            <p className="text-sm text-[#616161] dark:text-[#8a8a8a]">{dashboard.description}</p>
          </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {dashboard.widgets.map(w => (
            <WidgetRenderer key={w.id} widget={w} />
          ))}
        </div>
      </div>
    </div>
  );
}
