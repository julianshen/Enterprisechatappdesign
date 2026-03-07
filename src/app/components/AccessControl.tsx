import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock, Shield, ShieldAlert, ShieldCheck, Eye, Users,
  Check, X, Clock, Send, Globe, KeyRound, Timer,
} from 'lucide-react';
import {
  users, currentUser, memberRoles, roleDisplayConfig,
  type AccessRequest, type AccessDuration,
} from '../data/mockData';
import { canRoleAccess, type AccessLevel } from '../data/accessPermissions';
import { formatDistanceToNow } from 'date-fns';
import { useI18n } from '../context/I18nContext';

// ─── Duration Labels ──────────────────────────────────────────────────────────

const DURATION_OPTIONS: { id: AccessDuration; label: string; description: string }[] = [
  { id: '24h', label: '24 hours', description: 'Quick review' },
  { id: '3d', label: '3 days', description: 'Short task' },
  { id: '7d', label: '7 days', description: 'Sprint-length' },
  { id: '30d', label: '30 days', description: 'Extended project' },
];

// ─── Access Level Configs ─────────────────────────────────────────────────────

const ACCESS_LEVEL_DISPLAY: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  public:       { label: 'Public',       icon: Globe,       color: 'text-[#237b4b] dark:text-[#6fcf97]', bgColor: 'bg-[#237b4b]/10 dark:bg-[#237b4b]/20' },
  restricted:   { label: 'Restricted',   icon: KeyRound,    color: 'text-[#d4820c] dark:text-[#f5a623]', bgColor: 'bg-[#d4820c]/10 dark:bg-[#d4820c]/20' },
  confidential: { label: 'Confidential', icon: ShieldAlert, color: 'text-[#c4314b] dark:text-[#f47067]', bgColor: 'bg-[#c4314b]/10 dark:bg-[#c4314b]/20' },
};

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ roleSlug, size = 'sm' }: { roleSlug: string; size?: 'sm' | 'md' }) {
  const cfg = roleDisplayConfig[roleSlug];
  if (!cfg) return <span className="text-[10px] text-[#8a8a8a]">{roleSlug}</span>;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${cfg.color} ${cfg.bgColor} ${cfg.darkColor} ${cfg.darkBgColor} ${
      size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5'
    }`}>
      {cfg.label}
    </span>
  );
}

// ─── Access Badge (inline usage) ──────────────────────────────────────────────

export function AccessBadge({ level, variant = 'compact' }: { level: string; variant?: 'compact' | 'full' | 'dot' }) {
  const cfg = ACCESS_LEVEL_DISPLAY[level];
  if (!cfg || level === 'public') return null;
  const Icon = cfg.icon;

  if (variant === 'dot') {
    return (
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${level === 'restricted' ? 'bg-[#d4820c]' : 'bg-[#c4314b]'}`}
        title={`${cfg.label} access`} />
    );
  }
  if (variant === 'full') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.color} ${cfg.bgColor}`}>
        <Icon size={12} /> {cfg.label}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${cfg.color} ${cfg.bgColor}`} title={`${cfg.label} access`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

// ─── Locked Overlay ───────────────────────────────────────────────────────────

export function LockedOverlay({
  resourceName,
  accessLevel,
  userRole,
  hasExistingRequest,
  onRequestAccess,
}: {
  resourceName: string;
  accessLevel: string;
  userRole: string;
  hasExistingRequest: boolean;
  onRequestAccess: () => void;
}) {
  const isConfidential = accessLevel === 'confidential';
  const cfg = ACCESS_LEVEL_DISPLAY[accessLevel];
  const roleCfg = roleDisplayConfig[userRole];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-[420px]">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center ${
            isConfidential ? 'bg-[#c4314b]/10 dark:bg-[#c4314b]/20' : 'bg-[#d4820c]/10 dark:bg-[#d4820c]/20'
          }`}
        >
          {isConfidential
            ? <ShieldAlert size={28} className="text-[#c4314b] dark:text-[#f47067]" />
            : <Lock size={28} className="text-[#d4820c] dark:text-[#f5a623]" />}
        </motion.div>

        <h3 className="text-[17px] font-bold text-[#242424] dark:text-[#f0f0f0] mb-2">
          {isConfidential ? 'Confidential Content' : 'Restricted Access'}
        </h3>
        <p className="text-[13px] text-[#616161] dark:text-[#8a8a8a] mb-3">
          You don't have permission to view <span className="font-semibold text-[#242424] dark:text-[#e0e0e0]">"{resourceName}"</span>
        </p>

        {/* Role explanation */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-[12px] text-[#8a8a8a]">Your role:</span>
          <RoleBadge roleSlug={userRole} size="md" />
        </div>
        <p className="text-[12px] text-[#999] dark:text-[#666] mb-2">
          This content requires the <span className={`font-semibold ${cfg?.color || ''}`}>"{cfg?.label}"</span> access permission which is not granted to your role.
        </p>
        <p className="text-[11px] text-[#aaa] dark:text-[#555] mb-5">
          Contact a space admin to update role permissions, or request temporary access below.
        </p>

        {hasExistingRequest ? (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d4820c]/8 dark:bg-[#d4820c]/15 border border-[#d4820c]/20">
            <Clock size={14} className="text-[#d4820c] dark:text-[#f5a623]" />
            <span className="text-[13px] font-medium text-[#d4820c] dark:text-[#f5a623]">Access request pending review</span>
          </div>
        ) : (
          <button
            onClick={onRequestAccess}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5b5fc7] hover:bg-[#4a4eb5] text-white text-[13px] font-semibold transition-colors shadow-sm"
          >
            <Timer size={14} />
            Request Temporary Access
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Request Access Modal (with duration picker) ──────────────────────────────

export function RequestAccessModal({
  resourceName,
  resourceType,
  userRole,
  onSubmit,
  onClose,
}: {
  resourceName: string;
  resourceType: 'document' | 'file';
  userRole: string;
  onSubmit: (reason: string, duration: AccessDuration) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState<AccessDuration>('7d');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[480px] bg-white dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8]">
          <div className="flex items-center gap-2 text-white">
            <Timer size={18} />
            <span className="text-[14px] font-bold">Request Temporary Access</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Resource info */}
          <div className="flex items-start gap-3 p-3 bg-[#f5f5f5] dark:bg-[#252525] rounded-lg">
            <Lock size={16} className="text-[#d4820c] dark:text-[#f5a623] mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-[#242424] dark:text-[#e0e0e0]">{resourceName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-[#8a8a8a]">Your role:</span>
                <RoleBadge roleSlug={userRole} />
              </div>
            </div>
          </div>

          {/* Duration selector */}
          <div>
            <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-2">
              Access Duration
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DURATION_OPTIONS.map(opt => (
                <button key={opt.id}
                  onClick={() => setDuration(opt.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 transition-all text-left ${
                    duration === opt.id
                      ? 'border-[#5b5fc7] bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10'
                      : 'border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/30'
                  }`}
                >
                  <Timer size={14} className={duration === opt.id ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#8a8a8a]'} />
                  <div>
                    <span className={`text-[12px] font-semibold block ${duration === opt.id ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#242424] dark:text-[#e0e0e0]'}`}>
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-[#8a8a8a]">{opt.description}</span>
                  </div>
                  {duration === opt.id && <Check size={14} className="text-[#5b5fc7] dark:text-[#a6a9dc] ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-[11px] font-semibold text-[#616161] dark:text-[#8a8a8a] uppercase tracking-wider mb-1.5">
              Reason for access
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('access.reasonPlaceholder')}
              rows={3}
              className="w-full bg-[#f0f0f0] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg px-3 py-2.5 text-[13px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40 resize-none"
              autoFocus
            />
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-2.5 bg-[#d4820c]/5 dark:bg-[#d4820c]/10 rounded-lg text-[11px] text-[#d4820c] dark:text-[#f5a623]">
            <Clock size={13} className="mt-0.5 shrink-0" />
            <span>Access will automatically expire after <strong>{DURATION_OPTIONS.find(d => d.id === duration)?.label}</strong>. You can request an extension if needed.</span>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="px-4 py-2 text-[12px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#3d3d3d] rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { onSubmit(reason, duration); onClose(); }}
              disabled={!reason.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#5b5fc7] hover:bg-[#4a4eb5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Send size={13} /> Send Request
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Access Requests Panel (for admins/owners to review requests) ─────────────

export function AccessRequestsPanel({
  resourceType,
  resourceId,
  resourceName,
  accessRequests,
  onApproveRequest,
  onDenyRequest,
  isOpen,
  onClose,
}: {
  resourceType: 'document' | 'file';
  resourceId: string;
  resourceName: string;
  accessRequests: AccessRequest[];
  onApproveRequest: (requestId: string) => void;
  onDenyRequest: (requestId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const allRequests = useMemo(() =>
    accessRequests.filter(r => r.resourceId === resourceId).sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime()),
    [accessRequests, resourceId]
  );

  const pendingCount = allRequests.filter(r => r.status === 'pending').length;

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[520px] max-h-[75vh] bg-white dark:bg-[#2b2d31] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8] shrink-0">
          <div className="flex items-center gap-2 text-white">
            <Timer size={18} />
            <span className="text-[14px] font-bold">Access Requests</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/20 rounded-full">{pendingCount}</span>
            )}
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        {/* Resource info */}
        <div className="px-5 py-3 border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#252525] shrink-0">
          <p className="text-[13px] font-semibold text-[#242424] dark:text-[#f2f3f5]">{resourceName}</p>
          <p className="text-[11px] text-[#8a8a8a]">{resourceType === 'document' ? 'Document' : 'File'} · Temporary access requests</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {allRequests.length === 0 ? (
            <div className="text-center py-10">
              <Timer size={32} className="mx-auto text-[#d1d1d1] dark:text-[#4a4a4a] mb-2" />
              <p className="text-[13px] font-medium text-[#242424] dark:text-[#e0e0e0] mb-1">No access requests</p>
              <p className="text-[12px] text-[#8a8a8a]">Users whose role doesn't grant access can request temporary access here.</p>
            </div>
          ) : (
            allRequests.map(req => (
              <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border p-4 ${
                  req.status === 'pending'
                    ? 'border-[#d4820c]/30 dark:border-[#d4820c]/40 bg-[#d4820c]/3 dark:bg-[#d4820c]/5'
                    : 'border-[#e1dfdd] dark:border-[#3d3d3d]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img src={req.requesterAvatar} alt={req.requesterName} className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-semibold text-[#242424] dark:text-[#e0e0e0]">{req.requesterName}</span>
                      <RoleBadge roleSlug={req.requesterRole} />
                      {req.status === 'pending' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#d4820c]/15 text-[#d4820c] dark:text-[#f5a623]">PENDING</span>
                      )}
                      {req.status === 'approved' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#237b4b]/15 text-[#237b4b] dark:text-[#6fcf97]">APPROVED</span>
                      )}
                      {req.status === 'denied' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#c4314b]/15 text-[#c4314b] dark:text-[#f47067]">DENIED</span>
                      )}
                    </div>

                    <p className="text-[12px] text-[#616161] dark:text-[#8a8a8a] mt-1">{req.reason}</p>

                    {/* Duration & meta info */}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#5b5fc7] dark:text-[#a6a9dc] bg-[#5b5fc7]/8 px-1.5 py-0.5 rounded">
                        <Timer size={10} /> {DURATION_OPTIONS.find(d => d.id === req.requestedDuration)?.label ?? req.requestedDuration}
                      </span>
                      <span className="text-[10px] text-[#999] dark:text-[#666]">
                        {formatDistanceToNow(req.requestedAt, { addSuffix: true })}
                      </span>
                      {req.respondedBy && (
                        <span className="text-[10px] text-[#999] dark:text-[#666]">
                          · by {users.find(u => u.id === req.respondedBy)?.name || 'Unknown'}
                        </span>
                      )}
                      {req.expiresAt && req.status === 'approved' && (
                        <span className={`text-[10px] font-semibold ${
                          req.expiresAt.getTime() < Date.now()
                            ? 'text-[#c4314b] dark:text-[#f47067]'
                            : 'text-[#237b4b] dark:text-[#6fcf97]'
                        }`}>
                          {req.expiresAt.getTime() < Date.now() ? '· Expired' : `· Expires ${formatDistanceToNow(req.expiresAt, { addSuffix: true })}`}
                        </span>
                      )}
                    </div>

                    {/* Approve/Deny */}
                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2 mt-3">
                        <button onClick={() => onApproveRequest(req.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#237b4b] hover:bg-[#1a6b3e] text-white text-[11px] font-semibold rounded-lg transition-colors">
                          <Check size={12} /> Approve ({DURATION_OPTIONS.find(d => d.id === req.requestedDuration)?.label})
                        </button>
                        <button onClick={() => onDenyRequest(req.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f0f0] dark:bg-[#3d3d3d] hover:bg-[#e8e8e8] dark:hover:bg-[#444] text-[#616161] dark:text-[#b9bbbe] text-[11px] font-semibold rounded-lg transition-colors">
                          <X size={12} /> Deny
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#e1dfdd] dark:border-[#3d3d3d] shrink-0 bg-[#faf9f8] dark:bg-[#252525]">
          <p className="text-[11px] text-[#8a8a8a]">
            Role-level access is managed in Space Permissions → Permissions tab
          </p>
          <button onClick={onClose} className="px-4 py-2 text-[12px] font-medium text-[#616161] dark:text-[#b9bbbe] hover:bg-[#e8e8e8] dark:hover:bg-[#3d3d3d] rounded-lg transition-colors">
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
