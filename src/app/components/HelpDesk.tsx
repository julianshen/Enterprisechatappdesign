import { Button, Badge, Tooltip, TooltipTrigger, TooltipContent, Separator } from "@/components/ui";
import { useState, useRef, useEffect, useCallback } from 'react';
import {  AlertTriangle, CheckCircle2, Clock, Send, ChevronDown,
  Plus, Search, MessageCircle, FileText, Bug, Settings, HelpCircle,
  Loader2, CircleDot, XCircle, ArrowUpCircle, ArrowRight,
  Headphones, BookOpen, LifeBuoy, Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from "@/lib/utils";
import { useI18n } from '../context/I18nContext';

// ─── Types ───

interface HelpTicket {
  id: string;
  title: string;
  description: string;
  category: 'bug' | 'feature' | 'access' | 'general' | 'hardware';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  assignee?: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  time: string;
}

// ─── Mock Data ───

const initialTickets: HelpTicket[] = [
  {
    id: 'HD-1042',
    title: 'Cannot access shared drive',
    description: 'Getting permission denied when trying to access the engineering shared drive.',
    category: 'access',
    priority: 'high',
    status: 'in-progress',
    createdAt: '2026-02-14T10:30:00',
    updatedAt: '2026-02-15T14:20:00',
    assignee: 'IT Support - Mike',
  },
  {
    id: 'HD-1039',
    title: 'VPN connection dropping frequently',
    description: 'VPN disconnects every 30 minutes, need to reconnect manually.',
    category: 'general',
    priority: 'medium',
    status: 'waiting',
    createdAt: '2026-02-13T09:15:00',
    updatedAt: '2026-02-14T16:45:00',
    assignee: 'Network Team',
  },
  {
    id: 'HD-1035',
    title: 'New monitor setup request',
    description: 'Requesting a second monitor for the dev workstation.',
    category: 'hardware',
    priority: 'low',
    status: 'open',
    createdAt: '2026-02-12T14:00:00',
    updatedAt: '2026-02-12T14:00:00',
  },
  {
    id: 'HD-1028',
    title: 'Email sync not working on mobile',
    description: 'Corporate email stopped syncing on my phone after the last update.',
    category: 'bug',
    priority: 'medium',
    status: 'resolved',
    createdAt: '2026-02-10T11:20:00',
    updatedAt: '2026-02-15T09:00:00',
    assignee: 'IT Support - Sarah',
  },
];

const faqItems: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I reset my password?',
    answer: 'Go to Settings > Security > Change Password. If you\'re locked out, click "Forgot Password" on the login page. A reset link will be sent to your registered email. Password must be at least 12 characters with mixed case, numbers, and symbols.',
    category: 'Account',
  },
  {
    id: 'faq-2',
    question: 'How do I request software installation?',
    answer: 'Submit a request through this Help Desk with category "General". Include the software name, version, and business justification. Approved software is typically installed within 1-2 business days. For urgent needs, use the live chat feature.',
    category: 'Software',
  },
  {
    id: 'faq-3',
    question: 'What do I do if my laptop is running slow?',
    answer: 'Try these steps: 1) Restart your laptop, 2) Clear temporary files, 3) Check for Windows/macOS updates, 4) Close unused applications. If the issue persists, submit a ticket and our team will run diagnostics remotely.',
    category: 'Hardware',
  },
  {
    id: 'faq-4',
    question: 'How to set up VPN for remote work?',
    answer: 'Download the company VPN client from the IT Portal. Use your corporate credentials to log in. If you need a VPN profile, submit a request with your employee ID. The VPN auto-connects on trusted networks. For troubleshooting, check our VPN guide or contact IT.',
    category: 'Network',
  },
  {
    id: 'faq-5',
    question: 'How do I get access to a shared drive or channel?',
    answer: 'Ask the space owner to add you, or submit a request here specifying the exact drive/channel name and your business need. Access requests are reviewed within 24 hours. For urgent access, contact your manager to expedite.',
    category: 'Access',
  },
  {
    id: 'faq-6',
    question: 'How do I report a security concern?',
    answer: 'For urgent security issues (phishing, unauthorized access, data breach), contact the Security team immediately via the emergency hotline or use the "Critical" priority in the Report Issue form. Do not forward suspicious emails — report them using the "Report Phish" button in Outlook.',
    category: 'Security',
  },
];

