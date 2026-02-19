import React, { useState, useRef } from 'react';
import {
  MessageSquare, Smile, Pin, PinOff, Eye, Pencil, Trash2, Check, X,
  FileText, FileSpreadsheet, FileArchive, File, Download,
  Image as ImageIcon, CircleDot, Bug, Zap, BookOpen, CheckCircle2,
  Clock, AlertTriangle, ArrowRight, Languages, Loader2, Play, Film,
} from 'lucide-react';
import { Message, MessageAttachment, users, currentUser } from '../data/mockData';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Separator } from './ui/separator';
import { cn } from './ui/utils';
import { MarkdownContent } from './MarkdownContent';
import { ImageCarouselViewer } from './ImageCarouselViewer';
import { VideoPlayerViewer } from './VideoPlayerViewer';
import { TaskDetailDialog, DocumentDetailDialog } from './AttachmentDetailDialogs';
import { mockTranslate, TRANSLATION_LANGUAGES, type TranslationLanguage } from '../data/translations';

// ─── Quick-pick emojis ───
const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '🚀', '👀', '💯', '🔥', '👋', '🤔', '😮', '✅'];

interface MessageItemProps {
  message: Message;
  onThreadClick?: () => void;
  isParent?: boolean;
  onMessageUpdate?: (msg: Message) => void;
  onMessageDelete?: (id: string) => void;
}

