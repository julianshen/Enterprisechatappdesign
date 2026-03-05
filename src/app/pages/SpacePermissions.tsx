import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Users, Crown, UserCog, UserPlus, Eye, EyeOff, Settings,
  ChevronDown, ChevronRight, Check, X, Search, MoreHorizontal,
  Lock, Unlock, AlertTriangle, Info, Copy, Trash2, Edit3,
  MessageSquare, FileText, FolderOpen, CheckSquare, Hash,
  Download, Volume2, RotateCcw, Layers, Plus, ArrowRight,
  Star, Zap, Heart, Bookmark, Target, Wrench, Code, Briefcase,
  Palette, Headphones, Award, Globe, Cpu, Database,
  type LucideIcon,
} from 'lucide-react';
import { spaces, users, currentUser } from '../data/mockData';
import { updateAccessPermission } from '../data/accessPermissions';
import { Switch } from '../../components/ui/switch';
import { useI18n } from '../context/I18nContext';

// ─── Types ────────────────────────────────────────────────────────────────────

// Roles are strings — built-in ones are 'owner' | 'admin' | 'member' | 'guest'
// Custom roles use slugs like 'custom-contributor'

const BUILT_IN_ROLES = ['owner', 'admin', 'member', 'guest'] as const;
type BuiltInRole = (typeof BUILT_IN_ROLES)[number];

interface RoleConfigEntry {
  label: string;
  color: string;
  bgColor: string;
  darkColor: string;
  darkBgColor: string;
  hexColor: string;
  icon: LucideIcon;
  description: string;
  isBuiltIn: boolean;
  priority: number; // sort order: lower = higher rank
}

interface SpaceMember {
  userId: string;
  name: string;
  avatar: string;
  email: string;
  role: string;
  joinedAt: Date;
  lastActive: Date;
  status: 'online' | 'away' | 'busy' | 'offline';
}

interface PermissionCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  permissions: Permission[];
}

interface Permission {
  id: string;
  label: string;
  description: string;
  roles: Record<string, boolean>;
  locked?: boolean;
}

// ─── Color & Icon Palettes ─────────────────────────────────────────────────────

const COLOR_PALETTE: { hex: string; label: string; tw: string; twBg: string; darkTw: string; darkBg: string }[] = [
  { hex: '#5b5fc7', label: 'Purple',  tw: 'text-[#5b5fc7]', twBg: 'bg-[#5b5fc7]/10', darkTw: 'dark:text-[#a6a9dc]', darkBg: 'dark:bg-[#5b5fc7]/20' },
  { hex: '#2196f3', label: 'Blue',    tw: 'text-[#2196f3]', twBg: 'bg-[#2196f3]/10', darkTw: 'dark:text-[#64b5f6]', darkBg: 'dark:bg-[#2196f3]/20' },
  { hex: '#0d9488', label: 'Teal',    tw: 'text-[#0d9488]', twBg: 'bg-[#0d9488]/10', darkTw: 'dark:text-[#5eead4]', darkBg: 'dark:bg-[#0d9488]/20' },
  { hex: '#237b4b', label: 'Green',   tw: 'text-[#237b4b]', twBg: 'bg-[#237b4b]/10', darkTw: 'dark:text-[#6fcf97]', darkBg: 'dark:bg-[#237b4b]/20' },
  { hex: '#d4820c', label: 'Orange',  tw: 'text-[#d4820c]', twBg: 'bg-[#d4820c]/10', darkTw: 'dark:text-[#f5a623]', darkBg: 'dark:bg-[#d4820c]/20' },
  { hex: '#c4314b', label: 'Red',     tw: 'text-[#c4314b]', twBg: 'bg-[#c4314b]/10', darkTw: 'dark:text-[#f47067]', darkBg: 'dark:bg-[#c4314b]/20' },
  { hex: '#d946ef', label: 'Pink',    tw: 'text-[#d946ef]', twBg: 'bg-[#d946ef]/10', darkTw: 'dark:text-[#f0abfc]', darkBg: 'dark:bg-[#d946ef]/20' },
  { hex: '#6366f1', label: 'Indigo',  tw: 'text-[#6366f1]', twBg: 'bg-[#6366f1]/10', darkTw: 'dark:text-[#a5b4fc]', darkBg: 'dark:bg-[#6366f1]/20' },
];

const ICON_PALETTE: { icon: LucideIcon; label: string }[] = [
  { icon: Shield, label: 'Shield' },
  { icon: Star, label: 'Star' },
  { icon: Zap, label: 'Zap' },
  { icon: Heart, label: 'Heart' },
  { icon: Bookmark, label: 'Bookmark' },
  { icon: Target, label: 'Target' },
  { icon: Wrench, label: 'Wrench' },
  { icon: Code, label: 'Code' },
  { icon: Briefcase, label: 'Briefcase' },
  { icon: Palette, label: 'Palette' },
  { icon: Headphones, label: 'Headphones' },
  { icon: Award, label: 'Award' },
  { icon: Globe, label: 'Globe' },
  { icon: Cpu, label: 'Cpu' },
  { icon: Database, label: 'Database' },
];

// ─── Built-in Role Config ──────────────────────────────────────────────────────

