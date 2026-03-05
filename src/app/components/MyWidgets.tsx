// ─── Specialized "My" Dashboard Widgets ───
// These are self-contained live widgets that render dynamic content
// and are used as widget types inside the unified dashboard system.

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
  isToday, isWeekend,
} from 'date-fns';
import {
  MessageSquare, CheckSquare, X,
  ChevronRight, ChevronLeft,
  Video, Clock, MapPin, Users, Repeat,
  Briefcase, Receipt, Clock3, Plane, Headphones, DoorOpen,
  FolderKanban, ClipboardCheck,
} from 'lucide-react';
import {
  notifications, tasks, users, currentUser, meetings,
  recentActivity,
} from '../data/mockData';
import {
  getSpaceRequests, subscribeSpaceRequests,
  type SpaceRequest,
} from '../data/spaceRequests';

// ─── Calendar Widget ───
export function WorkingCalendarWidget() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const meetingDays = useMemo(() => {
    const set = new Set<string>();
    meetings.forEach(m => { set.add(format(m.startTime, 'yyyy-MM-dd')); });
    return set;
  }, []);

  const meetingsOnSelected = useMemo(
    () => meetings.filter(m => isSameDay(m.startTime, selectedDate)),
    [selectedDate],
  );

  const meetingColorMap: Record<string, string> = {
    purple: 'bg-[#5b5fc7]', blue: 'bg-[#0078d4]', green: 'bg-[#237b4b]', orange: 'bg-[#d4820c]', red: 'bg-[#c4314b]',
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="w-6 h-6 rounded-md hover:bg-[#f0f0f0] dark:hover:bg-[#333] flex items-center justify-center text-[#616161] dark:text-[#b9bbbe] transition-colors">
          <ChevronLeft size={14} />
        </button>
        <span className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{format(currentMonth, 'MMMM yyyy')}</span>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="w-6 h-6 rounded-md hover:bg-[#f0f0f0] dark:hover:bg-[#333] flex items-center justify-center text-[#616161] dark:text-[#b9bbbe] transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0 mb-1">
        {weekDays.map(d => (
          <div key={d} className={`text-center text-[10px] font-semibold py-1 ${d === 'Sa' || d === 'Su' ? 'text-[#c4314b]/60 dark:text-[#f47067]/50' : 'text-[#8a8a8a] dark:text-[#6d6f78]'}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {days.map(day => {
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const weekend = isWeekend(day);
          const selected = isSameDay(day, selectedDate);
          const hasMeeting = meetingDays.has(format(day, 'yyyy-MM-dd'));
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`relative flex flex-col items-center justify-center h-8 rounded-lg text-[12px] transition-all ${
                !inMonth ? 'text-[#d1d1d1] dark:text-[#3d3d3d]'
                : today && selected ? 'bg-[#5b5fc7] text-white font-semibold shadow-sm'
                : today ? 'bg-[#5b5fc7]/15 text-[#5b5fc7] dark:text-[#a6a9dc] font-semibold'
                : selected ? 'bg-[#eeeef8] dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc] font-semibold'
                : weekend ? 'text-[#c4314b]/50 dark:text-[#f47067]/40 hover:bg-[#fdf0f2]/50 dark:hover:bg-[#c4314b]/5'
                : 'text-[#242424] dark:text-[#e0e0e0] hover:bg-[#f0f0f0] dark:hover:bg-[#333]'
              }`}
            >
              {day.getDate()}
              {hasMeeting && inMonth && (
                <div className={`absolute bottom-0.5 w-1 h-1 rounded-full ${today && selected ? 'bg-white' : 'bg-[#5b5fc7] dark:bg-[#a6a9dc]'}`} />
              )}
            </button>
          );
        })}
      </div>
      {meetingsOnSelected.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#f0f0f0] dark:border-[#333]">
          <p className="text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider mb-2 px-0.5">
            {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEE, MMM d')} — {meetingsOnSelected.length} event{meetingsOnSelected.length > 1 ? 's' : ''}
          </p>
          <div className="space-y-1.5">
            {meetingsOnSelected.map(m => (
              <div key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer">
                <div className={`w-0.5 h-6 rounded-full ${meetingColorMap[m.color]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[#242424] dark:text-[#e0e0e0] font-medium truncate">{m.title}</p>
                  <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">{format(m.startTime, 'h:mm a')} – {format(m.endTime, 'h:mm a')}</p>
                </div>
                {m.status === 'completed' && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#e8e8e8] dark:bg-[#3d3d3d] text-[#8a8a8a] dark:text-[#6d6f78]">Done</span>}
                {m.status === 'in-progress' && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#237b4b]/15 text-[#237b4b] dark:text-[#57ab5a] animate-pulse">Live</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Incoming Meetings Widget ───
export function IncomingMeetingsWidget() {
  const upcomingMeetings = meetings
    .filter(m => m.status !== 'completed')
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, 5);

  const meetingColorMap: Record<string, string> = {
    purple: 'border-l-[#5b5fc7]', blue: 'border-l-[#0078d4]', green: 'border-l-[#237b4b]', orange: 'border-l-[#d4820c]', red: 'border-l-[#c4314b]',
  };

  if (upcomingMeetings.length === 0) {
    return <div className="p-4 text-center text-sm text-[#8a8a8a] dark:text-[#6d6f78]">No upcoming meetings</div>;
  }

  return (
    <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
      {upcomingMeetings.map(meeting => {
        const attendeeUsers = meeting.attendees
          .filter(id => id !== currentUser.id)
          .map(id => users.find(u => u.id === id))
          .filter(Boolean)
          .slice(0, 3);
        const extraCount = Math.max(0, meeting.attendees.length - 1 - 3);
        const isCurrentDay = isSameDay(meeting.startTime, new Date());

        return (
          <div key={meeting.id} className={`flex gap-3 px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer border-l-[3px] ${meetingColorMap[meeting.color]}`}>
            <div className="shrink-0 w-[52px] text-center pt-0.5">
              <p className="text-[12px] font-semibold text-[#242424] dark:text-[#e0e0e0]">{format(meeting.startTime, 'h:mm')}</p>
              <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">{format(meeting.startTime, 'a')}</p>
              {!isCurrentDay && <p className="text-[9px] text-[#8a8a8a] dark:text-[#6d6f78] mt-0.5">{format(meeting.startTime, 'MMM d')}</p>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-[13px] font-medium text-[#242424] dark:text-[#e0e0e0] truncate">{meeting.title}</p>
                {meeting.status === 'in-progress' && (
                  <span className="shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#237b4b]/15 text-[#237b4b] dark:text-[#57ab5a] animate-pulse">In Progress</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] mb-1.5">
                <span className="flex items-center gap-1"><Clock size={10} />{format(meeting.startTime, 'h:mm a')} – {format(meeting.endTime, 'h:mm a')}</span>
                {meeting.recurring && <span className="flex items-center gap-0.5"><Repeat size={9} />Recurring</span>}
              </div>
              {meeting.location && (
                <div className="flex items-center gap-1 mb-1.5">
                  {meeting.isOnline ? <Video size={10} className="text-[#5b5fc7] dark:text-[#a6a9dc] shrink-0" /> : <MapPin size={10} className="text-[#8a8a8a] dark:text-[#6d6f78] shrink-0" />}
                  <span className={`text-[11px] truncate ${meeting.isOnline ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#8a8a8a] dark:text-[#6d6f78]'}`}>{meeting.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  {attendeeUsers.map(u => (
                    <img key={u!.id} src={u!.avatar} alt={u!.name} className="w-5 h-5 rounded-full border-[1.5px] border-white dark:border-[#252525]" title={u!.name} />
                  ))}
                  {extraCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-[#e8e8e8] dark:bg-[#3d3d3d] border-[1.5px] border-white dark:border-[#252525] flex items-center justify-center">
                      <span className="text-[8px] font-bold text-[#616161] dark:text-[#b9bbbe]">+{extraCount}</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">{meeting.attendees.length} attendee{meeting.attendees.length > 1 ? 's' : ''}</span>
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
  { id: 'leave', label: 'Apply for Leave', description: 'Request time off', icon: DoorOpen, color: 'text-[#237b4b] dark:text-[#57ab5a]', bg: 'bg-[#edf7f0] dark:bg-[#237b4b]/15', hoverBg: 'hover:bg-[#edf7f0] dark:hover:bg-[#237b4b]/10' },
  { id: 'overtime', label: 'Overtime', description: 'Log extra hours', icon: Clock3, color: 'text-[#d4820c] dark:text-[#f0b850]', bg: 'bg-[#fef7ec] dark:bg-[#d4820c]/15', hoverBg: 'hover:bg-[#fef7ec] dark:hover:bg-[#d4820c]/10' },
  { id: 'expense', label: 'Expense', description: 'Submit claims', icon: Receipt, color: 'text-[#5b5fc7] dark:text-[#a6a9dc]', bg: 'bg-[#eeeef8] dark:bg-[#5b5fc7]/15', hoverBg: 'hover:bg-[#eeeef8] dark:hover:bg-[#5b5fc7]/10' },
  { id: 'travel', label: 'Travel Request', description: 'Book business trips', icon: Plane, color: 'text-[#0078d4] dark:text-[#6cb8f6]', bg: 'bg-[#ecf5fe] dark:bg-[#0078d4]/15', hoverBg: 'hover:bg-[#ecf5fe] dark:hover:bg-[#0078d4]/10' },
  { id: 'it-support', label: 'IT Support', description: 'Get tech help', icon: Headphones, color: 'text-[#c4314b] dark:text-[#f47067]', bg: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15', hoverBg: 'hover:bg-[#fdf0f2] dark:hover:bg-[#c4314b]/10' },
  { id: 'meeting-room', label: 'Meeting Room', description: 'Reserve a room', icon: Users, color: 'text-[#8764b8] dark:text-[#c49ded]', bg: 'bg-[#f3eef9] dark:bg-[#8764b8]/15', hoverBg: 'hover:bg-[#f3eef9] dark:hover:bg-[#8764b8]/10' },
];

function ServiceForm({ serviceId, onClose }: { serviceId: string; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const svc = serviceItems.find(s => s.id === serviceId);
  if (!svc) return null;

  if (submitted) {
    return (
      <div className="text-center py-3">
        <div className={`w-8 h-8 rounded-full ${svc.bg} flex items-center justify-center mx-auto mb-2`}>
          <CheckSquare size={14} className={svc.color} />
        </div>
        <p className="text-[12px] font-medium text-[#242424] dark:text-[#e0e0e0]">{svc.label} submitted!</p>
        <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] mt-0.5">Your request is being processed</p>
        <button onClick={onClose} className="text-[11px] text-[#5b5fc7] dark:text-[#a6a9dc] font-medium hover:underline mt-2">Close</button>
      </div>
    );
  }

  if (serviceId === 'leave') {
    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold text-[#242424] dark:text-[#e0e0e0]">Apply for Leave</p>
          <button onClick={onClose} className="text-[#8a8a8a] hover:text-[#242424] dark:hover:text-[#e0e0e0] transition-colors"><X size={12} /></button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">Type</label>
            <select className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]">
              <option>Annual Leave</option><option>Sick Leave</option><option>Personal Leave</option><option>Unpaid Leave</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">Duration</label>
            <select className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]">
              <option>Half Day</option><option>1 Day</option><option>2 Days</option><option>3+ Days</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">From</label><input type="date" defaultValue="2026-03-06" className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]" /></div>
          <div><label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">To</label><input type="date" defaultValue="2026-03-06" className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]" /></div>
        </div>
        <textarea placeholder="Reason (optional)" rows={2} className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0] placeholder:text-[#b9bbbe] resize-none" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-[11px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-md transition-colors">Cancel</button>
          <button onClick={() => setSubmitted(true)} className="px-3 py-1.5 text-[11px] font-medium text-white bg-[#5b5fc7] hover:bg-[#4b4fbf] rounded-md transition-colors shadow-sm">Submit</button>
        </div>
      </div>
    );
  }

  if (serviceId === 'overtime') {
    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold text-[#242424] dark:text-[#e0e0e0]">Log Overtime</p>
          <button onClick={onClose} className="text-[#8a8a8a] hover:text-[#242424] dark:hover:text-[#e0e0e0] transition-colors"><X size={12} /></button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">Date</label><input type="date" defaultValue="2026-03-05" className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]" /></div>
          <div><label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">Hours</label><input type="number" defaultValue="2" min="0.5" step="0.5" className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]" /></div>
        </div>
        <textarea placeholder="Description of work done" rows={2} className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0] placeholder:text-[#b9bbbe] resize-none" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-[11px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-md transition-colors">Cancel</button>
          <button onClick={() => setSubmitted(true)} className="px-3 py-1.5 text-[11px] font-medium text-white bg-[#d4820c] hover:bg-[#c0760b] rounded-md transition-colors shadow-sm">Submit</button>
        </div>
      </div>
    );
  }

  if (serviceId === 'meeting-room') {
    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold text-[#242424] dark:text-[#e0e0e0]">Reserve Meeting Room</p>
          <button onClick={onClose} className="text-[#8a8a8a] hover:text-[#242424] dark:hover:text-[#e0e0e0] transition-colors"><X size={12} /></button>
        </div>
        <div>
          <label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">Room</label>
          <select className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]">
            <option>Conference Room A (10 pax)</option><option>Conference Room B (6 pax)</option><option>Huddle Space 1 (4 pax)</option><option>Board Room (20 pax)</option><option>Phone Booth 1 (1 pax)</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div><label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">Date</label><input type="date" defaultValue="2026-03-06" className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]" /></div>
          <div><label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">Start</label><input type="time" defaultValue="10:00" className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]" /></div>
          <div><label className="text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-0.5 block">End</label><input type="time" defaultValue="11:00" className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0]" /></div>
        </div>
        <input type="text" placeholder="Meeting title" className="w-full text-[11px] px-2 py-1.5 rounded-md border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#2a2a2a] text-[#242424] dark:text-[#e0e0e0] placeholder:text-[#b9bbbe]" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-[11px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-md transition-colors">Cancel</button>
          <button onClick={() => setSubmitted(true)} className="px-3 py-1.5 text-[11px] font-medium text-white bg-[#8764b8] hover:bg-[#7556a8] rounded-md transition-colors shadow-sm">Reserve</button>
        </div>
      </div>
    );
  }

  // Generic form for expense, travel, it-support
  return (
    <div className="text-center py-3">
      <p className="text-[12px] text-[#8a8a8a] dark:text-[#6d6f78] mb-2">{svc.label} — Coming soon</p>
      <button onClick={onClose} className="text-[11px] text-[#5b5fc7] dark:text-[#a6a9dc] font-medium hover:underline">Dismiss</button>
    </div>
  );
}

export function CommonServicesWidget() {
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
              <div className={`w-9 h-9 rounded-xl ${svc.bg} flex items-center justify-center transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                <Icon size={18} className={svc.color} />
              </div>
              <span className="text-[11px] font-medium text-[#242424] dark:text-[#e0e0e0] text-center leading-tight">{svc.label}</span>
              <span className="text-[9px] text-[#8a8a8a] dark:text-[#6d6f78] text-center leading-tight">{svc.description}</span>
            </button>
          );
        })}
      </div>
      {activeService && (
        <div className="mt-3 pt-3 border-t border-[#f0f0f0] dark:border-[#333]">
          <ServiceForm serviceId={activeService} onClose={() => setActiveService(null)} />
        </div>
      )}
    </div>
  );
}

// ─── My Requests Widget ───
export function MyRequestsWidget() {
  const [requests, setRequests] = useState<SpaceRequest[]>([]);

  useEffect(() => {
    setRequests(getSpaceRequests().filter(r => r.requesterId === 'user-1'));
    return subscribeSpaceRequests(() => {
      setRequests(getSpaceRequests().filter(r => r.requesterId === 'user-1'));
    });
  }, []);

  const statusMap: Record<string, { label: string; className: string }> = {
    'pending-owner': { label: 'Awaiting Owner', className: 'bg-[#fef7ec] dark:bg-[#d4820c]/15 text-[#d4820c] dark:text-[#f0b850]' },
    'pending-admin': { label: 'Awaiting Admin', className: 'bg-[#eeeef8] dark:bg-[#5b5fc7]/15 text-[#5b5fc7] dark:text-[#a6a9dc]' },
    'approved': { label: 'Approved', className: 'bg-[#edf7f0] dark:bg-[#237b4b]/15 text-[#237b4b] dark:text-[#57ab5a]' },
    'rejected': { label: 'Rejected', className: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15 text-[#c4314b] dark:text-[#f47067]' },
  };

  if (requests.length === 0) {
    return <div className="p-4 text-center text-sm text-[#8a8a8a] dark:text-[#6d6f78]">No requests yet</div>;
  }

  return (
    <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
      {requests.slice(0, 5).map(req => {
        const status = statusMap[req.status] || statusMap['pending-owner'];
        return (
          <Link key={req.id} to="/inbox" className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${req.scenarioColor}, ${req.scenarioColor}dd)` }}>
              <FolderKanban size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#242424] dark:text-[#e0e0e0] font-medium truncate">{req.spaceName}</p>
              <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78] truncate">{req.scenarioName} · {format(new Date(req.createdAt), 'MMM d')}</p>
            </div>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap ${status.className}`}>{status.label}</span>
            <ChevronRight size={14} className="text-[#d1d1d1] dark:text-[#3d3d3d] group-hover:text-[#8a8a8a] transition-colors shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}

// ─── Pending Approvals Widget ───
export function PendingApprovalsWidget() {
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
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#fef7ec] dark:bg-[#d4820c]/15 text-[#d4820c] dark:text-[#f0b850]">Action needed</span>
            <ChevronRight size={14} className="text-[#d1d1d1] dark:text-[#3d3d3d] group-hover:text-[#8a8a8a] transition-colors shrink-0" />
          </Link>
        ))
      )}
    </div>
  );
}

// ─── Unread Channels Widget ───
export function UnreadChannelsWidget() {
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
            <span className="bg-[#c4314b] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{ch.count}</span>
          </Link>
        ))
      )}
    </div>
  );
}

// ─── Active Threads Widget ───
export function ActiveThreadsWidget() {
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

// ─── Renderer map (used by TeamDashboard & DashboardEditor) ───
export function renderMyWidget(type: string): React.ReactNode {
  switch (type) {
    case 'my-calendar': return <WorkingCalendarWidget />;
    case 'my-meetings': return <IncomingMeetingsWidget />;
    case 'my-services': return <CommonServicesWidget />;
    case 'my-requests': return <MyRequestsWidget />;
    case 'my-approvals': return <PendingApprovalsWidget />;
    case 'my-unread': return <UnreadChannelsWidget />;
    case 'my-threads': return <ActiveThreadsWidget />;
    default: return null;
  }
}

// Check if a widget type is a "my" specialized widget
export function isMyWidgetType(type: string): boolean {
  return type.startsWith('my-');
}
