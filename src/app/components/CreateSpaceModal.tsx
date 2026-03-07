import { useState, useRef, useEffect, useMemo, forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ChevronRight, ChevronLeft, Check, Search,
  Code2, Palette, Megaphone, Headphones, Package, Layers,
  Hash, Lock, Volume2, BarChart3, Shield, Target,
  Users, ArrowRight, Clock, Send,
  Sparkles, Building2, Gauge, AlertCircle, Star, Heart,
  type LucideIcon,
} from 'lucide-react';
import { addSpaceRequest, type SpaceRequest } from '../data/spaceRequests';
import { useI18n } from '../context/I18nContext';

// ─── Types ───

interface SpaceScenario {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  channels: { name: string; type: 'text' | 'announcement' | 'private'; icon: LucideIcon }[];
  dashboards: string[];
  apps: string[];
  permissions: string;
  popular?: boolean;
}

interface ManagerUser {
  id: string;
  name: string;
  avatar: string;
  title: string;
  department: string;
  level: 'director' | 'senior-manager' | 'manager';
  status: 'online' | 'away' | 'busy' | 'offline';
}

// ─── Mock managers data ───

const MANAGERS: ManagerUser[] = [
  { id: 'user-1', name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', title: 'Engineering Manager', department: 'Engineering', level: 'manager', status: 'online' },
  { id: 'mgr-2', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', title: 'Senior Engineering Manager', department: 'Engineering', level: 'senior-manager', status: 'online' },
  { id: 'mgr-3', name: 'David Kim', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', title: 'Director of Product', department: 'Product', level: 'director', status: 'away' },
  { id: 'mgr-4', name: 'Rachel Adams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel', title: 'Design Manager', department: 'Design', level: 'manager', status: 'online' },
  { id: 'mgr-5', name: 'Marcus Webb', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus', title: 'Marketing Director', department: 'Marketing', level: 'director', status: 'busy' },
  { id: 'mgr-6', name: 'Priya Patel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', title: 'SRE Manager', department: 'Engineering', level: 'manager', status: 'online' },
  { id: 'mgr-7', name: 'Tom Fischer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom', title: 'Support Manager', department: 'Support', level: 'manager', status: 'offline' },
  { id: 'mgr-8', name: 'Lisa Nakamura', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa', title: 'Senior Product Manager', department: 'Product', level: 'senior-manager', status: 'online' },
];

const CURRENT_USER_ID = 'user-1';

// ─── Scenario templates ───

const SCENARIOS: SpaceScenario[] = [
  {
    id: 'engineering',
    name: 'Engineering Team',
    description: 'Development workspace with CI/CD, code reviews, and incident management channels.',
    icon: Code2,
    color: '#5b5fc7',
    gradient: 'from-[#5b5fc7] to-[#4a4eb5]',
    channels: [
      { name: 'announcements', type: 'announcement', icon: Volume2 },
      { name: 'general', type: 'text', icon: Hash },
      { name: 'code-reviews', type: 'text', icon: Hash },
      { name: 'deployments', type: 'text', icon: Hash },
      { name: 'incidents', type: 'text', icon: Hash },
      { name: 'architecture', type: 'private', icon: Lock },
    ],
    dashboards: ['Sprint Dashboard', 'Release Metrics', 'On-call Schedule'],
    apps: ['GitLab', 'Sentry', 'Jira', 'Grafana'],
    permissions: 'Standard engineering: Members can post, Guests read-only, restricted file downloads',
    popular: true,
  },
  {
    id: 'product',
    name: 'Product Team',
    description: 'Product planning with roadmaps, user research, and cross-functional collaboration.',
    icon: Target,
    color: '#d4820c',
    gradient: 'from-[#d4820c] to-[#b56e0a]',
    channels: [
      { name: 'announcements', type: 'announcement', icon: Volume2 },
      { name: 'general', type: 'text', icon: Hash },
      { name: 'roadmap', type: 'text', icon: Hash },
      { name: 'user-research', type: 'text', icon: Hash },
      { name: 'feature-requests', type: 'text', icon: Hash },
      { name: 'strategy', type: 'private', icon: Lock },
    ],
    dashboards: ['OKR Tracker', 'Feature Pipeline', 'User Metrics'],
    apps: ['Jira', 'Notion', 'Linear', 'Figma'],
    permissions: 'Standard product: Members can post, confidential strategy channel for leads',
  },
  {
    id: 'design',
    name: 'Design Studio',
    description: 'Creative workspace with design reviews, asset libraries, and handoff workflows.',
    icon: Palette,
    color: '#c4314b',
    gradient: 'from-[#c4314b] to-[#a52a40]',
    channels: [
      { name: 'announcements', type: 'announcement', icon: Volume2 },
      { name: 'general', type: 'text', icon: Hash },
      { name: 'design-reviews', type: 'text', icon: Hash },
      { name: 'inspiration', type: 'text', icon: Hash },
      { name: 'handoffs', type: 'text', icon: Hash },
      { name: 'design-system', type: 'private', icon: Lock },
    ],
    dashboards: ['Design Workload', 'Review Pipeline'],
    apps: ['Figma', 'Miro', 'Notion'],
    permissions: 'Creative team: Open sharing, restricted design system edits',
    popular: true,
  },
  {
    id: 'marketing',
    name: 'Marketing Hub',
    description: 'Campaign planning, content calendar, brand guidelines, and analytics.',
    icon: Megaphone,
    color: '#237b4b',
    gradient: 'from-[#237b4b] to-[#1a6038]',
    channels: [
      { name: 'announcements', type: 'announcement', icon: Volume2 },
      { name: 'general', type: 'text', icon: Hash },
      { name: 'campaigns', type: 'text', icon: Hash },
      { name: 'content', type: 'text', icon: Hash },
      { name: 'analytics', type: 'text', icon: Hash },
      { name: 'brand', type: 'private', icon: Lock },
    ],
    dashboards: ['Campaign Metrics', 'Content Calendar'],
    apps: ['Salesforce', 'Google Drive', 'Notion'],
    permissions: 'Marketing standard: Members can post, brand assets restricted',
  },
  {
    id: 'sre',
    name: 'SRE / Platform',
    description: 'Reliability engineering with monitoring, runbooks, and incident response.',
    icon: Gauge,
    color: '#9333ea',
    gradient: 'from-[#9333ea] to-[#7e22ce]',
    channels: [
      { name: 'announcements', type: 'announcement', icon: Volume2 },
      { name: 'general', type: 'text', icon: Hash },
      { name: 'alerts', type: 'text', icon: Hash },
      { name: 'incidents', type: 'text', icon: Hash },
      { name: 'runbooks', type: 'text', icon: Hash },
      { name: 'post-mortems', type: 'private', icon: Lock },
    ],
    dashboards: ['Infrastructure Health', 'SLO Dashboard', 'On-call Rotation'],
    apps: ['Grafana', 'Sentry', 'PagerDuty', 'GitLab'],
    permissions: 'SRE: Alert channels notify all, post-mortems for members only',
    popular: true,
  },
  {
    id: 'support',
    name: 'Customer Support',
    description: 'Support ticketing, escalations, knowledge base, and customer satisfaction tracking.',
    icon: Headphones,
    color: '#0284c7',
    gradient: 'from-[#0284c7] to-[#0369a1]',
    channels: [
      { name: 'announcements', type: 'announcement', icon: Volume2 },
      { name: 'general', type: 'text', icon: Hash },
      { name: 'tickets', type: 'text', icon: Hash },
      { name: 'escalations', type: 'text', icon: Hash },
      { name: 'knowledge-base', type: 'text', icon: Hash },
      { name: 'internal', type: 'private', icon: Lock },
    ],
    dashboards: ['Ticket Queue', 'CSAT Overview'],
    apps: ['Confluence', 'Jira', 'AI Assistant'],
    permissions: 'Support: Ticket channels for agents, escalations for leads',
  },
  {
    id: 'project',
    name: 'Project Space',
    description: 'Cross-functional project with milestones, deliverables, and stakeholder updates.',
    icon: Layers,
    color: '#ea580c',
    gradient: 'from-[#ea580c] to-[#c2410c]',
    channels: [
      { name: 'announcements', type: 'announcement', icon: Volume2 },
      { name: 'general', type: 'text', icon: Hash },
      { name: 'deliverables', type: 'text', icon: Hash },
      { name: 'blockers', type: 'text', icon: Hash },
      { name: 'stakeholders', type: 'private', icon: Lock },
    ],
    dashboards: ['Milestone Tracker', 'Risk Register'],
    apps: ['Jira', 'Google Drive', 'Notion', 'Linear'],
    permissions: 'Project: Stakeholder channel restricted, deliverables for all members',
  },
  {
    id: 'team',
    name: 'Team Space',
    description: 'General-purpose team hub for daily standups, async updates, and team rituals.',
    icon: Users,
    color: '#0891b2',
    gradient: 'from-[#0891b2] to-[#0e7490]',
    channels: [
      { name: 'announcements', type: 'announcement', icon: Volume2 },
      { name: 'general', type: 'text', icon: Hash },
      { name: 'standups', type: 'text', icon: Hash },
      { name: 'watercooler', type: 'text', icon: Hash },
      { name: 'feedback', type: 'text', icon: Hash },
      { name: 'leadership', type: 'private', icon: Lock },
    ],
    dashboards: ['Team Pulse', 'Availability Board', 'Weekly Retro'],
    apps: ['Notion', 'Google Calendar', 'Miro'],
    permissions: 'Team: All members can post, leadership channel restricted to managers',
    popular: true,
  },
  {
    id: 'club',
    name: 'Club Space',
    description: 'Interest-based community for hobbies, learning groups, and social activities.',
    icon: Heart,
    color: '#e11d48',
    gradient: 'from-[#e11d48] to-[#be123c]',
    channels: [
      { name: 'announcements', type: 'announcement', icon: Volume2 },
      { name: 'general', type: 'text', icon: Hash },
      { name: 'events', type: 'text', icon: Hash },
      { name: 'show-and-tell', type: 'text', icon: Hash },
      { name: 'resources', type: 'text', icon: Hash },
      { name: 'organizers', type: 'private', icon: Lock },
    ],
    dashboards: ['Event Calendar', 'Member Spotlight'],
    apps: ['Google Calendar', 'Notion'],
    permissions: 'Club: Open join, organizer-only announcements, everyone can post in other channels',
  },
  {
    id: 'custom',
    name: 'Blank Space',
    description: 'Start from scratch with just a general channel. Configure everything yourself.',
    icon: Sparkles,
    color: '#6b7280',
    gradient: 'from-[#6b7280] to-[#4b5563]',
    channels: [
      { name: 'general', type: 'text', icon: Hash },
    ],
    dashboards: [],
    apps: [],
    permissions: 'Default: Standard role-based access',
  },
];

// ─── Step indicator ───

const STEPS = [
  { id: 'scenario', label: 'Scenario' },
  { id: 'details', label: 'Details' },
  { id: 'owner', label: 'Owner' },
  { id: 'review', label: 'Review' },
];

const statusColors: Record<string, string> = {
  online: 'bg-[#237b4b]',
  away: 'bg-[#d4820c]',
  busy: 'bg-[#c4314b]',
  offline: 'bg-[#8a8a8a]',
};

const levelBadge: Record<string, { label: string; color: string }> = {
  director: { label: 'Director', color: 'bg-[#9333ea]/15 text-[#9333ea] dark:text-[#c084fc]' },
  'senior-manager': { label: 'Sr. Manager', color: 'bg-[#5b5fc7]/15 text-[#5b5fc7] dark:text-[#a6a9dc]' },
  manager: { label: 'Manager', color: 'bg-[#237b4b]/15 text-[#237b4b] dark:text-[#4ade80]' },
};

// ─── Main Modal Component ───

export const CreateSpaceModal = forwardRef<HTMLDivElement, { onClose: () => void }>(
  function CreateSpaceModal({ onClose }, ref) {
    const { t } = useI18n();
    const [step, setStep] = useState(0);
    const [selectedScenario, setSelectedScenario] = useState<SpaceScenario | null>(null);
    const [spaceName, setSpaceName] = useState('');
    const [spaceDescription, setSpaceDescription] = useState('');
    const [selectedOwner, setSelectedOwner] = useState<ManagerUser | null>(
      MANAGERS.find(m => m.id === CURRENT_USER_ID) || null
    );
    const [ownerSearch, setOwnerSearch] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
    const nameInputRef = useRef<HTMLInputElement>(null);
    const ownerSearchRef = useRef<HTMLInputElement>(null);

    const isCurrentUserOwner = selectedOwner?.id === CURRENT_USER_ID;

    // Auto-focus inputs per step
    useEffect(() => {
      if (step === 1) setTimeout(() => nameInputRef.current?.focus(), 200);
      if (step === 2) setTimeout(() => ownerSearchRef.current?.focus(), 200);
    }, [step]);

    // Pre-fill name from scenario
    useEffect(() => {
      if (selectedScenario && !spaceName) {
        setSpaceName(selectedScenario.id === 'custom' ? '' : selectedScenario.name);
      }
    }, [selectedScenario]);

    const canProceed = useMemo(() => {
      switch (step) {
        case 0: return !!selectedScenario;
        case 1: return spaceName.trim().length >= 2;
        case 2: return !!selectedOwner;
        case 3: return true;
        default: return false;
      }
    }, [step, selectedScenario, spaceName, selectedOwner]);

    const goNext = () => {
      if (canProceed && step < 3) {
        setDirection(1);
        setStep(s => s + 1);
      }
    };

    const goBack = () => {
      if (step > 0) {
        setDirection(-1);
        setStep(s => s - 1);
      }
    };

    const handleSubmit = () => {
      if (!selectedScenario || !selectedOwner) return;
      const now = new Date().toISOString();
      const request: SpaceRequest = {
        id: `sr-${Date.now()}`,
        spaceName,
        spaceDescription,
        scenarioId: selectedScenario.id,
        scenarioName: selectedScenario.name,
        scenarioColor: selectedScenario.color,
        scenarioGradient: selectedScenario.gradient,
        channelCount: selectedScenario.channels.length,
        dashboardCount: selectedScenario.dashboards.length,
        appCount: selectedScenario.apps.length,
        channels: selectedScenario.channels.map(ch => `#${ch.name}`),
        dashboards: selectedScenario.dashboards,
        apps: selectedScenario.apps,
        permissions: selectedScenario.permissions,
        ownerId: selectedOwner.id,
        ownerName: selectedOwner.name,
        ownerAvatar: selectedOwner.avatar,
        ownerTitle: selectedOwner.title,
        requesterId: CURRENT_USER_ID,
        requesterName: 'John Doe',
        requesterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        status: isCurrentUserOwner ? 'pending-admin' : 'pending-owner',
        createdAt: now,
        updatedAt: now,
      };
      addSpaceRequest(request);
      setSubmitted(true);
    };

    const filteredManagers = useMemo(() => {
      if (!ownerSearch.trim()) return MANAGERS;
      const q = ownerSearch.toLowerCase();
      return MANAGERS.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q)
      );
    }, [ownerSearch]);

    // Slide animation variants
    const slideVariants = {
      enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
      center: { x: 0, opacity: 1 },
      exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 24 }}
          transition={{ type: 'spring', damping: 28, stiffness: 380 }}
          onClick={e => e.stopPropagation()}
          className="w-[780px] h-[88vh] bg-white dark:bg-[#2b2d31] rounded-2xl border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* ─── Success state ─── */}
          <AnimatePresence>
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 px-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                  className="w-16 h-16 rounded-2xl bg-[#237b4b]/10 flex items-center justify-center mb-5"
                >
                  <Check size={32} className="text-[#237b4b]" />
                </motion.div>
                <h2 className="text-[20px] font-bold text-[#242424] dark:text-[#f0f0f0] mb-2">{t('createSpace.requestSubmitted')}</h2>
                <p className="text-[13px] text-[#616161] dark:text-[#999] max-w-[400px] mb-2">
                  Your request to create <strong className="text-[#242424] dark:text-[#f0f0f0]">{spaceName}</strong> has been submitted for approval.
                </p>

                {/* Approval workflow */}
                <div className="mt-5 mb-8 flex items-center gap-2">
                  {/* Step 1: Requester */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-[#237b4b] flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                    <span className="text-[9px] text-[#237b4b] font-semibold">{t('inbox.submitted')}</span>
                  </div>
                  <ArrowRight size={14} className="text-[#ccc] dark:text-[#555] mt-[-14px]" />

                  {!isCurrentUserOwner && (
                    <>
                      {/* Step 2: Owner approval */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-[#d4820c]/15 border-2 border-[#d4820c] flex items-center justify-center">
                          <Clock size={12} className="text-[#d4820c]" />
                        </div>
                        <span className="text-[9px] text-[#d4820c] font-semibold">{t('createSpace.owner')}</span>
                      </div>
                      <ArrowRight size={14} className="text-[#ccc] dark:text-[#555] mt-[-14px]" />
                    </>
                  )}

                  {/* Step 3: Admin approval */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-[#e1dfdd] dark:bg-[#3d3d3d] flex items-center justify-center">
                      <Shield size={12} className="text-[#999]" />
                    </div>
                    <span className="text-[9px] text-[#999] font-semibold">{t('createSpace.admin')}</span>
                  </div>
                  <ArrowRight size={14} className="text-[#ccc] dark:text-[#555] mt-[-14px]" />

                  {/* Step 4: Created */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-[#e1dfdd] dark:bg-[#3d3d3d] flex items-center justify-center">
                      <Sparkles size={12} className="text-[#999]" />
                    </div>
                    <span className="text-[9px] text-[#999] font-semibold">{t('createSpace.created')}</span>
                  </div>
                </div>

                {!isCurrentUserOwner && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#d4820c]/8 border border-[#d4820c]/20 mb-6">
                    <AlertCircle size={14} className="text-[#d4820c] shrink-0" />
                    <p className="text-[11px] text-[#d4820c]">
                      <strong>{selectedOwner?.name}</strong> will be notified to approve your request before it reaches an admin.
                    </p>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#5b5fc7] hover:bg-[#4a4eb5] text-white text-[13px] font-semibold rounded-lg transition-colors"
                >
                  {t('tasks.status.done')}
                </button>
              </motion.div>
            ) : (
              <>
                {/* ─── Header ─── */}
                <div className="shrink-0 px-6 pt-5 pb-4 border-b border-[#e1dfdd] dark:border-[#3d3d3d]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5b5fc7] to-[#7b4db8] flex items-center justify-center">
                        <Building2 size={18} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-[16px] font-bold text-[#242424] dark:text-[#f0f0f0]">{t('createSpace.requestNewSpace')}</h2>
                        <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a]">{t('createSpace.approvalRequired')}</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg text-[#616161] dark:text-[#999] hover:bg-[#f0f0f0] dark:hover:bg-[#333] transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Step indicator */}
                  <div className="flex items-center gap-1">
                    {STEPS.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-1 flex-1">
                        <div className="flex items-center gap-2 flex-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                            i < step
                              ? 'bg-[#237b4b] text-white'
                              : i === step
                                ? 'bg-[#5b5fc7] text-white shadow-sm shadow-[#5b5fc7]/30'
                                : 'bg-[#e8e8e8] dark:bg-[#3d3d3d] text-[#999]'
                          }`}>
                            {i < step ? <Check size={12} /> : i + 1}
                          </div>
                          <span className={`text-[11px] font-medium transition-colors ${
                            i <= step ? 'text-[#242424] dark:text-[#f0f0f0]' : 'text-[#999] dark:text-[#666]'
                          }`}>{s.label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`h-[2px] w-6 rounded-full mx-1 shrink-0 transition-colors ${
                            i < step ? 'bg-[#237b4b]' : 'bg-[#e1dfdd] dark:bg-[#3d3d3d]'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ─── Body ─── */}
                <div className="flex-1 overflow-hidden relative min-h-0" style={{ minHeight: 300 }}>
                  <AnimatePresence mode="wait" custom={direction}>
                    {step === 0 && (
                      <motion.div
                        key="step-0"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 overflow-y-auto p-6"
                      >
                        <ScenarioStep
                          selected={selectedScenario}
                          onSelect={s => { setSelectedScenario(s); }}
                        />
                      </motion.div>
                    )}
                    {step === 1 && (
                      <motion.div
                        key="step-1"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 overflow-y-auto p-6"
                      >
                        <DetailsStep
                          name={spaceName}
                          onNameChange={setSpaceName}
                          description={spaceDescription}
                          onDescriptionChange={setSpaceDescription}
                          scenario={selectedScenario}
                          nameRef={nameInputRef}
                        />
                      </motion.div>
                    )}
                    {step === 2 && (
                      <motion.div
                        key="step-2"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 overflow-y-auto p-6"
                      >
                        <OwnerStep
                          selected={selectedOwner}
                          onSelect={setSelectedOwner}
                          search={ownerSearch}
                          onSearchChange={setOwnerSearch}
                          managers={filteredManagers}
                          searchRef={ownerSearchRef}
                        />
                      </motion.div>
                    )}
                    {step === 3 && (
                      <motion.div
                        key="step-3"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 overflow-y-auto p-6"
                      >
                        <ReviewStep
                          scenario={selectedScenario!}
                          name={spaceName}
                          description={spaceDescription}
                          owner={selectedOwner!}
                          isCurrentUserOwner={isCurrentUserOwner}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ─── Footer ─── */}
                <div className="shrink-0 px-6 py-4 border-t border-[#e1dfdd] dark:border-[#3d3d3d] flex items-center justify-between bg-[#faf9f8] dark:bg-[#252525]">
                  <button
                    onClick={step === 0 ? onClose : goBack}
                    className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-[#616161] dark:text-[#999] hover:text-[#242424] dark:hover:text-[#f0f0f0] hover:bg-[#f0f0f0] dark:hover:bg-[#333] rounded-lg transition-colors"
                  >
                    <ChevronLeft size={14} />
                    {step === 0 ? 'Cancel' : 'Back'}
                  </button>

                  {step < 3 ? (
                    <button
                      onClick={goNext}
                      disabled={!canProceed}
                      className="flex items-center gap-1.5 px-5 py-2 bg-[#5b5fc7] hover:bg-[#4a4eb5] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-lg transition-colors"
                    >
                      Continue
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8] hover:from-[#4a4eb5] hover:to-[#6a3fa7] text-white text-[13px] font-semibold rounded-lg transition-all shadow-sm"
                    >
                      <Send size={14} />
                      Submit Request
                    </button>
                  )}
                </div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  }
);

// ─── Scenario Thumbnail Preview ───
// A mini wireframe showing what the space will look like

const THUMBNAIL_LAYOUTS: Record<string, {
  sidebarItems: string[];
  contentType: 'chat' | 'dashboard' | 'kanban' | 'list' | 'calendar' | 'empty';
  widgetCount?: number;
}> = {
  engineering:  { sidebarItems: ['ann', 'gen', 'code', 'deploy', 'inc'], contentType: 'dashboard', widgetCount: 3 },
  product:     { sidebarItems: ['ann', 'gen', 'road', 'research', 'feat'], contentType: 'kanban' },
  design:      { sidebarItems: ['ann', 'gen', 'review', 'insp', 'hand'], contentType: 'dashboard', widgetCount: 2 },
  marketing:   { sidebarItems: ['ann', 'gen', 'camp', 'cont', 'anly'], contentType: 'calendar' },
  sre:         { sidebarItems: ['ann', 'gen', 'alert', 'inc', 'run'], contentType: 'dashboard', widgetCount: 3 },
  support:     { sidebarItems: ['ann', 'gen', 'tick', 'esc', 'kb'], contentType: 'list' },
  project:     { sidebarItems: ['ann', 'gen', 'deliv', 'block', 'stake'], contentType: 'kanban' },
  team:        { sidebarItems: ['ann', 'gen', 'stand', 'water', 'feed'], contentType: 'chat' },
  club:        { sidebarItems: ['ann', 'gen', 'events', 'show', 'res'], contentType: 'calendar' },
  custom:      { sidebarItems: ['gen'], contentType: 'empty' },
};

function ScenarioThumbnail({ scenario }: { scenario: SpaceScenario }) {
  const layout = THUMBNAIL_LAYOUTS[scenario.id] || THUMBNAIL_LAYOUTS.custom;
  const color = scenario.color;

  return (
    <div className="w-full h-[72px] rounded-lg overflow-hidden bg-[#f8f8f8] dark:bg-[#1a1a1a] border border-[#e8e8e8] dark:border-[#333] flex">
      {/* Mini sidebar */}
      <div className="w-[38px] bg-[#f0f0f0] dark:bg-[#222] border-r border-[#e1dfdd] dark:border-[#333] flex flex-col pt-1.5 px-1 gap-[3px] shrink-0">
        {/* Space icon */}
        <div
          className="w-full aspect-square rounded-[3px] mb-0.5 flex items-center justify-center"
          style={{ background: color }}
        >
          <scenario.icon size={8} className="text-white" />
        </div>
        {/* Channel dots */}
        {layout.sidebarItems.map((_, i) => (
          <div key={i} className="flex items-center gap-[2px] px-0.5">
            <div
              className="w-[3px] h-[3px] rounded-[1px] shrink-0"
              style={{ background: i === 1 ? color : '#ccc' }}
            />
            <div
              className="h-[2px] rounded-full flex-1"
              style={{
                background: i === 1 ? `${color}40` : '#e1dfdd',
              }}
            />
          </div>
        ))}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header bar */}
        <div className="h-[14px] border-b border-[#e8e8e8] dark:border-[#333] flex items-center px-1.5 gap-1 shrink-0">
          <div
            className="w-[4px] h-[4px] rounded-[1px]"
            style={{ background: color }}
          />
          <div className="h-[2px] w-[28px] rounded-full bg-[#d1d1d1] dark:bg-[#444]" />
        </div>

        {/* Content */}
        <div className="flex-1 p-1.5 overflow-hidden">
          {layout.contentType === 'chat' && (
            <div className="flex flex-col gap-[4px]">
              {[0.75, 0.5, 0.85, 0.4].map((w, i) => (
                <div key={i} className="flex items-start gap-[3px]">
                  <div
                    className="w-[6px] h-[6px] rounded-full shrink-0"
                    style={{ background: i === 0 ? color : i === 2 ? '#d4820c' : '#ccc' }}
                  />
                  <div className="flex flex-col gap-[1px]">
                    <div
                      className="h-[2px] rounded-full"
                      style={{ width: `${w * 100}%`, minWidth: 16, background: '#d9d9d9' }}
                    />
                    <div
                      className="h-[2px] rounded-full"
                      style={{ width: `${w * 60}%`, minWidth: 10, background: '#e8e8e8' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {layout.contentType === 'dashboard' && (
            <div className="grid grid-cols-3 gap-[3px] h-full">
              {Array.from({ length: layout.widgetCount || 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[2px] border flex flex-col items-center justify-center"
                  style={{
                    borderColor: i === 0 ? `${color}40` : '#e1dfdd',
                    background: i === 0 ? `${color}08` : 'transparent',
                  }}
                >
                  <div
                    className="w-[10px] h-[10px] rounded-[2px] mb-[2px]"
                    style={{ background: i === 0 ? `${color}30` : '#eee' }}
                  />
                  <div className="h-[2px] w-[16px] rounded-full bg-[#e1dfdd]" />
                </div>
              ))}
            </div>
          )}

          {layout.contentType === 'kanban' && (
            <div className="flex gap-[3px] h-full">
              {['To Do', 'In Prog', 'Done'].map((_, col) => (
                <div key={col} className="flex-1 flex flex-col gap-[2px]">
                  <div
                    className="h-[2px] rounded-full mb-[1px]"
                    style={{ background: col === 0 ? color : col === 1 ? '#d4820c' : '#237b4b' }}
                  />
                  {Array.from({ length: col === 1 ? 3 : 2 }).map((_, j) => (
                    <div
                      key={j}
                      className="h-[8px] rounded-[1px] border border-[#e1dfdd] dark:border-[#3d3d3d]"
                      style={{ background: j === 0 && col === 0 ? `${color}08` : 'transparent' }}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {layout.contentType === 'list' && (
            <div className="flex flex-col gap-[3px]">
              {[0.9, 0.7, 0.8, 0.6, 0.75].map((w, i) => (
                <div key={i} className="flex items-center gap-[3px]">
                  <div
                    className="w-[4px] h-[4px] rounded-[1px] shrink-0"
                    style={{
                      background: i === 0 ? '#c4314b' : i === 1 ? '#d4820c' : i === 2 ? color : '#237b4b',
                    }}
                  />
                  <div
                    className="h-[2px] rounded-full"
                    style={{ width: `${w * 100}%`, background: '#d9d9d9' }}
                  />
                </div>
              ))}
            </div>
          )}

          {layout.contentType === 'calendar' && (
            <div className="h-full">
              <div className="grid grid-cols-5 gap-[2px]">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-[1px]"
                    style={{
                      background: i === 3 || i === 7 ? `${color}25` :
                                  i === 11 ? `${color}15` :
                                  '#f0f0f0',
                      border: i === 3 ? `1px solid ${color}50` : '1px solid transparent',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {layout.contentType === 'empty' && (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-[2px]">
                <Sparkles size={10} className="text-[#ccc] dark:text-[#555]" />
                <div className="h-[2px] w-[20px] rounded-full bg-[#e1dfdd]" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Scenario Selection ───

function ScenarioStep({
  selected,
  onSelect,
}: {
  selected: SpaceScenario | null;
  onSelect: (s: SpaceScenario) => void;
}) {
  const { t } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      <h3 className="text-[14px] font-bold text-[#242424] dark:text-[#f0f0f0] mb-1">{t('createSpace.chooseScenario')}</h3>
      <p className="text-[12px] text-[#616161] dark:text-[#8a8a8a] mb-5">
        Each scenario is a pre-configured template with channels, dashboards, apps, and permission settings.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {SCENARIOS.map(s => {
          const isSelected = selected?.id === s.id;
          const isExpanded = expandedId === s.id;
          return (
            <motion.div
              key={s.id}
              className={`relative rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
                isSelected
                  ? 'border-[#5b5fc7] dark:border-[#5b5fc7] shadow-md shadow-[#5b5fc7]/10'
                  : 'border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#c7c7c7] dark:hover:border-[#555]'
              }`}
              onClick={() => onSelect(s)}
            >
              {/* Popular badge */}
              {s.popular && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#d4820c]/10 text-[#d4820c] text-[8px] font-bold uppercase tracking-wider">
                    <Star size={7} className="fill-current" /> Popular
                  </span>
                </div>
              )}

              {/* Selected check */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 left-2 z-10 w-5 h-5 rounded-full bg-[#5b5fc7] flex items-center justify-center"
                >
                  <Check size={11} className="text-white" />
                </motion.div>
              )}

              <div className="p-3.5">
                {/* Thumbnail preview */}
                <div className="mb-3">
                  <ScenarioThumbnail scenario={s} />
                </div>

                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center shrink-0`}>
                    <s.icon size={16} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-[#242424] dark:text-[#f0f0f0] truncate">{s.name}</p>
                    <p className="text-[9px] text-[#999] dark:text-[#666] line-clamp-2 leading-[1.3]">{s.description}</p>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="flex items-center gap-3 text-[10px] text-[#999] dark:text-[#666]">
                  <span className="flex items-center gap-1"><Hash size={9} />{s.channels.length}</span>
                  <span className="flex items-center gap-1"><BarChart3 size={9} />{s.dashboards.length}</span>
                  <span className="flex items-center gap-1"><Package size={9} />{s.apps.length}</span>
                </div>

                {/* Expand/collapse detail */}
                <button
                  onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : s.id); }}
                  className="mt-2 text-[10px] font-semibold text-[#5b5fc7] dark:text-[#a6a9dc] hover:underline flex items-center gap-0.5"
                >
                  {isExpanded ? 'Hide details' : 'View details'}
                  <ChevronRight size={10} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t border-[#e8e8e8] dark:border-[#3d3d3d] space-y-2.5">
                        {/* Channels */}
                        <div>
                          <p className="text-[9px] font-bold text-[#999] uppercase tracking-wider mb-1.5">{t('channel.channels')}</p>
                          <div className="flex flex-wrap gap-1">
                            {s.channels.map(ch => (
                              <span key={ch.name} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#f5f5f5] dark:bg-[#333] text-[9px] text-[#616161] dark:text-[#999]">
                                <ch.icon size={8} />#{ch.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        {/* Dashboards */}
                        {s.dashboards.length > 0 && (
                          <div>
                            <p className="text-[9px] font-bold text-[#999] uppercase tracking-wider mb-1.5">{t('createSpace.dashboards')}</p>
                            <div className="flex flex-wrap gap-1">
                              {s.dashboards.map(d => (
                                <span key={d} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#5b5fc7]/8 text-[9px] text-[#5b5fc7] dark:text-[#a6a9dc]">
                                  <BarChart3 size={8} />{d}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Apps */}
                        {s.apps.length > 0 && (
                          <div>
                            <p className="text-[9px] font-bold text-[#999] uppercase tracking-wider mb-1.5">{t('common.apps')}</p>
                            <div className="flex flex-wrap gap-1">
                              {s.apps.map(a => (
                                <span key={a} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#237b4b]/8 text-[9px] text-[#237b4b] dark:text-[#4ade80]">
                                  <Package size={8} />{a}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Permissions */}
                        <div>
                          <p className="text-[9px] font-bold text-[#999] uppercase tracking-wider mb-1">{t('spaceApps.permissions')}</p>
                          <p className="text-[10px] text-[#616161] dark:text-[#8a8a8a] flex items-start gap-1">
                            <Shield size={9} className="shrink-0 mt-0.5" />{s.permissions}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: Space Details ───

function DetailsStep({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  scenario,
  nameRef,
}: {
  name: string;
  onNameChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  scenario: SpaceScenario | null;
  nameRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { t } = useI18n();
  const charCount = name.length;
  const maxChars = 50;

  return (
    <div>
      <h3 className="text-[14px] font-bold text-[#242424] dark:text-[#f0f0f0] mb-1">{t('createSpace.spaceDetails')}</h3>
      <p className="text-[12px] text-[#616161] dark:text-[#8a8a8a] mb-6">
        Give your space a name and description. You can change these later.
      </p>

      {/* Scenario preview chip */}
      {scenario && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e8e8e8] dark:border-[#3d3d3d] mb-6">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${scenario.gradient} flex items-center justify-center`}>
            <scenario.icon size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{t('createSpace.scenarioSummary', { name: scenario.name })}</p>
            <p className="text-[10px] text-[#999] dark:text-[#666]">
              {scenario.channels.length} channels, {scenario.dashboards.length} dashboards, {scenario.apps.length} apps
            </p>
          </div>
        </div>
      )}

      {/* Name field */}
      <div className="mb-5">
        <label className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-semibold text-[#242424] dark:text-[#f0f0f0]">
            {t('createSpace.spaceName')} <span className="text-[#c4314b]">*</span>
          </span>
          <span className={`text-[10px] ${charCount > maxChars ? 'text-[#c4314b]' : 'text-[#999]'}`}>
            {charCount}/{maxChars}
          </span>
        </label>
        <input
          ref={nameRef}
          type="text"
          value={name}
          onChange={e => onNameChange(e.target.value.slice(0, maxChars))}
          placeholder={t('createSpace.spaceNameExample')}
          className="w-full px-4 py-2.5 rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#1e1f22] text-[13px] text-[#242424] dark:text-[#f0f0f0] placeholder-[#c0c0c0] dark:placeholder-[#555] outline-none focus:border-[#5b5fc7] focus:ring-2 focus:ring-[#5b5fc7]/15 transition-all"
        />
        {name.trim().length > 0 && name.trim().length < 2 && (
          <p className="mt-1 text-[10px] text-[#c4314b]">{t('createSpace.nameTooShort')}</p>
        )}
      </div>

      {/* Description field */}
      <div className="mb-5">
        <label className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{t('dashboardEditor.field.description')}</span>
          <span className="text-[10px] text-[#999]">{t('createSpace.optional')}</span>
        </label>
        <textarea
          value={description}
          onChange={e => onDescriptionChange(e.target.value.slice(0, 300))}
          placeholder={t('createSpace.descriptionPlaceholder')}
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#1e1f22] text-[13px] text-[#242424] dark:text-[#f0f0f0] placeholder-[#c0c0c0] dark:placeholder-[#555] outline-none focus:border-[#5b5fc7] focus:ring-2 focus:ring-[#5b5fc7]/15 transition-all resize-none"
        />
        <p className="mt-1 text-[10px] text-[#999] text-right">{description.length}/300</p>
      </div>

      {/* Preview card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-[#faf9f8] to-[#f5f5f5] dark:from-[#1e1f22] dark:to-[#252525] border border-[#e8e8e8] dark:border-[#3d3d3d]">
        <p className="text-[9px] font-bold text-[#999] uppercase tracking-wider mb-3">{t('common.preview')}</p>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${scenario?.gradient || 'from-[#6b7280] to-[#4b5563]'} flex items-center justify-center`}>
            {scenario ? <scenario.icon size={24} className="text-white" /> : <Building2 size={24} className="text-white" />}
          </div>
          <div>
            <p className="text-[14px] font-bold text-[#242424] dark:text-[#f0f0f0]">
              {name || t('createSpace.untitledSpace')}
            </p>
            <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a]">
              {description || t('createSpace.noDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Owner Selection ───

function OwnerStep({
  selected,
  onSelect,
  search,
  onSearchChange,
  managers,
  searchRef,
}: {
  selected: ManagerUser | null;
  onSelect: (m: ManagerUser) => void;
  search: string;
  onSearchChange: (v: string) => void;
  managers: ManagerUser[];
  searchRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { t } = useI18n();
  const isCurrentUserOwner = selected?.id === CURRENT_USER_ID;

  return (
    <div>
      <h3 className="text-[14px] font-bold text-[#242424] dark:text-[#f0f0f0] mb-1">{t('createSpace.selectOwner')}</h3>
      <p className="text-[12px] text-[#616161] dark:text-[#8a8a8a] mb-2">
        Every space must have exactly one owner. Owners must be at least a manager.
      </p>

      {/* Info banner about approval */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#5b5fc7]/6 border border-[#5b5fc7]/15 mb-5">
        <AlertCircle size={14} className="text-[#5b5fc7] shrink-0 mt-0.5" />
        <div className="text-[11px] text-[#616161] dark:text-[#999]">
          <p className="font-semibold text-[#5b5fc7] dark:text-[#a6a9dc] mb-0.5">{t('createSpace.approvalWorkflow')}</p>
          <p>{t('createSpace.approvalWorkflowDesc')}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={t('createSpace.searchManagers')}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#1e1f22] text-[13px] text-[#242424] dark:text-[#f0f0f0] placeholder-[#c0c0c0] dark:placeholder-[#555] outline-none focus:border-[#5b5fc7] focus:ring-2 focus:ring-[#5b5fc7]/15 transition-all"
        />
      </div>

      {/* Manager list */}
      <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
        {managers.map(m => {
          const isSelected = selected?.id === m.id;
          const isSelf = m.id === CURRENT_USER_ID;
          const badge = levelBadge[m.level];
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                isSelected
                  ? 'bg-[#5b5fc7]/8 border-2 border-[#5b5fc7] dark:border-[#5b5fc7]'
                  : 'bg-white dark:bg-[#252525] border-2 border-transparent hover:bg-[#f5f5f5] dark:hover:bg-[#2f2f2f]'
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full bg-[#e8e8e8]" />
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#252525] ${statusColors[m.status]}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0] truncate">{m.name}</p>
                  {isSelf && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-[#5b5fc7]/10 text-[#5b5fc7] uppercase tracking-wider">{t('common.you')}</span>
                  )}
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a] truncate">{m.title} &middot; {m.department}</p>
              </div>

              {/* Check */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-[#5b5fc7] flex items-center justify-center shrink-0"
                >
                  <Check size={12} className="text-white" />
                </motion.div>
              )}
            </button>
          );
        })}

        {managers.length === 0 && (
          <div className="text-center py-8">
            <Search size={24} className="text-[#ccc] dark:text-[#555] mx-auto mb-2" />
            <p className="text-[12px] text-[#999]">{t('createSpace.noManagersFound')}</p>
          </div>
        )}
      </div>

      {/* Approval route preview */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 px-4 py-3 rounded-xl bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e8e8e8] dark:border-[#3d3d3d]"
        >
          <p className="text-[9px] font-bold text-[#999] uppercase tracking-wider mb-2">{t('createSpace.approvalRoute')}</p>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-1 rounded bg-[#237b4b]/10 text-[#237b4b] font-semibold">{t('createSpace.youSubmit')}</span>
            <ArrowRight size={12} className="text-[#ccc]" />
            {!isCurrentUserOwner && (
              <>
                <span className="px-2 py-1 rounded bg-[#d4820c]/10 text-[#d4820c] font-semibold flex items-center gap-1">
                  <img src={selected.avatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                  {selected.name.split(' ')[0]} approves
                </span>
                <ArrowRight size={12} className="text-[#ccc]" />
              </>
            )}
            <span className="px-2 py-1 rounded bg-[#5b5fc7]/10 text-[#5b5fc7] font-semibold">{t('createSpace.adminApproves')}</span>
            <ArrowRight size={12} className="text-[#ccc]" />
            <span className="px-2 py-1 rounded bg-[#e8e8e8] dark:bg-[#3d3d3d] text-[#616161] dark:text-[#999] font-semibold">{t('createSpace.spaceCreated')}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Step 4: Review & Submit ───

function ReviewStep({
  scenario,
  name,
  description,
  owner,
  isCurrentUserOwner,
}: {
  scenario: SpaceScenario;
  name: string;
  description: string;
  owner: ManagerUser;
  isCurrentUserOwner: boolean;
}) {
  const { t } = useI18n();
  return (
    <div>
      <h3 className="text-[14px] font-bold text-[#242424] dark:text-[#f0f0f0] mb-1">{t('createSpace.reviewRequest')}</h3>
      <p className="text-[12px] text-[#616161] dark:text-[#8a8a8a] mb-5">
        Please review the details below before submitting your space request.
      </p>

      {/* Space card */}
      <div className="rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden mb-5">
        {/* Banner */}
        <div className={`h-16 bg-gradient-to-r ${scenario.gradient} flex items-end px-4 pb-2`}>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center -mb-3 border-2 border-white/30">
              <scenario.icon size={20} className="text-white" />
            </div>
          </div>
        </div>
        <div className="px-4 pt-5 pb-4">
          <h4 className="text-[16px] font-bold text-[#242424] dark:text-[#f0f0f0] mb-0.5">{name}</h4>
          <p className="text-[12px] text-[#616161] dark:text-[#8a8a8a] mb-4">
            {description || 'No description provided'}
          </p>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Scenario */}
            <div className="p-3 rounded-lg bg-[#faf9f8] dark:bg-[#1e1f22]">
              <p className="text-[9px] font-bold text-[#999] uppercase tracking-wider mb-2">{t('createSpace.scenario')}</p>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded bg-gradient-to-br ${scenario.gradient} flex items-center justify-center`}>
                  <scenario.icon size={12} className="text-white" />
                </div>
                <span className="text-[12px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{scenario.name}</span>
              </div>
            </div>

            {/* Owner */}
            <div className="p-3 rounded-lg bg-[#faf9f8] dark:bg-[#1e1f22]">
              <p className="text-[9px] font-bold text-[#999] uppercase tracking-wider mb-2">{t('createSpace.owner')}</p>
              <div className="flex items-center gap-2">
                <img src={owner.avatar} alt={owner.name} className="w-6 h-6 rounded-full" />
                <div>
                  <span className="text-[12px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{owner.name}</span>
                  {isCurrentUserOwner && (
                    <span className="text-[8px] font-bold ml-1 px-1 py-0.5 rounded bg-[#5b5fc7]/10 text-[#5b5fc7]">{t('common.you')}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Included items */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {/* Channels */}
        <div className="p-3 rounded-xl bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e8e8e8] dark:border-[#3d3d3d]">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Hash size={12} className="text-[#5b5fc7]" />
            <p className="text-[10px] font-bold text-[#999] uppercase tracking-wider">{scenario.channels.length} Channels</p>
          </div>
          <div className="space-y-1">
            {scenario.channels.map(ch => (
              <div key={ch.name} className="flex items-center gap-1.5 text-[11px] text-[#616161] dark:text-[#8a8a8a]">
                <ch.icon size={9} />
                <span className="truncate">#{ch.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboards */}
        <div className="p-3 rounded-xl bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e8e8e8] dark:border-[#3d3d3d]">
          <div className="flex items-center gap-1.5 mb-2.5">
            <BarChart3 size={12} className="text-[#5b5fc7]" />
            <p className="text-[10px] font-bold text-[#999] uppercase tracking-wider">{scenario.dashboards.length} Dashboards</p>
          </div>
          <div className="space-y-1">
            {scenario.dashboards.length > 0 ? scenario.dashboards.map(d => (
              <div key={d} className="text-[11px] text-[#616161] dark:text-[#8a8a8a] truncate">{d}</div>
            )) : (
              <p className="text-[10px] text-[#ccc] dark:text-[#555] italic">{t('createSpace.noneConfigureLater')}</p>
            )}
          </div>
        </div>

        {/* Apps */}
        <div className="p-3 rounded-xl bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e8e8e8] dark:border-[#3d3d3d]">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Package size={12} className="text-[#5b5fc7]" />
            <p className="text-[10px] font-bold text-[#999] uppercase tracking-wider">{scenario.apps.length} Apps</p>
          </div>
          <div className="space-y-1">
            {scenario.apps.length > 0 ? scenario.apps.map(a => (
              <div key={a} className="text-[11px] text-[#616161] dark:text-[#8a8a8a] truncate">{a}</div>
            )) : (
              <p className="text-[10px] text-[#ccc] dark:text-[#555] italic">{t('createSpace.noneAddLater')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Permissions summary */}
      <div className="p-3 rounded-xl bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e8e8e8] dark:border-[#3d3d3d] mb-5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Shield size={12} className="text-[#5b5fc7]" />
          <p className="text-[10px] font-bold text-[#999] uppercase tracking-wider">{t('spaceApps.permissions')}</p>
        </div>
        <p className="text-[11px] text-[#616161] dark:text-[#8a8a8a]">{scenario.permissions}</p>
      </div>

      {/* Approval workflow */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#5b5fc7]/5 to-[#7b4db8]/5 border border-[#5b5fc7]/15">
        <p className="text-[10px] font-bold text-[#5b5fc7] dark:text-[#a6a9dc] uppercase tracking-wider mb-3">{t('createSpace.approvalWorkflow')}</p>
        <div className="flex items-center gap-3">
          {/* You */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d]">
            <div className="w-6 h-6 rounded-full bg-[#237b4b]/10 flex items-center justify-center">
              <Send size={10} className="text-[#237b4b]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{t('common.you')}</p>
              <p className="text-[8px] text-[#999]">{t('inbox.submit')}</p>
            </div>
          </div>

          <ArrowRight size={14} className="text-[#5b5fc7]/40 shrink-0" />

          {!isCurrentUserOwner && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#252525] border border-[#d4820c]/30">
                <img src={owner.avatar} alt={owner.name} className="w-6 h-6 rounded-full" />
                <div>
                  <p className="text-[10px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{owner.name.split(' ')[0]}</p>
                  <p className="text-[8px] text-[#d4820c] font-semibold">{t('createSpace.ownerApproval')}</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-[#5b5fc7]/40 shrink-0" />
            </>
          )}

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d]">
            <div className="w-6 h-6 rounded-full bg-[#5b5fc7]/10 flex items-center justify-center">
              <Shield size={10} className="text-[#5b5fc7]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{t('createSpace.admin')}</p>
              <p className="text-[8px] text-[#999]">{t('createSpace.finalApproval')}</p>
            </div>
          </div>

          <ArrowRight size={14} className="text-[#5b5fc7]/40 shrink-0" />

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#237b4b]/5 border border-[#237b4b]/20">
            <div className="w-6 h-6 rounded-full bg-[#237b4b]/10 flex items-center justify-center">
              <Sparkles size={10} className="text-[#237b4b]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#237b4b]">{t('createSpace.created')}</p>
              <p className="text-[8px] text-[#999]">{t('createSpace.spaceIsLive')}</p>
            </div>
          </div>
        </div>

        {!isCurrentUserOwner && (
          <p className="mt-3 text-[10px] text-[#616161] dark:text-[#8a8a8a] flex items-center gap-1.5">
            <Clock size={10} className="text-[#d4820c]" />
            <strong className="text-[#d4820c]">{owner.name}</strong> will receive a notification to approve this request.
          </p>
        )}
      </div>
    </div>
  );
}
