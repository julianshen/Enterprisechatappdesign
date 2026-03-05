import { createBrowserRouter } from 'react-router';
import { MainLayout } from './layouts/MainLayout';
import { ChatRoom } from './pages/ChatRoom';
import { Chat } from './pages/Chat';
import { Documents } from './pages/Documents';
import { Files } from './pages/Files';
import { Tasks } from './pages/Tasks';
import { Recent } from './pages/Recent';
import { Inbox } from './pages/Inbox';
import { TeamDashboard } from './pages/TeamDashboard';
import { AppStore } from './pages/AppStore';
import { SpaceApps } from './pages/SpaceApps';
import { SpacePermissions } from './pages/SpacePermissions';

import { ProfileSettings } from './pages/ProfileSettings';
import { WarRoom } from './pages/WarRoom';
import { SpaceHome } from './pages/SpaceHome';
import { DashboardEditor } from './pages/DashboardEditor';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: MainLayout,
    children: [
      {
        index: true,
        Component: Recent,
      },
      {
        path: 'recent',
        Component: Recent,
      },
      {
        path: 'inbox',
        Component: Inbox,
      },
      {
        path: 'apps',
        Component: AppStore,
      },
      {
        path: 'chat/:chatType/:chatId',
        Component: Chat,
      },
      {
        path: 'space/:spaceId/home',
        Component: SpaceHome,
      },

      {
        path: 'space/:spaceId/:channelId',
        Component: ChatRoom,
      },
      {
        path: 'space/:spaceId/documents',
        Component: Documents,
      },
      {
        path: 'space/:spaceId/files',
        Component: Files,
      },
      {
        path: 'space/:spaceId/tasks',
        Component: Tasks,
      },
      {
        path: 'space/:spaceId/dashboard/new',
        Component: DashboardEditor,
      },
      {
        path: 'space/:spaceId/dashboard/:dashboardId/edit',
        Component: DashboardEditor,
      },
      {
        path: 'space/:spaceId/dashboard/:dashboardId',
        Component: TeamDashboard,
      },
      {
        path: 'space/:spaceId/apps',
        Component: SpaceApps,
      },
      {
        path: 'space/:spaceId/apps/:appId',
        Component: SpaceApps,
      },
      {
        path: 'space/:spaceId/permissions',
        Component: SpacePermissions,
      },
      {
        path: 'my/dashboard/new',
        Component: DashboardEditor,
      },
      {
        path: 'my/dashboard/:dashboardId/edit',
        Component: DashboardEditor,
      },
      {
        path: 'profile',
        Component: ProfileSettings,
      },
      {
        path: 'warroom',
        Component: WarRoom,
      },
      {
        path: 'warroom/:incidentId',
        Component: WarRoom,
      },
      {
        path: '*',
        Component: Recent,
      },
    ],
  },
]);