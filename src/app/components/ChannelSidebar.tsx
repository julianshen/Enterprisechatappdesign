import { Link, useParams } from 'react-router';
import { Hash, Lock, Volume2, ChevronDown, Plus, FileText, FolderOpen, CheckSquare, ChevronRight, MessageSquare, Users, BarChart3, Rocket, Shield, GitPullRequest, Layers, Target, Calendar, Megaphone, BookOpen, LayoutDashboard, Puzzle, Home, Settings, PenLine, Pin, type LucideIcon } from 'lucide-react';
import { spaces, directMessages, groupChats, users } from '../data/mockData';
import { getAppsForSpace } from '../data/appData';
import { useState, useEffect, useCallback, type MouseEvent } from 'react';
import { getNewPostCount } from '../pages/SpaceHome';
import { getCustomDashboardsForSpace, subscribeCustomDashboards } from '../data/customDashboards';
import { useFloatingChat } from '../context/FloatingChatContext';
import { toast } from 'sonner';
import { useI18n } from '../context/I18nContext';

const dashboardIconMap: Record<string, LucideIcon> = {
  'bar-chart': BarChart3,
  'rocket': Rocket,
  'shield': Shield,
  'git-pull-request': GitPullRequest,
  'layers': Layers,
  'target': Target,
  'calendar': Calendar,
  'megaphone': Megaphone,
  'users': Users,
  'book-open': BookOpen,
};

