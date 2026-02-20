import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Circle, CheckCircle2, Clock, Rocket,
  Bug, Zap, BookOpen, AlertTriangle, ChevronDown, ChevronRight,
  GitPullRequest, ListChecks, Tag, Eye, X,
  Layers, Users, Flame, LayoutGrid, List,
  CalendarDays, Target, TrendingUp,
} from 'lucide-react';
import { spaces, tasks as allTasks, users, type Task } from '../data/mockData';
import { format, differenceInDays } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";

// Sprint configuration
const CURRENT_SPRINT = {
  name: 'Sprint 14',
  startDate: new Date('2026-02-10T00:00:00'),
  endDate: new Date('2026-02-21T00:00:00'),
  goal: 'Complete OAuth flow, rate limiting, and dashboard refactor',
};

const NOW = new Date('2026-02-18T16:00:00');

type ColumnStatus = 'todo' | 'in-progress' | 'in-review' | 'done';
type ViewMode = 'board' | 'backlog';

const BOARD_COLUMNS: { id: ColumnStatus; label: string; icon: React.ReactNode; color: string; dotColor: string }[] = [
  { id: 'todo', label: 'To Do', icon: <Circle size={14} />, color: 'text-[#616161] dark:text-[#999]', dotColor: 'bg-[#8a8a8a]' },
  { id: 'in-progress', label: 'In Progress', icon: <Clock size={14} />, color: 'text-[#0078d4] dark:text-[#4dabf5]', dotColor: 'bg-[#0078d4]' },
  { id: 'in-review', label: 'In Review', icon: <Eye size={14} />, color: 'text-[#d4820c] dark:text-[#f0b850]', dotColor: 'bg-[#d4820c]' },
  { id: 'done', label: 'Done', icon: <CheckCircle2 size={14} />, color: 'text-[#237b4b] dark:text-[#6fcf97]', dotColor: 'bg-[#237b4b]' },
];

const EPIC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  purple: { bg: 'bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20', text: 'text-[#5b5fc7] dark:text-[#a6a9dc]', border: 'border-[#5b5fc7]/20' },
  blue: { bg: 'bg-[#0078d4]/10 dark:bg-[#0078d4]/20', text: 'text-[#0078d4] dark:text-[#4dabf5]', border: 'border-[#0078d4]/20' },
  green: { bg: 'bg-[#237b4b]/10 dark:bg-[#237b4b]/20', text: 'text-[#237b4b] dark:text-[#6fcf97]', border: 'border-[#237b4b]/20' },
  orange: { bg: 'bg-[#d4820c]/10 dark:bg-[#d4820c]/20', text: 'text-[#d4820c] dark:text-[#f0b850]', border: 'border-[#d4820c]/20' },
  red: { bg: 'bg-[#c4314b]/10 dark:bg-[#c4314b]/20', text: 'text-[#c4314b] dark:text-[#f47067]', border: 'border-[#c4314b]/20' },
};

function TypeIcon({ type, size = 14 }: { type: Task['type']; size?: number }) {
  switch (type) {
    case "story": return <BookOpen size={size} className="text-[#237b4b] dark:text-[#6fcf97]" />;
    case 'bug': return <Bug size={size} className="text-[#c4314b] dark:text-[#f47067]" />;
    case 'task': return <CheckCircle2 size={size} className="text-[#0078d4] dark:text-[#4dabf5]" />;
    case 'spike': return <Zap size={size} className="text-[#d4820c] dark:text-[#f0b850]" />;
  }
}

