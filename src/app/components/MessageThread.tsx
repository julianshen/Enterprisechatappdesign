import { RichMessageInput, Button, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui";
import { X, MessageSquare } from 'lucide-react';
import { Message, Thread, users, currentUser } from '../data/mockData';
import { MessageItem } from './MessageItem';
import { motion } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../context/I18nContext';

interface MessageThreadProps {
  parentMessage: Message;
  thread: Thread;
  onClose: () => void;
  onMessageUpdate?: (msg: Message) => void;
  onMessageDelete?: (id: string) => void;
  onReply?: (parentMessageId: string, content: string) => void;
}

export function MessageThread({ parentMessage, thread, onClose, onMessageUpdate, onMessageDelete, onReply }: MessageThreadProps) {
  const { t } = useI18n();
  const parentUser = users.find(u => u.id === parentMessage.userId);
  const [threadMessages, setThreadMessages] = useState<Message[]>(thread.messages);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync when thread changes (e.g. different thread opened)
  const [prevThreadId, setPrevThreadId] = useState(thread.id);
  if (thread.id !== prevThreadId) {
    setPrevThreadId(thread.id);
    setThreadMessages(thread.messages);
  }

  const handleThreadMessageUpdate = (updated: Message) => {
    setThreadMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleThreadMessageDelete = (id: string) => {
    setThreadMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleSendReply = (content: string) => {
    const newMsg: Message = {
      id: `thread-reply-${Date.now()}`,
      userId: currentUser.id,
      content,
      timestamp: new Date(),
    };
    setThreadMessages(prev => [...prev, newMsg]);
    // Also sync up to parent (updates threadCount, threadPreview, etc.)
    onReply?.(parentMessage.id, content);
    // Scroll to bottom after adding
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  };

  // Auto-scroll to bottom when thread opens
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }, [thread.id]);

  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className="w-[420px] bg-gradient-to-b from-white to-[#faf9f8] dark:from-[#2b2d31] dark:to-[#1e1f22] border-l border-[#e1dfdd] dark:border-[#3d3d3d] flex flex-col shadow-2xl"
    >
      {/* Thread Header */}
      <div className="h-[60px] px-4 flex items-center justify-between border-b border-[#e1dfdd] dark:border-[#3d3d3d] shadow-sm backdrop-blur-sm bg-white/80 dark:bg-[#2b2d31]/80">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
          <h3 className="font-bold text-[#242424] dark:text-[#f2f3f5] text-[16px]">{t('thread.title')}</h3>
          <span className="text-xs text-[#616161] dark:text-[#949ba4] font-medium bg-[#f0f0f5] dark:bg-[#383a40] px-2 py-0.5 rounded-full">
            {t('thread.replyCount', { count: threadMessages.length })}
          </span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-[#616161] dark:text-[#b9bbbe] hover:text-[#c4314b] dark:hover:text-[#ed4245] hover:bg-[#f5f5f5] dark:hover:bg-[#35373c]"
            >
              <X size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={4}>{t('thread.close')}</TooltipContent>
        </Tooltip>
      </div>

      {/* Thread Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-on-hover">
        {/* Parent Message */}
        <div className="border-b border-[#e1dfdd] dark:border-[#3d3d3d] py-3 bg-gradient-to-r from-[#f8f8f8] to-white dark:from-[#2e3035] dark:to-[#2b2d31]">
          <MessageItem
            message={parentMessage}
            isParent
            onMessageUpdate={onMessageUpdate}
            onMessageDelete={onMessageDelete}
          />
        </div>

        {/* Thread Replies */}
        <div className="py-3">
          {threadMessages.length > 0 && (
            <div className="px-4 text-xs text-[#616161] dark:text-[#b9bbbe] font-bold mb-3 uppercase tracking-wider">
              {t('thread.replyCount', { count: threadMessages.length })}
            </div>
          )}
          {threadMessages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onMessageUpdate={handleThreadMessageUpdate}
              onMessageDelete={handleThreadMessageDelete}
            />
          ))}
          {threadMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 flex items-center justify-center mb-3">
                <MessageSquare size={20} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
              </div>
              <p className="text-[14px] font-medium text-[#242424] dark:text-[#f2f3f5] mb-1">{t('thread.emptyTitle')}</p>
              <p className="text-[13px] text-[#616161] dark:text-[#949ba4]">
                {t('thread.emptySubtitle', { name: parentUser?.name ?? '' })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.25 }}
        className="p-4 border-t border-[#e1dfdd] dark:border-[#3d3d3d] bg-gradient-to-r from-white to-[#faf9f8] dark:from-[#232428] dark:to-[#1e1f22] shadow-lg"
      >
        <RichMessageInput
          placeholder={t('thread.replyPlaceholder', { name: parentUser?.name ?? '' })}
          onSend={handleSendReply}
          compact
          autoFocus
        />
      </motion.div>
    </motion.div>
  );
}
