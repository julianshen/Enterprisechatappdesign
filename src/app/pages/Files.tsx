import React, { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Grid, List, Filter, Upload, FileText, Image,
  Archive, File, FolderOpen, Folder as FolderIcon, ChevronRight,
  MoreHorizontal, Download, Trash2, Copy, ArrowLeft, Video,
  Code, Presentation, FileSpreadsheet, Star, Eye, Clock,
  FolderPlus, ArrowUpRight, SortAsc, Check, Lock, Shield, Send,
} from 'lucide-react';
import { spaces, files, folders, currentUser, initialAccessRequests, memberRoles, roleDisplayConfig, type FileItem, type Folder, type AccessRequest, type AccessDuration } from '../data/mockData';
import { format, formatDistanceToNow } from 'date-fns';
import { SecurityBadge } from '../components/SecurityBadge';
import { AccessBadge, LockedOverlay, RequestAccessModal, AccessRequestsPanel } from '../components/AccessControl';
import { canRoleAccess } from '../data/accessPermissions';
import { useI18n } from '../context/I18nContext';

// File type icon mapping
function FileIcon({ type, size = 28 }: { type: string; size?: number }) {
  const iconProps = { size, strokeWidth: 1.5 };
  switch (type) {
    case 'pdf':
      return <FileText {...iconProps} className="text-[#e53935]" />;
    case 'image':
      return <Image {...iconProps} className="text-[#8764b8]" />;
    case 'archive':
      return <Archive {...iconProps} className="text-[#f4a261]" />;
    case 'figma':
      return (
        <div className="flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 24 24" fill="none">
            <path d="M8 24C10.2091 24 12 22.2091 12 20V16H8C5.79086 16 4 17.7909 4 20C4 22.2091 5.79086 24 8 24Z" fill="#0ACF83"/>
            <path d="M4 12C4 9.79086 5.79086 8 8 8H12V16H8C5.79086 16 4 14.2091 4 12Z" fill="#A259FF"/>
            <path d="M4 4C4 1.79086 5.79086 0 8 0H12V8H8C5.79086 8 4 6.20914 4 4Z" fill="#F24E1E"/>
            <path d="M12 0H16C18.2091 0 20 1.79086 20 4C20 6.20914 18.2091 8 16 8H12V0Z" fill="#FF7262"/>
            <path d="M20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12C12 9.79086 13.7909 8 16 8C18.2091 8 20 9.79086 20 12Z" fill="#1ABCFE"/>
          </svg>
        </div>
      );
    case 'video':
      return <Video {...iconProps} className="text-[#e91e63]" />;
    case 'svg':
      return <Code {...iconProps} className="text-[#f57f17]" />;
    case 'markdown':
      return <FileText {...iconProps} className="text-[#37352f] dark:text-[#d4d4d4]" />;
    case 'doc':
      return <FileText {...iconProps} className="text-[#0078d4]" />;
    case 'presentation':
      return <Presentation {...iconProps} className="text-[#c43e1c]" />;
    default:
      return <File {...iconProps} className="text-[#0078d4]" />;
  }
}

// Folder color mapping
const FOLDER_COLORS: Record<string, string> = {
  purple: 'text-[#5b5fc7]',
  blue: 'text-[#0078d4]',
  green: 'text-[#237b4b]',
  orange: 'text-[#d4820c]',
  red: 'text-[#c4314b]',
};

