import React from 'react';
import {
  Calendar, Clock, MapPin, Users, Video, Phone,
  Plus, Search,
  CheckCircle2, AlertCircle, Monitor,
  Projector, Globe,
  Edit, Copy, Repeat,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from "@/lib/utils";
import { useI18n } from '../context/I18nContext';

const { useState, useMemo, useCallback } = React;

// ─── Types ───

type MeetingStatus = 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
type RoomStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
type ViewMode = 'schedule' | 'rooms' | 'new-meeting';

interface Meeting {
  id: string;
  title: string;
  organizer: string;
  organizerAvatar: string;
  organizerColor: string;
  startTime: string;
  endTime: string;
  date: string;
  room: string;
  roomId: string;
  attendees: { name: string; avatar: string; color: string; accepted: boolean }[];
  type: 'video' | 'in-person' | 'hybrid';
  status: MeetingStatus;
  recurring?: string;
  description?: string;
  agenda?: string[];
}

interface Room {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  amenities: string[];
  status: RoomStatus;
  currentMeeting?: string;
  nextAvailable?: string;
  photo: string;
}

// ─── Mock Data ───

const ROOMS: Room[] = [
  { id: 'r1', name: 'Horizon', floor: '3F', capacity: 12, amenities: ['Display', 'Webcam', 'Whiteboard', 'Phone'], status: 'occupied', currentMeeting: 'Sprint Planning', nextAvailable: '11:00 AM', photo: '🏔️' },
  { id: 'r2', name: 'Aurora', floor: '3F', capacity: 8, amenities: ['Display', 'Webcam', 'Phone'], status: 'available', nextAvailable: 'Now', photo: '🌅' },
  { id: 'r3', name: 'Cascade', floor: '2F', capacity: 6, amenities: ['Display', 'Webcam'], status: 'reserved', currentMeeting: 'Design Review', nextAvailable: '2:30 PM', photo: '🌊' },
  { id: 'r4', name: 'Summit', floor: '4F', capacity: 20, amenities: ['Display', 'Webcam', 'Whiteboard', 'Phone', 'Projector'], status: 'available', nextAvailable: 'Now', photo: '⛰️' },
  { id: 'r5', name: 'Ember', floor: '2F', capacity: 4, amenities: ['Display', 'Webcam'], status: 'occupied', currentMeeting: '1:1 with Bob', nextAvailable: '10:30 AM', photo: '🔥' },
  { id: 'r6', name: 'Oasis', floor: '1F', capacity: 10, amenities: ['Display', 'Webcam', 'Whiteboard', 'Phone'], status: 'available', nextAvailable: 'Now', photo: '🏝️' },
  { id: 'r7', name: 'Pinnacle', floor: '4F', capacity: 16, amenities: ['Display', 'Webcam', 'Whiteboard', 'Phone', 'Projector'], status: 'maintenance', nextAvailable: 'Tomorrow', photo: '🗻' },
  { id: 'r8', name: 'Zen', floor: '1F', capacity: 2, amenities: ['Display', 'Webcam'], status: 'available', nextAvailable: 'Now', photo: '🧘' },
];

const MEETINGS: Meeting[] = [
  {
    id: 'm1', title: 'Sprint 15 Planning', organizer: 'Bob Johnson', organizerAvatar: 'BJ', organizerColor: '#fc6d26',
    startTime: '9:30 AM', endTime: '10:30 AM', date: 'Today',
    room: 'Horizon', roomId: 'r1',
    attendees: [
      { name: 'Charlie Brown', avatar: 'CB', color: '#d33833', accepted: true },
      { name: 'Diana Martinez', avatar: 'DM', color: '#0052cc', accepted: true },
      { name: 'Tom Harris', avatar: 'TH', color: '#e67e22', accepted: true },
      { name: 'Lisa Wang', avatar: 'LW', color: '#9b59b6', accepted: false },
      { name: 'Ryan Patel', avatar: 'RP', color: '#2ecc71', accepted: true },
      { name: 'Evan Liu', avatar: 'EL', color: '#10a37f', accepted: true },
    ],
    type: 'hybrid', status: 'in-progress', recurring: 'Every 2 weeks',
    description: 'Plan stories and priorities for Sprint 15. Review backlog grooming results.',
    agenda: ['Review Sprint 14 velocity', 'Backlog prioritization', 'Story point estimation', 'Capacity planning', 'Sprint goal definition'],
  },
  {
    id: 'm2', title: 'Design Review: Mobile v3', organizer: 'Alice Williams', organizerAvatar: 'AW', organizerColor: '#f24e1e',
    startTime: '11:00 AM', endTime: '12:00 PM', date: 'Today',
    room: 'Cascade', roomId: 'r3',
    attendees: [
      { name: 'Oliver Chen', avatar: 'OC', color: '#5e6ad2', accepted: true },
      { name: 'Bob Johnson', avatar: 'BJ', color: '#fc6d26', accepted: true },
      { name: 'Sophie Turner', avatar: 'ST', color: '#e91e63', accepted: true },
    ],
    type: 'hybrid', status: 'upcoming',
    description: 'Review the latest mobile app v3 design iterations and gather feedback.',
    agenda: ['Onboarding flow walkthrough', 'New component library review', 'Accessibility audit results'],
  },
  {
    id: 'm3', title: '1:1 — Bob & Sarah', organizer: 'Sarah Chen', organizerAvatar: 'SC', organizerColor: '#7b4db8',
    startTime: '1:00 PM', endTime: '1:30 PM', date: 'Today',
    room: 'Ember', roomId: 'r5',
    attendees: [
      { name: 'Bob Johnson', avatar: 'BJ', color: '#fc6d26', accepted: true },
    ],
    type: 'in-person', status: 'upcoming',
    description: 'Weekly 1:1 sync.',
    agenda: ['Career development check-in', 'Sprint blockers', 'Team feedback'],
  },
  {
    id: 'm4', title: 'Platform Architecture Review', organizer: 'Richard Yamada', organizerAvatar: 'RY', organizerColor: '#2d8cff',
    startTime: '2:00 PM', endTime: '3:00 PM', date: 'Today',
    room: 'Summit', roomId: 'r4',
    attendees: [
      { name: 'Bob Johnson', avatar: 'BJ', color: '#fc6d26', accepted: true },
      { name: 'Charlie Brown', avatar: 'CB', color: '#d33833', accepted: true },
      { name: 'Sarah Chen', avatar: 'SC', color: '#7b4db8', accepted: true },
      { name: 'Tom Harris', avatar: 'TH', color: '#e67e22', accepted: false },
    ],
    type: 'video', status: 'upcoming', recurring: 'Monthly',
    description: 'Monthly platform architecture review with CTO.',
    agenda: ['Microservices migration update', 'Database sharding proposal', 'Q2 infrastructure roadmap'],
  },
  {
    id: 'm5', title: 'Q1 All-Hands', organizer: 'Margaret Liu', organizerAvatar: 'ML', organizerColor: '#5b5fc7',
    startTime: '10:00 AM', endTime: '11:30 AM', date: 'Mar 5',
    room: 'Summit', roomId: 'r4',
    attendees: [
      { name: 'All Company', avatar: 'AC', color: '#5b5fc7', accepted: true },
    ],
    type: 'hybrid', status: 'upcoming', recurring: 'Quarterly',
    description: 'Company-wide all-hands meeting for Q1 updates.',
  },
  {
    id: 'm6', title: 'SRE Incident Retro', organizer: 'Charlie Brown', organizerAvatar: 'CB', organizerColor: '#d33833',
    startTime: '3:30 PM', endTime: '4:15 PM', date: 'Today',
    room: 'Oasis', roomId: 'r6',
    attendees: [
      { name: 'Maria Santos', avatar: 'MS', color: '#e74c3c', accepted: true },
      { name: 'Kevin Nakamura', avatar: 'KN', color: '#3498db', accepted: true },
      { name: 'Bob Johnson', avatar: 'BJ', color: '#fc6d26', accepted: true },
    ],
    type: 'in-person', status: 'upcoming',
    description: 'Post-mortem for the Feb 15 checkout service incident.',
    agenda: ['Timeline reconstruction', 'Root cause analysis', 'Action items review'],
  },
  {
    id: 'm7', title: 'Marketing Standup', organizer: 'Jane Smith', organizerAvatar: 'JS', organizerColor: '#00a1e0',
    startTime: '9:00 AM', endTime: '9:15 AM', date: 'Today',
    room: 'Zen', roomId: 'r8',
    attendees: [
      { name: 'Grace Lee', avatar: 'GL', color: '#e67e22', accepted: true },
      { name: 'Marcus Johnson', avatar: 'MJ', color: '#632ca6', accepted: true },
    ],
    type: 'video', status: 'completed', recurring: 'Daily',
    description: 'Daily standup for the marketing team.',
  },
];

const AMENITY_ICONS: Record<string, typeof Monitor> = {
  Display: Monitor,
  Webcam: Video,
  Whiteboard: Edit,
  Phone: Phone,
  Projector: Projector,
};

const ROOM_STATUS_STYLES: Record<RoomStatus, { bg: string; text: string; labelKey: string }> = {
  available: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', labelKey: 'meetingCenter.roomStatus.available' },
  occupied: { bg: 'bg-red-500/10 dark:bg-red-500/15', text: 'text-red-600 dark:text-red-400', labelKey: 'meetingCenter.roomStatus.occupied' },
  reserved: { bg: 'bg-amber-500/10 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', labelKey: 'meetingCenter.roomStatus.reserved' },
  maintenance: { bg: 'bg-gray-500/10 dark:bg-gray-500/15', text: 'text-gray-500 dark:text-gray-400', labelKey: 'meetingCenter.roomStatus.maintenance' },
};

const MEETING_STATUS_STYLES: Record<MeetingStatus, { dot: string; labelKey: string }> = {
  'in-progress': { dot: 'bg-emerald-500 animate-pulse', labelKey: 'meetingCenter.meetingStatus.inProgress' },
  upcoming: { dot: 'bg-blue-500', labelKey: 'meetingCenter.meetingStatus.upcoming' },
  completed: { dot: 'bg-gray-400', labelKey: 'meetingCenter.meetingStatus.completed' },
  cancelled: { dot: 'bg-red-500', labelKey: 'meetingCenter.meetingStatus.cancelled' },
};

const TYPE_ICONS: Record<string, typeof Video> = {
  video: Video,
  'in-person': Users,
  hybrid: Globe,
};

// ─── Time Slots for Schedule Grid ───

const TIME_SLOTS = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM',
];

