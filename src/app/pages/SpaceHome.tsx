import { useState, useMemo, useEffect, useRef, useCallback, forwardRef } from 'react';
import { useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart, MessageCircle, Pin, Send, MoreHorizontal, Bookmark,
  Share2, ChevronDown, ChevronUp, Users, Activity, MessageSquare,
  CheckSquare, Rocket, GitPullRequest, Shield, Target, Phone,
  AlertTriangle, Settings, Image as ImageIcon, Smile, Hash,
  Paperclip, X, FileText, File, Download, Trash2, Pencil, Check,
  Eye, Film, Play, Video,
  type LucideIcon,
} from 'lucide-react';
import { spaces, users, currentUser, spacePosts, documents, type SpacePost, type SpacePostComment, type PostAttachment } from '../data/mockData';
import { MarkdownContent } from '../components/MarkdownContent';
import { VideoPlayerViewer } from '../components/VideoPlayerViewer';

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

const widgetColorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  purple: { bg: 'bg-[#5b5fc7]/10', text: 'text-[#5b5fc7]', darkBg: 'dark:bg-[#5b5fc7]/20', darkText: 'dark:text-[#a6a9dc]' },
  blue: { bg: 'bg-[#2196f3]/10', text: 'text-[#2196f3]', darkBg: 'dark:bg-[#2196f3]/20', darkText: 'dark:text-[#64b5f6]' },
  green: { bg: 'bg-[#237b4b]/10', text: 'text-[#237b4b]', darkBg: 'dark:bg-[#237b4b]/20', darkText: 'dark:text-[#6fcf97]' },
  orange: { bg: 'bg-[#d4820c]/10', text: 'text-[#d4820c]', darkBg: 'dark:bg-[#d4820c]/20', darkText: 'dark:text-[#f5a623]' },
  red: { bg: 'bg-[#c4314b]/10', text: 'text-[#c4314b]', darkBg: 'dark:bg-[#c4314b]/20', darkText: 'dark:text-[#f47067]' },
};

const fileIconMap: Record<string, { icon: LucideIcon; color: string }> = {
  'application/pdf': { icon: FileText, color: 'text-[#c4314b]' },
  'application/docx': { icon: FileText, color: 'text-[#2196f3]' },
  'application/xlsx': { icon: FileText, color: 'text-[#237b4b]' },
  'application/pptx': { icon: FileText, color: 'text-[#d4820c]' },
};

// Storage key for tracking last visited timestamps
const LAST_VISIT_KEY = 'space-home-last-visit';

export function getSpaceHomeLastVisit(spaceId: string): Date | null {
  try {
    const stored = localStorage.getItem(LAST_VISIT_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored);
    return data[spaceId] ? new Date(data[spaceId]) : null;
  } catch {
    return null;
  }
}

export function getNewPostCount(spaceId: string): number {
  const lastVisit = getSpaceHomeLastVisit(spaceId);
  const posts = spacePosts[spaceId] || [];
  if (!lastVisit) return posts.length > 0 ? posts.length : 0;
  return posts.filter(p => p.timestamp > lastVisit).length;
}

function setSpaceHomeLastVisit(spaceId: string) {
  try {
    const stored = localStorage.getItem(LAST_VISIT_KEY);
    const data = stored ? JSON.parse(stored) : {};
    data[spaceId] = new Date('2026-02-16T16:00:00').toISOString();
    localStorage.setItem(LAST_VISIT_KEY, JSON.stringify(data));
  } catch {
    // Silently fail
  }
}

