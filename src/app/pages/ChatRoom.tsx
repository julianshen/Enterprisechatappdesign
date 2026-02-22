import { Button, Tooltip, TooltipTrigger, TooltipContent, Separator, RichMessageInput } from "@/components/ui";
import { useParams } from 'react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui";
import { Hash, Pin, Users, Search, Phone, Video, MoreHorizontal, Smile, Paperclip,
  Image as ImageIcon, Activity, MessageSquare, CheckSquare, Rocket, GitPullRequest,
  Shield, Target, AlertTriangle, ArrowUp, ArrowDown, Minus,
  type LucideIcon,
} from 'lucide-react';
import { spaces, messages as mockMessages, threads as mockThreads, Message, Thread, currentUser, type ChannelWidget } from '../data/mockData';
import { MessageItem } from '../components/MessageItem';
import { MessageThread } from '../components/MessageThread';
import { useState, useMemo, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useI18n } from '../context/I18nContext';

// ─── Widget icon / color maps (shared with SpaceHome) ───
const widgetIconMap: Record<string, LucideIcon> = {
  users: Users,
  activity: Activity,
  'message-square': MessageSquare,
  'check-square': CheckSquare,
  rocket: Rocket,
  'git-pull-request': GitPullRequest,
  shield: Shield,
  target: Target,
  phone: Phone,
  'alert-triangle': AlertTriangle,
};

const widgetColorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string; accent: string }> = {
  purple: { bg: 'bg-[#5b5fc7]/10', text: 'text-[#5b5fc7]', darkBg: 'dark:bg-[#5b5fc7]/20', darkText: 'dark:text-[#a6a9dc]', accent: '#5b5fc7' },
  blue: { bg: 'bg-[#2196f3]/10', text: 'text-[#2196f3]', darkBg: 'dark:bg-[#2196f3]/20', darkText: 'dark:text-[#64b5f6]', accent: '#2196f3' },
  green: { bg: 'bg-[#4caf50]/10', text: 'text-[#4caf50]', darkBg: 'dark:bg-[#4caf50]/20', darkText: 'dark:text-[#81c784]', accent: '#4caf50' },
  orange: { bg: 'bg-[#ff9800]/10', text: 'text-[#ff9800]', darkBg: 'dark:bg-[#ff9800]/20', darkText: 'dark:text-[#ffb74d]', accent: '#ff9800' },
  red: { bg: 'bg-[#f44336]/10', text: 'text-[#f44336]', darkBg: 'dark:bg-[#f44336]/20', darkText: 'dark:text-[#ef5350]', accent: "#f44336" },
};