// ─── Meeting Detail Panel ───

function MeetingDetail({ meeting, onClose }: { meeting: Meeting; onClose: () => void }) {
  const { t } = useI18n();
  const TypeIcon = TYPE_ICONS[meeting.type];
  const statusStyle = MEETING_STATUS_STYLES[meeting.status];
  const acceptedCount = meeting.attendees.filter(a => a.accepted).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={cn('w-2 h-2 rounded-full', statusStyle.dot)} />
            <span className="text-[10px] text-[#8a8a8a]">{t(statusStyle.labelKey)}</span>
            {meeting.recurring && (
              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-[#5b5fc7]/10 text-[#5b5fc7] dark:text-[#a6a9dc]">
                <Repeat size={8} /> {meeting.recurring}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-[11px] text-[#8a8a8a] hover:text-[#5b5fc7] transition-colors">{t('common.close')}</button>
        </div>

        <h3 className="text-[16px] font-semibold text-[#242424] dark:text-[#f0f0f0] mb-1">{meeting.title}</h3>

        <div className="flex items-center gap-4 text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] mt-2">
          <span className="flex items-center gap-1"><Clock size={11} /> {meeting.startTime} — {meeting.endTime}</span>
          <span className="flex items-center gap-1"><Calendar size={11} /> {meeting.date}</span>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-4">
          {meeting.status === 'in-progress' && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#5b5fc7] text-white hover:opacity-90 transition-colors">
              <Video size={12} /> {t('meetingCenter.action.joinNow')}
            </button>
          )}
          {meeting.status === 'upcoming' && (
            <>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#5b5fc7] text-white hover:opacity-90 transition-colors">
                <CheckCircle2 size={12} /> {t('meetingCenter.action.accept')}
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#5b5fc7]/10 text-[#5b5fc7] dark:text-[#a6a9dc] hover:opacity-80 transition-colors">
                <Edit size={12} /> {t('meetingCenter.action.edit')}
              </button>
            </>
          )}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#5b5fc7]/10 text-[#5b5fc7] dark:text-[#a6a9dc] hover:opacity-80 transition-colors">
            <Copy size={12} /> {t('meetingCenter.action.copyLink')}
          </button>
        </div>
      </div>

      {/* Info sections */}
      <div className="border-t border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 px-5 py-3 space-y-3">
        {/* Room */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/15 flex items-center justify-center">
            <MapPin size={14} className="text-[#5b5fc7]" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#242424] dark:text-[#f0f0f0]">{meeting.room}</p>
            <p className="text-[10px] text-[#8a8a8a]">{ROOMS.find(r => r.id === meeting.roomId)?.floor || ''} · {t('meetingCenter.seats', { count: ROOMS.find(r => r.id === meeting.roomId)?.capacity || 0 })}</p>
          </div>
        </div>

        {/* Type */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/15 flex items-center justify-center">
            <TypeIcon size={14} className="text-[#5b5fc7]" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#242424] dark:text-[#f0f0f0]">{t('meetingCenter.meetingTypeLabel', { type: t(`meetingCenter.meetingType.${meeting.type}`) })}</p>
            <p className="text-[10px] text-[#8a8a8a]">{meeting.type === 'video' ? t('meetingCenter.meetingTypeDesc.video') : meeting.type === 'hybrid' ? t('meetingCenter.meetingTypeDesc.hybrid') : t('meetingCenter.meetingTypeDesc.inPerson')}</p>
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{ backgroundColor: meeting.organizerColor }}
          >
            {meeting.organizerAvatar}
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#242424] dark:text-[#f0f0f0]">{meeting.organizer}</p>
            <p className="text-[10px] text-[#8a8a8a]">{t('meetingCenter.organizer')}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      {meeting.description && (
        <div className="border-t border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 px-5 py-3">
          <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider mb-1.5">{t('meetingCenter.description')}</p>
          <p className="text-[11px] text-[#616161] dark:text-[#b9bbbe]">{meeting.description}</p>
        </div>
      )}

      {/* Agenda */}
      {meeting.agenda && meeting.agenda.length > 0 && (
        <div className="border-t border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 px-5 py-3">
          <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider mb-2">{t('meetingCenter.agenda')}</p>
          <div className="space-y-1.5">
            {meeting.agenda.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#5b5fc7]/10 text-[#5b5fc7] text-[8px] flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                <span className="text-[11px] text-[#616161] dark:text-[#b9bbbe]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendees */}
      <div className="border-t border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 px-5 py-3">
        <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider mb-2">
          {t('meetingCenter.attendees', { accepted: acceptedCount, total: meeting.attendees.length + 1 })}
        </p>
        <div className="space-y-1.5">
          {/* Organizer */}
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-[#faf9f8] dark:bg-[#1e1f22]">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0"
              style={{ backgroundColor: meeting.organizerColor }}
            >
              {meeting.organizerAvatar}
            </div>
            <span className="text-[11px] text-[#242424] dark:text-[#f0f0f0] flex-1">{meeting.organizer}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#5b5fc7]/10 text-[#5b5fc7] font-medium">{t('meetingCenter.organizer')}</span>
          </div>
          {meeting.attendees.map(a => (
            <div key={a.name} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[#faf9f8] dark:hover:bg-[#1e1f22] transition-colors">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0"
                style={{ backgroundColor: a.color }}
              >
                {a.avatar}
              </div>
              <span className="text-[11px] text-[#242424] dark:text-[#f0f0f0] flex-1">{a.name}</span>
              {a.accepted ? (
                <CheckCircle2 size={12} className="text-emerald-500" />
              ) : (
                <AlertCircle size={12} className="text-amber-400" />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Room Card ───

function RoomCard({ room, isSelected, onClick }: { room: Room; isSelected: boolean; onClick: () => void }) {
  const { t } = useI18n();
  const statusStyle = ROOM_STATUS_STYLES[room.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      className={cn(
        'p-4 rounded-xl border transition-all cursor-pointer',
        isSelected
          ? 'border-[#5b5fc7] bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10'
          : 'border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#252525] hover:border-[#5b5fc7]/40',
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{room.photo}</span>
          <div>
            <p className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{room.name}</p>
            <p className="text-[10px] text-[#8a8a8a]">{room.floor} · {t('meetingCenter.seats', { count: room.capacity })}</p>
          </div>
        </div>
        <span className={cn('text-[9px] px-2 py-0.5 rounded-full font-medium', statusStyle.bg, statusStyle.text)}>
          {t(statusStyle.labelKey)}
        </span>
      </div>

      {/* Amenities */}
      <div className="flex items-center gap-1.5 mb-3">
        {room.amenities.map(a => {
          const Icon = AMENITY_ICONS[a] || Monitor;
          return (
            <div
              key={a}
              title={a}
              className="w-6 h-6 rounded bg-[#f5f5f5] dark:bg-[#333] flex items-center justify-center"
            >
              <Icon size={11} className="text-[#8a8a8a]" />
            </div>
          );
        })}
      </div>

      {/* Status info */}
      <div className="text-[10px] text-[#8a8a8a]">
        {room.status === 'occupied' && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>{room.currentMeeting}</span>
            <span>·</span>
            <span>{t('meetingCenter.roomStatus.freeAt', { time: room.nextAvailable })}</span>
          </div>
        )}
        {room.status === 'reserved' && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>{room.currentMeeting}</span>
            <span>·</span>
            <span>{t('meetingCenter.roomStatus.until', { time: room.nextAvailable })}</span>
          </div>
        )}
        {room.status === 'available' && (
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={10} />
            <span>{t('meetingCenter.roomStatus.availableNow')}</span>
          </div>
        )}
        {room.status === 'maintenance' && (
          <div className="flex items-center gap-1">
            <AlertCircle size={10} className="text-gray-400" />
            <span>{t('meetingCenter.roomStatus.maintenanceNotice', { time: room.nextAvailable })}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Room Detail Panel ───

function RoomDetail({ room, meetings, onClose, onBookRoom }: {
  room: Room;
  meetings: Meeting[];
  onClose: () => void;
  onBookRoom: () => void;
}) {
  const { t } = useI18n();
  const roomMeetings = meetings.filter(m => m.roomId === room.id && m.date === 'Today');
  const statusStyle = ROOM_STATUS_STYLES[room.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden"
    >
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', statusStyle.bg, statusStyle.text)}>
            {t(statusStyle.labelKey)}
          </span>
          <button onClick={onClose} className="text-[11px] text-[#8a8a8a] hover:text-[#5b5fc7] transition-colors">{t('common.close')}</button>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{room.photo}</span>
          <div>
            <h3 className="text-[16px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{room.name}</h3>
            <p className="text-[12px] text-[#8a8a8a]">{room.floor} · {t('meetingCenter.seats', { count: room.capacity })}</p>
          </div>
        </div>

        {room.status === 'available' && (
          <button
            onClick={onBookRoom}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium bg-[#5b5fc7] text-white hover:opacity-90 transition-colors"
          >
            <Calendar size={13} /> {t('meetingCenter.bookThisRoom')}
          </button>
        )}
      </div>

      {/* Amenities */}
      <div className="border-t border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 px-5 py-3">
        <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider mb-2">{t('meetingCenter.amenities')}</p>
        <div className="flex flex-wrap gap-2">
          {room.amenities.map(a => {
            const Icon = AMENITY_ICONS[a] || Monitor;
            return (
              <div key={a} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f5f5f5] dark:bg-[#333]">
                <Icon size={11} className="text-[#5b5fc7]" />
                <span className="text-[10px] text-[#616161] dark:text-[#b9bbbe]">{a}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's schedule for this room */}
      <div className="border-t border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 px-5 py-3">
        <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider mb-2">{t('meetingCenter.todaySchedule')}</p>
        {roomMeetings.length === 0 ? (
          <p className="text-[11px] text-[#bbb] italic">{t('meetingCenter.noMeetingsToday')}</p>
        ) : (
          <div className="space-y-2">
            {roomMeetings.map(m => {
              const mStatus = MEETING_STATUS_STYLES[m.status];
              return (
                <div key={m.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#faf9f8] dark:bg-[#1e1f22]">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="text-[10px] font-medium text-[#242424] dark:text-[#f0f0f0]">{m.startTime}</span>
                    <span className="text-[8px] text-[#bbb]">{m.endTime}</span>
                  </div>
                  <div className="w-0.5 h-8 rounded-full bg-[#5b5fc7]/30" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-[#242424] dark:text-[#f0f0f0] truncate">{m.title}</p>
                    <div className="flex items-center gap-1.5 text-[9px] text-[#8a8a8a]">
                      <span className={cn('w-1.5 h-1.5 rounded-full', mStatus.dot)} />
                      <span>{t(mStatus.labelKey)}</span>
                      <span>·</span>
                      <span>{t('meetingCenter.attendeesCount', { count: m.attendees.length + 1 })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Availability heatmap */}
      <div className="border-t border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 px-5 py-3">
        <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider mb-2">{t('meetingCenter.availabilityToday')}</p>
        <div className="flex gap-0.5">
          {TIME_SLOTS.map((slot, i) => {
            const isOccupied = roomMeetings.some(m => {
              const startIdx = TIME_SLOTS.indexOf(TIME_SLOTS.find(s => m.startTime.includes(s.replace(' AM', ' AM').replace(' PM', ' PM'))) || '');
              const endIdx = TIME_SLOTS.indexOf(TIME_SLOTS.find(s => m.endTime.includes(s)) || '');
              return i >= startIdx && i < endIdx && startIdx !== -1;
            });
            return (
              <div
                key={slot}
                title={slot}
                className={cn(
                  'flex-1 h-4 rounded-sm transition-colors',
                  isOccupied
                    ? 'bg-red-400/30 dark:bg-red-400/20'
                    : 'bg-emerald-400/20 dark:bg-emerald-400/10 hover:bg-emerald-400/40 cursor-pointer',
                )}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-1.5 text-[9px] text-[#bbb]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400/20" /> {t('meetingCenter.free')}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-400/30" /> {t('meetingCenter.booked')}</span>
          <span className="ml-auto">{t('meetingCenter.availabilityHours', { start: '8 AM', end: '6 PM' })}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── New Meeting Form ───

function NewMeetingForm({ rooms, onCancel }: { rooms: Room[]; onCancel: () => void }) {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('today');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [duration, setDuration] = useState('30');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [meetingType, setMeetingType] = useState<'video' | 'in-person' | 'hybrid'>('hybrid');
  const [isRecurring, setIsRecurring] = useState(false);

  const availableRooms = rooms.filter(r => r.status === 'available');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0] flex items-center gap-2">
          <Plus size={15} className="text-[#5b5fc7]" /> {t('meetingCenter.newMeeting')}
        </h3>
        <button onClick={onCancel} className="text-[11px] text-[#8a8a8a] hover:text-[#5b5fc7] transition-colors">{t('common.cancel')}</button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Title */}
        <div>
          <label className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block mb-1">{t('meetingCenter.meetingTitle')}</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={t('meetingCenter.meetingTitlePlaceholder')}
            className="w-full px-3 py-2 text-[12px] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#1e1f22] text-[#242424] dark:text-[#f0f0f0] placeholder-[#bbb] focus:outline-none focus:ring-1 focus:ring-[#5b5fc7]/50"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block mb-1">{t('meetingCenter.date')}</label>
            <select
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-2 py-2 text-[11px] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#1e1f22] text-[#242424] dark:text-[#f0f0f0] focus:outline-none focus:ring-1 focus:ring-[#5b5fc7]/50"
            >
              <option value="today">{t('common.today')}</option>
              <option value="tomorrow">{t('meetingCenter.tomorrow')}</option>
              <option value="feb20">{t('meetingCenter.date.feb20')}</option>
              <option value="feb21">{t('meetingCenter.date.feb21')}</option>
              <option value="feb24">{t('meetingCenter.date.feb24')}</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block mb-1">{t('meetingCenter.startTime')}</label>
            <select
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full px-2 py-2 text-[11px] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#1e1f22] text-[#242424] dark:text-[#f0f0f0] focus:outline-none focus:ring-1 focus:ring-[#5b5fc7]/50"
            >
              {TIME_SLOTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block mb-1">{t('meetingCenter.duration')}</label>
            <select
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full px-2 py-2 text-[11px] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#1e1f22] text-[#242424] dark:text-[#f0f0f0] focus:outline-none focus:ring-1 focus:ring-[#5b5fc7]/50"
            >
              <option value="15">{t('meetingCenter.duration.15min')}</option>
              <option value="30">{t('meetingCenter.duration.30min')}</option>
              <option value="45">{t('meetingCenter.duration.45min')}</option>
              <option value="60">{t('meetingCenter.duration.1h')}</option>
              <option value="90">{t('meetingCenter.duration.1_5h')}</option>
              <option value="120">{t('meetingCenter.duration.2h')}</option>
            </select>
          </div>
        </div>

        {/* Meeting type */}
        <div>
          <label className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block mb-1.5">{t('meetingCenter.meetingType')}</label>
          <div className="flex gap-2">
            {(['video', 'in-person', 'hybrid'] as const).map(t => {
              const Icon = TYPE_ICONS[t];
              return (
                <button
                  key={t}
                  onClick={() => setMeetingType(t)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all border',
                    meetingType === t
                      ? 'bg-[#5b5fc7]/10 border-[#5b5fc7] text-[#5b5fc7] dark:text-[#a6a9dc]'
                      : 'border-[#e1dfdd] dark:border-[#3d3d3d] text-[#8a8a8a] hover:border-[#5b5fc7]/30',
                  )}
                >
                  <Icon size={12} />
                  <span>{t(`meetingCenter.meetingType.${t}`)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Room */}
        {meetingType !== 'video' && (
          <div>
            <label className="text-[10px] text-[#8a8a8a] uppercase tracking-wider block mb-1.5">{t('meetingCenter.bookRoom')}</label>
            <div className="space-y-1.5 max-h-[150px] overflow-y-auto scrollbar-on-hover">
              {availableRooms.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoom(r.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all border',
                    selectedRoom === r.id
                      ? 'bg-[#5b5fc7]/5 border-[#5b5fc7] dark:bg-[#5b5fc7]/10'
                      : 'border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/30',
                  )}
                >
                  <span className="text-lg">{r.photo}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-[#242424] dark:text-[#f0f0f0]">{r.name}</p>
                    <p className="text-[9px] text-[#8a8a8a]">{r.floor} · {t('meetingCenter.seats', { count: r.capacity })}</p>
                  </div>
                  {selectedRoom === r.id && <CheckCircle2 size={14} className="text-[#5b5fc7]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recurring */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#faf9f8] dark:bg-[#1e1f22]">
          <div className="flex items-center gap-2">
            <Repeat size={13} className="text-[#8a8a8a]" />
            <span className="text-[11px] text-[#616161] dark:text-[#b9bbbe]">{t('meetingCenter.recurring')}</span>
          </div>
          <button
            onClick={() => setIsRecurring(!isRecurring)}
            className={cn(
              'w-8 h-[18px] rounded-full transition-colors relative',
              isRecurring ? 'bg-[#5b5fc7]' : 'bg-[#d0d0d0] dark:bg-[#555]',
            )}
          >
            <span className={cn(
              'absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform',
              isRecurring ? 'translate-x-4' : 'translate-x-0.5',
            )} />
          </button>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-2 pt-1">
          <button
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-medium bg-[#5b5fc7] text-white hover:opacity-90 transition-colors"
          >
            <Calendar size={13} /> {t('meetingCenter.scheduleMeeting')}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg text-[12px] font-medium text-[#8a8a8a] hover:bg-[#f0f0f0] dark:hover:bg-[#333] transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───

export function MeetingCenterApp() {
  const { t } = useI18n();
  const [view, setView] = useState<ViewMode>('schedule');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'in-person' | 'hybrid'>('all');

  const todayMeetings = useMemo(() =>
    MEETINGS.filter(m => m.date === 'Today')
      .sort((a, b) => {
        const order: Record<MeetingStatus, number> = { 'in-progress': 0, upcoming: 1, completed: 2, cancelled: 3 };
        return order[a.status] - order[b.status];
      }),
    [],
  );

  const filteredMeetings = useMemo(() => {
    let result = MEETINGS;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.organizer.toLowerCase().includes(q) ||
        m.room.toLowerCase().includes(q),
      );
    }
    if (filterType !== 'all') {
      result = result.filter(m => m.type === filterType);
    }
    return result;
  }, [searchQuery, filterType]);

  const stats = useMemo(() => ({
    todayCount: todayMeetings.length,
    inProgress: todayMeetings.filter(m => m.status === 'in-progress').length,
    availableRooms: ROOMS.filter(r => r.status === 'available').length,
    totalRooms: ROOMS.length,
  }), [todayMeetings]);

  const handleBookRoom = useCallback(() => {
    setView('new-meeting');
    setSelectedRoom(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#5b5fc7] to-[#4347a9] flex items-center justify-center shadow-sm">
              <Calendar size={16} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#242424] dark:text-[#f0f0f0]">{t('meetingCenter.title')}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#5b5fc7]/10 text-[#5b5fc7] dark:bg-[#5b5fc7]/20 dark:text-[#a6a9dc] font-bold">{t('meetingCenter.subtitle')}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">
                <span className="flex items-center gap-1"><Calendar size={9} /> {t('meetingCenter.stats.meetingsToday', { count: stats.todayCount })}</span>
                <span>·</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={9} /> {t('meetingCenter.stats.roomsFree', { available: stats.availableRooms, total: stats.totalRooms })}</span>
                {stats.inProgress > 0 && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {t('meetingCenter.stats.inProgress', { count: stats.inProgress })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('meetingCenter.searchPlaceholder')}
                className="pl-8 pr-3 py-1.5 text-[12px] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#1e1f22] text-[#242424] dark:text-[#f0f0f0] placeholder-[#b9bbbe] w-[200px] focus:outline-none focus:ring-1 focus:ring-[#5b5fc7]/50"
              />
            </div>
            <button
              onClick={() => setView('new-meeting')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#5b5fc7] text-white hover:opacity-90 transition-colors"
            >
              <Plus size={13} /> {t('meetingCenter.newMeeting')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 flex items-center gap-1 border-t border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50">
          {([
            { id: 'schedule' as ViewMode, label: t('meetingCenter.tab.schedule'), icon: Calendar },
            { id: 'rooms' as ViewMode, label: t('meetingCenter.tab.rooms'), icon: MapPin },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => { setView(t.id); setSelectedMeeting(null); setSelectedRoom(null); }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-colors border-b-2 -mb-px',
                view === t.id || (view === 'new-meeting' && t.id === 'schedule')
                  ? 'text-[#5b5fc7] dark:text-[#a6a9dc] border-[#5b5fc7]'
                  : 'text-[#8a8a8a] dark:text-[#6d6f78] border-transparent hover:text-[#424242] dark:hover:text-[#d1d1d1]',
              )}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'new-meeting' && (
          <motion.div key="new-meeting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <NewMeetingForm rooms={ROOMS} onCancel={() => setView('schedule')} />
          </motion.div>
        )}

        {view === 'schedule' && (
          <motion.div key="schedule" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-[1fr,1fr] gap-4">
              {/* Left — meeting list */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-[#5b5fc7]" />
                    <span className="text-[12px] font-medium text-[#242424] dark:text-[#f0f0f0]">{t('meetingCenter.todayMeetings')}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#5b5fc7]/10 text-[#5b5fc7] font-medium">{todayMeetings.length}</span>
                  </div>
                  {/* Filter */}
                  <div className="flex items-center gap-1">
                    {(['all', 'video', 'in-person', 'hybrid'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setFilterType(f)}
                        className={cn(
                          'px-2 py-0.5 rounded text-[9px] font-medium transition-colors capitalize',
                          filterType === f
                            ? 'bg-[#5b5fc7]/10 text-[#5b5fc7] dark:text-[#a6a9dc]'
                            : 'text-[#8a8a8a] hover:bg-[#f0f0f0] dark:hover:bg-[#333]',
                        )}
                      >
                        {t(`meetingCenter.filter.${f}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="py-1 max-h-[520px] overflow-y-auto scrollbar-on-hover divide-y divide-[#f0f0f0]/50 dark:divide-[#333]/50">
                  {filteredMeetings.map((m, i) => {
                    const TypeIcon = TYPE_ICONS[m.type];
                    const statusStyle = MEETING_STATUS_STYLES[m.status];
                    const isSelected = selectedMeeting?.id === m.id;

                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => { setSelectedMeeting(m); setSelectedRoom(null); }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedMeeting(m); } }}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 cursor-pointer transition-all group',
                          isSelected
                            ? 'bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10'
                            : 'hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a]',
                        )}
                      >
                        {/* Time column */}
                        <div className="flex flex-col items-center shrink-0 w-14">
                          <span className="text-[11px] font-medium text-[#242424] dark:text-[#f0f0f0]">{m.startTime}</span>
                          <span className="text-[9px] text-[#bbb]">{m.endTime}</span>
                        </div>

                        {/* Color bar */}
                        <div className={cn('w-0.5 h-12 rounded-full shrink-0', m.status === 'in-progress' ? 'bg-emerald-500' : m.status === 'completed' ? 'bg-gray-300 dark:bg-gray-600' : 'bg-[#5b5fc7]')} />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn('text-[12px] font-medium truncate', isSelected ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#242424] dark:text-[#f0f0f0]')}>
                              {m.title}
                            </span>
                            {m.recurring && <Repeat size={9} className="text-[#5b5fc7] shrink-0" />}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#8a8a8a]">
                            <span className="flex items-center gap-1"><MapPin size={9} /> {m.room}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><TypeIcon size={9} /> <span>{t(`meetingCenter.meetingType.${m.type}`)}</span></span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><Users size={9} /> {m.attendees.length + 1}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1.5">
                            <span className={cn('w-1.5 h-1.5 rounded-full', statusStyle.dot)} />
                            <span className="text-[9px] text-[#8a8a8a]">{t(statusStyle.labelKey)}</span>
                            {m.date !== 'Today' && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#f0f0f0] dark:bg-[#333] text-[#8a8a8a] ml-1">{m.date}</span>
                            )}
                          </div>
                        </div>

                        {/* Avatars */}
                        <div className="flex -space-x-1.5 shrink-0">
                          {m.attendees.slice(0, 3).map(a => (
                            <div
                              key={a.name}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[7px] font-bold border border-white dark:border-[#252525]"
                              style={{ backgroundColor: a.color }}
                              title={a.name}
                            >
                              {a.avatar}
                            </div>
                          ))}
                          {m.attendees.length > 3 && (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold border border-white dark:border-[#252525] bg-[#e0e0e0] dark:bg-[#444] text-[#8a8a8a]">
                              +{m.attendees.length - 3}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Now indicator */}
                <div className="px-4 py-2 border-t border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 flex items-center gap-2 bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/8">
                  <Clock size={12} className="text-[#5b5fc7] shrink-0" />
                  <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">
                    {t('meetingCenter.viewingAs', { name: 'Bob Johnson', date: 'Feb 18, 2026' })}
                  </p>
                </div>
              </div>

              {/* Right — detail panel */}
              <AnimatePresence mode="wait">
                {selectedMeeting ? (
                  <MeetingDetail
                    key={selectedMeeting.id}
                    meeting={selectedMeeting}
                    onClose={() => setSelectedMeeting(null)}
                  />
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center h-[400px] rounded-xl bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d]"
                  >
                    <div className="text-center">
                      <Calendar size={32} className="text-[#ddd] dark:text-[#555] mx-auto mb-2" />
                      <p className="text-[13px] text-[#8a8a8a]">{t('meetingCenter.emptyMeetingTitle')}</p>
                      <p className="text-[11px] text-[#bbb] mt-1">{t('meetingCenter.emptyMeetingSubtitle')}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {view === 'rooms' && (
          <motion.div key="rooms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-[1fr,1fr] gap-4">
              {/* Left — room grid */}
              <div className="space-y-3">
                {/* Quick stats */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: t('meetingCenter.roomStats.total'), value: ROOMS.length, color: 'text-[#5b5fc7]', bg: 'bg-[#5b5fc7]/10' },
                    { label: t('meetingCenter.roomStats.available'), value: ROOMS.filter(r => r.status === 'available').length, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: t('meetingCenter.roomStats.occupied'), value: ROOMS.filter(r => r.status === 'occupied').length, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
                    { label: t('meetingCenter.roomStats.reserved'), value: ROOMS.filter(r => r.status === 'reserved').length, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
                  ].map(s => (
                    <div key={s.label} className="px-3 py-2 rounded-lg bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d]">
                      <p className={cn('text-[16px] font-bold', s.color)}>{s.value}</p>
                      <p className="text-[9px] text-[#8a8a8a]">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Room grid */}
                <div className="grid grid-cols-2 gap-3">
                  {ROOMS.map(room => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      isSelected={selectedRoom?.id === room.id}
                      onClick={() => { setSelectedRoom(room); setSelectedMeeting(null); }}
                    />
                  ))}
                </div>
              </div>

              {/* Right — room detail */}
              <AnimatePresence mode="wait">
                {selectedRoom ? (
                  <RoomDetail
                    key={selectedRoom.id}
                    room={selectedRoom}
                    meetings={MEETINGS}
                    onClose={() => setSelectedRoom(null)}
                    onBookRoom={handleBookRoom}
                  />
                ) : (
                  <motion.div
                    key="empty-room"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center h-[400px] rounded-xl bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d]"
                  >
                    <div className="text-center">
                      <MapPin size={32} className="text-[#ddd] dark:text-[#555] mx-auto mb-2" />
                      <p className="text-[13px] text-[#8a8a8a]">{t('meetingCenter.emptyRoomTitle')}</p>
                      <p className="text-[11px] text-[#bbb] mt-1">{t('meetingCenter.emptyRoomSubtitle')}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
