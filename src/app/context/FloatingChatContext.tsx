import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { groupChats, spaces, users } from '../data/mockData';

export interface FloatingChatInstance {
  id: string;
  chatType: 'dm' | 'group' | 'space';
  chatId: string;
  minimized: boolean;
  name: string;
  avatar?: string;
  status?: string;
  spaceId?: string;
  spaceName?: string;
  spaceIcon?: string;
  channelType?: 'text' | 'announcement' | 'private';
}

export interface PinnedChannel {
  channelId: string;
  channelName: string;
  channelType: 'text' | 'announcement' | 'private';
  spaceId: string;
  spaceName: string;
  spaceIcon: string;
}

interface FloatingChatContextValue {
  openChats: FloatingChatInstance[];
  focusedChatId: string | null;
  pinnedChannels: PinnedChannel[];
  isLauncherOpen: boolean;
  openChat: (
    chatType: 'dm' | 'group' | 'space',
    chatId: string,
    customName?: string,
    spaceMeta?: Omit<PinnedChannel, 'channelId' | 'channelName'>,
  ) => void;
  openLauncher: () => void;
  closeLauncher: () => void;
  toggleLauncher: () => void;
  closeChat: (id: string) => void;
  toggleMinimize: (id: string) => void;
  focusChat: (id: string) => void;
  togglePinChannel: (channel: PinnedChannel) => void;
  isChannelPinned: (spaceId: string, channelId: string) => boolean;
}

const FloatingChatContext = createContext<FloatingChatContextValue | null>(null);

const MAX_OPEN_WINDOWS = 3;

function getPinnedChannelKey(spaceId: string, channelId: string) {
  return `${spaceId}:${channelId}`;
}

function readPinnedChannels(): PinnedChannel[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem('pinnedChannels');
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as PinnedChannel[];
    return parsed.filter((channel) => channel.spaceId && channel.channelId);
  } catch {
    return [];
  }
}

export function FloatingChatProvider({ children }: { children: ReactNode }) {
  const [openChats, setOpenChats] = useState<FloatingChatInstance[]>([]);
  const [focusedChatId, setFocusedChatId] = useState<string | null>(null);
  const [pinnedChannels, setPinnedChannels] = useState<PinnedChannel[]>(readPinnedChannels);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  const persistPinnedChannels = useCallback((next: PinnedChannel[]) => {
    setPinnedChannels(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('pinnedChannels', JSON.stringify(next));
    }
  }, []);

  const togglePinChannel = useCallback((channel: PinnedChannel) => {
    const targetKey = getPinnedChannelKey(channel.spaceId, channel.channelId);
    const exists = pinnedChannels.some((item) => getPinnedChannelKey(item.spaceId, item.channelId) === targetKey);
    const next = exists
      ? pinnedChannels.filter((item) => getPinnedChannelKey(item.spaceId, item.channelId) !== targetKey)
      : [...pinnedChannels, channel];

    persistPinnedChannels(next);
  }, [persistPinnedChannels, pinnedChannels]);

  const isChannelPinned = useCallback((spaceId: string, channelId: string) => {
    return pinnedChannels.some((channel) => (
      getPinnedChannelKey(channel.spaceId, channel.channelId) === getPinnedChannelKey(spaceId, channelId)
    ));
  }, [pinnedChannels]);

  const openChat = useCallback<FloatingChatContextValue['openChat']>((chatType, chatId, customName, spaceMeta) => {
    const id = `${chatType}-${chatId}`;

    setOpenChats((previous) => {
      const existing = previous.find((chat) => chat.id === id);
      if (existing) {
        return previous.map((chat) => (
          chat.id === id ? { ...chat, minimized: false } : chat
        ));
      }

      let name = customName ?? 'Chat';
      let avatar: string | undefined;
      let status: string | undefined;

      if (chatType === 'dm') {
        const user = users.find((item) => item.id === chatId);
        name = customName ?? user?.name ?? 'Unknown user';
        avatar = user?.avatar;
        status = user?.status;
      } else if (chatType === 'group') {
        const group = groupChats.find((item) => item.id === chatId);
        name = customName ?? group?.name ?? 'Group chat';
      } else if (spaceMeta) {
        const space = spaces.find((item) => item.id === spaceMeta.spaceId);
        const channel = space?.channels.find((item) => item.id === chatId);
        name = customName ?? (channel ? `#${channel.name}` : `#${chatId}`);
      }

      const nextChat: FloatingChatInstance = {
        id,
        chatType,
        chatId,
        minimized: false,
        name,
        avatar,
        status,
        ...(chatType === 'space' && spaceMeta ? {
          spaceId: spaceMeta.spaceId,
          spaceName: spaceMeta.spaceName,
          spaceIcon: spaceMeta.spaceIcon,
          channelType: spaceMeta.channelType,
        } : {}),
      };

      const activeWindows = previous.filter((chat) => !chat.minimized);
      if (activeWindows.length >= MAX_OPEN_WINDOWS) {
        const oldestOpenId = activeWindows[0]?.id;
        return [
          ...previous.map((chat) => (
            chat.id === oldestOpenId ? { ...chat, minimized: true } : chat
          )),
          nextChat,
        ];
      }

      return [...previous, nextChat];
    });

    setFocusedChatId(id);
    setIsLauncherOpen(false);
  }, []);

  const openLauncher = useCallback(() => {
    setIsLauncherOpen(true);
  }, []);

  const closeLauncher = useCallback(() => {
    setIsLauncherOpen(false);
  }, []);

  const toggleLauncher = useCallback(() => {
    setIsLauncherOpen((previous) => !previous);
  }, []);

  const closeChat = useCallback((id: string) => {
    setOpenChats((previous) => previous.filter((chat) => chat.id !== id));
    setFocusedChatId((previous) => previous === id ? null : previous);
  }, []);

  const toggleMinimize = useCallback((id: string) => {
    setOpenChats((previous) => previous.map((chat) => (
      chat.id === id ? { ...chat, minimized: !chat.minimized } : chat
    )));
  }, []);

  const focusChat = useCallback((id: string) => {
    setOpenChats((previous) => previous.map((chat) => (
      chat.id === id ? { ...chat, minimized: false } : chat
    )));
    setFocusedChatId(id);
  }, []);

  const value = useMemo<FloatingChatContextValue>(() => ({
    openChats,
    focusedChatId,
    pinnedChannels,
    isLauncherOpen,
    openChat,
    openLauncher,
    closeLauncher,
    toggleLauncher,
    closeChat,
    toggleMinimize,
    focusChat,
    togglePinChannel,
    isChannelPinned,
  }), [
    closeChat,
    closeLauncher,
    focusChat,
    focusedChatId,
    isLauncherOpen,
    isChannelPinned,
    openChat,
    openLauncher,
    openChats,
    pinnedChannels,
    toggleLauncher,
    toggleMinimize,
    togglePinChannel,
  ]);

  return (
    <FloatingChatContext.Provider value={value}>
      {children}
    </FloatingChatContext.Provider>
  );
}

export function useFloatingChat() {
  const context = useContext(FloatingChatContext);
  if (!context) {
    throw new Error('useFloatingChat must be used within FloatingChatProvider');
  }

  return context;
}
