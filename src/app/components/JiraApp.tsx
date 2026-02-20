import { useState } from 'react';
import {
  ChevronDown, ChevronRight, Search, Plus, ExternalLink,
  MoreHorizontal, CheckCircle2, Clock, AlertTriangle,
  ArrowUp, ArrowDown, Minus, Filter, Users, Tag,
  MessageSquare, Paperclip, Calendar, BarChart3,
  ArrowRight, Zap, Target, Flag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from "@/lib/utils";

// ─── Types ───

interface JiraIssue {
  key: string;
  summary: string;
  type: 'story' | 'bug' | 'task' | 'epic' | 'subtask';
  status: 'to-do' | 'in-progress' | 'in-review' | 'done';
  priority: 'highest' | 'high' | 'medium' | 'low' | 'lowest';
  assignee: { name: string; initials: string; color: string } | null;
  reporter: string;
  storyPoints: number | null;
  labels: string[];
  epic?: string;
  epicColor?: string;
  comments: number;
  attachments: number;
  updated: string;
  created: string;
}

// ─── Mock Data ───

const issues: JiraIssue[] = [
  {
    key: 'ENG-345', summary: 'Fix pagination edge case in /users endpoint', type: 'bug',
    status: 'to-do', priority: 'highest', storyPoints: 3,
    assignee: { name: 'Bob Johnson', initials: 'BJ', color: '#0052CC' }, reporter: 'Charlie Brown',
    labels: ['backend', 'api'], epic: 'API Improvements', epicColor: '#36B37E',
    comments: 2, attachments: 0, updated: '1 hr ago', created: 'Feb 15',
  },
  {
    key: 'ENG-344', summary: 'Implement WebSocket reconnection with exponential backoff', type: 'story',
    status: 'in-progress', priority: 'high', storyPoints: 8,
    assignee: { name: 'Bob Johnson', initials: 'BJ', color: '#0052CC' }, reporter: 'Jane Smith',
    labels: ['backend', 'realtime'], epic: 'Real-time Features', epicColor: '#6554C0',
    comments: 5, attachments: 1, updated: '12 min ago', created: 'Feb 10',
  },
  {
    key: 'ENG-343', summary: 'Add rate limiting middleware to API gateway', type: 'task',
    status: 'in-review', priority: 'high', storyPoints: 5,
    assignee: { name: 'Charlie Brown', initials: 'CB', color: '#FF5630' }, reporter: 'Bob Johnson',
    labels: ['backend', 'security'], epic: 'API Improvements', epicColor: '#36B37E',
    comments: 8, attachments: 2, updated: '20 min ago', created: 'Feb 8',
  },
  {
    key: 'ENG-342', summary: 'Refactor payment service for idempotency support', type: 'story',
    status: 'in-review', priority: 'medium', storyPoints: 13,
    assignee: { name: 'Charlie Brown', initials: 'CB', color: '#FF5630' }, reporter: 'Jane Smith',
    labels: ['payments', 'backend'], epic: 'Payment System v2', epicColor: '#FF8B00',
    comments: 3, attachments: 0, updated: '45 min ago', created: 'Feb 5',
  },
  {
    key: 'ENG-341', summary: 'Database migration: Postgres 14 → 16', type: 'task',
    status: 'in-progress', priority: 'medium', storyPoints: 5,
    assignee: { name: 'Alice Williams', initials: 'AW', color: '#00B8D9' }, reporter: 'Charlie Brown',
    labels: ['infra', 'database'], epic: 'Infrastructure', epicColor: '#8993A4',
    comments: 4, attachments: 1, updated: '2 hrs ago', created: 'Feb 3',
  },
  {
    key: 'ENG-340', summary: 'Dashboard component unit tests', type: 'task',
    status: 'done', priority: 'low', storyPoints: 3,
    assignee: { name: 'Jane Smith', initials: 'JS', color: '#6554C0' }, reporter: 'Bob Johnson',
    labels: ['testing', 'frontend'], epic: 'Quality', epicColor: '#00B8D9',
    comments: 1, attachments: 0, updated: '4 hrs ago', created: 'Feb 1',
  },
  {
    key: 'ENG-339', summary: 'Upgrade React Router to v7', type: 'story',
    status: 'done', priority: 'medium', storyPoints: 5,
    assignee: { name: 'Alice Williams', initials: 'AW', color: '#00B8D9' }, reporter: 'Bob Johnson',
    labels: ['frontend', 'dependencies'], epic: 'Tech Debt', epicColor: '#FFAB00',
    comments: 6, attachments: 0, updated: '1 day ago', created: 'Jan 28',
  },
];

const sprintData = {
  name: 'Sprint 14',
  startDate: 'Feb 5',
  endDate: 'Feb 19',
  daysRemaining: 4,
  totalPoints: 42,
  completedPoints: 26,
  inProgressPoints: 11,
  todoPoints: 5,
  velocity: 42,
  prevVelocity: 36,
};

// ─── Helpers ───

function TypeIcon({ type }: { type: JiraIssue['type'] }) {
  const map: Record<string, { bg: string; icon: React.ReactNode }> = {
    story: { bg: '#36B37E', icon: <span className="text-white text-[7px] font-bold">S</span> },
    bug: { bg: '#FF5630', icon: <span className="text-white text-[7px] font-bold">B</span> },
    task: { bg: '#0065FF', icon: <CheckCircle2 size={8} className="text-white" /> },
    epic: { bg: '#6554C0', icon: <Zap size={8} className="text-white" /> },
    subtask: { bg: '#0065FF', icon: <span className="text-white text-[7px] font-bold">⊟</span> },
  };
  const m = map[type] || map.task;
  return (
    <div className="w-4 h-4 rounded-sm flex items-center justify-center shrink-0" style={{ backgroundColor: m.bg }}>
      {m.icon}
    </div>
  );
}

function PriorityIcon({ priority }: { priority: JiraIssue['priority'] }) {
  const map: Record<string, { icon: typeof ArrowUp; color: string }> = {
    highest: { icon: ArrowUp, color: '#FF5630' },
    high: { icon: ArrowUp, color: '#FF7452' },
    medium: { icon: Minus, color: '#FFAB00' },
    low: { icon: ArrowDown, color: '#36B37E' },
    lowest: { icon: ArrowDown, color: '#6B778C' },
  };
  const m = map[priority];
  return <m.icon size={12} style={{ color: m.color }} />;
}

function StatusBadge({ status }: { status: JiraIssue['status'] }) {
  const map: Record<string, string> = {
    'to-do': 'bg-[#DFE1E6] text-[#42526E]',
    'in-progress': 'bg-[#DEEBFF] text-[#0052CC]',
    'in-review': 'bg-[#EAE6FF] text-[#5243AA]',
    'done': 'bg-[#E3FCEF] text-[#006644]',
  };
  const labels: Record<string, string> = {
    'to-do': 'TO DO',
    'in-progress': 'IN PROGRESS',
    'in-review': 'IN REVIEW',
    'done': 'DONE',
  };
  return (
    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider', map[status])}>
      {labels[status]}
    </span>
  );
}

// ─── Tab types ───

type TabId = 'board' | 'backlog' | 'timeline';

// ─── Board Column ───

function BoardColumn({ title, status, color, issues: columnIssues }: {
  title: string; status: string; color: string; issues: JiraIssue[];
}) {
  return (
    <div className="min-w-[220px] flex-1">
      <div className="flex items-center gap-2 mb-2.5 px-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">{title}</span>
        <span className="text-[10px] text-[#A5ADBA] bg-[#F4F5F7] dark:bg-[#333] rounded-full px-1.5 py-0">{columnIssues.length}</span>
      </div>
      <div className="space-y-2 min-h-[100px]">
        {columnIssues.map(issue => (
          <motion.div
            key={issue.key}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#2a2a2a] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            {issue.epic && (
              <div className="flex items-center gap-1 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: issue.epicColor }} />
                <span className="text-[9px] font-medium" style={{ color: issue.epicColor }}>{issue.epic}</span>
              </div>
            )}
            <p className="text-[12px] text-[#172B4D] dark:text-[#e0e0e0] leading-snug mb-2">{issue.summary}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TypeIcon type={issue.type} />
                <span className="text-[10px] text-[#5E6C84] dark:text-[#8a8a8a] font-medium">{issue.key}</span>
                <PriorityIcon priority={issue.priority} />
              </div>
              <div className="flex items-center gap-1.5">
                {issue.storyPoints !== null && (
                  <span className="text-[9px] bg-[#F4F5F7] dark:bg-[#333] text-[#5E6C84] dark:text-[#8a8a8a] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {issue.storyPoints}
                  </span>
                )}
                {issue.assignee && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[7px] font-bold"
                    style={{ backgroundColor: issue.assignee.color }}
                    title={issue.assignee.name}
                  >
                    {issue.assignee.initials}
                  </div>
                )}
              </div>
            </div>
            {(issue.comments > 0 || issue.attachments > 0) && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#f0f0f0] dark:border-[#333]">
                {issue.comments > 0 && (
                  <span className="flex items-center gap-0.5 text-[9px] text-[#5E6C84] dark:text-[#8a8a8a]">
                    <MessageSquare size={9} /> {issue.comments}
                  </span>
                )}
                {issue.attachments > 0 && (
                  <span className="flex items-center gap-0.5 text-[9px] text-[#5E6C84] dark:text-[#8a8a8a]">
                    <Paperclip size={9} /> {issue.attachments}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───

export function JiraApp() {
  const [activeTab, setActiveTab] = useState<TabId>('board');
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

  const boardColumns = [
    { title: 'To Do', status: 'to-do', color: '#B3BAC5', issues: issues.filter(i => i.status === 'to-do') },
    { title: 'In Progress', status: 'in-progress', color: '#0052CC', issues: issues.filter(i => i.status === 'in-progress') },
    { title: 'In Review', status: 'in-review', color: '#5243AA', issues: issues.filter(i => i.status === 'in-review') },
    { title: 'Done', status: 'done', color: '#36B37E', issues: issues.filter(i => i.status === 'done') },
  ];

  return (
    <div className="space-y-4">
      {/* Project Header */}
      <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0052CC] to-[#0065FF] flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11.53 2C6.63 2 2.55 5.75 2.06 10.53L5.78 6.81C6.47 6.12 7.59 6.12 8.28 6.81L11.53 10.06L14.78 6.81C15.47 6.12 16.59 6.12 17.28 6.81L21 10.53C20.51 5.75 16.43 2 11.53 2Z" fill="white" opacity="0.6"/>
                <path d="M11.53 22C16.43 22 20.51 18.25 21 13.47L17.28 17.19C16.59 17.88 15.47 17.88 14.78 17.19L11.53 13.94L8.28 17.19C7.59 17.88 6.47 17.88 5.78 17.19L2.06 13.47C2.55 18.25 6.63 22 11.53 22Z" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#172B4D] dark:text-[#f0f0f0]">ENG Board</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#DEEBFF] dark:bg-[#0052CC]/20 text-[#0052CC] font-bold">SCRUM</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#5E6C84] dark:text-[#8a8a8a]">
                <span className="flex items-center gap-1"><Target size={9} /> {sprintData.name}</span>
                <span>·</span>
                <span>{sprintData.startDate} — {sprintData.endDate}</span>
                <span>·</span>
                <span className="text-[#FF5630] font-medium">{sprintData.daysRemaining} days left</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Quick filters */}
            <div className="flex items-center -space-x-1">
              {[
                { initials: 'BJ', color: '#0052CC' },
                { initials: 'CB', color: '#FF5630' },
                { initials: 'AW', color: '#00B8D9' },
                { initials: 'JS', color: '#6554C0' },
              ].map((u, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white dark:border-[#252525] flex items-center justify-center text-white text-[8px] font-bold cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: u.color, zIndex: 4 - i }}
                >
                  {u.initials}
                </div>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-medium transition-colors">
              <ExternalLink size={12} />
              Open in Jira
            </button>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="border-t border-[#f0f0f0] dark:border-[#333] px-5 flex items-center gap-1">
          {([
            { id: 'board' as TabId, label: 'Board' },
            { id: 'backlog' as TabId, label: 'Backlog' },
            { id: 'timeline' as TabId, label: 'Timeline' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3 py-2.5 text-[12px] font-medium border-b-2 -mb-px transition-all',
                activeTab === tab.id
                  ? 'border-[#0052CC] text-[#0052CC]'
                  : 'border-transparent text-[#5E6C84] dark:text-[#8a8a8a] hover:text-[#172B4D] dark:hover:text-[#e0e0e0] hover:border-[#DFE1E6] dark:hover:border-[#3d3d3d]',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'board' && (
            <div className="space-y-3">
              {/* Board filters */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-[#252525] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d]">
                  <Search size={12} className="text-[#6B778C]" />
                  <input placeholder="Search this board" className="bg-transparent text-xs text-[#172B4D] dark:text-[#e0e0e0] placeholder-[#A5ADBA] outline-none w-36" />
                </div>
                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] text-[#5E6C84] dark:text-[#8a8a8a] hover:bg-[#f0f0f0] dark:hover:bg-[#333] transition-colors">
                  <Filter size={11} /> Epic
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] text-[#5E6C84] dark:text-[#8a8a8a] hover:bg-[#f0f0f0] dark:hover:bg-[#333] transition-colors">
                  <Tag size={11} /> Label
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] text-[#5E6C84] dark:text-[#8a8a8a] hover:bg-[#f0f0f0] dark:hover:bg-[#333] transition-colors">
                  <Flag size={11} /> Type
                </button>
              </div>

              {/* Kanban Board */}
              <div className="flex gap-3 overflow-x-auto scrollbar-on-hover pb-2">
                {boardColumns.map(col => (
                  <BoardColumn key={col.status} {...col} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'backlog' && (
            <div className="space-y-3">
              {/* Sprint section */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#DEEBFF] dark:bg-[#0052CC]/15 border-b border-[#B3D4FF] dark:border-[#0052CC]/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChevronDown size={14} className="text-[#0052CC]" />
                    <span className="text-[12px] font-bold text-[#0052CC]">{sprintData.name}</span>
                    <span className="text-[10px] text-[#5E6C84] dark:text-[#8a8a8a]">
                      {sprintData.startDate} — {sprintData.endDate} · {issues.length} issues · {sprintData.totalPoints} pts
                    </span>
                  </div>
                  <button className="px-2.5 py-1 rounded text-[10px] bg-[#0052CC] text-white font-medium hover:bg-[#0747A6] transition-colors">
                    Complete Sprint
                  </button>
                </div>
                <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
                  {issues.map(issue => (
                    <div
                      key={issue.key}
                      onClick={() => setSelectedIssue(selectedIssue === issue.key ? null : issue.key)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors',
                        selectedIssue === issue.key
                          ? 'bg-[#DEEBFF] dark:bg-[#0052CC]/10'
                          : 'hover:bg-[#FAFBFC] dark:hover:bg-[#2a2a2a]',
                      )}
                    >
                      <TypeIcon type={issue.type} />
                      <span className="text-[11px] text-[#0052CC] font-medium w-16 shrink-0">{issue.key}</span>
                      <span className="text-[12px] text-[#172B4D] dark:text-[#e0e0e0] flex-1 truncate">{issue.summary}</span>
                      {issue.epic && (
                        <span
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded border shrink-0"
                          style={{
                            backgroundColor: `${issue.epicColor}15`,
                            color: issue.epicColor,
                            borderColor: `${issue.epicColor}30`,
                          }}
                        >
                          {issue.epic}
                        </span>
                      )}
                      <PriorityIcon priority={issue.priority} />
                      <StatusBadge status={issue.status} />
                      {issue.storyPoints !== null && (
                        <span className="text-[9px] bg-[#F4F5F7] dark:bg-[#333] text-[#5E6C84] rounded-full w-5 h-5 flex items-center justify-center font-bold shrink-0">
                          {issue.storyPoints}
                        </span>
                      )}
                      {issue.assignee ? (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[7px] font-bold shrink-0"
                          style={{ backgroundColor: issue.assignee.color }}
                        >
                          {issue.assignee.initials}
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-dashed border-[#DFE1E6] dark:border-[#3d3d3d] shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Backlog section */}
              <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#F4F5F7] dark:bg-[#1e1f22] border-b border-[#e1dfdd] dark:border-[#333] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-[#5E6C84]" />
                    <span className="text-[12px] font-bold text-[#5E6C84] dark:text-[#8a8a8a]">Backlog</span>
                    <span className="text-[10px] text-[#A5ADBA]">4 issues · 18 pts</span>
                  </div>
                  <button className="px-2.5 py-1 rounded text-[10px] bg-[#F4F5F7] dark:bg-[#333] text-[#5E6C84] font-medium hover:bg-[#EBECF0] dark:hover:bg-[#3d3d3d] border border-[#DFE1E6] dark:border-[#3d3d3d] transition-colors">
                    Create Sprint
                  </button>
                </div>
                <div className="px-4 py-6 text-center">
                  <p className="text-[11px] text-[#A5ADBA]">4 items in backlog</p>
                  <button className="mt-2 text-[11px] text-[#0052CC] font-medium hover:underline">
                    Expand backlog
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#F4F5F7] dark:bg-[#1e1f22] border-b border-[#e1dfdd] dark:border-[#333] flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#172B4D] dark:text-[#e0e0e0]">Roadmap — Q1 2026</span>
                <div className="flex items-center gap-2 text-[10px] text-[#5E6C84]">
                  <span className="flex items-center gap-1"><Calendar size={10} /> Weeks</span>
                </div>
              </div>
              <div className="p-4">
                {/* Week headers */}
                <div className="flex items-center ml-48 mb-3">
                  {['Jan 27', 'Feb 3', 'Feb 10', 'Feb 17', 'Feb 24', 'Mar 3'].map((w, i) => (
                    <div key={w} className="flex-1 text-center">
                      <span className={cn(
                        'text-[9px] font-medium',
                        i === 3 ? 'text-[#0052CC]' : 'text-[#A5ADBA]',
                      )}>{w}</span>
                    </div>
                  ))}
                </div>

                {/* Epic rows */}
                <div className="space-y-2">
                  {[
                    { name: 'API Improvements', color: '#36B37E', start: 1, span: 3 },
                    { name: 'Real-time Features', color: '#6554C0', start: 2, span: 4 },
                    { name: 'Payment System v2', color: '#FF8B00', start: 0, span: 3 },
                    { name: 'Infrastructure', color: '#8993A4', start: 1, span: 2 },
                    { name: 'Quality', color: '#00B8D9', start: 0, span: 2 },
                    { name: 'Tech Debt', color: '#FFAB00', start: 3, span: 3 },
                  ].map(epic => (
                    <div key={epic.name} className="flex items-center gap-3">
                      <div className="w-44 shrink-0 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: epic.color }} />
                        <span className="text-[11px] font-medium text-[#172B4D] dark:text-[#e0e0e0] truncate">{epic.name}</span>
                      </div>
                      <div className="flex-1 relative h-6">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex">
                          {[0, 1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={cn('flex-1 border-r', i === 3 ? 'border-[#0052CC]/20' : 'border-[#F4F5F7] dark:border-[#333]')} />
                          ))}
                        </div>
                        {/* Epic bar */}
                        <div
                          className="absolute top-1 h-4 rounded-sm flex items-center px-2"
                          style={{
                            left: `${(epic.start / 6) * 100}%`,
                            width: `${(epic.span / 6) * 100}%`,
                            backgroundColor: `${epic.color}20`,
                            borderLeft: `3px solid ${epic.color}`,
                          }}
                        >
                          <span className="text-[8px] font-medium truncate" style={{ color: epic.color }}>
                            {epic.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Today indicator */}
                <div className="relative ml-48 mt-2">
                  <div className="absolute h-full border-l-2 border-[#0052CC] border-dashed" style={{ left: `${(3.5 / 6) * 100}%`, top: -120, height: 150 }} />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sprint Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Sprint Progress', value: `${Math.round((sprintData.completedPoints / sprintData.totalPoints) * 100)}%`, sub: `${sprintData.completedPoints}/${sprintData.totalPoints} pts done` },
          { label: 'Velocity', value: String(sprintData.velocity), sub: `+${sprintData.velocity - sprintData.prevVelocity} from last sprint` },
          { label: 'Open Issues', value: String(issues.filter(i => i.status !== 'done').length), sub: '1 blocker, 2 in review' },
          { label: 'Days Remaining', value: String(sprintData.daysRemaining), sub: `Ends ${sprintData.endDate}` },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] px-4 py-3">
            <p className="text-[10px] text-[#5E6C84] dark:text-[#6d6f78] uppercase tracking-wider">{stat.label}</p>
            <p className="text-lg font-bold text-[#172B4D] dark:text-[#f0f0f0] mt-0.5">{stat.value}</p>
            <p className="text-[10px] text-[#A5ADBA] dark:text-[#5a5a5a]">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
