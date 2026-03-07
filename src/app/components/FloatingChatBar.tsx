import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Check, Hash, Lock, Megaphone, MessageSquare, Pin, Plus, Search, UserPlus, Users, UsersRound, X } from 'lucide-react';
import { currentUser, directMessages, groupChats, spaces, users } from '../data/mockData';
import { useFloatingChat } from '../context/FloatingChatContext';
import { FloatingChatWindow } from './FloatingChatWindow';
import { useI18n } from '../context/I18nContext';

type PopoverView = 'list' | 'new-dm' | 'new-group';

const statusColors: Record<string, string> = {
  online: 'bg-[#237b4b]',
  away: 'bg-[#d4820c]',
  busy: 'bg-[#c4314b]',
  offline: 'bg-[#8a8a8a]',
};

function getChannelIcon(channelType: 'text' | 'announcement' | 'private') {
  if (channelType === 'announcement') {
    return <Megaphone size={15} className="shrink-0" />;
  }
  if (channelType === 'private') {
    return <Lock size={15} className="shrink-0" />;
  }
  return <Hash size={15} className="shrink-0" />;
}

export function FloatingChatBar() {
  const { closeChat, closeLauncher, focusChat, isLauncherOpen, openChat, openChats, pinnedChannels, toggleLauncher } = useFloatingChat();
  const { t } = useI18n();
  const [popoverView, setPopoverView] = useState<PopoverView>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isComposerSendHovered, setIsComposerSendHovered] = useState(false);
  const [isFabHovered, setIsFabHovered] = useState(false);
  const [isPinnedShortcutsHovered, setIsPinnedShortcutsHovered] = useState(false);
  const [showPinnedShortcuts, setShowPinnedShortcuts] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pinnedShortcutsTimeoutRef = useRef<number | null>(null);

  const openWindows = openChats.filter((chat) => !chat.minimized);
  const minimizedChats = openChats.filter((chat) => chat.minimized);
  const openSpaceChatKeys = new Set(openChats
    .filter((chat) => chat.chatType === 'space' && chat.spaceId)
    .map((chat) => `${chat.spaceId}:${chat.chatId}`));
  const otherUsers = useMemo(() => users.filter((user) => user.id !== currentUser.id), []);
  const unreadSpaceChannels = useMemo(() => (
    spaces.flatMap((space) => (
      space.channels
        .filter((channel) => (channel.unreadCount || 0) > 0)
        .map((channel) => ({
          ...channel,
          spaceId: space.id,
          spaceName: space.name,
          spaceIcon: space.icon,
        }))
    ))
  ), []);

  const totalUnread = directMessages.reduce((sum, dm) => sum + (dm.unreadCount || 0), 0)
    + groupChats.reduce((sum, group) => sum + (group.unreadCount || 0), 0)
    + unreadSpaceChannels.reduce((sum, channel) => sum + (channel.unreadCount || 0), 0);

  const unreadChannelIds = new Set(unreadSpaceChannels.map((channel) => `${channel.spaceId}:${channel.id}`));
  const loweredQuery = searchQuery.toLowerCase();
  const filteredDMs = directMessages.filter((dm) => {
    const user = users.find((item) => item.id === dm.userId);
    return user?.name.toLowerCase().includes(loweredQuery);
  });
  const filteredGroups = groupChats.filter((group) => group.name.toLowerCase().includes(loweredQuery));
  const filteredUsers = otherUsers.filter((user) => user.name.toLowerCase().includes(loweredQuery));
  const filteredUnreadSpaceChannels = unreadSpaceChannels.filter((channel) => (
    channel.name.toLowerCase().includes(loweredQuery) || channel.spaceName.toLowerCase().includes(loweredQuery)
  ));
  const groupedUnreadSpaceChannels = useMemo(() => {
    const grouped = new Map<string, {
      spaceId: string;
      spaceName: string;
      spaceIcon: string;
      channels: typeof filteredUnreadSpaceChannels;
    }>();

    filteredUnreadSpaceChannels.forEach((channel) => {
      const existing = grouped.get(channel.spaceId);
      if (existing) {
        existing.channels.push(channel);
        return;
      }

      grouped.set(channel.spaceId, {
        spaceId: channel.spaceId,
        spaceName: channel.spaceName,
        spaceIcon: channel.spaceIcon,
        channels: [channel],
      });
    });

    return Array.from(grouped.values());
  }, [filteredUnreadSpaceChannels]);
  const filteredPinnedChannels = pinnedChannels.filter((channel) => {
    if (unreadChannelIds.has(`${channel.spaceId}:${channel.channelId}`)) {
      return false;
    }
    return channel.channelName.toLowerCase().includes(loweredQuery)
      || channel.spaceName.toLowerCase().includes(loweredQuery);
  });
  const pinnedShortcutChannels = pinnedChannels.filter((channel) => (
    !openSpaceChatKeys.has(`${channel.spaceId}:${channel.channelId}`)
  ));

  useEffect(() => {
    if (!isLauncherOpen) {
      setPopoverView('list');
      setSearchQuery('');
      setSelectedUsers([]);
      setGroupName('');
      return;
    }

    window.setTimeout(() => searchInputRef.current?.focus(), 80);
  }, [isLauncherOpen, popoverView]);

  useEffect(() => {
    if (!isLauncherOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        closeLauncher();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [closeLauncher, isLauncherOpen]);

  useEffect(() => {
    const handleVisibility = (event: Event) => {
      const customEvent = event as CustomEvent<{ hidden?: boolean }>;
      setIsComposerSendHovered(Boolean(customEvent.detail?.hidden));
    };

    window.addEventListener('floating-chat-fab-visibility', handleVisibility as EventListener);
    return () => {
      window.removeEventListener('floating-chat-fab-visibility', handleVisibility as EventListener);
    };
  }, []);

  useEffect(() => {
    const canShowPinnedShortcuts = pinnedShortcutChannels.length > 0 && !isLauncherOpen && !isComposerSendHovered;

    if (!canShowPinnedShortcuts) {
      if (pinnedShortcutsTimeoutRef.current) {
        window.clearTimeout(pinnedShortcutsTimeoutRef.current);
        pinnedShortcutsTimeoutRef.current = null;
      }
      setShowPinnedShortcuts(false);
      return;
    }

    if (isFabHovered || isPinnedShortcutsHovered) {
      if (pinnedShortcutsTimeoutRef.current) {
        window.clearTimeout(pinnedShortcutsTimeoutRef.current);
        pinnedShortcutsTimeoutRef.current = null;
      }
      setShowPinnedShortcuts(true);
      return;
    }

    if (!showPinnedShortcuts) {
      return;
    }

    pinnedShortcutsTimeoutRef.current = window.setTimeout(() => {
      setShowPinnedShortcuts(false);
      pinnedShortcutsTimeoutRef.current = null;
    }, 2500);

    return () => {
      if (pinnedShortcutsTimeoutRef.current) {
        window.clearTimeout(pinnedShortcutsTimeoutRef.current);
        pinnedShortcutsTimeoutRef.current = null;
      }
    };
  }, [
    isComposerSendHovered,
    isFabHovered,
    isLauncherOpen,
    isPinnedShortcutsHovered,
    pinnedShortcutChannels.length,
    showPinnedShortcuts,
  ]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((previous) => (
      previous.includes(userId)
        ? previous.filter((value) => value !== userId)
        : [...previous, userId]
    ));
  };

  const startDm = (userId: string) => {
    openChat('dm', userId);
  };

  const createGroup = () => {
    if (selectedUsers.length < 2) {
      return;
    }

    const name = groupName.trim() || selectedUsers
      .map((id) => users.find((user) => user.id === id)?.name.split(' ')[0])
      .filter(Boolean)
      .join(', ');

    openChat('group', `new-group-${Date.now()}`, name);
  };

  return (
    <>
      <AnimatePresence mode="popLayout">
        {openWindows.map((chat, index) => (
          <FloatingChatWindow key={chat.id} chat={chat} index={index} />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {showPinnedShortcuts && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className="fixed bottom-[74px] right-5 z-[58] flex max-h-[180px] flex-col-reverse items-end gap-2"
            onMouseEnter={() => setIsPinnedShortcutsHovered(true)}
            onMouseLeave={() => setIsPinnedShortcutsHovered(false)}
          >
            {pinnedShortcutChannels.map((channel) => (
              <motion.div
                key={`${channel.spaceId}-${channel.channelId}`}
                layout
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="group relative"
              >
                <div className="pointer-events-none absolute right-[calc(100%+10px)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-xl bg-[#1f2333] px-3 py-2 text-right shadow-xl group-hover:block dark:bg-[#10131b]">
                  <p className="text-[11px] font-semibold text-white/70">{channel.spaceName}</p>
                  <p className="text-[12px] font-bold text-white">#{channel.channelName}</p>
                </div>
                <button
                  onClick={() => {
                    openChat('space', channel.channelId, `#${channel.channelName}`, {
                      spaceId: channel.spaceId,
                      spaceName: channel.spaceName,
                      spaceIcon: channel.spaceIcon,
                      channelType: channel.channelType,
                    });
                  }}
                  className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f0f0] text-[20px] shadow-xl shadow-black/20 ring-2 ring-white transition-all hover:scale-110 hover:shadow-2xl hover:shadow-[#5b5fc7]/20 dark:bg-[#333] dark:ring-[#1e1f22]"
                  title={`${channel.spaceName} · #${channel.channelName}`}
                >
                  <span>{channel.spaceIcon}</span>
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#5b5fc7] text-white shadow-md">
                    <Pin size={10} className="fill-current" />
                  </span>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {minimizedChats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            className={`fixed right-5 z-[59] flex flex-col-reverse items-end gap-2 ${showPinnedShortcuts ? 'bottom-[264px]' : 'bottom-[74px]'}`}
          >
            {minimizedChats.map((chat) => (
              <motion.div
                key={chat.id}
                layout
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="group relative"
              >
                <button
                  onClick={() => focusChat(chat.id)}
                  className="relative h-12 w-12 rounded-full shadow-xl shadow-black/20 ring-2 ring-white transition-all hover:scale-110 hover:shadow-2xl hover:shadow-[#5b5fc7]/20 dark:ring-[#1e1f22]"
                  title={chat.name}
                >
                  {chat.chatType === 'dm' && chat.avatar ? (
                    <img src={chat.avatar} alt={chat.name} className="h-full w-full rounded-full object-cover" />
                  ) : chat.chatType === 'space' && chat.spaceIcon ? (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#f0f0f0] text-[20px] dark:bg-[#333]">
                      {chat.spaceIcon}
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#7b7dd8] to-[#5b5fc7]">
                      <Users size={18} className="text-white" />
                    </div>
                  )}
                  {chat.status === 'online' && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#237b4b] dark:border-[#1e1f22]" />
                  )}
                </button>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    closeChat(chat.id);
                  }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#c4314b] text-white opacity-0 shadow-md transition-opacity hover:bg-[#a82a3f] group-hover:opacity-100"
                >
                  <X size={10} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={popoverRef}
        className="fixed bottom-5 right-5 z-[58]"
        onMouseEnter={() => setIsFabHovered(true)}
        onMouseLeave={() => setIsFabHovered(false)}
        animate={{
          opacity: isComposerSendHovered ? 0 : 1,
          scale: isComposerSendHovered ? 0.92 : 1,
          pointerEvents: isComposerSendHovered ? 'none' : 'auto',
        }}
        transition={{ duration: 0.14, ease: 'easeOut' }}
      >
        <AnimatePresence>
          {isLauncherOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="absolute bottom-[48px] right-0 max-h-[calc(100vh-132px)] w-[320px] overflow-hidden rounded-2xl border border-[#e1dfdd] bg-white shadow-2xl shadow-black/15 dark:border-[#3d3d3d] dark:bg-[#252525]"
            >
              <div className="flex items-center justify-between bg-gradient-to-r from-[#5b5fc7] to-[#4b4fb7] px-4 py-3">
                <div className="flex items-center gap-2">
                  {popoverView !== 'list' && (
                    <button
                      onClick={() => {
                        setPopoverView('list');
                        setSearchQuery('');
                        setSelectedUsers([]);
                        setGroupName('');
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                    >
                      <ArrowLeft size={16} />
                    </button>
                  )}
                  {popoverView === 'list' && <MessageSquare size={16} className="text-white" />}
                  <h3 className="text-[14px] font-bold text-white">
                    {popoverView === 'list' ? t('channel.chatTitle') : popoverView === 'new-dm' ? t('floatingChat.newMessage') : t('floatingChat.newGroup')}
                  </h3>
                </div>
                {popoverView === 'list' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setPopoverView('new-dm');
                        setSearchQuery('');
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                      title={t('floatingChat.newMessage')}
                    >
                      <UserPlus size={15} />
                    </button>
                    <button
                      onClick={() => {
                        setPopoverView('new-group');
                        setSearchQuery('');
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                      title={t('floatingChat.newGroup')}
                    >
                      <UsersRound size={15} />
                    </button>
                  </div>
                )}
              </div>

              <div className="border-b border-[#e1dfdd] px-4 py-3 dark:border-[#3d3d3d]">
                <div className="flex items-center gap-2 rounded-xl border border-[#e1dfdd] bg-[#f7f7f8] px-3 py-2 dark:border-[#3d3d3d] dark:bg-[#2e2f33]">
                  <Search size={14} className="text-[#8a8a8a]" />
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={popoverView === 'list' ? t('floatingChat.searchChatsOrChannels') : t('floatingChat.searchPeople')}
                    className="w-full bg-transparent text-[13px] text-[#242424] outline-none placeholder:text-[#8a8a8a] dark:text-[#f2f3f5]"
                  />
                </div>
                {popoverView === 'new-group' && (
                  <input
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                    placeholder={t('floatingChat.groupNameOptional')}
                    className="mt-2 w-full rounded-xl border border-[#e1dfdd] bg-[#f7f7f8] px-3 py-2 text-[13px] text-[#242424] outline-none placeholder:text-[#8a8a8a] dark:border-[#3d3d3d] dark:bg-[#2e2f33] dark:text-[#f2f3f5]"
                  />
                )}
              </div>

              <div className="max-h-[420px] overflow-y-auto px-2 py-2">
                {popoverView === 'list' && (
                  <>
                    <div className="pb-2">
                      <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a8a8a]">{t('channel.directMessages')}</p>
                      {filteredDMs.map((dm) => {
                        const user = users.find((item) => item.id === dm.userId);
                        if (!user) {
                          return null;
                        }

                        return (
                          <button
                            key={dm.id}
                            onClick={() => startDm(dm.userId)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-[#f3f3f7] dark:hover:bg-[#2e3037]"
                          >
                            <div className="relative">
                              <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
                              <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-[#252525] ${statusColors[user.status]}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-semibold text-[#242424] dark:text-[#f2f3f5]">{user.name}</p>
                              <p className="truncate text-[11px] text-[#8a8a8a]">{dm.lastMessage || t('floatingChat.noRecentMessages')}</p>
                            </div>
                            {(dm.unreadCount || 0) > 0 && (
                              <span className="rounded-full bg-[#c4314b] px-2 py-0.5 text-[11px] font-bold text-white">
                                {dm.unreadCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pb-2">
                      <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a8a8a]">{t('floatingChat.groups')}</p>
                      {filteredGroups.map((group) => (
                        <button
                          key={group.id}
                          onClick={() => {
                            openChat('group', group.id);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-[#f3f3f7] dark:hover:bg-[#2e3037]"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7b7dd8] to-[#5b5fc7]">
                            <Users size={16} className="text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold text-[#242424] dark:text-[#f2f3f5]">{group.name}</p>
                            <p className="truncate text-[11px] text-[#8a8a8a]">{t('chat.membersCount', { count: group.members.length })}</p>
                          </div>
                          {(group.unreadCount || 0) > 0 && (
                            <span className="rounded-full bg-[#c4314b] px-2 py-0.5 text-[11px] font-bold text-white">
                              {group.unreadCount}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {filteredUnreadSpaceChannels.length > 0 && (
                      <div className="pb-2">
                        <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a8a8a]">{t('floatingChat.unreadChannels')}</p>
                        <div className="space-y-1">
                          {groupedUnreadSpaceChannels.map((spaceGroup) => (
                            <div key={spaceGroup.spaceId} className="px-2">
                              <div className="flex items-center gap-2 py-1 text-[12px] font-semibold text-[#5f6287] dark:text-[#b8bce8]">
                                <span className="text-[14px] leading-none">{spaceGroup.spaceIcon}</span>
                                <span className="truncate">{spaceGroup.spaceName}</span>
                              </div>
                              <div className="ml-3 border-l border-[#d9dcef] pl-2 dark:border-[#3b3f5c]">
                                {spaceGroup.channels.map((channel) => (
                                <button
                                  key={`${channel.spaceId}-${channel.id}`}
                                  onClick={() => {
                                    openChat('space', channel.id, `#${channel.name}`, {
                                      spaceId: channel.spaceId,
                                      spaceName: channel.spaceName,
                                      spaceIcon: channel.spaceIcon,
                                      channelType: channel.type,
                                    });
                                    closeLauncher();
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[#f3f3f7] dark:hover:bg-[#2e3037]"
                                >
                                  <div className="flex h-6 w-6 items-center justify-center text-[#5b5fc7]">
                                    {getChannelIcon(channel.type)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[12px] font-semibold text-[#242424] dark:text-[#f2f3f5]">#{channel.name}</p>
                                  </div>
                                  <span className="rounded-full bg-[#c4314b] px-2 py-0.5 text-[11px] font-bold text-white">
                                    {channel.unreadCount}
                                  </span>
                                </button>
                              ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredPinnedChannels.length > 0 && (
                      <div className="pb-2">
                        <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a8a8a]">{t('floatingChat.pinnedChannels')}</p>
                        {filteredPinnedChannels.map((channel) => (
                          <button
                            key={`${channel.spaceId}-${channel.channelId}`}
                            onClick={() => {
                              openChat('space', channel.channelId, `#${channel.channelName}`, {
                                spaceId: channel.spaceId,
                                spaceName: channel.spaceName,
                                spaceIcon: channel.spaceIcon,
                                channelType: channel.channelType,
                              });
                              closeLauncher();
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-[#f3f3f7] dark:hover:bg-[#2e3037]"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3edf8] text-[#5b5fc7] dark:bg-[#3a3147]">
                              <Pin size={15} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-semibold text-[#242424] dark:text-[#f2f3f5]">#{channel.channelName}</p>
                              <p className="truncate text-[11px] text-[#8a8a8a]">{channel.spaceName}</p>
                            </div>
                            <div className="text-[#8a8a8a]">
                              {getChannelIcon(channel.channelType)}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {(popoverView === 'new-dm' || popoverView === 'new-group') && (
                  <div className="space-y-1">
                    {filteredUsers.map((user) => {
                      const selected = selectedUsers.includes(user.id);
                      return (
                        <button
                          key={user.id}
                          onClick={() => popoverView === 'new-dm' ? startDm(user.id) : toggleUserSelection(user.id)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                            selected ? 'bg-[#efecff] dark:bg-[#352f4b]' : 'hover:bg-[#f3f3f7] dark:hover:bg-[#2e3037]'
                          }`}
                        >
                          <div className="relative">
                            <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
                            <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-[#252525] ${statusColors[user.status]}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold text-[#242424] dark:text-[#f2f3f5]">{user.name}</p>
                            <p className="text-[11px] capitalize text-[#8a8a8a]">{user.status}</p>
                          </div>
                          {popoverView === 'new-group' && selected && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5b5fc7] text-white">
                              <Check size={14} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {popoverView === 'new-group' && (
                <div className="border-t border-[#e1dfdd] p-3 dark:border-[#3d3d3d]">
                  <button
                    onClick={createGroup}
                    disabled={selectedUsers.length < 2}
                    className="w-full rounded-xl bg-[#5b5fc7] px-3 py-2 text-[13px] font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t('floatingChat.createGroup')}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggleLauncher}
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#5b5fc7] to-[#4b4fb7] text-white shadow-2xl shadow-[#5b5fc7]/30 transition-transform hover:scale-105"
          title={t('floatingChat.openLauncher')}
        >
          {isLauncherOpen ? <X size={18} /> : <MessageSquare size={18} />}
          {!isLauncherOpen && totalUnread > 0 && (
            <span className="absolute -right-1 -top-1 min-w-[22px] rounded-full bg-[#c4314b] px-1.5 py-0.5 text-[11px] font-bold text-white">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </button>

        {!isLauncherOpen && (
          <button
            onClick={() => {
              toggleLauncher();
              setPopoverView('new-dm');
            }}
            className="absolute -left-2.5 -top-2.5 flex h-7 w-7 items-center justify-center rounded-full border border-white bg-white text-[#5b5fc7] shadow-lg transition-transform hover:scale-105 dark:border-[#2b2d31] dark:bg-[#2b2d31]"
            title={t('floatingChat.newMessage')}
          >
            <Plus size={14} />
          </button>
        )}
      </motion.div>
    </>
  );
}
