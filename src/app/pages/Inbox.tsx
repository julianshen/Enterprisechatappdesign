import { useState, useSyncExternalStore } from 'react';
import {
  Bell, Shield, UserPlus, RefreshCw, Server, Check, CheckCheck,
  ClipboardCheck, X, Send, ChevronRight, Building2, Clock, Hash,
  BarChart3, Package, XCircle, Sparkles,
} from 'lucide-react';
import { notifications, type Notification } from '../data/mockData';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import {
  getSpaceRequests, subscribeSpaceRequests, seedDemoRequests,
  type SpaceRequest, type SpaceRequestStatus,
} from '../data/spaceRequests';
import { motion, AnimatePresence } from 'motion/react';

// ─── Seed demo data on first load ───
seedDemoRequests();

// ─── Notification type config ───

const typeConfig: Record<Notification['type'], { icon: typeof Bell; color: string; bg: string; label: string }> = {
  system: { icon: Server, color: 'text-[#616161] dark:text-[#b9bbbe]', bg: 'bg-[#f0f0f0] dark:bg-[#3d3d3d]', label: 'System' },
  admin: { icon: Bell, color: 'text-[#5b5fc7] dark:text-[#a6a9dc]', bg: 'bg-[#eeeef8] dark:bg-[#5b5fc7]/15', label: 'Admin' },
  security: { icon: Shield, color: 'text-[#c4314b] dark:text-[#f47067]', bg: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15', label: 'Security' },
  update: { icon: RefreshCw, color: 'text-[#237b4b] dark:text-[#57ab5a]', bg: 'bg-[#edf7f0] dark:bg-[#237b4b]/15', label: 'Update' },
  invite: { icon: UserPlus, color: 'text-[#8764b8] dark:text-[#c49ded]', bg: 'bg-[#f3eef9] dark:bg-[#8764b8]/15', label: 'Invitation' },
  approval: { icon: ClipboardCheck, color: 'text-[#d4820c] dark:text-[#f0b850]', bg: 'bg-[#fef7ec] dark:bg-[#d4820c]/15', label: 'Approval' },
};

// ─── Status badge config ───

const statusConfig: Record<SpaceRequestStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  'pending-owner': { label: 'Awaiting Owner', color: 'text-[#d4820c]', bg: 'bg-[#fef7ec] dark:bg-[#d4820c]/15', icon: Clock },
  'pending-admin': { label: 'Awaiting Admin', color: 'text-[#5b5fc7]', bg: 'bg-[#eeeef8] dark:bg-[#5b5fc7]/15', icon: Shield },
  approved: { label: 'Approved', color: 'text-[#237b4b]', bg: 'bg-[#edf7f0] dark:bg-[#237b4b]/15', icon: Check },
  rejected: { label: 'Rejected', color: 'text-[#c4314b]', bg: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15', icon: XCircle },
};

// ─── Helpers ───

function formatTimestamp(date: Date) {
  if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
  if (isYesterday(date)) return `Yesterday at ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d, h:mm a');
}

function formatShortTime(date: Date) {
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

// ─── Tabs ───

type InboxTab = 'notifications' | 'requests';

// ─── Main Component ───

export function Inbox() {
  const [items, setItems] = useState(notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Record<string, Record<string, string>>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<InboxTab>('notifications');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [requestFilter, setRequestFilter] = useState<'all' | SpaceRequestStatus>('all');

  // Subscribe to space requests store
  const spaceRequests = useSyncExternalStore(subscribeSpaceRequests, getSpaceRequests);

  const filteredRequests = requestFilter === 'all'
    ? spaceRequests
    : spaceRequests.filter(r => r.status === requestFilter);

  const pendingRequestCount = spaceRequests.filter(
    r => r.status === 'pending-owner' || r.status === 'pending-admin'
  ).length;

  const filtered = filter === 'unread' ? items.filter(n => !n.read) : items;
  const unreadCount = items.filter(n => !n.read).length;
  const selected = items.find(n => n.id === selectedId) || null;
  const selectedRequest = spaceRequests.find(r => r.id === selectedRequestId) || null;

  const selectItem = (id: string) => {
    setSelectedId(id);
    setSelectedRequestId(null);
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const selectRequest = (id: string) => {
    setSelectedRequestId(id);
    setSelectedId(null);
  };

  const markAllRead = () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  };

  const updateFormField = (notifId: string, fieldLabel: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      [notifId]: { ...(prev[notifId] || {}), [fieldLabel]: value },
    }));
  };

  const handleSubmit = (notifId: string) => {
    setSubmitted(prev => ({ ...prev, [notifId]: true }));
  };

  const config = selected ? typeConfig[selected.type] : null;
  const SelectedIcon = config?.icon || Bell;

  return (
    <div className="flex-1 flex bg-white dark:bg-[#1f1f1f]">
      {/* ─── Left: List Panel ─── */}
      <div className="w-[380px] min-w-[320px] flex flex-col border-r border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#1f1f1f]">
        {/* Header */}
        <div className="px-5 pt-3 pb-0 bg-white dark:bg-[#252525] border-b border-[#e1dfdd] dark:border-[#3d3d3d] shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Bell size={18} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
              <h2 className="font-semibold text-[#242424] dark:text-[#f0f0f0] text-[16px]">Inbox</h2>
              {(unreadCount + pendingRequestCount) > 0 && (
                <span className="text-[11px] bg-[#c4314b] text-white px-1.5 py-0.5 rounded-full font-semibold leading-none">
                  {unreadCount + pendingRequestCount}
                </span>
              )}
            </div>
            {activeTab === 'notifications' && unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="p-1.5 text-[#5b5fc7] dark:text-[#a6a9dc] hover:bg-[#eeeef8] dark:hover:bg-[#5b5fc7]/10 rounded-md transition-all"
                title="Mark all read"
              >
                <CheckCheck size={16} />
              </button>
            )}
          </div>

          {/* Tab bar */}
          <div className="flex gap-0">
            <button
              onClick={() => { setActiveTab('notifications'); setSelectedRequestId(null); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold border-b-2 transition-all ${
                activeTab === 'notifications'
                  ? 'border-[#5b5fc7] text-[#5b5fc7] dark:text-[#a6a9dc]'
                  : 'border-transparent text-[#616161] dark:text-[#8a8a8a] hover:text-[#242424] dark:hover:text-[#f0f0f0]'
              }`}
            >
              <Bell size={13} />
              Notifications
              {unreadCount > 0 && (
                <span className="text-[9px] bg-[#c4314b] text-white px-1.5 py-0.5 rounded-full font-bold leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('requests'); setSelectedId(null); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold border-b-2 transition-all ${
                activeTab === 'requests'
                  ? 'border-[#5b5fc7] text-[#5b5fc7] dark:text-[#a6a9dc]'
                  : 'border-transparent text-[#616161] dark:text-[#8a8a8a] hover:text-[#242424] dark:hover:text-[#f0f0f0]'
              }`}
            >
              <Building2 size={13} />
              My Requests
              {pendingRequestCount > 0 && (
                <span className="text-[9px] bg-[#d4820c] text-white px-1.5 py-0.5 rounded-full font-bold leading-none">
                  {pendingRequestCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* List body */}
        <div className="flex-1 overflow-y-auto scrollbar-none">
          <AnimatePresence mode="wait">
            {activeTab === 'notifications' ? (
              <motion.div
                key="notifs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {/* Filter bar */}
                <div className="px-4 py-2 flex items-center gap-1.5">
                  <div className="flex bg-[#f0f0f0] dark:bg-[#292929] rounded-md p-0.5">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all ${
                        filter === 'all'
                          ? 'bg-white dark:bg-[#3d3d3d] text-[#242424] dark:text-[#f0f0f0] shadow-sm'
                          : 'text-[#616161] dark:text-[#b9bbbe]'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter('unread')}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all ${
                        filter === 'unread'
                          ? 'bg-white dark:bg-[#3d3d3d] text-[#242424] dark:text-[#f0f0f0] shadow-sm'
                          : 'text-[#616161] dark:text-[#b9bbbe]'
                      }`}
                    >
                      Unread
                    </button>
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                    <div className="w-12 h-12 bg-[#edf7f0] dark:bg-[#237b4b]/15 rounded-full flex items-center justify-center mb-3">
                      <Check size={22} className="text-[#237b4b] dark:text-[#57ab5a]" />
                    </div>
                    <p className="text-[#242424] dark:text-[#f0f0f0] font-medium text-sm mb-0.5">All caught up!</p>
                    <p className="text-xs text-[#616161] dark:text-[#b9bbbe]">No unread notifications.</p>
                  </div>
                ) : (
                  filtered.map((notif) => {
                    const c = typeConfig[notif.type];
                    const Icon = c.icon;
                    const isSelected = selectedId === notif.id;
                    return (
                      <button
                        key={notif.id}
                        onClick={() => selectItem(notif.id)}
                        className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-all border-b border-[#e8e8e8] dark:border-[#2a2a2a] cursor-pointer group ${
                          isSelected
                            ? 'bg-[#e8e8f8] dark:bg-[#5b5fc7]/10'
                            : notif.read
                              ? 'hover:bg-[#f0f0f0] dark:hover:bg-[#292929]'
                              : 'bg-white dark:bg-[#252525] hover:bg-[#f5f5fa] dark:hover:bg-[#2a2a35]'
                        }`}
                      >
                        {/* Unread dot */}
                        <div className="w-2 shrink-0 pt-2">
                          {!notif.read && (
                            <span className="block w-2 h-2 bg-[#5b5fc7] rounded-full" />
                          )}
                        </div>

                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon size={16} className={c.color} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className={`text-sm truncate ${notif.read ? 'text-[#424242] dark:text-[#c8c8c8]' : 'text-[#242424] dark:text-[#f0f0f0] font-semibold'}`}>
                              {notif.title}
                            </span>
                            <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] whitespace-nowrap shrink-0">
                              {formatShortTime(notif.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-[#616161] dark:text-[#8a8a8a] truncate leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${c.bg} ${c.color}`}>
                              {c.label}
                            </span>
                            {notif.formFields && !submitted[notif.id] && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#fef7ec] dark:bg-[#d4820c]/15 text-[#d4820c] dark:text-[#f0b850]">
                                Action required
                              </span>
                            )}
                            {submitted[notif.id] && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#edf7f0] dark:bg-[#237b4b]/15 text-[#237b4b] dark:text-[#57ab5a]">
                                Submitted
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight size={14} className={`shrink-0 mt-2 transition-colors ${isSelected ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#d1d1d1] dark:text-[#3d3d3d] group-hover:text-[#8a8a8a]'}`} />
                      </button>
                    );
                  })
                )}
              </motion.div>
            ) : (
              <motion.div
                key="requests"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {/* Request filter bar */}
                <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  <div className="flex bg-[#f0f0f0] dark:bg-[#292929] rounded-md p-0.5 gap-0">
                    {(['all', 'pending-owner', 'pending-admin', 'approved', 'rejected'] as const).map(f => {
                      const label = f === 'all' ? 'All' : statusConfig[f as SpaceRequestStatus].label;
                      const count = f === 'all'
                        ? spaceRequests.length
                        : spaceRequests.filter(r => r.status === f).length;
                      return (
                        <button
                          key={f}
                          onClick={() => setRequestFilter(f)}
                          className={`px-2 py-1 text-[10px] font-medium rounded transition-all whitespace-nowrap flex items-center gap-1 ${
                            requestFilter === f
                              ? 'bg-white dark:bg-[#3d3d3d] text-[#242424] dark:text-[#f0f0f0] shadow-sm'
                              : 'text-[#616161] dark:text-[#b9bbbe]'
                          }`}
                        >
                          {label}
                          {count > 0 && (
                            <span className={`text-[8px] px-1 py-0 rounded-full font-bold ${
                              requestFilter === f ? 'bg-[#5b5fc7]/10 text-[#5b5fc7]' : 'bg-[#e8e8e8] dark:bg-[#3d3d3d] text-[#999]'
                            }`}>{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {filteredRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                    <div className="w-12 h-12 bg-[#f0f0f0] dark:bg-[#292929] rounded-full flex items-center justify-center mb-3">
                      <Building2 size={22} className="text-[#b9bbbe] dark:text-[#5a5a5a]" />
                    </div>
                    <p className="text-[#242424] dark:text-[#f0f0f0] font-medium text-sm mb-0.5">No requests found</p>
                    <p className="text-xs text-[#616161] dark:text-[#b9bbbe]">
                      {requestFilter === 'all'
                        ? 'Use "Add space" in the sidebar to request a new space.'
                        : 'No requests match this filter.'}
                    </p>
                  </div>
                ) : (
                  filteredRequests.map((req) => {
                    const sc = statusConfig[req.status];
                    const StatusIcon = sc.icon;
                    const isSelected = selectedRequestId === req.id;
                    return (
                      <button
                        key={req.id}
                        onClick={() => selectRequest(req.id)}
                        className={`w-full text-left flex items-start gap-3 px-4 py-3.5 transition-all border-b border-[#e8e8e8] dark:border-[#2a2a2a] cursor-pointer group ${
                          isSelected
                            ? 'bg-[#e8e8f8] dark:bg-[#5b5fc7]/10'
                            : 'hover:bg-[#f0f0f0] dark:hover:bg-[#292929]'
                        }`}
                      >
                        {/* Status dot */}
                        <div className="w-2 shrink-0 pt-2">
                          {(req.status === 'pending-owner' || req.status === 'pending-admin') && (
                            <span className={`block w-2 h-2 rounded-full ${req.status === 'pending-owner' ? 'bg-[#d4820c]' : 'bg-[#5b5fc7]'}`} />
                          )}
                        </div>

                        {/* Gradient icon */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{
                            background: `linear-gradient(135deg, ${req.scenarioColor}, ${req.scenarioColor}dd)`,
                          }}
                        >
                          <Building2 size={14} className="text-white" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-[#242424] dark:text-[#f0f0f0] truncate">
                              {req.spaceName}
                            </span>
                            <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] whitespace-nowrap shrink-0">
                              {formatShortTime(new Date(req.createdAt))}
                            </span>
                          </div>
                          <p className="text-xs text-[#616161] dark:text-[#8a8a8a] truncate leading-relaxed">
                            {req.scenarioName} &middot; Owner: {req.ownerName}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${sc.bg} ${sc.color} inline-flex items-center gap-0.5`}>
                              <StatusIcon size={9} />
                              {sc.label}
                            </span>
                            <span className="text-[10px] text-[#999] flex items-center gap-1">
                              <Hash size={8} />{req.channelCount} &middot;
                              <BarChart3 size={8} />{req.dashboardCount} &middot;
                              <Package size={8} />{req.appCount}
                            </span>
                          </div>
                        </div>

                        <ChevronRight size={14} className={`shrink-0 mt-2 transition-colors ${isSelected ? 'text-[#5b5fc7] dark:text-[#a6a9dc]' : 'text-[#d1d1d1] dark:text-[#3d3d3d] group-hover:text-[#8a8a8a]'}`} />
                      </button>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Right: Detail Panel ─── */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#1f1f1f]">
        {!selected && !selectedRequest ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 bg-[#f0f0f0] dark:bg-[#292929] rounded-2xl flex items-center justify-center mb-4">
              {activeTab === 'notifications'
                ? <Bell size={28} className="text-[#b9bbbe] dark:text-[#5a5a5a]" />
                : <Building2 size={28} className="text-[#b9bbbe] dark:text-[#5a5a5a]" />
              }
            </div>
            <p className="text-[#242424] dark:text-[#f0f0f0] font-medium mb-1">
              {activeTab === 'notifications' ? 'Select a notification' : 'Select a request'}
            </p>
            <p className="text-sm text-[#616161] dark:text-[#8a8a8a] max-w-xs">
              {activeTab === 'notifications'
                ? 'Choose a notification from the list to view its details or take action.'
                : 'Choose a space request to view its details, status, and approval progress.'}
            </p>
          </div>
        ) : selectedRequest ? (
          <SpaceRequestDetail
            request={selectedRequest}
            onClose={() => setSelectedRequestId(null)}
          />
        ) : selected ? (
          <>
            {/* Detail Header */}
            <div className="h-[60px] px-6 flex items-center justify-between border-b border-[#e1dfdd] dark:border-[#3d3d3d] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg ${config!.bg} flex items-center justify-center shrink-0`}>
                  <SelectedIcon size={16} className={config!.color} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#242424] dark:text-[#f0f0f0] text-[15px] truncate">{selected.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="p-1.5 text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#292929] rounded-md transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Detail Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl">
                {/* Meta row */}
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${config!.bg} ${config!.color}`}>
                    {config!.label}
                  </span>
                  <span className="text-xs text-[#616161] dark:text-[#8a8a8a]">
                    {formatTimestamp(selected.timestamp)}
                  </span>
                  {selected.from && (
                    <>
                      <span className="text-[#d1d1d1] dark:text-[#3d3d3d]">·</span>
                      <span className="text-xs text-[#616161] dark:text-[#8a8a8a]">
                        From <span className="font-medium text-[#424242] dark:text-[#c8c8c8]">{selected.from}</span>
                      </span>
                    </>
                  )}
                </div>

                {/* Body */}
                <div className="bg-[#faf9f8] dark:bg-[#252525] rounded-xl border border-[#e8e8e8] dark:border-[#3d3d3d] p-5 mb-6">
                  <div className="text-sm text-[#242424] dark:text-[#e0e0e0] whitespace-pre-line leading-relaxed">
                    {selected.detail}
                  </div>
                </div>

                {/* Form Section (if applicable) */}
                {selected.formFields && !submitted[selected.id] && (
                  <div className="bg-gradient-to-br from-[#faf9f8] to-[#f3f2f1] dark:from-[#252525] dark:to-[#1f1f1f] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <ClipboardCheck size={16} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
                      <h4 className="font-semibold text-[#242424] dark:text-[#f0f0f0] text-sm">Your Response</h4>
                    </div>
                    <div className="space-y-4">
                      {selected.formFields.map((field) => (
                        <div key={field.label}>
                          <label className="block text-xs font-medium text-[#424242] dark:text-[#c8c8c8] mb-1.5">
                            {field.label}
                            {field.required && <span className="text-[#c4314b] ml-0.5">*</span>}
                          </label>
                          {field.type === 'select' && field.options ? (
                            <select
                              value={formState[selected.id]?.[field.label] || ''}
                              onChange={(e) => updateFormField(selected.id, field.label, e.target.value)}
                              className="w-full bg-white dark:bg-[#1e1f22] border border-[#d1d1d1] dark:border-[#3d3d3d] rounded-lg px-3 py-2.5 text-sm text-[#242424] dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7] focus:border-transparent transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Select...</option>
                              {field.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : field.type === 'textarea' ? (
                            <textarea
                              value={formState[selected.id]?.[field.label] || ''}
                              onChange={(e) => updateFormField(selected.id, field.label, e.target.value)}
                              placeholder={`Enter ${field.label.toLowerCase()}...`}
                              rows={3}
                              className="w-full bg-white dark:bg-[#1e1f22] border border-[#d1d1d1] dark:border-[#3d3d3d] rounded-lg px-3 py-2.5 text-sm text-[#242424] dark:text-[#e0e0e0] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7] focus:border-transparent transition-all resize-none"
                            />
                          ) : (
                            <input
                              type="text"
                              value={formState[selected.id]?.[field.label] || ''}
                              onChange={(e) => updateFormField(selected.id, field.label, e.target.value)}
                              placeholder={`Enter ${field.label.toLowerCase()}...`}
                              className="w-full bg-white dark:bg-[#1e1f22] border border-[#d1d1d1] dark:border-[#3d3d3d] rounded-lg px-3 py-2.5 text-sm text-[#242424] dark:text-[#e0e0e0] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7] focus:border-transparent transition-all"
                            />
                          )}
                        </div>
                      ))}

                      <button
                        onClick={() => handleSubmit(selected.id)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5b5fc7] hover:bg-[#4f52b5] text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
                      >
                        <Send size={14} />
                        Submit
                      </button>
                    </div>
                  </div>
                )}

                {/* Submitted confirmation */}
                {selected.formFields && submitted[selected.id] && (
                  <div className="bg-[#edf7f0] dark:bg-[#237b4b]/15 rounded-xl border border-[#c6e6d5] dark:border-[#237b4b]/30 p-5 flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#237b4b] rounded-full flex items-center justify-center shrink-0">
                      <Check size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#237b4b] dark:text-[#57ab5a] text-sm mb-0.5">Response submitted</p>
                      <p className="text-xs text-[#3d8c5c] dark:text-[#6fbe7b]">
                        Your response has been recorded. You'll be notified if any follow-up is needed.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ─── Space Request Detail Panel ───

function SpaceRequestDetail({
  request,
  onClose,
}: {
  request: SpaceRequest;
  onClose: () => void;
}) {
  const sc = statusConfig[request.status];
  const StatusIcon = sc.icon;
  const isOwnerSelf = request.ownerId === request.requesterId;

  // Build approval timeline
  const timelineSteps = [
    {
      label: 'Request Submitted',
      sublabel: `by ${request.requesterName}`,
      date: request.createdAt,
      status: 'done' as const,
      icon: Send,
    },
    ...(!isOwnerSelf ? [{
      label: 'Owner Approval',
      sublabel: request.ownerName,
      date: request.ownerApprovedAt || null,
      status: (request.status === 'rejected' && request.rejectedBy === request.ownerName
        ? 'rejected'
        : request.ownerApprovedAt
          ? 'done'
          : request.status === 'pending-owner'
            ? 'current'
            : 'pending') as 'done' | 'current' | 'pending' | 'rejected',
      icon: ClipboardCheck,
    }] : []),
    {
      label: 'Admin Approval',
      sublabel: 'System Admin',
      date: request.adminApprovedAt || null,
      status: (request.status === 'rejected' && (!request.rejectedBy || request.rejectedBy !== request.ownerName)
        ? (request.ownerApprovedAt || isOwnerSelf ? 'rejected' : 'pending')
        : request.adminApprovedAt
          ? 'done'
          : request.status === 'pending-admin'
            ? 'current'
            : 'pending') as 'done' | 'current' | 'pending' | 'rejected',
      icon: Shield,
    },
    {
      label: 'Space Created',
      sublabel: request.status === 'approved' ? 'Live' : 'Pending',
      date: request.status === 'approved' ? request.adminApprovedAt || null : null,
      status: (request.status === 'approved' ? 'done' : 'pending') as 'done' | 'current' | 'pending' | 'rejected',
      icon: Sparkles,
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="h-[60px] px-6 flex items-center justify-between border-b border-[#e1dfdd] dark:border-[#3d3d3d] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: `linear-gradient(135deg, ${request.scenarioColor}, ${request.scenarioColor}dd)`,
            }}
          >
            <Building2 size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-[#242424] dark:text-[#f0f0f0] text-[15px] truncate">{request.spaceName}</h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-[#616161] dark:text-[#b9bbbe] hover:bg-[#f0f0f0] dark:hover:bg-[#292929] rounded-md transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl">
          {/* Status + Meta */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color} inline-flex items-center gap-1`}>
              <StatusIcon size={11} />
              {sc.label}
            </span>
            <span className="text-xs text-[#616161] dark:text-[#8a8a8a]">
              Submitted {formatTimestamp(new Date(request.createdAt))}
            </span>
            <span className="text-xs text-[#999]">
              &middot; Updated {formatDistanceToNow(new Date(request.updatedAt), { addSuffix: true })}
            </span>
          </div>

          {/* Space card */}
          <div className="rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden mb-6">
            <div
              className="h-14 flex items-end px-4 pb-2"
              style={{
                background: `linear-gradient(135deg, ${request.scenarioColor}, ${request.scenarioColor}cc)`,
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center -mb-2 border border-white/30">
                <Building2 size={16} className="text-white" />
              </div>
            </div>
            <div className="px-4 pt-4 pb-4">
              <h4 className="text-[15px] font-bold text-[#242424] dark:text-[#f0f0f0] mb-0.5">{request.spaceName}</h4>
              <p className="text-[12px] text-[#616161] dark:text-[#8a8a8a] mb-3">
                {request.spaceDescription || 'No description provided'}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#faf9f8] dark:bg-[#1e1f22]">
                  <p className="text-[9px] font-bold text-[#999] uppercase tracking-wider mb-1.5">Scenario</p>
                  <p className="text-[12px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{request.scenarioName}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#faf9f8] dark:bg-[#1e1f22]">
                  <p className="text-[9px] font-bold text-[#999] uppercase tracking-wider mb-1.5">Owner</p>
                  <div className="flex items-center gap-2">
                    <img src={request.ownerAvatar} alt={request.ownerName} className="w-5 h-5 rounded-full" />
                    <div>
                      <p className="text-[12px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{request.ownerName}</p>
                      <p className="text-[9px] text-[#999]">{request.ownerTitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Included items */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e8e8e8] dark:border-[#3d3d3d]">
              <div className="flex items-center gap-1.5 mb-2">
                <Hash size={11} className="text-[#5b5fc7]" />
                <p className="text-[9px] font-bold text-[#999] uppercase tracking-wider">{request.channelCount} Channels</p>
              </div>
              <div className="space-y-0.5">
                {request.channels.map(ch => (
                  <p key={ch} className="text-[10px] text-[#616161] dark:text-[#8a8a8a] truncate">{ch}</p>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e8e8e8] dark:border-[#3d3d3d]">
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart3 size={11} className="text-[#5b5fc7]" />
                <p className="text-[9px] font-bold text-[#999] uppercase tracking-wider">{request.dashboardCount} Dashboards</p>
              </div>
              <div className="space-y-0.5">
                {request.dashboards.length > 0 ? request.dashboards.map(d => (
                  <p key={d} className="text-[10px] text-[#616161] dark:text-[#8a8a8a] truncate">{d}</p>
                )) : (
                  <p className="text-[10px] text-[#ccc] italic">None</p>
                )}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e8e8e8] dark:border-[#3d3d3d]">
              <div className="flex items-center gap-1.5 mb-2">
                <Package size={11} className="text-[#5b5fc7]" />
                <p className="text-[9px] font-bold text-[#999] uppercase tracking-wider">{request.appCount} Apps</p>
              </div>
              <div className="space-y-0.5">
                {request.apps.length > 0 ? request.apps.map(a => (
                  <p key={a} className="text-[10px] text-[#616161] dark:text-[#8a8a8a] truncate">{a}</p>
                )) : (
                  <p className="text-[10px] text-[#ccc] italic">None</p>
                )}
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="p-3 rounded-xl bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e8e8e8] dark:border-[#3d3d3d] mb-6">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield size={11} className="text-[#5b5fc7]" />
              <p className="text-[9px] font-bold text-[#999] uppercase tracking-wider">Permissions</p>
            </div>
            <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a]">{request.permissions}</p>
          </div>

          {/* Rejection reason */}
          {request.status === 'rejected' && request.rejectionReason && (
            <div className="p-4 rounded-xl bg-[#fdf0f2] dark:bg-[#c4314b]/10 border border-[#c4314b]/20 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={14} className="text-[#c4314b]" />
                <p className="text-[12px] font-semibold text-[#c4314b]">
                  Rejected by {request.rejectedBy}
                </p>
              </div>
              <p className="text-[12px] text-[#c4314b]/80 dark:text-[#f47067]/80 leading-relaxed">
                {request.rejectionReason}
              </p>
              {request.rejectedAt && (
                <p className="mt-2 text-[10px] text-[#c4314b]/60">
                  {formatTimestamp(new Date(request.rejectedAt))}
                </p>
              )}
            </div>
          )}

          {/* Approval Timeline */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#faf9f8] to-[#f5f5f5] dark:from-[#252525] dark:to-[#1f1f1f] border border-[#e8e8e8] dark:border-[#3d3d3d]">
            <p className="text-[10px] font-bold text-[#5b5fc7] dark:text-[#a6a9dc] uppercase tracking-wider mb-4">
              Approval Timeline
            </p>

            <div className="space-y-0">
              {timelineSteps.map((step, i) => {
                const isLast = i === timelineSteps.length - 1;
                const StepIcon = step.icon;
                return (
                  <div key={i} className="flex gap-3">
                    {/* Vertical line + dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        step.status === 'done'
                          ? 'bg-[#237b4b] text-white'
                          : step.status === 'current'
                            ? 'bg-[#d4820c] text-white animate-pulse'
                            : step.status === 'rejected'
                              ? 'bg-[#c4314b] text-white'
                              : 'bg-[#e8e8e8] dark:bg-[#3d3d3d] text-[#999]'
                      }`}>
                        {step.status === 'done' ? <Check size={12} /> :
                         step.status === 'rejected' ? <XCircle size={12} /> :
                         step.status === 'current' ? <Clock size={12} /> :
                         <StepIcon size={12} />}
                      </div>
                      {!isLast && (
                        <div className={`w-[2px] flex-1 min-h-[28px] ${
                          step.status === 'done' ? 'bg-[#237b4b]' :
                          step.status === 'rejected' ? 'bg-[#c4314b]/30' :
                          'bg-[#e1dfdd] dark:bg-[#3d3d3d]'
                        }`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
                      <p className={`text-[12px] font-semibold ${
                        step.status === 'done' ? 'text-[#242424] dark:text-[#f0f0f0]' :
                        step.status === 'current' ? 'text-[#d4820c]' :
                        step.status === 'rejected' ? 'text-[#c4314b]' :
                        'text-[#999] dark:text-[#666]'
                      }`}>
                        {step.label}
                        {step.status === 'rejected' && ' — Rejected'}
                      </p>
                      <p className="text-[10px] text-[#999] dark:text-[#666]">{step.sublabel}</p>
                      {step.date && (
                        <p className="text-[9px] text-[#b9bbbe] dark:text-[#555] mt-0.5">
                          {formatTimestamp(new Date(step.date))}
                        </p>
                      )}
                      {step.status === 'current' && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-semibold text-[#d4820c] bg-[#d4820c]/8 px-2 py-0.5 rounded-full">
                          <Clock size={8} /> Waiting for response
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}