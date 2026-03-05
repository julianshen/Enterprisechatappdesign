import { Link } from 'react-router';
import { format } from 'date-fns';
import {
  CheckSquare, Video, Mail, ArrowRight, ClipboardCheck, PenLine,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import {
  notifications, tasks, currentUser, meetings,
  recentActivity,
} from '../data/mockData';
import {
  getCustomDashboardsForSpace,
  MY_SPACE_ID, MY_DEFAULT_DASHBOARD_ID,
} from '../data/customDashboards';
import { WidgetRenderer } from './TeamDashboard';

// ─── Icon mapping (same as TeamDashboard) ───
const dashboardIcons: Record<string, LucideIcon> = {
  'bar-chart': BarChart3,
};

// ─── Main Dashboard ───
export function Recent() {
  // Load the "My" dashboard from the unified store
  const myDashboards = getCustomDashboardsForSpace(MY_SPACE_ID);
  const dashboard = myDashboards.find(d => d.id === MY_DEFAULT_DASHBOARD_ID) || myDashboards[0];

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const pendingCount = notifications.filter(n => n.formFields && !n.read).length;
  const taskCount = tasks.filter(t => t.status !== 'done').length;
  const unreadTotal = recentActivity.unread.reduce((s, u) => s + u.count, 0);
  const meetingCount = meetings.filter(m => m.status !== 'completed').length;

  const editUrl = dashboard
    ? `/my/dashboard/${dashboard.id}/edit`
    : `/my/dashboard/new`;

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f8] dark:bg-[#1f1f1f] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-8 pt-6 pb-4 bg-white dark:bg-[#252525] border-b border-[#e1dfdd] dark:border-[#3d3d3d]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#242424] dark:text-[#f0f0f0] mb-1">
              {greeting}, {currentUser.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-[#616161] dark:text-[#8a8a8a]">
              {format(new Date(), 'EEEE, MMMM d, yyyy')} — Here's what needs your attention.
            </p>
          </div>
          <Link
            to={editUrl}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all text-[#616161] dark:text-[#b9bbbe] hover:bg-[#e8e8e8] dark:hover:bg-[#292929] hover:text-[#242424] dark:hover:text-[#f0f0f0]"
          >
            <PenLine size={16} />
            Edit Dashboard
          </Link>
        </div>

        {/* Quick Stats Row */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          {meetingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ecf5fe] dark:bg-[#0078d4]/15 rounded-lg text-[#0078d4] dark:text-[#6cb8f6]">
              <Video size={14} />
              <span className="text-xs font-medium">{meetingCount} meeting{meetingCount > 1 ? 's' : ''} ahead</span>
            </div>
          )}
          {pendingCount > 0 && (
            <Link to="/inbox" className="flex items-center gap-2 px-3 py-1.5 bg-[#fef7ec] dark:bg-[#d4820c]/15 rounded-lg text-[#d4820c] dark:text-[#f0b850] hover:shadow-sm transition-all group">
              <ClipboardCheck size={14} />
              <span className="text-xs font-medium">{pendingCount} pending approval{pendingCount > 1 ? 's' : ''}</span>
              <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          )}
          {taskCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#eeeef8] dark:bg-[#5b5fc7]/15 rounded-lg text-[#5b5fc7] dark:text-[#a6a9dc]">
              <CheckSquare size={14} />
              <span className="text-xs font-medium">{taskCount} open task{taskCount > 1 ? 's' : ''}</span>
            </div>
          )}
          {unreadTotal > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#edf7f0] dark:bg-[#237b4b]/15 rounded-lg text-[#237b4b] dark:text-[#57ab5a]">
              <Mail size={14} />
              <span className="text-xs font-medium">{unreadTotal} unread message{unreadTotal > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Widget Grid — using the same renderer as space dashboards */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 pt-6">
        {dashboard && dashboard.widgets.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {dashboard.widgets.map(w => (
              <WidgetRenderer key={w.id} widget={w} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-[#f0f0f0] dark:bg-[#292929] rounded-2xl flex items-center justify-center mb-4">
              <BarChart3 size={24} className="text-[#b9bbbe] dark:text-[#5a5a5a]" />
            </div>
            <p className="text-[#242424] dark:text-[#f0f0f0] font-medium mb-1">No widgets on your dashboard</p>
            <p className="text-sm text-[#616161] dark:text-[#8a8a8a] mb-4">Click "Edit Dashboard" to add widgets.</p>
          </div>
        )}
      </div>
    </div>
  );
}
