// Mock data for the enterprise chat app

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'task' | 'document' | 'video';
  name: string;
  url?: string;
  size?: string;
  mimeType?: string;
  // image-specific
  thumbnailUrl?: string;
  // video-specific
  videoDuration?: string;
  videoPosterUrl?: string;
  // task-specific
  taskId?: string;
  taskStatus?: 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done';
  taskPriority?: 'critical' | 'high' | 'medium' | 'low';
  taskAssignee?: string;
  taskType?: 'story' | 'bug' | 'task' | 'spike';
  // document-specific
  docId?: string;
  docEmoji?: string;
  docType?: 'doc' | 'sheet' | 'presentation';
  docAuthor?: string;
  docLastModified?: Date;
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  reactions?: { emoji: string; users: string[] }[];
  threadCount?: number;
  threadPreview?: string;
  pinned?: boolean;
  seenBy?: string[];
  edited?: boolean;
  attachments?: MessageAttachment[];
}

export interface Thread {
  id: string;
  parentMessageId: string;
  messages: Message[];
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'announcement' | 'private';
  description?: string;
  unreadCount?: number;
  widgets?: ChannelWidget[];
}

export interface ChannelWidget {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: 'purple' | 'blue' | 'green' | 'orange' | 'red';
  detail?: {
    title: string;
    description: string;
    items: { label: string; value: string; trend?: 'up' | 'down' | 'neutral'; sublabel?: string }[];
    chartData?: number[];
  };
}

export interface DirectMessage {
  id: string;
  userId: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
}

export interface GroupChat {
  id: string;
  name: string;
  members: string[];
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
}

export interface Space {
  id: string;
  name: string;
  icon: string;
  isGeneral?: boolean;
  channels: Channel[];
  dashboards: SpaceDashboard[];
  home?: SpaceHomeConfig;
}

export interface SpaceHomeConfig {
  banner: string;
  description: string;
  widgets: SpaceHomeWidget[];
}

export interface SpaceHomeWidget {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: 'purple' | 'blue' | 'green' | 'orange' | 'red';
}

export interface PostAttachment {
  id: string;
  type: 'image' | 'file' | 'video';
  name: string;
  url: string;
  size?: string;
  mimeType?: string;
  // video-specific
  videoDuration?: string;
  videoPosterUrl?: string;
}

export interface SpacePost {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  pinned?: boolean;
  pinnedBy?: string;
  likes: string[];
  comments: SpacePostComment[];
  image?: string;
  tags?: string[];
  attachments?: PostAttachment[];
  edited?: boolean;
  editedAt?: Date;
  linkedDocId?: string;
}

export interface SpacePostComment {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  likes: string[];
}

export interface SpaceDashboard {
  id: string;
  name: string;
  icon: 'bar-chart' | 'rocket' | 'shield' | 'git-pull-request' | 'layers' | 'target' | 'calendar' | 'megaphone' | 'users' | 'book-open';
  description: string;
  widgets: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'list' | 'progress' | 'members' | 'links';
  title: string;
  color: 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'gray';
  wide?: boolean;
  data: MetricData | ListData | ProgressData | MembersData | LinksData;
}

export interface MetricData {
  items: { label: string; value: string; change?: string; changeType?: 'up' | 'down' | 'neutral' }[];
}

export interface ListData {
  items: { id: string; label: string; sublabel?: string; status?: string; statusColor?: string; badge?: string; badgeColor?: string }[];
}

export interface ProgressData {
  items: { label: string; value: number; max: number; color?: string }[];
}

export interface MembersData {
  members: { name: string; avatar: string; role: string; status: 'online' | 'away' | 'busy' | 'offline' }[];
}

export interface LinksData {
  items: { label: string; url: string; icon: string; description?: string }[];
}

export interface Meeting {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  isOnline?: boolean;
  organizer: string;
  attendees: string[];
  color: 'purple' | 'blue' | 'green' | 'orange' | 'red';
  recurring?: boolean;
  status?: 'upcoming' | 'in-progress' | 'completed';
}

export interface Document {
  id: string;
  title: string;
  emoji: string;
  author: string;
  authorId: string;
  lastModified: Date;
  createdAt: Date;
  type: 'doc' | 'sheet' | 'presentation';
  parentId?: string;
  cover?: string;
  content?: DocumentBlock[];
  favorite?: boolean;
  securityLevel?: 'A' | 'B' | 'C';
}

export interface DocumentBlock {
  id: string;
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bullet' | 'numbered' | 'todo' | 'callout' | 'divider' | 'code' | 'quote' | 'table' | 'image';
  content?: string;
  checked?: boolean;
  calloutEmoji?: string;
  calloutColor?: 'blue' | 'yellow' | 'green' | 'red' | 'purple' | 'gray';
  language?: string;
  rows?: string[][];
}

export interface FileItem {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedByAvatar?: string;
  uploadedAt: Date;
  type: string;
  folderId?: string;
  securityLevel?: 'A' | 'B' | 'C';
}

export interface Folder {
  id: string;
  name: string;
  emoji?: string;
  parentId?: string;
  createdAt: Date;
  createdBy: string;
  color?: string;
}

export interface TaskSubtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  assignee: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done';
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'story' | 'bug' | 'task' | 'spike';
  storyPoints?: number;
  epic?: string;
  epicColor?: string;
  sprint?: string;
  labels?: string[];
  dueDate: Date;
  createdAt: Date;
  subtasks?: TaskSubtask[];
  blockedBy?: string[];
  pullRequestUrl?: string;
}

export interface Notification {
  id: string;
  type: 'system' | 'admin' | 'security' | 'update' | 'invite' | 'approval';
  title: string;
  message: string;
  detail: string;
  timestamp: Date;
  read: boolean;
  from?: string;
  actionUrl?: string;
  formFields?: {
    label: string;
    type: 'text' | 'textarea' | 'select';
    options?: string[];
    required?: boolean;
  }[];
}

export const currentUser: User = {
  id: 'user-1',
  name: 'John Doe',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  status: 'online',
};

export const users: User[] = [
  currentUser,
  {
    id: 'user-2',
    name: 'Jane Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    status: 'online',
  },
  {
    id: 'user-3',
    name: 'Bob Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    status: 'away',
  },
  {
    id: 'user-4',
    name: 'Alice Williams',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    status: 'online',
  },
  {
    id: 'user-5',
    name: 'Charlie Brown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    status: 'busy',
  },
];

export const directMessages: DirectMessage[] = [
  {
    id: 'dm-1',
    userId: 'user-2',
    lastMessage: 'Thanks for the update! I\'ll review it now.',
    lastMessageTime: new Date('2026-02-14T10:15:00'),
    unreadCount: 2,
  },
  {
    id: 'dm-2',
    userId: 'user-4',
    lastMessage: 'Can you send me the design files?',
    lastMessageTime: new Date('2026-02-14T09:45:00'),
  },
  {
    id: 'dm-3',
    userId: 'user-3',
    lastMessage: 'Sure, let\'s schedule that meeting',
    lastMessageTime: new Date('2026-02-14T08:30:00'),
  },
];

export const groupChats: GroupChat[] = [
  {
    id: 'group-1',
    name: 'Project Alpha Team',
    members: ['user-1', 'user-2', 'user-3', 'user-4'],
    lastMessage: 'Great progress today everyone!',
    lastMessageTime: new Date('2026-02-14T11:00:00'),
    unreadCount: 1,
  },
  {
    id: 'group-2',
    name: 'Design Review',
    members: ['user-1', 'user-2', 'user-4'],
    lastMessage: 'The mockups look fantastic',
    lastMessageTime: new Date('2026-02-14T09:20:00'),
  },
  {
    id: 'group-3',
    name: 'Weekend Plans',
    members: ['user-1', 'user-3', 'user-5'],
    lastMessage: 'Who\'s up for hiking?',
    lastMessageTime: new Date('2026-02-13T18:45:00'),
  },
];

