import { useState } from 'react';
import {
  Bell, Shield, UserPlus, RefreshCw, Server, Check, CheckCheck,
  ClipboardCheck, X, Send, ChevronRight,
} from 'lucide-react';
import { notifications, type Notification } from '../data/mockData';
import { format, isToday, isYesterday } from 'date-fns';

const typeConfig: Record<Notification['type'], { icon: typeof Bell; color: string; bg: string; label: string }> = {
  system: { icon: Server, color: 'text-[#616161] dark:text-[#b9bbbe]', bg: 'bg-[#f0f0f0] dark:bg-[#3d3d3d]', label: 'System' },
  admin: { icon: Bell, color: 'text-[#5b5fc7] dark:text-[#a6a9dc]', bg: 'bg-[#eeeef8] dark:bg-[#5b5fc7]/15', label: 'Admin' },
  security: { icon: Shield, color: 'text-[#c4314b] dark:text-[#f47067]', bg: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15', label: 'Security' },
  update: { icon: RefreshCw, color: 'text-[#237b4b] dark:text-[#57ab5a]', bg: 'bg-[#edf7f0] dark:bg-[#237b4b]/15', label: 'Update' },
  invite: { icon: UserPlus, color: 'text-[#8764b8] dark:text-[#c49ded]', bg: 'bg-[#f3eef9] dark:bg-[#8764b8]/15', label: 'Invitation' },
  approval: { icon: ClipboardCheck, color: 'text-[#d4820c] dark:text-[#f0b850]', bg: 'bg-[#fef7ec] dark:bg-[#d4820c]/15', label: 'Approval' },
};

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

export function Inbox() {
  const [items, setItems] = useState(notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Record<string, Record<string, string>>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const filtered = filter === 'unread' ? items.filter(n => !n.read) : items;
  const unreadCount = items.filter(n => !n.read).length;
  const selected = items.find(n => n.id === selectedId) || null;

  const selectItem = (id: string) => {
    setSelectedId(id);
    // Mark as read when selecting
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
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
      {/* ─── Left: Notification List ─── */}
      <div className="w-[380px] min-w-[320px] flex flex-col border-r border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#1f1f1f]">
        {/* Header */}
        <div className="h-[60px] px-5 flex items-center justify-between border-b border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#252525] shrink-0">
          <div className="flex items-center gap-2.5">
            <Bell size={18} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
            <h2 className="font-semibold text-[#242424] dark:text-[#f0f0f0] text-[16px]">Inbox</h2>
            {unreadCount > 0 && (
              <span className="text-[11px] bg-[#c4314b] text-white px-1.5 py-0.5 rounded-full font-semibold leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
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
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="p-1.5 text-[#5b5fc7] dark:text-[#a6a9dc] hover:bg-[#eeeef8] dark:hover:bg-[#5b5fc7]/10 rounded-md transition-all"
                title="Mark all read"
              >
                <CheckCheck size={16} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
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
        </div>
      </div>

      {/* ─── Right: Detail Panel ─── */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#1f1f1f]">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 bg-[#f0f0f0] dark:bg-[#292929] rounded-2xl flex items-center justify-center mb-4">
              <Bell size={28} className="text-[#b9bbbe] dark:text-[#5a5a5a]" />
            </div>
            <p className="text-[#242424] dark:text-[#f0f0f0] font-medium mb-1">Select a notification</p>
            <p className="text-sm text-[#616161] dark:text-[#8a8a8a] max-w-xs">
              Choose a notification from the list to view its details or take action.
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
