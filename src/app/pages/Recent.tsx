import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
  isToday, isWeekend,
} from 'date-fns';
import {
  Settings2, MessageSquare, CheckSquare, ClipboardCheck, FolderOpen,
  Mail, X, Eye, EyeOff, RotateCcw,
  ChevronRight, ChevronLeft, ArrowRight,
  CalendarDays, Video, Clock, MapPin, Users, Repeat,
  Briefcase, Receipt, Clock3, Plane, Headphones, DoorOpen,
} from 'lucide-react';
import {
  recentActivity, notifications, tasks, files, users, directMessages,
  messages, currentUser, meetings,
} from '../data/mockData';

// ─── Types ───
type WidgetId = 'calendar' | 'meetings' | 'services' | 'messages' | 'tasks' | 'approvals' | 'files' | 'threads' | 'unread';

interface WidgetConfig {
  id: WidgetId;
  label: string;
  icon: typeof MessageSquare;
  color: string;
  bg: string;
  wide?: boolean;
  visible: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'calendar', label: 'Working Calendar', icon: CalendarDays, color: 'text-[#5b5fc7] dark:text-[#a6a9dc]', bg: 'bg-[#eeeef8] dark:bg-[#5b5fc7]/15', visible: true },
  { id: 'meetings', label: 'Incoming Meetings', icon: Video, color: 'text-[#0078d4] dark:text-[#6cb8f6]', bg: 'bg-[#ecf5fe] dark:bg-[#0078d4]/15', visible: true },
  { id: 'services', label: 'Common Services', icon: Briefcase, color: 'text-[#8764b8] dark:text-[#c49ded]', bg: 'bg-[#f3eef9] dark:bg-[#8764b8]/15', visible: true },
  { id: 'approvals', label: 'Pending Approvals', icon: ClipboardCheck, color: 'text-[#d4820c] dark:text-[#f0b850]', bg: 'bg-[#fef7ec] dark:bg-[#d4820c]/15', visible: true },
  { id: 'tasks', label: 'My Tasks', icon: CheckSquare, color: 'text-[#5b5fc7] dark:text-[#a6a9dc]', bg: 'bg-[#eeeef8] dark:bg-[#5b5fc7]/15', visible: true },
  { id: 'messages', label: 'Recent Messages', icon: MessageSquare, color: 'text-[#8764b8] dark:text-[#c49ded]', bg: 'bg-[#f3eef9] dark:bg-[#8764b8]/15', visible: true },
  { id: 'unread', label: 'Unread Channels', icon: Mail, color: 'text-[#237b4b] dark:text-[#57ab5a]', bg: 'bg-[#edf7f0] dark:bg-[#237b4b]/15', visible: true },
  { id: 'files', label: 'Shared Files', icon: FolderOpen, color: 'text-[#0078d4] dark:text-[#6cb8f6]', bg: 'bg-[#ecf5fe] dark:bg-[#0078d4]/15', visible: true },
  { id: 'threads', label: 'Active Threads', icon: MessageSquare, color: 'text-[#c4314b] dark:text-[#f47067]', bg: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15', visible: true },
];

const STORAGE_KEY = 'my-dashboard-prefs';

function loadPrefs(): WidgetConfig[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const prefs = JSON.parse(stored) as { id: WidgetId; visible: boolean }[];
      return DEFAULT_WIDGETS.map(w => {
        const p = prefs.find(p => p.id === w.id);
        return p ? { ...w, visible: p.visible } : w;
      });
    }
  } catch {}
  return DEFAULT_WIDGETS;
}

function savePrefs(widgets: WidgetConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets.map(w => ({ id: w.id, visible: w.visible }))));
}

