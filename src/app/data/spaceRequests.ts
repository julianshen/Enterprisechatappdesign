// ─── Space Requests Store ─────────────────────────────────────────────────────
// Persists space creation requests to localStorage with a reactive subscriber
// pattern, similar to customDashboards.ts.

const STORAGE_KEY = 'space-requests';

export type SpaceRequestStatus = 'pending-owner' | 'pending-admin' | 'approved' | 'rejected';

export interface SpaceRequest {
  id: string;
  spaceName: string;
  spaceDescription: string;
  scenarioId: string;
  scenarioName: string;
  scenarioColor: string; // gradient start color
  scenarioGradient: string;
  channelCount: number;
  dashboardCount: number;
  appCount: number;
  channels: string[];
  dashboards: string[];
  apps: string[];
  permissions: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerTitle: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  status: SpaceRequestStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  ownerApprovedAt?: string;
  adminApprovedAt?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

let listeners: (() => void)[] = [];

// Cache for useSyncExternalStore — must return same reference if nothing changed
let cachedRequests: SpaceRequest[] | null = null;
let cachedRaw: string | null = null;

export function getSpaceRequests(): SpaceRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedRequests = raw ? JSON.parse(raw) : [];
    }
    return cachedRequests!;
  } catch {
    return [];
  }
}

function invalidateCache() {
  cachedRaw = null;
  cachedRequests = null;
}

export function addSpaceRequest(request: SpaceRequest) {
  const all = getSpaceRequests();
  all.unshift(request); // newest first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  invalidateCache();
  listeners.forEach(fn => fn());
}

export function updateSpaceRequest(id: string, updates: Partial<SpaceRequest>) {
  const all = getSpaceRequests();
  const idx = all.findIndex(r => r.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    invalidateCache();
    listeners.forEach(fn => fn());
  }
}

export function subscribeSpaceRequests(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(fn => fn !== listener);
  };
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_REQUESTS: SpaceRequest[] = [
  {
    id: 'sr-demo-1',
    spaceName: 'Platform Infrastructure',
    spaceDescription: 'Cloud infrastructure, Kubernetes management, and platform tooling for the engineering org.',
    scenarioId: 'sre',
    scenarioName: 'SRE / Platform',
    scenarioColor: '#9333ea',
    scenarioGradient: 'from-[#9333ea] to-[#7e22ce]',
    channelCount: 6,
    dashboardCount: 3,
    appCount: 4,
    channels: ['#announcements', '#general', '#alerts', '#incidents', '#runbooks', '#post-mortems'],
    dashboards: ['Infrastructure Health', 'SLO Dashboard', 'On-call Rotation'],
    apps: ['Grafana', 'Sentry', 'PagerDuty', 'GitLab'],
    permissions: 'SRE: Alert channels notify all, post-mortems for members only',
    ownerId: 'user-1',
    ownerName: 'John Doe',
    ownerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    ownerTitle: 'Engineering Manager',
    requesterId: 'user-1',
    requesterName: 'John Doe',
    requesterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    status: 'pending-admin',
    createdAt: new Date('2026-03-03T14:30:00').toISOString(),
    updatedAt: new Date('2026-03-03T14:30:00').toISOString(),
  },
  {
    id: 'sr-demo-2',
    spaceName: 'Brand & Creative',
    spaceDescription: 'Brand guidelines, creative asset management, and design review workflows.',
    scenarioId: 'design',
    scenarioName: 'Design Studio',
    scenarioColor: '#c4314b',
    scenarioGradient: 'from-[#c4314b] to-[#a52a40]',
    channelCount: 6,
    dashboardCount: 2,
    appCount: 3,
    channels: ['#announcements', '#general', '#design-reviews', '#inspiration', '#handoffs', '#design-system'],
    dashboards: ['Design Workload', 'Review Pipeline'],
    apps: ['Figma', 'Miro', 'Notion'],
    permissions: 'Creative team: Open sharing, restricted design system edits',
    ownerId: 'mgr-4',
    ownerName: 'Rachel Adams',
    ownerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel',
    ownerTitle: 'Design Manager',
    requesterId: 'user-1',
    requesterName: 'John Doe',
    requesterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    status: 'pending-owner',
    createdAt: new Date('2026-03-02T10:15:00').toISOString(),
    updatedAt: new Date('2026-03-02T10:15:00').toISOString(),
  },
  {
    id: 'sr-demo-3',
    spaceName: 'API Gateway Team',
    spaceDescription: 'API gateway development, documentation, and service mesh coordination.',
    scenarioId: 'engineering',
    scenarioName: 'Engineering Team',
    scenarioColor: '#5b5fc7',
    scenarioGradient: 'from-[#5b5fc7] to-[#4a4eb5]',
    channelCount: 6,
    dashboardCount: 3,
    appCount: 4,
    channels: ['#announcements', '#general', '#code-reviews', '#deployments', '#incidents', '#architecture'],
    dashboards: ['Sprint Dashboard', 'Release Metrics', 'On-call Schedule'],
    apps: ['GitLab', 'Sentry', 'Jira', 'Grafana'],
    permissions: 'Standard engineering: Members can post, Guests read-only, restricted file downloads',
    ownerId: 'mgr-2',
    ownerName: 'Sarah Chen',
    ownerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    ownerTitle: 'Senior Engineering Manager',
    requesterId: 'user-1',
    requesterName: 'John Doe',
    requesterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    status: 'approved',
    createdAt: new Date('2026-02-25T09:00:00').toISOString(),
    updatedAt: new Date('2026-02-27T16:42:00').toISOString(),
    ownerApprovedAt: new Date('2026-02-26T11:20:00').toISOString(),
    adminApprovedAt: new Date('2026-02-27T16:42:00').toISOString(),
  },
  {
    id: 'sr-demo-4',
    spaceName: 'Executive Strategy',
    spaceDescription: 'Confidential strategy discussions and board preparation materials.',
    scenarioId: 'project',
    scenarioName: 'Project Space',
    scenarioColor: '#ea580c',
    scenarioGradient: 'from-[#ea580c] to-[#c2410c]',
    channelCount: 5,
    dashboardCount: 2,
    appCount: 4,
    channels: ['#announcements', '#general', '#deliverables', '#blockers', '#stakeholders'],
    dashboards: ['Milestone Tracker', 'Risk Register'],
    apps: ['Jira', 'Google Drive', 'Notion', 'Linear'],
    permissions: 'Project: Stakeholder channel restricted, deliverables for all members',
    ownerId: 'mgr-3',
    ownerName: 'David Kim',
    ownerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    ownerTitle: 'Director of Product',
    requesterId: 'user-1',
    requesterName: 'John Doe',
    requesterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    status: 'rejected',
    createdAt: new Date('2026-02-20T08:45:00').toISOString(),
    updatedAt: new Date('2026-02-21T14:10:00').toISOString(),
    rejectedAt: new Date('2026-02-21T14:10:00').toISOString(),
    rejectedBy: 'David Kim',
    rejectionReason: 'This space would overlap with the existing "Leadership" space. Please use that space instead or contact IT for a restructure.',
  },
];

// Seed demo data on first load
export function seedDemoRequests() {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_REQUESTS));
    }
  } catch {}
}