export function MessageItem({
  message,
  onThreadClick,
  isParent,
  onMessageUpdate,
  onMessageDelete,
}: MessageItemProps) {
  const user = users.find(u => u.id === message.userId);
  const isOwn = message.userId === currentUser.id;

  const [isPinned, setIsPinned] = useState(message.pinned ?? false);
  const [reactions, setReactions] = useState(message.reactions ?? []);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [localContent, setLocalContent] = useState(message.content);
  const [wasEdited, setWasEdited] = useState(message.edited ?? false);
  const [showSeenBy, setShowSeenBy] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showToolbarEmoji, setShowToolbarEmoji] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const [carouselState, setCarouselState] = useState<{ images: MessageAttachment[]; index: number } | null>(null);

  // Translation state
  const [showTranslatePicker, setShowTranslatePicker] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [translationLang, setTranslationLang] = useState<TranslationLanguage | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);

  if (isDeleted) return null;

  const handleTogglePin = () => {
    setIsPinned(p => !p);
    onMessageUpdate?.({ ...message, pinned: !isPinned });
  };

  const handleAddReaction = (emoji: string) => {
    setReactions(prev => {
      const existing = prev.find(r => r.emoji === emoji);
      if (existing) {
        const hasUser = existing.users.includes(currentUser.id);
        if (hasUser) {
          const updated = existing.users.filter(u => u !== currentUser.id);
          return updated.length === 0
            ? prev.filter(r => r.emoji !== emoji)
            : prev.map(r => r.emoji === emoji ? { ...r, users: updated } : r);
        }
        return prev.map(r => r.emoji === emoji ? { ...r, users: [...r.users, currentUser.id] } : r);
      }
      return [...prev, { emoji, users: [currentUser.id] }];
    });
    setShowEmojiPicker(false);
    setShowToolbarEmoji(false);
  };

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setIsEditing(false);
    setLocalContent(trimmed);
    setWasEdited(true);
    onMessageUpdate?.({ ...message, content: trimmed, edited: true });
  };

  const handleDelete = () => {
    setIsDeleted(true);
    onMessageDelete?.(message.id);
  };

  const handleTranslate = async (lang: TranslationLanguage) => {
    setShowTranslatePicker(false);
    setIsTranslating(true);
    setTranslationLang(lang);
    setShowTranslation(true);
    try {
      const result = await mockTranslate(localContent, lang.code);
      setTranslatedContent(result.translatedText);
    } catch {
      setTranslatedContent(null);
      setShowTranslation(false);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDismissTranslation = () => {
    setShowTranslation(false);
    setTranslatedContent(null);
    setTranslationLang(null);
  };

  const seenUsers = (message.seenBy ?? [])
    .map(id => users.find(u => u.id === id))
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'group relative hover:bg-gradient-to-r hover:from-[#f8f8f8] hover:to-[#f5f5f5] dark:hover:from-[#2e3035] dark:hover:to-[#32353b] px-4 py-2.5 transition-all duration-200',
        isPinned && 'border-l-2 border-[#5b5fc7] bg-[#5b5fc7]/[0.03] dark:bg-[#5b5fc7]/[0.06]',
      )}
    >
      {/* Pinned indicator */}
      <AnimatePresence>
        {isPinned && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="flex items-center gap-1.5 mb-1 ml-[52px] text-[11px] text-[#5b5fc7] dark:text-[#a6a9dc]"
          >
            <Pin size={11} className="rotate-45" />
            <span className="font-medium">Pinned</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <img
          src={user?.avatar}
          alt={user?.name}
          className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-transparent group-hover:ring-[#e8e8f8] dark:group-hover:ring-[#404249] transition-all"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-bold text-[#242424] dark:text-[#f2f3f5] text-[15px]">{user?.name}</span>
            <span className="text-xs text-[#616161] dark:text-[#949ba4] font-medium">
              {format(message.timestamp, 'h:mm a')}
            </span>
          </div>

          {/* Content / Edit mode */}
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-1"
            >
              <textarea
                ref={editRef}
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); }
                  if (e.key === 'Escape') { setIsEditing(false); setEditText(message.content); }
                }}
                className="w-full px-3 py-2 bg-white dark:bg-[#1e1f22] border border-[#5b5fc7] rounded-lg text-[14px] text-[#2e3338] dark:text-[#dbdee1] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40 resize-none"
                rows={Math.min(editText.split('\n').length + 1, 6)}
                autoFocus
              />
              <div className="flex items-center gap-2 mt-1.5">
                <Button size="sm" onClick={handleSaveEdit} className="h-7 bg-[#5b5fc7] hover:bg-[#4f52b5] text-white gap-1">
                  <Check size={13} /> Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setIsEditing(false); setEditText(message.content); }}
                  className="h-7 text-[#616161] gap-1"
                >
                  <X size={13} /> Cancel
                </Button>
                <span className="text-[10px] text-muted-foreground ml-1">Esc to cancel · Enter to save</span>
              </div>
            </motion.div>
          ) : (
            <div className="text-[14px] text-[#2e3338] dark:text-[#dbdee1] leading-relaxed">
              <MarkdownContent content={localContent} />
              {wasEdited && (
                <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] ml-1 italic">(edited)</span>
              )}
            </div>
          )}

          {/* ─── Translation Banner ─── */}
          <AnimatePresence>
            {showTranslation && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="relative rounded-lg border border-[#5b5fc7]/20 dark:border-[#5b5fc7]/30 bg-gradient-to-r from-[#5b5fc7]/[0.04] to-[#5b5fc7]/[0.08] dark:from-[#5b5fc7]/[0.06] dark:to-[#5b5fc7]/[0.12] px-3 py-2">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Languages size={12} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
                      <span className="text-[10px] font-semibold text-[#5b5fc7] dark:text-[#a6a9dc] uppercase tracking-wider">
                        {translationLang ? `${translationLang.flag} Translated to ${translationLang.name}` : 'Translating...'}
                      </span>
                    </div>
                    <button
                      onClick={handleDismissTranslation}
                      className="p-0.5 rounded hover:bg-[#5b5fc7]/10 dark:hover:bg-[#5b5fc7]/20 transition-colors"
                    >
                      <X size={12} className="text-[#8a8a8a] dark:text-[#6d6f78]" />
                    </button>
                  </div>
                  {/* Translation Content */}
                  {isTranslating ? (
                    <div className="flex items-center gap-2 py-1">
                      <Loader2 size={14} className="text-[#5b5fc7] dark:text-[#a6a9dc] animate-spin" />
                      <span className="text-[13px] text-[#616161] dark:text-[#949ba4] italic">Translating message...</span>
                    </div>
                  ) : translatedContent ? (
                    <div className="text-[14px] text-[#2e3338] dark:text-[#dbdee1] leading-relaxed">
                      <MarkdownContent content={translatedContent} />
                    </div>
                  ) : null}
                  {/* Detected language note */}
                  {!isTranslating && translatedContent && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">
                        Detected: English (auto)
                      </span>
                      <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">·</span>
                      <button
                        onClick={handleDismissTranslation}
                        className="text-[10px] font-medium text-[#5b5fc7] dark:text-[#a6a9dc] hover:underline"
                      >
                        Show original
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Attachments ─── */}
          {message.attachments && message.attachments.length > 0 && (
            <AttachmentRenderer attachments={message.attachments} onImageClick={setCarouselState} />
          )}

          {/* Reactions */}
          {reactions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {reactions.map((reaction, idx) => {
                const isMine = reaction.users.includes(currentUser.id);
                return (
                  <motion.button
                    key={`${reaction.emoji}-${idx}`}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddReaction(reaction.emoji)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors shadow-sm border',
                      isMine
                        ? 'bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 border-[#5b5fc7]/40 dark:border-[#5b5fc7]/50'
                        : 'bg-gradient-to-br from-white to-[#f8f8f8] dark:from-[#2e3035] dark:to-[#32353b] border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#6264a7] dark:hover:border-[#5865f2]',
                    )}
                  >
                    <span className="text-base">{reaction.emoji}</span>
                    <span className={cn(
                      'font-bold',
                      isMine ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#242424] dark:text-[#f2f3f5]',
                    )}>
                      {reaction.users.length}
                    </span>
                  </motion.button>
                );
              })}
              {/* Add reaction button in reaction row */}
              <Popover open={showEmojiPicker && reactions.length > 0} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 bg-gradient-to-br from-white to-[#f8f8f8] dark:from-[#2e3035] dark:to-[#32353b] border border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#6264a7] dark:hover:border-[#5865f2] rounded-full px-2.5 py-1 text-xs transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Smile size={14} className="text-[#616161] dark:text-[#b9bbbe]" />
                  </motion.button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-auto p-2">
                  <EmojiGrid onSelect={handleAddReaction} />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Thread Preview */}
          {message.threadCount && message.threadCount > 0 && !isParent && (
            <button
              onClick={onThreadClick}
              className="flex items-center gap-2 mt-2 text-xs text-[#6264a7] dark:text-[#949cf7] hover:text-[#5865f2] dark:hover:text-[#a5abf7] transition-all font-bold group/thread"
            >
              <MessageSquare size={14} className="group-hover/thread:scale-110 transition-transform" />
              <span>{message.threadCount} {message.threadCount === 1 ? 'reply' : 'replies'}</span>
              {message.threadPreview && (
                <>
                  <span className="text-[#616161] dark:text-[#6d6f78]">·</span>
                  <span className="text-[#616161] dark:text-[#b9bbbe] truncate max-w-xs font-normal">
                    {message.threadPreview}
                  </span>
                </>
              )}
            </button>
          )}
        </div>

        {/* ─── Hover Toolbar ─── */}
        {!isEditing && (
          <div className="absolute right-3 -top-3 opacity-0 group-hover:opacity-100 transition-all duration-150 z-10">
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className="flex items-center gap-0.5 bg-white dark:bg-[#2b2d31] border border-[#e1dfdd] dark:border-[#404249] rounded-lg shadow-lg px-1 py-0.5"
            >
              {/* Emoji reaction */}
              <Popover open={showToolbarEmoji} onOpenChange={setShowToolbarEmoji}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[#616161] dark:text-[#b9bbbe] hover:text-[#5b5fc7] hover:bg-[#e8e8f8] dark:hover:bg-[#383a40]"
                      >
                        <Smile size={15} />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={4}>Add reaction</TooltipContent>
                </Tooltip>
                <PopoverContent side="top" align="start" className="w-auto p-2">
                  <EmojiGrid onSelect={handleAddReaction} />
                </PopoverContent>
              </Popover>

              <Separator orientation="vertical" className="h-4 mx-0.5 bg-[#e1dfdd] dark:bg-[#404249]" />

              {/* Reply in thread */}
              {!isParent && onThreadClick && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onThreadClick}
                      className="h-7 w-7 text-[#616161] dark:text-[#b9bbbe] hover:text-[#5b5fc7] hover:bg-[#e8e8f8] dark:hover:bg-[#383a40]"
                    >
                      <MessageSquare size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={4}>Reply in thread</TooltipContent>
                </Tooltip>
              )}

              {/* Pin / Unpin */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleTogglePin}
                    className={cn(
                      'h-7 w-7 hover:bg-[#e8e8f8] dark:hover:bg-[#383a40]',
                      isPinned
                        ? 'text-[#5b5fc7] dark:text-[#a6a9dc]'
                        : 'text-[#616161] dark:text-[#b9bbbe] hover:text-[#5b5fc7]',
                    )}
                  >
                    {isPinned ? <PinOff size={15} /> : <Pin size={15} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={4}>
                  {isPinned ? 'Unpin message' : 'Pin message'}
                </TooltipContent>
              </Tooltip>

              {/* Seen by */}
              <Popover open={showSeenBy} onOpenChange={setShowSeenBy}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[#616161] dark:text-[#b9bbbe] hover:text-[#5b5fc7] hover:bg-[#e8e8f8] dark:hover:bg-[#383a40] relative"
                      >
                        <Eye size={15} />
                        {seenUsers.length > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#5b5fc7] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                            {seenUsers.length}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={4}>Seen by</TooltipContent>
                </Tooltip>
                <PopoverContent side="top" align="center" className="w-56 p-0">
                  <div className="p-3 border-b border-[#e1dfdd] dark:border-[#404249]">
                    <p className="text-xs font-bold text-[#242424] dark:text-[#f2f3f5]">
                      Seen by {seenUsers.length > 0 ? seenUsers.length : 0}
                    </p>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2">
                    {seenUsers.length > 0 ? seenUsers.map(u => (
                      <div key={u!.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-[#f5f5f5] dark:hover:bg-[#383a40] transition-colors">
                        <img src={u!.avatar} alt={u!.name} className="w-6 h-6 rounded-full" />
                        <span className="text-[13px] text-[#242424] dark:text-[#f2f3f5]">{u!.name}</span>
                        <div className={cn(
                          'ml-auto w-2 h-2 rounded-full',
                          u!.status === 'online' ? 'bg-[#92c353]' :
                          u!.status === 'away' ? 'bg-[#ffaa44]' :
                          u!.status === 'busy' ? 'bg-[#c4314b]' : 'bg-[#858585]',
                        )} />
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground text-center py-3">No read receipts yet</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Translate */}
              <Popover open={showTranslatePicker} onOpenChange={setShowTranslatePicker}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'h-7 w-7 hover:bg-[#e8e8f8] dark:hover:bg-[#383a40]',
                          showTranslation
                            ? 'text-[#5b5fc7] dark:text-[#a6a9dc]'
                            : 'text-[#616161] dark:text-[#b9bbbe] hover:text-[#5b5fc7]',
                        )}
                      >
                        <Languages size={15} />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={4}>Translate message</TooltipContent>
                </Tooltip>
                <PopoverContent side="top" align="end" className="w-56 p-0">
                  <TranslateLanguagePicker
                    onSelect={handleTranslate}
                    activeLangCode={translationLang?.code ?? null}
                    onDismiss={handleDismissTranslation}
                    hasTranslation={showTranslation}
                  />
                </PopoverContent>
              </Popover>

              {/* Edit (own messages only) */}
              {isOwn && (
                <>
                  <Separator orientation="vertical" className="h-4 mx-0.5 bg-[#e1dfdd] dark:bg-[#404249]" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setIsEditing(true); setEditText(message.content); }}
                        className="h-7 w-7 text-[#616161] dark:text-[#b9bbbe] hover:text-[#5b5fc7] hover:bg-[#e8e8f8] dark:hover:bg-[#383a40]"
                      >
                        <Pencil size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={4}>Edit message</TooltipContent>
                  </Tooltip>
                </>
              )}

              {/* Delete */}
              {isOwn && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDelete}
                      className="h-7 w-7 text-[#616161] dark:text-[#b9bbbe] hover:text-[#c4314b] hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={4}>Delete message</TooltipContent>
                </Tooltip>
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* ─── Image Lightbox Overlay ─── */}
      <AnimatePresence>
        {carouselState && (
          <ImageCarouselViewer
            images={carouselState.images}
            currentIndex={carouselState.index}
            onClose={() => setCarouselState(null)}
            onChangeIndex={(idx) => setCarouselState(prev => prev ? { ...prev, index: idx } : null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Emoji Grid Subcomponent ───
function EmojiGrid({ onSelect }: { onSelect: (emoji: string) => void }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Quick reactions</p>
      <div className="grid grid-cols-6 gap-1">
        {QUICK_EMOJIS.map(emoji => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#e8e8f8] dark:hover:bg-[#383a40] transition-colors text-lg"
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ───
function getFileIcon(mimeType?: string, name?: string) {
  if (!mimeType && !name) return <File size={18} />;
  const n = (name || '').toLowerCase();
  const m = (mimeType || '').toLowerCase();
  if (m.includes('pdf') || n.endsWith('.pdf')) return <FileText size={18} />;
  if (m.includes('zip') || m.includes('archive') || n.endsWith('.zip') || n.endsWith('.tar') || n.endsWith('.gz'))
    return <FileArchive size={18} />;
  if (m.includes('sheet') || m.includes('excel') || n.endsWith('.xlsx') || n.endsWith('.csv'))
    return <FileSpreadsheet size={18} />;
  if (m.includes('json') || n.endsWith('.har') || n.endsWith('.json'))
    return <FileText size={18} />;
  return <File size={18} />;
}

function getFileIconColor(mimeType?: string, name?: string) {
  const n = (name || '').toLowerCase();
  const m = (mimeType || '').toLowerCase();
  if (m.includes('pdf') || n.endsWith('.pdf')) return 'text-red-500 dark:text-red-400';
  if (m.includes('zip') || m.includes('archive') || n.endsWith('.zip')) return 'text-amber-600 dark:text-amber-400';
  if (m.includes('sheet') || m.includes('excel') || n.endsWith('.xlsx')) return 'text-emerald-600 dark:text-emerald-400';
  if (m.includes('json') || n.endsWith('.har')) return 'text-orange-500 dark:text-orange-400';
  return 'text-[#5b5fc7] dark:text-[#a6a9dc]';
}

const TASK_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  'backlog': { label: 'Backlog', color: 'bg-[#858585]/10 text-[#858585] border-[#858585]/20', icon: <Clock size={12} /> },
  'todo': { label: 'To Do', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: <CircleDot size={12} /> },
  'in-progress': { label: 'In Progress', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: <Zap size={12} /> },
  'in-review': { label: 'In Review', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', icon: <Eye size={12} /> },
  'done': { label: 'Done', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 size={12} /> },
};

const TASK_PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  'critical': { label: 'Critical', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  'high': { label: 'High', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  'medium': { label: 'Medium', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  'low': { label: 'Low', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
};

function getTaskTypeIcon(type?: string) {
  switch (type) {
    case 'bug': return <Bug size={13} className="text-red-500" />;
    case 'story': return <BookOpen size={13} className="text-[#5b5fc7]" />;
    case 'spike': return <Zap size={13} className="text-amber-500" />;
    default: return <CircleDot size={13} className="text-[#5b5fc7]" />;
  }
}

// ─── Attachment Renderer Subcomponent ───
function AttachmentRenderer({ attachments, onImageClick }: { attachments: MessageAttachment[]; onImageClick: (state: { images: MessageAttachment[]; index: number }) => void }) {
  const images = attachments.filter(a => a.type === 'image');
  const videos = attachments.filter(a => a.type === 'video');
  const files = attachments.filter(a => a.type === 'file');
  const tasks = attachments.filter(a => a.type === 'task');
  const docs = attachments.filter(a => a.type === 'document');

  return (
    <motion.div
      className="mt-2.5 space-y-2"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.05 }}
    >
      {/* ── Image attachments ── */}
      {images.length > 0 && (
        <div className={cn(
          'grid gap-1.5',
          images.length === 1 ? 'grid-cols-1 max-w-sm' :
          images.length === 2 ? 'grid-cols-2 max-w-lg' : 'grid-cols-3 max-w-xl',
        )}>
          {images.map((img, idx) => (
            <motion.button
              key={img.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onImageClick({ images, index: idx })}
              className="relative group/img overflow-hidden rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#f5f5f5] dark:bg-[#2a2a2a]"
            >
              <img
                src={img.thumbnailUrl || img.url}
                alt={img.name}
                className="w-full h-36 object-cover transition-transform duration-200 group-hover/img:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                <p className="text-[11px] text-white truncate">{img.name}</p>
                {img.size && <p className="text-[10px] text-white/70">{img.size}</p>}
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                <div className="p-1 rounded-md bg-black/30 backdrop-blur-sm">
                  <ImageIcon size={14} className="text-white" />
                </div>
              </div>
              {/* Multi-image badge */}
              {images.length > 1 && idx === 0 && (
                <div className="absolute top-2 left-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                  <div className="px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-[10px] text-white font-medium">
                    1 / {images.length}
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* ── Video attachments ── */}
      {videos.map(video => (
        <VideoAttachmentCard key={video.id} video={video} />
      ))}

      {/* ── File attachments ── */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map(file => (
            <motion.a
              key={file.id}
              href={file.url || '#'}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-gradient-to-br from-white to-[#faf9f8] dark:from-[#2b2d31] dark:to-[#27282c] hover:border-[#5b5fc7]/40 dark:hover:border-[#5b5fc7]/40 transition-all shadow-sm group/file cursor-pointer max-w-xs"
            >
              <div className={cn('shrink-0', getFileIconColor(file.mimeType, file.name))}>
                {getFileIcon(file.mimeType, file.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[#242424] dark:text-[#f2f3f5] truncate">{file.name}</p>
                {file.size && (
                  <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">{file.size}</p>
                )}
              </div>
              <Download size={14} className="shrink-0 text-[#8a8a8a] dark:text-[#6d6f78] opacity-0 group-hover/file:opacity-100 transition-opacity" />
            </motion.a>
          ))}
        </div>
      )}

      {/* ── Task attachments ── */}
      {tasks.map(task => (
        <TaskAttachmentCard key={task.id} task={task} />
      ))}

      {/* ── Document attachments ── */}
      {docs.map(doc => (
        <DocumentAttachmentCard key={doc.id} doc={doc} />
      ))}
    </motion.div>
  );
}

// ─── Video Attachment Card (with player) ───
function VideoAttachmentCard({ video }: { video: MessageAttachment }) {
  const [playerOpen, setPlayerOpen] = useState(false);
  const hasPoster = !!video.videoPosterUrl;

  return (
    <>
      {hasPoster ? (
        /* Thumbnail card with poster */
        <motion.button
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setPlayerOpen(true)}
          className="relative group/vid overflow-hidden rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#f5f5f5] dark:bg-[#2a2a2a] max-w-sm cursor-pointer block text-left"
        >
          <img
            src={video.videoPosterUrl}
            alt={video.name}
            className="w-full h-44 object-cover transition-transform duration-200 group-hover/vid:scale-105"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/5 group-hover/vid:from-black/70 transition-colors" />
          {/* Central play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-14 h-14 rounded-full bg-[#5b5fc7]/80 backdrop-blur-sm flex items-center justify-center shadow-xl shadow-[#5b5fc7]/30 group-hover/vid:bg-[#5b5fc7]/90 transition-colors"
            >
              <Play size={24} className="text-white ml-0.5" />
            </motion.div>
          </div>
          {/* Duration badge */}
          {video.videoDuration && (
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[11px] text-white font-medium font-mono tabular-nums">
              {video.videoDuration}
            </div>
          )}
          {/* Video icon badge */}
          <div className="absolute top-2.5 left-2.5 p-1.5 rounded-md bg-black/30 backdrop-blur-sm">
            <Film size={13} className="text-white" />
          </div>
          {/* Bottom info bar */}
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
            <p className="text-[12px] text-white font-medium truncate">{video.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {video.size && <span className="text-[10px] text-white/70">{video.size}</span>}
              {video.mimeType && (
                <>
                  <span className="text-[10px] text-white/40">·</span>
                  <span className="text-[10px] text-white/70 uppercase">{video.mimeType.split('/')[1]}</span>
                </>
              )}
            </div>
          </div>
        </motion.button>
      ) : (
        /* Compact card without poster */
        <motion.div
          whileHover={{ scale: 1.01, y: -1 }}
          onClick={() => setPlayerOpen(true)}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] bg-gradient-to-br from-white to-[#faf9f8] dark:from-[#2b2d31] dark:to-[#27282c] hover:border-[#5b5fc7]/40 dark:hover:border-[#5b5fc7]/40 transition-all shadow-sm cursor-pointer max-w-md"
        >
          <div className="w-9 h-9 rounded-lg bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 flex items-center justify-center shrink-0">
            <Film size={16} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#242424] dark:text-[#f2f3f5] truncate">{video.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {video.videoDuration && (
                <span className="text-[11px] text-[#5b5fc7] dark:text-[#a6a9dc] font-medium font-mono">{video.videoDuration}</span>
              )}
              {video.size && <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">{video.size}</span>}
            </div>
          </div>
          <div className="shrink-0 w-7 h-7 rounded-full bg-[#5b5fc7]/10 flex items-center justify-center">
            <Play size={13} className="text-[#5b5fc7] dark:text-[#a6a9dc] ml-0.5" />
          </div>
        </motion.div>
      )}

      {/* Video Player Overlay */}
      <AnimatePresence>
        {playerOpen && (
          <VideoPlayerViewer
            posterUrl={video.videoPosterUrl}
            videoUrl={video.url}
            name={video.name}
            size={video.size}
            duration={video.videoDuration}
            onClose={() => setPlayerOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Task Attachment Card (with dialog) ───
function TaskAttachmentCard({ task }: { task: MessageAttachment }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const statusCfg = TASK_STATUS_CONFIG[task.taskStatus || 'todo'];
  const prioCfg = TASK_PRIORITY_CONFIG[task.taskPriority || 'medium'];

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01, y: -1 }}
        onClick={() => setDialogOpen(true)}
        className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] bg-gradient-to-br from-white to-[#faf9f8] dark:from-[#2b2d31] dark:to-[#27282c] hover:border-[#5b5fc7]/40 dark:hover:border-[#5b5fc7]/40 transition-all shadow-sm cursor-pointer max-w-md"
      >
        <div className="mt-0.5 shrink-0">{getTaskTypeIcon(task.taskType)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {task.taskId && (
              <span className="text-[11px] font-mono font-semibold text-[#5b5fc7] dark:text-[#a6a9dc]">{task.taskId}</span>
            )}
            <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border', statusCfg.color)}>
              {statusCfg.icon}
              {statusCfg.label}
            </span>
          </div>
          <p className="text-[13px] font-medium text-[#242424] dark:text-[#f2f3f5] truncate">{task.name}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border', prioCfg.color)}>
              {task.taskPriority === 'critical' && <AlertTriangle size={10} className="mr-0.5" />}
              {prioCfg.label}
            </span>
            {task.taskAssignee && (
              <span className="text-[11px] text-[#616161] dark:text-[#949ba4] truncate">{task.taskAssignee}</span>
            )}
          </div>
        </div>
        <ArrowRight size={14} className="shrink-0 mt-1 text-[#8a8a8a] dark:text-[#6d6f78]" />
      </motion.div>
      <TaskDetailDialog attachment={task} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}

// ─── Document Attachment Card (with dialog) ───
function DocumentAttachmentCard({ doc }: { doc: MessageAttachment }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01, y: -1 }}
        onClick={() => setDialogOpen(true)}
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] bg-gradient-to-br from-white to-[#faf9f8] dark:from-[#2b2d31] dark:to-[#27282c] hover:border-[#5b5fc7]/40 dark:hover:border-[#5b5fc7]/40 transition-all shadow-sm cursor-pointer max-w-md"
      >
        <span className="text-xl shrink-0">{doc.docEmoji || '📄'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#242424] dark:text-[#f2f3f5] truncate">{doc.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {doc.docType && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#5b5fc7]/10 text-[#5b5fc7] dark:text-[#a6a9dc] border border-[#5b5fc7]/20">
                {doc.docType === 'doc' ? 'Document' : doc.docType === 'sheet' ? 'Sheet' : 'Presentation'}
              </span>
            )}
            {doc.docAuthor && (
              <span className="text-[11px] text-[#616161] dark:text-[#949ba4]">{doc.docAuthor}</span>
            )}
            {doc.docLastModified && (
              <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">
                {format(doc.docLastModified, 'MMM d')}
              </span>
            )}
          </div>
        </div>
        <span className="text-[11px] font-medium text-[#5b5fc7] dark:text-[#a6a9dc] shrink-0 flex items-center gap-1">
          Open <ArrowRight size={12} />
        </span>
      </motion.div>
      <DocumentDetailDialog attachment={doc} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}

// ─── Translate Language Picker Subcomponent ───
function TranslateLanguagePicker({
  onSelect,
  activeLangCode,
  onDismiss,
  hasTranslation,
}: {
  onSelect: (lang: TranslationLanguage) => void;
  activeLangCode: string | null;
  onDismiss: () => void;
  hasTranslation: boolean;
}) {
  return (
    <div className="p-2">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Translate to</p>
      <div className="grid grid-cols-2 gap-1">
        {TRANSLATION_LANGUAGES.map(lang => (
          <motion.button
            key={lang.code}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(lang)}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors',
              activeLangCode === lang.code
                ? 'bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc]'
                : 'hover:bg-[#f5f5f5] dark:hover:bg-[#383a40]',
            )}
          >
            <span className="text-sm">{lang.flag}</span>
            <span className="text-[11px] font-medium text-[#242424] dark:text-[#f2f3f5]">{lang.name}</span>
          </motion.button>
        ))}
      </div>
      {hasTranslation && (
        <div className="mt-2 pt-2 border-t border-[#e1dfdd] dark:border-[#404249]">
          <button
            onClick={onDismiss}
            className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-[11px] font-medium text-[#c4314b] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <X size={12} />
            Remove translation
          </button>
        </div>
      )}
    </div>
  );
}