function PriorityBadge({ priority }: { priority: Task['priority'] }) {
  const config = {
    critical: { label: 'Critical', bg: 'bg-[#c4314b]/10 dark:bg-[#c4314b]/20', text: 'text-[#c4314b] dark:text-[#f47067]', icon: <Flame size={10} /> },
    high: { label: 'High', bg: 'bg-[#d4820c]/10 dark:bg-[#d4820c]/20', text: 'text-[#d4820c] dark:text-[#f0b850]', icon: <AlertTriangle size={10} /> },
    medium: { label: 'Med', bg: 'bg-[#0078d4]/10 dark:bg-[#0078d4]/20', text: 'text-[#0078d4] dark:text-[#4dabf5]', icon: null },
    low: { label: 'Low', bg: 'bg-[#8a8a8a]/10 dark:bg-[#8a8a8a]/20', text: 'text-[#8a8a8a] dark:text-[#999]', icon: null },
  }[priority];

  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

function StoryPointsBadge({ points }: { points?: number }) {
  if (!points) return null;
  return (
    <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] rounded-full bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc] text-[10px] font-bold px-1">
      {points}
    </span>
  );
}

function SubtaskProgress({ subtasks }: { subtasks?: Task['subtasks'] }) {
  if (!subtasks || subtasks.length === 0) return null;
  const done = subtasks.filter(s => s.done).length;
  const total = subtasks.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="flex items-center gap-1.5">
      <ListChecks size={11} className="text-[#8a8a8a] dark:text-[#6d6f78]" />
      <div className="w-[40px] h-[3px] rounded-full bg-[#e1dfdd] dark:bg-[#3d3d3d] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#5b5fc7] dark:bg-[#a6a9dc] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">{done}/{total}</span>
    </div>
  );
}