// ─── Mini sparkline for dialog ───
function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  return (
    <svg width="100%" height="40" viewBox="0 0 200 40" preserveAspectRatio="none" className="rounded-md overflow-hidden">
      <defs>
        <linearGradient id={`cg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path
        d={`M0,${40 - ((data[0] - min) / range) * 36} ${data.map((v, i) => `L${(i / (data.length - 1)) * 200},${40 - ((v - min) / range) * 36}`).join(' ')} L200,40 L0,40 Z`}
        fill={`url(#cg-${color.replace('#','')})`}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={data.map((v, i) => `${(i / (data.length - 1)) * 200},${40 - ((v - min) / range) * 36}`).join(' ')}
      />
    </svg>
  );
}

// ─── Widget Detail Dialog ───
function WidgetDetailDialog({ widget, open, onOpenChange }: {
  widget: ChannelWidget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!widget || !widget.detail) return null;
  const Icon = widgetIconMap[widget.icon] || Activity;
  const colors = widgetColorMap[widget.color] || widgetColorMap.blue;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#252525] border-[#e1dfdd] dark:border-[#3d3d3d] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg} ${colors.darkBg}`}>
                <Icon size={20} className={`${colors.text} ${colors.darkText}`} />
              </div>
              <div>
                <DialogTitle className="text-[#242424] dark:text-[#f0f0f0] text-base">
                  {widget.detail.title}
                </DialogTitle>
                <DialogDescription className="text-[#8a8a8a] dark:text-[#6d6f78] text-xs mt-0.5">
                  {widget.detail.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {/* Current value highlight */}
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#242424] dark:text-[#f0f0f0]">{widget.value}</span>
            <span className="text-sm text-[#8a8a8a] dark:text-[#6d6f78]">{widget.label}</span>
          </div>
        </div>

        {/* Chart */}
        {widget.detail.chartData && widget.detail.chartData.length > 0 && (
          <div className="px-5 pb-3">
            <MiniChart data={widget.detail.chartData} color={colors.accent} />
          </div>
        )}

        {/* Detail Items */}
        <div className="border-t border-[#e1dfdd] dark:border-[#3d3d3d]">
          {widget.detail.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-5 py-2.5 border-b border-[#f5f5f5] dark:border-[#2f2f2f] last:border-b-0 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#242424] dark:text-[#e0e0e0] truncate">{item.label}</p>
                {item.sublabel && (
                  <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] mt-0.5">{item.sublabel}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-3">
                <span className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{item.value}</span>
                {item.trend === 'up' && <ArrowUp size={12} className="text-[#4caf50]" />}
                {item.trend === 'down' && <ArrowDown size={12} className="text-[#f44336]" />}
                {item.trend === 'neutral' && <Minus size={12} className="text-[#8a8a8a]" />}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ChatRoom() {
  const { spaceId, channelId } = useParams();
  const { t } = useI18n();
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<ChannelWidget | null>(null);

  const currentSpace = spaces.find(s => s.id === spaceId);
  const currentChannel = currentSpace?.channels.find(c => c.id === channelId);
  const widgets = currentChannel?.widgets;
  const initialMessages = channelId ? mockMessages[channelId] || [] : [];
  const [channelMessages, setChannelMessages] = useState<Message[]>(initialMessages);
  const [localThreads, setLocalThreads] = useState<Record<string, Thread>>(() => ({ ...mockThreads }));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Re-sync when channel changes
  const [prevChannelId, setPrevChannelId] = useState(channelId);
  if (channelId !== prevChannelId) {
    setPrevChannelId(channelId);
    setChannelMessages(channelId ? mockMessages[channelId] || [] : []);
    setActiveThread(null);
    setSelectedWidget(null);
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
  const parentMessage = activeThreadData ? channelMessages.find(m => m.id === activeThreadData.parentMessageId) : null;

  // Find latest pinned message for the inline chip
  const latestPinned = useMemo(() => {
    const pinned = channelMessages.filter(m => m.pinned);
    if (pinned.length === 0) return null;
    return pinned.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
  }, [channelMessages]);
  const pinnedCount = useMemo(() => channelMessages.filter(m => m.pinned).length, [channelMessages]);

  const handleMessageUpdate = (updated: Message) => {
    setChannelMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleMessageDelete = (id: string) => {
    setChannelMessages(prev => prev.filter(m => m.id !== id));
  };

  // Thread reply handler — adds the reply to local thread state and updates parent message preview
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
    // Update the parent message's threadCount and threadPreview
    setChannelMessages(prev => prev.map(m => {
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
      id: `ch-msg-${Date.now()}`,
      userId: currentUser.id,
      content,
      timestamp: new Date(),
    };
    setChannelMessages(prev => [...prev, newMsg]);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, []);

  if (!currentSpace || !currentChannel) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#616161] dark:text-[#b9bbbe] bg-gradient-to-br from-white via-[#faf9f8] to-[#f3f2f1] dark:from-[#2b2d31] dark:via-[#1e1f22] dark:to-[#1a1b1e]">
        {t('chatRoom.selectChannel')}
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-[#faf9f8] dark:from-[#313338] dark:to-[#2b2d31]">
        {/* Channel Header */}
        <div className="h-[60px] px-6 flex items-center justify-between border-b border-[#e1dfdd] dark:border-[#3d3d3d] backdrop-blur-md bg-white/80 dark:bg-[#313338]/80 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#7b7dd8] to-[#6264a7] flex items-center justify-center shadow-md">
              <Hash size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-[#242424] dark:text-[#f2f3f5] text-[16px]">{currentChannel.name}</h2>
              {currentChannel.description && (
                <p className="text-xs text-[#616161] dark:text-[#b9bbbe]">{currentChannel.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[
              { icon: <Phone size={18} />, label: t('chat.audioCall') },
              { icon: <Video size={18} />, label: t('chat.videoCall') },
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
              { icon: <Pin size={18} />, label: t('chat.pinned') },
              { icon: <Users size={18} />, label: t('chat.members') },
              { icon: <Search size={18} />, label: t('chat.search') },
              { icon: <MoreHorizontal size={18} />, label: t('chat.more') },
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

        {/* Unified Sub-header: Channel start + Pinned message + Widgets */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25 }}
          className="border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8]/80 dark:bg-[#2b2d31]/80 backdrop-blur-sm"
        >
          <div className="px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-on-hover">
            {/* Channel origin chip */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-[#5b5fc7]/10 to-[#6264a7]/5 dark:from-[#5b5fc7]/20 dark:to-[#6264a7]/10 border border-[#5b5fc7]/20 dark:border-[#5b5fc7]/30 shrink-0">
              <Hash size={12} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
              <span className="text-[12px] font-semibold text-[#5b5fc7] dark:text-[#a6a9dc]">{t('chatRoom.start')}</span>
            </div>

            {/* Pinned message chip */}
            {latestPinned && (
              <>
                <Separator orientation="vertical" className="mx-0.5 h-5 bg-[#e1dfdd] dark:bg-[#3d3d3d]" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#ff9800]/8 dark:bg-[#ff9800]/15 border border-[#ff9800]/20 dark:border-[#ff9800]/30 hover:border-[#ff9800]/40 dark:hover:border-[#ff9800]/50 transition-all cursor-pointer group shrink-0 max-w-[280px]">
                      <Pin size={11} className="text-[#ff9800] dark:text-[#ffb74d] shrink-0 -rotate-45" />
                      <span className="text-[11px] font-semibold text-[#ff9800] dark:text-[#ffb74d] shrink-0">{pinnedCount}</span>
                      <span className="text-[11px] text-[#616161] dark:text-[#b9bbbe] truncate">
                        {latestPinned.content.replace(/[#*_~`>\-\[\]()!]/g, '').slice(0, 50)}{latestPinned.content.length > 50 ? '…' : ''}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={4} className="max-w-xs">
                    <p className="text-xs font-semibold mb-1">{t('chatRoom.pinnedTooltip', { count: pinnedCount })}</p>
                    <p className="text-xs opacity-80">{latestPinned.content.replace(/[#*_~`>\-\[\]()!]/g, '').slice(0, 120)}</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            {/* Widget chips */}
            {widgets && widgets.length > 0 && (
              <>
                <Separator orientation="vertical" className="mx-0.5 h-5 bg-[#e1dfdd] dark:bg-[#3d3d3d]" />
                {widgets.map((widget, idx) => {
                  const Icon = widgetIconMap[widget.icon] || Activity;
                  const colors = widgetColorMap[widget.color] || widgetColorMap.blue;
                  return (
                    <motion.button
                      key={widget.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.03 * idx }}
                      onClick={() => widget.detail && setSelectedWidget(widget)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-[#313338] border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-sm hover:shadow-md hover:border-[#d0cece] dark:hover:border-[#4d4d4d] transition-all cursor-pointer group shrink-0"
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${colors.bg} ${colors.darkBg} group-hover:scale-110 transition-transform`}>
                        <Icon size={11} className={`${colors.text} ${colors.darkText}`} />
                      </div>
                      <span className="text-[12px] font-bold text-[#242424] dark:text-[#f0f0f0] leading-none">{widget.value}</span>
                      <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] leading-none">{widget.label}</span>
                    </motion.button>
                  );
                })}
              </>
            )}
          </div>
        </motion.div>

        {/* Widget Detail Dialog */}
        <WidgetDetailDialog
          widget={selectedWidget}
          open={!!selectedWidget}
          onOpenChange={(open) => { if (!open) setSelectedWidget(null); }}
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {/* Messages List */}
          <div className="py-2">
            {channelMessages.map((message) => (
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
              placeholder={t('chat.messageChannelPlaceholder', { name: currentChannel.name })}
              onSend={handleSendMessage}
              extraButtons={
                <>
                  {[
                    { icon: <Paperclip size={15} />, label: t('chat.attachFile') },
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
