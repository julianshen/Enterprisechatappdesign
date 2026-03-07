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
  Building2, User, Phone, MapPin, Clock, Mail, Filter,
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
  title?: string;
  phone?: string;
  location?: string;
  joinedAt: Date;
  lastActive: Date;
  status: 'online' | 'away' | 'busy' | 'offline';
  departmentId?: string;
}

interface SpaceDepartment {
  id: string;
  name: string;
  icon: string;
  description: string;
  role: string;
  joinedAt: Date;
  memberIds: string[];
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
  { userId: 'user-1', name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', email: 'john.doe@company.com', role: 'admin', title: 'Senior Engineer', phone: '+1 (555) 100-0002', location: 'New York, NY', joinedAt: new Date('2025-01-15'), lastActive: new Date('2026-03-04T09:30:00'), status: 'online' },
  { userId: 'user-owner', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', email: 'sarah.chen@company.com', role: 'owner', title: 'VP Engineering', phone: '+1 (555) 100-0001', location: 'San Francisco, CA', joinedAt: new Date('2024-11-01'), lastActive: new Date('2026-03-04T08:15:00'), status: 'online' },
  { userId: 'user-2', name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', email: 'jane.smith@company.com', role: 'admin', title: 'Engineering Manager', location: 'Austin, TX', joinedAt: new Date('2025-02-10'), lastActive: new Date('2026-03-03T16:45:00'), status: 'online' },
  { userId: 'user-3', name: 'Bob Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', email: 'bob.johnson@company.com', role: 'member', title: 'Backend Engineer', joinedAt: new Date('2025-03-20'), lastActive: new Date('2026-03-04T07:00:00'), status: 'away', departmentId: 'dept-backend' },
  { userId: 'user-4', name: 'Alice Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', email: 'alice.williams@company.com', role: 'member', title: 'Frontend Engineer', joinedAt: new Date('2025-04-05'), lastActive: new Date('2026-03-03T14:20:00'), status: 'online', departmentId: 'dept-frontend' },
  { userId: 'user-5', name: 'Charlie Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', email: 'charlie.brown@company.com', role: 'custom-contributor', title: 'Senior Backend Engineer', joinedAt: new Date('2025-05-12'), lastActive: new Date('2026-03-02T11:30:00'), status: 'busy', departmentId: 'dept-backend' },
  { userId: 'user-6', name: 'Diana Prince', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana', email: 'diana.prince@company.com', role: 'member', title: 'UI Engineer', joinedAt: new Date('2025-06-01'), lastActive: new Date('2026-03-04T10:00:00'), status: 'online', departmentId: 'dept-frontend' },
  { userId: 'user-7', name: 'Erik Lehnsherr', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Erik', email: 'erik.lehnsherr@partner.com', role: 'custom-reviewer', title: 'External Consultant', joinedAt: new Date('2026-01-10'), lastActive: new Date('2026-02-28T09:00:00'), status: 'offline' },
  { userId: 'user-8', name: 'Fiona Gallagher', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona', email: 'fiona.g@contractor.io', role: 'guest', title: 'Contractor · QA', joinedAt: new Date('2026-02-01'), lastActive: new Date('2026-03-01T15:30:00'), status: 'offline' },
  // Department-only members (not individually added, come via department)
  { userId: 'user-dp-1', name: 'Liam Park', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam', email: 'liam.park@company.com', role: 'member', title: 'Backend Engineer', joinedAt: new Date('2025-08-01'), lastActive: new Date('2026-03-05T08:45:00'), status: 'online', departmentId: 'dept-backend' },
  { userId: 'user-dp-2', name: 'Nadia Volkov', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nadia', email: 'nadia.volkov@company.com', role: 'member', title: 'DevOps Engineer', phone: '+1 (555) 200-0004', joinedAt: new Date('2025-09-15'), lastActive: new Date('2026-03-05T07:30:00'), status: 'online', departmentId: 'dept-backend' },
  { userId: 'user-dp-3', name: 'Marco Silva', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco', email: 'marco.silva@company.com', role: 'member', title: 'Design Engineer', joinedAt: new Date('2025-07-15'), lastActive: new Date('2026-03-04T17:00:00'), status: 'away', departmentId: 'dept-frontend' },
  { userId: 'user-dp-4', name: 'Yuki Tanaka', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki', email: 'yuki.tanaka@company.com', role: 'member', title: 'QA Lead', joinedAt: new Date('2025-03-20'), lastActive: new Date('2026-03-05T09:15:00'), status: 'online', departmentId: 'dept-qa' },
  { userId: 'user-dp-5', name: 'Amir Hassan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amir', email: 'amir.hassan@company.com', role: 'member', title: 'QA Engineer', joinedAt: new Date('2025-10-01'), lastActive: new Date('2026-03-03T12:00:00'), status: 'offline', departmentId: 'dept-qa' },
];

const mockDepartments: SpaceDepartment[] = [
  { id: 'dept-backend', name: 'Backend Engineering', icon: '🔧', description: 'Server-side services, APIs, and infrastructure', role: 'member', joinedAt: new Date('2025-01-20'), memberIds: ['user-3', 'user-5', 'user-dp-1', 'user-dp-2'] },
  { id: 'dept-frontend', name: 'Frontend Engineering', icon: '🎨', description: 'UI/UX implementation, web applications, and design systems', role: 'member', joinedAt: new Date('2025-02-01'), memberIds: ['user-4', 'user-6', 'user-dp-3'] },
  { id: 'dept-qa', name: 'Quality Assurance', icon: '🧪', description: 'Testing, automation, and quality processes', role: 'member', joinedAt: new Date('2025-03-15'), memberIds: ['user-dp-4', 'user-dp-5'] },
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
  member, onRoleChange, onRemove, isCurrentUser, allRoleConfig, allRoleKeys, onSelect, indented,
}: {
  member: SpaceMember;
  onRoleChange: (userId: string, role: string) => void;
  onRemove: (userId: string) => void;
  isCurrentUser: boolean;
  allRoleConfig: Record<string, RoleConfigEntry>;
  allRoleKeys: string[];
  onSelect?: (member: SpaceMember) => void;
  indented?: boolean;
}) {
  const { t } = useI18n();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const canChangeRole = member.role !== 'owner' && !isCurrentUser;

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className={`flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors group rounded-lg ${indented ? 'pl-11' : ''} ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={() => onSelect?.(member)}
    >
      <div className="relative shrink-0">
        <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-full" />
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#1e1f22] ${statusColors[member.status]}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#242424] dark:text-[#f2f3f5] truncate">{member.name}</span>
          {isCurrentUser && <span className="text-[9px] bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc] px-1.5 py-0.5 rounded font-semibold">{t('common.you')}</span>}
        </div>
        <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a] truncate">{member.title || member.email}</p>
      </div>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
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
                    {!cfg.isBuiltIn && <span className="text-[8px] text-[#8a8a8a] bg-[#e8e8e8] dark:bg-[#3d3d3d] px-1.5 py-0.5 rounded">{t('spacePermissions.custom')}</span>}
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
      <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
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

function DepartmentRow({
  dept, deptMembers, isExpanded, onToggle, onRoleChange, onRemove, onRemoveDept,
  allRoleConfig, allRoleKeys, onSelectMember,
}: {
  dept: SpaceDepartment;
  deptMembers: SpaceMember[];
  isExpanded: boolean;
  onToggle: () => void;
  onRoleChange: (userId: string, role: string) => void;
  onRemove: (userId: string) => void;
  onRemoveDept: (deptId: string) => void;
  allRoleConfig: Record<string, RoleConfigEntry>;
  allRoleKeys: string[];
  onSelectMember: (member: SpaceMember) => void;
}) {
  const { t } = useI18n();
  const [showActions, setShowActions] = useState(false);
  const onlineCount = deptMembers.filter(m => m.status === 'online').length;

  return (
    <div className="rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#f0f0f5] dark:hover:bg-[#2a2a2e] transition-colors group cursor-pointer"
        onClick={onToggle}>
        <ChevronRight size={14} className={`transition-transform duration-200 text-[#616161] dark:text-[#b9bbbe] shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
        <div className="w-9 h-9 rounded-lg bg-[#5b5fc7]/8 dark:bg-[#5b5fc7]/15 flex items-center justify-center text-[18px] shrink-0">{dept.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[#242424] dark:text-[#f2f3f5]">{dept.name}</span>
            <span className="flex items-center gap-1 text-[10px] bg-[#e8e8e8] dark:bg-[#3d3d3d] text-[#616161] dark:text-[#b9bbbe] px-1.5 py-0.5 rounded-full">
              <Building2 size={9} /> DEPT
            </span>
          </div>
          <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a] truncate">{dept.description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#616161] dark:text-[#8a8a8a]">
            <Users size={12} />
            <span>{deptMembers.length}</span>
            {onlineCount > 0 && (
              <span className="flex items-center gap-1 text-[#237b4b] dark:text-[#6fcf97]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#237b4b]" />{onlineCount}
              </span>
            )}
          </div>
          <RoleBadge roleId={dept.role} config={allRoleConfig} size="sm" />
        </div>
        <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] w-[70px] text-right shrink-0 hidden lg:block">
          {dept.joinedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
        </span>
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setShowActions(!showActions)} className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-[#e8e8e8] dark:hover:bg-[#3d3d3d] transition-all text-[#616161] dark:text-[#b9bbbe]">
            <MoreHorizontal size={16} />
          </button>
          <AnimatePresence>
            {showActions && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 w-[180px] bg-white dark:bg-[#2b2d31] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-xl z-50 py-1">
                <button onClick={() => setShowActions(false)} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#424242] dark:text-[#e0e0e0] hover:bg-[#f5f5f5] dark:hover:bg-[#35373c]">
                  <UserPlus size={13} /> Add member to dept
                </button>
                <button onClick={() => { onRemoveDept(dept.id); setShowActions(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#c4314b] hover:bg-[#c4314b]/8 dark:hover:bg-[#c4314b]/15">
                  <Trash2 size={13} /> Remove department
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden border-l-2 border-[#5b5fc7]/20 dark:border-[#5b5fc7]/30 ml-7">
            {deptMembers.map(member => (
              <MemberRow key={member.userId} member={member} onRoleChange={onRoleChange} onRemove={onRemove}
                isCurrentUser={member.userId === currentUser.id} allRoleConfig={allRoleConfig} allRoleKeys={allRoleKeys}
                onSelect={onSelectMember} indented />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const statusLabels: Record<string, string> = { online: 'Online', away: 'Away', busy: 'Busy', offline: 'Offline' };

function MemberDetailPanel({ member, onClose, departments, allRoleConfig }: {
  member: SpaceMember; onClose: () => void; departments: SpaceDepartment[]; allRoleConfig: Record<string, RoleConfigEntry>;
}) {
  const dept = member.departmentId ? departments.find(d => d.id === member.departmentId) : null;
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="w-[300px] shrink-0 bg-[#faf9f8] dark:bg-[#2b2d31] border-l border-[#e1dfdd] dark:border-[#3d3d3d] flex flex-col overflow-y-auto">
      <div className="relative">
        <div className="h-[72px] bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8]" />
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"><X size={14} /></button>
        <div className="px-5 -mt-7">
          <div className="relative inline-block">
            <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-full border-4 border-[#faf9f8] dark:border-[#2b2d31]" />
            <div className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#faf9f8] dark:border-[#2b2d31] ${statusColors[member.status]}`} />
          </div>
        </div>
      </div>
      <div className="px-5 pt-2 pb-5 space-y-4">
        <div>
          <h3 className="text-[15px] font-bold text-[#242424] dark:text-[#f2f3f5]">{member.name}</h3>
          {member.title && <p className="text-[12px] text-[#616161] dark:text-[#8a8a8a]">{member.title}</p>}
          <div className="flex items-center gap-2 mt-2">
            <RoleBadge roleId={member.role} config={allRoleConfig} size="sm" />
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78]">
              <div className={`w-1.5 h-1.5 rounded-full ${statusColors[member.status]}`} />{statusLabels[member.status]}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-[12px]"><Mail size={14} className="text-[#8a8a8a] shrink-0" /><span className="text-[#242424] dark:text-[#e0e0e0] truncate">{member.email}</span></div>
          {member.phone && <div className="flex items-center gap-3 text-[12px]"><Phone size={14} className="text-[#8a8a8a] shrink-0" /><span className="text-[#242424] dark:text-[#e0e0e0]">{member.phone}</span></div>}
          {member.location && <div className="flex items-center gap-3 text-[12px]"><MapPin size={14} className="text-[#8a8a8a] shrink-0" /><span className="text-[#242424] dark:text-[#e0e0e0]">{member.location}</span></div>}
          <div className="flex items-center gap-3 text-[12px]"><Clock size={14} className="text-[#8a8a8a] shrink-0" /><span className="text-[#616161] dark:text-[#8a8a8a]">Joined {member.joinedAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
          <div className="flex items-center gap-3 text-[12px]"><Clock size={14} className="text-[#8a8a8a] shrink-0" /><span className="text-[#616161] dark:text-[#8a8a8a]">Active {member.lastActive.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {member.lastActive.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span></div>
        </div>
        {dept && (
          <div className="pt-2 border-t border-[#e1dfdd] dark:border-[#3d3d3d]">
            <p className="text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider mb-1.5">{t('spacePermissions.department')}</p>
            <div className="flex items-center gap-2 text-[12px] text-[#242424] dark:text-[#e0e0e0]">
              <span className="text-[16px]">{dept.icon}</span> {dept.name}
            </div>
          </div>
        )}
        <div className="pt-2 border-t border-[#e1dfdd] dark:border-[#3d3d3d]">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#5b5fc7] hover:bg-[#4a4eb5] text-white text-[12px] font-semibold rounded-lg transition-colors">
            <Mail size={13} /> Send Message
          </button>
        </div>
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
  const { t } = useI18n();
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
        <div className="flex-1 text-[11px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">{t('spacePermissions.permission')}</div>
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
  const [inviteMode, setInviteMode] = useState<'person' | 'department'>('person');
  const [inviteDeptName, setInviteDeptName] = useState('');
  const [inviteDeptDesc, setInviteDeptDesc] = useState('');
  const [inviteDeptIcon, setInviteDeptIcon] = useState('🏢');
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [showExportToast, setShowExportToast] = useState(false);
  const [departments, setDepartments] = useState<SpaceDepartment[]>(mockDepartments);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [selectedMember, setSelectedMember] = useState<SpaceMember | null>(null);
  const [memberViewMode, setMemberViewMode] = useState<'all' | 'people' | 'departments'>('all');

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

  // Individual members = those NOT in any department
  const individualMembers = useMemo(() => {
    const deptMemberIds = new Set(departments.flatMap(d => d.memberIds));
    return members.filter(m => !deptMemberIds.has(m.userId));
  }, [members, departments]);

  const filteredIndividualMembers = useMemo(() => {
    let result = individualMembers;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || (m.title || '').toLowerCase().includes(q));
    }
    if (roleFilter !== 'all') {
      result = result.filter(m => m.role === roleFilter);
    }
    const priorityMap: Record<string, number> = {};
    for (const [k, v] of Object.entries(allRoleConfig)) priorityMap[k] = v.priority;
    return result.sort((a, b) => (priorityMap[a.role] ?? 99) - (priorityMap[b.role] ?? 99));
  }, [individualMembers, searchQuery, roleFilter, allRoleConfig]);

  const filteredDepartments = useMemo(() => {
    let result = departments;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => {
        if (d.name.toLowerCase().includes(q)) return true;
        const deptMembers = d.memberIds.map(id => members.find(m => m.userId === id)).filter(Boolean) as SpaceMember[];
        return deptMembers.some(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || (m.title || '').toLowerCase().includes(q));
      });
    }
    if (roleFilter !== 'all') {
      result = result.filter(d => {
        if (d.role === roleFilter) return true;
        const deptMembers = d.memberIds.map(id => members.find(m => m.userId === id)).filter(Boolean) as SpaceMember[];
        return deptMembers.some(m => m.role === roleFilter);
      });
    }
    return result;
  }, [departments, members, searchQuery, roleFilter]);

  const getDeptMembers = useCallback((dept: SpaceDepartment) => {
    return dept.memberIds.map(id => members.find(m => m.userId === id)).filter(Boolean) as SpaceMember[];
  }, [members]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { all: members.length };
    members.forEach(m => { counts[m.role] = (counts[m.role] || 0) + 1; });
    return counts;
  }, [members]);

  const toggleDept = useCallback((deptId: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(deptId)) next.delete(deptId); else next.add(deptId);
      return next;
    });
  }, []);

  const handleRoleChange = useCallback((userId: string, newRole: string) => {
    setMembers(prev => prev.map(m => m.userId === userId ? { ...m, role: newRole } : m));
    setPendingChanges(p => p + 1);
  }, []);

  const handleRemoveMember = useCallback((userId: string) => {
    setMembers(prev => prev.filter(m => m.userId !== userId));
    setDepartments(prev => prev.map(d => ({ ...d, memberIds: d.memberIds.filter(id => id !== userId) })));
    if (selectedMember?.userId === userId) setSelectedMember(null);
    setPendingChanges(p => p + 1);
  }, [selectedMember]);

  const handleRemoveDept = useCallback((deptId: string) => {
    setDepartments(prev => prev.filter(d => d.id !== deptId));
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
    if (inviteMode === 'person') {
      if (!inviteEmail.trim()) return;
      const newMember: SpaceMember = {
        userId: `user-new-${Date.now()}`,
        name: inviteEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
        email: inviteEmail, role: inviteRole, title: 'Team Member',
        joinedAt: new Date(), lastActive: new Date(), status: 'offline',
      };
      setMembers(prev => [...prev, newMember]);
    } else {
      if (!inviteDeptName.trim()) return;
      const newDept: SpaceDepartment = {
        id: `dept-new-${Date.now()}`,
        name: inviteDeptName.trim(),
        icon: inviteDeptIcon,
        description: inviteDeptDesc.trim() || `${inviteDeptName.trim()} department`,
        role: inviteRole,
        joinedAt: new Date(),
        memberIds: [],
      };
      setDepartments(prev => [...prev, newDept]);
    }
    setInviteEmail('');
    setInviteDeptName('');
    setInviteDeptDesc('');
    setInviteDeptIcon('🏢');
    setShowInviteModal(false);
    setPendingChanges(p => p + 1);
  }, [inviteMode, inviteEmail, inviteRole, inviteDeptName, inviteDeptDesc, inviteDeptIcon]);

  const deptIcons = ['🏢', '🔧', '🎨', '🧪', '📊', '🔒', '🚀', '📱', '🌐', '💡', '📋', '🎯'];

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
    { id: 'members', label: 'Members', icon: Users },
    { id: 'roles', label: 'Roles', icon: Crown },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'channels', label: 'Channels', icon: Layers },
    { id: 'audit', label: 'Audit Log', icon: Eye },
  ];

  const auditLog: { id: string; action: string; detail: string; user: string; timestamp: Date; type: string; fileName?: string; filePath?: string }[] = [
    { id: '1', action: 'Role changed', detail: 'Jane Smith changed from Member to Admin', user: 'John Doe', timestamp: new Date('2026-03-03T14:30:00'), type: 'role-change' },
    { id: 'f1', action: 'File downloaded', detail: 'Downloaded "Q1-2026-Roadmap.pdf" from /Engineering/Planning', user: 'Bob Johnson', timestamp: new Date('2026-03-04T11:22:00'), type: 'file-download', fileName: 'Q1-2026-Roadmap.pdf', filePath: '/Engineering/Planning' },
    { id: 'd1', action: 'Document edited', detail: 'Edited "API Design Guidelines" — 14 changes across 3 sections', user: 'Alice Williams', timestamp: new Date('2026-03-04T10:05:00'), type: 'doc-edit', fileName: 'API Design Guidelines' },
    { id: 'f2', action: 'File accessed', detail: 'Viewed "architecture-diagram-v3.png" from /Engineering/Diagrams', user: 'Charlie Brown', timestamp: new Date('2026-03-04T09:45:00'), type: 'file-access', fileName: 'architecture-diagram-v3.png', filePath: '/Engineering/Diagrams' },
    { id: 'd2', action: 'Document accessed', detail: 'Opened "Sprint Retrospective — Feb 2026" (read-only)', user: 'Erik Lehnsherr', timestamp: new Date('2026-03-04T08:30:00'), type: 'doc-access', fileName: 'Sprint Retrospective — Feb 2026' },
    { id: 'f3', action: 'File uploaded', detail: 'Uploaded "security-audit-report.xlsx" to /Engineering/Reports (2.4 MB)', user: 'John Doe', timestamp: new Date('2026-03-03T16:10:00'), type: 'file-upload', fileName: 'security-audit-report.xlsx', filePath: '/Engineering/Reports' },
    { id: '2', action: 'Member invited', detail: 'Erik Lehnsherr invited as Guest', user: 'Sarah Chen', timestamp: new Date('2026-01-10T09:00:00'), type: 'invite' },
    { id: 'd3', action: 'Document edited', detail: 'Edited "Onboarding Checklist" — added 3 new tasks and updated links', user: 'Diana Prince', timestamp: new Date('2026-03-03T15:30:00'), type: 'doc-edit', fileName: 'Onboarding Checklist' },
    { id: 'f4', action: 'File downloaded', detail: 'Downloaded "brand-assets-v2.zip" from /Engineering/Assets (48 MB)', user: 'Diana Prince', timestamp: new Date('2026-03-03T14:55:00'), type: 'file-download', fileName: 'brand-assets-v2.zip', filePath: '/Engineering/Assets' },
    { id: '3', action: 'Permission updated', detail: 'Guest "Download files" permission enabled', user: 'John Doe', timestamp: new Date('2026-02-15T11:20:00'), type: 'permission' },
    { id: 'd4', action: 'Document accessed', detail: 'Opened "Release Notes — v4.2.0" (read-only)', user: 'Fiona Gallagher', timestamp: new Date('2026-03-02T13:20:00'), type: 'doc-access', fileName: 'Release Notes — v4.2.0' },
    { id: 'f5', action: 'File accessed', detail: 'Viewed "deployment-config.yaml" from /Engineering/DevOps', user: 'Nadia Volkov', timestamp: new Date('2026-03-02T10:15:00'), type: 'file-access', fileName: 'deployment-config.yaml', filePath: '/Engineering/DevOps' },
    { id: 'd5', action: 'Document edited', detail: 'Edited "Architecture Decision Records" — added ADR-047 (Event Sourcing)', user: 'Sarah Chen', timestamp: new Date('2026-03-01T17:00:00'), type: 'doc-edit', fileName: 'Architecture Decision Records' },
    { id: 'f6', action: 'File uploaded', detail: 'Uploaded "test-coverage-report.html" to /Engineering/QA (1.1 MB)', user: 'Yuki Tanaka', timestamp: new Date('2026-03-01T11:45:00'), type: 'file-upload', fileName: 'test-coverage-report.html', filePath: '/Engineering/QA' },
    { id: 'd6', action: 'Document accessed', detail: 'Opened "Incident Response Playbook" (read-only)', user: 'Liam Park', timestamp: new Date('2026-02-28T14:30:00'), type: 'doc-access', fileName: 'Incident Response Playbook' },
    { id: 'f7', action: 'File downloaded', detail: 'Downloaded "database-schema-v5.sql" from /Engineering/Database', user: 'Bob Johnson', timestamp: new Date('2026-02-27T09:20:00'), type: 'file-download', fileName: 'database-schema-v5.sql', filePath: '/Engineering/Database' },
    { id: '4', action: 'Custom role created', detail: 'Contributor role created based on Member template', user: 'Sarah Chen', timestamp: new Date('2026-02-20T13:15:00'), type: 'role-change' },
    { id: '5', action: 'Member invited', detail: 'Fiona Gallagher invited as Guest', user: 'Jane Smith', timestamp: new Date('2026-02-01T10:00:00'), type: 'invite' },
    { id: '6', action: 'Custom role created', detail: 'External Reviewer role created based on Guest template', user: 'John Doe', timestamp: new Date('2026-01-25T10:30:00'), type: 'role-change' },
    { id: '7', action: 'Member removed', detail: 'Mike Thompson removed from space', user: 'John Doe', timestamp: new Date('2026-01-20T16:45:00'), type: 'remove' },
    { id: '8', action: 'Permission updated', detail: 'Member "Create channels" enabled', user: 'Sarah Chen', timestamp: new Date('2025-12-15T14:00:00'), type: 'permission' },
    { id: '9', action: 'Role changed', detail: 'Bob Johnson changed from Guest to Member', user: 'John Doe', timestamp: new Date('2025-11-20T09:30:00'), type: 'role-change' },
    { id: '10', action: 'Space created', detail: 'Engineering space created', user: 'Sarah Chen', timestamp: new Date('2024-11-01T08:00:00'), type: 'create' },
  ];

  const auditTypeColors: Record<string, { bg: string; text: string; icon: LucideIcon }> = {
    'role-change': { bg: 'bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20', text: 'text-[#5b5fc7] dark:text-[#a6a9dc]', icon: UserCog },
    'invite': { bg: 'bg-[#237b4b]/10 dark:bg-[#237b4b]/20', text: 'text-[#237b4b] dark:text-[#6fcf97]', icon: UserPlus },
    'permission': { bg: 'bg-[#d4820c]/10 dark:bg-[#d4820c]/20', text: 'text-[#d4820c] dark:text-[#f5a623]', icon: Shield },
    'remove': { bg: 'bg-[#c4314b]/10 dark:bg-[#c4314b]/20', text: 'text-[#c4314b] dark:text-[#f47067]', icon: Trash2 },
    'create': { bg: 'bg-[#2196f3]/10 dark:bg-[#2196f3]/20', text: 'text-[#2196f3] dark:text-[#64b5f6]', icon: Settings },
    'file-access': { bg: 'bg-[#0d9488]/10 dark:bg-[#0d9488]/20', text: 'text-[#0d9488] dark:text-[#5eead4]', icon: FolderOpen },
    'file-upload': { bg: 'bg-[#6366f1]/10 dark:bg-[#6366f1]/20', text: 'text-[#6366f1] dark:text-[#a5b4fc]', icon: Plus },
    'file-download': { bg: 'bg-[#0d9488]/10 dark:bg-[#0d9488]/20', text: 'text-[#0d9488] dark:text-[#5eead4]', icon: Download },
    'doc-access': { bg: 'bg-[#d946ef]/10 dark:bg-[#d946ef]/20', text: 'text-[#d946ef] dark:text-[#f0abfc]', icon: FileText },
    'doc-edit': { bg: 'bg-[#d946ef]/10 dark:bg-[#d946ef]/20', text: 'text-[#d946ef] dark:text-[#f0abfc]', icon: Edit3 },
  };

  type AuditFilterCategory = 'all' | 'management' | 'files' | 'documents';
  const [auditFilter, setAuditFilter] = useState<AuditFilterCategory>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  const auditFilterCategories: { id: AuditFilterCategory; label: string; icon: LucideIcon; types: string[] }[] = [
    { id: 'all', label: 'All Activity', icon: Eye, types: [] },
    { id: 'management', label: 'Management', icon: Shield, types: ['role-change', 'invite', 'permission', 'remove', 'create'] },
    { id: 'files', label: 'Files', icon: FolderOpen, types: ['file-access', 'file-upload', 'file-download'] },
    { id: 'documents', label: 'Documents', icon: FileText, types: ['doc-access', 'doc-edit'] },
  ];

  const filteredAuditLog = useMemo(() => {
    let result = [...auditLog];
    if (auditFilter !== 'all') {
      const category = auditFilterCategories.find(c => c.id === auditFilter);
      if (category) result = result.filter(e => category.types.includes(e.type));
    }
    if (auditSearchQuery.trim()) {
      const q = auditSearchQuery.toLowerCase();
      result = result.filter(e =>
        e.action.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q) ||
        e.user.toLowerCase().includes(q) ||
        (e.fileName && e.fileName.toLowerCase().includes(q)) ||
        (e.filePath && e.filePath.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [auditFilter, auditSearchQuery]);

  const auditCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: auditLog.length };
    for (const cat of auditFilterCategories) {
      if (cat.id !== 'all') counts[cat.id] = auditLog.filter(e => cat.types.includes(e.type)).length;
    }
    return counts;
  }, []);

  if (!space) return null;

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#313338] overflow-hidden">
      {/* Header */}
      <div className="h-[60px] px-6 flex items-center justify-between border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-gradient-to-r from-white to-[#faf9f8] dark:from-[#313338] dark:to-[#2b2d31] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 flex items-center justify-center">
            <Settings size={18} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-[#242424] dark:text-[#f2f3f5]">{t('spacePermissions.title', { space: space.name })}</h1>
            <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a]">{t('spacePermissions.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#616161] dark:text-[#b9bbbe] bg-[#f0f0f0] dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg hover:bg-[#e8e8e8] dark:hover:bg-[#2a2a2a] hover:border-[#5b5fc7]/30 transition-colors"
            title={t('spacePermissions.exportReportTitle')}
          >
            <Download size={13} /> Export Report
          </button>
          <AnimatePresence>
            {pendingChanges > 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-2">
                <span className="text-[11px] text-[#d4820c] dark:text-[#f5a623] font-medium">{pendingChanges} unsaved change{pendingChanges > 1 ? 's' : ''}</span>
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
      <div className={`flex-1 ${activeTab === 'members' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'}`}>
        <AnimatePresence mode="wait">

          {/* ─── Members Tab ─────────────────────────────────────────── */}
          {activeTab === 'members' && (
            <motion.div key="members" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden p-6">
                {/* Toolbar */}
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <div className="relative flex-1 min-w-[200px] max-w-[360px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('spacePermissions.searchMembersOrDepartments')}
                      className="w-full bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg pl-9 pr-3 py-2 text-[12px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40" />
                  </div>
                  {/* View mode toggle */}
                  <div className="flex items-center bg-[#f0f0f0] dark:bg-[#1e1f22] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] p-0.5">
                    {([
                      { id: 'all' as const, label: 'All', icon: Users },
                      { id: 'people' as const, label: 'People', icon: User },
                      { id: 'departments' as const, label: 'Depts', icon: Building2 },
                    ]).map(v => {
                      const VIcon = v.icon;
                      return (
                        <button key={v.id} onClick={() => setMemberViewMode(v.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                            memberViewMode === v.id
                              ? 'bg-white dark:bg-[#35373c] text-[#5b5fc7] dark:text-[#a6a9dc] shadow-sm'
                              : 'text-[#616161] dark:text-[#8a8a8a] hover:text-[#242424] dark:hover:text-[#e0e0e0]'
                          }`}>
                          <VIcon size={12} /> {v.label}
                        </button>
                      );
                    })}
                  </div>
                  {/* Role filter */}
                  <div className="relative">
                    <button onClick={() => setShowRoleFilter(!showRoleFilter)}
                      className="flex items-center gap-2 px-3 py-2 bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-[12px] text-[#424242] dark:text-[#e0e0e0] hover:border-[#5b5fc7]/40 transition-colors">
                      <Filter size={13} />
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
                            const RIcon = cfg.icon;
                            return (
                              <button key={r} onClick={() => { setRoleFilter(r); setShowRoleFilter(false); }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors ${roleFilter === r ? 'bg-[#5b5fc7]/8 text-[#5b5fc7]' : 'text-[#424242] dark:text-[#e0e0e0] hover:bg-[#f5f5f5] dark:hover:bg-[#35373c]'}`}>
                                <RIcon size={13} /> {cfg.label} ({roleCounts[r] || 0})
                                {roleFilter === r && <Check size={13} className="ml-auto" />}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button onClick={() => { setShowInviteModal(true); setInviteMode('person'); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#5b5fc7] hover:bg-[#4a4eb5] text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm ml-auto">
                    <UserPlus size={14} /> {t('spacePermissions.inviteMember')}
                  </button>
                </div>

                {/* Role summary */}
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  {allRoleKeys.map(r => (
                    <div key={r} className="flex items-center gap-1.5 text-[11px] text-[#616161] dark:text-[#8a8a8a]">
                      <RoleBadge roleId={r} config={allRoleConfig} size="sm" />
                      <span>{roleCounts[r] || 0}</span>
                    </div>
                  ))}
                  <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] ml-2">
                    {t('spacePermissions.summaryCounts', { members: members.length, departments: departments.length })}
                  </span>
                </div>

                {/* Member list */}
                <div className="flex-1 overflow-y-auto space-y-4">
                  {/* Departments */}
                  {(memberViewMode === 'all' || memberViewMode === 'departments') && filteredDepartments.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 px-2 py-1.5">
                        <Building2 size={13} className="text-[#8a8a8a]" />
                        <span className="text-[11px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">
                          {t('spacePermissions.departmentsCount', { count: filteredDepartments.length })}
                        </span>
                      </div>
                      <div className="bg-[#faf9f8] dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                        {filteredDepartments.map(dept => (
                          <DepartmentRow key={dept.id} dept={dept} deptMembers={getDeptMembers(dept)}
                            isExpanded={expandedDepts.has(dept.id)} onToggle={() => toggleDept(dept.id)}
                            onRoleChange={handleRoleChange} onRemove={handleRemoveMember} onRemoveDept={handleRemoveDept}
                            allRoleConfig={allRoleConfig} allRoleKeys={allRoleKeys} onSelectMember={setSelectedMember} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Individual members */}
                  {(memberViewMode === 'all' || memberViewMode === 'people') && (
                    <div>
                      <div className="flex items-center gap-2 px-2 py-1.5">
                        <User size={13} className="text-[#8a8a8a]" />
                        <span className="text-[11px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">
                          {t('spacePermissions.individualMembersCount', { count: filteredIndividualMembers.length })}
                        </span>
                      </div>
                      <div className="bg-[#faf9f8] dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-2 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#f0f0f0] dark:bg-[#252525]">
                          <div className="w-9 shrink-0" />
                          <div className="flex-1 text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">{t('spacePermissions.member')}</div>
                          <div className="w-[80px] text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider text-center">{t('spacePermissions.role')}</div>
                          <div className="w-[70px] text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider text-right hidden lg:block">{t('spacePermissions.joined')}</div>
                          <div className="w-[24px] shrink-0" />
                        </div>
                        <AnimatePresence>
                          {filteredIndividualMembers.map(member => (
                            <MemberRow key={member.userId} member={member} onRoleChange={handleRoleChange} onRemove={handleRemoveMember}
                              isCurrentUser={member.userId === currentUser.id} allRoleConfig={allRoleConfig} allRoleKeys={allRoleKeys}
                              onSelect={setSelectedMember} />
                          ))}
                        </AnimatePresence>
                        {filteredIndividualMembers.length === 0 && (
                          <div className="py-10 text-center">
                            <Users size={28} className="mx-auto text-[#d1d1d1] dark:text-[#4a4a4a] mb-2" />
                            <p className="text-[12px] text-[#8a8a8a] dark:text-[#6d6f78]">{t('spacePermissions.noIndividualMembersFound')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Global empty */}
                  {filteredIndividualMembers.length === 0 && filteredDepartments.length === 0 && (
                    <div className="py-16 text-center">
                      <Users size={40} className="mx-auto text-[#d1d1d1] dark:text-[#4a4a4a] mb-3" />
                      <p className="text-[14px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-1">{t('spacePermissions.noMembers')}</p>
                      <p className="text-[12px] text-[#b9bbbe] dark:text-[#4a4a4a]">{t('spacePermissions.adjustSearchFilter')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detail panel */}
              <AnimatePresence>
                {selectedMember && (
                  <MemberDetailPanel member={selectedMember} onClose={() => setSelectedMember(null)}
                    departments={departments} allRoleConfig={allRoleConfig} />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ─── Roles Tab ───────────────────────────────────────────── */}
          {activeTab === 'roles' && (
            <motion.div key="roles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="p-6">
              {/* Create role button */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[14px] font-bold text-[#242424] dark:text-[#f2f3f5]">
                    {t('spacePermissions.rolesCount', { count: allRoleKeys.length })}
                    <span className="text-[11px] font-normal text-[#8a8a8a] ml-2">
                      {t('spacePermissions.rolesBreakdown', { builtIn: BUILT_IN_ROLES.length, custom: Object.keys(customRoles).length })}
                    </span>
                  </h2>
                </div>
                <button onClick={openCreateRole}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5b5fc7] hover:bg-[#4a4eb5] text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm">
                  <Plus size={14} /> {t('spacePermissions.createCustomRole')}
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
                          <button onClick={() => openEditRole(r)} className="p-1.5 rounded-md hover:bg-[#e8e8e8] dark:hover:bg-[#3d3d3d] text-[#616161] dark:text-[#b9bbbe] transition-colors" title={t('spacePermissions.editRole')}>
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => setShowDeleteConfirm(r)} className="p-1.5 rounded-md hover:bg-[#c4314b]/10 dark:hover:bg-[#c4314b]/15 text-[#c4314b] dark:text-[#f47067] transition-colors" title={t('spacePermissions.deleteRole')}>
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
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc]">{t('spacePermissions.custom')}</span>
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
                        <p className="text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider mb-2">{t('spacePermissions.keyCapabilities')}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {permCategories.flatMap(cat => cat.permissions).filter(p => p.roles[r]).slice(0, 6).map(p => (
                            <span key={p.id} className="inline-flex items-center gap-1 text-[10px] text-[#424242] dark:text-[#b9bbbe] bg-[#e8e8e8] dark:bg-[#3d3d3d] px-2 py-0.5 rounded">
                              <Check size={9} className="text-[#237b4b] dark:text-[#6fcf97]" /> {p.label}
                            </span>
                          ))}
                          {permCategories.flatMap(cat => cat.permissions).filter(p => p.roles[r]).length > 6 && (
                            <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] px-1">
                              +{permCategories.flatMap(cat => cat.permissions).filter(p => p.roles[r]).length - 6} {t('common.more')}
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
                  <p className="text-[12px] text-[#242424] dark:text-[#e0e0e0] font-medium">{t('spacePermissions.permissionMatrix')}</p>
                  <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a]">
                    {t('spacePermissions.permissionMatrixDesc')}
                  </p>
                </div>
                <button onClick={() => openCopyModal('role')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#5b5fc7] dark:text-[#a6a9dc] bg-white dark:bg-[#2b2d31] border border-[#5b5fc7]/30 dark:border-[#5b5fc7]/40 rounded-lg hover:bg-[#5b5fc7]/5 dark:hover:bg-[#5b5fc7]/10 transition-colors shrink-0">
                  <Copy size={13} /> {t('spacePermissions.copySettings')}
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
                  <p className="text-[12px] text-[#242424] dark:text-[#e0e0e0] font-medium">{t('spacePermissions.channelOverrides')}</p>
                  <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a]">
                    {t('spacePermissions.channelOverridesDesc.before')}
                    <span className="font-semibold text-[#8a8a8a]">{t('spacePermissions.channelOverridesDesc.inherit')}</span>
                    {t('spacePermissions.channelOverridesDesc.middle1')}
                    <span className="font-semibold text-[#237b4b]">{t('spacePermissions.channelOverridesDesc.allow')}</span>
                    {t('spacePermissions.channelOverridesDesc.middle2')}
                    <span className="font-semibold text-[#c4314b]">{t('spacePermissions.channelOverridesDesc.deny')}</span>
                    {t('spacePermissions.channelOverridesDesc.after')}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-[220px] shrink-0 bg-[#faf9f8] dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#f0f0f0] dark:bg-[#252525]">
                    <p className="text-[11px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">{t('channel.channels')}</p>
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
                            <div className="flex-1 min-w-[120px] text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">{t('spacePermissions.permission')}</div>
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
                                      <div className="w-[22px] h-[22px] rounded-md bg-[#5b5fc7]/15 dark:bg-[#5b5fc7]/25 flex items-center justify-center" title={t('spacePermissions.ownerAlwaysAllowed')}>
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
                          <span className="text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider mr-1">{t('spacePermissions.legend')}</span>
                          <span className="flex items-center gap-1 text-[10px] text-[#8a8a8a]">
                            <span className="w-4 h-4 rounded bg-[#f0f0f0] dark:bg-[#333] border border-[#d1d1d1] dark:border-[#4a4a4a] flex items-center justify-center text-[7px] font-bold">—</span> Inherit
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-[#237b4b] dark:text-[#6fcf97]">
                            <span className="w-4 h-4 rounded bg-[#237b4b]/15 border border-[#237b4b]/40 flex items-center justify-center"><Check size={9} /></span> Allow
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-[#c4314b] dark:text-[#f47067]">
                            <span className="w-4 h-4 rounded bg-[#c4314b]/10 border border-[#c4314b]/30 flex items-center justify-center"><X size={9} /></span> Deny
                          </span>
                          <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] ml-auto italic">{t('spacePermissions.clickToCycle')}</span>
                        </div>
                      </>
                    );
                  })() : (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Layers size={36} className="text-[#d1d1d1] dark:text-[#4a4a4a] mb-3" />
                      <p className="text-[13px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] mb-1">{t('spacePermissions.selectChannel')}</p>
                      <p className="text-[11px] text-[#b9bbbe] dark:text-[#4a4a4a]">{t('spacePermissions.selectChannelDesc')}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Audit Log Tab ───────────────────────────────────────── */}
          {activeTab === 'audit' && (
            <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="p-6 space-y-4">
              {/* Toolbar */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-[360px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
                  <input type="text" value={auditSearchQuery} onChange={(e) => setAuditSearchQuery(e.target.value)} placeholder={t('spacePermissions.searchAuditLog')}
                    className="w-full bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg pl-9 pr-3 py-2 text-[12px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40" />
                </div>
                <div className="flex items-center bg-[#f0f0f0] dark:bg-[#1e1f22] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] p-0.5">
                  {auditFilterCategories.map(cat => {
                    const CatIcon = cat.icon;
                    return (
                      <button key={cat.id} onClick={() => setAuditFilter(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                          auditFilter === cat.id
                            ? 'bg-white dark:bg-[#35373c] text-[#5b5fc7] dark:text-[#a6a9dc] shadow-sm'
                            : 'text-[#616161] dark:text-[#8a8a8a] hover:text-[#242424] dark:hover:text-[#e0e0e0]'
                        }`}>
                        <CatIcon size={12} /> {cat.label}
                        <span className={`text-[9px] px-1 py-0.5 rounded-full min-w-[18px] text-center ${
                          auditFilter === cat.id ? 'bg-[#5b5fc7]/15 text-[#5b5fc7]' : 'bg-[#e1dfdd] dark:bg-[#3d3d3d] text-[#8a8a8a]'
                        }`}>{auditCategoryCounts[cat.id] ?? 0}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-4 gap-3">
                {auditFilterCategories.map(cat => {
                  const CatIcon = cat.icon;
                  const count = auditCategoryCounts[cat.id] ?? 0;
                  return (
                    <button key={cat.id} onClick={() => setAuditFilter(cat.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                        auditFilter === cat.id
                          ? 'bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10 border-[#5b5fc7]/30'
                          : 'bg-[#faf9f8] dark:bg-[#2b2d31] border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/20'
                      }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        auditFilter === cat.id ? 'bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20' : 'bg-[#f0f0f0] dark:bg-[#252525]'
                      }`}>
                        <CatIcon size={15} className={auditFilter === cat.id ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#8a8a8a]'} />
                      </div>
                      <div className="text-left">
                        <p className={`text-[16px] font-bold ${auditFilter === cat.id ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#242424] dark:text-[#f2f3f5]'}`}>{count}</p>
                        <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">{cat.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Log entries */}
              <div className="bg-[#faf9f8] dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#f0f0f0] dark:bg-[#252525] flex items-center justify-between">
                  <div>
                    <h3 className="text-[13px] font-semibold text-[#242424] dark:text-[#f2f3f5]">{t('spacePermissions.activityHistory')}</h3>
                    <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">{t('spacePermissions.activityHistoryDesc')}</p>
                  </div>
                  <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">{filteredAuditLog.length} entries</span>
                </div>
                <div className="divide-y divide-[#e1dfdd] dark:divide-[#3d3d3d] max-h-[520px] overflow-y-auto">
                  {filteredAuditLog.map((entry, idx) => {
                    const colors = auditTypeColors[entry.type] || auditTypeColors['create'];
                    const AuditIcon = colors.icon;
                    return (
                      <motion.div key={entry.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors">
                        <div className={`w-7 h-7 rounded-full ${colors.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <AuditIcon size={13} className={colors.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[12px] font-semibold text-[#242424] dark:text-[#e0e0e0]">{entry.action}</span>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                              {entry.type.replace(/-/g, ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a] mt-0.5">{entry.detail}</p>
                          {entry.fileName && (
                            <div className="flex items-center gap-1.5 mt-1">
                              {entry.type.startsWith('doc-') ? (
                                <FileText size={10} className="text-[#d946ef] dark:text-[#f0abfc]" />
                              ) : (
                                <FolderOpen size={10} className="text-[#0d9488] dark:text-[#5eead4]" />
                              )}
                              <span className="text-[10px] font-medium text-[#424242] dark:text-[#d0d0d0]">{entry.fileName}</span>
                              {entry.filePath && (
                                <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">in {entry.filePath}</span>
                              )}
                            </div>
                          )}
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
                  {filteredAuditLog.length === 0 && (
                    <div className="py-16 text-center">
                      <Eye size={32} className="mx-auto text-[#d1d1d1] dark:text-[#4a4a4a] mb-2" />
                      <p className="text-[13px] font-medium text-[#8a8a8a] dark:text-[#6d6f78]">{t('spacePermissions.noMatchingAuditEntries')}</p>
                      <p className="text-[11px] text-[#b9bbbe] dark:text-[#4a4a4a] mt-1">{t('spacePermissions.adjustSearchOrFilter')}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ─── Add Member / Department Modal ──────────────────────────── */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowInviteModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()} className="w-[480px] bg-white dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8]">
                  <div className="flex items-center gap-2 text-white"><UserPlus size={18} /><span className="text-[14px] font-bold">{inviteMode === 'person' ? t('spacePermissions.addMember') : t('spacePermissions.addDepartment')}</span></div>
                <button onClick={() => setShowInviteModal(false)} className="text-white/70 hover:text-white transition-colors"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                {/* Mode toggle */}
                <div className="flex items-center bg-[#f0f0f0] dark:bg-[#1e1f22] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] p-0.5">
                  <button onClick={() => setInviteMode('person')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-[12px] font-medium rounded-md transition-all ${
                      inviteMode === 'person' ? 'bg-white dark:bg-[#35373c] text-[#5b5fc7] dark:text-[#a6a9dc] shadow-sm' : 'text-[#616161] dark:text-[#8a8a8a]'
                    }`}><User size={14} /> {t('spacePermissions.person')}</button>
                  <button onClick={() => setInviteMode('department')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-[12px] font-medium rounded-md transition-all ${
                      inviteMode === 'department' ? 'bg-white dark:bg-[#35373c] text-[#5b5fc7] dark:text-[#a6a9dc] shadow-sm' : 'text-[#616161] dark:text-[#8a8a8a]'
                    }`}><Building2 size={14} /> {t('spacePermissions.department')}</button>
                </div>

                {inviteMode === 'person' ? (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">{t('spacePermissions.emailAddress')}</label>
                      <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder={t('spacePermissions.colleagueEmail')}
                        className="w-full bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg px-3 py-2.5 text-[13px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40"
                        onKeyDown={(e) => e.key === 'Enter' && handleInvite()} autoFocus />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">{t('spacePermissions.assignRole')}</label>
                      <div className="grid grid-cols-3 gap-2 max-h-[180px] overflow-y-auto">
                        {allRoleKeys.filter(r => r !== 'owner').map(r => {
                          const cfg = allRoleConfig[r];
                          if (!cfg) return null;
                          const RIcon = cfg.icon;
                          const isSelected = inviteRole === r;
                          return (
                            <button key={r} onClick={() => setInviteRole(r)}
                              className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border-2 transition-all ${
                                isSelected ? 'border-[#5b5fc7] bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10' : 'border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/30'
                              }`}>
                              <RIcon size={18} className={isSelected ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#8a8a8a]'} />
                              <span className={`text-[11px] font-semibold ${isSelected ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#616161] dark:text-[#8a8a8a]'}`}>{cfg.label}</span>
                              {!cfg.isBuiltIn && <span className="text-[7px] text-[#8a8a8a] uppercase">{t('spacePermissions.customLower')}</span>}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] mt-2">{allRoleConfig[inviteRole]?.description || ''}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">{t('spacePermissions.departmentName')}</label>
                      <input type="text" value={inviteDeptName} onChange={(e) => setInviteDeptName(e.target.value)} placeholder={t('spacePermissions.departmentNameExample')}
                        className="w-full bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg px-3 py-2.5 text-[13px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40"
                        autoFocus />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">{t('dashboardEditor.field.description')}</label>
                      <input type="text" value={inviteDeptDesc} onChange={(e) => setInviteDeptDesc(e.target.value)} placeholder={t('spacePermissions.departmentDescriptionPrompt')}
                        className="w-full bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg px-3 py-2.5 text-[13px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-2">{t('dashboardEditor.chooseIcon')}</label>
                      <div className="flex gap-2 flex-wrap">
                        {deptIcons.map(icon => (
                          <button key={icon} onClick={() => setInviteDeptIcon(icon)}
                            className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center text-[18px] transition-all ${
                              inviteDeptIcon === icon ? 'border-[#5b5fc7] bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10 scale-110' : 'border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/30'
                            }`}>{icon}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">{t('spacePermissions.defaultRole')}</label>
                      <div className="flex gap-2 flex-wrap">
                        {allRoleKeys.filter(r => r !== 'owner').map(r => {
                          const cfg = allRoleConfig[r];
                          if (!cfg) return null;
                          const RIcon = cfg.icon;
                          const isSelected = inviteRole === r;
                          return (
                            <button key={r} onClick={() => setInviteRole(r)}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 transition-all text-[12px] font-medium ${
                                isSelected ? 'border-[#5b5fc7] bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10 text-[#5b5fc7]' : 'border-[#e1dfdd] dark:border-[#3d3d3d] text-[#616161] dark:text-[#b9bbbe] hover:border-[#5b5fc7]/30'
                              }`}><RIcon size={14} /> {cfg.label}</button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-[12px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#3d3d3d] rounded-lg transition-colors">{t('common.cancel')}</button>
                  <button onClick={handleInvite}
                    disabled={inviteMode === 'person' ? !inviteEmail.trim() : !inviteDeptName.trim()}
                    className="px-4 py-2 bg-[#5b5fc7] hover:bg-[#4a4eb5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm">
                    {inviteMode === 'person' ? t('spacePermissions.addMember') : t('spacePermissions.addDepartment')}
                  </button>
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
                  <span className="text-[14px] font-bold">{roleForm.id ? t('spacePermissions.editCustomRole') : t('spacePermissions.createCustomRole')}</span>
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
                    <p className="text-[13px] font-bold text-[#242424] dark:text-[#f2f3f5]">{roleForm.label || t('spacePermissions.roleName')}</p>
                    <p className="text-[10px] text-[#8a8a8a]">{roleForm.description || t('spacePermissions.roleDescriptionPlaceholder')}</p>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">{t('spacePermissions.roleName')}</label>
                  <input type="text" value={roleForm.label} onChange={(e) => setRoleForm(f => ({ ...f, label: e.target.value }))}
                    placeholder={t('spacePermissions.roleNameExample')}
                    className="w-full bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg px-3 py-2.5 text-[13px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40" />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">{t('dashboardEditor.field.description')}</label>
                  <textarea value={roleForm.description} onChange={(e) => setRoleForm(f => ({ ...f, description: e.target.value }))}
                    placeholder={t('spacePermissions.roleDescriptionPrompt')} rows={2}
                    className="w-full bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg px-3 py-2.5 text-[13px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40 resize-none" />
                </div>

                {/* Color picker */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-2">{t('spacePermissions.color')}</label>
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
                  <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-2">{t('dashboardEditor.chooseIcon')}</label>
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
                    <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">{t('spacePermissions.permissionTemplate')}</label>
                    <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] mb-2">{t('spacePermissions.permissionTemplateDesc')}</p>
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
                <button onClick={() => setShowRoleModal(false)} className="px-4 py-2 text-[12px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#3d3d3d] rounded-lg transition-colors">{t('common.cancel')}</button>
                <button onClick={handleSaveRole} disabled={!roleForm.label.trim()}
                  className="px-4 py-2 bg-[#5b5fc7] hover:bg-[#4a4eb5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm">
                  {roleForm.id ? t('spacePermissions.saveChanges') : t('spacePermissions.createRole')}
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
                    <h3 className="text-[14px] font-bold text-[#242424] dark:text-[#f2f3f5]">{t('spacePermissions.deleteRoleTitle')}</h3>
                    <p className="text-[11px] text-[#8a8a8a]">
                      {t('spacePermissions.deleteRoleQuestion', { role: customRoles[showDeleteConfirm]?.label || showDeleteConfirm })}
                    </p>
                  </div>
                </div>
                <p className="text-[12px] text-[#616161] dark:text-[#8a8a8a]">
                  {(roleCounts[showDeleteConfirm] || 0) > 0
                    ? t('spacePermissions.deleteRoleWithMembers', { count: roleCounts[showDeleteConfirm] || 0 })
                    : t('spacePermissions.deleteRoleNoMembers')
                  }{' '}{t('spacePermissions.actionCannotBeUndone')}
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-[12px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#3d3d3d] rounded-lg transition-colors">{t('common.cancel')}</button>
                  <button onClick={() => handleDeleteRole(showDeleteConfirm)}
                    className="px-4 py-2 bg-[#c4314b] hover:bg-[#a82a40] text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm">{t('common.delete')}</button>
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
                    <span className="text-[14px] font-bold">{isRole ? t('spacePermissions.copyRoleSettings') : t('spacePermissions.copyChannelSettings')}</span>
                  </div>
                  <button onClick={() => setShowCopyModal(false)} className="text-white/70 hover:text-white transition-colors"><X size={18} /></button>
                </div>

                <div className="p-5 space-y-5">
                  <p className="text-[12px] text-[#616161] dark:text-[#8a8a8a]">
                    {isRole
                      ? t('spacePermissions.copyRoleSettingsDesc')
                      : t('spacePermissions.copyChannelSettingsDesc')
                    }
                  </p>

                  {/* Visual source → target */}
                  <div className="flex items-center gap-3">
                    {/* Source */}
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">
                        {t('spacePermissions.copyFrom')}
                      </label>
                      <div className="relative">
                        <select
                          value={copySource}
                          onChange={(e) => { setCopySource(e.target.value); if (e.target.value === copyTarget) setCopyTarget(''); }}
                          className="w-full bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg px-3 py-2.5 text-[13px] text-[#242424] dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40 appearance-none pr-8"
                        >
                          <option value="">{t('spacePermissions.selectTargetType', { type: isRole ? t('spacePermissions.roleLower') : t('spacePermissions.channelLower') })}</option>
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
                        {t('spacePermissions.copyTo')}
                      </label>
                      <div className="relative">
                        <select
                          value={copyTarget}
                          onChange={(e) => setCopyTarget(e.target.value)}
                          disabled={!copySource}
                          className="w-full bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg px-3 py-2.5 text-[13px] text-[#242424] dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40 appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">{t('spacePermissions.selectTargetType', { type: isRole ? t('spacePermissions.roleLower') : t('spacePermissions.channelLower') })}</option>
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
                          ? <>{t('spacePermissions.copyRole.before')}<span className="font-semibold text-[#242424] dark:text-[#e0e0e0]">{targetLabel}</span>{t('spacePermissions.copyRole.middle')}<span className="font-semibold text-[#242424] dark:text-[#e0e0e0]">{sourceLabel}</span>{t('spacePermissions.copyRole.after')}</>
                          : <>{t('spacePermissions.copyChannel.before')}<span className="font-semibold text-[#242424] dark:text-[#e0e0e0]">#{targetLabel}</span>{t('spacePermissions.copyChannel.middle')}<span className="font-semibold text-[#242424] dark:text-[#e0e0e0]">#{sourceLabel}</span>{t('spacePermissions.copyChannel.after')}</>
                        }
                      </p>
                    </motion.div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setShowCopyModal(false)} className="px-4 py-2 text-[12px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#3d3d3d] rounded-lg transition-colors">{t('common.cancel')}</button>
                    <button onClick={handleCopySettings} disabled={!canConfirm}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#5b5fc7] hover:bg-[#4a4eb5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm">
                      <Copy size={13} /> {t('spacePermissions.copySettings')}
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
              <p className="text-[12px] font-semibold text-[#242424] dark:text-[#f2f3f5]">{t('spacePermissions.reportExported')}</p>
              <p className="text-[10px] text-[#616161] dark:text-[#8a8a8a]">{t('spacePermissions.csvDownloaded')}</p>
            </div>
            <button onClick={() => setShowExportToast(false)} className="text-[#8a8a8a] hover:text-[#424242] dark:hover:text-[#e0e0e0] ml-2"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
