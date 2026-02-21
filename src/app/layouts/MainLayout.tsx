import { Outlet, useParams, useLocation } from 'react-router';
import { SpaceSidebar } from '../components/SpaceSidebar';
import { ChannelSidebar } from '../components/ChannelSidebar';
import { GlobalAIAssistant } from '../components/GlobalAIAssistant';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export function MainLayout() {
  const { spaceId } = useParams();
  const location = useLocation();
  
  // Show channel sidebar for spaces or chat sidebar for DMs/groups
  const isDashboard = location.pathname === '/' || location.pathname === '/recent';
  const isInbox = location.pathname === '/inbox';
  const isAppStore = location.pathname === '/apps';
  const isProfile = location.pathname === '/profile';
  const isWarRoom = location.pathname.startsWith('/warroom');
  const showSidebar = !isDashboard && !isInbox && !isAppStore && !isProfile && !isWarRoom && (spaceId || location.pathname.startsWith('/chat'));

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex bg-gradient-to-br from-white via-[#fafafa] to-[#f5f5f5] dark:from-[#313338] dark:via-[#2b2d31] dark:to-[#1e1f22]">
        <SpaceSidebar />
        {showSidebar && <ChannelSidebar />}
        <Outlet />
        <GlobalAIAssistant />
      </div>
    </DndProvider>
  );
}