const TaskCard = React.forwardRef<HTMLDivElement, { task: Task; onOpenDetail: (task: Task) => void }>(
  function TaskCard({ task, onOpenDetail }, ref) {
  const user = users.find(u => u.id === task.assigneeId);
  const epicStyle = EPIC_COLORS[task.epicColor || 'purple'];
  const isOverdue = task.dueDate < NOW && task.status !== 'done';

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={() => onOpenDetail(task)}
      className={`group bg-white dark:bg-[#252525] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] p-3 hover:shadow-md hover:border-[#5b5fc7]/30 dark:hover:border-[#5b5fc7]/30 transition-all cursor-pointer ${
        task.status === 'done' ? 'opacity-70' : ''
      }`}
    >
      {/* Top row: type icon + ID + priority */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <TypeIcon type={task.type} size={13} />
          <span className="text-[10px] font-mono text-[#8a8a8a] dark:text-[#6d6f78] uppercase">{task.id}</span>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Title */}
      <h4 className={`text-[13px] font-medium text-[#242424] dark:text-[#f0f0f0] mb-2 leading-snug ${
        task.status === 'done' ? 'line-through opacity-75' : ''
      }`}>
        {task.title}
      </h4>

      {/* Epic tag */}
      {task.epic && (
        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium mb-2 ${epicStyle.bg} ${epicStyle.text}`}>
          <Tag size={9} />
          {task.epic}
        </div>
      )}

      {/* Bottom row: assignee, points, subtask progress, PR */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          {user && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-5 h-5 rounded-full ring-1 ring-[#e1dfdd] dark:ring-[#3d3d3d]"
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{user.name}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <SubtaskProgress subtasks={task.subtasks} />
        </div>
        <div className="flex items-center gap-1.5">
          {task.pullRequestUrl && (
            <GitPullRequest size={12} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
          )}
          {isOverdue && (
            <span className="text-[10px] text-[#c4314b] dark:text-[#f47067] font-medium">Overdue</span>
          )}
          <StoryPointsBadge points={task.storyPoints} />
        </div>
      </div>
    </motion.div>
  );
});
TaskCard.displayName = 'TaskCard';

function TaskDetailPanel({ task, onClose }: { task: Task; onClose: () => void }) {
  const user = users.find(u => u.id === task.assigneeId);
  const epicStyle = EPIC_COLORS[task.epicColor || 'purple'];
  const col = BOARD_COLUMNS.find(c => c.id === task.status) ||
    { label: 'Backlog', color: 'text-[#8a8a8a]', dotColor: 'bg-[#8a8a8a]' };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="w-[380px] flex-shrink-0 bg-white dark:bg-[#252525] border-l border-[#e1dfdd] dark:border-[#3d3d3d] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#e1dfdd] dark:border-[#3d3d3d] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TypeIcon type={task.type} size={16} />
          <span className="text-[12px] font-mono text-[#8a8a8a] dark:text-[#6d6f78] uppercase">{task.id}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-[#f0f0f0] dark:hover:bg-[#333] text-[#616161] dark:text-[#b9bbbe] transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto scrollbar-on-hover px-5 py-4 space-y-5">
        {/* Title */}
        <h3 className="text-[16px] font-semibold text-[#242424] dark:text-[#f0f0f0] leading-tight">{task.title}</h3>

        {/* Description */}
        {task.description && (
          <p className="text-[13px] text-[#616161] dark:text-[#b9bbbe] leading-relaxed">{task.description}</p>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3">
          <DetailField label="Status">
            <span className={`flex items-center gap-1.5 text-[13px] font-medium ${col.color}`}>
              <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
              {col.label}
            </span>
          </DetailField>
          <DetailField label="Priority">
            <PriorityBadge priority={task.priority} />
          </DetailField>
          <DetailField label="Assignee">
            {user ? (
              <div className="flex items-center gap-2">
                <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full" />
                <span className="text-[13px] text-[#242424] dark:text-[#f0f0f0]">{user.name}</span>
              </div>
            ) : (
              <span className="text-[13px] text-[#8a8a8a]">Unassigned</span>
            )}
          </DetailField>
          <DetailField label="Story Points">
            <StoryPointsBadge points={task.storyPoints} />
          </DetailField>
          <DetailField label="Sprint">
            <span className="text-[13px] text-[#242424] dark:text-[#f0f0f0] flex items-center gap-1.5">
              <Rocket size={12} className="text-[#5b5fc7]" />
              {task.sprint || 'Backlog'}
            </span>
          </DetailField>
          <DetailField label="Due Date">
            <span className={`text-[13px] flex items-center gap-1.5 ${
              task.dueDate < NOW && task.status !== 'done'
                ? 'text-[#c4314b] dark:text-[#f47067]'
                : 'text-[#242424] dark:text-[#f0f0f0]'
            }`}>
              <CalendarDays size={12} />
              {format(task.dueDate, 'MMM d, yyyy')}
            </span>
          </DetailField>
          <DetailField label="Type">
            <div className="flex items-center gap-1.5">
              <TypeIcon type={task.type} size={13} />
              <span className="text-[13px] text-[#242424] dark:text-[#f0f0f0] capitalize">{task.type}</span>
            </div>
          </DetailField>
          {task.epic && (
            <DetailField label="Epic">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${epicStyle.bg} ${epicStyle.text}`}>
                <Tag size={9} />
                {task.epic}
              </span>
            </DetailField>
          )}
        </div>

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div>
            <p className="text-[11px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wide mb-2">Labels</p>
            <div className="flex flex-wrap gap-1.5">
              {task.labels.map(label => (
                <span
                  key={label}
                  className="px-2 py-0.5 rounded-full text-[11px] bg-[#f0f0f0] dark:bg-[#333] text-[#424242] dark:text-[#d1d1d1] border border-[#e1dfdd] dark:border-[#3d3d3d]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div>
            <p className="text-[11px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wide mb-2">
              Subtasks ({task.subtasks.filter(s => s.done).length}/{task.subtasks.length})
            </p>
            <div className="space-y-1.5">
              {task.subtasks.map(st => (
                <div key={st.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#faf9f8] dark:bg-[#1e1f22]">
                  {st.done ? (
                    <CheckCircle2 size={14} className="text-[#237b4b] dark:text-[#6fcf97] flex-shrink-0" />
                  ) : (
                    <Circle size={14} className="text-[#8a8a8a] dark:text-[#6d6f78] flex-shrink-0" />
                  )}
                  <span className={`text-[12px] ${st.done ? 'line-through text-[#8a8a8a] dark:text-[#6d6f78]' : 'text-[#424242] dark:text-[#d1d1d1]'}`}>
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PR link */}
        {task.pullRequestUrl && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10 border border-[#5b5fc7]/15 dark:border-[#5b5fc7]/20">
            <GitPullRequest size={14} className="text-[#5b5fc7] dark:text-[#a6a9dc]" />
            <span className="text-[12px] font-medium text-[#5b5fc7] dark:text-[#a6a9dc]">Pull Request {task.pullRequestUrl}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wide mb-1">{label}</p>
      {children}
    </div>
  );
}

export function Tasks() {
  const { spaceId } = useParams();
  const currentSpace = spaces.find(s => s.id === spaceId);

  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEpic, setFilterEpic] = useState<string | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showBacklog, setShowBacklog] = useState(true);
  const [taskState, setTaskState] = useState<Task[]>(allTasks);

  if (!currentSpace) return null;

  const daysRemaining = differenceInDays(CURRENT_SPRINT.endDate, NOW);
  const totalDays = differenceInDays(CURRENT_SPRINT.endDate, CURRENT_SPRINT.startDate);
  const sprintProgress = Math.round(((totalDays - daysRemaining) / totalDays) * 100);

  const sprintTasks = taskState.filter(t => t.sprint === CURRENT_SPRINT.name);
  const backlogTasks = taskState.filter(t => t.status === 'backlog');

  const totalPoints = sprintTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const donePoints = sprintTasks.filter(t => t.status === 'done').reduce((s, t) => s + (t.storyPoints || 0), 0);
  const pointsBurnPct = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  // All unique epics for filter
  const allEpics = useMemo(() => {
    const epics = new Map<string, string>();
    taskState.forEach(t => { if (t.epic && t.epicColor) epics.set(t.epic, t.epicColor); });
    return Array.from(epics.entries());
  }, [taskState]);

  // Unique assignees
  const allAssignees = useMemo(() => {
    const ids = new Set(taskState.map(t => t.assigneeId));
    return users.filter(u => ids.has(u.id));
  }, [taskState]);

  // Filter logic
  const filteredSprintTasks = useMemo(() => {
    return sprintTasks.filter(t => {
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterEpic && t.epic !== filterEpic) return false;
      if (filterAssignee && t.assigneeId !== filterAssignee) return false;
      if (filterType && t.type !== filterType) return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      return true;
    });
  }, [sprintTasks, searchQuery, filterEpic, filterAssignee, filterType, filterPriority]);

  const filteredBacklogTasks = useMemo(() => {
    return backlogTasks.filter(t => {
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterEpic && t.epic !== filterEpic) return false;
      if (filterAssignee && t.assigneeId !== filterAssignee) return false;
      if (filterType && t.type !== filterType) return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      return true;
    });
  }, [backlogTasks, searchQuery, filterEpic, filterAssignee, filterType, filterPriority]);

  const getColumnTasks = (status: ColumnStatus) =>
    filteredSprintTasks.filter(t => t.status === status);

  const getColumnPoints = (status: ColumnStatus) =>
    getColumnTasks(status).reduce((s, t) => s + (t.storyPoints || 0), 0);

  const activeFilterCount = [filterEpic, filterAssignee, filterType, filterPriority].filter(Boolean).length;

  const clearFilters = () => {
    setFilterEpic(null);
    setFilterAssignee(null);
    setFilterType(null);
    setFilterPriority(null);
    setSearchQuery('');
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex-1 flex flex-col bg-[#faf9f8] dark:bg-[#1f1f1f] overflow-hidden">
        {/* Sprint Header Bar */}
        <div className="flex-shrink-0 bg-white dark:bg-[#252525] border-b border-[#e1dfdd] dark:border-[#3d3d3d]">
          {/* Top row */}
          <div className="h-[56px] px-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5b5fc7] to-[#7b4db8] flex items-center justify-center">
                  <Rocket size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-[#242424] dark:text-[#f0f0f0] leading-tight">{CURRENT_SPRINT.name}</h2>
                  <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">
                    {format(CURRENT_SPRINT.startDate, 'MMM d')} – {format(CURRENT_SPRINT.endDate, 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              {/* Sprint stats pills */}
              <div className="hidden md:flex items-center gap-2 ml-4">
                <SprintStatPill
                  icon={<CalendarDays size={12} />}
                  label={`${daysRemaining}d left`}
                  color={daysRemaining <= 2 ? 'text-[#c4314b] dark:text-[#f47067]' : 'text-[#616161] dark:text-[#b9bbbe]'}
                />
                <SprintStatPill
                  icon={<Target size={12} />}
                  label={`${donePoints}/${totalPoints} pts`}
                  color="text-[#5b5fc7] dark:text-[#a6a9dc]"
                />
                <SprintStatPill
                  icon={<TrendingUp size={12} />}
                  label={`${pointsBurnPct}% burned`}
                  color={pointsBurnPct >= 70 ? 'text-[#237b4b] dark:text-[#6fcf97]' : 'text-[#d4820c] dark:text-[#f0b850]'}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center bg-[#f5f5f5] dark:bg-[#1e1f22] rounded-lg p-0.5 border border-[#e1dfdd] dark:border-[#3d3d3d]">
                <button
                  onClick={() => setViewMode('board')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                    viewMode === 'board'
                      ? 'bg-white dark:bg-[#333] text-[#242424] dark:text-[#f0f0f0] shadow-sm'
                      : 'text-[#616161] dark:text-[#b9bbbe] hover:text-[#242424] dark:hover:text-[#f0f0f0]'
                  }`}
                >
                  <LayoutGrid size={13} />
                  Board
                </button>
                <button
                  onClick={() => setViewMode('backlog')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                    viewMode === 'backlog'
                      ? 'bg-white dark:bg-[#333] text-[#242424] dark:text-[#f0f0f0] shadow-sm'
                      : 'text-[#616161] dark:text-[#b9bbbe] hover:text-[#242424] dark:hover:text-[#f0f0f0]'
                  }`}
                >
                  <List size={13} />
                  Backlog
                </button>
              </div>

              <button className="flex items-center gap-1.5 bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8] text-white px-3.5 py-1.5 rounded-lg text-[12px] font-semibold hover:opacity-90 transition-opacity shadow-sm">
                <Plus size={14} />
                New Item
              </button>
            </div>
          </div>

          {/* Sprint progress bar */}
          <div className="px-5 pb-2">
            <div className="h-[3px] rounded-full bg-[#e1dfdd] dark:bg-[#3d3d3d] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sprintProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8]"
              />
            </div>
          </div>

          {/* Sprint goal */}
          <div className="px-5 pb-3">
            <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">
              <span className="font-medium text-[#616161] dark:text-[#999]">Goal:</span> {CURRENT_SPRINT.goal}
            </p>
          </div>

          {/* Filter bar */}
          <div className="px-5 pb-3 flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 max-w-[260px]">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a8a8a] dark:text-[#6d6f78]" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-[#f5f5f5] dark:bg-[#1e1f22] text-[#242424] dark:text-[#f0f0f0] placeholder-[#8a8a8a] dark:placeholder-[#6d6f78] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] outline-none focus:border-[#5b5fc7]/40 dark:focus:border-[#5b5fc7]/30 transition-colors"
              />
            </div>

            {/* Filter chips */}
            <FilterChipSelect
              label="Epic"
              icon={<Layers size={12} />}
              value={filterEpic}
              options={allEpics.map(([name, color]) => ({ value: name, label: name, color }))}
              onChange={setFilterEpic}
            />
            <FilterChipSelect
              label="Assignee"
              icon={<Users size={12} />}
              value={filterAssignee}
              options={allAssignees.map(u => ({ value: u.id, label: u.name }))}
              onChange={setFilterAssignee}
            />
            <FilterChipSelect
              label="Type"
              icon={<BookOpen size={12} />}
              value={filterType}
              options={[
                { value: 'story', label: 'Story' },
                { value: 'bug', label: 'Bug' },
                { value: 'task', label: 'Task' },
                { value: 'spike', label: 'Spike' },
              ]}
              onChange={setFilterType}
            />
            <FilterChipSelect
              label="Priority"
              icon={<Flame size={12} />}
              value={filterPriority}
              options={[
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              onChange={setFilterPriority}
            />
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-1 text-[11px] text-[#c4314b] dark:text-[#f47067] hover:bg-[#c4314b]/5 rounded-md transition-colors"
              >
                <X size={12} />
                Clear ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Board / Backlog view */}
          <div className="flex-1 overflow-auto">
            {viewMode === 'board' ? (
              <div className="flex gap-4 p-5 h-full min-w-max">
                {BOARD_COLUMNS.map(col => {
                  const colTasks = getColumnTasks(col.id);
                  const colPoints = getColumnPoints(col.id);

                  return (
                    <div key={col.id} className="w-[280px] flex flex-col">
                      {/* Column header */}
                      <div className="flex items-center justify-between mb-3 px-2">
                        <div className="flex items-center gap-2">
                          <span className={col.color}>{col.icon}</span>
                          <h3 className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{col.label}</h3>
                          <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] bg-[#f0f0f0] dark:bg-[#333] px-1.5 py-0.5 rounded-full">
                            {colTasks.length}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-[#5b5fc7] dark:text-[#a6a9dc] bg-[#5b5fc7]/8 dark:bg-[#5b5fc7]/15 px-1.5 py-0.5 rounded-full">
                          {colPoints} pts
                        </span>
                      </div>

                      {/* Task cards */}
                      <div className="flex-1 space-y-2.5 overflow-y-auto scrollbar-on-hover pb-4 pr-1">
                        <AnimatePresence mode="popLayout">
                          {colTasks.map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onOpenDetail={setSelectedTask}
                            />
                          ))}
                        </AnimatePresence>

                        {colTasks.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-10 h-10 rounded-full bg-[#f5f5f5] dark:bg-[#333] flex items-center justify-center mb-2">
                              <CheckCircle2 size={18} className="text-[#8a8a8a] dark:text-[#6d6f78]" />
                            </div>
                            <p className="text-[12px] text-[#8a8a8a] dark:text-[#6d6f78]">No items</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Backlog view */
              <div className="p-5 space-y-5 max-w-[900px]">
                {/* Sprint tasks section */}
                <BacklogSection
                  title={CURRENT_SPRINT.name}
                  subtitle={`${format(CURRENT_SPRINT.startDate, 'MMM d')} – ${format(CURRENT_SPRINT.endDate, 'MMM d')} · ${donePoints}/${totalPoints} pts`}
                  tasks={filteredSprintTasks}
                  defaultOpen={true}
                  onOpenDetail={setSelectedTask}
                  accentColor="text-[#5b5fc7] dark:text-[#a6a9dc]"
                />

                {/* Backlog section */}
                <BacklogSection
                  title="Product Backlog"
                  subtitle={`${filteredBacklogTasks.length} items · ${filteredBacklogTasks.reduce((s, t) => s + (t.storyPoints || 0), 0)} pts`}
                  tasks={filteredBacklogTasks}
                  defaultOpen={showBacklog}
                  onOpenDetail={setSelectedTask}
                  accentColor="text-[#616161] dark:text-[#b9bbbe]"
                />
              </div>
            )}
          </div>

          {/* Task detail panel */}
          <AnimatePresence>
            {selectedTask && (
              <TaskDetailPanel
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  );
}

function SprintStatPill({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f5f5f5] dark:bg-[#1e1f22] text-[11px] font-medium border border-[#e1dfdd] dark:border-[#3d3d3d] ${color}`}>
      {icon}
      {label}
    </span>
  );
}

function FilterChipSelect({
  label,
  icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: string | null;
  options: { value: string; label: string; color?: string }[];
  onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const selectedLabel = value ? options.find(o => o.value === value)?.label : null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors border ${
          value
            ? 'bg-[#5b5fc7]/8 dark:bg-[#5b5fc7]/15 text-[#5b5fc7] dark:text-[#a6a9dc] border-[#5b5fc7]/20 dark:border-[#5b5fc7]/30'
            : 'bg-[#f5f5f5] dark:bg-[#1e1f22] text-[#616161] dark:text-[#b9bbbe] border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/30'
        }`}
      >
        {icon}
        {selectedLabel || label}
        <ChevronDown size={10} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 bg-white dark:bg-[#2b2b2b] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] shadow-xl z-20 py-1 min-w-[160px]"
          >
            {value && (
              <button
                onClick={() => { onChange(null); setOpen(false); }}
                className="w-full text-left px-3 py-1.5 text-[12px] text-[#8a8a8a] dark:text-[#6d6f78] hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors"
              >
                Clear filter
              </button>
            )}
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors ${
                  value === opt.value ? 'text-[#5b5fc7] dark:text-[#a6a9dc] font-medium' : 'text-[#424242] dark:text-[#d1d1d1]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BacklogSection({
  title,
  subtitle,
  tasks,
  defaultOpen,
  onOpenDetail,
  accentColor,
}: {
  title: string;
  subtitle: string;
  tasks: Task[];
  defaultOpen: boolean;
  onOpenDetail: (task: Task) => void;
  accentColor: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Group by status
  const statusOrder: Task['status'][] = ['todo', 'in-progress', 'in-review', 'done', 'backlog'];

  return (
    <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronRight size={16} className="text-[#8a8a8a] dark:text-[#6d6f78]" />
          </motion.div>
          <Rocket size={14} className={accentColor} />
          <span className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{title}</span>
          <span className="text-[12px] text-[#8a8a8a] dark:text-[#6d6f78]">{subtitle}</span>
        </div>
        <span className="text-[12px] text-[#8a8a8a] dark:text-[#6d6f78] bg-[#f0f0f0] dark:bg-[#333] px-2 py-0.5 rounded-full">
          {tasks.length} items
        </span>
      </button>

      {/* Tasks list */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-[#e1dfdd] dark:border-[#3d3d3d]">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_100px_80px_100px_80px] px-4 py-2 text-[10px] font-medium text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wide border-b border-[#f0f0f0] dark:border-[#333]">
                <span>Task</span>
                <span>Status</span>
                <span>Priority</span>
                <span>Assignee</span>
                <span className="text-right">Points</span>
              </div>

              {tasks.map(task => {
                const user = users.find(u => u.id === task.assigneeId);
                const epicStyle = EPIC_COLORS[task.epicColor || 'purple'];
                const statusCol = BOARD_COLUMNS.find(c => c.id === task.status);

                return (
                  <div
                    key={task.id}
                    onClick={() => onOpenDetail(task)}
                    className={`grid grid-cols-[1fr_100px_80px_100px_80px] px-4 py-2.5 items-center hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] cursor-pointer transition-colors border-b border-[#f5f5f5] dark:border-[#2a2a2a] last:border-b-0 ${
                      task.status === 'done' ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <TypeIcon type={task.type} size={14} />
                      <span className="text-[11px] font-mono text-[#8a8a8a] dark:text-[#6d6f78] flex-shrink-0">{task.id}</span>
                      <span className={`text-[13px] text-[#242424] dark:text-[#f0f0f0] truncate ${task.status === 'done' ? 'line-through' : ''}`}>
                        {task.title}
                      </span>
                      {task.epic && (
                        <span className={`flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium ${epicStyle.bg} ${epicStyle.text}`}>
                          {task.epic}
                        </span>
                      )}
                    </div>
                    <div>
                      {statusCol ? (
                        <span className={`flex items-center gap-1 text-[11px] font-medium ${statusCol.color}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${statusCol.dotColor}`} />
                          {statusCol.label}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">Backlog</span>
                      )}
                    </div>
                    <PriorityBadge priority={task.priority} />
                    <div className="flex items-center gap-1.5">
                      {user && <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full" />}
                      <span className="text-[11px] text-[#616161] dark:text-[#b9bbbe] truncate">{task.assignee.split(' ')[0]}</span>
                    </div>
                    <div className="text-right">
                      <StoryPointsBadge points={task.storyPoints} />
                    </div>
                  </div>
                );
              })}

              {tasks.length === 0 && (
                <div className="px-4 py-6 text-center text-[13px] text-[#8a8a8a] dark:text-[#6d6f78]">
                  No items match your filters
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
