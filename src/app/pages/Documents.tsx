import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Star, ChevronRight, ChevronDown, Clock,
  MoreHorizontal, FileText, Hash, MessageSquare, Copy,
  Trash2, ArrowUpRight, Sparkles, Check, Square, CheckSquare,
  Quote, Code, Table, Minus, AlertCircle, List, Share2, Send,
  X, Home, Lock, Shield, Eye,
} from 'lucide-react';
import { spaces, documents, users, currentUser, initialAccessRequests, memberRoles, roleDisplayConfig, type Document, type DocumentBlock, type AccessRequest, type AccessDuration } from '../data/mockData';
import { format, formatDistanceToNow } from 'date-fns';
import { SecurityBadge } from '../components/SecurityBadge';
import { AccessBadge, LockedOverlay, RequestAccessModal, AccessRequestsPanel } from '../components/AccessControl';
import { canRoleAccess } from '../data/accessPermissions';

// Notion-style callout colors
const CALLOUT_COLORS: Record<string, { bg: string; border: string }> = {
  blue: { bg: 'bg-[#e8f0fe] dark:bg-[#1a2a3a]', border: 'border-[#c5d9f4] dark:border-[#2a4060]' },
  yellow: { bg: 'bg-[#fef9e7] dark:bg-[#2a2510]', border: 'border-[#f5e6a3] dark:border-[#4a3d18]' },
  green: { bg: 'bg-[#e6f4ea] dark:bg-[#1a2e1e]', border: 'border-[#b7ddc0] dark:border-[#2a4a30]' },
  red: { bg: 'bg-[#fce8e6] dark:bg-[#2e1a1a]', border: 'border-[#f5c6c2] dark:border-[#4a2a28]' },
  purple: { bg: 'bg-[#ede7f6] dark:bg-[#241a36]', border: 'border-[#d1c4e9] dark:border-[#3a2a50]' },
  gray: { bg: 'bg-[#f1f3f4] dark:bg-[#2a2a2a]', border: 'border-[#dadce0] dark:border-[#404040]' },
};

