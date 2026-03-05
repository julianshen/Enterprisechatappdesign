import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router';
import {
  Plus, Activity, Building2, Code2, Palette, Megaphone, MessageSquare, Bell,
  Puzzle, Sparkles, Settings, User, LogOut, Moon, Sun, ChevronRight,
  LifeBuoy, Siren, Gauge,
  type LucideIcon
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { spaces, directMessages, groupChats, currentUser, notifications, type Space } from '../data/mockData';
import { useAIAssistant } from '../context/AIAssistantContext';
import { useTheme } from '../context/ThemeContext';
import { useDrag, useDrop } from 'react-dnd';
import { CreateSpaceModal } from './CreateSpaceModal';

const spaceIconMap: Record<string, LucideIcon> = {
  general: Building2,
  engineering: Code2,
  design: Palette,
  marketing: Megaphone,
  sre: Gauge,
};

const statusColors: Record<string, string> = {
  online: 'bg-[#237b4b]',
  away: 'bg-[#d4820c]',
  busy: 'bg-[#c4314b]',
  offline: 'bg-[#8a8a8a]',
};

const statusLabels: Record<string, string> = {
  online: 'Available',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
};

const SPACE_DND_TYPE = 'SIDEBAR_SPACE';

interface DragItem {
  type: string;
  index: number;
  id: string;
}

function DraggableSpaceItem({
  space,
  index,
  isActive,
  moveSpace,
}: {
  space: Space;
  index: number;
  isActive: boolean;
  moveSpace: (dragIndex: number, hoverIndex: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const IconComponent = spaceIconMap[space.id] || Building2;
  const spaceUnread = space.channels.reduce((sum, ch) => sum + (ch.unreadCount || 0), 0);

  const [{ isDragging }, drag] = useDrag({
    type: SPACE_DND_TYPE,
    item: (): DragItem => ({ type: SPACE_DND_TYPE, index, id: space.id }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: SPACE_DND_TYPE,
    hover: (item: DragItem, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveSpace(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="relative"
      style={{
        opacity: isDragging ? 0.35 : 1,
        transform: isDragging ? 'scale(0.95)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.15s ease, opacity 0.15s ease',
      }}
    >
      {/* Drop indicator line */}
      {isOver && canDrop && !isDragging && (
        <div className="absolute -top-[2px] left-2 right-2 h-[3px] rounded-full bg-[#5b5fc7] z-10 shadow-[0_0_6px_rgba(91,95,199,0.5)]" />
      )}
      <Link
        to={space.home ? `/space/${space.id}/home` : `/space/${space.id}/${space.channels[0]?.id}`}
        className={`w-[56px] h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-lg transition-all relative group ${
          isActive
            ? 'bg-[#e8e8e8] dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc]'
            : 'text-[#424242] dark:text-[#e0e0e0] hover:bg-[#e8e8e8] dark:hover:bg-[#292929]'
        } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        title={space.name}
        draggable={false}
      >
        <div className="relative">
          <IconComponent size={20} strokeWidth={1.5} />
          {spaceUnread > 0 && (
            <span className="absolute -top-1.5 -right-2.5 bg-[#c4314b] text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow-sm">
              {spaceUnread}
            </span>
          )}
        </div>
        <span className="text-[9px] font-medium truncate max-w-[52px] px-1 leading-tight">
          {space.name.split(' ')[0]}
        </span>
        {isActive && (
          <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-[#5b5fc7]" />
        )}
      </Link>
    </div>
  );
}

export function SpaceSidebar() {
  const { spaceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { activePanel, toggleCopilot, toggleHelpDesk } = useAIAssistant();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isChatActive = location.pathname.startsWith('/chat');
  const isInboxActive = location.pathname === '/inbox';
  const isRecentActive = location.pathname === '/' || location.pathname === '/recent';
  const isAppsActive = location.pathname === '/apps';
  const isProfileActive = location.pathname === '/profile';
  const isWarRoomActive = location.pathname.startsWith('/warroom');

  // Total unread for chat (DMs + group chats)
  const chatUnread = directMessages.reduce((sum, dm) => sum + (dm.unreadCount || 0), 0)
    + groupChats.reduce((sum, g) => sum + (g.unreadCount || 0), 0);

  // Unread notifications
  const notifUnread = notifications.filter(n => !n.read).length;

  // Ordered spaces state with localStorage persistence
  const [orderedSpaces, setOrderedSpaces] = useState<Space[]>(() => {
    try {
      const saved = localStorage.getItem('space-order');
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        const ordered = ids
          .map(id => spaces.find(s => s.id === id))
          .filter((s): s is Space => !!s);
        // Append any new spaces not in saved order
        const remaining = spaces.filter(s => !ids.includes(s.id));
        return [...ordered, ...remaining];
      }
    } catch {}
    return [...spaces];
  });

  const moveSpace = useCallback((dragIndex: number, hoverIndex: number) => {
    setOrderedSpaces(prev => {
      const next = [...prev];
      const [dragged] = next.splice(dragIndex, 1);
      next.splice(hoverIndex, 0, dragged);
      try {
        localStorage.setItem('space-order', JSON.stringify(next.map(s => s.id)));
      } catch {}
      return next;
    });
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showUserMenu]);

  return (
    <>
    <div className="w-[68px] bg-[#f3f2f1] dark:bg-[#202020] flex flex-col items-center py-2 gap-0.5 border-r border-[#e1dfdd] dark:border-[#292929]">
      {/* Recent/Activity Button */}
      <Link
        to="/recent"
        className={`w-[56px] h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-lg transition-all relative group ${
          isRecentActive
            ? 'bg-[#e8e8f8] dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc]'
            : 'text-[#424242] dark:text-[#e0e0e0] hover:bg-[#e8e8e8] dark:hover:bg-[#292929]'
        }`}
        title="Activity"
      >
        <Activity size={20} strokeWidth={1.5} />
        <span className="text-[10px] font-medium">My</span>
        {isRecentActive && (
          <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-[#5b5fc7]" />
        )}
      </Link>

      {/* Inbox Button */}
      <Link
        to="/inbox"
        className={`w-[56px] h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-lg transition-all relative group ${
          isInboxActive
            ? 'bg-[#e8e8f8] dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc]'
            : 'text-[#424242] dark:text-[#e0e0e0] hover:bg-[#e8e8e8] dark:hover:bg-[#292929]'
        }`}
        title="Inbox"
      >
        <div className="relative">
          <Bell size={20} strokeWidth={1.5} />
          {notifUnread > 0 && (
            <span className="absolute -top-1.5 -right-2.5 bg-[#c4314b] text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow-sm">
              {notifUnread}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">Inbox</span>
        {isInboxActive && (
          <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-[#5b5fc7]" />
        )}
      </Link>

      {/* Chat / DMs Button */}
      <Link
        to="/chat/dm/user-2"
        className={`w-[56px] h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-lg transition-all relative group ${
          isChatActive
            ? 'bg-[#e8e8f8] dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc]'
            : 'text-[#424242] dark:text-[#e0e0e0] hover:bg-[#e8e8e8] dark:hover:bg-[#292929]'
        }`}
        title="Chat"
      >
        <div className="relative">
          <MessageSquare size={20} strokeWidth={1.5} />
          {chatUnread > 0 && (
            <span className="absolute -top-1.5 -right-2.5 bg-[#c4314b] text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow-sm">
              {chatUnread}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">Chat</span>
        {isChatActive && (
          <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-[#5b5fc7]" />
        )}
      </Link>

      {/* Apps Button */}
      <Link
        to="/apps"
        className={`w-[56px] h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-lg transition-all relative group ${
          isAppsActive
            ? 'bg-[#e8e8f8] dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc]'
            : 'text-[#424242] dark:text-[#e0e0e0] hover:bg-[#e8e8e8] dark:hover:bg-[#292929]'
        }`}
        title="Apps"
      >
        <Puzzle size={20} strokeWidth={1.5} />
        <span className="text-[10px] font-medium">Apps</span>
        {isAppsActive && (
          <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-[#5b5fc7]" />
        )}
      </Link>

      {/* War Room Button */}
      <Link
        to="/warroom"
        className={`w-[56px] h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-lg transition-all relative group ${
          isWarRoomActive
            ? 'bg-[#c4314b]/15 dark:bg-[#c4314b]/20 text-[#c4314b] dark:text-[#f87171]'
            : 'text-[#424242] dark:text-[#e0e0e0] hover:bg-[#e8e8e8] dark:hover:bg-[#292929]'
        }`}
        title="War Room"
      >
        <div className="relative">
          <Siren size={20} strokeWidth={1.5} />
          <div className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#c4314b] animate-pulse" />
        </div>
        <span className="text-[9px] font-medium">War Room</span>
        {isWarRoomActive && (
          <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-[#c4314b]" />
        )}
      </Link>

      <div className="w-8 h-px bg-[#d1d1d1] dark:bg-[#292929] my-1" />

      {/* Spaces */}
      {orderedSpaces.map((space, index) => (
        <DraggableSpaceItem
          key={space.id}
          space={space}
          index={index}
          isActive={spaceId === space.id}
          moveSpace={moveSpace}
        />
      ))}

      {/* Add Space Button */}
      <button
        onClick={() => setShowCreateSpace(true)}
        className="w-[56px] h-[48px] flex flex-col items-center justify-center gap-0.5 text-[#424242] dark:text-[#e0e0e0] hover:bg-[#e8e8e8] dark:hover:bg-[#292929] rounded-lg transition-all group relative"
        title="Add Team"
      >
        <div className="w-5 h-5 border-[1.5px] border-current rounded flex items-center justify-center">
          <Plus size={14} strokeWidth={1.5} />
        </div>
        <span className="text-[9px] font-medium">Add space</span>
      </button>

      {/* Spacer to push bottom items down */}
      <div className="flex-1" />

      {/* Copilot Button */}
      <button
        onClick={toggleCopilot}
        className={`w-[56px] h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-lg transition-all relative group ${
          activePanel === 'copilot'
            ? 'bg-gradient-to-br from-[#5b5fc7]/20 to-[#7b4db8]/20 text-[#5b5fc7] dark:text-[#a6a9dc]'
            : 'text-[#424242] dark:text-[#e0e0e0] hover:bg-[#e8e8e8] dark:hover:bg-[#292929]'
        }`}
        title="Copilot"
      >
        <div className={`relative ${activePanel === 'copilot' ? '' : 'group-hover:scale-110 transition-transform'}`}>
          <Sparkles size={20} strokeWidth={1.5} />
          {activePanel !== 'copilot' && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8] shadow-sm" />
          )}
        </div>
        <span className="text-[9px] font-medium">Copilot</span>
        {activePanel === 'copilot' && (
          <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-gradient-to-b from-[#5b5fc7] to-[#7b4db8]" />
        )}
      </button>

      {/* Help Desk Button */}
      <button
        onClick={toggleHelpDesk}
        className={`w-[56px] h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-lg transition-all relative group ${
          activePanel === 'helpdesk'
            ? 'bg-gradient-to-br from-[#5b5fc7]/20 to-[#7b4db8]/20 text-[#5b5fc7] dark:text-[#a6a9dc]'
            : 'text-[#424242] dark:text-[#e0e0e0] hover:bg-[#e8e8e8] dark:hover:bg-[#292929]'
        }`}
        title="Help Desk"
      >
        <div className={`relative ${activePanel === 'helpdesk' ? '' : 'group-hover:scale-110 transition-transform'}`}>
          <LifeBuoy size={20} strokeWidth={1.5} />
        </div>
        <span className="text-[9px] font-medium">Help</span>
        {activePanel === 'helpdesk' && (
          <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-gradient-to-b from-[#5b5fc7] to-[#7b4db8]" />
        )}
      </button>

      {/* User Avatar + Popover */}
      <div className="relative mb-1" ref={menuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`w-[56px] h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-lg transition-all relative group ${
            isProfileActive || showUserMenu
              ? 'bg-[#e8e8f8] dark:bg-[#5b5fc7]/20'
              : 'hover:bg-[#e8e8e8] dark:hover:bg-[#292929]'
          }`}
          title={currentUser.name}
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#5b5fc7]/30 transition-colors">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#f3f2f1] dark:border-[#202020] ${statusColors[currentUser.status]}`} />
          </div>
          <span className="text-[9px] font-medium text-[#424242] dark:text-[#e0e0e0] truncate max-w-[52px] px-0.5">
            {currentUser.name.split(' ')[0]}
          </span>
        </button>

        {/* User Menu Popover */}
        {showUserMenu && (
          <div className="absolute bottom-full left-[64px] mb-0 w-[260px] bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-xl z-50 overflow-hidden">
            {/* User info header */}
            <div className="px-4 py-3 bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#5b5fc7] ${statusColors[currentUser.status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-white truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-white/60 truncate">john.doe@company.com</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="px-3 py-2 border-b border-[#f0f0f0] dark:border-[#333]">
              <p className="text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider px-1 mb-1.5">Status</p>
              <div className="grid grid-cols-2 gap-1">
                {(['online', 'busy', 'away', 'offline'] as const).map(s => (
                  <button
                    key={s}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                      currentUser.status === s
                        ? 'bg-[#eeeef8] dark:bg-[#5b5fc7]/10 text-[#5b5fc7] dark:text-[#a6a9dc]'
                        : 'text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${statusColors[s]}`} />
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[13px] text-[#242424] dark:text-[#e0e0e0] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
              >
                <User size={16} className="text-[#616161] dark:text-[#b9bbbe]" />
                <span className="flex-1">View Profile</span>
                <ChevronRight size={14} className="text-[#d1d1d1] dark:text-[#5a5a5a]" />
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[13px] text-[#242424] dark:text-[#e0e0e0] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
              >
                <Settings size={16} className="text-[#616161] dark:text-[#b9bbbe]" />
                <span className="flex-1">Settings</span>
                <ChevronRight size={14} className="text-[#d1d1d1] dark:text-[#5a5a5a]" />
              </button>
            </div>

            {/* Theme toggle */}
            <div className="px-4 py-2 border-t border-[#f0f0f0] dark:border-[#333]">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-0 py-1.5 text-left text-[13px] text-[#242424] dark:text-[#e0e0e0] hover:opacity-80 transition-opacity"
              >
                {theme === 'light' ? (
                  <Moon size={16} className="text-[#616161] dark:text-[#b9bbbe]" />
                ) : (
                  <Sun size={16} className="text-[#616161] dark:text-[#b9bbbe]" />
                )}
                <span className="flex-1">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                <div className={`relative w-8 h-[18px] rounded-full transition-colors ${theme === 'dark' ? 'bg-[#5b5fc7]' : 'bg-[#d1d1d1]'}`}>
                  <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'left-[16px]' : 'left-[2px]'}`} />
                </div>
              </button>
            </div>

            {/* Sign out */}
            <div className="border-t border-[#f0f0f0] dark:border-[#333] py-1">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[13px] text-[#c4314b] dark:text-[#f47067] hover:bg-[#fdf0f2] dark:hover:bg-[#c4314b]/5 transition-colors">
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

      {/* Create Space Modal */}
      <AnimatePresence>
        {showCreateSpace && (
          <CreateSpaceModal onClose={() => setShowCreateSpace(false)} />
        )}
      </AnimatePresence>
    </>
  );
}