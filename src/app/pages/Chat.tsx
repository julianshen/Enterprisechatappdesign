import { useParams } from 'react-router';
import { Phone, Video, MoreHorizontal, Smile, Paperclip, Image as ImageIcon, Info } from 'lucide-react';
import { messages as mockMessages, threads as mockThreads, users, groupChats, Message, Thread, currentUser } from '../data/mockData';
import { MessageItem } from '../components/MessageItem';
import { MessageThread } from '../components/MessageThread';
import { useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { RichMessageInput } from '../components/RichMessageInput';
import { Button } from '../components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '../components/ui/tooltip';
import { Separator } from '../components/ui/separator';

export function Chat() {
  const { chatType, chatId } = useParams();
  const [activeThread, setActiveThread] = useState<string | null>(null);

  const isGroup = chatType === 'group';
  const isDM = chatType === 'dm';
  
  const initialMessages = isDM 
    ? mockMessages[`dm-${chatId}`] || []
    : isGroup 
    ? mockMessages[chatId || ''] || []
    : [];

  const [chatMessages, setChatMessages] = useState<Message[]>(initialMessages);
  const [localThreads, setLocalThreads] = useState<Record<string, Thread>>(() => ({ ...mockThreads }));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Re-sync when chat changes
  const [prevChatKey, setPrevChatKey] = useState(`${chatType}-${chatId}`);
  const chatKey = `${chatType}-${chatId}`;
  if (chatKey !== prevChatKey) {
    setPrevChatKey(chatKey);
    setChatMessages(
      isDM ? mockMessages[`dm-${chatId}`] || [] :
      isGroup ? mockMessages[chatId || ''] || [] : []
    );
    setActiveThread(null);
  }

  // Thread lookup — create an empty thread on-the-fly if the message has no thread yet
  const getOrCreateThread = useCallback((messageId: string): Thread => {
    if (localThreads[messageId]) return localThreads[messageId];
    const newThread: Thread = {
      id: `thread-${messageId}`,
      parentMessageId: messageId,
      messages: [],
    };
    setLocalThreads(prev => ({ ...prev, [messageId]: newThread }));
    return newThread;
  }, [localThreads]);

  const handleOpenThread = useCallback((messageId: string) => {
    getOrCreateThread(messageId);
    setActiveThread(messageId);
  }, [getOrCreateThread]);

  const activeThreadData = activeThread ? localThreads[activeThread] ?? null : null;
  const parentMessage = activeThreadData ? chatMessages.find(m => m.id === activeThreadData.parentMessageId) : null;
    
  const chatUser = isDM ? users.find(u => u.id === chatId) : null;
  const groupChat = isGroup ? groupChats.find(g => g.id === chatId) : null;

  const chatName = isDM ? chatUser?.name : isGroup ? groupChat?.name : 'Chat';
  const chatSubtitle = isGroup ? `${groupChat?.members.length} members` : chatUser?.status;

  const handleMessageUpdate = (updated: Message) => {
    setChatMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleMessageDelete = (id: string) => {
    setChatMessages(prev => prev.filter(m => m.id !== id));
  };

  // Thread reply handler
  const handleThreadReply = useCallback((parentMessageId: string, content: string) => {
    const newReply: Message = {
      id: `thread-reply-${Date.now()}`,
      userId: currentUser.id,
      content,
      timestamp: new Date(),
    };
    setLocalThreads(prev => {
      const existing = prev[parentMessageId];
      if (existing) {
        return { ...prev, [parentMessageId]: { ...existing, messages: [...existing.messages, newReply] } };
      }
      return {
        ...prev,
        [parentMessageId]: {
          id: `thread-${parentMessageId}`,
          parentMessageId,
          messages: [newReply],
        },
      };
    });
    setChatMessages(prev => prev.map(m => {
      if (m.id === parentMessageId) {
        const existingThread = localThreads[parentMessageId];
        const replyCount = existingThread ? existingThread.messages.length + 1 : 1;
        return {
          ...m,
          threadCount: replyCount,
          threadPreview: content.slice(0, 80) + (content.length > 80 ? '...' : ''),
        };
      }
      return m;
    }));
  }, [localThreads]);

  // Main channel send handler
  const handleSendMessage = useCallback((content: string) => {
    const newMsg: Message = {
      id: `chat-msg-${Date.now()}`,
      userId: currentUser.id,
      content,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, newMsg]);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  return (
    <div className="flex-1 flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-[#faf9f8] dark:from-[#313338] dark:to-[#2b2d31]">
        {/* Chat Header */}
        <div className="h-[60px] px-6 flex items-center justify-between border-b border-[#e1dfdd] dark:border-[#3d3d3d] backdrop-blur-md bg-white/80 dark:bg-[#313338]/80 shadow-sm">
          <div className="flex items-center gap-3">
            {isDM && chatUser && (
              <div className="relative">
                <img
                  src={chatUser.avatar}
                  alt={chatUser.name}
                  className="w-10 h-10 rounded-full ring-2 ring-[#e8e8e8] dark:ring-[#404249]"
                />
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${
                  chatUser.status === 'online' ? 'bg-[#92c353]' :
                  chatUser.status === 'away' ? 'bg-[#ffaa44]' :
                  chatUser.status === 'busy' ? 'bg-[#c4314b]' : 'bg-[#858585]'
                } rounded-full border-2 border-white dark:border-[#313338]`} />
              </div>
            )}
            {isGroup && (
              <div className="w-10 h-10 bg-gradient-to-br from-[#7b7dd8] to-[#6264a7] rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {groupChat?.name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="font-bold text-[#242424] dark:text-[#f2f3f5] text-[16px]">{chatName}</h2>
              {chatSubtitle && (
                <p className="text-xs text-[#616161] dark:text-[#b9bbbe] capitalize">{chatSubtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[
              { icon: <Phone size={18} />, label: 'Audio call' },
              { icon: <Video size={18} />, label: 'Video call' },
            ].map(btn => (
              <Tooltip key={btn.label}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-[#616161] dark:text-[#b9bbbe] hover:text-[#242424] dark:hover:text-[#f2f3f5]">
                    {btn.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4}>{btn.label}</TooltipContent>
              </Tooltip>
            ))}
            <Separator orientation="vertical" className="mx-1 h-6 bg-[#e1dfdd] dark:bg-[#3d3d3d]" />
            {[
              { icon: <Info size={18} />, label: 'Info' },
              { icon: <MoreHorizontal size={18} />, label: 'More' },
            ].map(btn => (
              <Tooltip key={btn.label}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-[#616161] dark:text-[#b9bbbe] hover:text-[#242424] dark:hover:text-[#f2f3f5]">
                    {btn.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4}>{btn.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {/* Chat Start */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="px-6 py-6 border-b border-[#e1dfdd] dark:border-[#3d3d3d]"
          >
            <div className="flex items-center gap-3 mb-3">
              {isDM && chatUser && (
                <img
                  src={chatUser.avatar}
                  alt={chatUser.name}
                  className="w-16 h-16 rounded-full ring-4 ring-[#e8e8e8] dark:ring-[#404249] shadow-lg"
                />
              )}
              {isGroup && (
                <div className="w-16 h-16 bg-gradient-to-br from-[#7b7dd8] to-[#6264a7] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-[#6264a7]/20">
                  {groupChat?.name.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-black text-[#242424] dark:text-[#f2f3f5] mb-2">
              {chatName}
            </h3>
            <p className="text-[15px] text-[#616161] dark:text-[#b9bbbe] leading-relaxed">
              {isDM && `This is the beginning of your direct message history with ${chatUser?.name}.`}
              {isGroup && `This is the beginning of the ${groupChat?.name} group chat.`}
            </p>
          </motion.div>

          {/* Messages List */}
          <div className="py-2">
            {chatMessages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onThreadClick={() => handleOpenThread(message.id)}
                onMessageUpdate={handleMessageUpdate}
                onMessageDelete={handleMessageDelete}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="px-6 pb-6 pt-3"
        >
          <div className="border border-[#e1dfdd] dark:border-[#5a5a5a] rounded-xl focus-within:border-[#6264a7] dark:focus-within:border-[#5865f2] bg-white dark:bg-[#383a40] shadow-lg transition-all focus-within:shadow-xl px-4 py-3">
            <RichMessageInput
              placeholder={`Message ${chatName}`}
              onSend={handleSendMessage}
              extraButtons={
                <>
                  {[
                    { icon: <Paperclip size={15} />, label: 'Attach file' },
                    { icon: <ImageIcon size={15} />, label: 'Insert image' },
                    { icon: <Smile size={15} />, label: 'Emoji' },
                  ].map(btn => (
                    <Tooltip key={btn.label}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#616161] dark:text-[#b9bbbe] hover:text-[#242424] dark:hover:text-[#dbdee1] hover:bg-[#f5f5f5] dark:hover:bg-[#4e5058]"
                        >
                          {btn.icon}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={4}>{btn.label}</TooltipContent>
                    </Tooltip>
                  ))}
                </>
              }
            />
          </div>
        </motion.div>
      </div>

      {/* Thread Panel */}
      <AnimatePresence>
        {activeThreadData && parentMessage && (
          <MessageThread
            parentMessage={parentMessage}
            thread={activeThreadData}
            onClose={() => setActiveThread(null)}
            onMessageUpdate={handleMessageUpdate}
            onMessageDelete={handleMessageDelete}
            onReply={handleThreadReply}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