// Render inline markdown (bold, italic, inline code, links)
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(<strong key={key++} className="font-semibold text-[#242424] dark:text-[#f0f0f0]">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-[#f1f3f4] dark:bg-[#333] text-[#c4314b] dark:text-[#f47067] text-[0.9em] font-mono">
          {match[4]}
        </code>
      );
    } else if (match[5]) {
      parts.push(
        <a key={key++} href={match[7]} className="text-[#5b5fc7] dark:text-[#a6a9dc] underline decoration-[#5b5fc7]/30 hover:decoration-[#5b5fc7] transition-colors" target="_blank" rel="noreferrer">
          {match[6]}
        </a>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

function BlockRenderer({ block, numberIndex }: { block: DocumentBlock; numberIndex?: number }) {
  switch (block.type) {
    case 'heading1':
      return (
        <h1 className="text-[30px] font-bold text-[#242424] dark:text-[#f0f0f0] mt-8 mb-1 leading-tight">
          {block.content}
        </h1>
      );
    case 'heading2':
      return (
        <h2 className="text-[22px] font-semibold text-[#242424] dark:text-[#f0f0f0] mt-6 mb-1 leading-tight">
          {block.content}
        </h2>
      );
    case 'heading3':
      return (
        <h3 className="text-[18px] font-semibold text-[#242424] dark:text-[#f0f0f0] mt-5 mb-1 leading-tight">
          {block.content}
        </h3>
      );
    case 'paragraph':
      return (
        <p className="text-[15px] text-[#37352f] dark:text-[#d4d4d4] leading-relaxed my-1">
          {renderInlineMarkdown(block.content || '')}
        </p>
      );
    case 'bullet':
      return (
        <div className="flex items-start gap-2 my-0.5 pl-1">
          <span className="text-[#37352f] dark:text-[#d4d4d4] mt-[7px] text-[6px]">●</span>
          <p className="text-[15px] text-[#37352f] dark:text-[#d4d4d4] leading-relaxed flex-1">
            {renderInlineMarkdown(block.content || '')}
          </p>
        </div>
      );
    case 'numbered':
      return (
        <div className="flex items-start gap-2 my-0.5 pl-1">
          <span className="text-[15px] text-[#37352f] dark:text-[#d4d4d4] min-w-[20px] mt-[1px]">{numberIndex ?? 1}.</span>
          <p className="text-[15px] text-[#37352f] dark:text-[#d4d4d4] leading-relaxed flex-1">
            {renderInlineMarkdown(block.content || '')}
          </p>
        </div>
      );
    case 'todo':
      return (
        <div className="flex items-start gap-2.5 my-1 pl-1 group/todo">
          <div className={`mt-[3px] w-[18px] h-[18px] rounded-[3px] border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
            block.checked
              ? 'bg-[#5b5fc7] border-[#5b5fc7] dark:bg-[#5b5fc7]'
              : 'border-[#ccc] dark:border-[#555] hover:border-[#5b5fc7] dark:hover:border-[#5b5fc7]'
          }`}>
            {block.checked && <Check size={12} className="text-white" strokeWidth={3} />}
          </div>
          <p className={`text-[15px] leading-relaxed flex-1 ${
            block.checked
              ? 'text-[#999] dark:text-[#666] line-through'
              : 'text-[#37352f] dark:text-[#d4d4d4]'
          }`}>
            {renderInlineMarkdown(block.content || '')}
          </p>
        </div>
      );
    case 'callout': {
      const colors = CALLOUT_COLORS[block.calloutColor || 'gray'];
      return (
        <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border my-2 ${colors.bg} ${colors.border}`}>
          <span className="text-[20px] mt-0.5 flex-shrink-0">{block.calloutEmoji || '💡'}</span>
          <p className="text-[14px] text-[#37352f] dark:text-[#d4d4d4] leading-relaxed flex-1">
            {renderInlineMarkdown(block.content || '')}
          </p>
        </div>
      );
    }
    case 'divider':
      return <hr className="my-4 border-[#e8e8e8] dark:border-[#3d3d3d]" />;
    case 'code':
      return (
        <div className="my-2 rounded-lg bg-[#f7f6f3] dark:bg-[#1e1e1e] border border-[#e8e8e8] dark:border-[#333] overflow-hidden">
          {block.language && (
            <div className="px-4 py-1.5 bg-[#ededec] dark:bg-[#2a2a2a] text-[11px] font-mono text-[#999] dark:text-[#666] border-b border-[#e8e8e8] dark:border-[#333]">
              {block.language}
            </div>
          )}
          <pre className="px-4 py-3 overflow-x-auto">
            <code className="text-[13px] text-[#37352f] dark:text-[#d4d4d4] font-mono leading-relaxed whitespace-pre">
              {block.content}
            </code>
          </pre>
        </div>
      );
    case 'quote':
      return (
        <blockquote className="my-2 pl-4 border-l-[3px] border-[#242424] dark:border-[#f0f0f0]">
          <p className="text-[15px] text-[#37352f] dark:text-[#d4d4d4] italic leading-relaxed">
            {renderInlineMarkdown(block.content || '')}
          </p>
        </blockquote>
      );
    case 'table':
      if (!block.rows || block.rows.length === 0) return null;
      return (
        <div className="my-3 overflow-x-auto rounded-lg border border-[#e8e8e8] dark:border-[#3d3d3d]">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="bg-[#f7f6f3] dark:bg-[#2a2a2a]">
                {block.rows[0].map((cell, i) => (
                  <th key={i} className="px-4 py-2.5 text-left font-semibold text-[#37352f] dark:text-[#d4d4d4] border-b border-[#e8e8e8] dark:border-[#3d3d3d]">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.slice(1).map((row, ri) => (
                <tr key={ri} className="border-b border-[#e8e8e8] dark:border-[#3d3d3d] last:border-b-0 hover:bg-[#f7f6f3] dark:hover:bg-[#2a2a2a] transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 text-[#37352f] dark:text-[#d4d4d4]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

function BlockList({ blocks }: { blocks: DocumentBlock[] }) {
  let numberCounter = 0;
  return (
    <>
      {blocks.map((block, idx) => {
        if (block.type === 'numbered') {
          numberCounter++;
        } else {
          numberCounter = 0;
        }
        return (
          <div key={block.id} className="group/block relative">
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover/block:opacity-100 transition-opacity flex items-center gap-0.5">
              <button className="p-0.5 text-[#c0bfbc] hover:text-[#37352f] dark:text-[#555] dark:hover:text-[#aaa] transition-colors">
                <Plus size={12} />
              </button>
            </div>
            <BlockRenderer block={block} numberIndex={block.type === 'numbered' ? numberCounter : undefined} />
          </div>
        );
      })}
    </>
  );
}

// Sidebar tree item
function SidebarDocItem({
  doc,
  docs,
  depth,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
}: {
  doc: Document;
  docs: Document[];
  depth: number;
  selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const children = docs.filter(d => d.parentId === doc.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedIds.has(doc.id);
  const isSelected = selectedId === doc.id;

  return (
    <div>
      <button
        onClick={() => onSelect(doc.id)}
        className={`group/item w-full flex items-center gap-1 py-[5px] rounded-md transition-colors text-left ${
          isSelected
            ? 'bg-[#f0f0f0] dark:bg-[#333] text-[#242424] dark:text-[#f0f0f0]'
            : 'text-[#616161] dark:text-[#999] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px`, paddingRight: '8px' }}
      >
        {hasChildren ? (
          <div
            role="button"
            tabIndex={-1}
            onClick={(e) => { e.stopPropagation(); onToggle(doc.id); }}
            className="p-0.5 rounded hover:bg-[#e0e0e0] dark:hover:bg-[#444] transition-colors flex-shrink-0 cursor-pointer"
          >
            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
              <ChevronRight size={12} />
            </motion.div>
          </div>
        ) : (
          <span className="w-[18px]" />
        )}
        <span className="text-[14px] flex-shrink-0">{doc.emoji}</span>
        <span className={`text-[13px] truncate flex-1 ${isSelected ? 'font-medium' : ''}`}>
          {doc.title}
        </span>
        {doc.accessLevel && doc.accessLevel !== 'public' && (
          <AccessBadge level={doc.accessLevel} variant="dot" />
        )}
        {doc.securityLevel && (
          <SecurityBadge level={doc.securityLevel} variant="dot" />
        )}
        {doc.favorite && (
          <Star size={11} className="text-[#eab308] fill-[#eab308] flex-shrink-0 opacity-60" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {children.map(child => (
              <SidebarDocItem
                key={child.id}
                doc={child}
                docs={docs}
                depth={depth + 1}
                selectedId={selectedId}
                expandedIds={expandedIds}
                onSelect={onSelect}
                onToggle={onToggle}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── View As Role Picker ──────────────────────────────────────────────────────
const PREVIEW_ROLES = [
  { slug: '', label: 'Your role (Admin)', description: 'Default view' },
  { slug: 'member', label: 'Member', description: 'Standard member access' },
  { slug: 'guest', label: 'Guest', description: 'Limited external access' },
  { slug: 'custom-contributor', label: 'Contributor', description: 'Custom role' },
  { slug: 'custom-reviewer', label: 'External Reviewer', description: 'Custom role' },
];

function ViewAsRolePicker({
  activeRole,
  onChangeRole,
}: {
  activeRole: string;
  onChangeRole: (role: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const currentLabel = PREVIEW_ROLES.find(r => r.slug === activeRole)?.label || 'Admin';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
          activeRole
            ? 'bg-[#d4820c]/10 text-[#d4820c] dark:text-[#f5a623] border border-[#d4820c]/30'
            : 'text-[#616161] dark:text-[#999] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]'
        }`}
      >
        <Eye size={13} />
        {activeRole ? `Viewing as: ${currentLabel}` : 'View as…'}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1 bg-white dark:bg-[#2b2b2b] rounded-xl border border-[#e8e8e8] dark:border-[#3d3d3d] shadow-xl z-30 py-1.5 min-w-[220px]"
          >
            <p className="px-3 py-1 text-[10px] font-semibold text-[#999] dark:text-[#666] uppercase tracking-wider">
              Preview access as role
            </p>
            {PREVIEW_ROLES.map(role => (
              <button
                key={role.slug}
                onClick={() => { onChangeRole(role.slug); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors flex items-center justify-between gap-2 ${
                  activeRole === role.slug ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#424242] dark:text-[#d1d1d1]'
                }`}
              >
                <div>
                  <span className="font-medium">{role.label}</span>
                  <span className="text-[11px] text-[#999] dark:text-[#666] ml-1.5">{role.description}</span>
                </div>
                {activeRole === role.slug && <Check size={14} className="text-[#5b5fc7] dark:text-[#a6a9dc] shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Share to Home dialog
function ShareToHomeDialog({
  doc,
  spaceId,
  onClose,
}: {
  doc: Document;
  spaceId: string;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Spaces that have a home page
  const spacesWithHome = spaces.filter(s => s.home);
  const [targetSpaceId, setTargetSpaceId] = useState(
    spacesWithHome.find(s => s.id === spaceId)?.id || spacesWithHome[0]?.id || ''
  );
  const targetSpace = spaces.find(s => s.id === targetSpaceId);
  const author = users.find(u => u.id === doc.authorId);

  // Get a short text preview from the document content
  const contentPreview = useMemo(() => {
    if (!doc.content) return '';
    const textBlocks = doc.content.filter(
      b => b.type === 'paragraph' || b.type === 'bullet' || b.type === 'numbered'
    );
    return textBlocks
      .slice(0, 2)
      .map(b => (b.content || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/`(.+?)`/g, '$1').replace(/\[(.+?)\]\(.+?\)/g, '$1'))
      .join(' ')
      .slice(0, 140);
  }, [doc]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handlePost = () => {
    setPosting(true);
    // Build the post payload and store in localStorage
    const pendingPost = {
      id: `post-doc-${Date.now()}`,
      userId: currentUser.id,
      content: message.trim()
        ? message.trim()
        : `📄 Shared a document`,
      timestamp: new Date().toISOString(),
      likes: [],
      comments: [],
      tags: ['document'],
      linkedDocId: doc.id,
    };

    // Store as pending post to be picked up by SpaceHome
    const existing = JSON.parse(localStorage.getItem('pending-home-posts') || '[]');
    existing.push({ spaceId: targetSpaceId, post: pendingPost });
    localStorage.setItem('pending-home-posts', JSON.stringify(existing));

    setTimeout(() => {
      setPosting(false);
      setPosted(true);
      setTimeout(() => {
        onClose();
        navigate(`/space/${targetSpaceId}/home`);
      }, 600);
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-[#2b2b2b] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-2xl w-full max-w-[520px] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0] dark:border-[#333]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5b5fc7] to-[#7b4db8] flex items-center justify-center">
              <Share2 size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#242424] dark:text-[#f0f0f0]">Post to Home</h3>
              <p className="text-[12px] text-[#999] dark:text-[#666]">Share this document with your team</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#999] hover:text-[#242424] dark:text-[#666] dark:hover:text-[#f0f0f0] hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-4">
          {/* Target space selector */}
          {spacesWithHome.length > 1 && (
            <div>
              <label className="text-[12px] font-medium text-[#999] dark:text-[#666] uppercase tracking-wider block mb-1.5">
                Post to
              </label>
              <div className="flex gap-2">
                {spacesWithHome.map(sp => (
                  <button
                    key={sp.id}
                    onClick={() => setTargetSpaceId(sp.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] transition-all ${
                      targetSpaceId === sp.id
                        ? 'border-[#5b5fc7] bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10 text-[#5b5fc7] dark:text-[#a6a9dc] font-medium'
                        : 'border-[#e8e8e8] dark:border-[#333] text-[#616161] dark:text-[#999] hover:border-[#ccc] dark:hover:border-[#444]'
                    }`}
                  >
                    <span className="text-[15px]">{sp.icon}</span>
                    {sp.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="text-[12px] font-medium text-[#999] dark:text-[#666] uppercase tracking-wider block mb-1.5">
              Message (optional)
            </label>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Add a message about this document..."
              rows={3}
              className="w-full text-[14px] bg-[#f5f5f5] dark:bg-[#1e1f22] text-[#242424] dark:text-[#f0f0f0] placeholder-[#aaa] dark:placeholder-[#555] rounded-lg px-3 py-2.5 outline-none border border-[#e8e8e8] dark:border-[#333] focus:border-[#5b5fc7]/40 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Document preview card */}
          <div className="rounded-xl border border-[#e8e8e8] dark:border-[#333] overflow-hidden bg-[#faf9f8] dark:bg-[#222]">
            {/* Card accent */}
            <div className="h-1 bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8]" />
            <div className="px-4 py-3.5">
              <div className="flex items-start gap-3">
                <span className="text-[28px] mt-0.5">{doc.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0] mb-0.5">{doc.title}</h4>
                  {contentPreview && (
                    <p className="text-[12px] text-[#999] dark:text-[#666] line-clamp-2 leading-relaxed">{contentPreview}...</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-[#aaa] dark:text-[#555]">
                    {author && (
                      <div className="flex items-center gap-1">
                        <img src={author.avatar} alt="" className="w-4 h-4 rounded-full" />
                        <span>{author.name}</span>
                      </div>
                    )}
                    <span>·</span>
                    <span>{format(doc.lastModified, 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#f0f0f0] dark:border-[#333] bg-[#faf9f8] dark:bg-[#252525]">
          <div className="flex items-center gap-1.5 text-[12px] text-[#999] dark:text-[#666]">
            <Home size={13} />
            Posting to {targetSpace?.name || 'Home'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-[13px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={posting || posted}
              className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium text-white bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {posted ? (
                <>
                  <Check size={14} />
                  Posted!
                </>
              ) : posting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Post
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Documents() {
  const { spaceId } = useParams();
  const currentSpace = spaces.find(s => s.id === spaceId);
  const [selectedDocId, setSelectedDocId] = useState<string | null>('doc-1');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['doc-8']));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAccessPanel, setShowAccessPanel] = useState(false);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(initialAccessRequests);
  // Track temporary access grants per resource (userId → expiration)
  const [tempAccessGrants, setTempAccessGrants] = useState<Record<string, Record<string, Date>>>({});
  const searchRef = useRef<HTMLInputElement>(null);
  // "View as" role preview — lets admins simulate restricted roles
  const [previewRole, setPreviewRole] = useState('');

  const userRole = previewRole || (memberRoles[currentUser.id] || 'guest');

  // Access control — level-based via Space Permissions matrix
  const getDocAccessLevel = useCallback((doc: Document) => {
    return (doc.accessLevel ?? 'public') as 'public' | 'restricted' | 'confidential';
  }, []);

  const hasAccess = useCallback((doc: Document) => {
    const level = getDocAccessLevel(doc);
    if (level === 'public') return true;
    // Check role permissions from shared access matrix
    if (canRoleAccess(userRole, level)) return true;
    // Check temporary access grants
    const grants = tempAccessGrants[doc.id];
    if (grants && grants[currentUser.id]) {
      return grants[currentUser.id].getTime() > Date.now();
    }
    return false;
  }, [getDocAccessLevel, userRole, tempAccessGrants]);

  const hasPendingRequest = useCallback((docId: string) => {
    return accessRequests.some(r => r.resourceId === docId && r.requesterId === currentUser.id && r.status === 'pending');
  }, [accessRequests]);

  const handleRequestAccess = useCallback((docId: string, reason: string, duration: AccessDuration) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    const newReq: AccessRequest = {
      id: `ar-${Date.now()}`,
      resourceType: 'document',
      resourceId: docId,
      resourceName: doc.title,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterAvatar: currentUser.avatar,
      requesterRole: userRole,
      reason,
      requestedDuration: duration,
      status: 'pending',
      requestedAt: new Date(),
    };
    setAccessRequests(prev => [newReq, ...prev]);
  }, [userRole]);

  const durationMs = (d: AccessDuration) => ({ '24h': 86400000, '3d': 259200000, '7d': 604800000, '30d': 2592000000 }[d]);

  const handleApproveRequest = useCallback((requestId: string) => {
    setAccessRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      const expiresAt = new Date(Date.now() + durationMs(r.requestedDuration));
      setTempAccessGrants(grants => ({
        ...grants,
        [r.resourceId]: { ...grants[r.resourceId], [r.requesterId]: expiresAt },
      }));
      return { ...r, status: 'approved' as const, respondedAt: new Date(), respondedBy: currentUser.id, expiresAt };
    }));
  }, []);

  const handleDenyRequest = useCallback((requestId: string) => {
    setAccessRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, status: 'denied' as const, respondedAt: new Date(), respondedBy: currentUser.id } : r
    ));
  }, []);

  if (!currentSpace) return null;

  const selectedDoc = documents.find(d => d.id === selectedDocId);
  const author = selectedDoc ? users.find(u => u.id === selectedDoc.authorId) : null;

  // Top-level docs (no parent)
  const topLevelDocs = documents.filter(d => !d.parentId);
  // Favorites
  const favDocs = documents.filter(d => d.favorite);
  // Recent (sorted by lastModified, top 5)
  const recentDocs = [...documents].sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime()).slice(0, 5);

  // Filtered docs for search
  const filteredDocs = searchQuery
    ? documents.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Build breadcrumbs for selected doc
  const buildBreadcrumbs = (doc: Document): Document[] => {
    const trail: Document[] = [doc];
    let current = doc;
    while (current.parentId) {
      const parent = documents.find(d => d.id === current.parentId);
      if (parent) {
        trail.unshift(parent);
        current = parent;
      } else break;
    }
    return trail;
  };

  const breadcrumbs = selectedDoc ? buildBreadcrumbs(selectedDoc) : [];
  const childPages = selectedDoc ? documents.filter(d => d.parentId === selectedDoc.id) : [];

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <div className="flex-1 flex bg-white dark:bg-[#191919] overflow-hidden">
      {/* Sidebar */}
      <div className="w-[260px] flex-shrink-0 bg-[#fbfbfa] dark:bg-[#202020] border-r border-[#e8e8e8] dark:border-[#2e2e2e] flex flex-col overflow-hidden">
        {/* Sidebar header */}
        <div className="px-3 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[#37352f] dark:text-[#e0e0e0] tracking-tight">
              {currentSpace.name}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 rounded-md text-[#8a8a8a] hover:text-[#37352f] dark:text-[#666] dark:hover:text-[#ccc] hover:bg-[#ededec] dark:hover:bg-[#333] transition-colors"
            >
              <Search size={14} />
            </button>
            <button className="p-1.5 rounded-md text-[#8a8a8a] hover:text-[#37352f] dark:text-[#666] dark:hover:text-[#ccc] hover:bg-[#ededec] dark:hover:bg-[#333] transition-colors">
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Search */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-3 pb-2 overflow-hidden"
            >
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#aaa] dark:text-[#666]" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-white dark:bg-[#2a2a2a] text-[#37352f] dark:text-[#e0e0e0] placeholder-[#aaa] dark:placeholder-[#555] rounded-md border border-[#e0e0e0] dark:border-[#3d3d3d] outline-none focus:border-[#5b5fc7]/40 transition-colors"
                />
              </div>
              {searchQuery && (
                <div className="mt-1.5 space-y-0.5 max-h-[200px] overflow-y-auto">
                  {filteredDocs.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => { setSelectedDocId(doc.id); setSearchQuery(''); setSearchOpen(false); }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-[#ededec] dark:hover:bg-[#333] transition-colors"
                    >
                      <span className="text-[13px]">{doc.emoji}</span>
                      <span className="text-[13px] text-[#37352f] dark:text-[#e0e0e0] truncate flex-1">{doc.title}</span>
                      {doc.securityLevel && (
                        <SecurityBadge level={doc.securityLevel} variant="icon" />
                      )}
                    </button>
                  ))}
                  {filteredDocs.length === 0 && (
                    <p className="text-[12px] text-[#aaa] dark:text-[#666] px-2 py-2">No results</p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto scrollbar-on-hover px-2 pb-4">
          {/* Favorites */}
          {favDocs.length > 0 && (
            <div className="mb-3">
              <p className="px-2 py-1.5 text-[11px] font-semibold text-[#999] dark:text-[#666] uppercase tracking-wider">
                Favorites
              </p>
              {favDocs.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full flex items-center gap-2 px-2 py-[5px] rounded-md transition-colors text-left ${
                    selectedDocId === doc.id
                      ? 'bg-[#f0f0f0] dark:bg-[#333]'
                      : 'hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]'
                  }`}
                >
                  <span className="text-[14px]">{doc.emoji}</span>
                  <span className={`text-[13px] truncate flex-1 ${
                    selectedDocId === doc.id
                      ? 'font-medium text-[#242424] dark:text-[#f0f0f0]'
                      : 'text-[#616161] dark:text-[#999]'
                  }`}>
                    {doc.title}
                  </span>
                  {doc.securityLevel && (
                    <SecurityBadge level={doc.securityLevel} variant="dot" />
                  )}
                  <Star size={11} className="text-[#eab308] fill-[#eab308] flex-shrink-0 opacity-60" />
                </button>
              ))}
            </div>
          )}

          {/* All pages */}
          <div>
            <p className="px-2 py-1.5 text-[11px] font-semibold text-[#999] dark:text-[#666] uppercase tracking-wider">
              Pages
            </p>
            {topLevelDocs.map(doc => (
              <SidebarDocItem
                key={doc.id}
                doc={doc}
                docs={documents}
                depth={0}
                selectedId={selectedDocId}
                expandedIds={expandedIds}
                onSelect={setSelectedDocId}
                onToggle={toggleExpand}
              />
            ))}
          </div>

          {/* New page button */}
          <button className="mt-3 w-full flex items-center gap-2 px-2 py-2 rounded-md text-[13px] text-[#aaa] dark:text-[#666] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] hover:text-[#616161] dark:hover:text-[#999] transition-colors">
            <Plus size={14} />
            New page
          </button>
        </div>

        {/* Sidebar footer — recently edited */}
        <div className="border-t border-[#e8e8e8] dark:border-[#2e2e2e] px-3 py-2.5">
          <p className="text-[11px] font-semibold text-[#999] dark:text-[#666] uppercase tracking-wider mb-1.5">Recently Edited</p>
          {recentDocs.slice(0, 3).map(doc => (
            <button
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className="w-full flex items-center gap-2 px-1 py-1 rounded text-left hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
            >
              <span className="text-[12px]">{doc.emoji}</span>
              <span className="text-[12px] text-[#616161] dark:text-[#999] truncate flex-1">{doc.title}</span>
              <span className="text-[10px] text-[#aaa] dark:text-[#555] flex-shrink-0">
                {formatDistanceToNow(doc.lastModified, { addSuffix: false })}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Preview mode banner */}
        {previewRole && (
          <div className="flex items-center justify-between px-4 py-2 bg-[#d4820c]/10 dark:bg-[#d4820c]/15 border-b border-[#d4820c]/20 flex-shrink-0">
            <div className="flex items-center gap-2 text-[12px] text-[#d4820c] dark:text-[#f5a623]">
              <Eye size={14} />
              <span className="font-semibold">Preview Mode</span>
              <span className="text-[#d4820c]/70 dark:text-[#f5a623]/70">— Viewing access as <strong>{PREVIEW_ROLES.find(r => r.slug === previewRole)?.label}</strong>. Restricted content will appear locked.</span>
            </div>
            <button
              onClick={() => setPreviewRole('')}
              className="text-[11px] font-semibold text-[#d4820c] dark:text-[#f5a623] hover:underline"
            >
              Exit Preview
            </button>
          </div>
        )}
        {selectedDoc ? (
          <>
            {/* Top bar */}
            <div className="h-[44px] flex items-center justify-between px-4 border-b border-[#f0f0f0] dark:border-[#2e2e2e] flex-shrink-0">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-1 text-[13px] overflow-hidden">
                {breadcrumbs.map((crumb, idx) => (
                  <div key={crumb.id} className="flex items-center">
                    {idx > 0 && <ChevronRight size={12} className="text-[#ccc] dark:text-[#555] flex-shrink-0 mx-0.5" />}
                    <button
                      onClick={() => setSelectedDocId(crumb.id)}
                      className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors truncate ${
                        crumb.id === selectedDoc.id
                          ? 'text-[#37352f] dark:text-[#e0e0e0]'
                          : 'text-[#999] dark:text-[#666]'
                      }`}
                    >
                      <span className="text-[13px]">{crumb.emoji}</span>
                      <span className="truncate">{crumb.title}</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <ViewAsRolePicker activeRole={previewRole} onChangeRole={setPreviewRole} />
                {getDocAccessLevel(selectedDoc) !== 'public' && (
                  <button
                    onClick={() => setShowAccessPanel(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium text-[#d4820c] dark:text-[#f5a623] hover:bg-[#d4820c]/8 dark:hover:bg-[#d4820c]/15 transition-colors"
                  >
                    <Shield size={13} />
                    Access Requests
                  </button>
                )}
                {hasAccess(selectedDoc) && (
                  <button
                    onClick={() => setShowShareDialog(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] text-[#616161] dark:text-[#999] hover:bg-[#5b5fc7]/10 dark:hover:bg-[#5b5fc7]/15 hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc] transition-colors"
                  >
                    <Share2 size={13} />
                    Post to Home
                  </button>
                )}
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] text-[#616161] dark:text-[#999] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors">
                  <MessageSquare size={13} />
                  Comment
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] text-[#616161] dark:text-[#999] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors">
                  <Clock size={13} />
                  {formatDistanceToNow(selectedDoc.lastModified, { addSuffix: true })}
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] text-[#616161] dark:text-[#999] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors">
                  <Star size={13} className={selectedDoc.favorite ? 'text-[#eab308] fill-[#eab308]' : ''} />
                </button>
                <button className="p-1.5 rounded-md text-[#616161] dark:text-[#999] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* Document content */}
            {!hasAccess(selectedDoc) ? (
              /* Locked overlay for restricted documents */
              <LockedOverlay
                resourceName={selectedDoc.title}
                accessLevel={getDocAccessLevel(selectedDoc)}
                userRole={userRole}
                hasExistingRequest={hasPendingRequest(selectedDoc.id)}
                onRequestAccess={() => setShowRequestModal(true)}
              />
            ) : (
              <div className="flex-1 overflow-y-auto scrollbar-on-hover">
                <motion.div
                  key={selectedDoc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-[740px] mx-auto px-16 py-10"
                >
                  {/* Title area */}
                  <div className="mb-6">
                    <span className="text-[48px] leading-none mb-2 block cursor-pointer hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] rounded-md inline-block px-1 -ml-1 transition-colors">
                      {selectedDoc.emoji}
                    </span>
                    <h1 className="text-[40px] font-bold text-[#242424] dark:text-[#f0f0f0] leading-tight mt-2 mb-1 outline-none" tabIndex={0}>
                      {selectedDoc.title}
                    </h1>
                    <div className="flex items-center gap-3 mt-3 text-[13px] text-[#999] dark:text-[#666] flex-wrap">
                      {getDocAccessLevel(selectedDoc) !== 'public' && (
                        <AccessBadge level={getDocAccessLevel(selectedDoc)} variant="full" />
                      )}
                      {selectedDoc.securityLevel && (
                        <SecurityBadge level={selectedDoc.securityLevel} variant="full" />
                      )}
                      {author && (
                        <div className="flex items-center gap-1.5">
                          <img src={author.avatar} alt={author.name} className="w-5 h-5 rounded-full" />
                          <span>{author.name}</span>
                        </div>
                      )}
                      <span>·</span>
                      <span>Edited {formatDistanceToNow(selectedDoc.lastModified, { addSuffix: true })}</span>
                      <span>·</span>
                      <span>Created {format(selectedDoc.createdAt, 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  {/* Content blocks */}
                  {selectedDoc.content && selectedDoc.content.length > 0 ? (
                    <div className="pl-8">
                      <BlockList blocks={selectedDoc.content} />
                    </div>
                  ) : (
                    <div className="pl-8 mt-4">
                      <p className="text-[15px] text-[#ccc] dark:text-[#555]">
                        Press Enter to start writing, or use / for commands...
                      </p>
                    </div>
                  )}

                  {/* Child pages */}
                  {childPages.length > 0 && (
                    <div className="mt-10 pl-8">
                      <div className="border-t border-[#e8e8e8] dark:border-[#2e2e2e] pt-4">
                        <p className="text-[11px] font-semibold text-[#999] dark:text-[#666] uppercase tracking-wider mb-2">Sub-pages</p>
                        <div className="space-y-1">
                          {childPages.map(child => (
                            <button
                              key={child.id}
                              onClick={() => setSelectedDocId(child.id)}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[#e8e8e8] dark:border-[#333] hover:bg-[#f7f6f3] dark:hover:bg-[#252525] transition-colors text-left group"
                            >
                              <span className="text-[20px]">{child.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-[14px] font-medium text-[#37352f] dark:text-[#e0e0e0] truncate">{child.title}</p>
                                  {getDocAccessLevel(child) !== 'public' && (
                                    <AccessBadge level={getDocAccessLevel(child)} variant="compact" />
                                  )}
                                  {child.securityLevel && (
                                    <SecurityBadge level={child.securityLevel} variant="compact" />
                                  )}
                                </div>
                                <p className="text-[12px] text-[#999] dark:text-[#666]">{child.author} · {formatDistanceToNow(child.lastModified, { addSuffix: true })}</p>
                              </div>
                              <ArrowUpRight size={14} className="text-[#ccc] dark:text-[#555] group-hover:text-[#5b5fc7] dark:group-hover:text-[#a6a9dc] transition-colors" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#f7f6f3] dark:bg-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-[#ccc] dark:text-[#555]" />
              </div>
              <h3 className="text-[16px] font-medium text-[#242424] dark:text-[#f0f0f0] mb-1">Select a page</h3>
              <p className="text-[14px] text-[#999] dark:text-[#666]">Choose a page from the sidebar to start reading or editing</p>
            </div>
          </div>
        )}

        {/* Share to Home dialog */}
        <AnimatePresence>
          {showShareDialog && selectedDoc && spaceId && (
            <ShareToHomeDialog
              doc={selectedDoc}
              spaceId={spaceId}
              onClose={() => setShowShareDialog(false)}
            />
          )}
        </AnimatePresence>

        {/* Request Access Modal */}
        <AnimatePresence>
          {showRequestModal && selectedDoc && (
            <RequestAccessModal
              resourceName={selectedDoc.title}
              resourceType="document"
              userRole={userRole}
              onSubmit={(reason, duration) => handleRequestAccess(selectedDoc.id, reason, duration)}
              onClose={() => setShowRequestModal(false)}
            />
          )}
        </AnimatePresence>

        {/* Access Management Panel */}
        <AnimatePresence>
          {showAccessPanel && selectedDoc && (
            <AccessRequestsPanel
              resourceType="document"
              resourceId={selectedDoc.id}
              resourceName={selectedDoc.title}
              accessRequests={accessRequests}
              onApproveRequest={handleApproveRequest}
              onDenyRequest={handleDenyRequest}
              isOpen={showAccessPanel}
              onClose={() => setShowAccessPanel(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}