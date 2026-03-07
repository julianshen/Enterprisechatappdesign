import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'motion/react';
import { Image as ImageIcon, Maximize2, Minimize2, Minus, Paperclip, Phone, Send, Smile, Users, Video, X } from 'lucide-react';
import { MarkdownContent } from '@/components/ui';
import { currentUser, groupChats, messages as mockMessages, users, type Message } from '../data/mockData';
import { useFloatingChat, type FloatingChatInstance } from '../context/FloatingChatContext';
import { useI18n } from '../context/I18nContext';

interface FloatingChatWindowProps {
  chat: FloatingChatInstance;
  index: number;
}

const statusColors: Record<string, string> = {
  online: 'bg-[#237b4b]',
  away: 'bg-[#d4820c]',
  busy: 'bg-[#c4314b]',
  offline: 'bg-[#8a8a8a]',
};

export const FloatingChatWindow = forwardRef<HTMLDivElement, FloatingChatWindowProps>(
  function FloatingChatWindow({ chat, index }, ref) {
    const { closeChat, focusChat, focusedChatId, toggleMinimize } = useFloatingChat();
    const { t } = useI18n();
    const [expanded, setExpanded] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [chatMessages, setChatMessages] = useState<Message[]>(() => {
      if (chat.chatType === 'dm') {
        return mockMessages[`dm-${chat.chatId}`] || [];
      }
      return mockMessages[chat.chatId] || [];
    });

    const isFocused = focusedChatId === chat.id;
    const isDm = chat.chatType === 'dm';
    const isSpace = chat.chatType === 'space';
    const chatUser = isDm ? users.find((user) => user.id === chat.chatId) : null;
    const groupChat = useMemo(() => {
      return chat.chatType === 'group'
        ? groupChats.find((group) => group.id === chat.chatId)
        : null;
    }, [chat.chatId, chat.chatType]);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    useEffect(() => {
      if (isFocused && !chat.minimized) {
        window.setTimeout(() => inputRef.current?.focus(), 80);
      }
    }, [chat.minimized, isFocused]);

    const handleSend = () => {
      const nextContent = inputValue.trim();
      if (!nextContent) {
        return;
      }

      setChatMessages((previous) => [
        ...previous,
        {
          id: `floating-msg-${Date.now()}`,
          userId: currentUser.id,
          content: nextContent,
          timestamp: new Date(),
        },
      ]);
      setInputValue('');
    };

    const width = expanded ? 400 : 328;
    const bodyHeight = expanded ? 520 : 420;
    const rightOffset = index * (expanded ? 420 : 348) + 16;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 48, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 48, scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        className="fixed bottom-0 z-[60] flex flex-col"
        style={{ right: rightOffset, width }}
        onClick={() => focusChat(chat.id)}
      >
        <div
          className={`flex items-center gap-2 rounded-t-xl px-3 py-2.5 transition-all ${
            isFocused
              ? 'bg-gradient-to-r from-[#5b5fc7] to-[#4b4fb7] shadow-lg shadow-[#5b5fc7]/20'
              : 'bg-gradient-to-r from-[#424242] to-[#383838] dark:from-[#3d3d3d] dark:to-[#353535]'
          }`}
          onDoubleClick={() => toggleMinimize(chat.id)}
        >
          <div className="relative shrink-0">
            {isDm && chatUser ? (
              <>
                <img src={chatUser.avatar} alt={chatUser.name} className="h-8 w-8 rounded-full ring-2 ring-white/20" />
                <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#5b5fc7] ${statusColors[chatUser.status]}`} />
              </>
            ) : isSpace ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-[16px]">
                {chat.spaceIcon || '💬'}
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                <Users size={14} className="text-white" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">{chat.name}</p>
            {isDm && chatUser && <p className="text-[10px] capitalize text-white/60">{chatUser.status}</p>}
            {isSpace && chat.spaceName && <p className="text-[10px] text-white/60">{chat.spaceName}</p>}
            {groupChat && <p className="text-[10px] text-white/60">{t('chat.membersCount', { count: groupChat.members.length })}</p>}
          </div>

          <div className="flex items-center gap-0.5">
            <button className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white" title={t('chat.videoCall')}>
              <Video size={14} />
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white" title={t('chat.audioCall')}>
              <Phone size={14} />
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                setExpanded((previous) => !previous);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
              title={expanded ? t('floatingChat.shrink') : t('floatingChat.expand')}
            >
              {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                toggleMinimize(chat.id);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
              title={t('floatingChat.minimize')}
            >
              <Minus size={14} />
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                closeChat(chat.id);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
              title={t('floatingChat.close')}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {!chat.minimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: bodyHeight, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="flex flex-col overflow-hidden rounded-b-lg border-x border-b border-[#e1dfdd] bg-white shadow-2xl shadow-black/15 dark:border-[#3d3d3d] dark:bg-[#313338]"
            >
              <div className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
                {chatMessages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#5b5fc7]/10">
                      {isDm && chatUser ? (
                        <img src={chatUser.avatar} alt="" className="h-10 w-10 rounded-full" />
                      ) : isSpace ? (
                        <span className="text-[24px]">{chat.spaceIcon || '💬'}</span>
                      ) : (
                        <Users size={22} className="text-[#5b5fc7]" />
                      )}
                    </div>
                    <p className="text-[13px] font-semibold text-[#242424] dark:text-[#f2f3f5]">{chat.name}</p>
                    {isSpace && chat.spaceName && <p className="mt-0.5 text-[11px] text-[#8a8a8a]">{chat.spaceName}</p>}
                    <p className="mt-1 text-[11px] text-[#8a8a8a]">
                      {isSpace ? t('floatingChat.pinnedSpaceChannel') : isDm ? t('floatingChat.startConversation') : t('floatingChat.startGroupChat')}
                    </p>
                  </div>
                )}

                {chatMessages.map((message) => {
                  const sender = users.find((user) => user.id === message.userId);
                  const isOwn = message.userId === currentUser.id;

                  return (
                    <div key={message.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      {!isOwn && sender && (
                        <img src={sender.avatar} alt={sender.name} className="mt-1 h-7 w-7 shrink-0 rounded-full" />
                      )}

                      <div className={`max-w-[80%] ${isOwn ? 'items-end' : 'items-start'}`}>
                        {!isOwn && sender && (
                          <p className="mb-0.5 px-1 text-[10px] font-medium text-[#616161] dark:text-[#8a8a8a]">{sender.name}</p>
                        )}
                        <div
                          className={`rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                            isOwn
                              ? 'rounded-br-md bg-gradient-to-br from-[#5b5fc7] to-[#4b4fb7] text-white'
                              : 'rounded-bl-md bg-[#f0f0f0] text-[#242424] dark:bg-[#383a40] dark:text-[#e0e0e0]'
                          }`}
                        >
                          <MarkdownContent content={message.content} variant={isOwn ? 'light' : 'auto'} />
                        </div>
                        <p className={`mt-0.5 px-1 text-[9px] text-[#b9bbbe] dark:text-[#4a4a4a] ${isOwn ? 'text-right' : ''}`}>
                          {format(message.timestamp, 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              <div className="px-3 pb-3 pt-1">
                <div className="flex items-end gap-1.5 rounded-xl border border-[#e1dfdd] bg-[#f5f5f5] px-2 py-1.5 transition-colors focus-within:border-[#5b5fc7] dark:border-[#4d4d4d] dark:bg-[#383a40]">
                  <button className="flex h-7 w-7 shrink-0 items-center justify-center text-[#8a8a8a] transition-colors hover:text-[#5b5fc7]">
                    <Paperclip size={15} />
                  </button>
                  <button className="flex h-7 w-7 shrink-0 items-center justify-center text-[#8a8a8a] transition-colors hover:text-[#5b5fc7]">
                    <ImageIcon size={15} />
                  </button>
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={t('floatingChat.inputPlaceholder')}
                    rows={1}
                    className="max-h-[80px] flex-1 resize-none overflow-y-auto bg-transparent py-1 text-[13px] text-[#242424] outline-none placeholder:text-[#8a8a8a] dark:text-[#e0e0e0]"
                  />
                  <button className="flex h-7 w-7 shrink-0 items-center justify-center text-[#8a8a8a] transition-colors hover:text-[#5b5fc7]">
                    <Smile size={15} />
                  </button>
                  {inputValue.trim() && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={handleSend}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5b5fc7] text-white transition-colors hover:bg-[#4b4fb7]"
                    >
                      <Send size={13} />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);