const agentResponses = [
  "I understand the issue. Let me look into that for you right away.",
  "Thanks for providing those details! I'm checking our system now.",
  "I've found a solution. Let me walk you through the steps.",
  "That's a known issue we're tracking. I'll escalate it to the engineering team.",
  "I've updated your ticket with the latest information. You should see changes reflected shortly.",
  "Could you try clearing your browser cache and restarting? That often resolves this type of issue.",
  "I'm going to create a ticket for this so we can track the resolution. You'll receive email updates on progress.",
];

// ─── Sub-components ───

type ActiveWidget = 'overview' | 'report' | 'status' | 'faq' | 'chat';

const categoryIcons = {
  bug: <Bug size={12} />,
  feature: <Settings size={12} />,
  access: <HelpCircle size={12} />,
  general: <FileText size={12} />,
  hardware: <Settings size={12} />,
};

// ─── Main Component ───

export function HelpDesk() {
  const { t, language } = useI18n();
  const localeMap: Record<string, string> = {
    en: 'en-US',
    'zh-Hant': 'zh-TW',
    'zh-Hans': 'zh-CN',
    ja: 'ja-JP',
    de: 'de-DE',
    es: 'es-ES',
    fr: 'fr-FR',
    hi: 'hi-IN',
    pl: 'pl-PL',
  };
  const locale = localeMap[language] ?? 'en-US';
  const priorityConfig = {
    low: { color: 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20', icon: <ArrowRight size={10} />, label: t('helpDesk.priority.low') },
    medium: { color: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20', icon: <ArrowUpCircle size={10} />, label: t('helpDesk.priority.medium') },
    high: { color: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20', icon: <AlertTriangle size={10} />, label: t('helpDesk.priority.high') },
    critical: { color: 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20', icon: <XCircle size={10} />, label: t('helpDesk.priority.critical') },
  };
  const statusConfig = {
    'open': { color: 'bg-[#3b82f6]', icon: <CircleDot size={10} />, label: t('helpDesk.status.open') },
    'in-progress': { color: 'bg-[#f59e0b]', icon: <Loader2 size={10} className="animate-spin" />, label: t('helpDesk.status.inProgress') },
    'waiting': { color: 'bg-[#8b5cf6]', icon: <Clock size={10} />, label: t('helpDesk.status.waiting') },
    'resolved': { color: 'bg-[#22c55e]', icon: <CheckCircle2 size={10} />, label: t('helpDesk.status.resolved') },
    'closed': { color: 'bg-[#6b7280]', icon: <CheckCircle2 size={10} />, label: t('helpDesk.status.closed') },
  };
  const [activeWidget, setActiveWidget] = useState<ActiveWidget>('overview');
  const [tickets, setTickets] = useState<HelpTicket[]>(initialTickets);
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Report form state
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportCategory, setReportCategory] = useState<HelpTicket['category']>('general');
  const [reportPriority, setReportPriority] = useState<HelpTicket['priority']>('medium');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'agent-welcome',
      role: 'agent',
      content: t('helpDesk.chat.welcome'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [agentTyping, setAgentTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages, agentTyping]);

  const handleReportSubmit = () => {
    if (!reportTitle.trim() || !reportDesc.trim()) return;
    const newTicket: HelpTicket = {
      id: `HD-${1043 + tickets.length}`,
      title: reportTitle,
      description: reportDesc,
      category: reportCategory,
      priority: reportPriority,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTickets(prev => [newTicket, ...prev]);
    setReportSubmitted(true);
    setTimeout(() => {
      setReportTitle('');
      setReportDesc('');
      setReportCategory('general');
      setReportPriority('medium');
      setReportSubmitted(false);
      setActiveWidget('status');
    }, 2000);
  };

  const handleChatSend = useCallback((directContent?: string) => {
    const content = (directContent || chatInput).trim();
    if (!content) return;
    const userMsg: ChatMessage = {
      id: `chat-u-${Date.now()}`,
      role: 'user',
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setAgentTyping(true);

    setTimeout(() => {
      const response = agentResponses[Math.floor(Math.random() * agentResponses.length)];
      const agentMsg: ChatMessage = {
        id: `chat-a-${Date.now()}`,
        role: 'agent',
        content: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, agentMsg]);
      setAgentTyping(false);
    }, 1000 + Math.random() * 1500);
  }, [chatInput]);

  const filteredFaq = faqItems.filter(item =>
    !faqSearch || item.question.toLowerCase().includes(faqSearch.toLowerCase()) || item.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const filteredTickets = tickets.filter(t =>
    statusFilter === 'all' || t.status === statusFilter
  );

  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in-progress' || t.status === 'waiting').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  // ─── Overview Dashboard ───
  const renderOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-3 p-4"
    >
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: t('helpDesk.stats.open'), count: openCount, color: 'from-[#3b82f6] to-[#2563eb]', bg: 'bg-[#3b82f6]/5 dark:bg-[#3b82f6]/10' },
          { label: t('helpDesk.stats.active'), count: inProgressCount, color: 'from-[#f59e0b] to-[#d97706]', bg: 'bg-[#f59e0b]/5 dark:bg-[#f59e0b]/10' },
          { label: t('helpDesk.stats.resolved'), count: resolvedCount, color: 'from-[#22c55e] to-[#16a34a]', bg: 'bg-[#22c55e]/5 dark:bg-[#22c55e]/10' },
        ].map(stat => (
          <div key={stat.label} className={cn('rounded-xl p-3 text-center border border-transparent', stat.bg)}>
            <p className={cn('text-[20px] font-bold bg-gradient-to-r bg-clip-text text-transparent', stat.color)}>{stat.count}</p>
            <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Action Cards */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider px-1">{t('helpDesk.quickActions.title')}</p>
        {[
          { widget: 'report' as ActiveWidget, icon: <Plus size={16} />, title: t('helpDesk.quickActions.report.title'), desc: t('helpDesk.quickActions.report.desc'), gradient: 'from-[#5b5fc7] to-[#7b4db8]' },
          { widget: 'status' as ActiveWidget, icon: <CircleDot size={16} />, title: t('helpDesk.quickActions.status.title'), desc: t('helpDesk.quickActions.status.desc', { tickets: tickets.length, open: openCount }), gradient: 'from-[#0ea5e9] to-[#3b82f6]' },
          { widget: 'faq' as ActiveWidget, icon: <BookOpen size={16} />, title: t('helpDesk.quickActions.faq.title'), desc: t('helpDesk.quickActions.faq.desc', { count: faqItems.length }), gradient: 'from-[#22c55e] to-[#16a34a]' },
          { widget: 'chat' as ActiveWidget, icon: <Headphones size={16} />, title: t('helpDesk.quickActions.chat.title'), desc: t('helpDesk.quickActions.chat.desc'), gradient: 'from-[#f59e0b] to-[#ef4444]' },
        ].map(item => (
          <button
            key={item.widget}
            onClick={() => setActiveWidget(item.widget)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#f5f5f5] dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/30 dark:hover:border-[#5b5fc7]/30 transition-all group text-left"
          >
            <div className={cn('w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform', item.gradient)}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[#242424] dark:text-[#e0e0e0] group-hover:text-[#5b5fc7] dark:group-hover:text-[#a6a9dc] transition-colors">{item.title}</p>
              <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">{item.desc}</p>
            </div>
            <ChevronDown size={14} className="text-[#b9bbbe] -rotate-90 group-hover:text-[#5b5fc7] transition-colors shrink-0" />
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider px-1">{t('helpDesk.recentActivity')}</p>
        <div className="space-y-1">
          {tickets.slice(0, 3).map(ticket => (
            <div key={ticket.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#252525] transition-colors cursor-pointer" onClick={() => setActiveWidget('status')}>
              <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusConfig[ticket.status].color)} />
              <span className="text-[11px] text-[#616161] dark:text-[#9e9e9e] font-mono shrink-0">{ticket.id}</span>
              <span className="text-[11px] text-[#242424] dark:text-[#e0e0e0] truncate flex-1">{ticket.title}</span>
              <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full border', priorityConfig[ticket.priority].color)}>{priorityConfig[ticket.priority].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Support Links */}
      <Separator className="bg-[#e1dfdd] dark:bg-[#3d3d3d]" />
      <div className="flex items-center gap-2">
        {[
          { icon: <BookOpen size={12} />, label: t('helpDesk.links.docs') },
          { icon: <LifeBuoy size={12} />, label: t('helpDesk.links.portal') },
          { icon: <Headphones size={12} />, label: t('helpDesk.links.call') },
        ].map(link => (
          <button key={link.label} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-medium text-[#616161] dark:text-[#9e9e9e] hover:bg-[#eeeef8] dark:hover:bg-[#5b5fc7]/5 hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc] transition-colors">
            {link.icon}
            {link.label}
          </button>
        ))}
      </div>
    </motion.div>
  );

  // ─── Report Issue Form ───
  const renderReport = () => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-4 space-y-3"
    >
      <AnimatePresence mode="wait">
        {reportSubmitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center py-10 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center mb-3 shadow-lg shadow-[#22c55e]/20">
              <CheckCircle2 size={28} className="text-white" />
            </div>
            <p className="text-[14px] font-semibold text-[#242424] dark:text-[#e0e0e0]">{t('helpDesk.report.submittedTitle')}</p>
            <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] mt-1">{t('helpDesk.report.submittedSubtitle')}</p>
          </motion.div>
        ) : (
          <motion.div key="form" className="space-y-3">
            {/* Title */}
            <div>
              <label className="text-[11px] font-medium text-[#424242] dark:text-[#c8c8c8] mb-1 block">{t('helpDesk.report.issueTitle')}</label>
              <input
                value={reportTitle}
                onChange={e => setReportTitle(e.target.value)}
                placeholder={t('helpDesk.report.issueTitlePlaceholder')}
                className="w-full px-3 py-2 bg-white dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-[12px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40 transition-all"
              />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-[#424242] dark:text-[#c8c8c8] mb-1 block">{t('helpDesk.report.category')}</label>
                <select
                  value={reportCategory}
                  onChange={e => setReportCategory(e.target.value as HelpTicket['category'])}
                  className="w-full px-2.5 py-2 bg-white dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-[12px] text-[#242424] dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40 transition-all appearance-none"
                >
                  <option value="bug">{t('helpDesk.report.categoryOption.bug')}</option>
                  <option value="access">{t('helpDesk.report.categoryOption.access')}</option>
                  <option value="hardware">{t('helpDesk.report.categoryOption.hardware')}</option>
                  <option value="feature">{t('helpDesk.report.categoryOption.feature')}</option>
                  <option value="general">{t('helpDesk.report.categoryOption.general')}</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#424242] dark:text-[#c8c8c8] mb-1 block">{t('helpDesk.report.priority')}</label>
                <select
                  value={reportPriority}
                  onChange={e => setReportPriority(e.target.value as HelpTicket['priority'])}
                  className="w-full px-2.5 py-2 bg-white dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-[12px] text-[#242424] dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40 transition-all appearance-none"
                >
                  <option value="low">{t('helpDesk.priority.low')}</option>
                  <option value="medium">{t('helpDesk.priority.medium')}</option>
                  <option value="high">{t('helpDesk.priority.high')}</option>
                  <option value="critical">{t('helpDesk.priority.critical')}</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] font-medium text-[#424242] dark:text-[#c8c8c8] mb-1 block">{t('helpDesk.report.description')}</label>
              <textarea
                value={reportDesc}
                onChange={e => setReportDesc(e.target.value)}
                placeholder={t('helpDesk.report.descriptionPlaceholder')}
                className="w-full px-3 py-2 bg-white dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-[12px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40 transition-all resize-none"
                rows={4}
              />
            </div>

            {/* Preview */}
            {reportTitle && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-2.5 rounded-lg bg-[#faf9f8] dark:bg-[#1a1a1a] border border-[#e1dfdd] dark:border-[#3d3d3d]"
              >
                <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider mb-1.5">{t('common.preview')}</p>
                <div className="flex items-center gap-2">
                  <div className="text-[#5b5fc7]">{categoryIcons[reportCategory]}</div>
                  <span className="text-[11px] font-medium text-[#242424] dark:text-[#e0e0e0] flex-1 truncate">{reportTitle}</span>
                  <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full border', priorityConfig[reportPriority].color)}>
                    {priorityConfig[reportPriority].label}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Submit */}
            <Button
              onClick={handleReportSubmit}
              disabled={!reportTitle.trim() || !reportDesc.trim()}
              className="w-full bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8] text-white hover:opacity-90 disabled:opacity-50 rounded-xl h-9 text-[12px]"
            >
              <Send size={13} className="mr-1.5" />
              {t('helpDesk.report.submit')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // ─── Issue Status ───
  const renderStatus = () => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col flex-1 min-h-0"
    >
      {/* Filters */}
      <div className="shrink-0 px-4 pt-3 pb-2 flex items-center gap-1.5 overflow-x-auto">
        <Filter size={11} className="text-[#8a8a8a] shrink-0" />
        {['all', 'open', 'in-progress', 'waiting', 'resolved'].map(filter => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={cn(
              'px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap border transition-colors',
              statusFilter === filter
                ? 'bg-[#5b5fc7]/10 text-[#5b5fc7] border-[#5b5fc7]/20 dark:bg-[#5b5fc7]/20 dark:text-[#a6a9dc]'
                : 'bg-[#f5f5f5] dark:bg-[#252525] text-[#616161] dark:text-[#9e9e9e] border-transparent hover:border-[#e1dfdd] dark:hover:border-[#3d3d3d]'
            )}
          >
            {filter === 'all'
              ? t('common.all')
              : filter === 'in-progress'
              ? t('helpDesk.status.inProgress')
              : t(`helpDesk.status.${filter}`)}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-2">
        {filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 size={32} className="text-[#22c55e] mb-2" />
            <p className="text-[12px] text-[#8a8a8a]">{t('helpDesk.status.empty')}</p>
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} statusConfig={statusConfig} priorityConfig={priorityConfig} t={t} locale={locale} />
          ))
        )}
      </div>
    </motion.div>
  );

  // ─── FAQ ───
  const renderFaq = () => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col flex-1 min-h-0"
    >
      {/* Search */}
      <div className="shrink-0 px-4 pt-3 pb-2">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b9bbbe]" />
          <input
            value={faqSearch}
            onChange={e => setFaqSearch(e.target.value)}
            placeholder={t('helpDesk.faq.searchPlaceholder')}
            className="w-full pl-8 pr-3 py-2 bg-[#f5f5f5] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-[12px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40 transition-all"
          />
        </div>
      </div>

      {/* FAQ Items */}
      <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-1">
        {filteredFaq.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <HelpCircle size={32} className="text-[#8a8a8a] mb-2" />
            <p className="text-[12px] text-[#8a8a8a]">{t('helpDesk.faq.empty')}</p>
          </div>
        ) : (
          filteredFaq.map(item => (
            <div
              key={item.id}
              className="border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                className="w-full flex items-start gap-2 p-3 text-left hover:bg-[#faf9f8] dark:hover:bg-[#252525] transition-colors"
              >
                <HelpCircle size={14} className="text-[#5b5fc7] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#242424] dark:text-[#e0e0e0]">{item.question}</p>
                  <Badge variant="secondary" className="mt-1 text-[9px] h-4 px-1.5 bg-[#f0f0f0] dark:bg-[#333] text-[#8a8a8a]">{item.category}</Badge>
                </div>
                <ChevronDown size={14} className={cn('text-[#b9bbbe] shrink-0 mt-0.5 transition-transform', expandedFaq === item.id && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {expandedFaq === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pt-0">
                      <div className="p-2.5 rounded-lg bg-[#faf9f8] dark:bg-[#1a1a1a] text-[11px] text-[#616161] dark:text-[#9e9e9e] leading-relaxed">
                        {item.answer}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-[#8a8a8a]">{t('helpDesk.faq.helpful')}</span>
                        <button className="text-[10px] px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] hover:bg-[#22c55e]/20 transition-colors">{t('common.yes')}</button>
                        <button className="text-[10px] px-2 py-0.5 rounded-full bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 transition-colors">{t('common.no')}</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );

  // ─── Live Chat ───
  const renderChat = () => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col flex-1 min-h-0"
    >
      {/* Agent Header */}
      <div className="shrink-0 px-4 py-2.5 bg-[#faf9f8] dark:bg-[#252525] border-b border-[#e1dfdd] dark:border-[#3d3d3d] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center">
          <Headphones size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-[#242424] dark:text-[#e0e0e0]">{t('helpDesk.chat.agentTitle')}</p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            <span className="text-[10px] text-[#22c55e]">{t('helpDesk.chat.online')}</span>
            <span className="text-[10px] text-[#8a8a8a] ml-1">{t('helpDesk.chat.avgResponse')}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {chatMessages.map(msg => (
          <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : '')}>
            {msg.role === 'agent' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center shrink-0 mt-0.5">
                <Headphones size={10} className="text-white" />
              </div>
            )}
            <div className={cn('max-w-[80%]', msg.role === 'user' ? 'order-first' : '')}>
              <div className={cn(
                'rounded-2xl px-3 py-2 text-[12px]',
                msg.role === 'user'
                  ? 'bg-[#5b5fc7] text-white rounded-br-md'
                  : 'bg-[#f5f5f5] dark:bg-[#252525] text-[#242424] dark:text-[#e0e0e0] rounded-bl-md',
              )}>
                {msg.content}
              </div>
              <p className={cn('text-[9px] mt-0.5 px-1', msg.role === 'user' ? 'text-right text-[#b9bbbe]' : 'text-[#b9bbbe]')}>{msg.time}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-[#e8e8f8] dark:bg-[#3d3d3d] flex items-center justify-center shrink-0 mt-0.5">
                <MessageCircle size={10} className="text-[#5b5fc7]" />
              </div>
            )}
          </div>
        ))}

        {agentTyping && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center shrink-0">
              <Headphones size={10} className="text-white" />
            </div>
            <div className="bg-[#f5f5f5] dark:bg-[#252525] rounded-2xl rounded-bl-md px-3 py-2.5">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#8a8a8a] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#8a8a8a] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#8a8a8a] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick suggestions */}
      {chatMessages.length <= 2 && (
        <div className="shrink-0 px-4 pb-2 flex items-center gap-1.5 overflow-x-auto">
          {[t('helpDesk.chat.suggestion.vpn'), t('helpDesk.chat.suggestion.resetPassword'), t('helpDesk.chat.suggestion.softwareInstall')].map((q, i) => (
            <button
              key={i}
              onClick={() => handleChatSend(q)}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#f0f0f0] dark:bg-[#252525] text-[#424242] dark:text-[#c8c8c8] hover:bg-[#eeeef8] dark:hover:bg-[#333] hover:text-[#5b5fc7] transition-colors whitespace-nowrap border border-transparent hover:border-[#5b5fc7]/20"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input */}
      <div className="shrink-0 px-4 py-3 border-t border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#252525]">
        <div className="flex items-end gap-2">
          <textarea
            ref={chatInputRef}
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChatSend();
              }
            }}
            placeholder={t('helpDesk.chat.placeholder')}
            className="flex-1 px-3 py-2 bg-white dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-xl text-[12px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40 transition-all resize-none"
            rows={1}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileTap={chatInput.trim() ? { scale: 0.9 } : {}}>
                <Button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim()}
                  size="icon"
                  className={cn(
                    'h-9 w-9 rounded-xl shrink-0 transition-all',
                    chatInput.trim()
                      ? 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white shadow-sm hover:shadow-md'
                      : 'bg-[#f0f0f0] dark:bg-[#333] text-[#b9bbbe] dark:text-[#5a5a5a]',
                  )}
                >
                  <Send size={14} />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4}>{t('helpDesk.chat.send')}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Sub-Navigation */}
      {activeWidget !== 'overview' && (
        <div className="shrink-0 px-4 py-2 bg-[#faf9f8] dark:bg-[#252525] border-b border-[#e1dfdd] dark:border-[#3d3d3d] flex items-center gap-2">
          <button
            onClick={() => setActiveWidget('overview')}
            className="flex items-center gap-1 text-[11px] font-medium text-[#5b5fc7] dark:text-[#a6a9dc] hover:underline"
          >
            <ChevronDown size={12} className="rotate-90" />
            {t('helpDesk.nav.dashboard')}
          </button>
          <span className="text-[#e1dfdd] dark:text-[#3d3d3d]">/</span>
          <span className="text-[11px] font-medium text-[#424242] dark:text-[#c8c8c8]">
            {activeWidget === 'report' && t('helpDesk.nav.report')}
            {activeWidget === 'status' && t('helpDesk.nav.status')}
            {activeWidget === 'faq' && t('helpDesk.nav.faq')}
            {activeWidget === 'chat' && t('helpDesk.nav.chat')}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        {activeWidget === 'overview' && renderOverview()}
        {activeWidget === 'report' && renderReport()}
        {activeWidget === 'status' && renderStatus()}
        {activeWidget === 'faq' && renderFaq()}
        {activeWidget === 'chat' && renderChat()}
      </div>
    </div>
  );
}

// ─── Ticket Card ───

function TicketCard({
  ticket,
  statusConfig,
  priorityConfig,
  t,
  locale,
}: {
  ticket: HelpTicket;
  statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }>;
  priorityConfig: Record<string, { color: string; icon: React.ReactNode; label: string }>;
  t: (key: string, vars?: Record<string, string | number>) => string;
  locale: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[ticket.status];
  const priority = priorityConfig[ticket.priority];
  const timeAgo = getTimeAgo(ticket.updatedAt, t, locale);

  return (
    <div className="border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-xl overflow-hidden hover:border-[#5b5fc7]/20 dark:hover:border-[#5b5fc7]/20 transition-all">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 text-left hover:bg-[#faf9f8] dark:hover:bg-[#252525] transition-colors"
      >
        <div className="flex items-start gap-2">
          <div className={cn('w-2 h-2 rounded-full mt-1 shrink-0', status.color)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-mono text-[#8a8a8a]">{ticket.id}</span>
              <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full border inline-flex items-center gap-0.5', priority.color)}>
                {priority.icon}
                {priority.label}
              </span>
            </div>
            <p className="text-[12px] font-medium text-[#242424] dark:text-[#e0e0e0] truncate">{ticket.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 text-white', status.color)}>
                {status.icon}
                {status.label}
              </span>
              <span className="text-[9px] text-[#8a8a8a]">{t('helpDesk.ticket.updated', { time: timeAgo })}</span>
            </div>
          </div>
          <ChevronDown size={14} className={cn('text-[#b9bbbe] shrink-0 transition-transform', expanded && 'rotate-180')} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              <Separator className="bg-[#e1dfdd] dark:bg-[#3d3d3d]" />
              <p className="text-[11px] text-[#616161] dark:text-[#9e9e9e] leading-relaxed">{ticket.description}</p>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-[#8a8a8a]">{t('helpDesk.ticket.category')}: <span className="text-[#424242] dark:text-[#c8c8c8] capitalize">{ticket.category}</span></span>
                {ticket.assignee && (
                  <span className="text-[#8a8a8a]">{t('helpDesk.ticket.assignee')}: <span className="text-[#5b5fc7] dark:text-[#a6a9dc]">{ticket.assignee}</span></span>
                )}
              </div>
              <div className="text-[9px] text-[#8a8a8a]">
                {t('helpDesk.ticket.created')}: {new Date(ticket.createdAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getTimeAgo(dateStr: string, t: (key: string, vars?: Record<string, string | number>) => string, locale: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return t('time.justNow');
  if (diffHrs < 24) return t('time.hoursAgo', { count: diffHrs });
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return t('time.daysAgo', { count: diffDays });
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}