// ─── Sub-components ───
function WidgetCard({ config, children }: { config: WidgetConfig; children: React.ReactNode }) {
  const Icon = config.icon;
  return (
    <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
          <Icon size={14} className={config.color} />
        </div>
        <h3 className="font-semibold text-[13px] text-[#242424] dark:text-[#f0f0f0]">{config.label}</h3>
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

// ─── Calendar Widget ───
function WorkingCalendarWidget() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Days that have meetings
  const meetingDays = useMemo(() => {
    const set = new Set<string>();
    meetings.forEach(m => {
      set.add(format(m.startTime, 'yyyy-MM-dd'));
    });
    return set;
  }, []);

  const meetingsOnSelected = useMemo(() => {
    return meetings.filter(m => isSameDay(m.startTime, selectedDate));
  }, [selectedDate]);

  const meetingColorMap: Record<string, string> = {
    purple: 'bg-[#5b5fc7]',
    blue: 'bg-[#0078d4]',
    green: 'bg-[#237b4b]',
    orange: 'bg-[#d4820c]',
    red: 'bg-[#c4314b]',
  };

  return (
    <div className="p-3">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="w-6 h-6 rounded-md hover:bg-[#f0f0f0] dark:hover:bg-[#333] flex items-center justify-center text-[#616161] dark:text-[#b9bbbe] transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0]">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="w-6 h-6 rounded-md hover:bg-[#f0f0f0] dark:hover:bg-[#333] flex items-center justify-center text-[#616161] dark:text-[#b9bbbe] transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Week Headers */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {weekDays.map(d => (
          <div
            key={d}
            className={`text-center text-[10px] font-semibold py-1 ${
              d === 'Sa' || d === 'Su'
                ? 'text-[#c4314b]/60 dark:text-[#f47067]/50'
                : 'text-[#8a8a8a] dark:text-[#6d6f78]'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((day) => {
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const weekend = isWeekend(day);
          const selected = isSameDay(day, selectedDate);
          const hasMeeting = meetingDays.has(format(day, 'yyyy-MM-dd'));
          const dayNum = day.getDate();

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`relative flex flex-col items-center justify-center h-8 rounded-lg text-[12px] transition-all ${
                !inMonth
                  ? 'text-[#d1d1d1] dark:text-[#3d3d3d]'
                  : today && selected
                  ? 'bg-[#5b5fc7] text-white font-semibold shadow-sm'
                  : today
                  ? 'bg-[#5b5fc7]/15 text-[#5b5fc7] dark:text-[#a6a9dc] font-semibold'
                  : selected
                  ? 'bg-[#eeeef8] dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc] font-semibold'
                  : weekend
                  ? 'text-[#c4314b]/50 dark:text-[#f47067]/40 hover:bg-[#fdf0f2]/50 dark:hover:bg-[#c4314b]/5'
                  : 'text-[#242424] dark:text-[#e0e0e0] hover:bg-[#f0f0f0] dark:hover:bg-[#333]'
              }`}
            >
              {dayNum}
              {hasMeeting && inMonth && (
                <div className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                  today && selected ? 'bg-white' : 'bg-[#5b5fc7] dark:bg-[#a6a9dc]'
                }`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Meetings */}
      {meetingsOnSelected.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#f0f0f0] dark:border-[#333]">
          <p className="text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider mb-2 px-0.5">
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEE, MMM d')} — {meetingsOnSelected.length} event{meetingsOnSelected.length > 1 ? 's' : ''}
          </p>
          <div className="space-y-1.5">
            {meetingsOnSelected.map(m => (
              <div
                key={m.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              >
                <div className={`w-0.5 h-6 rounded-full ${meetingColorMap[m.color]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[#242424] dark:text-[#e0e0e0] font-medium truncate">{m.title}</p>
                  <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">
                    {format(m.startTime, 'h:mm a')} – {format(m.endTime, 'h:mm a')}
                  </p>
                </div>
                {m.status === 'completed' && (
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#e8e8e8] dark:bg-[#3d3d3d] text-[#8a8a8a] dark:text-[#6d6f78]">
                    Done
                  </span>
                )}
                {m.status === 'in-progress' && (
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#237b4b]/15 text-[#237b4b] dark:text-[#57ab5a] animate-pulse">
                    Live
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Incoming Meetings Widget ───
function IncomingMeetingsWidget() {
  const now = new Date();
  const upcomingMeetings = meetings
    .filter(m => m.status !== 'completed')
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, 5);

  const statusColors: Record<string, { dot: string; bg: string; text: string; label: string }> = {
    'in-progress': {
      dot: 'bg-[#237b4b]',
      bg: 'bg-[#edf7f0] dark:bg-[#237b4b]/15',
      text: 'text-[#237b4b] dark:text-[#57ab5a]',
      label: 'In Progress',
    },
    'upcoming': {
      dot: 'bg-[#0078d4]',
      bg: 'bg-[#ecf5fe] dark:bg-[#0078d4]/15',
      text: 'text-[#0078d4] dark:text-[#6cb8f6]',
      label: 'Upcoming',
    },
  };

  const meetingColorMap: Record<string, string> = {
    purple: 'border-l-[#5b5fc7]',
    blue: 'border-l-[#0078d4]',
    green: 'border-l-[#237b4b]',
    orange: 'border-l-[#d4820c]',
    red: 'border-l-[#c4314b]',
  };

  if (upcomingMeetings.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-[#8a8a8a] dark:text-[#6d6f78]">
        No upcoming meetings
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
      {upcomingMeetings.map(meeting => {
        const organizer = users.find(u => u.id === meeting.organizer);
        const attendeeUsers = meeting.attendees
          .filter(id => id !== currentUser.id)
          .map(id => users.find(u => u.id === id))
          .filter(Boolean)
          .slice(0, 3);
        const extraCount = Math.max(0, meeting.attendees.length - 1 - 3);
        const status = statusColors[meeting.status || 'upcoming'];
        const isCurrentDay = isSameDay(meeting.startTime, now);

        return (
          <div
            key={meeting.id}
            className={`flex gap-3 px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer border-l-[3px] ${meetingColorMap[meeting.color]}`}
          >
            {/* Time column */}
            <div className="shrink-0 w-[52px] text-center pt-0.5">
              <p className="text-[12px] font-semibold text-[#242424] dark:text-[#e0e0e0]">
                {format(meeting.startTime, 'h:mm')}
              </p>
              <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">
                {format(meeting.startTime, 'a')}
              </p>
              {!isCurrentDay && (
                <p className="text-[9px] text-[#8a8a8a] dark:text-[#6d6f78] mt-0.5">
                  {format(meeting.startTime, 'MMM d')}
                </p>
              )}
            </div>

            {/* Info column */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-[13px] font-medium text-[#242424] dark:text-[#e0e0e0] truncate">
                  {meeting.title}
                </p>
                {meeting.status === 'in-progress' && (
                  <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${status.bg} ${status.text} animate-pulse`}>
                    {status.label}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] mb-1.5">
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {format(meeting.startTime, 'h:mm a')} – {format(meeting.endTime, 'h:mm a')}
                </span>
                {meeting.recurring && (
                  <span className="flex items-center gap-0.5">
                    <Repeat size={9} />
                    Recurring
                  </span>
                )}
              </div>

              {/* Location */}
              {meeting.location && (
                <div className="flex items-center gap-1 mb-1.5">
                  {meeting.isOnline ? (
                    <Video size={10} className="text-[#5b5fc7] dark:text-[#a6a9dc] shrink-0" />
                  ) : (
                    <MapPin size={10} className="text-[#8a8a8a] dark:text-[#6d6f78] shrink-0" />
                  )}
                  <span className={`text-[11px] truncate ${
                    meeting.isOnline
                      ? 'text-[#5b5fc7] dark:text-[#a6a9dc]'
                      : 'text-[#8a8a8a] dark:text-[#6d6f78]'
                  }`}>
                    {meeting.location}
                  </span>
                </div>
              )}

              {/* Attendees */}
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  {attendeeUsers.map((u) => (
                    <img
                      key={u!.id}
                      src={u!.avatar}
                      alt={u!.name}
                      className="w-5 h-5 rounded-full border-[1.5px] border-white dark:border-[#252525]"
                      title={u!.name}
                    />
                  ))}
                  {extraCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-[#e8e8e8] dark:bg-[#3d3d3d] border-[1.5px] border-white dark:border-[#252525] flex items-center justify-center">
                      <span className="text-[8px] font-bold text-[#616161] dark:text-[#b9bbbe]">+{extraCount}</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">
                  {meeting.attendees.length} attendee{meeting.attendees.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Common Services Widget ───
const serviceItems = [
  {
    id: 'leave',
    label: 'Apply for Leave',
    description: 'Request time off',
    icon: DoorOpen,
    color: 'text-[#237b4b] dark:text-[#57ab5a]',
    bg: 'bg-[#edf7f0] dark:bg-[#237b4b]/15',
    hoverBg: 'hover:bg-[#edf7f0] dark:hover:bg-[#237b4b]/10',
  },
  {
    id: 'overtime',
    label: 'Overtime',
    description: 'Log extra hours',
    icon: Clock3,
    color: 'text-[#d4820c] dark:text-[#f0b850]',
    bg: 'bg-[#fef7ec] dark:bg-[#d4820c]/15',
    hoverBg: 'hover:bg-[#fef7ec] dark:hover:bg-[#d4820c]/10',
  },
  {
    id: 'expense',
    label: 'Expense',
    description: 'Submit claims',
    icon: Receipt,
    color: 'text-[#5b5fc7] dark:text-[#a6a9dc]',
    bg: 'bg-[#eeeef8] dark:bg-[#5b5fc7]/15',
    hoverBg: 'hover:bg-[#eeeef8] dark:hover:bg-[#5b5fc7]/10',
  },
  {
    id: 'travel',
    label: 'Travel Request',
    description: 'Book business trips',
    icon: Plane,
    color: 'text-[#0078d4] dark:text-[#6cb8f6]',
    bg: 'bg-[#ecf5fe] dark:bg-[#0078d4]/15',
    hoverBg: 'hover:bg-[#ecf5fe] dark:hover:bg-[#0078d4]/10',
  },
  {
    id: 'it-support',
    label: 'IT Support',
    description: 'Get tech help',
    icon: Headphones,
    color: 'text-[#c4314b] dark:text-[#f47067]',
    bg: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15',
    hoverBg: 'hover:bg-[#fdf0f2] dark:hover:bg-[#c4314b]/10',
  },
  {
    id: 'meeting-room',
    label: 'Meeting Room',
    description: 'Reserve a room',
    icon: Users,
    color: 'text-[#8764b8] dark:text-[#c49ded]',
    bg: 'bg-[#f3eef9] dark:bg-[#8764b8]/15',
    hoverBg: 'hover:bg-[#f3eef9] dark:hover:bg-[#8764b8]/10',
  },
];

function CommonServicesWidget() {
  const [activeService, setActiveService] = useState<string | null>(null);

  return (
    <div className="p-3">
      <div className="grid grid-cols-3 gap-2">
        {serviceItems.map(svc => {
          const Icon = svc.icon;
          const isActive = activeService === svc.id;
          return (
            <button
              key={svc.id}
              onClick={() => setActiveService(isActive ? null : svc.id)}
              className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition-all group ${
                isActive
                  ? `border-[#5b5fc7]/30 dark:border-[#5b5fc7]/30 ${svc.bg} shadow-sm`
                  : `border-transparent ${svc.hoverBg} hover:border-[#e1dfdd] dark:hover:border-[#3d3d3d]`
              }`}
            >
              <div className={`w-9 h-9 rounded-xl ${svc.bg} flex items-center justify-center transition-transform ${
                isActive ? 'scale-110' : 'group-hover:scale-105'
              }`}>
                <Icon size={18} className={svc.color} />
              </div>
              <span className="text-[11px] font-medium text-[#242424] dark:text-[#e0e0e0] text-center leading-tight">
                {svc.label}
              </span>
              <span className="text-[9px] text-[#8a8a8a] dark:text-[#6d6f78] text-center leading-tight">
                {svc.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Service Form Preview */}
      {activeService && (
        <div className="mt-3 pt-3 border-t border-[#f0f0f0] dark:border-[#333]">
          {activeService === 'leave' && <LeaveForm onClose={() => setActiveService(null)} />}
          {activeService === 'overtime' && <OvertimeForm onClose={() => setActiveService(null)} />}
          {activeService === 'expense' && <ExpenseForm onClose={() => setActiveService(null)} />}
          {activeService !== 'leave' && activeService !== 'overtime' && activeService !== 'expense' && (
            <div className="text-center py-3">
              <p className="text-[12px] text-[#8a8a8a] dark:text-[#6d6f78] mb-2">
                {serviceItems.find(s => s.id === activeService)?.label} — Coming soon
              </p>
              <button
                onClick={() => setActiveService(null)}
                className="text-[11px] text-[#5b5fc7] dark:text-[#a6a9dc] font-medium hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LeaveForm({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) {
    return (
      <div className="text-center py-3">
        <div className="w-8 h-8 rounded-full bg-[#edf7f0] dark:bg-[#237b4b]/15 flex items-center justify-center mx-auto mb-2">
          <CheckSquare size={14} className="text-[#237b4b] dark:text-[#57ab5a]" />
        </div>
        <p className="text-[12px] font-medium text-[#242424] dark:text-[#e0e0e0]">Leave request submitted!</p>
        <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] mt-0.5">Awaiting manager approval</p>
        <button onClick={onClose} className="text-[11px] text-[#5b5fc7] dark:text-[#a6a9dc] font-medium hover:underline mt-2">
          Close
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-[#242424] dark:text-[#e0e0e0]">Apply for Leave</p>
        <button onClick={onClose} className="text-[#8a8a8a] hover:text-[#242424] dark:hover:text-[#e0e0e0] transition-colors">
          <X size={12} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">Type</label>
          <select className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]">
            <option>Annual Leave</option>
            <option>Sick Leave</option>
            <option>Personal Leave</option>
            <option>Unpaid Leave</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">Duration</label>
          <select className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]">
            <option>Half Day</option>
            <option>1 Day</option>
            <option>2 Days</option>
            <option>3+ Days</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">From</label>
          <input
            type="date"
            defaultValue="2026-02-17"
            className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">To</label>
          <input
            type="date"
            defaultValue="2026-02-17"
            className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]"
          />
        </div>
      </div>
      <textarea
        placeholder="Reason (optional)"
        rows={2}
        className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0] placeholder:text-[#b9bbbe] resize-none"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-[11px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => setSubmitted(true)}
          className="px-3 py-1.5 text-[11px] font-medium text-white bg-[#5b5fc7] hover:bg-[#4b4fbf] rounded-md transition-colors shadow-sm"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

function OvertimeForm({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) {
    return (
      <div className="text-center py-3">
        <div className="w-8 h-8 rounded-full bg-[#fef7ec] dark:bg-[#d4820c]/15 flex items-center justify-center mx-auto mb-2">
          <Clock3 size={14} className="text-[#d4820c] dark:text-[#f0b850]" />
        </div>
        <p className="text-[12px] font-medium text-[#242424] dark:text-[#e0e0e0]">Overtime logged!</p>
        <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] mt-0.5">Pending HR review</p>
        <button onClick={onClose} className="text-[11px] text-[#5b5fc7] dark:text-[#a6a9dc] font-medium hover:underline mt-2">
          Close
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-[#242424] dark:text-[#e0e0e0]">Log Overtime</p>
        <button onClick={onClose} className="text-[#8a8a8a] hover:text-[#242424] dark:hover:text-[#e0e0e0] transition-colors">
          <X size={12} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">Date</label>
          <input
            type="date"
            defaultValue="2026-02-16"
            className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">Hours</label>
          <input
            type="number"
            defaultValue="2"
            min="0.5"
            step="0.5"
            className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]"
          />
        </div>
      </div>
      <textarea
        placeholder="Description of work done"
        rows={2}
        className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0] placeholder:text-[#b9bbbe] resize-none"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-[11px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => setSubmitted(true)}
          className="px-3 py-1.5 text-[11px] font-medium text-white bg-[#d4820c] hover:bg-[#c0760b] rounded-md transition-colors shadow-sm"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

function ExpenseForm({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) {
    return (
      <div className="text-center py-3">
        <div className="w-8 h-8 rounded-full bg-[#eeeef8] dark:bg-[#5b5fc7]/15 flex items-center justify-center mx-auto mb-2">
          <Receipt size={14} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
        </div>
        <p className="text-[12px] font-medium text-[#242424] dark:text-[#e0e0e0]">Expense submitted!</p>
        <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] mt-0.5">Pending finance approval</p>
        <button onClick={onClose} className="text-[11px] text-[#5b5fc7] dark:text-[#a6a9dc] font-medium hover:underline mt-2">
          Close
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-[#242424] dark:text-[#e0e0e0]">Expense Claim</p>
        <button onClick={onClose} className="text-[#8a8a8a] hover:text-[#242424] dark:hover:text-[#e0e0e0] transition-colors">
          <X size={12} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">Category</label>
          <select className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]">
            <option>Meals</option>
            <option>Transport</option>
            <option>Equipment</option>
            <option>Software</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">Amount ($)</label>
          <input
            type="number"
            placeholder="0.00"
            className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0] placeholder:text-[#b9bbbe]"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">Description</label>
        <input
          type="text"
          placeholder="Brief description"
          className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0] placeholder:text-[#b9bbbe]"
        />
      </div>
      <div>
        <label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">Receipt</label>
        <div className="flex items-center gap-2 px-2 py-2 rounded-md border border-dashed border-[#d1d1d1] dark:border-[#3d3d3d] text-center cursor-pointer hover:border-[#5b5fc7] dark:hover:border-[#5b5fc7] transition-colors">
          <FolderOpen size={12} className="text-[#8a8a8a] dark:text-[#6d6f78]" />
          <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">Upload receipt image or PDF</span>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-[11px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => setSubmitted(true)}
          className="px-3 py-1.5 text-[11px] font-medium text-white bg-[#5b5fc7] hover:bg-[#4b4fbf] rounded-md transition-colors shadow-sm"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

// ─── Existing Widgets ───
function PendingApprovalsWidget() {
  const pending = notifications.filter(n => n.formFields && !n.read);
  return (
    <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
      {pending.length === 0 ? (
        <div className="p-4 text-center text-sm text-[#8a8a8a] dark:text-[#6d6f78]">No pending approvals</div>
      ) : (
        pending.slice(0, 4).map(n => (
          <Link key={n.id} to="/inbox" className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors group">
            <div className="w-8 h-8 bg-[#fef7ec] dark:bg-[#d4820c]/15 rounded-full flex items-center justify-center shrink-0">
              <ClipboardCheck size={14} className="text-[#d4820c] dark:text-[#f0b850]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#242424] dark:text-[#e0e0e0] font-medium truncate">{n.title}</p>
              <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78] truncate">{n.from} · {format(n.timestamp, 'MMM d')}</p>
            </div>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#fef7ec] dark:bg-[#d4820c]/15 text-[#d4820c] dark:text-[#f0b850]">
              Action needed
            </span>
            <ChevronRight size={14} className="text-[#d1d1d1] dark:text-[#3d3d3d] group-hover:text-[#8a8a8a] transition-colors shrink-0" />
          </Link>
        ))
      )}
    </div>
  );
}

function MyTasksWidget() {
  const myTasks = tasks.filter(t => t.status !== 'done').slice(0, 5);
  const priorityColors: Record<string, string> = {
    high: 'bg-[#c4314b] text-white',
    medium: 'bg-[#d4820c] text-white',
    low: 'bg-[#e8e8e8] dark:bg-[#3d3d3d] text-[#616161] dark:text-[#b9bbbe]',
  };
  const statusIcons: Record<string, string> = {
    'todo': 'border-2 border-[#d1d1d1] dark:border-[#5a5a5a]',
    'in-progress': 'border-2 border-[#5b5fc7] bg-[#5b5fc7]/20',
  };
  return (
    <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
      {myTasks.length === 0 ? (
        <div className="p-4 text-center text-sm text-[#8a8a8a] dark:text-[#6d6f78]">All tasks done!</div>
      ) : (
        myTasks.map(task => (
          <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors">
            <div className={`w-4 h-4 rounded shrink-0 ${statusIcons[task.status] || ''}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#242424] dark:text-[#e0e0e0] truncate">{task.title}</p>
              <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78]">
                {task.assignee} · Due {format(task.dueDate, 'MMM d')}
              </p>
            </div>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

function RecentMessagesWidget() {
  const recentDMs = directMessages.slice(0, 3);
  return (
    <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
      {recentDMs.map(dm => {
        const user = users.find(u => u.id === dm.userId);
        const statusColor: Record<string, string> = {
          online: 'bg-[#92c353]', away: 'bg-[#ffaa44]', busy: 'bg-[#c4314b]', offline: 'bg-[#858585]',
        };
        return (
          <Link
            key={dm.id}
            to={`/chat/dm/${dm.userId}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors group"
          >
            <div className="relative shrink-0">
              <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full" />
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${statusColor[user?.status || 'offline']} rounded-full border-2 border-white dark:border-[#252525]`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-[#242424] dark:text-[#e0e0e0] font-medium truncate">{user?.name}</span>
                {dm.lastMessageTime && (
                  <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] whitespace-nowrap">{format(dm.lastMessageTime, 'h:mm a')}</span>
                )}
              </div>
              {dm.lastMessage && (
                <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78] truncate">{dm.lastMessage}</p>
              )}
            </div>
            {dm.unreadCount && dm.unreadCount > 0 && (
              <span className="bg-[#c4314b] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {dm.unreadCount}
              </span>
            )}
          </Link>
        );
      })}
      {/* Channel messages */}
      {Object.entries(messages).filter(([key]) => !key.startsWith('dm-') && !key.startsWith('group-')).slice(0, 2).map(([channelId, msgs]) => {
        const lastMsg = msgs[msgs.length - 1];
        const msgUser = users.find(u => u.id === lastMsg.userId);
        return (
          <div key={channelId} className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-[#eeeef8] dark:bg-[#5b5fc7]/15 rounded-full flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-[#5b5fc7] dark:text-[#a6a9dc]">#</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-[#242424] dark:text-[#e0e0e0] font-medium truncate">{channelId.replace(/-/g, ' › ')}</span>
                <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] whitespace-nowrap">{format(lastMsg.timestamp, 'h:mm a')}</span>
              </div>
              <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78] truncate">{msgUser?.name}: {lastMsg.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UnreadChannelsWidget() {
  return (
    <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
      {recentActivity.unread.length === 0 ? (
        <div className="p-4 text-center text-sm text-[#8a8a8a] dark:text-[#6d6f78]">All caught up!</div>
      ) : (
        recentActivity.unread.map(ch => (
          <Link
            key={ch.channelId}
            to={`/space/${ch.spaceName.toLowerCase().replace(' ', '-')}/${ch.channelId}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors group"
          >
            <div className="w-8 h-8 bg-[#edf7f0] dark:bg-[#237b4b]/15 rounded-full flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-[#237b4b] dark:text-[#57ab5a]">#</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#242424] dark:text-[#e0e0e0] font-medium truncate">
                {ch.spaceName} <span className="text-[#d1d1d1] dark:text-[#5a5a5a] mx-1">›</span> {ch.channelName}
              </p>
              <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78]">Last message {format(ch.lastMessage, 'h:mm a')}</p>
            </div>
            <span className="bg-[#c4314b] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {ch.count}
            </span>
          </Link>
        ))
      )}
    </div>
  );
}

function SharedFilesWidget() {
  const recentFiles = files.slice(0, 4);
  const typeIcons: Record<string, { color: string; label: string }> = {
    figma: { color: 'text-[#a259ff]', label: 'FIG' },
    pdf: { color: 'text-[#c4314b]', label: 'PDF' },
    image: { color: 'text-[#0078d4]', label: 'IMG' },
    archive: { color: 'text-[#d4820c]', label: 'ZIP' },
  };
  return (
    <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
      {recentFiles.map(file => {
        const t = typeIcons[file.type] || { color: 'text-[#616161]', label: 'FILE' };
        return (
          <div key={file.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-[#f0f0f0] dark:bg-[#3d3d3d] rounded-lg flex items-center justify-center shrink-0">
              <span className={`text-[9px] font-bold ${t.color}`}>{t.label}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#242424] dark:text-[#e0e0e0] truncate">{file.name}</p>
              <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78]">{file.uploadedBy} · {file.size}</p>
            </div>
            <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">{format(file.uploadedAt, 'MMM d')}</span>
          </div>
        );
      })}
    </div>
  );
}

function ActiveThreadsWidget() {
  return (
    <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
      {recentActivity.threads.length === 0 ? (
        <div className="p-4 text-center text-sm text-[#8a8a8a] dark:text-[#6d6f78]">No active threads</div>
      ) : (
        recentActivity.threads.map(thread => (
          <div key={thread.id} className="px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#8a8a8a] dark:text-[#6d6f78]">{thread.spaceName}</span>
                <span className="text-[#d1d1d1] dark:text-[#5a5a5a]">›</span>
                <span className="text-[#242424] dark:text-[#e0e0e0] font-medium">#{thread.channelName}</span>
              </div>
              <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">{format(thread.lastReply, 'h:mm a')}</span>
            </div>
            <p className="text-sm text-[#424242] dark:text-[#c8c8c8] truncate mb-1.5">{thread.content}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">
              <MessageSquare size={12} />
              <span>{thread.replies} replies</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Widget renderer ───
const widgetRenderers: Record<WidgetId, () => JSX.Element> = {
  calendar: () => <WorkingCalendarWidget />,
  meetings: () => <IncomingMeetingsWidget />,
  services: () => <CommonServicesWidget />,
  approvals: () => <PendingApprovalsWidget />,
  tasks: () => <MyTasksWidget />,
  messages: () => <RecentMessagesWidget />,
  unread: () => <UnreadChannelsWidget />,
  files: () => <SharedFilesWidget />,
  threads: () => <ActiveThreadsWidget />,
};

// ─── Main Dashboard ───
export function Recent() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(loadPrefs);
  const [customizing, setCustomizing] = useState(false);

  useEffect(() => {
    savePrefs(widgets);
  }, [widgets]);

  const toggleWidget = useCallback((id: WidgetId) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  }, []);

  const resetWidgets = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
  }, []);

  const visibleWidgets = widgets.filter(w => w.visible);

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const pendingCount = notifications.filter(n => n.formFields && !n.read).length;
  const taskCount = tasks.filter(t => t.status !== 'done').length;
  const unreadTotal = recentActivity.unread.reduce((s, u) => s + u.count, 0);
  const meetingCount = meetings.filter(m => m.status !== 'completed').length;

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f8] dark:bg-[#1f1f1f] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-8 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#242424] dark:text-[#f0f0f0] mb-1">
              {greeting}, {currentUser.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-[#616161] dark:text-[#8a8a8a]">
              {format(new Date(), 'EEEE, MMMM d, yyyy')} — Here's what needs your attention.
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setCustomizing(!customizing)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                customizing
                  ? 'bg-[#5b5fc7] text-white shadow-md'
                  : 'text-[#616161] dark:text-[#b9bbbe] hover:bg-[#e8e8e8] dark:hover:bg-[#292929] hover:text-[#242424] dark:hover:text-[#f0f0f0]'
              }`}
            >
              <Settings2 size={16} />
              Customize
            </button>
            {/* Customize Panel */}
            {customizing && (
              <div className="absolute right-0 top-full mt-2 w-[280px] bg-white dark:bg-[#2a2a2a] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-xl z-50">
                <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#242424] dark:text-[#f0f0f0]">Dashboard Widgets</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={resetWidgets}
                      className="p-1.5 text-[#616161] dark:text-[#b9bbbe] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-md transition-all"
                      title="Reset to defaults"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button
                      onClick={() => setCustomizing(false)}
                      className="p-1.5 text-[#616161] dark:text-[#b9bbbe] hover:text-[#242424] dark:hover:text-[#f0f0f0] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-md transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <div className="py-1 max-h-[360px] overflow-y-auto">
                  {widgets.map((w) => {
                    const Icon = w.icon;
                    return (
                      <button
                        key={w.id}
                        onClick={() => toggleWidget(w.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f0f0f0] dark:hover:bg-[#333] transition-colors"
                      >
                        <div className={`w-6 h-6 rounded ${w.bg} flex items-center justify-center shrink-0`}>
                          <Icon size={13} className={w.color} />
                        </div>
                        <span className="flex-1 text-left text-sm text-[#242424] dark:text-[#e0e0e0]">{w.label}</span>
                        {w.visible ? (
                          <Eye size={15} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
                        ) : (
                          <EyeOff size={15} className="text-[#b9bbbe] dark:text-[#5a5a5a]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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

      {/* Widget Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {visibleWidgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-[#f0f0f0] dark:bg-[#292929] rounded-2xl flex items-center justify-center mb-4">
              <Settings2 size={24} className="text-[#b9bbbe] dark:text-[#5a5a5a]" />
            </div>
            <p className="text-[#242424] dark:text-[#f0f0f0] font-medium mb-1">No widgets visible</p>
            <p className="text-sm text-[#616161] dark:text-[#8a8a8a] mb-4">Click "Customize" to add widgets to your dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleWidgets.map(w => (
              <WidgetCard key={w.id} config={w}>
                {widgetRenderers[w.id]()}
              </WidgetCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