export const spaces: Space[] = [
  {
    id: 'general',
    name: 'Company HQ',
    icon: '🏢',
    isGeneral: true,
    channels: [
      { id: 'general-announcements', name: 'announcements', type: 'announcement', description: 'Company-wide announcements', widgets: [
        { id: 'cw-1', label: 'Announcements', value: '8', icon: 'message-square', color: 'purple', detail: { title: 'Recent Announcements', description: 'Company-wide announcements this month', items: [{ label: 'Q1 All-Hands', value: 'Mar 5', sublabel: 'Scheduled' }, { label: 'New PTO Policy', value: 'Feb 12', sublabel: 'Published' }, { label: 'Office Move Update', value: 'Feb 8', sublabel: 'Published' }, { label: 'Security Training', value: 'Feb 1', sublabel: 'Due Mar 1' }], chartData: [2, 1, 3, 2, 4, 3, 2, 8] } },
        { id: 'cw-2', label: 'Reach', value: '98%', icon: 'users', color: 'green', detail: { title: 'Announcement Reach', description: 'Percentage of team who viewed recent announcements', items: [{ label: 'Q1 All-Hands RSVP', value: '128/142', trend: 'up' }, { label: 'New PTO Policy', value: '139/142', trend: 'up' }, { label: 'Security Training', value: '95/142', trend: 'down', sublabel: '47 pending' }], chartData: [85, 88, 92, 94, 96, 95, 97, 98] } },
      ] },
      { id: 'general-general', name: 'general', type: 'text', unreadCount: 3, widgets: [
        { id: 'cw-3', label: 'Online', value: '38', icon: 'activity', color: 'green', detail: { title: 'Active Members', description: 'Team members currently online', items: [{ label: 'Engineering', value: '14 online', sublabel: 'of 34' }, { label: 'Design', value: '6 online', sublabel: 'of 12' }, { label: 'Marketing', value: '8 online', sublabel: 'of 18' }, { label: 'SRE', value: '4 online', sublabel: 'of 8' }, { label: 'Other', value: '6 online', sublabel: 'of 70' }], chartData: [22, 28, 35, 42, 38, 34, 40, 38] } },
        { id: 'cw-4', label: 'Today', value: '47 msgs', icon: 'message-square', color: 'blue', detail: { title: 'Messages Today', description: 'Channel activity for today', items: [{ label: 'Peak hour', value: '10:00 AM', sublabel: '12 messages' }, { label: 'Active users', value: '18', trend: 'up' }, { label: 'Threads started', value: '5', trend: 'neutral' }, { label: 'Reactions', value: '34', trend: 'up' }], chartData: [2, 5, 8, 12, 10, 6, 4, 3] } },
        { id: 'cw-5', label: 'Pinned', value: '6', icon: 'target', color: 'orange', detail: { title: 'Pinned Messages', description: 'Important messages pinned in this channel', items: [{ label: 'Team Directory', value: 'Jan 15', sublabel: 'By Jane Smith' }, { label: 'Office Hours Schedule', value: 'Jan 22', sublabel: 'By Bob Johnson' }, { label: 'Meeting Room Booking', value: 'Feb 1', sublabel: 'By Alice Williams' }, { label: 'IT Support Contact', value: 'Feb 5', sublabel: 'By Charlie Brown' }] } },
      ] },
      { id: 'general-random', name: 'random', type: 'text' },
      { id: 'general-watercooler', name: 'watercooler', type: 'text' },
    ],
    home: {
      banner: 'https://images.unsplash.com/photo-1770777843445-2a1621b1201d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB0ZWFtd29yayUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzcxMjA4ODYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      description: 'Welcome to Company HQ — your central hub for company-wide announcements, resources, and team collaboration.',
      widgets: [
        { id: 'hw-1', label: 'Members', value: '142', icon: 'users', color: 'purple' },
        { id: 'hw-2', label: 'Active Now', value: '38', icon: 'activity', color: 'green' },
        { id: 'hw-3', label: 'Posts Today', value: '12', icon: 'message-square', color: 'blue' },
        { id: 'hw-4', label: 'Open Tasks', value: '24', icon: 'check-square', color: 'orange' },
      ],
    },
    dashboards: [
      {
        id: 'company-overview',
        name: 'Company Overview',
        icon: 'bar-chart',
        description: 'Key company-wide metrics, announcements, and department health at a glance.',
        widgets: [
          {
            id: 'co-metrics',
            type: 'metric',
            title: 'Company Snapshot',
            color: 'purple',
            wide: true,
            data: {
              items: [
                { label: 'Total Headcount', value: '142', change: '+8 this quarter', changeType: 'up' },
                { label: 'Open Positions', value: '12', change: '-3 from last month', changeType: 'down' },
                { label: 'Avg. Satisfaction', value: '4.6/5', change: '+0.2 vs Q4', changeType: 'up' },
                { label: 'Retention Rate', value: '96%', change: '+1% YoY', changeType: 'up' },
              ],
            },
          },
          {
            id: 'co-announcements',
            type: 'list',
            title: 'Recent Announcements',
            color: 'blue',
            data: {
              items: [
                { id: 'a1', label: 'Remote work policy updated', sublabel: 'HR Department · Feb 14', status: 'New', statusColor: 'blue' },
                { id: 'a2', label: 'Q1 All-Hands scheduled for Mar 5', sublabel: 'Leadership · Feb 12', status: 'Upcoming', statusColor: 'orange' },
                { id: 'a3', label: 'Office relocation — 4th floor move', sublabel: 'Facilities · Feb 10', status: 'Action', statusColor: 'red' },
                { id: 'a4', label: 'Annual performance reviews begin Mar 1', sublabel: 'HR Department · Feb 8', status: 'Info', statusColor: 'gray' },
              ],
            },
          },
          {
            id: 'co-dept-health',
            type: 'progress',
            title: 'Department Goal Progress',
            color: 'green',
            data: {
              items: [
                { label: 'Engineering', value: 78, max: 100, color: 'blue' },
                { label: 'Design', value: 85, max: 100, color: 'purple' },
                { label: 'Marketing', value: 62, max: 100, color: 'orange' },
                { label: 'Sales', value: 91, max: 100, color: 'green' },
                { label: 'HR / People', value: 70, max: 100, color: 'red' },
              ],
            },
          },
          {
            id: 'co-links',
            type: 'links',
            title: 'Quick Links',
            color: 'gray',
            data: {
              items: [
                { label: 'Employee Handbook', url: '#', icon: 'book', description: 'Policies, benefits, and guidelines' },
                { label: 'IT Help Desk', url: '#', icon: 'headphones', description: 'Submit tickets & FAQs' },
                { label: 'Expense Portal', url: '#', icon: 'receipt', description: 'Submit and track expenses' },
                { label: 'PTO Calendar', url: '#', icon: 'calendar', description: 'Team availability' },
              ],
            },
          },
        ],
      },
      {
        id: 'onboarding-hub',
        name: 'Onboarding Hub',
        icon: 'book-open',
        description: 'Resources, checklists, and contacts for new team members.',
        widgets: [
          {
            id: 'ob-checklist',
            type: 'list',
            title: 'New Hire Checklist',
            color: 'green',
            data: {
              items: [
                { id: 'c1', label: 'Complete I-9 and tax forms', sublabel: 'Due within first 3 days', status: 'Done', statusColor: 'green' },
                { id: 'c2', label: 'Set up 2FA and password', sublabel: 'IT Security requirement', status: 'Done', statusColor: 'green' },
                { id: 'c3', label: 'Read Employee Handbook', sublabel: 'HR Department', status: 'In Progress', statusColor: 'blue' },
                { id: 'c4', label: 'Schedule 1:1 with manager', sublabel: 'Within first week', status: 'Pending', statusColor: 'orange' },
                { id: 'c5', label: 'Complete compliance training', sublabel: 'Due within 30 days', status: 'Pending', statusColor: 'orange' },
              ],
            },
          },
          {
            id: 'ob-contacts',
            type: 'members',
            title: 'Key Contacts',
            color: 'purple',
            data: {
              members: [
                { name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', role: 'HR Lead', status: 'online' },
                { name: 'Bob Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', role: 'IT Support', status: 'away' },
                { name: 'Alice Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', role: 'Office Manager', status: 'online' },
              ],
            },
          },
          {
            id: 'ob-resources',
            type: 'links',
            title: 'Getting Started',
            color: 'blue',
            data: {
              items: [
                { label: 'Org Chart', url: '#', icon: 'users', description: 'See who is who' },
                { label: 'Benefits Overview', url: '#', icon: 'heart', description: 'Health, dental, 401k' },
                { label: 'Tool Access Requests', url: '#', icon: 'key', description: 'Request software access' },
                { label: 'Culture & Values', url: '#', icon: 'star', description: 'What drives us' },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    icon: '💻',
    channels: [
      { id: 'eng-general', name: 'general', type: 'text', unreadCount: 5, widgets: [
        { id: 'cw-10', label: 'Sprint', value: 'Day 7/10', icon: 'rocket', color: 'purple', detail: { title: 'Sprint 14 Status', description: 'Current sprint progress and velocity', items: [{ label: 'Completed', value: '26 pts', trend: 'up', sublabel: '8 stories done' }, { label: 'In Progress', value: '11 pts', trend: 'neutral', sublabel: '4 stories' }, { label: 'To Do', value: '5 pts', sublabel: '2 stories' }, { label: 'Velocity', value: '42 pts', trend: 'up', sublabel: '+6 from last sprint' }, { label: 'Blockers', value: '2', trend: 'down', sublabel: 'ENG-341, ENG-338' }], chartData: [0, 3, 8, 12, 16, 20, 26] } },
        { id: 'cw-11', label: 'Open PRs', value: '7', icon: 'git-pull-request', color: 'orange', detail: { title: 'Open Pull Requests', description: 'Merge requests awaiting review or merge', items: [{ label: 'Needs Review', value: '4', trend: 'up', sublabel: 'Avg wait: 3.2 hrs' }, { label: 'Approved', value: '2', trend: 'neutral', sublabel: 'Ready to merge' }, { label: 'Changes Requested', value: '1', trend: 'down', sublabel: 'By Charlie' }, { label: 'Avg Review Time', value: '4.5 hrs', trend: 'down' }], chartData: [5, 8, 6, 9, 7, 5, 7] } },
        { id: 'cw-12', label: 'Build', value: 'Passing', icon: 'shield', color: 'green', detail: { title: 'CI/CD Pipeline', description: 'Latest build and deployment status', items: [{ label: 'Last Build', value: '#4821', sublabel: 'Passed · 8 min ago' }, { label: 'Last Deploy', value: 'v2.13.1', sublabel: 'Production · 2 hrs ago' }, { label: 'Success Rate (7d)', value: '94.2%', trend: 'up' }, { label: 'Avg Build Time', value: '4m 32s', trend: 'down' }], chartData: [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1] } },
      ] },
      { id: 'eng-backend', name: 'backend', type: 'text', unreadCount: 2, widgets: [
        { id: 'cw-13', label: 'Services', value: '6 healthy', icon: 'activity', color: 'green', detail: { title: 'Backend Services', description: 'Microservice health overview', items: [{ label: 'api-gateway', value: '12ms', trend: 'neutral', sublabel: 'Healthy' }, { label: 'user-service', value: '45ms', trend: 'neutral', sublabel: 'Healthy' }, { label: 'payment-service', value: '890ms', trend: 'down', sublabel: 'Degraded' }, { label: 'product-service', value: '32ms', trend: 'up', sublabel: 'Healthy' }, { label: 'auth-service', value: '85ms', trend: 'neutral', sublabel: 'Healthy' }] } },
        { id: 'cw-14', label: 'Coverage', value: '84.2%', icon: 'shield', color: 'blue', detail: { title: 'Test Coverage', description: 'Code coverage across backend services', items: [{ label: 'Unit Tests', value: '91.3%', trend: 'up', sublabel: '+1.2% this week' }, { label: 'Integration', value: '78.5%', trend: 'up', sublabel: '+0.8% this week' }, { label: 'E2E', value: '65.1%', trend: 'neutral' }, { label: 'Total Passing', value: '1,247/1,252', sublabel: '5 failing' }], chartData: [80, 81, 82, 81, 83, 84, 84] } },
      ] },
      { id: 'eng-frontend', name: 'frontend', type: 'text' },
      { id: 'eng-devops', name: 'devops', type: 'text' },
      { id: 'eng-incidents', name: 'incidents', type: 'announcement' },
    ],
    home: {
      banner: 'https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGVuZ2luZWVyaW5nJTIwY29kZSUyMHByb2dyYW1taW5nfGVufDF8fHx8MTc3MTIxMjgwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      description: 'Engineering team hub — share updates, celebrate wins, discuss architecture decisions, and stay aligned.',
      widgets: [
        { id: 'hw-5', label: 'Team Size', value: '34', icon: 'users', color: 'blue' },
        { id: 'hw-6', label: 'Sprint Day', value: '7/10', icon: 'rocket', color: 'purple' },
        { id: 'hw-7', label: 'Open PRs', value: '7', icon: 'git-pull-request', color: 'orange' },
        { id: 'hw-8', label: 'Uptime', value: '99.97%', icon: 'shield', color: 'green' },
      ],
    },
    dashboards: [
      {
        id: 'sprint-board',
        name: 'Sprint Board',
        icon: 'rocket',
        description: 'Current sprint progress, velocity tracking, and team workload.',
        widgets: [
          {
            id: 'sp-metrics',
            type: 'metric',
            title: 'Sprint 14 — Metrics',
            color: 'blue',
            wide: true,
            data: {
              items: [
                { label: 'Velocity', value: '42 pts', change: '+6 vs avg', changeType: 'up' },
                { label: 'Days Remaining', value: '4', change: 'Ends Feb 19', changeType: 'neutral' },
                { label: 'Burn Rate', value: '87%', change: 'On track', changeType: 'up' },
                { label: 'Blockers', value: '2', change: '+1 this week', changeType: 'down' },
              ],
            },
          },
          {
            id: 'sp-tasks',
            type: 'list',
            title: 'Sprint Backlog',
            color: 'purple',
            data: {
              items: [
                { id: 's1', label: 'Implement OAuth 2.0 flow', sublabel: 'Bob Johnson · 8 pts', status: 'In Progress', statusColor: 'blue', badge: 'High', badgeColor: 'red' },
                { id: 's2', label: 'API rate limiting middleware', sublabel: 'Charlie Brown · 5 pts', status: 'In Review', statusColor: 'orange', badge: 'Medium', badgeColor: 'orange' },
                { id: 's3', label: 'Dashboard component tests', sublabel: 'Jane Smith · 3 pts', status: 'Done', statusColor: 'green' },
                { id: 's4', label: 'Migrate DB to Postgres 16', sublabel: 'Bob Johnson · 5 pts', status: 'To Do', statusColor: 'gray', badge: 'High', badgeColor: 'red' },
                { id: 's5', label: 'Fix pagination edge case', sublabel: 'Alice Williams · 2 pts', status: 'In Progress', statusColor: 'blue' },
              ],
            },
          },
          {
            id: 'sp-progress',
            type: 'progress',
            title: 'Team Workload',
            color: 'green',
            data: {
              items: [
                { label: 'Bob Johnson', value: 13, max: 15, color: 'orange' },
                { label: 'Charlie Brown', value: 8, max: 15, color: 'green' },
                { label: 'Jane Smith', value: 11, max: 15, color: 'blue' },
                { label: 'Alice Williams', value: 10, max: 15, color: 'purple' },
              ],
            },
          },
        ],
      },
      {
        id: 'devops-monitor',
        name: 'DevOps Monitor',
        icon: 'shield',
        description: 'System health, deployments, incidents, and infrastructure status.',
        widgets: [
          {
            id: 'dv-metrics',
            type: 'metric',
            title: 'Infrastructure Health',
            color: 'green',
            wide: true,
            data: {
              items: [
                { label: 'Uptime (30d)', value: '99.97%', change: 'SLA: 99.9%', changeType: 'up' },
                { label: 'Deploy Frequency', value: '3.2/day', change: '+0.5 vs last month', changeType: 'up' },
                { label: 'MTTR', value: '12 min', change: '-4 min vs avg', changeType: 'up' },
                { label: 'Error Rate', value: '0.03%', change: '-0.01%', changeType: 'up' },
              ],
            },
          },
          {
            id: 'dv-incidents',
            type: 'list',
            title: 'Recent Incidents',
            color: 'red',
            data: {
              items: [
                { id: 'i1', label: 'API latency spike — us-east-1', sublabel: 'Feb 14, 3:22 PM · 8 min', status: 'Resolved', statusColor: 'green' },
                { id: 'i2', label: 'Payment gateway timeout', sublabel: 'Feb 12, 11:05 AM · 22 min', status: 'Resolved', statusColor: 'green' },
                { id: 'i3', label: 'CDN cache invalidation delay', sublabel: 'Feb 10, 9:40 AM · 5 min', status: 'Resolved', statusColor: 'green' },
              ],
            },
          },
          {
            id: 'dv-servers',
            type: 'progress',
            title: 'Server Utilization',
            color: 'blue',
            data: {
              items: [
                { label: 'API Cluster (CPU)', value: 62, max: 100, color: 'green' },
                { label: 'API Cluster (Memory)', value: 74, max: 100, color: 'orange' },
                { label: 'Worker Nodes (CPU)', value: 45, max: 100, color: 'green' },
                { label: 'Database (Connections)', value: 180, max: 500, color: 'blue' },
              ],
            },
          },
          {
            id: 'dv-team',
            type: 'members',
            title: 'On-Call Rotation',
            color: 'orange',
            data: {
              members: [
                { name: 'Charlie Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', role: 'Primary On-Call', status: 'busy' },
                { name: 'Bob Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', role: 'Secondary On-Call', status: 'away' },
                { name: 'Alice Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', role: 'Next Rotation (Feb 17)', status: 'online' },
              ],
            },
          },
        ],
      },
      {
        id: 'code-review',
        name: 'Code Review',
        icon: 'git-pull-request',
        description: 'Pending pull requests, review turnaround, and merge queue.',
        widgets: [
          {
            id: 'cr-metrics',
            type: 'metric',
            title: 'Review Stats (This Week)',
            color: 'purple',
            wide: true,
            data: {
              items: [
                { label: 'Open PRs', value: '7', change: '+2 from yesterday', changeType: 'down' },
                { label: 'Avg. Review Time', value: '3.5 hrs', change: '-1.2 hrs vs avg', changeType: 'up' },
                { label: 'Merged This Week', value: '18', change: '+4 vs last week', changeType: 'up' },
                { label: 'Approval Rate', value: '94%', change: 'First-pass approval', changeType: 'up' },
              ],
            },
          },
          {
            id: 'cr-prs',
            type: 'list',
            title: 'Pending Pull Requests',
            color: 'blue',
            data: {
              items: [
                { id: 'pr1', label: '#482 — Add WebSocket reconnection logic', sublabel: 'Bob Johnson · +312 / -45', status: 'Needs Review', statusColor: 'orange', badge: 'P1', badgeColor: 'red' },
                { id: 'pr2', label: '#479 — Refactor payment service', sublabel: 'Charlie Brown · +89 / -234', status: 'Changes Requested', statusColor: 'red' },
                { id: 'pr3', label: '#477 — Add unit tests for auth module', sublabel: 'Jane Smith · +420 / -12', status: 'Approved', statusColor: 'green' },
                { id: 'pr4', label: '#475 — Upgrade React Router to v7', sublabel: 'Alice Williams · +56 / -78', status: 'Needs Review', statusColor: 'orange' },
                { id: 'pr5', label: '#473 — Fix dark mode inconsistencies', sublabel: 'Bob Johnson · +28 / -15', status: 'Approved', statusColor: 'green' },
              ],
            },
          },
          {
            id: 'cr-reviewers',
            type: 'progress',
            title: 'Reviewer Workload',
            color: 'orange',
            data: {
              items: [
                { label: 'Jane Smith', value: 4, max: 5, color: 'red' },
                { label: 'Alice Williams', value: 2, max: 5, color: 'green' },
                { label: 'Bob Johnson', value: 3, max: 5, color: 'orange' },
                { label: 'Charlie Brown', value: 1, max: 5, color: 'green' },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'design',
    name: 'Design',
    icon: '🎨',
    channels: [
      { id: 'design-general', name: 'general', type: 'text', widgets: [
        { id: 'cw-30', label: 'Components', value: '248', icon: 'check-square', color: 'purple', detail: { title: 'Design System Components', description: 'Component library status', items: [{ label: 'Published', value: '218', trend: 'up', sublabel: '+12 this month' }, { label: 'In Review', value: '14', trend: 'neutral' }, { label: 'Draft', value: '16', trend: 'neutral' }, { label: 'Coverage', value: '94%', trend: 'up' }], chartData: [220, 225, 230, 235, 238, 242, 248] } },
        { id: 'cw-31', label: 'Reviews', value: '5 open', icon: 'message-square', color: 'orange', detail: { title: 'Design Reviews', description: 'Pending design reviews', items: [{ label: 'Login Redesign v3', value: 'Alice', sublabel: 'Waiting for feedback' }, { label: 'Mobile Nav', value: 'Bob', sublabel: 'Changes requested' }, { label: 'Dashboard Cards', value: 'Alice', sublabel: 'Approved' }, { label: 'Onboarding Flow', value: 'Jane', sublabel: 'In review' }, { label: 'Settings Page', value: 'Charlie', sublabel: 'New' }] } },
      ] },
      { id: 'design-feedback', name: 'design-feedback', type: 'text', unreadCount: 1 },
      { id: 'design-resources', name: 'resources', type: 'text' },
    ],
    dashboards: [
      {
        id: 'design-system',
        name: 'Design System',
        icon: 'layers',
        description: 'Component library status, coverage metrics, and recent updates.',
        widgets: [
          {
            id: 'ds-metrics',
            type: 'metric',
            title: 'System Health',
            color: 'purple',
            wide: true,
            data: {
              items: [
                { label: 'Components', value: '86', change: '+4 this month', changeType: 'up' },
                { label: 'Token Coverage', value: '94%', change: '+2% vs last release', changeType: 'up' },
                { label: 'A11y Score', value: '98/100', change: 'AA compliant', changeType: 'up' },
                { label: 'Adoption Rate', value: '87%', change: '+5% this quarter', changeType: 'up' },
              ],
            },
          },
          {
            id: 'ds-components',
            type: 'list',
            title: 'Recently Updated Components',
            color: 'blue',
            data: {
              items: [
                { id: 'ds1', label: 'Button', sublabel: 'v3.2.0 · Added loading states', status: 'Published', statusColor: 'green' },
                { id: 'ds2', label: 'Modal / Dialog', sublabel: 'v2.1.0 · Trap focus improvements', status: 'Published', statusColor: 'green' },
                { id: 'ds3', label: 'Data Table', sublabel: 'v1.4.0 · Virtual scroll support', status: 'Beta', statusColor: 'orange' },
                { id: 'ds4', label: 'Color Picker', sublabel: 'v0.9.0 · New component', status: 'Draft', statusColor: 'gray' },
              ],
            },
          },
          {
            id: 'ds-coverage',
            type: 'progress',
            title: 'Component Coverage by Product',
            color: 'green',
            data: {
              items: [
                { label: 'Web App', value: 92, max: 100, color: 'green' },
                { label: 'Mobile App', value: 78, max: 100, color: 'orange' },
                { label: 'Admin Panel', value: 88, max: 100, color: 'blue' },
                { label: 'Marketing Site', value: 65, max: 100, color: 'red' },
              ],
            },
          },
        ],
      },
      {
        id: 'project-tracker',
        name: 'Project Tracker',
        icon: 'target',
        description: 'Active design projects, deliverables, and deadlines.',
        widgets: [
          {
            id: 'pt-projects',
            type: 'list',
            title: 'Active Projects',
            color: 'orange',
            wide: true,
            data: {
              items: [
                { id: 'p1', label: 'Website Redesign', sublabel: 'Alice Williams · Due Mar 15', status: 'On Track', statusColor: 'green', badge: 'High', badgeColor: 'red' },
                { id: 'p2', label: 'Mobile App v3 — Design Spec', sublabel: 'Alice Williams · Due Feb 28', status: 'At Risk', statusColor: 'orange', badge: 'High', badgeColor: 'red' },
                { id: 'p3', label: 'Onboarding Flow Revamp', sublabel: 'Jane Smith · Due Mar 22', status: 'On Track', statusColor: 'green', badge: 'Medium', badgeColor: 'orange' },
                { id: 'p4', label: 'Email Template System', sublabel: 'Alice Williams · Due Apr 5', status: 'Not Started', statusColor: 'gray', badge: 'Low', badgeColor: 'gray' },
              ],
            },
          },
          {
            id: 'pt-deadlines',
            type: 'progress',
            title: 'Project Completion',
            color: 'blue',
            data: {
              items: [
                { label: 'Website Redesign', value: 72, max: 100, color: 'green' },
                { label: 'Mobile App v3', value: 45, max: 100, color: 'orange' },
                { label: 'Onboarding Flow', value: 20, max: 100, color: 'blue' },
                { label: 'Email Templates', value: 0, max: 100, color: 'gray' },
              ],
            },
          },
          {
            id: 'pt-resources',
            type: 'links',
            title: 'Design Resources',
            color: 'purple',
            data: {
              items: [
                { label: 'Figma Workspace', url: '#', icon: 'pen-tool', description: 'All project files' },
                { label: 'Brand Guidelines', url: '#', icon: 'book', description: 'Colors, type, logos' },
                { label: 'Icon Library', url: '#', icon: 'grid', description: 'Lucide + custom icons' },
                { label: 'Stock Photos', url: '#', icon: 'image', description: 'Licensed assets' },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: '📢',
    channels: [
      { id: 'marketing-general', name: 'general', type: 'text' },
      { id: 'marketing-campaigns', name: 'campaigns', type: 'text' },
      { id: 'marketing-social', name: 'social-media', type: 'text' },
    ],
    dashboards: [
      {
        id: 'campaign-dashboard',
        name: 'Campaign Dashboard',
        icon: 'megaphone',
        description: 'Active campaign performance, budget tracking, and channel metrics.',
        widgets: [
          {
            id: 'cd-metrics',
            type: 'metric',
            title: 'Q1 Campaign Performance',
            color: 'green',
            wide: true,
            data: {
              items: [
                { label: 'Total Reach', value: '2.4M', change: '+32% vs Q4', changeType: 'up' },
                { label: 'Conversion Rate', value: '3.8%', change: '+0.6% vs target', changeType: 'up' },
                { label: 'Cost per Lead', value: '$14.20', change: '-$2.30 vs avg', changeType: 'up' },
                { label: 'Pipeline Generated', value: '$485K', change: '+18% vs goal', changeType: 'up' },
              ],
            },
          },
          {
            id: 'cd-campaigns',
            type: 'list',
            title: 'Active Campaigns',
            color: 'blue',
            data: {
              items: [
                { id: 'c1', label: 'Q1 LinkedIn Lead Gen', sublabel: 'Budget: $5,000 · Spent: $3,200', status: 'Running', statusColor: 'green', badge: '$1.8K left', badgeColor: 'orange' },
                { id: 'c2', label: 'Google Search — Brand Terms', sublabel: 'Budget: $3,000 · Spent: $2,800', status: 'Running', statusColor: 'green', badge: '$200 left', badgeColor: 'red' },
                { id: 'c3', label: 'Product Launch Email Series', sublabel: 'Budget: $500 · 4 of 6 sent', status: 'Active', statusColor: 'blue' },
                { id: 'c4', label: 'Webinar: Future of Work 2026', sublabel: 'Budget: $1,500 · Mar 10', status: 'Planned', statusColor: 'orange' },
              ],
            },
          },
          {
            id: 'cd-budget',
            type: 'progress',
            title: 'Budget Utilization by Channel',
            color: 'orange',
            data: {
              items: [
                { label: 'Paid Social', value: 78, max: 100, color: 'blue' },
                { label: 'Search / SEM', value: 93, max: 100, color: 'red' },
                { label: 'Email', value: 45, max: 100, color: 'green' },
                { label: 'Events', value: 20, max: 100, color: 'orange' },
              ],
            },
          },
        ],
      },
      {
        id: 'content-calendar',
        name: 'Content Calendar',
        icon: 'calendar',
        description: 'Upcoming content, publishing schedule, and editorial team.',
        widgets: [
          {
            id: 'cc-upcoming',
            type: 'list',
            title: 'Upcoming Content',
            color: 'purple',
            wide: true,
            data: {
              items: [
                { id: 'ct1', label: 'Blog: "5 Trends in Remote Collaboration"', sublabel: 'Jane Smith · Publish Feb 17', status: 'Ready', statusColor: 'green' },
                { id: 'ct2', label: 'Case Study: Acme Corp Integration', sublabel: 'Alice Williams · Publish Feb 20', status: 'In Review', statusColor: 'orange' },
                { id: 'ct3', label: 'Social: Product feature carousel', sublabel: 'Jane Smith · Publish Feb 18', status: 'Draft', statusColor: 'gray' },
                { id: 'ct4', label: 'Newsletter: February Digest', sublabel: 'Jane Smith · Publish Feb 28', status: 'Draft', statusColor: 'gray' },
                { id: 'ct5', label: 'Video: Customer testimonial — TechFlow', sublabel: 'Bob Johnson · Publish Mar 3', status: 'In Production', statusColor: 'blue' },
              ],
            },
          },
          {
            id: 'cc-channels',
            type: 'progress',
            title: 'Channel Performance (Engagement)',
            color: 'green',
            data: {
              items: [
                { label: 'Blog', value: 82, max: 100, color: 'blue' },
                { label: 'LinkedIn', value: 76, max: 100, color: 'purple' },
                { label: 'Twitter / X', value: 58, max: 100, color: 'orange' },
                { label: 'Email', value: 91, max: 100, color: 'green' },
              ],
            },
          },
          {
            id: 'cc-team',
            type: 'members',
            title: 'Editorial Team',
            color: 'blue',
            data: {
              members: [
                { name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', role: 'Content Lead', status: 'online' },
                { name: 'Alice Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', role: 'Copywriter', status: 'online' },
                { name: 'Bob Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', role: 'Video Producer', status: 'away' },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'sre',
    name: 'SRE',
    icon: '🛡️',
    channels: [
      { id: 'sre-general', name: 'general', type: 'text', unreadCount: 4, widgets: [
        { id: 'cw-20', label: 'Availability', value: '99.97%', icon: 'shield', color: 'green', detail: { title: 'Service Availability', description: '30-day rolling availability across all services', items: [{ label: 'api-gateway', value: '99.99%', trend: 'up' }, { label: 'user-service', value: '99.95%', trend: 'neutral' }, { label: 'payment-service', value: '99.89%', trend: 'down', sublabel: '2 incidents' }, { label: 'product-service', value: '99.99%', trend: 'up' }, { label: 'Overall SLA Target', value: '99.95%', sublabel: 'Meeting target' }], chartData: [99.95, 99.96, 99.94, 99.97, 99.98, 99.96, 99.97] } },
        { id: 'cw-21', label: 'Error Budget', value: '62%', icon: 'target', color: 'orange', detail: { title: 'Error Budget Remaining', description: 'Monthly error budget consumption', items: [{ label: 'Budget Used', value: '38%', trend: 'down', sublabel: 'Burning faster than expected' }, { label: 'Days Remaining', value: '12', sublabel: 'In current month' }, { label: 'Projected End', value: '45%', trend: 'down', sublabel: 'At current burn rate' }, { label: 'Incidents Contributing', value: '3', sublabel: 'Payment timeout, DB failover, DNS' }], chartData: [100, 92, 85, 78, 72, 68, 62] } },
        { id: 'cw-22', label: 'On-Call', value: 'Charlie', icon: 'phone', color: 'red', detail: { title: 'On-Call Schedule', description: 'Current and upcoming on-call rotation', items: [{ label: 'Primary (Now)', value: 'Charlie Brown', sublabel: 'Until Feb 20, 9:00 AM' }, { label: 'Secondary', value: 'Bob Johnson', sublabel: 'Backup on-call' }, { label: 'Next Primary', value: 'Alice Williams', sublabel: 'Feb 20 – Feb 27' }, { label: 'Pages This Week', value: '3', trend: 'down', sublabel: 'vs 7 last week' }] } },
        { id: 'cw-23', label: 'Incidents', value: '2 active', icon: 'alert-triangle', color: 'red', detail: { title: 'Active Incidents', description: 'Current open incidents and recent history', items: [{ label: 'INC-142: Payment timeout', value: 'P2', trend: 'down', sublabel: 'Investigating · 45 min' }, { label: 'INC-141: CPU spike node-3', value: 'P3', trend: 'neutral', sublabel: 'Monitoring · 12 min' }, { label: 'Resolved Today', value: '1', sublabel: 'INC-140: CORS error' }, { label: 'MTTR (7d avg)', value: '28 min', trend: 'up' }], chartData: [1, 0, 2, 1, 3, 1, 2] } },
      ] },
      { id: 'sre-alerts', name: 'alerts', type: 'announcement', unreadCount: 2, widgets: [
        { id: 'cw-24', label: 'Firing', value: '2', icon: 'alert-triangle', color: 'red', detail: { title: 'Firing Alerts', description: 'Currently active alert rules', items: [{ label: 'CPU > 80%', value: 'node-prod-3', trend: 'down', sublabel: 'Firing · 12 min' }, { label: 'Memory > 90%', value: 'node-prod-3', trend: 'down', sublabel: 'Firing · 8 min' }] } },
        { id: 'cw-25', label: 'Resolved', value: '5 today', icon: 'shield', color: 'green', detail: { title: 'Resolved Alerts', description: 'Alerts resolved in the last 24 hours', items: [{ label: 'Error rate /checkout', value: 'Auto-resolved', sublabel: '45 min ago' }, { label: 'P95 latency payment-svc', value: 'Auto-resolved', sublabel: '2 hrs ago' }, { label: 'Disk > 85% node-prod-2', value: 'Manual', sublabel: '4 hrs ago' }, { label: 'Pod restart loop', value: 'Auto-resolved', sublabel: '6 hrs ago' }, { label: 'Connection pool exhaustion', value: 'Manual', sublabel: '8 hrs ago' }] } },
      ] },
      { id: 'sre-oncall', name: 'on-call', type: 'text' },
      { id: 'sre-postmortems', name: 'postmortems', type: 'text' },
      { id: 'sre-infra', name: 'infrastructure', type: 'text', unreadCount: 1 },
      { id: 'sre-slo', name: 'slo-tracking', type: 'private' },
    ],
    home: {
      banner: 'https://images.unsplash.com/photo-1744868562210-fffb7fa882d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXJ2ZXIlMjByb29tJTIwZGF0YSUyMGNlbnRlciUyMGluZnJhc3RydWN0dXJlfGVufDF8fHx8MTc3MTIxMjgwMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      description: 'SRE team space — incident coordination, reliability metrics, on-call updates, and operational excellence.',
      widgets: [
        { id: 'hw-9', label: 'Availability', value: '99.97%', icon: 'shield', color: 'green' },
        { id: 'hw-10', label: 'Error Budget', value: '62%', icon: 'target', color: 'orange' },
        { id: 'hw-11', label: 'On-Call', value: 'Charlie', icon: 'phone', color: 'red' },
        { id: 'hw-12', label: 'Incidents (MTD)', value: '14', icon: 'alert-triangle', color: 'purple' },
      ],
    },
    dashboards: [
      {
        id: 'slo-dashboard',
        name: 'SLO Dashboard',
        icon: 'shield',
        description: 'Service Level Objectives, error budgets, and reliability metrics across all production services.',
        widgets: [
          {
            id: 'slo-metrics',
            type: 'metric',
            title: 'Reliability Snapshot (30d)',
            color: 'green',
            wide: true,
            data: {
              items: [
                { label: 'Overall Availability', value: '99.97%', change: 'SLO: 99.95%', changeType: 'up' },
                { label: 'Error Budget Remaining', value: '62%', change: '-8% this week', changeType: 'down' },
                { label: 'P50 Latency', value: '42ms', change: '-3ms vs avg', changeType: 'up' },
                { label: 'P99 Latency', value: '280ms', change: 'Budget: 500ms', changeType: 'up' },
              ],
            },
          },
          {
            id: 'slo-services',
            type: 'list',
            title: 'Service SLO Status',
            color: 'blue',
            data: {
              items: [
                { id: 'svc1', label: 'payment-api', sublabel: '99.99% · Budget: 78% remaining', status: 'Healthy', statusColor: 'green' },
                { id: 'svc2', label: 'user-service', sublabel: '99.98% · Budget: 85% remaining', status: 'Healthy', statusColor: 'green' },
                { id: 'svc3', label: 'search-api', sublabel: '99.91% · Budget: 32% remaining', status: 'Warning', statusColor: 'orange', badge: 'At Risk', badgeColor: 'orange' },
                { id: 'svc4', label: 'notification-service', sublabel: '99.95% · Budget: 60% remaining', status: 'Healthy', statusColor: 'green' },
                { id: 'svc5', label: 'order-service', sublabel: '99.87% · Budget: 18% remaining', status: 'Critical', statusColor: 'red', badge: 'Burning', badgeColor: 'red' },
              ],
            },
          },
          {
            id: 'slo-error-budget',
            type: 'progress',
            title: 'Error Budget Consumption (30d)',
            color: 'orange',
            data: {
              items: [
                { label: 'payment-api', value: 22, max: 100, color: 'green' },
                { label: 'user-service', value: 15, max: 100, color: 'green' },
                { label: 'search-api', value: 68, max: 100, color: 'orange' },
                { label: 'notification-service', value: 40, max: 100, color: 'blue' },
                { label: 'order-service', value: 82, max: 100, color: 'red' },
              ],
            },
          },
          {
            id: 'slo-links',
            type: 'links',
            title: 'Runbooks & Resources',
            color: 'gray',
            data: {
              items: [
                { label: 'Runbook Library', url: '#', icon: 'book', description: 'Incident response procedures' },
                { label: 'Grafana Dashboards', url: '#', icon: 'bar-chart', description: 'Live monitoring & metrics' },
                { label: 'PagerDuty', url: '#', icon: 'bell', description: 'Alert management & schedules' },
                { label: 'Postmortem Template', url: '#', icon: 'file-text', description: 'Blameless review template' },
              ],
            },
          },
        ],
      },
      {
        id: 'incident-tracker',
        name: 'Incident Tracker',
        icon: 'bar-chart',
        description: 'Incident history, MTTR analysis, on-call rotation, and toil tracking.',
        widgets: [
          {
            id: 'it-metrics',
            type: 'metric',
            title: 'Incident Metrics (Q1 2026)',
            color: 'red',
            wide: true,
            data: {
              items: [
                { label: 'Total Incidents', value: '14', change: '-3 vs Q4', changeType: 'up' },
                { label: 'MTTR', value: '18 min', change: '-6 min vs Q4', changeType: 'up' },
                { label: 'MTTD', value: '3 min', change: '-1 min vs avg', changeType: 'up' },
                { label: 'Toil Ratio', value: '24%', change: 'Target: <30%', changeType: 'up' },
              ],
            },
          },
          {
            id: 'it-recent',
            type: 'list',
            title: 'Recent Incidents',
            color: 'orange',
            data: {
              items: [
                { id: 'ri1', label: 'INC-247 · Payment Service Outage', sublabel: 'P1 · Feb 16, 14:02 · 55 min', status: 'Resolved', statusColor: 'green', badge: 'P1', badgeColor: 'red' },
                { id: 'ri2', label: 'INC-248 · Search Degradation', sublabel: 'P2 · Feb 16, 11:30 · 3.5 hrs', status: 'Monitoring', statusColor: 'blue', badge: 'P2', badgeColor: 'orange' },
                { id: 'ri3', label: 'INC-245 · Email Notification Delays', sublabel: 'P3 · Feb 16, 09:15 · 2 hrs', status: 'Resolved', statusColor: 'green', badge: 'P3', badgeColor: 'blue' },
                { id: 'ri4', label: 'INC-240 · CDN Cache Invalidation', sublabel: 'P3 · Feb 12, 15:40 · 12 min', status: 'Resolved', statusColor: 'green', badge: 'P3', badgeColor: 'blue' },
                { id: 'ri5', label: 'INC-238 · DB Connection Spike', sublabel: 'P2 · Feb 10, 08:20 · 28 min', status: 'Resolved', statusColor: 'green', badge: 'P2', badgeColor: 'orange' },
              ],
            },
          },
          {
            id: 'it-oncall',
            type: 'members',
            title: 'On-Call Rotation',
            color: 'purple',
            data: {
              members: [
                { name: 'Charlie Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', role: 'Primary On-Call (Feb 10–16)', status: 'busy' },
                { name: 'Bob Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', role: 'Secondary On-Call', status: 'online' },
                { name: 'Alice Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', role: 'Next Rotation (Feb 17–23)', status: 'online' },
                { name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', role: 'Incident Commander Pool', status: 'online' },
              ],
            },
          },
          {
            id: 'it-toil',
            type: 'progress',
            title: 'Toil Reduction Progress',
            color: 'blue',
            data: {
              items: [
                { label: 'Alert Noise Reduction', value: 72, max: 100, color: 'green' },
                { label: 'Runbook Automation', value: 45, max: 100, color: 'orange' },
                { label: 'Self-Healing Services', value: 30, max: 100, color: 'blue' },
                { label: 'Capacity Auto-Scaling', value: 88, max: 100, color: 'green' },
              ],
            },
          },
        ],
      },
    ],
  },
];

export const messages: Record<string, Message[]> = {
  'general-general': [
    {
      id: 'msg-1',
      userId: 'user-2',
      content: 'Hey everyone! Welcome to the new chat platform. Feel free to explore all the features.',
      timestamp: new Date('2026-02-14T09:00:00'),
      reactions: [{ emoji: '👋', users: ['user-1', 'user-3', 'user-4'] }],
      threadCount: 3,
      threadPreview: 'Thanks for the welcome! Loving it so far...',
      pinned: true,
      seenBy: ['user-1', 'user-3', 'user-4', 'user-5'],
    },
    {
      id: 'msg-2',
      userId: 'user-3',
      content: 'Has anyone seen the new company policy document?',
      timestamp: new Date('2026-02-14T09:15:00'),
      threadCount: 5,
      threadPreview: 'Yes, it\'s in the documents section...',
      seenBy: ['user-1', 'user-2', 'user-4'],
    },
    {
      id: 'msg-3',
      userId: 'user-4',
      content: '@John Doe can you review the Q1 reports when you get a chance?',
      timestamp: new Date('2026-02-14T09:30:00'),
      reactions: [{ emoji: '👍', users: ['user-1'] }],
      seenBy: ['user-1', 'user-2'],
    },
  ],
  'eng-general': [
    {
      id: 'msg-4',
      userId: 'user-2',
      content: 'The deployment to staging is complete. Ready for testing.',
      timestamp: new Date('2026-02-14T08:45:00'),
      reactions: [{ emoji: '🚀', users: ['user-1', 'user-3'] }],
      seenBy: ['user-1', 'user-3', 'user-5'],
    },
    {
      id: 'msg-5',
      userId: 'user-3',
      content: 'I\'m seeing some performance issues with the new API endpoint. Anyone else? Recorded a quick screen capture showing the latency spikes.',
      timestamp: new Date('2026-02-14T09:00:00'),
      threadCount: 8,
      threadPreview: 'I can take a look at the logs...',
      seenBy: ['user-1', 'user-2'],
      attachments: [
        {
          id: 'att-vid-1',
          type: 'video',
          name: 'api-latency-screenrec.mp4',
          url: '#video-demo-1',
          size: '18.4 MB',
          mimeType: 'video/mp4',
          videoDuration: '2:34',
          videoPosterUrl: 'https://images.unsplash.com/photo-1586381317467-392e3a1ba577?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRlbW8lMjBzY3JlZW4lMjByZWNvcmRpbmclMjBwcmVzZW50YXRpb258ZW58MXx8fHwxNzcxNDMwMjYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        },
      ],
    },
    {
      id: 'msg-6',
      userId: 'user-4',
      content: 'Here are the updated dashboard mockups from today\'s design review. The new layout addresses all the feedback from last sprint.',
      timestamp: new Date('2026-02-14T10:15:00'),
      reactions: [{ emoji: '🔥', users: ['user-2', 'user-3'] }, { emoji: '👀', users: ['user-1'] }],
      seenBy: ['user-1', 'user-2', 'user-3'],
      attachments: [
        {
          id: 'att-img-1',
          type: 'image',
          name: 'dashboard-mockup-v3.png',
          thumbnailUrl: 'https://images.unsplash.com/photo-1575388902449-6bca946ad549?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBVSSUyMGRlc2lnbiUyMG1vY2t1cHxlbnwxfHx8fDE3NzE0MjMwOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          size: '2.4 MB',
          mimeType: 'image/png',
        },
        {
          id: 'att-img-2',
          type: 'image',
          name: 'whiteboard-session.jpg',
          thumbnailUrl: 'https://images.unsplash.com/photo-1759884247160-27b8465544b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwYnJhaW5zdG9ybWluZyUyMHdoaXRlYm9hcmQlMjBtZWV0aW5nfGVufDF8fHx8MTc3MTQyMzA5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          size: '1.8 MB',
          mimeType: 'image/jpeg',
        },
        {
          id: 'att-img-3',
          type: 'image',
          name: 'office-context.jpg',
          thumbnailUrl: 'https://images.unsplash.com/photo-1617788587804-10346bac2ac3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcmNoaXRlY3R1cmUlMjBidWlsZGluZyUyMGV4dGVyaW9yfGVufDF8fHx8MTc3MTMyMzg0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          size: '3.1 MB',
          mimeType: 'image/jpeg',
        },
      ],
    },
    {
      id: 'msg-7',
      userId: 'user-2',
      content: 'Uploading the latest build artifacts and the RFC for the new auth flow. Please review before Wednesday\'s architecture meeting.',
      timestamp: new Date('2026-02-14T11:30:00'),
      seenBy: ['user-1', 'user-3', 'user-4'],
      attachments: [
        {
          id: 'att-file-1',
          type: 'file',
          name: 'auth-flow-rfc-v2.pdf',
          url: '#',
          size: '842 KB',
          mimeType: 'application/pdf',
        },
        {
          id: 'att-file-2',
          type: 'file',
          name: 'build-report-2026-02-14.zip',
          url: '#',
          size: '14.3 MB',
          mimeType: 'application/zip',
        },
        {
          id: 'att-file-3',
          type: 'file',
          name: 'api-benchmarks.xlsx',
          url: '#',
          size: '256 KB',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      ],
    },
    {
      id: 'msg-8',
      userId: 'user-5',
      content: 'FYI — linked the relevant task and the architecture doc here. The OAuth migration is blocked by the infra ticket.',
      timestamp: new Date('2026-02-14T13:00:00'),
      threadCount: 3,
      threadPreview: 'I can help unblock the infra side...',
      reactions: [{ emoji: '👍', users: ['user-2'] }],
      seenBy: ['user-1', 'user-2', 'user-3'],
      attachments: [
        {
          id: 'att-task-1',
          type: 'task',
          name: 'Implement OAuth 2.0 flow',
          taskId: 'ENG-341',
          taskStatus: 'in-progress',
          taskPriority: 'high',
          taskAssignee: 'Bob Johnson',
          taskType: 'story',
        },
        {
          id: 'att-doc-1',
          type: 'document',
          name: 'API Architecture Guide',
          docId: 'doc-4',
          docEmoji: '🏗️',
          docType: 'doc',
          docAuthor: 'Jane Smith',
          docLastModified: new Date('2026-02-13T16:20:00'),
        },
      ],
    },
    {
      id: 'msg-9',
      userId: 'user-3',
      content: 'Quick screenshot of the perf regression I mentioned — look at the P95 spike around 2 PM. Also attaching the HAR trace and the related bug ticket.',
      timestamp: new Date('2026-02-14T14:20:00'),
      reactions: [{ emoji: '🐛', users: ['user-2', 'user-5'] }],
      seenBy: ['user-1', 'user-2'],
      attachments: [
        {
          id: 'att-img-4',
          type: 'image',
          name: 'p95-latency-spike.png',
          thumbnailUrl: 'https://images.unsplash.com/photo-1575388902449-6bca946ad549?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmQlMjBVSSUyMGRlc2lnbiUyMG1vY2t1cHxlbnwxfHx8fDE3NzE0MjMwOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          size: '520 KB',
          mimeType: 'image/png',
        },
        {
          id: 'att-file-4',
          type: 'file',
          name: 'checkout-flow-trace.har',
          url: '#',
          size: '1.2 MB',
          mimeType: 'application/json',
        },
        {
          id: 'att-task-2',
          type: 'task',
          name: 'P95 latency regression on /checkout',
          taskId: 'ENG-356',
          taskStatus: 'todo',
          taskPriority: 'critical',
          taskAssignee: 'Charlie Brown',
          taskType: 'bug',
        },
      ],
    },
    {
      id: 'msg-10',
      userId: 'user-2',
      content: 'Here\'s the recording from today\'s sprint demo — showcases the new auth flow and the dashboard redesign. Great work everyone!',
      timestamp: new Date('2026-02-14T16:00:00'),
      reactions: [{ emoji: '🎉', users: ['user-1', 'user-3', 'user-5'] }, { emoji: '🚀', users: ['user-4'] }],
      seenBy: ['user-1', 'user-3', 'user-4', 'user-5'],
      attachments: [
        {
          id: 'att-vid-2',
          type: 'video',
          name: 'sprint-demo-2026-02-14.mp4',
          url: '#video-demo-2',
          size: '124.7 MB',
          mimeType: 'video/mp4',
          videoDuration: '18:42',
          videoPosterUrl: 'https://images.unsplash.com/photo-1764690690771-b4522d66b433?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMHZpZGVvJTIwY29uZmVyZW5jZSUyMHJlY29yZGluZ3xlbnwxfHx8fDE3NzE0MzAyNTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        },
      ],
    },
  ],
  'dm-user-2': [
    {
      id: 'dm-msg-1',
      userId: 'user-2',
      content: 'Hey John, did you get a chance to look at the proposal I sent?',
      timestamp: new Date('2026-02-14T09:30:00'),
    },
    {
      id: 'dm-msg-2',
      userId: 'user-1',
      content: 'Yes! I just finished reviewing it. Looks great overall.',
      timestamp: new Date('2026-02-14T09:45:00'),
    },
    {
      id: 'dm-msg-3',
      userId: 'user-2',
      content: 'Thanks for the update! I\'ll review it now.',
      timestamp: new Date('2026-02-14T10:15:00'),
    },
    {
      id: 'dm-msg-3b',
      userId: 'user-2',
      content: 'Here\'s the proposal doc and the budget spreadsheet for reference.',
      timestamp: new Date('2026-02-14T10:20:00'),
      attachments: [
        {
          id: 'att-dm-doc',
          type: 'document',
          name: 'Q1 2026 Company Goals',
          docId: 'doc-1',
          docEmoji: '🎯',
          docType: 'doc',
          docAuthor: 'Jane Smith',
          docLastModified: new Date('2026-02-13T14:30:00'),
        },
        {
          id: 'att-dm-file',
          type: 'file',
          name: 'Q1-budget-forecast.xlsx',
          url: '#',
          size: '384 KB',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      ],
    },
  ],
  'dm-user-4': [
    {
      id: 'dm-msg-4',
      userId: 'user-4',
      content: 'Can you send me the design files?',
      timestamp: new Date('2026-02-14T09:45:00'),
    },
    {
      id: 'dm-msg-5',
      userId: 'user-1',
      content: 'Sure, here are the latest Figma exports and a walkthrough video!',
      timestamp: new Date('2026-02-14T10:00:00'),
      attachments: [
        {
          id: 'att-dm-img1',
          type: 'image',
          name: 'homepage-redesign-v2.png',
          thumbnailUrl: 'https://images.unsplash.com/photo-1617788587804-10346bac2ac3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcmNoaXRlY3R1cmUlMjBidWlsZGluZyUyMGV4dGVyaW9yfGVufDF8fHx8MTc3MTMyMzg0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          size: '1.6 MB',
          mimeType: 'image/png',
        },
        {
          id: 'att-dm-vid1',
          type: 'video',
          name: 'design-walkthrough.mp4',
          url: '#video-demo-3',
          size: '42.1 MB',
          mimeType: 'video/mp4',
          videoDuration: '5:17',
          videoPosterUrl: 'https://images.unsplash.com/photo-1602973240044-ac77578f6dc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwbGF1bmNoJTIwYW5ub3VuY2VtZW50JTIwcmVjb3JkaW5nfGVufDF8fHx8MTc3MTQzMDI2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        },
      ],
    },
  ],
  'group-1': [
    {
      id: 'group-msg-1',
      userId: 'user-2',
      content: 'Team, we need to finalize the timeline for Project Alpha',
      timestamp: new Date('2026-02-14T10:00:00'),
    },
    {
      id: 'group-msg-2',
      userId: 'user-3',
      content: 'I think we can wrap up by end of next week',
      timestamp: new Date('2026-02-14T10:30:00'),
      reactions: [{ emoji: '👍', users: ['user-1', 'user-4'] }],
    },
    {
      id: 'group-msg-3',
      userId: 'user-4',
      content: 'Great progress today everyone!',
      timestamp: new Date('2026-02-14T11:00:00'),
    },
  ],
  'sre-general': [
    {
      id: 'sre-msg-1',
      userId: 'user-5',
      content: 'Heads up — payment-api error budget is burning faster than expected. Down to 18% remaining for the month. If we hit another incident we\'ll breach SLO.',
      timestamp: new Date('2026-02-16T08:30:00'),
      reactions: [{ emoji: '👀', users: ['user-1', 'user-3'] }],
      seenBy: ['user-1', 'user-3', 'user-4'],
    },
    {
      id: 'sre-msg-2',
      userId: 'user-3',
      content: 'I\'ve been looking at the order-service alerts from last night. Turns out the connection pool fix from v2.14.2 rollback is holding, but we should still get that `finally` block fix merged and deployed properly.',
      timestamp: new Date('2026-02-16T09:00:00'),
      threadCount: 4,
      threadPreview: 'Already have the PR up: #487...',
      seenBy: ['user-1', 'user-5'],
    },
    {
      id: 'sre-msg-3',
      userId: 'user-4',
      content: 'On-call handoff reminder: @Charlie Brown → @Alice Williams rotation starts Monday Feb 17. Please sync on any open items before EOD Friday.',
      timestamp: new Date('2026-02-16T09:15:00'),
      pinned: true,
      seenBy: ['user-1', 'user-3', 'user-5'],
    },
    {
      id: 'sre-msg-4',
      userId: 'user-2',
      content: 'Postmortem for INC-247 (Payment Service Outage) is drafted. Review link in #postmortems. Blameless review meeting scheduled for Wednesday 10 AM.',
      timestamp: new Date('2026-02-16T10:45:00'),
      reactions: [{ emoji: '📝', users: ['user-1', 'user-5'] }, { emoji: '👍', users: ['user-3'] }],
    },
  ],
  'sre-alerts': [
    {
      id: 'sre-alert-1',
      userId: 'user-5',
      content: '🔴 **P1 RESOLVED** — INC-2026-0247: Payment Service Complete Outage\n\n- **Duration:** 55 min (14:02 – 14:57)\n- **Root cause:** Connection pool leak in v2.14.3 payment-retry logic\n- **Resolution:** Rolled back to v2.14.2\n- **Impact:** ~12,400 users, $0 revenue loss (orders queued)\n- **Action items:** 3 follow-ups assigned',
      timestamp: new Date('2026-02-16T14:57:00'),
      pinned: true,
      reactions: [{ emoji: '✅', users: ['user-1', 'user-2', 'user-3', 'user-4'] }],
      seenBy: ['user-1', 'user-2', 'user-3', 'user-4'],
    },
    {
      id: 'sre-alert-2',
      userId: 'user-5',
      content: '🟡 **P2 MONITORING** — INC-2026-0248: Search Index Degraded Results\n\n- **Duration:** 3.5 hrs (ongoing monitoring)\n- **Root cause:** Unbounded reindex job saturating ES cluster\n- **Resolution:** Throttled reindex, resource limits applied\n- **Impact:** ~3,200 users, search latency elevated',
      timestamp: new Date('2026-02-16T15:00:00'),
      seenBy: ['user-1', 'user-3'],
    },
  ],
  'sre-infra': [
    {
      id: 'sre-infra-1',
      userId: 'user-3',
      content: 'Kubernetes cluster autoscaler kicked in overnight — scaled API pods from 8 → 14 during the traffic spike at 02:30 UTC. Scaled back down by 04:00. Logs look clean.',
      timestamp: new Date('2026-02-16T07:30:00'),
      seenBy: ['user-1', 'user-5'],
    },
    {
      id: 'sre-infra-2',
      userId: 'user-5',
      content: 'PostgreSQL read replica lag crept up to 800ms during the payment incident. Back to <50ms now. Adding an alert threshold at 500ms so we catch it earlier next time.',
      timestamp: new Date('2026-02-16T08:15:00'),
      reactions: [{ emoji: '👍', users: ['user-3'] }],
    },
    {
      id: 'sre-infra-3',
      userId: 'user-4',
      content: 'SSL cert for `api.internal.company.com` renews in 14 days. Cert-manager should handle it automatically but flagging just in case. Last auto-renewal worked fine.',
      timestamp: new Date('2026-02-16T09:40:00'),
    },
  ],
};

export const threads: Record<string, Thread> = {
  'msg-1': {
    id: 'thread-1',
    parentMessageId: 'msg-1',
    messages: [
      {
        id: 'thread-msg-1',
        userId: 'user-3',
        content: 'Thanks for the welcome! Loving it so far.',
        timestamp: new Date('2026-02-14T09:05:00'),
      },
      {
        id: 'thread-msg-2',
        userId: 'user-4',
        content: 'The threading feature is really nice!',
        timestamp: new Date('2026-02-14T09:10:00'),
        reactions: [{ emoji: '💯', users: ['user-2'] }],
      },
      {
        id: 'thread-msg-3',
        userId: 'user-2',
        content: 'Glad you like it! Let me know if you have any questions.',
        timestamp: new Date('2026-02-14T09:12:00'),
      },
    ],
  },
  'msg-2': {
    id: 'thread-2',
    parentMessageId: 'msg-2',
    messages: [
      {
        id: 'thread2-msg-1',
        userId: 'user-2',
        content: 'Yes, it\'s in the documents section under "Company Policies".',
        timestamp: new Date('2026-02-14T09:18:00'),
      },
      {
        id: 'thread2-msg-2',
        userId: 'user-4',
        content: 'I saw it earlier — the new PTO policy looks great.',
        timestamp: new Date('2026-02-14T09:22:00'),
      },
      {
        id: 'thread2-msg-3',
        userId: 'user-1',
        content: 'Make sure to check the updated remote work section too.',
        timestamp: new Date('2026-02-14T09:25:00'),
        reactions: [{ emoji: '👍', users: ['user-3'] }],
      },
      {
        id: 'thread2-msg-4',
        userId: 'user-5',
        content: 'Is the expense reimbursement policy also updated?',
        timestamp: new Date('2026-02-14T09:30:00'),
      },
      {
        id: 'thread2-msg-5',
        userId: 'user-2',
        content: 'Not yet — that one is planned for next month. I\'ll ping you when it\'s ready.',
        timestamp: new Date('2026-02-14T09:35:00'),
      },
    ],
  },
  'msg-5': {
    id: 'thread-5',
    parentMessageId: 'msg-5',
    messages: [
      {
        id: 'thread5-msg-1',
        userId: 'user-2',
        content: 'I can take a look at the logs. Which endpoint exactly?',
        timestamp: new Date('2026-02-14T09:05:00'),
      },
      {
        id: 'thread5-msg-2',
        userId: 'user-3',
        content: 'The `/api/v2/users/search` endpoint. P95 latency spiked to 1.2s after the last deploy.',
        timestamp: new Date('2026-02-14T09:08:00'),
      },
      {
        id: 'thread5-msg-3',
        userId: 'user-5',
        content: 'Looks like the new query planner is choosing a seq scan on the `users` table. Missing index on `display_name`.',
        timestamp: new Date('2026-02-14T09:15:00'),
        reactions: [{ emoji: '🔍', users: ['user-3'] }],
      },
      {
        id: 'thread5-msg-4',
        userId: 'user-1',
        content: 'Can we add the index in a non-blocking migration? Don\'t want downtime.',
        timestamp: new Date('2026-02-14T09:18:00'),
      },
      {
        id: 'thread5-msg-5',
        userId: 'user-5',
        content: 'Yes — `CREATE INDEX CONCURRENTLY` will handle it. Already drafted the migration.',
        timestamp: new Date('2026-02-14T09:22:00'),
      },
      {
        id: 'thread5-msg-6',
        userId: 'user-4',
        content: 'Nice catch. Should we also add monitoring for slow queries above 500ms?',
        timestamp: new Date('2026-02-14T09:25:00'),
      },
      {
        id: 'thread5-msg-7',
        userId: 'user-2',
        content: 'Good idea. I\'ll add a Grafana alert for it.',
        timestamp: new Date('2026-02-14T09:28:00'),
        reactions: [{ emoji: '🚀', users: ['user-4', 'user-3'] }],
      },
      {
        id: 'thread5-msg-8',
        userId: 'user-3',
        content: 'PR is up: #482. @Charlie review when you can. Marking this resolved for now.',
        timestamp: new Date('2026-02-14T09:35:00'),
        reactions: [{ emoji: '✅', users: ['user-1', 'user-5'] }],
      },
    ],
  },
  'msg-8': {
    id: 'thread-8',
    parentMessageId: 'msg-8',
    messages: [
      {
        id: 'thread8-msg-1',
        userId: 'user-3',
        content: 'I can help unblock the infra side. The Terraform module just needs the new IAM role added.',
        timestamp: new Date('2026-02-14T13:10:00'),
      },
      {
        id: 'thread8-msg-2',
        userId: 'user-2',
        content: 'That would be great — the OAuth flow is mostly done but we need the callback URL whitelisted on the load balancer too.',
        timestamp: new Date('2026-02-14T13:15:00'),
      },
      {
        id: 'thread8-msg-3',
        userId: 'user-5',
        content: 'Done! IAM role created and callback URL added to ALB. You should be unblocked now.',
        timestamp: new Date('2026-02-14T13:30:00'),
        reactions: [{ emoji: '🎉', users: ['user-2', 'user-3'] }],
      },
    ],
  },
  'sre-msg-2': {
    id: 'thread-sre-2',
    parentMessageId: 'sre-msg-2',
    messages: [
      {
        id: 'thread-sre2-msg-1',
        userId: 'user-5',
        content: 'Already have the PR up: #487. It adds the missing `finally` block to close connections properly.',
        timestamp: new Date('2026-02-16T09:10:00'),
      },
      {
        id: 'thread-sre2-msg-2',
        userId: 'user-1',
        content: 'Reviewed and approved. Let\'s get this into the next hotfix release.',
        timestamp: new Date('2026-02-16T09:20:00'),
        reactions: [{ emoji: '👍', users: ['user-3'] }],
      },
      {
        id: 'thread-sre2-msg-3',
        userId: 'user-4',
        content: 'Should we add a circuit breaker around the connection pool as a safety net?',
        timestamp: new Date('2026-02-16T09:30:00'),
      },
      {
        id: 'thread-sre2-msg-4',
        userId: 'user-3',
        content: 'Good idea. I\'ll add that as a follow-up ticket. For now let\'s ship the hotfix and monitor.',
        timestamp: new Date('2026-02-16T09:40:00'),
        reactions: [{ emoji: '✅', users: ['user-1', 'user-5'] }],
      },
    ],
  },
};

export const documents: Document[] = [
  {
    id: 'doc-1',
    title: 'Q1 2026 Company Goals',
    emoji: '🎯',
    author: 'Jane Smith',
    authorId: 'user-2',
    lastModified: new Date('2026-02-16T14:30:00'),
    createdAt: new Date('2026-01-05T09:00:00'),
    type: 'doc',
    favorite: true,
    securityLevel: 'B',
    content: [
      { id: 'b1', type: 'callout', content: 'This is a living document. Please add comments and suggestions inline.', calloutEmoji: '💡', calloutColor: 'blue' },
      { id: 'b2', type: 'heading2', content: 'Revenue Targets' },
      { id: 'b3', type: 'paragraph', content: 'Our primary revenue goal for Q1 2026 is to reach **$4.2M ARR**, representing a 35% increase from Q4 2025. This will be driven by expanding our enterprise tier and launching the self-serve freemium funnel.' },
      { id: 'b4', type: 'bullet', content: 'Grow enterprise accounts from 12 → 20' },
      { id: 'b5', type: 'bullet', content: 'Launch self-serve plan by end of February' },
      { id: 'b6', type: 'bullet', content: 'Reduce churn rate to below 3%' },
      { id: 'b7', type: 'divider' },
      { id: 'b8', type: 'heading2', content: 'Product Milestones' },
      { id: 'b9', type: 'todo', content: 'Ship OAuth 2.0 / SSO for enterprise', checked: true },
      { id: 'b10', type: 'todo', content: 'Launch real-time collaboration (multiplayer)', checked: true },
      { id: 'b11', type: 'todo', content: 'Deploy rate limiting & API gateway', checked: false },
      { id: 'b12', type: 'todo', content: 'Complete dashboard refactor v2', checked: false },
      { id: 'b13', type: 'todo', content: 'Mobile app beta (iOS + Android)', checked: false },
      { id: 'b14', type: 'heading2', content: 'Team Growth' },
      { id: 'b15', type: 'paragraph', content: 'We plan to add 4 new engineers and 2 designers to support the Q2 roadmap. Hiring pipeline should be finalized by mid-March.' },
      { id: 'b16', type: 'quote', content: 'The best way to predict the future is to create it. — Peter Drucker' },
    ],
  },
  {
    id: 'doc-2',
    title: 'Product Roadmap 2026',
    emoji: '🗺️',
    author: 'Bob Johnson',
    authorId: 'user-3',
    lastModified: new Date('2026-02-17T10:15:00'),
    createdAt: new Date('2026-01-10T11:00:00'),
    type: 'doc',
    favorite: true,
    securityLevel: 'B',
    content: [
      { id: 'r1', type: 'heading2', content: 'Vision' },
      { id: 'r2', type: 'paragraph', content: 'Build the **most intuitive enterprise collaboration platform** that teams actually love to use. We believe great tools should feel invisible — helping people focus on their work, not the tool itself.' },
      { id: 'r3', type: 'divider' },
      { id: 'r4', type: 'heading2', content: 'Q1 — Foundation' },
      { id: 'r5', type: 'table', rows: [
        ['Feature', 'Status', 'Owner', 'ETA'],
        ['SSO / SAML 2.0', '✅ Shipped', 'Bob J.', 'Jan 15'],
        ['Real-time collab', '✅ Shipped', 'Alice W.', 'Jan 28'],
        ['Rate limiting', '🟡 In Progress', 'Charlie B.', 'Feb 21'],
        ['Dashboard v2', '🟡 In Progress', 'Diana P.', 'Feb 28'],
        ['Mobile beta', '�� Not Started', 'Bob J.', 'Mar 15'],
      ]},
      { id: 'r6', type: 'heading2', content: 'Q2 — Growth' },
      { id: 'r7', type: 'bullet', content: 'AI-powered search across all spaces and documents' },
      { id: 'r8', type: 'bullet', content: 'Advanced permissions and role-based access control' },
      { id: 'r9', type: 'bullet', content: 'Third-party integrations (Jira, GitLab, Slack)' },
      { id: 'r10', type: 'bullet', content: 'Custom workflow automation builder' },
      { id: 'r11', type: 'heading2', content: 'Q3 — Scale' },
      { id: 'r12', type: 'bullet', content: 'Multi-region deployment (EU, APAC)' },
      { id: 'r13', type: 'bullet', content: 'SOC 2 Type II compliance' },
      { id: 'r14', type: 'bullet', content: 'Advanced analytics and usage insights dashboard' },
    ],
  },
  {
    id: 'doc-3',
    title: 'Engineering Team Metrics',
    emoji: '📊',
    author: 'Alice Williams',
    authorId: 'user-4',
    lastModified: new Date('2026-02-18T08:45:00'),
    createdAt: new Date('2026-01-15T14:00:00'),
    type: 'sheet',
    securityLevel: 'B',
    content: [
      { id: 'e1', type: 'callout', content: 'Updated weekly on Mondays. Last update: Feb 17, 2026.', calloutEmoji: '📅', calloutColor: 'green' },
      { id: 'e2', type: 'heading2', content: 'Sprint Velocity' },
      { id: 'e3', type: 'table', rows: [
        ['Sprint', 'Committed', 'Completed', 'Velocity'],
        ['Sprint 11', '34 pts', '31 pts', '91%'],
        ['Sprint 12', '38 pts', '35 pts', '92%'],
        ['Sprint 13', '40 pts', '37 pts', '93%'],
        ['Sprint 14 (current)', '42 pts', '18 pts', '43% (in progress)'],
      ]},
      { id: 'e4', type: 'heading2', content: 'Key Metrics' },
      { id: 'e5', type: 'bullet', content: '**Cycle time** (median): 3.2 days → target < 4 days ✅' },
      { id: 'e6', type: 'bullet', content: '**PR review time** (median): 6.5 hours → target < 8 hours ✅' },
      { id: 'e7', type: 'bullet', content: '**Deploy frequency**: 4.1 / week → target ≥ 3 / week ✅' },
      { id: 'e8', type: 'bullet', content: '**Bug escape rate**: 2.3% → target < 5% ✅' },
      { id: 'e9', type: 'heading2', content: 'Action Items' },
      { id: 'e10', type: 'todo', content: 'Set up automated deploy metrics dashboard', checked: false },
      { id: 'e11', type: 'todo', content: 'Review and close stale PRs (>7 days)', checked: true },
      { id: 'e12', type: 'todo', content: 'Implement automated E2E test pipeline', checked: false },
    ],
  },
  {
    id: 'doc-4',
    title: 'New Employee Onboarding',
    emoji: '👋',
    author: 'Jane Smith',
    authorId: 'user-2',
    lastModified: new Date('2026-02-11T11:20:00'),
    createdAt: new Date('2025-11-20T09:00:00'),
    type: 'doc',
    parentId: 'doc-8',
    securityLevel: 'C',
    content: [
      { id: 'o1', type: 'callout', content: 'Welcome to the team! This guide will help you get started in your first week.', calloutEmoji: '🎉', calloutColor: 'purple' },
      { id: 'o2', type: 'heading2', content: 'Day 1 Checklist' },
      { id: 'o3', type: 'todo', content: 'Set up your development environment', checked: false },
      { id: 'o4', type: 'todo', content: 'Join all required Slack channels and spaces', checked: false },
      { id: 'o5', type: 'todo', content: 'Meet your buddy (assigned in your welcome email)', checked: false },
      { id: 'o6', type: 'todo', content: 'Complete security training module', checked: false },
      { id: 'o7', type: 'heading2', content: 'First Week Goals' },
      { id: 'o8', type: 'numbered', content: 'Ship your first PR (a small bug fix or docs update)' },
      { id: 'o9', type: 'numbered', content: 'Attend all team standups and sprint planning' },
      { id: 'o10', type: 'numbered', content: 'Read through the architecture overview document' },
      { id: 'o11', type: 'numbered', content: 'Schedule 1:1s with your manager and team lead' },
      { id: 'o12', type: 'heading2', content: 'Useful Links' },
      { id: 'o13', type: 'bullet', content: '[GitLab Repository](https://gitlab.com) — main codebase' },
      { id: 'o14', type: 'bullet', content: '[Figma Designs](https://figma.com) — design files' },
      { id: 'o15', type: 'bullet', content: '[Internal Wiki](https://wiki.example.com) — documentation hub' },
    ],
  },
  {
    id: 'doc-5',
    title: 'API Design Guidelines',
    emoji: '⚡',
    author: 'Charlie Brown',
    authorId: 'user-5',
    lastModified: new Date('2026-02-14T09:00:00'),
    createdAt: new Date('2025-12-01T10:00:00'),
    type: 'doc',
    parentId: 'doc-8',
    securityLevel: 'A',
    content: [
      { id: 'a1', type: 'heading2', content: 'REST API Conventions' },
      { id: 'a2', type: 'paragraph', content: 'All APIs should follow RESTful conventions. Use nouns for resources, HTTP verbs for actions, and return proper status codes.' },
      { id: 'a3', type: 'code', content: 'GET    /api/v1/users          # List users\nGET    /api/v1/users/:id      # Get user\nPOST   /api/v1/users          # Create user\nPATCH  /api/v1/users/:id      # Update user\nDELETE /api/v1/users/:id      # Delete user', language: 'bash' },
      { id: 'a4', type: 'heading2', content: 'Error Response Format' },
      { id: 'a5', type: 'code', content: '{\n  "error": {\n    "code": "VALIDATION_ERROR",\n    "message": "Invalid email format",\n    "details": [\n      { "field": "email", "rule": "format" }\n    ]\n  }\n}', language: 'json' },
      { id: 'a6', type: 'heading2', content: 'Pagination' },
      { id: 'a7', type: 'paragraph', content: 'Use cursor-based pagination for all list endpoints. Each response should include `nextCursor` and `hasMore` fields.' },
      { id: 'a8', type: 'callout', content: 'Never use offset-based pagination for large datasets — it causes performance issues at scale.', calloutEmoji: '⚠️', calloutColor: 'yellow' },
    ],
  },
  {
    id: 'doc-6',
    title: 'Architecture Overview',
    emoji: '🏗️',
    author: 'Bob Johnson',
    authorId: 'user-3',
    lastModified: new Date('2026-02-15T16:00:00'),
    createdAt: new Date('2025-10-15T08:00:00'),
    type: 'doc',
    parentId: 'doc-8',
    securityLevel: 'A',
    content: [
      { id: 'ar1', type: 'heading2', content: 'System Overview' },
      { id: 'ar2', type: 'paragraph', content: 'Our platform uses a **microservices architecture** deployed on Kubernetes (AWS EKS). Each service communicates via gRPC internally and exposes REST APIs externally through an API gateway.' },
      { id: 'ar3', type: 'heading2', content: 'Core Services' },
      { id: 'ar4', type: 'table', rows: [
        ['Service', 'Language', 'Database', 'Purpose'],
        ['auth-service', 'Go', 'PostgreSQL', 'Authentication & authorization'],
        ['chat-service', 'Node.js', 'MongoDB + Redis', 'Real-time messaging'],
        ['file-service', 'Rust', 'S3 + PostgreSQL', 'File storage & processing'],
        ['search-service', 'Python', 'Elasticsearch', 'Full-text search'],
        ['notification-service', 'Go', 'Redis + SQS', 'Push & email notifications'],
      ]},
      { id: 'ar5', type: 'heading2', content: 'Infrastructure' },
      { id: 'ar6', type: 'bullet', content: '**CDN**: CloudFront with edge caching' },
      { id: 'ar7', type: 'bullet', content: '**Load Balancer**: ALB with WAF rules' },
      { id: 'ar8', type: 'bullet', content: '**Monitoring**: Grafana + PagerDuty' },
      { id: 'ar9', type: 'bullet', content: '**CI/CD**: GitLab CI/CD → ArgoCD' },
    ],
  },
  {
    id: 'doc-7',
    title: 'Sprint 14 Retro Notes',
    emoji: '🔄',
    author: 'Diana Prince',
    authorId: 'user-6',
    lastModified: new Date('2026-02-18T11:00:00'),
    createdAt: new Date('2026-02-18T10:00:00'),
    type: 'doc',
    securityLevel: 'C',
    content: [
      { id: 'sr1', type: 'heading2', content: '🟢 What went well' },
      { id: 'sr2', type: 'bullet', content: 'OAuth flow shipped on time with zero critical bugs' },
      { id: 'sr3', type: 'bullet', content: 'Great collaboration between frontend and backend teams' },
      { id: 'sr4', type: 'bullet', content: 'Improved PR review turnaround time' },
      { id: 'sr5', type: 'heading2', content: '🟡 What could improve' },
      { id: 'sr6', type: 'bullet', content: 'Sprint scope creep — 3 unplanned items added mid-sprint' },
      { id: 'sr7', type: 'bullet', content: 'E2E tests still run too slowly (> 12 min)' },
      { id: 'sr8', type: 'bullet', content: 'Need better documentation for new API endpoints' },
      { id: 'sr9', type: 'heading2', content: '🔴 Action items' },
      { id: 'sr10', type: 'todo', content: 'Enforce sprint scope freeze after day 2', checked: false },
      { id: 'sr11', type: 'todo', content: 'Parallelize E2E test suite', checked: false },
      { id: 'sr12', type: 'todo', content: 'Add API docs as PR checklist item', checked: false },
    ],
  },
  {
    id: 'doc-8',
    title: 'Engineering Wiki',
    emoji: '📚',
    author: 'Bob Johnson',
    authorId: 'user-3',
    lastModified: new Date('2026-02-10T09:00:00'),
    createdAt: new Date('2025-09-01T08:00:00'),
    type: 'doc',
    securityLevel: 'C',
    content: [
      { id: 'w1', type: 'paragraph', content: 'Central hub for all engineering documentation. Browse the sub-pages below to find what you need.' },
      { id: 'w2', type: 'callout', content: 'If something is missing or outdated, please update it! This is a team effort.', calloutEmoji: '🤝', calloutColor: 'green' },
    ],
  },
  {
    id: 'doc-9',
    title: 'Design System v2',
    emoji: '🎨',
    author: 'Alice Williams',
    authorId: 'user-4',
    lastModified: new Date('2026-02-13T14:30:00'),
    createdAt: new Date('2025-12-15T10:00:00'),
    type: 'doc',
    securityLevel: 'C',
    content: [
      { id: 'ds1', type: 'heading2', content: 'Color Palette' },
      { id: 'ds2', type: 'paragraph', content: 'Our design system uses a carefully curated color palette that works across light and dark modes. The primary brand color is **#5b5fc7** (Indigo 500).' },
      { id: 'ds3', type: 'heading2', content: 'Typography Scale' },
      { id: 'ds4', type: 'table', rows: [
        ['Token', 'Size', 'Weight', 'Use Case'],
        ['display-lg', '36px', '700', 'Page headers'],
        ['heading-md', '20px', '600', 'Section titles'],
        ['body-md', '14px', '400', 'Body text'],
        ['caption', '12px', '400', 'Labels, captions'],
        ['code', '13px', '400', 'Code blocks, monospace'],
      ]},
      { id: 'ds5', type: 'heading2', content: 'Component Principles' },
      { id: 'ds6', type: 'numbered', content: '**Consistency** — Every component follows the same spacing and radius tokens' },
      { id: 'ds7', type: 'numbered', content: '**Accessibility** — WCAG AA minimum, AAA preferred' },
      { id: 'ds8', type: 'numbered', content: '**Composability** — Components are building blocks, not monoliths' },
    ],
  },
  {
    id: 'doc-10',
    title: 'Meeting Notes — Feb 18',
    emoji: '📝',
    author: 'John Doe',
    authorId: 'user-1',
    lastModified: new Date('2026-02-18T15:00:00'),
    createdAt: new Date('2026-02-18T14:00:00'),
    type: 'doc',
    securityLevel: 'C',
    content: [
      { id: 'mn1', type: 'paragraph', content: '**Attendees**: John, Jane, Bob, Alice, Charlie, Diana' },
      { id: 'mn2', type: 'divider' },
      { id: 'mn3', type: 'heading2', content: 'Agenda' },
      { id: 'mn4', type: 'numbered', content: 'Sprint 14 progress review' },
      { id: 'mn5', type: 'numbered', content: 'Rate limiter rollout plan' },
      { id: 'mn6', type: 'numbered', content: 'Mobile beta timeline discussion' },
      { id: 'mn7', type: 'heading2', content: 'Decisions' },
      { id: 'mn8', type: 'bullet', content: 'Rate limiter will use token bucket algorithm' },
      { id: 'mn9', type: 'bullet', content: 'Mobile beta launch pushed to March 15' },
      { id: 'mn10', type: 'bullet', content: 'Need one more senior hire before Q2 kick-off' },
      { id: 'mn11', type: 'heading2', content: 'Follow-ups' },
      { id: 'mn12', type: 'todo', content: '@Bob: Draft mobile beta spec by Feb 21', checked: false },
      { id: 'mn13', type: 'todo', content: '@Alice: Finalize rate limiter load test results', checked: false },
      { id: 'mn14', type: 'todo', content: '@Jane: Post senior eng role on LinkedIn', checked: false },
    ],
  },
];

export const folders: Folder[] = [
  {
    id: 'folder-1',
    name: 'Design Assets',
    emoji: '🎨',
    createdAt: new Date('2026-01-10T08:00:00'),
    createdBy: 'Alice Williams',
    color: 'purple',
  },
  {
    id: 'folder-2',
    name: 'Sprint Deliverables',
    emoji: '📦',
    createdAt: new Date('2026-01-15T10:00:00'),
    createdBy: 'Bob Johnson',
    color: 'blue',
  },
  {
    id: 'folder-3',
    name: 'Marketing Materials',
    emoji: '📣',
    createdAt: new Date('2026-01-20T09:00:00'),
    createdBy: 'Jane Smith',
    color: 'green',
  },
  {
    id: 'folder-4',
    name: 'Legal & Compliance',
    emoji: '⚖️',
    createdAt: new Date('2026-01-25T11:00:00'),
    createdBy: 'Diana Prince',
    color: 'orange',
  },
  {
    id: 'folder-5',
    name: 'Wireframes',
    emoji: '✏️',
    parentId: 'folder-1',
    createdAt: new Date('2026-01-12T08:00:00'),
    createdBy: 'Alice Williams',
    color: 'purple',
  },
  {
    id: 'folder-6',
    name: 'Final Exports',
    emoji: '📤',
    parentId: 'folder-1',
    createdAt: new Date('2026-01-14T08:00:00'),
    createdBy: 'Alice Williams',
    color: 'purple',
  },
];

export const files: FileItem[] = [
  {
    id: 'file-1',
    name: 'design-mockups-v2.fig',
    size: '2.4 MB',
    uploadedBy: 'Alice Williams',
    uploadedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    uploadedAt: new Date('2026-02-14T08:30:00'),
    type: 'figma',
    folderId: 'folder-1',
    securityLevel: 'C',
  },
  {
    id: 'file-2',
    name: 'budget-proposal.pdf',
    size: '856 KB',
    uploadedBy: 'Jane Smith',
    uploadedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    uploadedAt: new Date('2026-02-13T15:20:00'),
    type: 'pdf',
    securityLevel: 'A',
  },
  {
    id: 'file-3',
    name: 'team-photo.jpg',
    size: '3.2 MB',
    uploadedBy: 'Bob Johnson',
    uploadedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    uploadedAt: new Date('2026-02-12T12:00:00'),
    type: 'image',
    securityLevel: 'C',
  },
  {
    id: 'file-4',
    name: 'api-documentation.zip',
    size: '1.1 MB',
    uploadedBy: 'Charlie Brown',
    uploadedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    uploadedAt: new Date('2026-02-11T09:45:00'),
    type: 'archive',
    securityLevel: 'A',
  },
  {
    id: 'file-5',
    name: 'sprint-14-demo.mp4',
    size: '48.3 MB',
    uploadedBy: 'Bob Johnson',
    uploadedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    uploadedAt: new Date('2026-02-17T14:00:00'),
    type: 'video',
    folderId: 'folder-2',
    securityLevel: 'C',
  },
  {
    id: 'file-6',
    name: 'release-notes-v3.2.md',
    size: '24 KB',
    uploadedBy: 'Charlie Brown',
    uploadedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    uploadedAt: new Date('2026-02-16T10:00:00'),
    type: 'markdown',
    folderId: 'folder-2',
    securityLevel: 'C',
  },
  {
    id: 'file-7',
    name: 'logo-dark.svg',
    size: '12 KB',
    uploadedBy: 'Alice Williams',
    uploadedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    uploadedAt: new Date('2026-02-10T16:00:00'),
    type: 'svg',
    folderId: 'folder-6',
    securityLevel: 'B',
  },
  {
    id: 'file-8',
    name: 'logo-light.svg',
    size: '11 KB',
    uploadedBy: 'Alice Williams',
    uploadedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    uploadedAt: new Date('2026-02-10T16:05:00'),
    type: 'svg',
    folderId: 'folder-6',
    securityLevel: 'B',
  },
  {
    id: 'file-9',
    name: 'homepage-wireframe-v3.fig',
    size: '5.1 MB',
    uploadedBy: 'Alice Williams',
    uploadedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    uploadedAt: new Date('2026-02-08T11:00:00'),
    type: 'figma',
    folderId: 'folder-5',
    securityLevel: 'C',
  },
  {
    id: 'file-10',
    name: 'NDA-template.docx',
    size: '145 KB',
    uploadedBy: 'Diana Prince',
    uploadedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
    uploadedAt: new Date('2026-02-05T09:30:00'),
    type: 'doc',
    folderId: 'folder-4',
    securityLevel: 'A',
  },
  {
    id: 'file-11',
    name: 'brand-guidelines.pdf',
    size: '6.8 MB',
    uploadedBy: 'Jane Smith',
    uploadedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    uploadedAt: new Date('2026-02-09T13:00:00'),
    type: 'pdf',
    folderId: 'folder-3',
    securityLevel: 'B',
  },
  {
    id: 'file-12',
    name: 'pitch-deck-Q1.pptx',
    size: '14.2 MB',
    uploadedBy: 'Jane Smith',
    uploadedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    uploadedAt: new Date('2026-02-15T08:45:00'),
    type: 'presentation',
    folderId: 'folder-3',
    securityLevel: 'B',
  },
];

export const tasks: Task[] = [
  // === BACKLOG (not in sprint) ===
  {
    id: 'task-b1',
    title: 'Implement SSO with SAML 2.0',
    description: 'Add enterprise SSO support using SAML 2.0 protocol for corporate clients.',
    assigneeId: 'user-3',
    assignee: 'Bob Johnson',
    status: 'backlog',
    priority: 'high',
    type: 'story',
    storyPoints: 13,
    epic: 'Auth & Security',
    epicColor: 'purple',
    labels: ['enterprise', 'security'],
    dueDate: new Date('2026-03-05T00:00:00'),
    createdAt: new Date('2026-02-05T10:00:00'),
    subtasks: [
      { id: 'st-b1-1', title: 'Research SAML libraries', done: true },
      { id: 'st-b1-2', title: 'Design SSO flow', done: false },
      { id: 'st-b1-3', title: 'Implement IdP integration', done: false },
      { id: 'st-b1-4', title: 'Write integration tests', done: false },
    ],
  },
  {
    id: 'task-b2',
    title: 'Evaluate GraphQL Federation',
    description: 'Spike to evaluate Apollo Federation v2 for our microservices architecture.',
    assigneeId: 'user-5',
    assignee: 'Charlie Brown',
    status: 'backlog',
    priority: 'medium',
    type: 'spike',
    storyPoints: 5,
    epic: 'API Platform',
    epicColor: 'blue',
    labels: ['research', 'architecture'],
    dueDate: new Date('2026-03-10T00:00:00'),
    createdAt: new Date('2026-02-06T09:00:00'),
  },
  {
    id: 'task-b3',
    title: 'Design system v2 token migration',
    description: 'Migrate all components to use the new design token system.',
    assigneeId: 'user-4',
    assignee: 'Alice Williams',
    status: 'backlog',
    priority: 'medium',
    type: 'story',
    storyPoints: 8,
    epic: 'Frontend Refresh',
    epicColor: 'green',
    labels: ['design-system', 'ui'],
    dueDate: new Date('2026-03-15T00:00:00'),
    createdAt: new Date('2026-02-07T11:00:00'),
    subtasks: [
      { id: 'st-b3-1', title: 'Audit existing tokens', done: true },
      { id: 'st-b3-2', title: 'Create mapping document', done: true },
      { id: 'st-b3-3', title: 'Update core components', done: false },
      { id: 'st-b3-4', title: 'Update page layouts', done: false },
      { id: 'st-b3-5', title: 'Visual regression tests', done: false },
    ],
  },
  {
    id: 'task-b4',
    title: 'Memory leak in WebSocket handler',
    description: 'Production memory usage grows over time in the WS connection manager.',
    assigneeId: 'user-3',
    assignee: 'Bob Johnson',
    status: 'backlog',
    priority: 'high',
    type: 'bug',
    storyPoints: 5,
    epic: 'Performance',
    epicColor: 'orange',
    labels: ['production', 'memory'],
    dueDate: new Date('2026-02-28T00:00:00'),
    createdAt: new Date('2026-02-08T14:00:00'),
  },
  // === TO DO (in sprint) ===
  {
    id: 'task-1',
    title: 'Migrate database to Postgres 16',
    description: 'Upgrade from Postgres 14 to 16 for improved performance and new features.',
    assigneeId: 'user-3',
    assignee: 'Bob Johnson',
    status: 'todo',
    priority: 'high',
    type: 'story',
    storyPoints: 5,
    epic: 'Tech Debt',
    epicColor: 'red',
    sprint: 'Sprint 14',
    labels: ['database', 'infrastructure'],
    dueDate: new Date('2026-02-20T00:00:00'),
    createdAt: new Date('2026-02-10T08:00:00'),
    subtasks: [
      { id: 'st-1-1', title: 'Create migration plan', done: true },
      { id: 'st-1-2', title: 'Test on staging', done: false },
      { id: 'st-1-3', title: 'Run migration', done: false },
      { id: 'st-1-4', title: 'Verify data integrity', done: false },
    ],
  },
  {
    id: 'task-2',
    title: 'Add real-time notifications API',
    description: 'Build WebSocket-based notification system for real-time push events.',
    assigneeId: 'user-4',
    assignee: 'Alice Williams',
    status: 'todo',
    priority: 'medium',
    type: 'story',
    storyPoints: 8,
    epic: 'API Platform',
    epicColor: 'blue',
    sprint: 'Sprint 14',
    labels: ['api', 'real-time'],
    dueDate: new Date('2026-02-21T00:00:00'),
    createdAt: new Date('2026-02-10T08:30:00'),
    subtasks: [
      { id: 'st-2-1', title: 'Design event schema', done: true },
      { id: 'st-2-2', title: 'Implement WS server', done: false },
      { id: 'st-2-3', title: 'Client SDK integration', done: false },
      { id: 'st-2-4', title: 'Load test WS connections', done: false },
    ],
  },
  {
    id: 'task-3',
    title: 'Write E2E tests for checkout flow',
    description: 'Add Playwright E2E tests covering the complete checkout and payment flow.',
    assigneeId: 'user-2',
    assignee: 'Jane Smith',
    status: 'todo',
    priority: 'medium',
    type: 'task',
    storyPoints: 3,
    epic: 'Auth & Security',
    epicColor: 'purple',
    sprint: 'Sprint 14',
    labels: ['testing', 'e2e'],
    dueDate: new Date('2026-02-19T00:00:00'),
    createdAt: new Date('2026-02-10T09:00:00'),
  },
  {
    id: 'task-4',
    title: 'Fix timezone rendering in calendar',
    description: 'Calendar events display in wrong timezone for users in non-UTC zones.',
    assigneeId: 'user-5',
    assignee: 'Charlie Brown',
    status: 'todo',
    priority: 'low',
    type: 'bug',
    storyPoints: 2,
    epic: 'Frontend Refresh',
    epicColor: 'green',
    sprint: 'Sprint 14',
    labels: ['bug', 'calendar'],
    dueDate: new Date('2026-02-20T00:00:00'),
    createdAt: new Date('2026-02-11T10:00:00'),
  },
  // === IN PROGRESS ===
  {
    id: 'task-5',
    title: 'Implement OAuth 2.0 flow',
    description: 'Add OAuth 2.0 authentication with PKCE for third-party integrations.',
    assigneeId: 'user-3',
    assignee: 'Bob Johnson',
    status: 'in-progress',
    priority: 'critical',
    type: 'story',
    storyPoints: 8,
    epic: 'Auth & Security',
    epicColor: 'purple',
    sprint: 'Sprint 14',
    labels: ['auth', 'oauth', 'security'],
    dueDate: new Date('2026-02-19T00:00:00'),
    createdAt: new Date('2026-02-10T08:00:00'),
    subtasks: [
      { id: 'st-5-1', title: 'Authorization endpoint', done: true },
      { id: 'st-5-2', title: 'Token exchange flow', done: true },
      { id: 'st-5-3', title: 'PKCE implementation', done: true },
      { id: 'st-5-4', title: 'Refresh token rotation', done: false },
      { id: 'st-5-5', title: 'Scope management UI', done: false },
    ],
    pullRequestUrl: '#pr-142',
  },
  {
    id: 'task-6',
    title: 'API rate limiting middleware',
    description: 'Implement token-bucket rate limiting with Redis for all API endpoints.',
    assigneeId: 'user-5',
    assignee: 'Charlie Brown',
    status: 'in-progress',
    priority: 'high',
    type: 'story',
    storyPoints: 5,
    epic: 'API Platform',
    epicColor: 'blue',
    sprint: 'Sprint 14',
    labels: ['api', 'middleware', 'redis'],
    dueDate: new Date('2026-02-19T00:00:00'),
    createdAt: new Date('2026-02-10T09:00:00'),
    subtasks: [
      { id: 'st-6-1', title: 'Redis integration', done: true },
      { id: 'st-6-2', title: 'Token bucket algorithm', done: true },
      { id: 'st-6-3', title: 'Rate limit headers', done: false },
      { id: 'st-6-4', title: 'Dashboard metrics', done: false },
    ],
    pullRequestUrl: '#pr-138',
  },
  {
    id: 'task-7',
    title: 'Fix pagination edge case',
    description: 'Last page returns duplicate results when total count is a multiple of page size.',
    assigneeId: 'user-4',
    assignee: 'Alice Williams',
    status: 'in-progress',
    priority: 'medium',
    type: 'bug',
    storyPoints: 2,
    epic: 'API Platform',
    epicColor: 'blue',
    sprint: 'Sprint 14',
    labels: ['bug', 'pagination'],
    dueDate: new Date('2026-02-18T00:00:00'),
    createdAt: new Date('2026-02-12T10:00:00'),
    pullRequestUrl: '#pr-145',
  },
  {
    id: 'task-8',
    title: 'Set up Grafana APM integration',
    description: 'Configure Grafana APM tracing for all microservices and create monitoring dashboards.',
    assigneeId: 'user-1',
    assignee: 'John Doe',
    status: 'in-progress',
    priority: 'medium',
    type: 'task',
    storyPoints: 3,
    epic: 'Performance',
    epicColor: 'orange',
    sprint: 'Sprint 14',
    labels: ['monitoring', 'devops'],
    dueDate: new Date('2026-02-19T00:00:00'),
    createdAt: new Date('2026-02-11T08:00:00'),
    subtasks: [
      { id: 'st-8-1', title: 'Install DD agent', done: true },
      { id: 'st-8-2', title: 'Configure trace sampling', done: true },
      { id: 'st-8-3', title: 'Create dashboards', done: false },
    ],
  },
  // === IN REVIEW ===
  {
    id: 'task-9',
    title: 'Dashboard component refactor',
    description: 'Refactor dashboard widgets to use composition pattern and reduce prop drilling.',
    assigneeId: 'user-2',
    assignee: 'Jane Smith',
    status: 'in-review',
    priority: 'medium',
    type: 'story',
    storyPoints: 5,
    epic: 'Frontend Refresh',
    epicColor: 'green',
    sprint: 'Sprint 14',
    labels: ['refactor', 'dashboard'],
    dueDate: new Date('2026-02-18T00:00:00'),
    createdAt: new Date('2026-02-10T10:00:00'),
    subtasks: [
      { id: 'st-9-1', title: 'Extract widget base', done: true },
      { id: 'st-9-2', title: 'Composition API', done: true },
      { id: 'st-9-3', title: 'Migrate existing widgets', done: true },
      { id: 'st-9-4', title: 'Update tests', done: true },
    ],
    pullRequestUrl: '#pr-139',
  },
  {
    id: 'task-10',
    title: 'Fix CORS preflight caching',
    description: 'OPTIONS preflight responses not being cached, causing double requests.',
    assigneeId: 'user-3',
    assignee: 'Bob Johnson',
    status: 'in-review',
    priority: 'low',
    type: 'bug',
    storyPoints: 2,
    epic: 'API Platform',
    epicColor: 'blue',
    sprint: 'Sprint 14',
    labels: ['bug', 'cors', 'performance'],
    dueDate: new Date('2026-02-18T00:00:00'),
    createdAt: new Date('2026-02-12T14:00:00'),
    pullRequestUrl: '#pr-143',
  },
  // === DONE ===
  {
    id: 'task-11',
    title: 'Dashboard component tests',
    description: 'Add comprehensive unit tests for all dashboard components.',
    assigneeId: 'user-2',
    assignee: 'Jane Smith',
    status: 'done',
    priority: 'medium',
    type: 'task',
    storyPoints: 3,
    epic: 'Frontend Refresh',
    epicColor: 'green',
    sprint: 'Sprint 14',
    labels: ['testing'],
    dueDate: new Date('2026-02-17T00:00:00'),
    createdAt: new Date('2026-02-10T09:30:00'),
  },
  {
    id: 'task-12',
    title: 'Fix critical bug in payment system',
    description: 'Double-charge occurring when user retries after timeout. Critical production issue.',
    assigneeId: 'user-5',
    assignee: 'Charlie Brown',
    status: 'done',
    priority: 'critical',
    type: 'bug',
    storyPoints: 5,
    epic: 'Auth & Security',
    epicColor: 'purple',
    sprint: 'Sprint 14',
    labels: ['critical', 'payments', 'production'],
    dueDate: new Date('2026-02-15T00:00:00'),
    createdAt: new Date('2026-02-13T08:00:00'),
    pullRequestUrl: '#pr-136',
  },
  {
    id: 'task-13',
    title: 'Update CI/CD pipeline for Node 20',
    description: 'Migrate all CI jobs from Node 18 to Node 20 LTS.',
    assigneeId: 'user-3',
    assignee: 'Bob Johnson',
    status: 'done',
    priority: 'medium',
    type: 'task',
    storyPoints: 3,
    epic: 'Tech Debt',
    epicColor: 'red',
    sprint: 'Sprint 14',
    labels: ['ci-cd', 'infrastructure'],
    dueDate: new Date('2026-02-16T00:00:00'),
    createdAt: new Date('2026-02-10T11:00:00'),
    pullRequestUrl: '#pr-134',
  },
  {
    id: 'task-14',
    title: 'Implement dark mode toggle persistence',
    description: 'Save dark mode preference to user settings and sync across devices.',
    assigneeId: 'user-4',
    assignee: 'Alice Williams',
    status: 'done',
    priority: 'low',
    type: 'story',
    storyPoints: 2,
    epic: 'Frontend Refresh',
    epicColor: 'green',
    sprint: 'Sprint 14',
    labels: ['ui', 'dark-mode'],
    dueDate: new Date('2026-02-14T00:00:00'),
    createdAt: new Date('2026-02-10T08:00:00'),
  },
  {
    id: 'task-15',
    title: 'Add request logging middleware',
    description: 'Structured JSON logging for all API requests with correlation IDs.',
    assigneeId: 'user-1',
    assignee: 'John Doe',
    status: 'done',
    priority: 'medium',
    type: 'task',
    storyPoints: 3,
    epic: 'API Platform',
    epicColor: 'blue',
    sprint: 'Sprint 14',
    labels: ['logging', 'observability'],
    dueDate: new Date('2026-02-15T00:00:00'),
    createdAt: new Date('2026-02-10T09:00:00'),
    pullRequestUrl: '#pr-133',
  },
];

export const notifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'approval',
    title: 'Budget Approval Request',
    message: 'Alice Williams requested budget approval for Q2 marketing campaign ($12,500).',
    detail: 'The Marketing team is requesting $12,500 for the Q2 digital advertising campaign. This covers paid social media ads across LinkedIn, Twitter, and Google Ads. The projected ROI based on Q1 performance is 3.2x. The campaign is scheduled to run from April 1 through June 30, 2026.\n\nBreakdown:\n• LinkedIn Ads: $5,000\n• Google Ads: $4,500\n• Twitter/X Ads: $2,000\n• Creative Assets: $1,000\n\nPlease review and approve or provide feedback below.',
    from: 'Alice Williams',
    timestamp: new Date('2026-02-15T09:30:00'),
    read: false,
    formFields: [
      { label: 'Decision', type: 'select', options: ['Approve', 'Reject', 'Request Changes'], required: true },
      { label: 'Comments', type: 'textarea', required: false },
    ],
  },
  {
    id: 'notif-2',
    type: 'approval',
    title: 'PTO Request — Bob Johnson',
    message: 'Bob Johnson submitted a PTO request for Feb 24–28 (5 days).',
    detail: 'Bob Johnson has submitted a paid time off request:\n\n• Dates: February 24–28, 2026 (Monday–Friday)\n• Duration: 5 business days\n• Remaining PTO balance: 12 days\n• Coverage: Charlie Brown has agreed to cover urgent backend issues during this period.\n• Reason: Personal / Family\n\nAs Bob\'s direct manager, please approve or deny this request.',
    from: 'Bob Johnson',
    timestamp: new Date('2026-02-15T08:00:00'),
    read: false,
    formFields: [
      { label: 'Decision', type: 'select', options: ['Approve', 'Deny'], required: true },
      { label: 'Reason (if denied)', type: 'textarea', required: false },
    ],
  },
  {
    id: 'notif-3',
    type: 'admin',
    title: 'New Company Policy Published',
    message: 'The updated remote work policy has been published. Please review it before March 1st.',
    detail: 'Dear Team,\n\nWe are pleased to announce the updated Remote Work Policy, effective March 1, 2026. Key changes include:\n\n1. Flexible Hours: Core hours are now 10 AM – 3 PM in your local timezone. Outside of core hours, you may set your own schedule.\n\n2. In-Office Days: Teams are expected to be in-office a minimum of 2 days per week (down from 3). Your team lead will coordinate which days.\n\n3. Home Office Stipend: The annual home office stipend has been increased from $500 to $750.\n\n4. International Remote Work: Employees may now work from approved international locations for up to 4 weeks per year (up from 2 weeks).\n\nPlease read the full policy document in the Company HQ > Documents section and acknowledge receipt by March 1st.\n\nBest regards,\nHR Team',
    from: 'HR Department',
    timestamp: new Date('2026-02-14T16:30:00'),
    read: false,
  },
  {
    id: 'notif-4',
    type: 'security',
    title: 'Password Expiring Soon',
    message: 'Your password will expire in 7 days. Please update it to maintain access.',
    detail: 'Your current password was set on January 15, 2026 and is scheduled to expire on February 22, 2026 per company security policy.\n\nPassword requirements:\n• Minimum 12 characters\n• At least one uppercase letter\n• At least one number\n• At least one special character\n• Cannot reuse your last 5 passwords\n\nTo update your password, go to Settings > Security > Change Password.\n\nIf you have questions, contact the IT Help Desk at helpdesk@company.com.',
    from: 'IT Security',
    timestamp: new Date('2026-02-14T14:20:00'),
    read: false,
  },
  {
    id: 'notif-5',
    type: 'invite',
    title: 'Space Invitation — Product',
    message: 'Jane Smith invited you to join the "Product" space.',
    detail: 'You\'ve been invited to join the Product space by Jane Smith (Product Manager).\n\nThe Product space is where the product team collaborates on:\n• Product roadmap planning\n• Feature specifications\n• User research findings\n• Sprint planning and retrospectives\n\nChannels included:\n• #general — Team announcements and discussions\n• #roadmap — Product roadmap updates\n• #research — User research and feedback\n• #sprints — Sprint planning and tracking\n\nYou can accept or decline this invitation.',
    from: 'Jane Smith',
    timestamp: new Date('2026-02-14T10:00:00'),
    read: false,
    formFields: [
      { label: 'Response', type: 'select', options: ['Accept Invitation', 'Decline Invitation'], required: true },
      { label: 'Message to Jane (optional)', type: 'text', required: false },
    ],
  },
  {
    id: 'notif-6',
    type: 'update',
    title: 'App Update — v2.4.0',
    message: 'Version 2.4.0 is now available with improved performance and new emoji reactions.',
    detail: 'What\'s New in v2.4.0:\n\n✦ Performance Improvements\n  — Chat messages now load 40% faster\n  — Reduced memory usage for large channels\n  — Smoother scrolling in thread views\n\n✦ New Features\n  — Expanded emoji reaction picker with 200+ new emojis\n  — Message scheduling: compose now, send later\n  — Pinned messages now show in a dedicated sidebar panel\n  — Keyboard shortcut Ctrl+K for quick channel switching\n\n✦ Bug Fixes\n  — Fixed notification badge not clearing on read\n  — Fixed dark mode contrast issues in document viewer\n  — Resolved file upload timeout for large files\n\nThe update will be applied automatically during the next maintenance window.',
    from: 'Platform Team',
    timestamp: new Date('2026-02-13T18:00:00'),
    read: true,
  },
  {
    id: 'notif-7',
    type: 'system',
    title: 'Scheduled Maintenance',
    message: 'The platform will undergo maintenance on Feb 16, 2:00–4:00 AM UTC.',
    detail: 'Scheduled Maintenance Notice\n\nDate: Sunday, February 16, 2026\nTime: 2:00 AM – 4:00 AM UTC\nExpected Downtime: Up to 30 minutes during the window\n\nWhat\'s being done:\n• Database optimization and index rebuilding\n• Security patch deployment\n• SSL certificate renewal\n• Infrastructure scaling for Q1 growth\n\nWhat to expect:\n• Brief periods of unavailability (est. 15–30 min)\n• Active sessions may be disconnected\n• All data is preserved; no action needed from users\n\nStatus page: status.company.com\n\nWe apologize for any inconvenience.',
    from: 'DevOps Team',
    timestamp: new Date('2026-02-13T11:45:00'),
    read: true,
  },
  {
    id: 'notif-8',
    type: 'approval',
    title: 'Access Request — Staging Environment',
    message: 'Charlie Brown requested access to the staging deployment environment.',
    detail: 'Access Request Details:\n\n• Requester: Charlie Brown (Senior Engineer)\n• Resource: Staging Deployment Environment (staging.internal.company.com)\n• Access Level: Read + Deploy\n• Justification: "Need staging access to test payment gateway integration before production release scheduled for Feb 20."\n• Duration: Permanent\n• Manager Approval: Pending (you)\n\nSecurity Note: This grants SSH access and CI/CD pipeline deployment permissions to the staging cluster.',
    from: 'Charlie Brown',
    timestamp: new Date('2026-02-13T09:15:00'),
    read: true,
    formFields: [
      { label: 'Decision', type: 'select', options: ['Grant Access', 'Deny Access', 'Grant Temporary (30 days)'], required: true },
      { label: 'Security Notes', type: 'textarea', required: false },
    ],
  },
];

export const spacePosts: Record<string, SpacePost[]> = {
  general: [
    {
      id: 'post-1',
      userId: 'user-2',
      content: '## Remote Work Policy Update\n\nHi everyone! The updated remote work policy is now live. Key changes:\n\n- **Core hours** reduced to 10 AM – 3 PM\n- **In-office days** reduced from 3 to 2 per week\n- **Home office stipend** increased to $750/year\n- International remote work extended to **4 weeks/year**\n\nPlease review the full document in the Documents section and acknowledge by March 1st. Questions? Drop them below!',
      timestamp: new Date('2026-02-16T09:00:00'),
      pinned: true,
      pinnedBy: 'user-2',
      likes: ['user-1', 'user-3', 'user-4', 'user-5'],
      comments: [
        { id: 'pc-1', userId: 'user-4', content: 'Love the extended international remote work policy! Great update.', timestamp: new Date('2026-02-16T09:15:00'), likes: ['user-1', 'user-2'] },
        { id: 'pc-2', userId: 'user-3', content: 'Does the home office stipend stack with equipment from IT?', timestamp: new Date('2026-02-16T09:20:00'), likes: ['user-5'] },
        { id: 'pc-3', userId: 'user-2', content: '@Bob Johnson — yes, they are separate budgets. IT equipment requests go through the normal ticket process.', timestamp: new Date('2026-02-16T09:25:00'), likes: ['user-3'] },
      ],
      tags: ['policy', 'remote-work', 'hr'],
      attachments: [
        { id: 'att-1', type: 'file', name: 'Remote_Work_Policy_v3.pdf', url: '#', size: '2.4 MB', mimeType: 'application/pdf' },
        { id: 'att-2', type: 'file', name: 'WFH_Stipend_Form.docx', url: '#', size: '340 KB', mimeType: 'application/docx' },
      ],
    },
    {
      id: 'post-2',
      userId: 'user-4',
      content: '## Q1 All-Hands Meeting\n\nJust a reminder that our Q1 All-Hands is scheduled for **March 5th at 2 PM EST**. Agenda includes:\n\n1. Company performance update\n2. Product roadmap preview\n3. Team spotlights\n4. Q&A with leadership\n\nCalendar invites have been sent. See you all there!',
      timestamp: new Date('2026-02-15T14:30:00'),
      pinned: true,
      pinnedBy: 'user-4',
      likes: ['user-1', 'user-2', 'user-5'],
      comments: [
        { id: 'pc-4', userId: 'user-1', content: 'Will this be recorded for folks in different time zones?', timestamp: new Date('2026-02-15T14:45:00'), likes: ['user-3'] },
        { id: 'pc-5', userId: 'user-4', content: 'Yes! Recording will be available within 24 hours.', timestamp: new Date('2026-02-15T15:00:00'), likes: ['user-1'] },
      ],
      tags: ['all-hands', 'company'],
    },
    {
      id: 'post-3',
      userId: 'user-5',
      content: 'Shoutout to the Engineering team for hitting **99.97% uptime** this month! That\'s above our 99.95% SLO target. Great work on the infrastructure improvements and the new auto-scaling configuration. The MTTR improvements are really paying off.',
      timestamp: new Date('2026-02-16T11:00:00'),
      likes: ['user-1', 'user-2', 'user-3', 'user-4'],
      comments: [
        { id: 'pc-6', userId: 'user-3', content: 'Team effort! The new alerting pipeline made a huge difference.', timestamp: new Date('2026-02-16T11:15:00'), likes: ['user-5', 'user-1'] },
      ],
      tags: ['shoutout', 'engineering'],
    },
    {
      id: 'post-4',
      userId: 'user-1',
      content: 'Just completed the new employee onboarding flow redesign. Reduced the time-to-productivity from 5 days to 2 days based on our pilot group feedback. Here are some highlights:\n\n- Automated account provisioning\n- Interactive orientation checklist\n- Buddy system matching\n\nFull write-up in the Documents section.',
      timestamp: new Date('2026-02-15T10:00:00'),
      likes: ['user-2', 'user-4'],
      comments: [
        { id: 'pc-7', userId: 'user-2', content: 'This is amazing work! Can we apply similar automation to the offboarding process?', timestamp: new Date('2026-02-15T10:30:00'), likes: ['user-1'] },
        { id: 'pc-8', userId: 'user-4', content: 'The buddy system is a great touch. New hires have been raving about it.', timestamp: new Date('2026-02-15T11:00:00'), likes: ['user-1', 'user-2'] },
      ],
      tags: ['onboarding', 'process'],
      attachments: [
        { id: 'att-3', type: 'image', name: 'onboarding-flow-diagram.png', url: 'https://images.unsplash.com/photo-1759884247160-27b8465544b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjB0ZWFtJTIwY29sbGFib3JhdGlvbiUyMHdoaXRlYm9hcmR8ZW58MXx8fHwxNzcxMjEzMjI0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', size: '1.2 MB', mimeType: 'image/png' },
      ],
    },
    {
      id: 'post-5',
      userId: 'user-3',
      content: 'Weekend hackathon results are in! We had 8 teams participate and some incredible projects:\n\n1. **AI Meeting Summarizer** — auto-generates meeting notes from transcripts\n2. **Smart Office Booking** — ML-powered desk/room suggestions\n3. **Code Review Bot** — automated first-pass review with LLM\n\nWinning team gets lunch with the CTO next week. Congrats to all participants!',
      timestamp: new Date('2026-02-14T16:00:00'),
      likes: ['user-1', 'user-2', 'user-4', 'user-5'],
      comments: [
        { id: 'pc-9', userId: 'user-5', content: 'The AI Meeting Summarizer sounds incredible. Any plans to productize it?', timestamp: new Date('2026-02-14T16:20:00'), likes: ['user-3'] },
        { id: 'pc-10', userId: 'user-1', content: 'Great turnout this time! Let\'s make it quarterly.', timestamp: new Date('2026-02-14T16:30:00'), likes: ['user-3', 'user-4'] },
      ],
      tags: ['hackathon', 'innovation'],
    },
  ],
  engineering: [
    {
      id: 'post-eng-1',
      userId: 'user-2',
      content: '## Sprint 14 Kickoff\n\nSprint 14 is officially underway! Key focus areas this sprint:\n\n- **OAuth 2.0 implementation** — Bob is leading this\n- **API rate limiting** — Charlie on middleware\n- **Dashboard component tests** — coverage push\n- **Postgres 16 migration** — planning phase\n\nDaily standups at 9:30 AM. Sprint retro on Feb 19. Let\'s ship it!',
      timestamp: new Date('2026-02-10T09:00:00'),
      pinned: true,
      pinnedBy: 'user-2',
      likes: ['user-1', 'user-3', 'user-4', 'user-5'],
      comments: [
        { id: 'pc-eng-1', userId: 'user-3', content: 'Already started on the OAuth flow. Should have a draft PR by Wednesday.', timestamp: new Date('2026-02-10T09:15:00'), likes: ['user-2'] },
        { id: 'pc-eng-2', userId: 'user-5', content: 'The rate limiting work pairs nicely with the new SLO targets. Let me know if you need SRE input.', timestamp: new Date('2026-02-10T09:30:00'), likes: ['user-2', 'user-3'] },
      ],
      tags: ['sprint', 'planning'],
    },
    {
      id: 'post-eng-2',
      userId: 'user-3',
      content: 'Just merged PR #477 — unit tests for the auth module! Coverage went from 62% to 89%. Here\'s the breakdown:\n\n- 42 new test cases added\n- Token refresh flow fully covered\n- Edge cases for expired sessions\n- Mocked external OAuth providers\n\nCI is green across all environments.',
      timestamp: new Date('2026-02-14T15:00:00'),
      likes: ['user-1', 'user-2', 'user-4'],
      comments: [
        { id: 'pc-eng-3', userId: 'user-2', content: 'Excellent work! This gives us much more confidence for the OAuth rollout.', timestamp: new Date('2026-02-14T15:10:00'), likes: ['user-3'] },
      ],
      tags: ['testing', 'auth', 'pr-merged'],
      attachments: [
        { id: 'att-5', type: 'image', name: 'test-coverage-report.png', url: 'https://images.unsplash.com/photo-1607971422532-73f9d45d7a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RlJTIwcHJvZ3JhbW1pbmclMjBsYXB0b3AlMjBkZXZlbG9wZXJ8ZW58MXx8fHwxNzcxMTIzNDA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', size: '560 KB', mimeType: 'image/png' },
      ],
    },
    {
      id: 'post-eng-3',
      userId: 'user-4',
      content: 'RFC: Proposing we move from REST to **GraphQL** for our internal dashboard APIs. Benefits:\n\n- Reduced over-fetching (dashboards currently make 8-12 REST calls)\n- Type-safe schema with auto-generated TypeScript types\n- Subscription support for real-time metrics\n\nI\'ve written up a detailed proposal in the Documents section. Would love feedback before the architecture review on Thursday.',
      timestamp: new Date('2026-02-13T11:00:00'),
      likes: ['user-1', 'user-5'],
      comments: [
        { id: 'pc-eng-4', userId: 'user-5', content: 'Interesting proposal. How does this affect our observability stack? GraphQL can be tricky to trace.', timestamp: new Date('2026-02-13T11:30:00'), likes: ['user-4'] },
        { id: 'pc-eng-5', userId: 'user-3', content: '+1 on the idea. We should evaluate Apollo vs Relay vs urql for the client side.', timestamp: new Date('2026-02-13T12:00:00'), likes: ['user-4', 'user-1'] },
        { id: 'pc-eng-6', userId: 'user-1', content: 'The over-fetching problem is real. I measured 340ms of unnecessary data transfer on the main dashboard last week.', timestamp: new Date('2026-02-13T14:00:00'), likes: ['user-4'] },
      ],
      tags: ['rfc', 'architecture', 'graphql'],
      attachments: [
        { id: 'att-vid-post-1', type: 'video', name: 'graphql-vs-rest-demo.mp4', url: '#video-post-demo', size: '34.2 MB', mimeType: 'video/mp4', videoDuration: '4:51', videoPosterUrl: 'https://images.unsplash.com/photo-1586381317467-392e3a1ba577?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRlbW8lMjBzY3JlZW4lMjByZWNvcmRpbmclMjBwcmVzZW50YXRpb258ZW58MXx8fHwxNzcxNDMwMjYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
      ],
    },
    {
      id: 'post-eng-4',
      userId: 'user-5',
      content: 'Deployed the new Kubernetes autoscaler config to production last night. Early results look great:\n\n- Scale-up time reduced from 4min to 90sec\n- Pod scheduling optimized with topology spread\n- Cost savings estimated at ~18% on compute\n\nMonitoring closely for the next 48 hours.',
      timestamp: new Date('2026-02-16T08:00:00'),
      likes: ['user-1', 'user-2', 'user-3'],
      comments: [],
      tags: ['devops', 'kubernetes', 'deployment'],
      attachments: [
        { id: 'att-4', type: 'image', name: 'k8s-autoscaler-metrics.png', url: 'https://images.unsplash.com/photo-1762163516269-3c143e04175c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXJ2ZXIlMjByYWNrJTIwZGF0YSUyMGNlbnRlciUyMGluZnJhc3RydWN0dXJlfGVufDF8fHx8MTc3MTIxMzIyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', size: '890 KB', mimeType: 'image/png' },
      ],
    },
  ],
  sre: [
    {
      id: 'post-sre-1',
      userId: 'user-5',
      content: '## On-Call Rotation Schedule — February\n\n| Week | Primary | Secondary |\n|------|---------|----------|\n| Feb 3–9 | Bob Johnson | Alice Williams |\n| Feb 10–16 | Charlie Brown | Bob Johnson |\n| **Feb 17–23** | **Alice Williams** | **Charlie Brown** |\n| Feb 24–Mar 2 | Jane Smith | Alice Williams |\n\nPlease ensure handoff notes are updated in the #on-call channel before each rotation. Escalation path remains the same: Primary → Secondary → Incident Commander pool.',
      timestamp: new Date('2026-02-03T09:00:00'),
      pinned: true,
      pinnedBy: 'user-5',
      likes: ['user-1', 'user-3', 'user-4'],
      comments: [
        { id: 'pc-sre-1', userId: 'user-4', content: 'Updated my calendar. Will sync with Charlie before my rotation starts Monday.', timestamp: new Date('2026-02-03T09:30:00'), likes: ['user-5'] },
      ],
      tags: ['on-call', 'schedule'],
    },
    {
      id: 'post-sre-2',
      userId: 'user-3',
      content: 'Postmortem published for INC-247 (Payment Service Outage). Key takeaways:\n\n- **Root cause**: Connection pool leak in v2.14.3 payment-retry logic\n- **Detection time**: 3 minutes (PagerDuty alert)\n- **Resolution**: Rolled back to v2.14.2\n- **Impact**: ~12,400 users affected, $0 revenue loss\n\n**Action items:**\n1. Add connection pool monitoring to Grafana\n2. Implement circuit breaker for retry logic\n3. Add integration test for connection exhaustion\n\nBlameless review meeting: Wednesday 10 AM.',
      timestamp: new Date('2026-02-16T10:00:00'),
      likes: ['user-1', 'user-2', 'user-4', 'user-5'],
      comments: [
        { id: 'pc-sre-2', userId: 'user-2', content: 'Great postmortem. The circuit breaker implementation should prevent this class of issues entirely.', timestamp: new Date('2026-02-16T10:20:00'), likes: ['user-3'] },
        { id: 'pc-sre-3', userId: 'user-1', content: '3 minute detection time is impressive. The alerting improvements are really paying off.', timestamp: new Date('2026-02-16T10:30:00'), likes: ['user-3', 'user-5'] },
      ],
      tags: ['postmortem', 'incident', 'payment-api'],
      attachments: [
        { id: 'att-6', type: 'file', name: 'INC-247_Postmortem.pdf', url: '#', size: '1.8 MB', mimeType: 'application/pdf' },
        { id: 'att-7', type: 'file', name: 'connection-pool-analysis.xlsx', url: '#', size: '450 KB', mimeType: 'application/xlsx' },
      ],
    },
    {
      id: 'post-sre-3',
      userId: 'user-4',
      content: 'Toil reduction update for Q1:\n\n- **Alert noise** reduced by 72% (custom aggregation rules)\n- **Runbook automation**: 45% of runbooks now have automated remediation\n- **Self-healing services**: 30% coverage (target: 50% by EOQ)\n- **Auto-scaling**: 88% of services now auto-scale\n\nWe\'re on track to hit our <30% toil ratio target. Keep up the great work team!',
      timestamp: new Date('2026-02-15T14:00:00'),
      likes: ['user-1', 'user-3', 'user-5'],
      comments: [
        { id: 'pc-sre-4', userId: 'user-5', content: 'The alert noise reduction has been a game changer for on-call quality of life.', timestamp: new Date('2026-02-15T14:15:00'), likes: ['user-4'] },
      ],
      tags: ['toil', 'automation', 'quarterly-update'],
    },
  ],
};

export const recentActivity = {
  threads: [
    {
      id: 'msg-1',
      channelName: 'general',
      spaceName: 'Company HQ',
      content: 'Hey everyone! Welcome to the new chat platform...',
      replies: 3,
      lastReply: new Date('2026-02-14T09:12:00'),
    },
    {
      id: 'msg-5',
      channelName: 'general',
      spaceName: 'Engineering',
      content: 'I\'m seeing some performance issues...',
      replies: 8,
      lastReply: new Date('2026-02-14T09:25:00'),
    },
  ],
  mentions: [
    {
      id: 'msg-3',
      channelName: 'general',
      spaceName: 'Company HQ',
      content: '@John Doe can you review the Q1 reports when you get a chance?',
      timestamp: new Date('2026-02-14T09:30:00'),
      from: 'Alice Williams',
    },
  ],
  unread: [
    {
      channelId: 'general-general',
      channelName: 'general',
      spaceName: 'Company HQ',
      count: 3,
      lastMessage: new Date('2026-02-14T09:30:00'),
    },
    {
      channelId: 'eng-general',
      channelName: 'general',
      spaceName: 'Engineering',
      count: 5,
      lastMessage: new Date('2026-02-14T09:25:00'),
    },
    {
      channelId: 'eng-backend',
      channelName: 'backend',
      spaceName: 'Engineering',
      count: 2,
      lastMessage: new Date('2026-02-14T08:50:00'),
    },
    {
      channelId: 'sre-general',
      channelName: 'general',
      spaceName: 'SRE',
      count: 4,
      lastMessage: new Date('2026-02-16T10:45:00'),
    },
    {
      channelId: 'sre-alerts',
      channelName: 'alerts',
      spaceName: 'SRE',
      count: 2,
      lastMessage: new Date('2026-02-16T15:00:00'),
    },
    {
      channelId: 'sre-infra',
      channelName: 'infrastructure',
      spaceName: 'SRE',
      count: 1,
      lastMessage: new Date('2026-02-16T09:40:00'),
    },
  ],
};

export const meetings: Meeting[] = [
  {
    id: 'meeting-1',
    title: 'Daily Standup',
    startTime: new Date('2026-02-16T09:00:00'),
    endTime: new Date('2026-02-16T09:15:00'),
    isOnline: true,
    location: 'Teams Call',
    organizer: 'user-2',
    attendees: ['user-1', 'user-2', 'user-3', 'user-4'],
    color: 'purple',
    recurring: true,
    status: 'completed',
  },
  {
    id: 'meeting-2',
    title: 'Sprint Planning',
    startTime: new Date('2026-02-16T10:30:00'),
    endTime: new Date('2026-02-16T11:30:00'),
    isOnline: true,
    location: 'Teams Call',
    organizer: 'user-3',
    attendees: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
    color: 'blue',
    status: 'in-progress',
  },
  {
    id: 'meeting-3',
    title: 'Design Review',
    startTime: new Date('2026-02-16T14:00:00'),
    endTime: new Date('2026-02-16T15:00:00'),
    location: 'Conference Room A',
    organizer: 'user-4',
    attendees: ['user-1', 'user-2', 'user-4'],
    color: 'green',
    status: 'upcoming',
  },
  {
    id: 'meeting-4',
    title: '1:1 with Manager',
    startTime: new Date('2026-02-16T16:00:00'),
    endTime: new Date('2026-02-16T16:30:00'),
    isOnline: true,
    location: 'Teams Call',
    organizer: 'user-2',
    attendees: ['user-1', 'user-2'],
    color: 'orange',
    status: 'upcoming',
  },
  {
    id: 'meeting-5',
    title: 'Team Retrospective',
    startTime: new Date('2026-02-17T10:00:00'),
    endTime: new Date('2026-02-17T11:00:00'),
    isOnline: true,
    location: 'Teams Call',
    organizer: 'user-3',
    attendees: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
    color: 'purple',
    recurring: true,
    status: 'upcoming',
  },
  {
    id: 'meeting-6',
    title: 'Product Demo',
    startTime: new Date('2026-02-18T15:00:00'),
    endTime: new Date('2026-02-18T16:00:00'),
    location: 'Main Auditorium',
    organizer: 'user-5',
    attendees: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
    color: 'red',
    status: 'upcoming',
  },
  {
    id: 'meeting-7',
    title: 'Architecture Review',
    startTime: new Date('2026-02-19T11:00:00'),
    endTime: new Date('2026-02-19T12:30:00'),
    isOnline: true,
    location: 'Teams Call',
    organizer: 'user-3',
    attendees: ['user-1', 'user-3', 'user-5'],
    color: 'blue',
    status: 'upcoming',
  },
  {
    id: 'meeting-8',
    title: 'All Hands Meeting',
    startTime: new Date('2026-02-20T09:00:00'),
    endTime: new Date('2026-02-20T10:00:00'),
    location: 'Main Auditorium',
    organizer: 'user-2',
    attendees: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
    color: 'purple',
    recurring: true,
    status: 'upcoming',
  },
  {
    id: 'meeting-9',
    title: 'Client Presentation',
    startTime: new Date('2026-02-23T14:00:00'),
    endTime: new Date('2026-02-23T15:30:00'),
    isOnline: true,
    location: 'Teams Call',
    organizer: 'user-4',
    attendees: ['user-1', 'user-2', 'user-4'],
    color: 'green',
    status: 'upcoming',
  },
  {
    id: 'meeting-10',
    title: 'Budget Review',
    startTime: new Date('2026-02-25T10:00:00'),
    endTime: new Date('2026-02-25T11:00:00'),
    location: 'Conference Room B',
    organizer: 'user-2',
    attendees: ['user-1', 'user-2'],
    color: 'orange',
    status: 'upcoming',
  },
];