export function ChannelSidebar() {
  const { spaceId, channelId, dashboardId, appId } = useParams();
  const { togglePinChannel, isChannelPinned } = useFloatingChat();
  const { t } = useI18n();
  const [channelsExpanded, setChannelsExpanded] = useState(true);
  const [dashboardsExpanded, setDashboardsExpanded] = useState(true);
  const [appsExpanded, setAppsExpanded] = useState(true);
  const [dmsExpanded, setDmsExpanded] = useState(true);
  const [groupsExpanded, setGroupsExpanded] = useState(true);
  const [customDashboards, setCustomDashboards] = useState(() =>
    spaceId ? getCustomDashboardsForSpace(spaceId) : []
  );

  // Subscribe to custom dashboard changes
  useEffect(() => {
    const update = () => {
      if (spaceId) setCustomDashboards(getCustomDashboardsForSpace(spaceId));
    };
    update();
    return subscribeCustomDashboards(update);
  }, [spaceId]);

  
  const currentSpace = spaces.find(s => s.id === spaceId);
  const spaceApps = spaceId ? getAppsForSpace(spaceId) : [];
  const isOnAppsPage = window.location.pathname.includes('/apps');
  const isOnHomePage = window.location.pathname.includes('/home');
  const isOnPermissionsPage = window.location.pathname.includes('/permissions');
  const isOnMembersPage = window.location.pathname.includes('/members');
  const isOnManagementPage = isOnPermissionsPage || isOnMembersPage;
  
  // Track new post count for badge
  const [newPostCount, setNewPostCount] = useState(0);

  const refreshBadge = useCallback(() => {
    if (spaceId && currentSpace?.home) {
      const count = getNewPostCount(spaceId);
      setNewPostCount(isOnHomePage ? 0 : count);
    } else {
      setNewPostCount(0);
    }
  }, [spaceId, currentSpace?.home, isOnHomePage]);

  useEffect(() => {
    refreshBadge();
    // Listen for visit events to clear badge
    const handler = () => refreshBadge();
    window.addEventListener('space-home-visited', handler);
    return () => window.removeEventListener('space-home-visited', handler);
  }, [refreshBadge]);

  // Show chat sidebar when no space is selected (in recent view)
  const showChatSidebar = !spaceId;
  
  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Volume2 size={16} className="text-[#616161] dark:text-[#b9bbbe]" />;
      case 'private':
        return <Lock size={16} className="text-[#616161] dark:text-[#b9bbbe]" />;
      default:
        return <Hash size={16} className="text-[#616161] dark:text-[#b9bbbe]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-[#92c353]';
      case 'away':
        return 'bg-[#ffaa44]';
      case 'busy':
        return 'bg-[#c4314b]';
      default:
        return 'bg-[#858585]';
    }
  };

  const handlePinChannel = (event: MouseEvent<HTMLButtonElement>, channel: NonNullable<typeof currentSpace>['channels'][number]) => {
    if (!currentSpace) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const wasPinned = isChannelPinned(currentSpace.id, channel.id);
    togglePinChannel({
      channelId: channel.id,
      channelName: channel.name,
      channelType: channel.type,
      spaceId: currentSpace.id,
      spaceName: currentSpace.name,
      spaceIcon: currentSpace.icon,
    });

    if (wasPinned) {
      toast.info(t('floatingChat.unpinnedToast', { name: channel.name }));
      return;
    }

    toast.success(t('floatingChat.pinnedToast', { name: channel.name }), {
      description: t('floatingChat.pinnedToastDescription', { spaceName: currentSpace.name }),
    });
  };

  if (showChatSidebar) {
    return (
      <div className="w-[280px] bg-gradient-to-b from-[#faf9f8] to-[#f3f2f1] dark:from-[#2b2d31] dark:to-[#1e1f22] border-r border-[#e1dfdd] dark:border-[#3d3d3d] flex flex-col">
        {/* Header */}
        <div className="h-[60px] px-4 flex items-center justify-between border-b border-[#e1dfdd] dark:border-[#3d3d3d] shadow-sm">
          <h2 className="font-bold text-[#242424] dark:text-[#f2f3f5] text-[16px] tracking-tight">{t('channel.chatTitle')}</h2>
          <button className="text-[#616161] dark:text-[#b9bbbe] hover:text-[#242424] dark:hover:text-[#f2f3f5] transition-all hover:bg-[#e8e8f8] dark:hover:bg-[#3d3d3d] p-1.5 rounded-md">
            <Plus size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 py-3">
          <div className="relative">
            <input
              type="text"
              placeholder={t('channel.searchMessages')}
              className="w-full bg-[#e8e8e8] dark:bg-[#1e1f22] border-0 rounded-md px-3 py-2 text-sm text-[#242424] dark:text-[#dbdee1] placeholder-[#616161] dark:placeholder-[#6d6f78] focus:outline-none focus:ring-2 focus:ring-[#6264a7] transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-on-hover px-2 space-y-1">
          {/* Direct Messages Section */}
          <div>
            <button
              onClick={() => setDmsExpanded(!dmsExpanded)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#616161] dark:text-[#949ba4] hover:text-[#242424] dark:hover:text-[#dbdee1] hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] rounded-md w-full uppercase tracking-wider transition-all"
            >
              <ChevronRight
                size={14}
                className={`transition-transform duration-200 ${dmsExpanded ? 'rotate-90' : ''}`}
              />
              {t('channel.directMessages')}
            </button>
            
            {dmsExpanded && (
              <div className="mt-1 space-y-0.5">
                {directMessages.map((dm) => {
                  const user = users.find(u => u.id === dm.userId);
                  return (
                    <Link
                      key={dm.id}
                      to={`/chat/dm/${dm.userId}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium transition-all group hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] hover:text-[#242424] dark:hover:text-[#dbdee1] text-[#4e5058] dark:text-[#96989d]"
                    >
                      <div className="relative">
                        <img
                          src={user?.avatar}
                          alt={user?.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(user?.status || 'offline')} rounded-full border-2 border-[#faf9f8] dark:border-[#2b2d31]`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="truncate font-semibold">{user?.name}</span>
                          {dm.unreadCount && dm.unreadCount > 0 && (
                            <span className="bg-gradient-to-r from-[#d83c3e] to-[#c4314b] text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold shadow-md ml-2">
                              {dm.unreadCount}
                            </span>
                          )}
                        </div>
                        {dm.lastMessage && (
                          <p className="text-xs text-[#616161] dark:text-[#6d6f78] truncate">{dm.lastMessage}</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#e1dfdd] dark:via-[#3d3d3d] to-transparent my-2" />

          {/* Group Chats Section */}
          <div>
            <button
              onClick={() => setGroupsExpanded(!groupsExpanded)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#616161] dark:text-[#949ba4] hover:text-[#242424] dark:hover:text-[#dbdee1] hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] rounded-md w-full uppercase tracking-wider transition-all"
            >
              <ChevronRight
                size={14}
                className={`transition-transform duration-200 ${groupsExpanded ? 'rotate-90' : ''}`}
              />
              {t('channel.groupChats')}
            </button>
            
            {groupsExpanded && (
              <div className="mt-1 space-y-0.5">
                {groupChats.map((group) => (
                  <Link
                    key={group.id}
                    to={`/chat/group/${group.id}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium transition-all group hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] hover:text-[#242424] dark:hover:text-[#dbdee1] text-[#4e5058] dark:text-[#96989d]"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#7b7dd8] to-[#6264a7] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      <Users size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate font-semibold">{group.name}</span>
                        {group.unreadCount && group.unreadCount > 0 && (
                          <span className="bg-gradient-to-r from-[#d83c3e] to-[#c4314b] text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold shadow-md ml-2">
                            {group.unreadCount}
                          </span>
                        )}
                      </div>
                      {group.lastMessage && (
                        <p className="text-xs text-[#616161] dark:text-[#6d6f78] truncate">{group.lastMessage}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    );
  }

  if (!currentSpace) return null;

  return (
    <div className="w-[280px] bg-gradient-to-b from-[#faf9f8] to-[#f3f2f1] dark:from-[#2b2d31] dark:to-[#1e1f22] border-r border-[#e1dfdd] dark:border-[#3d3d3d] flex flex-col">
      {/* Space Header */}
      <div className="h-[60px] px-4 flex items-center justify-between border-b border-[#e1dfdd] dark:border-[#3d3d3d] shadow-sm">
        <h2 className="font-bold text-[#242424] dark:text-[#f2f3f5] text-[16px] tracking-tight">{currentSpace.name}</h2>
        <button className="text-[#616161] dark:text-[#b9bbbe] hover:text-[#242424] dark:hover:text-[#f2f3f5] transition-all hover:bg-[#e8e8f8] dark:hover:bg-[#3d3d3d] p-1.5 rounded-md">
          <ChevronDown size={18} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-3">
        <div className="relative">
          <input
            type="text"
            placeholder={t('chat.search')}
            className="w-full bg-[#e8e8e8] dark:bg-[#1e1f22] border-0 rounded-md px-3 py-2 text-sm text-[#242424] dark:text-[#dbdee1] placeholder-[#616161] dark:placeholder-[#6d6f78] focus:outline-none focus:ring-2 focus:ring-[#6264a7] transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-on-hover px-2 space-y-1">
        {/* Quick Actions */}
        <div className="mb-1">
          {currentSpace.home && (
            <Link
              to={`/space/${spaceId}/home`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-all ${
                isOnHomePage
                  ? 'bg-gradient-to-r from-[#e8e8f8] to-[#e0e0f5] dark:from-[#404249] dark:to-[#35373c] text-[#6264a7] dark:text-[#949cf7] shadow-sm'
                  : 'text-[#242424] dark:text-[#b9bbbe] hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] hover:text-[#6264a7] dark:hover:text-[#dbdee1]'
              }`}
            >
              <Home size={20} />
              <span className="flex-1">{t('channel.home')}</span>
              {!isOnHomePage && newPostCount > 0 && (
                <span className="bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8] text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold shadow-sm">
                  {newPostCount > 9 ? '9+' : newPostCount}
                </span>
              )}
            </Link>
          )}
          <Link
            to={`/space/${spaceId}/documents`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-all ${
              window.location.pathname.includes('/documents')
                ? 'bg-gradient-to-r from-[#e8e8f8] to-[#e0e0f5] dark:from-[#404249] dark:to-[#35373c] text-[#6264a7] dark:text-[#949cf7] shadow-sm'
                : 'text-[#242424] dark:text-[#b9bbbe] hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] hover:text-[#6264a7] dark:hover:text-[#dbdee1]'
            }`}
          >
            <FileText size={20} />
            <span>{t('channel.documents')}</span>
          </Link>
          <Link
            to={`/space/${spaceId}/files`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-all ${
              window.location.pathname.includes('/files')
                ? 'bg-gradient-to-r from-[#e8e8f8] to-[#e0e0f5] dark:from-[#404249] dark:to-[#35373c] text-[#6264a7] dark:text-[#949cf7] shadow-sm'
                : 'text-[#242424] dark:text-[#b9bbbe] hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] hover:text-[#6264a7] dark:hover:text-[#dbdee1]'
            }`}
          >
            <FolderOpen size={20} />
            <span>{t('channel.files')}</span>
          </Link>
          <Link
            to={`/space/${spaceId}/tasks`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-all ${
              window.location.pathname.includes('/tasks')
                ? 'bg-gradient-to-r from-[#e8e8f8] to-[#e0e0f5] dark:from-[#404249] dark:to-[#35373c] text-[#6264a7] dark:text-[#949cf7] shadow-sm'
                : 'text-[#242424] dark:text-[#b9bbbe] hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] hover:text-[#6264a7] dark:hover:text-[#dbdee1]'
            }`}
          >
            <CheckSquare size={20} />
            <span>Tasks</span>
          </Link>
        </div>

        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#e1dfdd] dark:via-[#3d3d3d] to-transparent my-2" />

        {/* Dashboards Section */}
        <div>
          <button
            onClick={() => setDashboardsExpanded(!dashboardsExpanded)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#616161] dark:text-[#949ba4] hover:text-[#242424] dark:hover:text-[#dbdee1] hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] rounded-md w-full uppercase tracking-wider transition-all"
          >
            <ChevronRight
              size={14}
              className={`transition-transform duration-200 ${dashboardsExpanded ? 'rotate-90' : ''}`}
            />
            Dashboards
          </button>
          
          {dashboardsExpanded && (
            <div className="mt-1 space-y-0.5">
              {/* Merge built-in dashboards with custom overrides; custom wins by ID, order preserved */}
              {(() => {
                const customMap = new Map(customDashboards.map(d => [d.id, d]));
                // Built-in dashboards, replaced by custom override if one exists
                const merged = currentSpace.dashboards.map(d => customMap.get(d.id) || d);
                // Truly new custom dashboards (IDs not in built-in)
                const builtInIds = new Set(currentSpace.dashboards.map(d => d.id));
                const brandNew = customDashboards.filter(d => !builtInIds.has(d.id));
                const allDashboards = [...merged, ...brandNew];
                return allDashboards.map((dashboard) => {
                  const Icon = dashboardIconMap[dashboard.icon] || LayoutDashboard;
                  return (
                    <Link
                      key={dashboard.id}
                      to={`/space/${spaceId}/dashboard/${dashboard.id}`}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium transition-all group ${
                        dashboardId === dashboard.id
                          ? 'bg-gradient-to-r from-[#e8e8f8] to-[#e0e0f5] dark:from-[#404249] dark:to-[#35373c] text-[#6264a7] dark:text-[#949cf7] shadow-sm'
                          : 'text-[#4e5058] dark:text-[#96989d] hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] hover:text-[#242424] dark:hover:text-[#dbdee1]'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="flex-1 truncate">{dashboard.name}</span>
                    </Link>
                  );
                });
              })()}
              <Link
                to={`/space/${spaceId}/dashboard/new`}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-[14px] text-[#616161] dark:text-[#96989d] hover:text-[#242424] dark:hover:text-[#dbdee1] hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] w-full transition-all"
              >
                <Plus size={16} />
                <span>Add dashboard</span>
              </Link>
            </div>
          )}
        </div>

        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#e1dfdd] dark:via-[#3d3d3d] to-transparent my-2" />

        {/* Apps Section */}
        <div>
          <button
            onClick={() => setAppsExpanded(!appsExpanded)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#616161] dark:text-[#949ba4] hover:text-[#242424] dark:hover:text-[#dbdee1] hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] rounded-md w-full uppercase tracking-wider transition-all"
          >
            <ChevronRight
              size={14}
              className={`transition-transform duration-200 ${appsExpanded ? 'rotate-90' : ''}`}
            />
            Apps
          </button>
          
          {appsExpanded && (
            <div className="mt-1 space-y-0.5">
              {spaceApps.filter(a => a.enabled).map((ia) => (
                <Link
                  key={ia.appId}
                  to={`/space/${spaceId}/apps/${ia.appId}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium transition-all group ${
                    isOnAppsPage && appId === ia.appId
                      ? 'bg-gradient-to-r from-[#e8e8f8] to-[#e0e0f5] dark:from-[#404249] dark:to-[#35373c] text-[#6264a7] dark:text-[#949cf7] shadow-sm'
                      : 'text-[#4e5058] dark:text-[#96989d] hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] hover:text-[#242424] dark:hover:text-[#dbdee1]'
                  }`}
                >
                  <span className="text-base leading-none">{ia.app.icon}</span>
                  <span className="flex-1 truncate">{ia.app.name}</span>
                </Link>
              ))}
              <Link
                to={`/space/${spaceId}/apps`}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium transition-all ${
                  isOnAppsPage && !appId
                    ? 'bg-gradient-to-r from-[#e8e8f8] to-[#e0e0f5] dark:from-[#404249] dark:to-[#35373c] text-[#6264a7] dark:text-[#949cf7] shadow-sm'
                    : 'text-[#616161] dark:text-[#96989d] hover:text-[#242424] dark:hover:text-[#dbdee1] hover:bg-[#e8e8f8] dark:hover:bg-[#35373c]'
                }`}
              >
                <Puzzle size={16} />
                <span>Manage apps</span>
              </Link>
            </div>
          )}
        </div>

        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#e1dfdd] dark:via-[#3d3d3d] to-transparent my-2" />

        {/* Channels Section */}
        <div>
          <button
            onClick={() => setChannelsExpanded(!channelsExpanded)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#616161] dark:text-[#949ba4] hover:text-[#242424] dark:hover:text-[#dbdee1] hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] rounded-md w-full uppercase tracking-wider transition-all"
          >
            <ChevronRight
              size={14}
              className={`transition-transform duration-200 ${channelsExpanded ? 'rotate-90' : ''}`}
            />
            Channels
          </button>
          
          {channelsExpanded && (
            <div className="mt-1 space-y-0.5">
              {currentSpace.channels.map((channel) => {
                const isPinned = isChannelPinned(currentSpace.id, channel.id);
                return (
                  <Link
                    key={channel.id}
                    to={`/space/${spaceId}/${channel.id}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium transition-all group ${
                      channelId === channel.id
                        ? 'bg-gradient-to-r from-[#e8e8f8] to-[#e0e0f5] dark:from-[#404249] dark:to-[#35373c] text-[#6264a7] dark:text-[#949cf7] shadow-sm'
                        : 'text-[#4e5058] dark:text-[#96989d] hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] hover:text-[#242424] dark:hover:text-[#dbdee1]'
                    }`}
                  >
                    {getChannelIcon(channel.type)}
                    <span className="flex-1 truncate">{channel.name}</span>
                    <div className="flex items-center gap-1">
                      {channel.unreadCount && channel.unreadCount > 0 && (
                        <span className="bg-gradient-to-r from-[#d83c3e] to-[#c4314b] text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-bold shadow-md">
                          {channel.unreadCount}
                        </span>
                      )}
                      <button
                        onClick={(event) => handlePinChannel(event, channel)}
                        className={`flex h-6 w-6 items-center justify-center rounded-md transition-all ${
                          isPinned
                            ? 'bg-[#5b5fc7]/10 text-[#5b5fc7]'
                            : 'text-[#8a8a8a] opacity-0 group-hover:opacity-100 hover:bg-[#e0e0e0] hover:text-[#5b5fc7] dark:text-[#6d6f78] dark:hover:bg-[#404249]'
                        }`}
                        title={isPinned ? 'Pinned to floating chat' : 'Pin to floating chat'}
                      >
                        <Pin size={13} className={isPinned ? 'fill-current' : ''} />
                      </button>
                    </div>
                  </Link>
                );
              })}
              <button className="flex items-center gap-3 px-3 py-2 rounded-md text-[14px] text-[#616161] dark:text-[#96989d] hover:text-[#242424] dark:hover:text-[#dbdee1] hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] w-full transition-all">
                <Plus size={16} />
                <span>Add channel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Space Management - Admin only */}
      <div className="px-2 py-2 border-t border-[#e1dfdd] dark:border-[#3d3d3d]">
        <Link
          to={`/space/${spaceId}/permissions`}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-all ${
            isOnManagementPage
              ? 'bg-gradient-to-r from-[#e8e8f8] to-[#e0e0f5] dark:from-[#404249] dark:to-[#35373c] text-[#6264a7] dark:text-[#949cf7] shadow-sm'
              : 'text-[#616161] dark:text-[#96989d] hover:bg-[#e8e8f8] dark:hover:bg-[#35373c] hover:text-[#6264a7] dark:hover:text-[#dbdee1]'
          }`}
        >
          <Settings size={16} />
          <span className="flex-1">Space Management</span>
          <span className="text-[9px] bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc] px-1.5 py-0.5 rounded font-semibold">ADMIN</span>
        </Link>
      </div>

    </div>
  );
}
