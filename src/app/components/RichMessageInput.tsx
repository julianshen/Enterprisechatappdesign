import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered, Link2, Quote, Send, Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Separator } from './ui/separator';
import { Toggle } from './ui/toggle';
import { cn } from './ui/utils';
import { MarkdownContent } from './MarkdownContent';
import { TableGridPicker } from './TableGridPicker';

interface RichMessageInputProps {
  placeholder?: string;
  onSend: (content: string) => void;
  /** Compact mode for smaller panels (e.g. threads, copilot) */
  compact?: boolean;
  /** Show attachment/emoji/mic buttons alongside the toolbar */
  extraButtons?: React.ReactNode;
  /** Disable the send button externally */
  disabled?: boolean;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Additional class on the outer wrapper */
  className?: string;
}

interface ToolbarAction {
  icon: React.ReactNode;
  action: () => void;
  tip: string;
  label?: string;
}

export function RichMessageInput({
  placeholder = 'Type a message... (Markdown supported)',
  onSend,
  compact = false,
  extraButtons,
  disabled = false,
  autoFocus = false,
  className = '',
}: RichMessageInputProps) {
  const [input, setInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, compact ? 120 : 160) + 'px';
  }, [compact]);

  const wrapSelection = useCallback((before: string, after: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.slice(start, end);
    const replacement = before + (selected || 'text') + after;
    const newVal = text.slice(0, start) + replacement + text.slice(end);
    setInput(newVal);
    requestAnimationFrame(() => {
      el.focus();
      if (selected) {
        el.setSelectionRange(start + replacement.length, start + replacement.length);
      } else {
        el.setSelectionRange(start + before.length, start + before.length + 4);
      }
    });
  }, []);

  const insertLinePrefix = useCallback((prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const text = el.value;
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const newVal = text.slice(0, lineStart) + prefix + text.slice(lineStart);
    setInput(newVal);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  }, []);

  const insertTable = useCallback((rows: number, cols: number) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const text = el.value;

    // Build header
    const header = '| ' + Array.from({ length: cols }, (_, c) => `Header ${c + 1}`).join(' | ') + ' |';
    const separator = '| ' + Array.from({ length: cols }, () => '---').join(' | ') + ' |';
    const dataRows = Array.from({ length: rows }, (_, r) =>
      '| ' + Array.from({ length: cols }, (_, c) => `Cell ${r + 1}-${c + 1}`).join(' | ') + ' |'
    );
    const tableStr = '\n' + [header, separator, ...dataRows].join('\n') + '\n';

    const newVal = text.slice(0, start) + tableStr + text.slice(start);
    setInput(newVal);
    requestAnimationFrame(() => {
      el.focus();
      // Select "Header 1" so user can immediately type
      const headerStart = start + 3; // past "\n| "
      el.setSelectionRange(headerStart, headerStart + 8);
      autoResize();
    });
  }, [autoResize]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
    setShowPreview(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, disabled, onSend]);

  const iconSize = compact ? 13 : 14;

  const toolbarGroups: (ToolbarAction | 'sep')[][] = [
    [
      { icon: <Bold size={iconSize} />, action: () => wrapSelection('**', '**'), tip: 'Bold' },
      { icon: <Italic size={iconSize} />, action: () => wrapSelection('_', '_'), tip: 'Italic' },
      { icon: <Strikethrough size={iconSize} />, action: () => wrapSelection('~~', '~~'), tip: 'Strikethrough' },
      { icon: <Code size={iconSize} />, action: () => wrapSelection('`', '`'), tip: 'Inline code' },
    ],
    [
      { icon: <List size={iconSize} />, action: () => insertLinePrefix('- '), tip: 'Bullet list' },
      { icon: <ListOrdered size={iconSize} />, action: () => insertLinePrefix('1. '), tip: 'Numbered list' },
      { icon: <Quote size={iconSize} />, action: () => insertLinePrefix('> '), tip: 'Blockquote' },
      { icon: <Link2 size={iconSize} />, action: () => wrapSelection('[', '](url)'), tip: 'Link' },
    ],
    [
      { icon: <Code size={iconSize} />, action: () => wrapSelection('\n```\n', '\n```\n'), tip: 'Code block', label: '{}' },
    ],
  ];

  return (
    <div className={className}>
      {/* Formatting toolbar */}
      <motion.div
        className={cn('flex items-center gap-0.5 flex-wrap', compact ? 'mb-1.5' : 'mb-2')}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {toolbarGroups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && (
              <Separator orientation="vertical" className="mx-1 h-4 bg-[#e1dfdd] dark:bg-[#3d3d3d]" />
            )}
            {group.map((item) => {
              if (item === 'sep') return null;
              const action = item as ToolbarAction;
              return (
                <Tooltip key={action.tip}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={action.action}
                      className={cn(
                        'text-[#616161] dark:text-[#9e9e9e] hover:bg-[#e8e8f8] dark:hover:bg-[#333] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc]',
                        compact ? 'h-7 w-7' : 'h-8 w-8',
                      )}
                    >
                      {action.label ? (
                        <span className="text-[11px] font-mono font-semibold">{action.label}</span>
                      ) : (
                        action.icon
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={4}>
                    {action.tip}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}

        {/* Table grid picker */}
        <TableGridPicker compact={compact} iconSize={iconSize} onInsert={insertTable} />

        {extraButtons && (
          <>
            <Separator orientation="vertical" className="mx-1 h-4 bg-[#e1dfdd] dark:bg-[#3d3d3d]" />
            {extraButtons}
          </>
        )}

        <div className="ml-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={showPreview}
                onPressedChange={setShowPreview}
                className={cn(
                  'gap-1 px-2',
                  compact ? 'h-7 text-[10px]' : 'h-8 text-[11px]',
                  showPreview && 'bg-[#5b5fc7]/10 text-[#5b5fc7] dark:bg-[#5b5fc7]/20 dark:text-[#a6a9dc]',
                )}
              >
                <Eye size={compact ? 12 : 13} />
                Preview
              </Toggle>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4}>
              Toggle markdown preview
            </TooltipContent>
          </Tooltip>
        </div>
      </motion.div>

      {/* Markdown preview */}
      <AnimatePresence>
        {showPreview && input.trim() && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                'px-3 py-2 bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-sm text-[#242424] dark:text-[#e0e0e0]',
                compact ? 'mb-1.5' : 'mb-2',
              )}
            >
              <p className="text-[10px] text-[#8a8a8a] mb-1 uppercase tracking-wider">Preview</p>
              <MarkdownContent content={input} animate />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Textarea + Send */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => {
            setInput(e.target.value);
            autoResize();
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={placeholder}
          rows={1}
          className={cn(
            'flex-1 px-4 bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-xl text-sm text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/50 transition-all resize-none overflow-y-auto',
            compact ? 'py-2' : 'py-2.5',
          )}
          style={{ maxHeight: compact ? 120 : 160 }}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileTap={input.trim() && !disabled ? { scale: 0.9 } : {}}>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || disabled}
                size="icon"
                className={cn(
                  'rounded-xl shrink-0 transition-all',
                  compact ? 'h-9 w-9' : 'h-10 w-10',
                  input.trim() && !disabled
                    ? 'bg-[#5b5fc7] text-white hover:bg-[#4f52b5] shadow-sm'
                    : 'bg-[#f0f0f0] dark:bg-[#333] text-[#b9bbbe] dark:text-[#5a5a5a]',
                )}
              >
                <Send size={compact ? 14 : 16} />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={4}>
            Send message
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Helper text */}
      {!compact && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-[10px] text-muted-foreground mt-1.5 ml-1"
        >
          Markdown supported · Shift+Enter for new line
        </motion.p>
      )}
    </div>
  );
}