const builtInRoleConfig: Record<BuiltInRole, RoleConfigEntry> = {
  owner: {
    label: 'Owner',
    color: 'text-[#d4820c]', bgColor: 'bg-[#d4820c]/10',
    darkColor: 'dark:text-[#f5a623]', darkBgColor: 'dark:bg-[#d4820c]/20',
    hexColor: '#d4820c',
    icon: Crown,
    description: 'Full control over space settings, members, and content. Cannot be restricted.',
    isBuiltIn: true, priority: 0,
  },
  admin: {
    label: 'Admin',
    color: 'text-[#5b5fc7]', bgColor: 'bg-[#5b5fc7]/10',
    darkColor: 'dark:text-[#a6a9dc]', darkBgColor: 'dark:bg-[#5b5fc7]/20',
    hexColor: '#5b5fc7',
    icon: UserCog,
    description: 'Manage members, channels, and most space settings. Cannot delete the space.',
    isBuiltIn: true, priority: 1,
  },
  member: {
    label: 'Member',
    color: 'text-[#237b4b]', bgColor: 'bg-[#237b4b]/10',
    darkColor: 'dark:text-[#6fcf97]', darkBgColor: 'dark:bg-[#237b4b]/20',
    hexColor: '#237b4b',
    icon: Users,
    description: 'Standard access to channels, documents, files, and tasks.',
    isBuiltIn: true, priority: 2,
  },
  guest: {
    label: 'Guest',
    color: 'text-[#8a8a8a]', bgColor: 'bg-[#8a8a8a]/10',
    darkColor: 'dark:text-[#b9bbbe]', darkBgColor: 'dark:bg-[#8a8a8a]/20',
    hexColor: '#8a8a8a',
    icon: Eye,
    description: 'Limited read-only access. Cannot create or modify content.',
    isBuiltIn: true, priority: 3,
  },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockMembers: SpaceMember[] = [
  { userId: 'user-1', name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', email: 'john.doe@company.com', role: 'admin', joinedAt: new Date('2025-01-15'), lastActive: new Date('2026-03-04T09:30:00'), status: 'online' },
  { userId: 'user-owner', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', email: 'sarah.chen@company.com', role: 'owner', joinedAt: new Date('2024-11-01'), lastActive: new Date('2026-03-04T08:15:00'), status: 'online' },
  { userId: 'user-2', name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', email: 'jane.smith@company.com', role: 'admin', joinedAt: new Date('2025-02-10'), lastActive: new Date('2026-03-03T16:45:00'), status: 'online' },
  { userId: 'user-3', name: 'Bob Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', email: 'bob.johnson@company.com', role: 'member', joinedAt: new Date('2025-03-20'), lastActive: new Date('2026-03-04T07:00:00'), status: 'away' },
  { userId: 'user-4', name: 'Alice Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', email: 'alice.williams@company.com', role: 'member', joinedAt: new Date('2025-04-05'), lastActive: new Date('2026-03-03T14:20:00'), status: 'online' },
  { userId: 'user-5', name: 'Charlie Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', email: 'charlie.brown@company.com', role: 'custom-contributor', joinedAt: new Date('2025-05-12'), lastActive: new Date('2026-03-02T11:30:00'), status: 'busy' },
  { userId: 'user-6', name: 'Diana Prince', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana', email: 'diana.prince@company.com', role: 'member', joinedAt: new Date('2025-06-01'), lastActive: new Date('2026-03-04T10:00:00'), status: 'online' },
  { userId: 'user-7', name: 'Erik Lehnsherr', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Erik', email: 'erik.lehnsherr@partner.com', role: 'custom-reviewer', joinedAt: new Date('2026-01-10'), lastActive: new Date('2026-02-28T09:00:00'), status: 'offline' },
  { userId: 'user-8', name: 'Fiona Gallagher', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona', email: 'fiona.g@contractor.io', role: 'guest', joinedAt: new Date('2026-02-01'), lastActive: new Date('2026-03-01T15:30:00'), status: 'offline' },
];

// Initial custom roles (pre-populated)
const initialCustomRoles: Record<string, RoleConfigEntry> = {
  'custom-contributor': {
    label: 'Contributor',
    color: 'text-[#0d9488]', bgColor: 'bg-[#0d9488]/10',
    darkColor: 'dark:text-[#5eead4]', darkBgColor: 'dark:bg-[#0d9488]/20',
    hexColor: '#0d9488',
    icon: Code,
    description: 'Can create and edit content, but cannot manage members or space settings.',
    isBuiltIn: false, priority: 10,
  },
  'custom-reviewer': {
    label: 'External Reviewer',
    color: 'text-[#6366f1]', bgColor: 'bg-[#6366f1]/10',
    darkColor: 'dark:text-[#a5b4fc]', darkBgColor: 'dark:bg-[#6366f1]/20',
    hexColor: '#6366f1',
    icon: Eye,
    description: 'Can view and comment on documents and files. Cannot modify or create content.',
    isBuiltIn: false, priority: 11,
  },
};

function makePermRoles(builtIn: Record<string, boolean>, customRoleIds: string[], customDefaults?: Record<string, boolean>): Record<string, boolean> {
  const result: Record<string, boolean> = { ...builtIn };
  for (const id of customRoleIds) {
    result[id] = customDefaults?.[id] ?? false;
  }
  return result;
}

const defaultCustomRoleIds = Object.keys(initialCustomRoles);

const defaultPermissions: PermissionCategory[] = [
  {
    id: 'general', label: 'General', icon: Settings,
    permissions: [
      { id: 'edit-space-settings', label: 'Edit space settings', description: 'Change space name, icon, description, and visibility', roles: makePermRoles({ owner: true, admin: true, member: false, guest: false }, defaultCustomRoleIds) },
      { id: 'manage-members', label: 'Manage members', description: 'Invite, remove, and change roles of members', roles: makePermRoles({ owner: true, admin: true, member: false, guest: false }, defaultCustomRoleIds), locked: false },
      { id: 'delete-space', label: 'Delete space', description: 'Permanently delete the space and all its content', roles: makePermRoles({ owner: true, admin: false, member: false, guest: false }, defaultCustomRoleIds), locked: true },
      { id: 'manage-integrations', label: 'Manage integrations', description: 'Install, configure, and remove third-party apps', roles: makePermRoles({ owner: true, admin: true, member: false, guest: false }, defaultCustomRoleIds) },
    ],
  },
  {
    id: 'channels', label: 'Channels', icon: Hash,
    permissions: [
      { id: 'create-channels', label: 'Create channels', description: 'Create new public and private channels', roles: makePermRoles({ owner: true, admin: true, member: true, guest: false }, defaultCustomRoleIds, { 'custom-contributor': true }) },
      { id: 'delete-channels', label: 'Delete channels', description: 'Remove channels and their message history', roles: makePermRoles({ owner: true, admin: true, member: false, guest: false }, defaultCustomRoleIds) },
      { id: 'manage-channel-settings', label: 'Manage channel settings', description: 'Edit channel name, description, and type', roles: makePermRoles({ owner: true, admin: true, member: false, guest: false }, defaultCustomRoleIds) },
      { id: 'pin-messages', label: 'Pin messages', description: 'Pin and unpin messages in channels', roles: makePermRoles({ owner: true, admin: true, member: true, guest: false }, defaultCustomRoleIds, { 'custom-contributor': true }) },
    ],
  },
  {
    id: 'messaging', label: 'Messaging', icon: MessageSquare,
    permissions: [
      { id: 'send-messages', label: 'Send messages', description: 'Post messages in channels and threads', roles: makePermRoles({ owner: true, admin: true, member: true, guest: false }, defaultCustomRoleIds, { 'custom-contributor': true, 'custom-reviewer': true }) },
      { id: 'delete-any-message', label: 'Delete any message', description: 'Remove messages posted by other members', roles: makePermRoles({ owner: true, admin: true, member: false, guest: false }, defaultCustomRoleIds) },
      { id: 'use-mentions', label: 'Use @mentions', description: 'Mention individuals, roles, or @everyone', roles: makePermRoles({ owner: true, admin: true, member: true, guest: false }, defaultCustomRoleIds, { 'custom-contributor': true }) },
      { id: 'upload-attachments', label: 'Upload attachments', description: 'Attach files, images, and videos to messages', roles: makePermRoles({ owner: true, admin: true, member: true, guest: false }, defaultCustomRoleIds, { 'custom-contributor': true }) },
    ],
  },
  {
    id: 'documents', label: 'Documents', icon: FileText,
    permissions: [
      { id: 'create-documents', label: 'Create documents', description: 'Create new documents, sheets, and presentations', roles: makePermRoles({ owner: true, admin: true, member: true, guest: false }, defaultCustomRoleIds, { 'custom-contributor': true }) },
      { id: 'edit-documents', label: 'Edit documents', description: 'Modify existing documents', roles: makePermRoles({ owner: true, admin: true, member: true, guest: false }, defaultCustomRoleIds, { 'custom-contributor': true }) },
      { id: 'delete-documents', label: 'Delete documents', description: 'Permanently remove documents', roles: makePermRoles({ owner: true, admin: true, member: false, guest: false }, defaultCustomRoleIds) },
      { id: 'manage-security-labels', label: 'Manage security labels', description: 'Assign and change security classification levels', roles: makePermRoles({ owner: true, admin: true, member: false, guest: false }, defaultCustomRoleIds) },
      { id: 'access-restricted-docs', label: 'Access restricted documents', description: 'View and open documents marked as Restricted', roles: makePermRoles({ owner: true, admin: true, member: true, guest: false }, defaultCustomRoleIds, { 'custom-contributor': true }) },
      { id: 'access-confidential-docs', label: 'Access confidential documents', description: 'View and open documents marked as Confidential', roles: makePermRoles({ owner: true, admin: true, member: false, guest: false }, defaultCustomRoleIds) },
    ],
  },
  {
    id: 'files', label: 'Files', icon: FolderOpen,
    permissions: [
      { id: 'upload-files', label: 'Upload files', description: 'Upload files to the space file storage', roles: makePermRoles({ owner: true, admin: true, member: true, guest: false }, defaultCustomRoleIds, { 'custom-contributor': true }) },
      { id: 'download-files', label: 'Download files', description: 'Download files from the space', roles: makePermRoles({ owner: true, admin: true, member: true, guest: true }, defaultCustomRoleIds, { 'custom-contributor': true, 'custom-reviewer': true }) },
      { id: 'delete-files', label: 'Delete files', description: 'Remove files from the space storage', roles: makePermRoles({ owner: true, admin: true, member: false, guest: false }, defaultCustomRoleIds) },
      { id: 'manage-folders', label: 'Manage folders', description: 'Create, rename, and delete folders', roles: makePermRoles({ owner: true, admin: true, member: true, guest: false }, defaultCustomRoleIds, { 'custom-contributor': true }) },
      { id: 'access-restricted-files', label: 'Access restricted files', description: 'View and download files marked as Restricted', roles: makePermRoles({ owner: true, admin: true, member: true, guest: false }, defaultCustomRoleIds, { 'custom-contributor': true }) },
      { id: 'access-confidential-files', label: 'Access confidential files', description: 'View and download files marked as Confidential', roles: makePermRoles({ owner: true, admin: true, member: false, guest: false }, defaultCustomRoleIds) },
    ],
  },
  {
    id: 'tasks', label: 'Tasks', icon: CheckSquare,
    permissions: [
      { id: 'create-tasks', label: 'Create tasks', description: 'Create new tasks, bugs, stories, and spikes', roles: makePermRoles({ owner: true, admin: true, member: true, guest: false }, defaultCustomRoleIds, { 'custom-contributor': true }) },
      { id: 'assign-tasks', label: 'Assign tasks', description: 'Assign tasks to other members', roles: makePermRoles({ owner: true, admin: true, member: true, guest: false }, defaultCustomRoleIds, { 'custom-contributor': true }) },
      { id: 'delete-tasks', label: 'Delete tasks', description: 'Permanently remove tasks', roles: makePermRoles({ owner: true, admin: true, member: false, guest: false }, defaultCustomRoleIds) },
      { id: 'manage-sprints', label: 'Manage sprints', description: 'Create and configure sprint cycles', roles: makePermRoles({ owner: true, admin: true, member: false, guest: false }, defaultCustomRoleIds) },
    ],
  },
];

// ─── Channel Override Types & Data ──────────────────────────────────────────

type ChannelPermId = 'send-messages' | 'upload-attachments' | 'download-attachments' | 'pin-messages' | 'use-mentions' | 'delete-any-message' | 'manage-channel-settings' | 'can-join';

const channelPermissions: { id: ChannelPermId; label: string }[] = [
  { id: 'can-join', label: 'Can join' },
  { id: 'send-messages', label: 'Send messages' },
  { id: 'upload-attachments', label: 'Upload attachments' },
  { id: 'download-attachments', label: 'Download attachments' },
  { id: 'pin-messages', label: 'Pin messages' },
  { id: 'use-mentions', label: 'Use @mentions' },
  { id: 'delete-any-message', label: 'Delete any message' },
  { id: 'manage-channel-settings', label: 'Manage settings' },
];

type OverrideValue = 'inherit' | boolean;

interface ChannelOverride {
  channelId: string;
  channelName: string;
  channelType: 'text' | 'announcement' | 'private';
  overrides: Record<string, Record<ChannelPermId, OverrideValue>>;
}

function buildDefaultOverride(roleKeys: string[]): Record<string, Record<ChannelPermId, OverrideValue>> {
  const out: Record<string, Record<string, OverrideValue>> = {};
  for (const r of roleKeys) {
    const permObj: Record<string, OverrideValue> = {};
    for (const p of channelPermissions) permObj[p.id] = 'inherit';
    out[r] = permObj;
  }
  return out as Record<string, Record<ChannelPermId, OverrideValue>>;
}

function buildInitialChannelOverrides(channels: { id: string; name: string; type: string }[], roleKeys: string[]): ChannelOverride[] {
  return channels.map(ch => {
    const base = buildDefaultOverride(roleKeys);
    if (ch.id === 'eng-incidents') {
      if (base.member) { base.member['send-messages'] = false; base.member['upload-attachments'] = false; }
      if (base.guest) { base.guest['send-messages'] = false; }
    }
    if (ch.id === 'eng-devops') {
      if (base.guest) { base.guest['use-mentions'] = false; base.guest['pin-messages'] = false; }
    }
    return { channelId: ch.id, channelName: ch.name, channelType: ch.type as 'text' | 'announcement' | 'private', overrides: base };
  });
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  online: 'bg-[#237b4b]', away: 'bg-[#d4820c]', busy: 'bg-[#c4314b]', offline: 'bg-[#8a8a8a]',
};

function RoleBadge({ roleId, config, size = 'md' }: { roleId: string; config: Record<string, RoleConfigEntry>; size?: 'sm' | 'md' }) {
  const entry = config[roleId];
  if (!entry) return <span className="text-[10px] text-[#8a8a8a] px-2 py-0.5 bg-[#e8e8e8] rounded-full">{roleId}</span>;
  const Icon = entry.icon;
  return (
    <span className={`inline-flex items-center gap-1 ${entry.bgColor} ${entry.darkBgColor} ${entry.color} ${entry.darkColor} rounded-full ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'} font-semibold whitespace-nowrap`}>
      <Icon size={size === 'sm' ? 10 : 12} />
      {entry.label}
    </span>
  );
}

function MemberRow({
  member, onRoleChange, onRemove, isCurrentUser, allRoleConfig, allRoleKeys,
}: {
  member: SpaceMember;
  onRoleChange: (userId: string, role: string) => void;
  onRemove: (userId: string) => void;
  isCurrentUser: boolean;
  allRoleConfig: Record<string, RoleConfigEntry>;
  allRoleKeys: string[];
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const canChangeRole = member.role !== 'owner' && !isCurrentUser;

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors group rounded-lg"
    >
      <div className="relative shrink-0">
        <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-full" />
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#1e1f22] ${statusColors[member.status]}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#242424] dark:text-[#f2f3f5] truncate">{member.name}</span>
          {isCurrentUser && <span className="text-[9px] bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc] px-1.5 py-0.5 rounded font-semibold">YOU</span>}
        </div>
        <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a] truncate">{member.email}</p>
      </div>
      <div className="relative">
        <button
          onClick={() => canChangeRole && setShowRoleMenu(!showRoleMenu)}
          className={`${canChangeRole ? 'cursor-pointer hover:ring-2 hover:ring-[#5b5fc7]/30' : 'cursor-default'} rounded-full transition-all`}
          disabled={!canChangeRole}
        >
          <RoleBadge roleId={member.role} config={allRoleConfig} />
        </button>
        <AnimatePresence>
          {showRoleMenu && (
            <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }}
              className="absolute right-0 top-full mt-1 w-[220px] bg-white dark:bg-[#2b2d31] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-xl z-50 py-1 overflow-hidden max-h-[260px] overflow-y-auto"
            >
              {allRoleKeys.filter(r => r !== 'owner').map(r => {
                const cfg = allRoleConfig[r];
                if (!cfg) return null;
                const Icon = cfg.icon;
                return (
                  <button key={r} onClick={() => { onRoleChange(member.userId, r); setShowRoleMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] transition-colors ${
                      member.role === r ? 'bg-[#5b5fc7]/8 dark:bg-[#5b5fc7]/15 text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#424242] dark:text-[#e0e0e0] hover:bg-[#f5f5f5] dark:hover:bg-[#35373c]'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="flex-1 font-medium">{cfg.label}</span>
                    {!cfg.isBuiltIn && <span className="text-[8px] text-[#8a8a8a] bg-[#e8e8e8] dark:bg-[#3d3d3d] px-1.5 py-0.5 rounded">CUSTOM</span>}
                    {member.role === r && <Check size={14} />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] w-[70px] text-right shrink-0 hidden lg:block">
        {member.joinedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
      </span>
      <div className="relative shrink-0">
        {canChangeRole ? (
          <>
            <button onClick={() => setShowActions(!showActions)} className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-[#e8e8e8] dark:hover:bg-[#3d3d3d] transition-all text-[#616161] dark:text-[#b9bbbe]">
              <MoreHorizontal size={16} />
            </button>
            <AnimatePresence>
              {showActions && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 w-[160px] bg-white dark:bg-[#2b2d31] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-xl z-50 py-1"
                >
                  <button onClick={() => setShowActions(false)} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#424242] dark:text-[#e0e0e0] hover:bg-[#f5f5f5] dark:hover:bg-[#35373c]">
                    <Copy size={13} /> Copy email
                  </button>
                  <button onClick={() => { onRemove(member.userId); setShowActions(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#c4314b] hover:bg-[#c4314b]/8 dark:hover:bg-[#c4314b]/15">
                    <Trash2 size={13} /> Remove from space
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : <div className="w-[24px]" />}
      </div>
    </motion.div>
  );
}

function PermissionMatrix({
  categories, onToggle, allRoleConfig, allRoleKeys,
}: {
  categories: PermissionCategory[];
  onToggle: (categoryId: string, permId: string, role: string, value: boolean) => void;
  allRoleConfig: Record<string, RoleConfigEntry>;
  allRoleKeys: string[];
}) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(categories.map(c => c.id)));

  const toggleCat = (id: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center px-4 py-2">
        <div className="flex-1 text-[11px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">Permission</div>
        {allRoleKeys.map(r => (
          <div key={r} className="w-[72px] text-center shrink-0">
            <RoleBadge roleId={r} config={allRoleConfig} size="sm" />
          </div>
        ))}
      </div>

      {categories.map(cat => {
        const Icon = cat.icon;
        const isExpanded = expandedCats.has(cat.id);
        return (
          <div key={cat.id} className="rounded-lg overflow-hidden">
            <button onClick={() => toggleCat(cat.id)} className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#f5f5f5] dark:bg-[#252525] hover:bg-[#ebebeb] dark:hover:bg-[#2a2a2a] transition-colors">
              <ChevronRight size={14} className={`transition-transform duration-200 text-[#616161] dark:text-[#b9bbbe] ${isExpanded ? 'rotate-90' : ''}`} />
              <Icon size={16} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
              <span className="text-[13px] font-semibold text-[#242424] dark:text-[#f2f3f5]">{cat.label}</span>
              <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] ml-1">{cat.permissions.length} permissions</span>
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  {cat.permissions.map((perm, idx) => (
                    <div key={perm.id} className={`flex items-center px-4 py-2.5 ${idx % 2 === 0 ? 'bg-white dark:bg-[#1e1f22]' : 'bg-[#fafafa] dark:bg-[#222]'} hover:bg-[#f0f0f5] dark:hover:bg-[#2a2a2e] transition-colors`}>
                      <div className="flex-1 min-w-0 pl-7">
                        <p className="text-[12px] font-medium text-[#242424] dark:text-[#e0e0e0]">{perm.label}</p>
                        <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] truncate">{perm.description}</p>
                      </div>
                      {allRoleKeys.map(r => {
                        const isOwner = r === 'owner';
                        const isLocked = perm.locked || isOwner;
                        const val = perm.roles[r] ?? false;
                        return (
                          <div key={r} className="w-[72px] flex justify-center shrink-0">
                            {isLocked ? (
                              <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center ${val ? 'bg-[#5b5fc7]/15 dark:bg-[#5b5fc7]/25' : 'bg-[#e8e8e8] dark:bg-[#333]'}`}>
                                {val ? <Check size={11} className="text-[#5b5fc7] dark:text-[#a6a9dc]" /> : <X size={11} className="text-[#c4314b]/50" />}
                              </div>
                            ) : (
                              <Switch checked={val} onCheckedChange={(checked) => onToggle(cat.id, perm.id, r, !!checked)} className="data-[state=checked]:bg-[#5b5fc7] h-[16px] w-[28px]" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type PermTab = 'members' | 'roles' | 'permissions' | 'channels' | 'audit';

interface RoleFormData {
  id: string; // empty = new
  label: string;
  description: string;
  colorIdx: number;
  iconIdx: number;
  baseRole: string; // template for default permissions
}

const emptyRoleForm: RoleFormData = { id: '', label: '', description: '', colorIdx: 0, iconIdx: 0, baseRole: 'member' };

export function SpacePermissions() {
  const { t } = useI18n();
  const { spaceId } = useParams();
  const space = spaces.find(s => s.id === spaceId);
  const [activeTab, setActiveTab] = useState<PermTab>('members');
  const [members, setMembers] = useState<SpaceMember[]>(mockMembers);
  const [permCategories, setPermCategories] = useState<PermissionCategory[]>(defaultPermissions);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('member');
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [showExportToast, setShowExportToast] = useState(false);

  // Custom roles state
  const [customRoles, setCustomRoles] = useState<Record<string, RoleConfigEntry>>(initialCustomRoles);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState<RoleFormData>(emptyRoleForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Copy settings state
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyMode, setCopyMode] = useState<'role' | 'channel'>('role');
  const [copySource, setCopySource] = useState<string>('');
  const [copyTarget, setCopyTarget] = useState<string>('');

  // Derived: combined role config and keys
  const allRoleConfig = useMemo<Record<string, RoleConfigEntry>>(() => ({
    ...builtInRoleConfig,
    ...customRoles,
  }), [customRoles]);

  const allRoleKeys = useMemo(() => {
    const entries = Object.entries(allRoleConfig);
    entries.sort((a, b) => a[1].priority - b[1].priority);
    return entries.map(([k]) => k);
  }, [allRoleConfig]);

  // Channel overrides state
  const [channelOverrides, setChannelOverrides] = useState<ChannelOverride[]>(() =>
    space ? buildInitialChannelOverrides(space.channels, [...BUILT_IN_ROLES, ...defaultCustomRoleIds]) : []
  );
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    let result = members;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
    }
    if (roleFilter !== 'all') {
      result = result.filter(m => m.role === roleFilter);
    }
    const priorityMap: Record<string, number> = {};
    for (const [k, v] of Object.entries(allRoleConfig)) priorityMap[k] = v.priority;
    return result.sort((a, b) => (priorityMap[a.role] ?? 99) - (priorityMap[b.role] ?? 99));
  }, [members, searchQuery, roleFilter, allRoleConfig]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: members.length };
    members.forEach(m => { counts[m.role] = (counts[m.role] || 0) + 1; });
    return counts;
  }, [members]);

  const handleRoleChange = useCallback((userId: string, newRole: string) => {
    setMembers(prev => prev.map(m => m.userId === userId ? { ...m, role: newRole } : m));
    setPendingChanges(p => p + 1);
  }, []);

  const handleRemoveMember = useCallback((userId: string) => {
    setMembers(prev => prev.filter(m => m.userId !== userId));
    setPendingChanges(p => p + 1);
  }, []);

  const handlePermToggle = useCallback((catId: string, permId: string, role: string, value: boolean) => {
    setPermCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return { ...cat, permissions: cat.permissions.map(p => {
        if (p.id !== permId) return p;
        return { ...p, roles: { ...p.roles, [role]: value } };
      }) };
    }));
    // Sync access-level permissions to shared module
    if (permId === 'access-restricted-docs' || permId === 'access-restricted-files') {
      updateAccessPermission(role, 'restricted', value);
    } else if (permId === 'access-confidential-docs' || permId === 'access-confidential-files') {
      updateAccessPermission(role, 'confidential', value);
    }
    setPendingChanges(p => p + 1);
  }, []);

  const handleInvite = useCallback(() => {
    if (!inviteEmail.trim()) return;
    const newMember: SpaceMember = {
      userId: `user-new-${Date.now()}`,
      name: inviteEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      email: inviteEmail, role: inviteRole,
      joinedAt: new Date(), lastActive: new Date(), status: 'offline',
    };
    setMembers(prev => [...prev, newMember]);
    setInviteEmail('');
    setShowInviteModal(false);
    setPendingChanges(p => p + 1);
  }, [inviteEmail, inviteRole]);

  const handleSaveChanges = useCallback(() => { setPendingChanges(0); }, []);

  // ─── Custom Role CRUD ──────────────────────────────────────────
  const openCreateRole = useCallback(() => {
    setRoleForm(emptyRoleForm);
    setShowRoleModal(true);
  }, []);

  const openEditRole = useCallback((roleId: string) => {
    const cfg = customRoles[roleId];
    if (!cfg) return;
    const colorIdx = COLOR_PALETTE.findIndex(c => c.hex === cfg.hexColor);
    const iconIdx = ICON_PALETTE.findIndex(i => i.icon === cfg.icon);
    setRoleForm({
      id: roleId,
      label: cfg.label,
      description: cfg.description,
      colorIdx: colorIdx >= 0 ? colorIdx : 0,
      iconIdx: iconIdx >= 0 ? iconIdx : 0,
      baseRole: 'member',
    });
    setShowRoleModal(true);
  }, [customRoles]);

  const handleSaveRole = useCallback(() => {
    const { id, label, description, colorIdx, iconIdx, baseRole } = roleForm;
    if (!label.trim()) return;
    const color = COLOR_PALETTE[colorIdx];
    const icon = ICON_PALETTE[iconIdx];
    const roleId = id || `custom-${label.trim().toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const isNew = !id;

    const newEntry: RoleConfigEntry = {
      label: label.trim(),
      color: color.tw, bgColor: color.twBg,
      darkColor: color.darkTw, darkBgColor: color.darkBg,
      hexColor: color.hex,
      icon: icon.icon,
      description: description.trim() || `Custom role: ${label.trim()}`,
      isBuiltIn: false,
      priority: customRoles[roleId]?.priority ?? (10 + Object.keys(customRoles).length),
    };

    setCustomRoles(prev => ({ ...prev, [roleId]: newEntry }));

    if (isNew) {
      // Add role to all permissions (default from base)
      setPermCategories(prev => prev.map(cat => ({
        ...cat,
        permissions: cat.permissions.map(p => ({
          ...p,
          roles: { ...p.roles, [roleId]: p.roles[baseRole] ?? false },
        })),
      })));
      // Add role to channel overrides
      setChannelOverrides(prev => prev.map(ch => ({
        ...ch,
        overrides: {
          ...ch.overrides,
          [roleId]: Object.fromEntries(channelPermissions.map(p => [p.id, 'inherit' as OverrideValue])) as Record<ChannelPermId, OverrideValue>,
        },
      })));
    }

    setShowRoleModal(false);
    setPendingChanges(p => p + 1);
  }, [roleForm, customRoles]);

  const handleDeleteRole = useCallback((roleId: string) => {
    // Remove from customRoles
    setCustomRoles(prev => {
      const next = { ...prev };
      delete next[roleId];
      return next;
    });
    // Reassign members to 'member'
    setMembers(prev => prev.map(m => m.role === roleId ? { ...m, role: 'member' } : m));
    // Remove from permissions
    setPermCategories(prev => prev.map(cat => ({
      ...cat,
      permissions: cat.permissions.map(p => {
        const roles = { ...p.roles };
        delete roles[roleId];
        return { ...p, roles };
      }),
    })));
    // Remove from channel overrides
    setChannelOverrides(prev => prev.map(ch => {
      const overrides = { ...ch.overrides };
      delete overrides[roleId];
      return { ...ch, overrides };
    }));
    setShowDeleteConfirm(null);
    setPendingChanges(p => p + 1);
  }, []);

  // ─── Channel overrides ─────────────────────────────────────────
  const handleChannelOverrideToggle = useCallback((channelId: string, role: string, permId: ChannelPermId) => {
    setChannelOverrides(prev => prev.map(ch => {
      if (ch.channelId !== channelId) return ch;
      const current = ch.overrides[role]?.[permId] ?? 'inherit';
      let next: OverrideValue;
      if (current === 'inherit') next = true;
      else if (current === true) next = false;
      else next = 'inherit';
      return { ...ch, overrides: { ...ch.overrides, [role]: { ...ch.overrides[role], [permId]: next } } };
    }));
    setPendingChanges(p => p + 1);
  }, []);

  const handleResetChannelOverrides = useCallback((channelId: string) => {
    setChannelOverrides(prev => prev.map(ch => {
      if (ch.channelId !== channelId) return ch;
      return { ...ch, overrides: buildDefaultOverride(allRoleKeys) };
    }));
    setPendingChanges(p => p + 1);
  }, [allRoleKeys]);

  // ─── Copy Settings ──────────────────────────────────────────
  const openCopyModal = useCallback((mode: 'role' | 'channel') => {
    setCopyMode(mode);
    setCopySource('');
    setCopyTarget('');
    setShowCopyModal(true);
  }, []);

  const handleCopySettings = useCallback(() => {
    if (!copySource || !copyTarget || copySource === copyTarget) return;
    if (copyMode === 'role') {
      // Copy all space-level permissions from source role to target role
      setPermCategories(prev => prev.map(cat => ({
        ...cat,
        permissions: cat.permissions.map(p => {
          if (p.locked) return p;
          return { ...p, roles: { ...p.roles, [copyTarget]: p.roles[copySource] ?? false } };
        }),
      })));
      // Copy channel overrides for that role too
      setChannelOverrides(prev => prev.map(ch => ({
        ...ch,
        overrides: {
          ...ch.overrides,
          [copyTarget]: { ...(ch.overrides[copySource] || Object.fromEntries(channelPermissions.map(p => [p.id, 'inherit' as OverrideValue])) as Record<ChannelPermId, OverrideValue>) },
        },
      })));
    } else {
      // Copy channel overrides from source channel to target channel
      const sourceCh = channelOverrides.find(c => c.channelId === copySource);
      if (!sourceCh) return;
      setChannelOverrides(prev => prev.map(ch => {
        if (ch.channelId !== copyTarget) return ch;
        return { ...ch, overrides: JSON.parse(JSON.stringify(sourceCh.overrides)) };
      }));
    }
    setPendingChanges(p => p + 1);
    setShowCopyModal(false);
  }, [copyMode, copySource, copyTarget, channelOverrides]);

  const channelOverrideCount = useMemo(() => {
    const counts: Record<string, number> = {};
    channelOverrides.forEach(ch => {
      let c = 0;
      for (const role of Object.keys(ch.overrides)) {
        for (const perm of Object.keys(ch.overrides[role])) {
          if (ch.overrides[role][perm as ChannelPermId] !== 'inherit') c++;
        }
      }
      counts[ch.channelId] = c;
    });
    return counts;
  }, [channelOverrides]);

  const handleExportReport = useCallback(() => {
    const spaceName = space?.name || 'Space';
    const date = new Date().toISOString().split('T')[0];
    let csv = `Permissions Report - ${spaceName}\nGenerated: ${new Date().toLocaleString()}\n\n`;
    csv += `MEMBERS\nName,Email,Role,Joined,Last Active,Status\n`;
    members.forEach(m => {
      csv += `"${m.name}","${m.email}","${allRoleConfig[m.role]?.label || m.role}","${m.joinedAt.toLocaleDateString()}","${m.lastActive.toLocaleDateString()}","${m.status}"\n`;
    });
    csv += `\nROLES\nID,Label,Type,Description\n`;
    for (const [id, cfg] of Object.entries(allRoleConfig)) {
      csv += `"${id}","${cfg.label}","${cfg.isBuiltIn ? 'Built-in' : 'Custom'}","${cfg.description}"\n`;
    }
    csv += `\nSPACE-LEVEL PERMISSIONS\nCategory,Permission,${allRoleKeys.map(r => allRoleConfig[r]?.label || r).join(',')}\n`;
    permCategories.forEach(cat => {
      cat.permissions.forEach(p => {
        csv += `"${cat.label}","${p.label}",${allRoleKeys.map(r => (p.roles[r] ?? false) ? 'Yes' : 'No').join(',')}\n`;
      });
    });
    csv += `\nCHANNEL-LEVEL OVERRIDES\nChannel,Permission,Role,Override\n`;
    channelOverrides.forEach(ch => {
      for (const role of Object.keys(ch.overrides)) {
        for (const perm of Object.keys(ch.overrides[role])) {
          const val = ch.overrides[role][perm as ChannelPermId];
          if (val !== 'inherit') {
            const permLabel = channelPermissions.find(p => p.id === perm)?.label || perm;
            csv += `"#${ch.channelName}","${permLabel}","${allRoleConfig[role]?.label || role}","${val ? 'Allow' : 'Deny'}"\n`;
          }
        }
      }
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `permissions-report-${spaceName.toLowerCase().replace(/\s+/g, '-')}-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 3000);
  }, [space, members, permCategories, channelOverrides, allRoleConfig, allRoleKeys]);

  const tabs: { id: PermTab; label: string; icon: LucideIcon }[] = [
    { id: 'members', label: t('spacePermissions.tab.members'), icon: Users },
    { id: 'roles', label: t('spacePermissions.tab.roles'), icon: Crown },
    { id: 'permissions', label: t('spacePermissions.tab.permissions'), icon: Shield },
    { id: 'channels', label: t('spacePermissions.tab.channels'), icon: Layers },
    { id: 'audit', label: t('spacePermissions.tab.audit'), icon: Eye },
  ];

  const auditLog = [
    { id: '1', action: 'Role changed', detail: 'Jane Smith changed from Member to Admin', user: 'John Doe', timestamp: new Date('2026-03-03T14:30:00'), type: 'role-change' as const },
    { id: '2', action: 'Member invited', detail: 'Erik Lehnsherr invited as Guest', user: 'Sarah Chen', timestamp: new Date('2026-01-10T09:00:00'), type: 'invite' as const },
    { id: '3', action: 'Permission updated', detail: 'Guest "Download files" permission enabled', user: 'John Doe', timestamp: new Date('2026-02-15T11:20:00'), type: 'permission' as const },
    { id: '4', action: 'Custom role created', detail: 'Contributor role created based on Member template', user: 'Sarah Chen', timestamp: new Date('2026-02-20T13:15:00'), type: 'role-change' as const },
    { id: '5', action: 'Member invited', detail: 'Fiona Gallagher invited as Guest', user: 'Jane Smith', timestamp: new Date('2026-02-01T10:00:00'), type: 'invite' as const },
    { id: '6', action: 'Custom role created', detail: 'External Reviewer role created based on Guest template', user: 'John Doe', timestamp: new Date('2026-01-25T10:30:00'), type: 'role-change' as const },
    { id: '7', action: 'Member removed', detail: 'Mike Thompson removed from space', user: 'John Doe', timestamp: new Date('2026-01-20T16:45:00'), type: 'remove' as const },
    { id: '8', action: 'Permission updated', detail: 'Member "Create channels" enabled', user: 'Sarah Chen', timestamp: new Date('2025-12-15T14:00:00'), type: 'permission' as const },
    { id: '9', action: 'Role changed', detail: 'Bob Johnson changed from Guest to Member', user: 'John Doe', timestamp: new Date('2025-11-20T09:30:00'), type: 'role-change' as const },
    { id: '10', action: 'Space created', detail: 'Engineering space created', user: 'Sarah Chen', timestamp: new Date('2024-11-01T08:00:00'), type: 'create' as const },
  ];

  const auditTypeColors: Record<string, { bg: string; text: string }> = {
    'role-change': { bg: 'bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20', text: 'text-[#5b5fc7] dark:text-[#a6a9dc]' },
    'invite': { bg: 'bg-[#237b4b]/10 dark:bg-[#237b4b]/20', text: 'text-[#237b4b] dark:text-[#6fcf97]' },
    'permission': { bg: 'bg-[#d4820c]/10 dark:bg-[#d4820c]/20', text: 'text-[#d4820c] dark:text-[#f5a623]' },
    'remove': { bg: 'bg-[#c4314b]/10 dark:bg-[#c4314b]/20', text: 'text-[#c4314b] dark:text-[#f47067]' },
    'create': { bg: 'bg-[#2196f3]/10 dark:bg-[#2196f3]/20', text: 'text-[#2196f3] dark:text-[#64b5f6]' },
  };

  if (!space) return null;

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#313338] overflow-hidden">
      {/* Header */}
      <div className="h-[60px] px-6 flex items-center justify-between border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-gradient-to-r from-white to-[#faf9f8] dark:from-[#313338] dark:to-[#2b2d31] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 flex items-center justify-center">
            <Shield size={18} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-[#242424] dark:text-[#f2f3f5]">{t('spacePermissions.title', { space: space.name })}</h1>
            <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a]">{t('spacePermissions.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#616161] dark:text-[#b9bbbe] bg-[#f0f0f0] dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg hover:bg-[#e8e8e8] dark:hover:bg-[#2a2a2a] hover:border-[#5b5fc7]/30 transition-colors"
            title={t('spacePermissions.exportTitle')}
          >
            <Download size={13} /> {t('spacePermissions.exportReport')}
          </button>
          <AnimatePresence>
            {pendingChanges > 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-2">
                <span className="text-[11px] text-[#d4820c] dark:text-[#f5a623] font-medium">{t('spacePermissions.unsavedCount', { count: pendingChanges })}</span>
                <button onClick={handleSaveChanges} className="px-3 py-1.5 bg-[#5b5fc7] hover:bg-[#4a4eb5] text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm">{t('spacePermissions.saveChanges')}</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="px-6 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#2b2d31] shrink-0">
        <div className="flex gap-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-colors ${
                  isActive ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#616161] dark:text-[#8a8a8a] hover:text-[#242424] dark:hover:text-[#e0e0e0]'
                }`}
              >
                <Icon size={15} />
                {tab.label}
                {isActive && <motion.div layoutId="perm-tab-indicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5b5fc7] dark:bg-[#a6a9dc] rounded-t-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* ─── Members Tab ─────────────────────────────────────────── */}
          {activeTab === 'members' && (
            <motion.div key="members" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="p-6 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-[360px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search members..."
                    className="w-full bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg pl-9 pr-3 py-2 text-[12px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40" />
                </div>
                <div className="relative">
                  <button onClick={() => setShowRoleFilter(!showRoleFilter)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-[12px] text-[#424242] dark:text-[#e0e0e0] hover:border-[#5b5fc7]/40 transition-colors">
                    <Users size={13} />
                    {roleFilter === 'all' ? t('spacePermissions.allRoles') : (allRoleConfig[roleFilter]?.label || roleFilter)}
                    <ChevronDown size={12} />
                  </button>
                  <AnimatePresence>
                    {showRoleFilter && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute left-0 top-full mt-1 w-[180px] bg-white dark:bg-[#2b2d31] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-xl z-50 py-1 max-h-[260px] overflow-y-auto">
                        <button onClick={() => { setRoleFilter('all'); setShowRoleFilter(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors ${roleFilter === 'all' ? 'bg-[#5b5fc7]/8 text-[#5b5fc7]' : 'text-[#424242] dark:text-[#e0e0e0] hover:bg-[#f5f5f5] dark:hover:bg-[#35373c]'}`}>
                          <Users size={13} /> {t('spacePermissions.all', { count: roleCounts.all })}
                          {roleFilter === 'all' && <Check size={13} className="ml-auto" />}
                        </button>
                        {allRoleKeys.map(r => {
                          const cfg = allRoleConfig[r];
                          if (!cfg) return null;
                          const Icon = cfg.icon;
                          return (
                            <button key={r} onClick={() => { setRoleFilter(r); setShowRoleFilter(false); }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors ${roleFilter === r ? 'bg-[#5b5fc7]/8 text-[#5b5fc7]' : 'text-[#424242] dark:text-[#e0e0e0] hover:bg-[#f5f5f5] dark:hover:bg-[#35373c]'}`}>
                              <Icon size={13} /> {cfg.label} ({roleCounts[r] || 0})
                              {roleFilter === r && <Check size={13} className="ml-auto" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5b5fc7] hover:bg-[#4a4eb5] text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm ml-auto">
                  <UserPlus size={14} /> {t('spacePermissions.inviteMember')}
                </button>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {allRoleKeys.map(r => (
                  <div key={r} className="flex items-center gap-1.5 text-[11px] text-[#616161] dark:text-[#8a8a8a]">
                    <RoleBadge roleId={r} config={allRoleConfig} size="sm" />
                    <span>{roleCounts[r] || 0}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#faf9f8] dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#f0f0f0] dark:bg-[#252525]">
                  <div className="w-9 shrink-0" />
                  <div className="flex-1 text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">Member</div>
                  <div className="w-[80px] text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider text-center">Role</div>
                  <div className="w-[70px] text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider text-right hidden lg:block">Joined</div>
                  <div className="w-[24px] shrink-0" />
                </div>
                <AnimatePresence>
                  {filteredMembers.map(member => (
                    <MemberRow key={member.userId} member={member} onRoleChange={handleRoleChange} onRemove={handleRemoveMember}
                      isCurrentUser={member.userId === currentUser.id} allRoleConfig={allRoleConfig} allRoleKeys={allRoleKeys} />
                  ))}
                </AnimatePresence>
                {filteredMembers.length === 0 && (
                  <div className="py-12 text-center">
                    <Users size={32} className="mx-auto text-[#d1d1d1] dark:text-[#4a4a4a] mb-2" />
                    <p className="text-[13px] text-[#8a8a8a] dark:text-[#6d6f78]">{t('spacePermissions.noMembers')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── Roles Tab ───────────────────────────────────────────── */}
          {activeTab === 'roles' && (
            <motion.div key="roles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="p-6">
              {/* Create role button */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[14px] font-bold text-[#242424] dark:text-[#f2f3f5]">
                    {allRoleKeys.length} Roles
                    <span className="text-[11px] font-normal text-[#8a8a8a] ml-2">
                      {BUILT_IN_ROLES.length} built-in, {Object.keys(customRoles).length} custom
                    </span>
                  </h2>
                </div>
                <button onClick={openCreateRole}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5b5fc7] hover:bg-[#4a4eb5] text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm">
                  <Plus size={14} /> Create Custom Role
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allRoleKeys.map((r, rIdx) => {
                  const cfg = allRoleConfig[r];
                  if (!cfg) return null;
                  const Icon = cfg.icon;
                  const count = roleCounts[r] || 0;
                  return (
                    <motion.div key={r} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: rIdx * 0.04 }}
                      className="bg-[#faf9f8] dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-5 hover:border-[#5b5fc7]/30 transition-colors relative group"
                    >
                      {/* Edit/Delete for custom roles */}
                      {!cfg.isBuiltIn && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditRole(r)} className="p-1.5 rounded-md hover:bg-[#e8e8e8] dark:hover:bg-[#3d3d3d] text-[#616161] dark:text-[#b9bbbe] transition-colors" title="Edit role">
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => setShowDeleteConfirm(r)} className="p-1.5 rounded-md hover:bg-[#c4314b]/10 dark:hover:bg-[#c4314b]/15 text-[#c4314b] dark:text-[#f47067] transition-colors" title="Delete role">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${cfg.bgColor} ${cfg.darkBgColor} flex items-center justify-center`}>
                          <Icon size={20} className={`${cfg.color} ${cfg.darkColor}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-[14px] font-bold text-[#242424] dark:text-[#f2f3f5]">{cfg.label}</h3>
                            {!cfg.isBuiltIn && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc]">CUSTOM</span>
                            )}
                            <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] bg-[#e8e8e8] dark:bg-[#3d3d3d] px-2 py-0.5 rounded-full">
                              {count} member{count !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#616161] dark:text-[#8a8a8a] mb-3">{cfg.description}</p>
                          <div className="flex items-center gap-1">
                            {members.filter(m => m.role === r).slice(0, 5).map(m => (
                              <img key={m.userId} src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full border-2 border-white dark:border-[#2b2d31] -ml-1 first:ml-0" title={m.name} />
                            ))}
                            {count > 5 && (
                              <span className="w-6 h-6 rounded-full bg-[#e8e8e8] dark:bg-[#3d3d3d] flex items-center justify-center text-[9px] font-bold text-[#616161] dark:text-[#b9bbbe] -ml-1 border-2 border-white dark:border-[#2b2d31]">+{count - 5}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#e1dfdd] dark:border-[#3d3d3d]">
                        <p className="text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider mb-2">Key Capabilities</p>
                        <div className="flex flex-wrap gap-1.5">
                          {permCategories.flatMap(cat => cat.permissions).filter(p => p.roles[r]).slice(0, 6).map(p => (
                            <span key={p.id} className="inline-flex items-center gap-1 text-[10px] text-[#424242] dark:text-[#b9bbbe] bg-[#e8e8e8] dark:bg-[#3d3d3d] px-2 py-0.5 rounded">
                              <Check size={9} className="text-[#237b4b] dark:text-[#6fcf97]" /> {p.label}
                            </span>
                          ))}
                          {permCategories.flatMap(cat => cat.permissions).filter(p => p.roles[r]).length > 6 && (
                            <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] px-1">
                              +{permCategories.flatMap(cat => cat.permissions).filter(p => p.roles[r]).length - 6} more
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {permCategories.flatMap(cat => cat.permissions).filter(p => !p.roles[r]).slice(0, 3).map(p => (
                            <span key={p.id} className="inline-flex items-center gap-1 text-[10px] text-[#c4314b]/70 dark:text-[#f47067]/60 bg-[#c4314b]/5 dark:bg-[#c4314b]/10 px-2 py-0.5 rounded">
                              <X size={9} /> {p.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ─── Permissions Tab ─────────────────────────────────────── */}
          {activeTab === 'permissions' && (
            <motion.div key="permissions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="p-6">
              <div className="flex items-center gap-3 px-4 py-3 bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10 border border-[#5b5fc7]/20 rounded-lg mb-4">
                <Info size={16} className="text-[#5b5fc7] dark:text-[#a6a9dc] mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-[12px] text-[#242424] dark:text-[#e0e0e0] font-medium">Permission Matrix</p>
                  <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a]">
                    Toggle switches to customize what each role can do. Owner permissions are locked. Access to restricted and confidential content is controlled here.
                  </p>
                </div>
                <button onClick={() => openCopyModal('role')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#5b5fc7] dark:text-[#a6a9dc] bg-white dark:bg-[#2b2d31] border border-[#5b5fc7]/30 dark:border-[#5b5fc7]/40 rounded-lg hover:bg-[#5b5fc7]/5 dark:hover:bg-[#5b5fc7]/10 transition-colors shrink-0">
                  <Copy size={13} /> Copy Settings
                </button>
              </div>
              <div className="bg-[#faf9f8] dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-x-auto">
                <PermissionMatrix categories={permCategories} onToggle={handlePermToggle} allRoleConfig={allRoleConfig} allRoleKeys={allRoleKeys} />
              </div>
            </motion.div>
          )}

          {/* ─── Channels Tab ──────────────────────────────────────── */}
          {activeTab === 'channels' && (
            <motion.div key="channels" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="p-6">
              <div className="flex items-start gap-3 px-4 py-3 bg-[#d4820c]/5 dark:bg-[#d4820c]/10 border border-[#d4820c]/20 rounded-lg mb-4">
                <AlertTriangle size={16} className="text-[#d4820c] dark:text-[#f5a623] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[12px] text-[#242424] dark:text-[#e0e0e0] font-medium">Channel-Level Overrides</p>
                  <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a]">
                    Override space-level permissions for individual channels. Each permission cycles: <span className="font-semibold text-[#8a8a8a]">Inherit</span>, <span className="font-semibold text-[#237b4b]">Allow</span>, or <span className="font-semibold text-[#c4314b]">Deny</span>. Owner overrides are locked.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-[220px] shrink-0 bg-[#faf9f8] dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#f0f0f0] dark:bg-[#252525]">
                    <p className="text-[11px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">Channels</p>
                  </div>
                  <div className="py-1">
                    {channelOverrides.map(ch => {
                      const isSelected = selectedChannelId === ch.channelId;
                      const overrideCount = channelOverrideCount[ch.channelId] || 0;
                      const typeIcon = ch.channelType === 'announcement' ? <Volume2 size={14} className="text-[#616161] dark:text-[#b9bbbe] shrink-0" /> :
                        ch.channelType === 'private' ? <Lock size={14} className="text-[#616161] dark:text-[#b9bbbe] shrink-0" /> :
                        <Hash size={14} className="text-[#616161] dark:text-[#b9bbbe] shrink-0" />;
                      return (
                        <button key={ch.channelId} onClick={() => setSelectedChannelId(ch.channelId)}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors ${isSelected ? 'bg-[#5b5fc7]/8 dark:bg-[#5b5fc7]/15 text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#424242] dark:text-[#e0e0e0] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]'}`}>
                          {typeIcon}
                          <span className="text-[12px] font-medium flex-1 truncate">{ch.channelName}</span>
                          {overrideCount > 0 && <span className="text-[9px] font-bold bg-[#d4820c]/15 dark:bg-[#d4820c]/25 text-[#d4820c] dark:text-[#f5a623] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{overrideCount}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex-1 bg-[#faf9f8] dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                  {selectedChannelId ? (() => {
                    const ch = channelOverrides.find(c => c.channelId === selectedChannelId);
                    if (!ch) return null;
                    const overrideCount = channelOverrideCount[ch.channelId] || 0;
                    return (
                      <>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#f0f0f0] dark:bg-[#252525]">
                          <div className="flex items-center gap-2">
                            <Hash size={15} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
                            <span className="text-[13px] font-semibold text-[#242424] dark:text-[#f2f3f5]">{ch.channelName}</span>
                            {ch.channelType !== 'text' && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc] uppercase">{ch.channelType}</span>}
                            {overrideCount > 0 && <span className="text-[10px] text-[#d4820c] dark:text-[#f5a623]">{overrideCount} override{overrideCount > 1 ? 's' : ''}</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setCopyMode('channel'); setCopySource(''); setCopyTarget(ch.channelId); setShowCopyModal(true); }}
                              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#5b5fc7] dark:text-[#a6a9dc] hover:bg-[#5b5fc7]/8 dark:hover:bg-[#5b5fc7]/15 rounded-md transition-colors">
                              <Copy size={11} /> Copy from…
                            </button>
                            {overrideCount > 0 && (
                              <button onClick={() => handleResetChannelOverrides(ch.channelId)} className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#e8e8e8] dark:hover:bg-[#3d3d3d] rounded-md transition-colors">
                                <RotateCcw size={11} /> Reset all
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <div className="flex items-center px-4 py-2 border-b border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 min-w-fit">
                            <div className="flex-1 min-w-[120px] text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">Permission</div>
                            {allRoleKeys.map(r => (
                              <div key={r} className="w-[68px] text-center shrink-0">
                                <RoleBadge roleId={r} config={allRoleConfig} size="sm" />
                              </div>
                            ))}
                          </div>
                          {channelPermissions.map((perm, idx) => (
                            <div key={perm.id} className={`flex items-center px-4 py-3 min-w-fit ${idx % 2 === 0 ? 'bg-white dark:bg-[#1e1f22]' : 'bg-[#fafafa] dark:bg-[#222]'} hover:bg-[#f0f0f5] dark:hover:bg-[#2a2a2e] transition-colors`}>
                              <div className="flex-1 min-w-[120px]">
                                <p className="text-[12px] font-medium text-[#242424] dark:text-[#e0e0e0]">{perm.label}</p>
                              </div>
                              {allRoleKeys.map(r => {
                                const val = ch.overrides[r]?.[perm.id] ?? 'inherit';
                                const isOwner = r === 'owner';
                                return (
                                  <div key={r} className="w-[68px] flex justify-center shrink-0">
                                    {isOwner ? (
                                      <div className="w-[22px] h-[22px] rounded-md bg-[#5b5fc7]/15 dark:bg-[#5b5fc7]/25 flex items-center justify-center" title="Owner — always allowed">
                                        <Check size={12} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
                                      </div>
                                    ) : (
                                      <button onClick={() => handleChannelOverrideToggle(ch.channelId, r, perm.id)}
                                        className={`w-[22px] h-[22px] rounded-md flex items-center justify-center transition-all border ${
                                          val === 'inherit' ? 'bg-[#f0f0f0] dark:bg-[#333] border-[#d1d1d1] dark:border-[#4a4a4a] hover:border-[#5b5fc7]/40'
                                          : val === true ? 'bg-[#237b4b]/15 dark:bg-[#237b4b]/25 border-[#237b4b]/40 dark:border-[#237b4b]/50'
                                          : 'bg-[#c4314b]/10 dark:bg-[#c4314b]/20 border-[#c4314b]/30 dark:border-[#c4314b]/40'
                                        }`}
                                        title={val === 'inherit' ? 'Inherit from space' : val ? 'Override: Allow' : 'Override: Deny'}>
                                        {val === 'inherit' ? <span className="text-[8px] font-bold text-[#8a8a8a] dark:text-[#6d6f78]">—</span>
                                          : val === true ? <Check size={12} className="text-[#237b4b] dark:text-[#6fcf97]" />
                                          : <X size={12} className="text-[#c4314b] dark:text-[#f47067]" />}
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#f5f5f5] dark:bg-[#252525]">
                          <span className="text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider mr-1">Legend:</span>
                          <span className="flex items-center gap-1 text-[10px] text-[#8a8a8a]">
                            <span className="w-4 h-4 rounded bg-[#f0f0f0] dark:bg-[#333] border border-[#d1d1d1] dark:border-[#4a4a4a] flex items-center justify-center text-[7px] font-bold">—</span> Inherit
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-[#237b4b] dark:text-[#6fcf97]">
                            <span className="w-4 h-4 rounded bg-[#237b4b]/15 border border-[#237b4b]/40 flex items-center justify-center"><Check size={9} /></span> Allow
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-[#c4314b] dark:text-[#f47067]">
                            <span className="w-4 h-4 rounded bg-[#c4314b]/10 border border-[#c4314b]/30 flex items-center justify-center"><X size={9} /></span> Deny
                          </span>
                          <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] ml-auto italic">Click to cycle</span>
                        </div>
                      </>
                    );
                  })() : (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Layers size={36} className="text-[#d1d1d1] dark:text-[#4a4a4a] mb-3" />
                      <p className="text-[13px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-1">Select a channel</p>
                      <p className="text-[11px] text-[#b9bbbe] dark:text-[#4a4a4a]">Choose a channel to configure permission overrides</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Audit Log Tab ───────────────────────────────────────── */}
          {activeTab === 'audit' && (
            <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="p-6">
              <div className="bg-[#faf9f8] dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#f0f0f0] dark:bg-[#252525]">
                  <h3 className="text-[13px] font-semibold text-[#242424] dark:text-[#f2f3f5]">Permission Changes History</h3>
                  <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">Track all role and permission modifications in this space</p>
                </div>
                <div className="divide-y divide-[#e1dfdd] dark:divide-[#3d3d3d]">
                  {auditLog.map((entry, idx) => {
                    const colors = auditTypeColors[entry.type] || auditTypeColors['create'];
                    return (
                      <motion.div key={entry.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors">
                        <div className={`w-7 h-7 rounded-full ${colors.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          {entry.type === 'role-change' && <UserCog size={13} className={colors.text} />}
                          {entry.type === 'invite' && <UserPlus size={13} className={colors.text} />}
                          {entry.type === 'permission' && <Shield size={13} className={colors.text} />}
                          {entry.type === 'remove' && <Trash2 size={13} className={colors.text} />}
                          {entry.type === 'create' && <Settings size={13} className={colors.text} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-semibold text-[#242424] dark:text-[#e0e0e0]">{entry.action}</span>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                              {entry.type.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a]">{entry.detail}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">by {entry.user}</span>
                            <span className="text-[10px] text-[#b9bbbe] dark:text-[#4a4a4a]">•</span>
                            <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">
                              {entry.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                              {entry.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ─── Invite Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowInviteModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()} className="w-[440px] bg-white dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8]">
                <div className="flex items-center gap-2 text-white"><UserPlus size={18} /><span className="text-[14px] font-bold">Invite Member</span></div>
                <button onClick={() => setShowInviteModal(false)} className="text-white/70 hover:text-white transition-colors"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">Email Address</label>
                  <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com"
                    className="w-full bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg px-3 py-2.5 text-[13px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40"
                    onKeyDown={(e) => e.key === 'Enter' && handleInvite()} autoFocus />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">Assign Role</label>
                  <div className="grid grid-cols-3 gap-2 max-h-[180px] overflow-y-auto">
                    {allRoleKeys.filter(r => r !== 'owner').map(r => {
                      const cfg = allRoleConfig[r];
                      if (!cfg) return null;
                      const Icon = cfg.icon;
                      const isSelected = inviteRole === r;
                      return (
                        <button key={r} onClick={() => setInviteRole(r)}
                          className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border-2 transition-all ${
                            isSelected ? 'border-[#5b5fc7] bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10' : 'border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/30'
                          }`}>
                          <Icon size={18} className={isSelected ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#8a8a8a]'} />
                          <span className={`text-[11px] font-semibold ${isSelected ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#616161] dark:text-[#8a8a8a]'}`}>{cfg.label}</span>
                          {!cfg.isBuiltIn && <span className="text-[7px] text-[#8a8a8a] uppercase">Custom</span>}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] mt-2">{allRoleConfig[inviteRole]?.description || ''}</p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-[12px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#3d3d3d] rounded-lg transition-colors">Cancel</button>
                  <button onClick={handleInvite} disabled={!inviteEmail.trim()} className="px-4 py-2 bg-[#5b5fc7] hover:bg-[#4a4eb5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm">Send Invite</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Create / Edit Role Modal ─────────────────────────────── */}
      <AnimatePresence>
        {showRoleModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowRoleModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()} className="w-[480px] bg-white dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8] shrink-0">
                <div className="flex items-center gap-2 text-white">
                  <Crown size={18} />
                  <span className="text-[14px] font-bold">{roleForm.id ? 'Edit Custom Role' : 'Create Custom Role'}</span>
                </div>
                <button onClick={() => setShowRoleModal(false)} className="text-white/70 hover:text-white transition-colors"><X size={18} /></button>
              </div>

              <div className="p-5 space-y-5 overflow-y-auto flex-1">
                {/* Preview */}
                <div className="flex items-center gap-3 p-3 bg-[#f5f5f5] dark:bg-[#252525] rounded-lg">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${COLOR_PALETTE[roleForm.colorIdx]?.hex}18` }}
                  >
                    {(() => { const Ic = ICON_PALETTE[roleForm.iconIdx]?.icon || Shield; return <Ic size={20} style={{ color: COLOR_PALETTE[roleForm.colorIdx]?.hex }} />; })()}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#242424] dark:text-[#f2f3f5]">{roleForm.label || 'Role Name'}</p>
                    <p className="text-[10px] text-[#8a8a8a]">{roleForm.description || 'Role description...'}</p>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">Role Name</label>
                  <input type="text" value={roleForm.label} onChange={(e) => setRoleForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="e.g. Tech Lead, Triage Agent..."
                    className="w-full bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg px-3 py-2.5 text-[13px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40" />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">Description</label>
                  <textarea value={roleForm.description} onChange={(e) => setRoleForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="What can this role do?" rows={2}
                    className="w-full bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg px-3 py-2.5 text-[13px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40 resize-none" />
                </div>

                {/* Color picker */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-2">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_PALETTE.map((c, i) => (
                      <button key={c.hex} onClick={() => setRoleForm(f => ({ ...f, colorIdx: i }))}
                        className={`w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center ${
                          roleForm.colorIdx === i ? 'border-[#242424] dark:border-white scale-110' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}>
                        {roleForm.colorIdx === i && <Check size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon picker */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-2">Icon</label>
                  <div className="flex gap-2 flex-wrap">
                    {ICON_PALETTE.map((ic, i) => {
                      const Ic = ic.icon;
                      return (
                        <button key={ic.label} onClick={() => setRoleForm(f => ({ ...f, iconIdx: i }))}
                          className={`w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center ${
                            roleForm.iconIdx === i
                              ? 'border-[#5b5fc7] bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20'
                              : 'border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/40 bg-[#f5f5f5] dark:bg-[#252525]'
                          }`}
                          title={ic.label}>
                          <Ic size={16} className={roleForm.iconIdx === i ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#616161] dark:text-[#b9bbbe]'} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Base template (only for new roles) */}
                {!roleForm.id && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">Permission Template</label>
                    <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] mb-2">New role will inherit permissions from this base role.</p>
                    <div className="flex gap-2">
                      {(['admin', 'member', 'guest'] as BuiltInRole[]).map(r => {
                        const cfg = builtInRoleConfig[r];
                        const Icon = cfg.icon;
                        const isSelected = roleForm.baseRole === r;
                        return (
                          <button key={r} onClick={() => setRoleForm(f => ({ ...f, baseRole: r }))}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-[12px] font-medium ${
                              isSelected ? 'border-[#5b5fc7] bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10 text-[#5b5fc7]' : 'border-[#e1dfdd] dark:border-[#3d3d3d] text-[#616161] dark:text-[#b9bbbe] hover:border-[#5b5fc7]/30'
                            }`}>
                            <Icon size={14} /> {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 px-5 py-4 border-t border-[#e1dfdd] dark:border-[#3d3d3d] shrink-0">
                <button onClick={() => setShowRoleModal(false)} className="px-4 py-2 text-[12px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#3d3d3d] rounded-lg transition-colors">Cancel</button>
                <button onClick={handleSaveRole} disabled={!roleForm.label.trim()}
                  className="px-4 py-2 bg-[#5b5fc7] hover:bg-[#4a4eb5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm">
                  {roleForm.id ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirmation Modal ────────────────────────────── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowDeleteConfirm(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()} className="w-[380px] bg-white dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-2xl overflow-hidden">
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#c4314b]/10 dark:bg-[#c4314b]/20 flex items-center justify-center">
                    <AlertTriangle size={20} className="text-[#c4314b] dark:text-[#f47067]" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#242424] dark:text-[#f2f3f5]">Delete Role</h3>
                    <p className="text-[11px] text-[#8a8a8a]">
                      Delete "{customRoles[showDeleteConfirm]?.label || showDeleteConfirm}"?
                    </p>
                  </div>
                </div>
                <p className="text-[12px] text-[#616161] dark:text-[#8a8a8a]">
                  {(roleCounts[showDeleteConfirm] || 0) > 0
                    ? `${roleCounts[showDeleteConfirm]} member${(roleCounts[showDeleteConfirm] || 0) > 1 ? 's' : ''} with this role will be reassigned to Member.`
                    : 'No members currently have this role.'
                  }
                  {' '}This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-[12px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#3d3d3d] rounded-lg transition-colors">Cancel</button>
                  <button onClick={() => handleDeleteRole(showDeleteConfirm)}
                    className="px-4 py-2 bg-[#c4314b] hover:bg-[#a82a40] text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm">Delete Role</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Copy Settings Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showCopyModal && (() => {
          const isRole = copyMode === 'role';
          const sourceOptions = isRole
            ? allRoleKeys.filter(r => r !== 'owner')
            : channelOverrides.map(ch => ({ id: ch.channelId, label: ch.channelName }));
          const targetOptions = isRole
            ? allRoleKeys.filter(r => r !== 'owner' && r !== copySource)
            : channelOverrides.filter(ch => ch.channelId !== copySource).map(ch => ({ id: ch.channelId, label: ch.channelName }));
          const sourceLabel = isRole
            ? (copySource ? allRoleConfig[copySource]?.label || copySource : '')
            : (copySource ? channelOverrides.find(c => c.channelId === copySource)?.channelName || '' : '');
          const targetLabel = isRole
            ? (copyTarget ? allRoleConfig[copyTarget]?.label || copyTarget : '')
            : (copyTarget ? channelOverrides.find(c => c.channelId === copyTarget)?.channelName || '' : '');
          const canConfirm = !!copySource && !!copyTarget && copySource !== copyTarget;

          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCopyModal(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()} className="w-[460px] bg-white dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8]">
                  <div className="flex items-center gap-2 text-white">
                    <Copy size={18} />
                    <span className="text-[14px] font-bold">Copy {isRole ? 'Role' : 'Channel'} Settings</span>
                  </div>
                  <button onClick={() => setShowCopyModal(false)} className="text-white/70 hover:text-white transition-colors"><X size={18} /></button>
                </div>

                <div className="p-5 space-y-5">
                  <p className="text-[12px] text-[#616161] dark:text-[#8a8a8a]">
                    {isRole
                      ? 'Copy all space-level permissions and channel overrides from one role to another. This will overwrite the target role\'s current settings.'
                      : 'Copy all permission overrides from one channel to another. This will overwrite the target channel\'s current overrides.'
                    }
                  </p>

                  {/* Visual source → target */}
                  <div className="flex items-center gap-3">
                    {/* Source */}
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">
                        Copy from
                      </label>
                      <div className="relative">
                        <select
                          value={copySource}
                          onChange={(e) => { setCopySource(e.target.value); if (e.target.value === copyTarget) setCopyTarget(''); }}
                          className="w-full bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg px-3 py-2.5 text-[13px] text-[#242424] dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40 appearance-none pr-8"
                        >
                          <option value="">Select {isRole ? 'role' : 'channel'}…</option>
                          {isRole
                            ? (sourceOptions as string[]).map(r => (
                              <option key={r} value={r}>{allRoleConfig[r]?.label || r}{!allRoleConfig[r]?.isBuiltIn ? ' (Custom)' : ''}</option>
                            ))
                            : (sourceOptions as { id: string; label: string }[]).map(ch => (
                              <option key={ch.id} value={ch.id}>#{ch.label}</option>
                            ))
                          }
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a8a8a] pointer-events-none" />
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="pt-6">
                      <div className="w-8 h-8 rounded-full bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 flex items-center justify-center">
                        <ArrowRight size={16} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
                      </div>
                    </div>

                    {/* Target */}
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">
                        Copy to
                      </label>
                      <div className="relative">
                        <select
                          value={copyTarget}
                          onChange={(e) => setCopyTarget(e.target.value)}
                          disabled={!copySource}
                          className="w-full bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg px-3 py-2.5 text-[13px] text-[#242424] dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40 appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Select {isRole ? 'role' : 'channel'}…</option>
                          {isRole
                            ? (targetOptions as string[]).map(r => (
                              <option key={r} value={r}>{allRoleConfig[r]?.label || r}{!allRoleConfig[r]?.isBuiltIn ? ' (Custom)' : ''}</option>
                            ))
                            : (targetOptions as { id: string; label: string }[]).map(ch => (
                              <option key={ch.id} value={ch.id}>#{ch.label}</option>
                            ))
                          }
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a8a8a] pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Preview summary */}
                  {canConfirm && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 p-3 bg-[#d4820c]/5 dark:bg-[#d4820c]/10 border border-[#d4820c]/20 rounded-lg">
                      <AlertTriangle size={14} className="text-[#d4820c] dark:text-[#f5a623] mt-0.5 shrink-0" />
                      <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a]">
                        {isRole
                          ? <>All permissions for <span className="font-semibold text-[#242424] dark:text-[#e0e0e0]">{targetLabel}</span> will be overwritten with settings from <span className="font-semibold text-[#242424] dark:text-[#e0e0e0]">{sourceLabel}</span>.</>
                          : <>All overrides on <span className="font-semibold text-[#242424] dark:text-[#e0e0e0]">#{targetLabel}</span> will be replaced with overrides from <span className="font-semibold text-[#242424] dark:text-[#e0e0e0]">#{sourceLabel}</span>.</>
                        }
                      </p>
                    </motion.div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setShowCopyModal(false)} className="px-4 py-2 text-[12px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#3d3d3d] rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleCopySettings} disabled={!canConfirm}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#5b5fc7] hover:bg-[#4a4eb5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm">
                      <Copy size={13} /> Copy Settings
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ─── Export Toast ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showExportToast && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-2xl">
            <div className="w-7 h-7 rounded-full bg-[#237b4b]/15 dark:bg-[#237b4b]/25 flex items-center justify-center"><Check size={14} className="text-[#237b4b] dark:text-[#6fcf97]" /></div>
            <div>
              <p className="text-[12px] font-semibold text-[#242424] dark:text-[#f2f3f5]">Report exported</p>
              <p className="text-[10px] text-[#616161] dark:text-[#8a8a8a]">CSV file downloaded successfully</p>
            </div>
            <button onClick={() => setShowExportToast(false)} className="text-[#8a8a8a] hover:text-[#424242] dark:hover:text-[#e0e0e0] ml-2"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
