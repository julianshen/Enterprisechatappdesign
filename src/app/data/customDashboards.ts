// ─── Custom Dashboard Store ──────────────────────────────────────────────────
// Persists user-created dashboards to localStorage and provides a reactive API
// for reading/writing them across components.

import type { SpaceDashboard, DashboardWidget } from './mockData';

export const MY_SPACE_ID = '__my__';
export const MY_DEFAULT_DASHBOARD_ID = '__my_default__';

const STORAGE_KEY = 'custom-dashboards';

// ─── Default "My" dashboard widgets ───
const DEFAULT_MY_WIDGETS: DashboardWidget[] = [
  { id: 'my-w-calendar', type: 'my-calendar', title: 'Working Calendar', color: 'purple', wide: false, data: null },
  { id: 'my-w-meetings', type: 'my-meetings', title: 'Incoming Meetings', color: 'blue', wide: false, data: null },
  { id: 'my-w-services', type: 'my-services', title: 'Common Services', color: 'purple', wide: false, data: null },
  { id: 'my-w-requests', type: 'my-requests', title: 'My Requests', color: 'blue', wide: false, data: null },
  { id: 'my-w-approvals', type: 'my-approvals', title: 'Pending Approvals', color: 'orange', wide: false, data: null },
  { id: 'my-w-unread', type: 'my-unread', title: 'Unread Channels', color: 'green', wide: false, data: null },
  { id: 'my-w-threads', type: 'my-threads', title: 'Active Threads', color: 'red', wide: false, data: null },
];

const DEFAULT_MY_DASHBOARD: SpaceDashboard = {
  id: MY_DEFAULT_DASHBOARD_ID,
  name: 'My Dashboard',
  icon: 'bar-chart',
  description: 'Your personal dashboard',
  widgets: DEFAULT_MY_WIDGETS,
};

let listeners: (() => void)[] = [];

export function getCustomDashboards(): Record<string, SpaceDashboard[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getCustomDashboardsForSpace(spaceId: string): SpaceDashboard[] {
  const stored = getCustomDashboards()[spaceId] || [];
  // For the "My" space, return the default dashboard if none is stored
  if (spaceId === MY_SPACE_ID && stored.length === 0) {
    return [DEFAULT_MY_DASHBOARD];
  }
  // If stored but the MY default dashboard exists, ensure it uses latest defaults for missing widgets
  if (spaceId === MY_SPACE_ID) {
    const hasDefault = stored.find(d => d.id === MY_DEFAULT_DASHBOARD_ID);
    if (!hasDefault) {
      return [DEFAULT_MY_DASHBOARD, ...stored];
    }
  }
  return stored;
}

export function saveCustomDashboard(spaceId: string, dashboard: SpaceDashboard) {
  const all = getCustomDashboards();
  const spaceList = all[spaceId] || [];
  const idx = spaceList.findIndex(d => d.id === dashboard.id);
  if (idx >= 0) {
    spaceList[idx] = dashboard;
  } else {
    spaceList.push(dashboard);
  }
  all[spaceId] = spaceList;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  listeners.forEach(fn => fn());
}

export function deleteCustomDashboard(spaceId: string, dashboardId: string) {
  const all = getCustomDashboards();
  const spaceList = all[spaceId] || [];
  all[spaceId] = spaceList.filter(d => d.id !== dashboardId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  listeners.forEach(fn => fn());
}

export function subscribeCustomDashboards(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(fn => fn !== listener);
  };
}