function timeAgo(date: Date): string {
  const now = new Date('2026-02-16T16:00:00');
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function AttachmentPreview({ attachment, onRemove }: { attachment: PostAttachment; onRemove?: (id: string) => void }) {
  if (attachment.type === 'image') {
    return (
      <div className="relative group rounded-lg overflow-hidden border border-[#e1dfdd] dark:border-[#3d3d3d]">
        <img
          src={attachment.url}
          alt={attachment.name}
          className="w-full max-h-[300px] object-cover"
        />
        {onRemove && (
          <button
            onClick={() => onRemove(attachment.id)}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X size={14} />
          </button>
        )}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-gradient-to-t from-black/50 to-transparent">
          <span className="text-[11px] text-white/90 truncate block">{attachment.name}</span>
        </div>
      </div>
    );
  }

  if (attachment.type === 'video') {
    return (
      <div className="relative group rounded-lg overflow-hidden border border-[#e1dfdd] dark:border-[#3d3d3d]">
        {attachment.videoPosterUrl ? (
          <img
            src={attachment.videoPosterUrl}
            alt={attachment.name}
            className="w-full max-h-[200px] object-cover"
          />
        ) : (
          <div className="w-full h-[120px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center">
            <Film size={36} className="text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#5b5fc7]/80 backdrop-blur-sm flex items-center justify-center">
            <Play size={18} className="text-white ml-0.5" />
          </div>
        </div>
        {attachment.videoDuration && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-sm text-[10px] text-white font-mono">
            {attachment.videoDuration}
          </div>
        )}
        {onRemove && (
          <button
            onClick={() => onRemove(attachment.id)}
            className="absolute top-2 left-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X size={14} />
          </button>
        )}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-1.5">
            <Film size={11} className="text-white/70" />
            <span className="text-[11px] text-white/90 truncate">{attachment.name}</span>
          </div>
          {attachment.size && <span className="text-[10px] text-white/60">{attachment.size}</span>}
        </div>
      </div>
    );
  }

  const fileInfo = fileIconMap[attachment.mimeType || ''] || { icon: File, color: 'text-[#616161] dark:text-[#b9bbbe]' };
  const FileIcon = fileInfo.icon;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#1e1f22] group hover:border-[#5b5fc7]/30 dark:hover:border-[#5b5fc7]/30 transition-colors">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-[#f0f0f0] dark:bg-[#333] flex-shrink-0`}>
        <FileIcon size={18} className={fileInfo.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#242424] dark:text-[#f0f0f0] truncate">{attachment.name}</p>
        {attachment.size && (
          <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">{attachment.size}</p>
        )}
      </div>
      {onRemove ? (
        <button
          onClick={() => onRemove(attachment.id)}
          className="p-1 rounded-md text-[#8a8a8a] hover:text-[#c4314b] hover:bg-[#c4314b]/10 transition-colors opacity-0 group-hover:opacity-100"
        >
          <X size={14} />
        </button>
      ) : (
        <button className="p-1.5 rounded-md text-[#8a8a8a] dark:text-[#6d6f78] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc] hover:bg-[#5b5fc7]/10 transition-colors opacity-0 group-hover:opacity-100">
          <Download size={14} />
        </button>
      )}
    </div>
  );
}

function ImageGallery({ images }: { images: PostAttachment[] }) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
        {images.map((img, idx) => (
          <div
            key={img.id}
            className={`relative rounded-lg overflow-hidden border border-[#e1dfdd] dark:border-[#3d3d3d] cursor-pointer group ${
              images.length === 3 && idx === 0 ? 'col-span-2' : ''
            }`}
            onClick={() => setExpandedImage(img.url)}
          >
            <img
              src={img.url}
              alt={img.name}
              className="w-full h-[200px] object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8 cursor-pointer"
            onClick={() => setExpandedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={expandedImage}
              alt="Expanded"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function VideoCard({ video }: { video: PostAttachment }) {
  const [playerOpen, setPlayerOpen] = useState(false);

  return (
    <>
      <div
        className="relative rounded-lg overflow-hidden border border-[#e1dfdd] dark:border-[#3d3d3d] cursor-pointer group"
        onClick={() => setPlayerOpen(true)}
      >
        {video.videoPosterUrl ? (
          <img
            src={video.videoPosterUrl}
            alt={video.name}
            className="w-full h-[220px] object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-[180px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center">
            <Film size={48} className="text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
        {/* Central play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[#5b5fc7]/80 backdrop-blur-sm flex items-center justify-center shadow-xl shadow-[#5b5fc7]/30 group-hover:bg-[#5b5fc7]/90 group-hover:scale-110 transition-all">
            <Play size={24} className="text-white ml-0.5" />
          </div>
        </div>
        {/* Duration badge */}
        {video.videoDuration && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[11px] text-white font-medium font-mono tabular-nums">
            {video.videoDuration}
          </div>
        )}
        {/* Film icon */}
        <div className="absolute top-2.5 left-2.5 p-1.5 rounded-md bg-black/30 backdrop-blur-sm">
          <Film size={13} className="text-white" />
        </div>
        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-[12px] text-white font-medium truncate">{video.name}</p>
          {video.size && <span className="text-[10px] text-white/60">{video.size}</span>}
        </div>
      </div>

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

function DeleteConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-[#2b2b2b] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-2xl p-6 max-w-[400px] w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#c4314b]/10 dark:bg-[#c4314b]/20 flex items-center justify-center">
            <Trash2 size={20} className="text-[#c4314b] dark:text-[#f47067]" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#242424] dark:text-[#f0f0f0]">Delete post?</h3>
            <p className="text-[13px] text-[#8a8a8a] dark:text-[#6d6f78]">This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[13px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-[13px] font-medium text-white bg-[#c4314b] hover:bg-[#b02a42] rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PostCommentItem({ comment, onLikeComment }: { comment: SpacePostComment; onLikeComment: (id: string) => void }) {
  const author = users.find(u => u.id === comment.userId);
  const isLiked = comment.likes.includes(currentUser.id);

  return (
    <div className="flex gap-2.5 py-2.5">
      <img
        src={author?.avatar}
        alt={author?.name}
        className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{author?.name}</span>
          <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">{timeAgo(comment.timestamp)}</span>
        </div>
        <p className="text-[13px] text-[#424242] dark:text-[#d1d1d1] mt-0.5 leading-relaxed">{comment.content}</p>
        <button
          onClick={() => onLikeComment(comment.id)}
          className={`flex items-center gap-1 mt-1 text-[11px] transition-colors ${
            isLiked
              ? 'text-[#c4314b] dark:text-[#f47067]'
              : 'text-[#8a8a8a] dark:text-[#6d6f78] hover:text-[#c4314b] dark:hover:text-[#f47067]'
          }`}
        >
          <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
          {comment.likes.length > 0 && <span>{comment.likes.length}</span>}
        </button>
      </div>
    </div>
  );
}

function LinkedDocumentEmbed({ docId }: { docId: string }) {
  const linkedDoc = documents.find(d => d.id === docId);
  if (!linkedDoc) return null;
  const docAuthor = users.find(u => u.id === linkedDoc.authorId);
  const preview = linkedDoc.content
    ?.filter(b => b.type === 'paragraph' || b.type === 'bullet')
    .slice(0, 2)
    .map(b => (b.content || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/`(.+?)`/g, '$1').replace(/\[(.+?)\]\(.+?\)/g, '$1'))
    .join(' ')
    .slice(0, 120) || '';

  return (
    <div className="px-4 pb-3">
      <div className="rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden bg-[#faf9f8] dark:bg-[#1e1f22] hover:border-[#5b5fc7]/30 dark:hover:border-[#5b5fc7]/30 transition-colors cursor-pointer group">
        <div className="h-1 bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8]" />
        <div className="px-4 py-3.5">
          <div className="flex items-start gap-3">
            <span className="text-[28px] mt-0.5 flex-shrink-0">{linkedDoc.emoji}</span>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0] mb-0.5 group-hover:text-[#5b5fc7] dark:group-hover:text-[#a6a9dc] transition-colors">{linkedDoc.title}</h4>
              {preview && (
                <p className="text-[12px] text-[#8a8a8a] dark:text-[#6d6f78] line-clamp-2 leading-relaxed">{preview}...</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-[11px] text-[#aaa] dark:text-[#555]">
                {docAuthor && (
                  <div className="flex items-center gap-1">
                    <img src={docAuthor.avatar} alt="" className="w-4 h-4 rounded-full" />
                    <span>{docAuthor.name}</span>
                  </div>
                )}
                <span>·</span>
                <span>{linkedDoc.lastModified.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>·</span>
                <span className="text-[#5b5fc7] dark:text-[#a6a9dc]">Open document →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PostCardProps {
  post: SpacePost;
  onLike: (id: string) => void;
  onPin: (id: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onEdit: (postId: string, newContent: string) => void;
  onDelete: (postId: string) => void;
}

const PostCard = forwardRef<HTMLDivElement, PostCardProps>(function PostCard({
  post,
  onLike,
  onPin,
  onLikeComment,
  onAddComment,
  onEdit,
  onDelete,
}, ref) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const author = users.find(u => u.id === post.userId);
  const pinnedByUser = post.pinnedBy ? users.find(u => u.id === post.pinnedBy) : null;
  const isLiked = post.likes.includes(currentUser.id);
  const isAuthor = post.userId === currentUser.id;

  // Separate attachments by type
  const imageAttachments = post.attachments?.filter(a => a.type === 'image') || [];
  const videoAttachments = post.attachments?.filter(a => a.type === 'video') || [];
  const fileAttachments = post.attachments?.filter(a => a.type === 'file') || [];

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onAddComment(post.id, commentText.trim());
      setCommentText('');
      setShowComments(true);
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent.trim() !== post.content) {
      onEdit(post.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(post.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(post.id);
    setShowDeleteConfirm(false);
  };

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  return (
    <div ref={ref}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      >
        {/* Pinned banner */}
        {post.pinned && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5b5fc7]/5 to-[#7b4db8]/5 dark:from-[#5b5fc7]/10 dark:to-[#7b4db8]/10 border-b border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50">
            <Pin size={12} className="text-[#5b5fc7] dark:text-[#a6a9dc] rotate-45" />
            <span className="text-[11px] font-medium text-[#5b5fc7] dark:text-[#a6a9dc]">
              Pinned by {pinnedByUser?.name || 'Admin'}
            </span>
          </div>
        )}

        {/* Post header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={author?.avatar}
                alt={author?.name}
                className="w-10 h-10 rounded-full ring-2 ring-transparent hover:ring-[#5b5fc7]/30 transition-all"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{author?.name}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    author?.status === 'online' ? 'bg-[#237b4b]' :
                    author?.status === 'busy' ? 'bg-[#c4314b]' :
                    author?.status === 'away' ? 'bg-[#d4820c]' : 'bg-[#8a8a8a]'
                  }`} />
                  {isAuthor && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#5b5fc7]/10 text-[#5b5fc7] dark:bg-[#5b5fc7]/20 dark:text-[#a6a9dc] font-medium">You</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] text-[#8a8a8a] dark:text-[#6d6f78]">{timeAgo(post.timestamp)}</span>
                  {post.edited && (
                    <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] italic">(edited)</span>
                  )}
                </div>
              </div>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-md text-[#8a8a8a] dark:text-[#6d6f78] hover:bg-[#f0f0f0] dark:hover:bg-[#333] hover:text-[#424242] dark:hover:text-[#d1d1d1] transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-full mt-1 bg-white dark:bg-[#2b2b2b] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-xl z-10 py-1 min-w-[180px]"
                  >
                    {isAuthor && (
                      <>
                        <button
                          onClick={() => { setIsEditing(true); setEditContent(post.content); setShowMenu(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#424242] dark:text-[#d1d1d1] hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors"
                        >
                          <Pencil size={14} />
                          Edit post
                        </button>
                        <button
                          onClick={handleDelete}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#c4314b] dark:text-[#f47067] hover:bg-[#c4314b]/5 dark:hover:bg-[#c4314b]/10 transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete post
                        </button>
                        <div className="h-px bg-[#e1dfdd] dark:bg-[#3d3d3d] my-1" />
                      </>
                    )}
                    <button
                      onClick={() => { onPin(post.id); setShowMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#424242] dark:text-[#d1d1d1] hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors"
                    >
                      <Pin size={14} className={post.pinned ? 'rotate-45' : ''} />
                      {post.pinned ? 'Unpin post' : 'Pin to top'}
                    </button>
                    <button
                      onClick={() => setShowMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#424242] dark:text-[#d1d1d1] hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors"
                    >
                      <Bookmark size={14} />
                      Save post
                    </button>
                    <button
                      onClick={() => setShowMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#424242] dark:text-[#d1d1d1] hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors"
                    >
                      <Share2 size={14} />
                      Share
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Post content / Edit mode */}
        {isEditing ? (
          <div className="px-4 pb-3">
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={6}
              autoFocus
              className="w-full bg-[#f5f5f5] dark:bg-[#1e1f22] text-[14px] text-[#242424] dark:text-[#f0f0f0] placeholder-[#8a8a8a] dark:placeholder-[#6d6f78] rounded-lg px-3 py-2.5 outline-none border border-[#5b5fc7]/40 dark:border-[#5b5fc7]/30 ring-1 ring-[#5b5fc7]/10 resize-none leading-relaxed"
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-[13px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editContent.trim()}
                className="px-4 py-1.5 text-[13px] font-medium text-white bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8] rounded-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Check size={14} />
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 pb-3">
            <MarkdownContent content={post.content} />
          </div>
        )}

        {/* Image attachments */}
        {!isEditing && imageAttachments.length > 0 && (
          <div className="px-4 pb-3">
            <ImageGallery images={imageAttachments} />
          </div>
        )}

        {/* Legacy standalone image (for posts using the old image field) */}
        {!isEditing && post.image && imageAttachments.length === 0 && (
          <div className="px-4 pb-3">
            <div className="rounded-lg overflow-hidden border border-[#e1dfdd] dark:border-[#3d3d3d]">
              <img src={post.image} alt="" className="w-full max-h-[400px] object-cover" />
            </div>
          </div>
        )}

        {/* Video attachments */}
        {!isEditing && videoAttachments.length > 0 && (
          <div className="px-4 pb-3 space-y-2">
            {videoAttachments.map(vid => (
              <VideoCard key={vid.id} video={vid} />
            ))}
          </div>
        )}

        {/* File attachments */}
        {!isEditing && fileAttachments.length > 0 && (
          <div className="px-4 pb-3 space-y-2">
            {fileAttachments.map(att => (
              <AttachmentPreview key={att.id} attachment={att} />
            ))}
          </div>
        )}

        {/* Linked document embed */}
        {!isEditing && post.linkedDocId && (
          <LinkedDocumentEmbed docId={post.linkedDocId} />
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && !isEditing && (
          <div className="px-4 pb-3 flex flex-wrap gap-1.5">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#5b5fc7]/8 text-[#5b5fc7] dark:bg-[#5b5fc7]/15 dark:text-[#a6a9dc]"
              >
                <Hash size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Engagement bar */}
        <div className="px-4 py-2 border-t border-[#f0f0f0] dark:border-[#333] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1.5 text-[13px] font-medium transition-all ${
                isLiked
                  ? 'text-[#c4314b] dark:text-[#f47067]'
                  : 'text-[#616161] dark:text-[#b9bbbe] hover:text-[#c4314b] dark:hover:text-[#f47067]'
              }`}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} className="transition-transform hover:scale-110" />
              <span>{post.likes.length}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc] transition-colors"
            >
              <MessageCircle size={16} />
              <span>{post.comments.length}</span>
              {post.comments.length > 0 && (
                showComments
                  ? <ChevronUp size={14} />
                  : <ChevronDown size={14} />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {post.attachments && post.attachments.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">
                <Paperclip size={12} />
                {post.attachments.length}
              </span>
            )}
            <button className="text-[#616161] dark:text-[#b9bbbe] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc] transition-colors">
              <Share2 size={15} />
            </button>
          </div>
        </div>

        {/* Comments section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 border-t border-[#f0f0f0] dark:border-[#333]">
                {post.comments.map(comment => (
                  <PostCommentItem
                    key={comment.id}
                    comment={comment}
                    onLikeComment={(cId) => onLikeComment(post.id, cId)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comment input */}
        <div className="px-4 py-3 border-t border-[#f0f0f0] dark:border-[#333] flex items-center gap-2.5">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full flex-shrink-0"
          />
          <div className="flex-1 flex items-center gap-2 bg-[#f5f5f5] dark:bg-[#1e1f22] rounded-lg px-3 py-1.5">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment(); } }}
              className="flex-1 bg-transparent text-[13px] text-[#242424] dark:text-[#f0f0f0] placeholder-[#8a8a8a] dark:placeholder-[#6d6f78] outline-none"
            />
            <button className="text-[#8a8a8a] dark:text-[#6d6f78] hover:text-[#5b5fc7] transition-colors">
              <Smile size={16} />
            </button>
            {commentText.trim() && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={handleSubmitComment}
                className="text-[#5b5fc7] dark:text-[#a6a9dc] hover:text-[#4a4eb5] transition-colors"
              >
                <Send size={16} />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <DeleteConfirmDialog
            onConfirm={confirmDelete}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
});
PostCard.displayName = 'PostCard';

function PostComposer({ onPost }: { onPost: (content: string, attachments: PostAttachment[]) => void }) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [attachments, setAttachments] = useState<PostAttachment[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePost = () => {
    if (content.trim() || attachments.length > 0) {
      onPost(content.trim(), attachments);
      setContent('');
      setAttachments([]);
      setIsFocused(false);
      setShowPreview(false);
    }
  };

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      setAttachments(prev => [...prev, {
        id: `att-new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: 'image',
        name: file.name,
        url,
        size: file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`,
        mimeType: file.type,
      }]);
    });
    e.target.value = '';
  }, []);

  const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      setAttachments(prev => [...prev, {
        id: `att-new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: 'video',
        name: file.name,
        url,
        size: file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`,
        mimeType: file.type,
        videoDuration: '0:00',
      }]);
    });
    e.target.value = '';
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const mimeKey = file.name.endsWith('.pdf') ? 'application/pdf'
        : file.name.endsWith('.xlsx') ? 'application/xlsx'
        : file.name.endsWith('.docx') ? 'application/docx'
        : file.name.endsWith('.pptx') ? 'application/pptx'
        : 'application/octet-stream';
      setAttachments(prev => [...prev, {
        id: `att-new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: 'file',
        name: file.name,
        url: '#',
        size: file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`,
        mimeType: mimeKey,
      }]);
    });
    e.target.value = '';
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  const imageAttachments = attachments.filter(a => a.type === 'image');
  const videoAttachments = attachments.filter(a => a.type === 'video');
  const fileAttachments = attachments.filter(a => a.type === 'file');

  return (
    <motion.div
      layout
      className={`bg-white dark:bg-[#252525] rounded-xl border transition-all overflow-hidden ${
        isFocused
          ? 'border-[#5b5fc7]/40 dark:border-[#5b5fc7]/30 shadow-md ring-1 ring-[#5b5fc7]/10'
          : 'border-[#e1dfdd] dark:border-[#3d3d3d] shadow-sm'
      }`}
    >
      <div className="p-4 flex gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-10 h-10 rounded-full flex-shrink-0"
        />
        <div className="flex-1">
          <textarea
            placeholder="Share an update with your team..."
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            rows={isFocused ? 4 : 2}
            className="w-full bg-transparent text-[14px] text-[#242424] dark:text-[#f0f0f0] placeholder-[#8a8a8a] dark:placeholder-[#6d6f78] outline-none resize-none leading-relaxed"
          />
          {/* Markdown preview */}
          <AnimatePresence>
            {showPreview && content.trim() && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 px-3 py-2 bg-[#f5f5f5] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg">
                  <p className="text-[10px] text-[#8a8a8a] mb-1 uppercase tracking-wider">Preview</p>
                  <MarkdownContent content={content} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Attachment previews */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-3 space-y-2"
          >
            {imageAttachments.map(att => (
              <AttachmentPreview key={att.id} attachment={att} onRemove={removeAttachment} />
            ))}
            {videoAttachments.map(att => (
              <AttachmentPreview key={att.id} attachment={att} onRemove={removeAttachment} />
            ))}
            {fileAttachments.map(att => (
              <AttachmentPreview key={att.id} attachment={att} onRemove={removeAttachment} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-3 flex items-center justify-between border-t border-[#f0f0f0] dark:border-[#333] pt-3"
          >
            <div className="flex items-center gap-1">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                className={`p-2 rounded-md transition-colors ${
                  imageAttachments.length > 0
                    ? 'text-[#5b5fc7] dark:text-[#a6a9dc] bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20'
                    : 'text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#333] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc]'
                }`}
                title="Add image"
              >
                <ImageIcon size={18} />
              </button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={handleVideoSelect}
              />
              <button
                onClick={() => videoInputRef.current?.click()}
                className={`p-2 rounded-md transition-colors ${
                  videoAttachments.length > 0
                    ? 'text-[#5b5fc7] dark:text-[#a6a9dc] bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20'
                    : 'text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#333] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc]'
                }`}
                title="Add video"
              >
                <Video size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.zip"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-md transition-colors ${
                  fileAttachments.length > 0
                    ? 'text-[#5b5fc7] dark:text-[#a6a9dc] bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20'
                    : 'text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#333] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc]'
                }`}
                title="Attach file"
              >
                <Paperclip size={18} />
              </button>
              <button className="p-2 rounded-md text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#333] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc] transition-colors">
                <Smile size={18} />
              </button>
              <button className="p-2 rounded-md text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#333] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc] transition-colors">
                <Hash size={18} />
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`p-2 rounded-md transition-colors ${
                  showPreview
                    ? 'text-[#5b5fc7] dark:text-[#a6a9dc] bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20'
                    : 'text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#333] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc]'
                }`}
                title="Toggle Markdown preview"
              >
                <Eye size={18} />
              </button>
              {attachments.length > 0 && (
                <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] ml-1">
                  {attachments.length} attachment{attachments.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setIsFocused(false); setContent(''); setAttachments([]); setShowPreview(false); }}
                className="px-3 py-1.5 text-[13px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={!content.trim() && attachments.length === 0}
                className="px-4 py-1.5 text-[13px] font-medium text-white bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8] rounded-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Send size={14} />
                Post
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function SpaceHome() {
  const { spaceId } = useParams();
  const space = spaces.find(s => s.id === spaceId);
  const homeConfig = space?.home;

  const initialPosts = useMemo(() => spacePosts[spaceId || ''] || [], [spaceId]);
  const [posts, setPosts] = useState<SpacePost[]>(initialPosts);

  // Reset posts when space changes
  useEffect(() => {
    setPosts(spacePosts[spaceId || ''] || []);
  }, [spaceId]);

  // Pick up pending posts shared from Documents page
  useEffect(() => {
    if (!spaceId) return;
    try {
      const raw = localStorage.getItem('pending-home-posts');
      if (!raw) return;
      const pending: { spaceId: string; post: any }[] = JSON.parse(raw);
      const forThisSpace = pending.filter(p => p.spaceId === spaceId);
      const remaining = pending.filter(p => p.spaceId !== spaceId);

      if (forThisSpace.length > 0) {
        const newPosts: SpacePost[] = forThisSpace.map(p => ({
          ...p.post,
          timestamp: new Date(p.post.timestamp),
          likes: p.post.likes || [],
          comments: p.post.comments || [],
        }));
        setPosts(prev => [...newPosts, ...prev]);
        // Clean up
        if (remaining.length > 0) {
          localStorage.setItem('pending-home-posts', JSON.stringify(remaining));
        } else {
          localStorage.removeItem('pending-home-posts');
        }
      }
    } catch {
      // Silently fail
    }
  }, [spaceId]);

  // Mark as visited when the page is viewed
  useEffect(() => {
    if (spaceId) {
      setSpaceHomeLastVisit(spaceId);
      // Dispatch a custom event so ChannelSidebar can update the badge
      window.dispatchEvent(new CustomEvent('space-home-visited', { detail: { spaceId } }));
    }
  }, [spaceId]);

  if (!space || !homeConfig) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#8a8a8a] dark:text-[#6d6f78]">
        <p>This space doesn't have a home page configured.</p>
      </div>
    );
  }

  // Separate pinned and regular posts
  const pinnedPosts = posts.filter(p => p.pinned);
  const regularPosts = posts.filter(p => !p.pinned);
  const sortedPosts = [...pinnedPosts, ...regularPosts];

  const handleNewPost = (content: string, attachments: PostAttachment[]) => {
    const newPost: SpacePost = {
      id: `post-new-${Date.now()}`,
      userId: currentUser.id,
      content,
      timestamp: new Date('2026-02-16T16:00:00'),
      likes: [],
      comments: [],
      tags: [],
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    setPosts([newPost, ...posts]);
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const isLiked = p.likes.includes(currentUser.id);
      return {
        ...p,
        likes: isLiked
          ? p.likes.filter(id => id !== currentUser.id)
          : [...p.likes, currentUser.id],
      };
    }));
  };

  const handlePin = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        pinned: !p.pinned,
        pinnedBy: !p.pinned ? currentUser.id : undefined,
      };
    }));
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: p.comments.map(c => {
          if (c.id !== commentId) return c;
          const isLiked = c.likes.includes(currentUser.id);
          return {
            ...c,
            likes: isLiked
              ? c.likes.filter(id => id !== currentUser.id)
              : [...c.likes, currentUser.id],
          };
        }),
      };
    }));
  };

  const handleAddComment = (postId: string, content: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const newComment: SpacePostComment = {
        id: `pc-new-${Date.now()}`,
        userId: currentUser.id,
        content,
        timestamp: new Date('2026-02-16T16:00:00'),
        likes: [],
      };
      return { ...p, comments: [...p.comments, newComment] };
    }));
  };

  const handleEditPost = (postId: string, newContent: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        content: newContent,
        edited: true,
        editedAt: new Date('2026-02-16T16:00:00'),
      };
    }));
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#faf9f8] dark:bg-[#1e1f22]">
      {/* Hero Banner */}
      <div className="relative h-[200px] flex-shrink-0 overflow-hidden">
        <img
          src={homeConfig.banner}
          alt={`${space.name} banner`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5b5fc7]/20 to-[#7b4db8]/20" />

        {/* Header content */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-5">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-[28px] font-bold text-white tracking-tight drop-shadow-lg">
                {space.name}
              </h1>
              <p className="text-[14px] text-white/80 mt-1 max-w-[600px] leading-relaxed drop-shadow">
                {homeConfig.description}
              </p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-md text-white text-[13px] font-medium hover:bg-white/25 transition-colors border border-white/20">
              <Settings size={14} />
              Customize
            </button>
          </div>
        </div>
      </div>

      {/* Widget indicators */}
      <div className="px-8 -mt-5 relative z-10 flex-shrink-0">
        <div className="grid grid-cols-4 gap-3">
          {homeConfig.widgets.map((widget, widgetIdx) => {
            const Icon = widgetIconMap[widget.icon] || Activity;
            const colors = widgetColorMap[widget.color];
            return (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * (widgetIdx + 1) }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors.bg} ${colors.darkBg}`}>
                  <Icon size={18} className={`${colors.text} ${colors.darkText}`} />
                </div>
                <div>
                  <p className="text-[18px] font-bold text-[#242424] dark:text-[#f0f0f0] leading-tight">{widget.value}</p>
                  <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] font-medium">{widget.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Feed area */}
      <div className="flex-1 overflow-y-auto scrollbar-on-hover px-8 py-6">
        <div className="max-w-[720px] mx-auto space-y-4">
          {/* Post composer */}
          <PostComposer onPost={handleNewPost} />

          {/* Posts feed */}
          <AnimatePresence mode="popLayout">
            {sortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onPin={handlePin}
                onLikeComment={handleLikeComment}
                onAddComment={handleAddComment}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            ))}
          </AnimatePresence>

          {/* End of feed */}
          {sortedPosts.length > 0 && (
            <div className="text-center py-6 text-[13px] text-[#8a8a8a] dark:text-[#6d6f78]">
              You're all caught up!
            </div>
          )}

          {sortedPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 flex items-center justify-center mb-4">
                <MessageSquare size={28} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
              </div>
              <p className="text-[15px] font-medium text-[#424242] dark:text-[#d1d1d1]">No posts yet</p>
              <p className="text-[13px] text-[#8a8a8a] dark:text-[#6d6f78] mt-1">Be the first to share something!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}