type SortKey = 'name' | 'date' | 'size';
type ViewMode = 'grid' | 'list';

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
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const currentLabel = PREVIEW_ROLES.find(r => r.slug === activeRole)?.label || 'Admin';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
          activeRole
            ? 'bg-[#d4820c]/10 text-[#d4820c] dark:text-[#f5a623] border border-[#d4820c]/30'
            : 'text-[#616161] dark:text-[#999] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]'
        }`}
      >
        <Eye size={13} />
        {activeRole ? t('access.preview.viewingAs', { role: currentLabel }) : t('access.preview.viewAs')}
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
              {t('access.preview.title')}
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

export function Files() {
  const { t } = useI18n();
  const { spaceId } = useParams();
  const currentSpace = spaces.find(s => s.id === spaceId);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(initialAccessRequests);
  const [tempAccessGrants, setTempAccessGrants] = useState<Record<string, Record<string, Date>>>({});
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAccessPanel, setShowAccessPanel] = useState(false);
  const [previewRole, setPreviewRole] = useState('');

  const userRole = previewRole || (memberRoles[currentUser.id] || 'guest');

  // Access control — level-based via Space Permissions matrix
  const getFileAccessLevel = useCallback((file: FileItem) => {
    return (file.accessLevel ?? 'public') as 'public' | 'restricted' | 'confidential';
  }, []);

  const hasFileAccess = useCallback((file: FileItem) => {
    const level = getFileAccessLevel(file);
    if (level === 'public') return true;
    if (canRoleAccess(userRole, level)) return true;
    const grants = tempAccessGrants[file.id];
    if (grants && grants[currentUser.id]) {
      return grants[currentUser.id].getTime() > Date.now();
    }
    return false;
  }, [getFileAccessLevel, userRole, tempAccessGrants]);

  const hasPendingFileRequest = useCallback((fileId: string) => {
    return accessRequests.some(r => r.resourceId === fileId && r.requesterId === currentUser.id && r.status === 'pending');
  }, [accessRequests]);

  const durationMs = (d: AccessDuration) => ({ '24h': 86400000, '3d': 259200000, '7d': 604800000, '30d': 2592000000 }[d]);

  const handleFileRequestAccess = useCallback((fileId: string, reason: string, duration: AccessDuration) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    const newReq: AccessRequest = {
      id: `ar-file-${Date.now()}`,
      resourceType: 'file',
      resourceId: fileId,
      resourceName: file.name,
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

  const handleFileApproveRequest = useCallback((requestId: string) => {
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

  const handleFileDenyRequest = useCallback((requestId: string) => {
    setAccessRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, status: 'denied' as const, respondedAt: new Date(), respondedBy: currentUser.id } : r
    ));
  }, []);

  if (!currentSpace) return null;

  // Get current folder and breadcrumb trail
  const currentFolder = currentFolderId ? folders.find(f => f.id === currentFolderId) : undefined;

  const buildBreadcrumbs = (folderId?: string): Folder[] => {
    const trail: Folder[] = [];
    let id = folderId;
    while (id) {
      const folder = folders.find(f => f.id === id);
      if (folder) {
        trail.unshift(folder);
        id = folder.parentId;
      } else break;
    }
    return trail;
  };

  const breadcrumbs = buildBreadcrumbs(currentFolderId);

  // Get folders and files in current location
  const childFolders = useMemo(() =>
    folders.filter(f => f.parentId === currentFolderId)
      .sort((a, b) => a.name.localeCompare(b.name)),
    [currentFolderId]
  );

  const childFiles = useMemo(() => {
    let items = files.filter(f => f.folderId === currentFolderId);
    if (searchQuery) {
      items = files.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Sort
    return items.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'date': return b.uploadedAt.getTime() - a.uploadedAt.getTime();
        case 'size': return 0; // simplified
        default: return 0;
      }
    });
  }, [currentFolderId, searchQuery, sortBy]);

  const totalItems = childFolders.length + childFiles.length;

  // Navigate to folder
  const navigateToFolder = (folderId?: string) => {
    setCurrentFolderId(folderId);
    setSelectedFileId(null);
  };

  const navigateUp = () => {
    if (currentFolder) {
      navigateToFolder(currentFolder.parentId);
    }
  };

  const selectedFile = selectedFileId ? files.find(f => f.id === selectedFileId) : null;

  // Recent files: top 5 most recently uploaded across all folders
  const recentFiles = useMemo(() =>
    [...files].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()).slice(0, 6),
    []
  );

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#191919] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-[#191919] border-b border-[#e8e8e8] dark:border-[#2e2e2e]">
        <div className="h-[52px] px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen size={18} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
            <h2 className="text-[16px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{t('files.title')}</h2>
            <span className="text-[13px] text-[#999] dark:text-[#666]">· {currentSpace.name}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <ViewAsRolePicker activeRole={previewRole} onChangeRole={setPreviewRole} />
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-lg transition-colors ${
                searchOpen
                  ? 'bg-[#f0f0f0] dark:bg-[#333] text-[#242424] dark:text-[#f0f0f0]'
                  : 'text-[#616161] dark:text-[#999] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]'
              }`}
            >
              <Search size={16} />
            </button>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setSortMenuOpen(!sortMenuOpen)}
                className="p-2 rounded-lg text-[#616161] dark:text-[#999] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
              >
                <SortAsc size={16} />
              </button>
              <AnimatePresence>
                {sortMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1 bg-white dark:bg-[#2b2b2b] rounded-lg border border-[#e8e8e8] dark:border-[#3d3d3d] shadow-xl z-20 py-1 min-w-[160px]"
                  >
                    {([
                      ['name', t('files.sort.name')],
                      ['date', t('files.sort.date')],
                      ['size', t('files.sort.size')],
                    ] as [SortKey, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => { setSortBy(key); setSortMenuOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors flex items-center justify-between ${
                          sortBy === key ? 'text-[#5b5fc7] dark:text-[#a6a9dc] font-medium' : 'text-[#424242] dark:text-[#d1d1d1]'
                        }`}
                      >
                        {label}
                        {sortBy === key && <Check size={14} />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg p-0.5 border border-[#e8e8e8] dark:border-[#333]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#444] shadow-sm text-[#242424] dark:text-[#f0f0f0]'
                    : 'text-[#999] dark:text-[#666] hover:text-[#242424] dark:hover:text-[#f0f0f0]'
                }`}
              >
                <Grid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-[#444] shadow-sm text-[#242424] dark:text-[#f0f0f0]'
                    : 'text-[#999] dark:text-[#666] hover:text-[#242424] dark:hover:text-[#f0f0f0]'
                }`}
              >
                <List size={14} />
              </button>
            </div>

            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#616161] dark:text-[#999] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] border border-[#e8e8e8] dark:border-[#333] transition-colors">
              <FolderPlus size={14} />
              {t('files.newFolder')}
            </button>

            <button className="flex items-center gap-1.5 bg-[#5b5fc7] hover:bg-[#5254b5] text-white px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors shadow-sm">
              <Upload size={14} />
              {t('files.upload')}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-5 pb-3 overflow-hidden"
            >
              <div className="relative max-w-[400px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa] dark:text-[#666]" />
                <input
                  type="text"
                  placeholder={t('files.searchAll')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 text-[13px] bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#242424] dark:text-[#f0f0f0] placeholder-[#aaa] dark:placeholder-[#555] rounded-lg border border-[#e8e8e8] dark:border-[#333] outline-none focus:border-[#5b5fc7]/40 transition-colors"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Breadcrumbs */}
        <div className="px-5 pb-3 flex items-center gap-1 text-[13px]">
          <button
            onClick={() => navigateToFolder(undefined)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
              !currentFolderId
                ? 'text-[#242424] dark:text-[#f0f0f0] font-medium'
                : 'text-[#999] dark:text-[#666] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] hover:text-[#616161] dark:hover:text-[#999]'
            }`}
          >
            <FolderOpen size={14} />
            {t('files.allFiles')}
          </button>
          {breadcrumbs.map((folder) => (
            <div key={folder.id} className="flex items-center gap-1">
              <ChevronRight size={12} className="text-[#ccc] dark:text-[#555]" />
              <button
                onClick={() => navigateToFolder(folder.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                  folder.id === currentFolderId
                    ? 'text-[#242424] dark:text-[#f0f0f0] font-medium'
                    : 'text-[#999] dark:text-[#666] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] hover:text-[#616161] dark:hover:text-[#999]'
                }`}
              >
                {folder.emoji && <span className="text-[13px]">{folder.emoji}</span>}
                {folder.name}
              </button>
            </div>
          ))}
          {!searchQuery && (
            <span className="text-[12px] text-[#ccc] dark:text-[#555] ml-2">
              {t('files.itemsCount', { count: totalItems })}
            </span>
          )}
          {searchQuery && (
            <span className="text-[12px] text-[#ccc] dark:text-[#555] ml-2">
              {t('files.showingResults', { query: searchQuery })}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-on-hover">
        {/* Preview mode banner */}
        {previewRole && (
          <div className="flex items-center justify-between px-5 py-2 bg-[#d4820c]/10 dark:bg-[#d4820c]/15 border-b border-[#d4820c]/20">
            <div className="flex items-center gap-2 text-[12px] text-[#d4820c] dark:text-[#f5a623]">
              <Eye size={14} />
              <span className="font-semibold">{t('access.preview.mode')}</span>
              <span className="text-[#d4820c]/70 dark:text-[#f5a623]/70">{t('access.preview.filesBanner', { role: PREVIEW_ROLES.find(r => r.slug === previewRole)?.label || 'Admin' })}</span>
            </div>
            <button
              onClick={() => setPreviewRole('')}
              className="text-[11px] font-semibold text-[#d4820c] dark:text-[#f5a623] hover:underline"
            >
              Exit Preview
            </button>
          </div>
        )}
        <div className="p-5">
          {/* Back button in subfolder */}
          {currentFolder && !searchQuery && (
            <button
              onClick={navigateUp}
              className="flex items-center gap-2 px-3 py-2 mb-4 rounded-lg text-[13px] text-[#616161] dark:text-[#999] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
            >
              <ArrowLeft size={14} />
              {t('files.backTo', { name: currentFolder.parentId ? folders.find(f => f.id === currentFolder.parentId)?.name || t('files.allFiles') : t('files.allFiles') })}
            </button>
          )}

          {viewMode === 'grid' ? (
            <div>
              {/* Recent section — only at root level */}
              {!currentFolderId && !searchQuery && recentFiles.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Clock size={13} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
                    <p className="text-[11px] font-semibold text-[#999] dark:text-[#666] uppercase tracking-wider">
                      Recent
                    </p>
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto scrollbar-on-hover pb-1">
                    {recentFiles.map((file, idx) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: 0.03 * idx }}
                        onClick={() => setSelectedFileId(selectedFileId === file.id ? null : file.id)}
                        className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer shrink-0 min-w-[220px] max-w-[260px] ${
                          selectedFileId === file.id
                            ? 'border-[#5b5fc7] dark:border-[#5b5fc7] bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10 shadow-md'
                            : 'bg-[#faf9f8] dark:bg-[#222] border-[#e8e8e8] dark:border-[#333] hover:border-[#d0d0d0] dark:hover:border-[#444] hover:shadow-sm'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#1a1a1a] border border-[#e8e8e8] dark:border-[#333] flex items-center justify-center shrink-0">
                          <FileIcon type={file.type} size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-[#242424] dark:text-[#f0f0f0] truncate">{file.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {file.securityLevel && (
                              <SecurityBadge level={file.securityLevel} variant="dot" />
                            )}
                            <span className="text-[11px] text-[#999] dark:text-[#666]">{file.size}</span>
                            <span className="text-[11px] text-[#ccc] dark:text-[#444]">·</span>
                            <span className="text-[11px] text-[#999] dark:text-[#666]">{formatDistanceToNow(file.uploadedAt, { addSuffix: true })}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Folders section */}
              {!searchQuery && childFolders.length > 0 && (
                <div className="mb-6">
                  <p className="text-[11px] font-semibold text-[#999] dark:text-[#666] uppercase tracking-wider mb-3 px-1">
                    Folders
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {childFolders.map(folder => (
                      <motion.div
                        key={folder.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => navigateToFolder(folder.id)}
                        className="group bg-[#faf9f8] dark:bg-[#222] rounded-xl border border-[#e8e8e8] dark:border-[#333] p-4 hover:border-[#5b5fc7]/30 dark:hover:border-[#5b5fc7]/30 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            folder.color ? `bg-${folder.color === 'purple' ? '[#5b5fc7]' : folder.color === 'blue' ? '[#0078d4]' : folder.color === 'green' ? '[#237b4b]' : folder.color === 'orange' ? '[#d4820c]' : '[#c4314b]'}/10` : 'bg-[#f0f0f0] dark:bg-[#333]'
                          }`}>
                            {folder.emoji ? (
                              <span className="text-[20px]">{folder.emoji}</span>
                            ) : (
                              <FolderIcon size={20} className={FOLDER_COLORS[folder.color || 'blue']} />
                            )}
                          </div>
                          <ArrowUpRight size={14} className="text-transparent group-hover:text-[#999] dark:group-hover:text-[#666] transition-colors ml-auto" />
                        </div>
                        <h3 className="text-[13px] font-medium text-[#242424] dark:text-[#f0f0f0] truncate mb-1">{folder.name}</h3>
                        <p className="text-[11px] text-[#999] dark:text-[#666]">
                          {files.filter(f => f.folderId === folder.id).length + folders.filter(f => f.parentId === folder.id).length} items
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files section */}
              {childFiles.length > 0 && (
                <div>
                  {!searchQuery && childFolders.length > 0 && (
                    <p className="text-[11px] font-semibold text-[#999] dark:text-[#666] uppercase tracking-wider mb-3 px-1">
                      Files
                    </p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {childFiles.map(file => (
                      <motion.div
                        key={file.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setSelectedFileId(selectedFileId === file.id ? null : file.id)}
                        className={`group rounded-xl border p-4 transition-all cursor-pointer relative ${
                          selectedFileId === file.id
                            ? 'border-[#5b5fc7] dark:border-[#5b5fc7] bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10 shadow-md'
                            : 'bg-white dark:bg-[#222] border-[#e8e8e8] dark:border-[#333] hover:border-[#ddd] dark:hover:border-[#444] hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-center h-[72px] bg-[#faf9f8] dark:bg-[#1a1a1a] rounded-lg mb-3">
                          <FileIcon type={file.type} size={32} />
                        </div>
                        <h3 className="text-[13px] font-medium text-[#242424] dark:text-[#f0f0f0] truncate mb-1" title={file.name}>
                          {file.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-[#999] dark:text-[#666]">{file.size}</span>
                            {getFileAccessLevel(file) !== 'public' && (
                              <AccessBadge level={getFileAccessLevel(file)} variant="compact" />
                            )}
                          </div>
                          {file.securityLevel ? (
                            <SecurityBadge level={file.securityLevel} variant="compact" />
                          ) : (
                            <span className="text-[11px] text-[#999] dark:text-[#666]">
                              {formatDistanceToNow(file.uploadedAt, { addSuffix: false })}
                            </span>
                          )}
                        </div>
                        {!hasFileAccess(file) && (
                          <div className="absolute inset-0 bg-white/60 dark:bg-[#191919]/70 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
                            <div className="flex flex-col items-center gap-1">
                              <Lock size={18} className="text-[#d4820c] dark:text-[#f5a623]" />
                              <span className="text-[10px] font-semibold text-[#d4820c] dark:text-[#f5a623]">Restricted</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {totalItems === 0 && !searchQuery && (
                <EmptyState onUpload={() => {}} />
              )}
              {searchQuery && childFiles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search size={40} className="text-[#ddd] dark:text-[#444] mb-4" />
                  <h3 className="text-[16px] font-medium text-[#242424] dark:text-[#f0f0f0] mb-1">{t('files.noFilesFound')}</h3>
                  <p className="text-[14px] text-[#999] dark:text-[#666]">{t('files.tryDifferentSearch')}</p>
                </div>
              )}
            </div>
          ) : (
            /* List view */
            <div>
              {/* Recent section — list view, only at root level */}
              {!currentFolderId && !searchQuery && recentFiles.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <Clock size={13} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
                    <p className="text-[11px] font-semibold text-[#999] dark:text-[#666] uppercase tracking-wider">
                      Recent
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#222] rounded-xl border border-[#e8e8e8] dark:border-[#333] overflow-hidden">
                    {recentFiles.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => setSelectedFileId(selectedFileId === file.id ? null : file.id)}
                        className={`grid grid-cols-[1fr_100px_140px_120px_40px] px-4 py-2.5 items-center border-b border-[#f0f0f0] dark:border-[#2e2e2e] last:border-b-0 cursor-pointer transition-colors group ${
                          selectedFileId === file.id
                            ? 'bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10'
                            : 'hover:bg-[#faf9f8] dark:hover:bg-[#252525]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileIcon type={file.type} size={18} />
                          <span className="text-[13px] font-medium text-[#242424] dark:text-[#f0f0f0] truncate">{file.name}</span>
                          {file.securityLevel && (
                            <SecurityBadge level={file.securityLevel} variant="icon" />
                          )}
                        </div>
                        <span className="text-[12px] text-[#999] dark:text-[#666]">{file.size}</span>
                        <div className="flex items-center gap-2 min-w-0">
                          {file.uploadedByAvatar && (
                            <img src={file.uploadedByAvatar} alt="" className="w-5 h-5 rounded-full flex-shrink-0" />
                          )}
                          <span className="text-[12px] text-[#616161] dark:text-[#b9bbbe] truncate">{file.uploadedBy}</span>
                        </div>
                        <span className="text-[12px] text-[#999] dark:text-[#666]">{formatDistanceToNow(file.uploadedAt, { addSuffix: true })}</span>
                        <div className="flex items-center">
                          <button className="p-1 rounded text-transparent group-hover:text-[#999] dark:group-hover:text-[#666] hover:!text-[#242424] dark:hover:!text-[#f0f0f0] transition-colors">
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-[#222] rounded-xl border border-[#e8e8e8] dark:border-[#333] overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_100px_140px_120px_40px] px-4 py-2.5 bg-[#faf9f8] dark:bg-[#252525] border-b border-[#e8e8e8] dark:border-[#333] text-[11px] font-semibold text-[#999] dark:text-[#666] uppercase tracking-wider">
                  <span>Name</span>
                  <span>Size</span>
                  <span>Uploaded by</span>
                  <span>Date</span>
                  <span />
                </div>

                {/* Folder rows */}
                {!searchQuery && childFolders.map(folder => (
                  <div
                    key={folder.id}
                    onClick={() => navigateToFolder(folder.id)}
                    className="grid grid-cols-[1fr_100px_140px_120px_40px] px-4 py-3 items-center border-b border-[#f0f0f0] dark:border-[#2e2e2e] last:border-b-0 hover:bg-[#faf9f8] dark:hover:bg-[#252525] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {folder.emoji ? (
                        <span className="text-[18px] flex-shrink-0">{folder.emoji}</span>
                      ) : (
                        <FolderIcon size={18} className={`${FOLDER_COLORS[folder.color || 'blue']} flex-shrink-0`} />
                      )}
                      <span className="text-[13px] font-medium text-[#242424] dark:text-[#f0f0f0] truncate">{folder.name}</span>
                      <span className="text-[11px] text-[#999] dark:text-[#666] flex-shrink-0 ml-1">
                        {files.filter(f => f.folderId === folder.id).length + folders.filter(f => f.parentId === folder.id).length} items
                      </span>
                    </div>
                    <span className="text-[12px] text-[#999] dark:text-[#666]">—</span>
                    <span className="text-[12px] text-[#616161] dark:text-[#b9bbbe] truncate">{folder.createdBy}</span>
                    <span className="text-[12px] text-[#999] dark:text-[#666]">{format(folder.createdAt, 'MMM d, yyyy')}</span>
                    <div>
                      <ArrowUpRight size={14} className="text-transparent group-hover:text-[#999] dark:group-hover:text-[#666] transition-colors" />
                    </div>
                  </div>
                ))}

                {/* File rows */}
                {childFiles.map(file => (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFileId(selectedFileId === file.id ? null : file.id)}
                    className={`grid grid-cols-[1fr_100px_140px_120px_40px] px-4 py-3 items-center border-b border-[#f0f0f0] dark:border-[#2e2e2e] last:border-b-0 cursor-pointer transition-colors group ${
                      selectedFileId === file.id
                        ? 'bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10'
                        : 'hover:bg-[#faf9f8] dark:hover:bg-[#252525]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileIcon type={file.type} size={18} />
                      <span className={`text-[13px] font-medium truncate ${!hasFileAccess(file) ? 'text-[#999] dark:text-[#666]' : 'text-[#242424] dark:text-[#f0f0f0]'}`}>{file.name}</span>
                      {getFileAccessLevel(file) !== 'public' && (
                        <AccessBadge level={getFileAccessLevel(file)} variant="compact" />
                      )}
                      {file.securityLevel && (
                        <SecurityBadge level={file.securityLevel} variant="icon" />
                      )}
                      {!hasFileAccess(file) && (
                        <Lock size={12} className="text-[#d4820c] shrink-0" />
                      )}
                    </div>
                    <span className="text-[12px] text-[#999] dark:text-[#666]">{file.size}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      {file.uploadedByAvatar && (
                        <img src={file.uploadedByAvatar} alt="" className="w-5 h-5 rounded-full flex-shrink-0" />
                      )}
                      <span className="text-[12px] text-[#616161] dark:text-[#b9bbbe] truncate">{file.uploadedBy}</span>
                    </div>
                    <span className="text-[12px] text-[#999] dark:text-[#666]">{format(file.uploadedAt, 'MMM d, yyyy')}</span>
                    <div className="flex items-center">
                      <button className="p-1 rounded text-transparent group-hover:text-[#999] dark:group-hover:text-[#666] hover:!text-[#242424] dark:hover:!text-[#f0f0f0] transition-colors">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {totalItems === 0 && !searchQuery && (
                  <div className="py-16">
                    <EmptyState onUpload={() => {}} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File detail panel (slide in) */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed right-0 top-0 bottom-0 w-[320px] bg-white dark:bg-[#222] border-l border-[#e8e8e8] dark:border-[#333] shadow-2xl z-30 flex flex-col"
          >
            {/* Panel header */}
            <div className="h-[52px] px-4 flex items-center justify-between border-b border-[#e8e8e8] dark:border-[#333] flex-shrink-0">
              <h3 className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{t('files.details')}</h3>
              <button
                onClick={() => setSelectedFileId(null)}
                className="p-1.5 rounded-md text-[#999] hover:text-[#242424] dark:text-[#666] dark:hover:text-[#f0f0f0] hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors"
              >
                <span className="text-[16px]">×</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-on-hover p-5">
              {/* Preview */}
              <div className="flex items-center justify-center h-[120px] bg-[#faf9f8] dark:bg-[#1a1a1a] rounded-xl mb-5 border border-[#e8e8e8] dark:border-[#333]">
                <FileIcon type={selectedFile.type} size={48} />
              </div>

              {/* File name */}
              <h4 className="text-[15px] font-semibold text-[#242424] dark:text-[#f0f0f0] mb-4 break-all">
                {selectedFile.name}
              </h4>

              {/* Access & Security badges */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {getFileAccessLevel(selectedFile) !== 'public' && (
                  <AccessBadge level={getFileAccessLevel(selectedFile)} variant="full" />
                )}
                {selectedFile.securityLevel && (
                  <SecurityBadge level={selectedFile.securityLevel} variant="full" />
                )}
              </div>

              {/* Locked state for restricted files */}
              {!hasFileAccess(selectedFile) ? (
                <div className="text-center py-6">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                    getFileAccessLevel(selectedFile) === 'confidential' ? 'bg-[#c4314b]/10' : 'bg-[#d4820c]/10'
                  }`}>
                    <Lock size={20} className={getFileAccessLevel(selectedFile) === 'confidential' ? 'text-[#c4314b]' : 'text-[#d4820c]'} />
                  </div>
                  <p className="text-[13px] font-semibold text-[#242424] dark:text-[#e0e0e0] mb-1">{t('access.file.requiredTitle')}</p>
                  <p className="text-[11px] text-[#8a8a8a] mb-4">{t('access.file.requiredDesc')}</p>
                  {hasPendingFileRequest(selectedFile.id) ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4820c]/10 text-[11px] font-medium text-[#d4820c]">
                      <Clock size={12} /> {t('access.locked.pending')}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5b5fc7] hover:bg-[#4a4eb5] text-white text-[11px] font-semibold transition-colors"
                    >
                      <Send size={12} /> {t('access.locked.requestTemp')}
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Meta info */}
                  <div className="space-y-3">
                    <MetaRow label={t('files.meta.size')} value={selectedFile.size} />
                    <MetaRow label={t('files.meta.type')} value={selectedFile.type.toUpperCase()} />
                    <MetaRow label={t('files.meta.uploaded')} value={format(selectedFile.uploadedAt, 'MMM d, yyyy \'at\' h:mm a')} />
                    <MetaRow
                      label={t('files.meta.uploadedBy')}
                      value={
                        <div className="flex items-center gap-2">
                          {selectedFile.uploadedByAvatar && (
                            <img src={selectedFile.uploadedByAvatar} alt="" className="w-5 h-5 rounded-full" />
                          )}
                          <span>{selectedFile.uploadedBy}</span>
                        </div>
                      }
                    />
                    {selectedFile.folderId && (
                      <MetaRow
                        label={t('files.meta.location')}
                        value={
                          <button
                            onClick={() => { navigateToFolder(selectedFile.folderId); setSelectedFileId(null); }}
                            className="flex items-center gap-1.5 text-[#5b5fc7] dark:text-[#a6a9dc] hover:underline"
                          >
                            <FolderIcon size={12} />
                            {folders.find(f => f.id === selectedFile.folderId)?.name || t('files.unknown')}
                          </button>
                        }
                      />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 space-y-1.5">
                    {getFileAccessLevel(selectedFile) !== 'public' && (
                      <FileAction icon={<Shield size={14} />} label={t('access.panel.title')} onClick={() => setShowAccessPanel(true)} />
                    )}
                    <FileAction icon={<Download size={14} />} label={t('files.action.download')} />
                    <FileAction icon={<Copy size={14} />} label={t('files.action.copyLink')} />
                    <FileAction icon={<Eye size={14} />} label={t('files.action.preview')} />
                    <FileAction icon={<Trash2 size={14} />} label={t('files.action.delete')} danger />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Access Modal */}
      <AnimatePresence>
        {showRequestModal && selectedFile && (
          <RequestAccessModal
            resourceName={selectedFile.name}
            resourceType="file"
            userRole={userRole}
            onSubmit={(reason, duration) => handleFileRequestAccess(selectedFile.id, reason, duration)}
            onClose={() => setShowRequestModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Access Requests Panel */}
      <AnimatePresence>
        {showAccessPanel && selectedFile && (
          <AccessRequestsPanel
            resourceType="file"
            resourceId={selectedFile.id}
            resourceName={selectedFile.name}
            accessRequests={accessRequests}
            onApproveRequest={handleFileApproveRequest}
            onDenyRequest={handleFileDenyRequest}
            isOpen={showAccessPanel}
            onClose={() => setShowAccessPanel(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[12px] text-[#999] dark:text-[#666] flex-shrink-0">{label}</span>
      <span className="text-[12px] text-[#242424] dark:text-[#f0f0f0] text-right">{value}</span>
    </div>
  );
}

function FileAction({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
      danger
        ? 'text-[#c4314b] dark:text-[#f47067] hover:bg-[#c4314b]/5 dark:hover:bg-[#c4314b]/10'
        : 'text-[#616161] dark:text-[#999] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] hover:text-[#242424] dark:hover:text-[#f0f0f0]'
    }`}>
      {icon}
      {label}
    </button>
  );
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#f7f6f3] dark:bg-[#2a2a2a] flex items-center justify-center mb-4">
        <Upload size={28} className="text-[#ccc] dark:text-[#555]" />
      </div>
      <h3 className="text-[16px] font-medium text-[#242424] dark:text-[#f0f0f0] mb-1">{t('files.emptyTitle')}</h3>
      <p className="text-[14px] text-[#999] dark:text-[#666] mb-4">{t('files.emptySubtitle')}</p>
      <button
        onClick={onUpload}
        className="flex items-center gap-2 bg-[#5b5fc7] hover:bg-[#5254b5] text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
      >
        <Upload size={14} />
        {t('files.uploadFiles')}
      </button>
    </div>
  );
}
