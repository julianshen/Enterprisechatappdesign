import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useLocation } from 'react-router';
import {
  X, Send, Sparkles, Bot, User, Trash2,
  ChevronDown, Slash, AtSign, Hash, Globe,
  Lightbulb, Zap, FileText, Search, MessageSquare,
  Code2, Palette, Megaphone, Building2, LayoutDashboard,
  Bold, Italic, Strikethrough, Code, List, ListOrdered, Link2, Quote, Eye,
  LifeBuoy,
} from 'lucide-react';
import { Button, Tooltip, TooltipTrigger, TooltipContent, Separator, Toggle } from "@/components/ui";
import { useAIAssistant } from '../context/AIAssistantContext';
import { AdaptiveCard, type AdaptiveCardData } from './AdaptiveCard';
import { spaces } from '../data/mockData';
import { MarkdownContent } from '@/components/ui';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from "@/lib/utils";
import { HelpDesk } from './HelpDesk';
import { useI18n } from '../context/I18nContext';

// ─── Types ───

interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  time: string;
  card?: AdaptiveCardData;
}

interface SlashCommand {
  command: string;
  description: string;
  icon: React.ReactNode;
}

// ─── Context detection ───

interface PageContext {
  type: 'recent' | 'inbox' | 'chat' | 'apps' | 'space-channel' | 'space-docs' | 'space-files' | 'space-tasks' | 'space-dashboard' | 'space-apps' | 'space-app-detail' | 'unknown';
  spaceName?: string;
  spaceId?: string;
  channelName?: string;
  label: string;
}

function usePageContext(): PageContext {
  const { spaceId, channelId, dashboardId, appId } = useParams();
  const location = useLocation();
  const { t } = useI18n();
  const path = location.pathname;

  if (path === '/' || path === '/recent') return { type: 'recent', label: t('assistant.context.recent') };
  if (path === '/inbox') return { type: 'inbox', label: t('assistant.context.inbox') };
  if (path === '/apps') return { type: 'apps', label: t('assistant.context.apps') };
  if (path.startsWith('/chat')) return { type: 'chat', label: t('assistant.context.chat') };

  const space = spaces.find(s => s.id === spaceId);
  const spaceName = space?.name || spaceId || '';

  if (spaceId && appId) return { type: 'space-app-detail', spaceName, spaceId, label: t('assistant.context.spaceAppDetail', { spaceName }) };
  if (path.endsWith('/apps')) return { type: 'space-apps', spaceName, spaceId, label: t('assistant.context.spaceApps', { spaceName }) };
  if (path.endsWith('/documents')) return { type: 'space-docs', spaceName, spaceId, label: t('assistant.context.spaceDocs', { spaceName }) };
  if (path.endsWith('/files')) return { type: 'space-files', spaceName, spaceId, label: t('assistant.context.spaceFiles', { spaceName }) };
  if (path.endsWith('/tasks')) return { type: 'space-tasks', spaceName, spaceId, label: t('assistant.context.spaceTasks', { spaceName }) };
  if (dashboardId) return { type: 'space-dashboard', spaceName, spaceId, label: t('assistant.context.spaceDashboard', { spaceName }) };

  if (spaceId && channelId) {
    const channel = space?.channels.find(c => c.id === channelId);
    return { type: 'space-channel', spaceName, spaceId, channelName: channel?.name || channelId, label: t('assistant.context.spaceChannel', { spaceName, channelName: channel?.name || channelId }) };
  }

  return { type: 'unknown', label: t('assistant.context.workspace') };
}

// ─── Slash commands ───

function getSlashCommands(t: (key: string, vars?: Record<string, string | number>) => string): SlashCommand[] {
  return [
    { command: '/summarize', description: t('assistant.slash.summarize'), icon: <FileText size={14} /> },
    { command: '/search', description: t('assistant.slash.search'), icon: <Search size={14} /> },
    { command: '/create', description: t('assistant.slash.create'), icon: <Zap size={14} /> },
    { command: '/draft', description: t('assistant.slash.draft'), icon: <MessageSquare size={14} /> },
    { command: '/analyze', description: t('assistant.slash.analyze'), icon: <Lightbulb size={14} /> },
    { command: '/translate', description: t('assistant.slash.translate'), icon: <Globe size={14} /> },
  ];
}

// ─── Context-aware prompts ───

function getContextPrompts(ctx: PageContext, t: (key: string, vars?: Record<string, string | number>) => string): string[] {
  switch (ctx.type) {
    case 'recent':
      return [
        t('assistant.prompt.recent.focus'),
        t('assistant.prompt.recent.unread'),
        t('assistant.prompt.recent.approvals'),
        t('assistant.prompt.recent.meetings'),
      ];
    case 'inbox':
      return [
        t('assistant.prompt.inbox.triage'),
        t('assistant.prompt.inbox.urgent'),
        t('assistant.prompt.inbox.markAll'),
        t('assistant.prompt.inbox.actionRequired'),
      ];
    case 'chat':
      return [
        t('assistant.prompt.chat.draft'),
        t('assistant.prompt.chat.summarize'),
        t('assistant.prompt.chat.schedule'),
        t('assistant.prompt.chat.findFiles'),
      ];
    case 'apps':
      return [
        t('assistant.prompt.apps.recommend'),
        t('assistant.prompt.apps.compare'),
        t('assistant.prompt.apps.trending'),
        t('assistant.prompt.apps.verified'),
      ];
    case 'space-channel':
      return [
        t('assistant.prompt.channel.summarize', { channelName: ctx.channelName || '' }),
        t('assistant.prompt.channel.decisions'),
        t('assistant.prompt.channel.actionItems'),
        t('assistant.prompt.channel.mostActive', { channelName: ctx.channelName || '' }),
      ];
    case 'space-docs':
      return [
        t('assistant.prompt.docs.recent'),
        t('assistant.prompt.docs.create'),
        t('assistant.prompt.docs.review'),
        t('assistant.prompt.docs.changes'),
      ];
    case 'space-files':
      return [
        t('assistant.prompt.files.large'),
        t('assistant.prompt.files.topUploader'),
        t('assistant.prompt.files.search'),
        t('assistant.prompt.files.external'),
      ];
    case 'space-tasks':
      return [
        t('assistant.prompt.tasks.overdue'),
        t('assistant.prompt.tasks.assigned'),
        t('assistant.prompt.tasks.create'),
        t('assistant.prompt.tasks.burndown'),
      ];
    case 'space-dashboard':
      return [
        t('assistant.prompt.dashboard.explain'),
        t('assistant.prompt.dashboard.attention'),
        t('assistant.prompt.dashboard.compare'),
        t('assistant.prompt.dashboard.report'),
      ];
    case 'space-apps':
      return [
        t('assistant.prompt.spaceApps.updates'),
        t('assistant.prompt.spaceApps.usage'),
        t('assistant.prompt.spaceApps.recommend'),
        t('assistant.prompt.spaceApps.health'),
      ];
    case 'space-app-detail':
      return [
        t('assistant.prompt.appDetail.activity'),
        t('assistant.prompt.appDetail.connection'),
        t('assistant.prompt.appDetail.diagnostic'),
        t('assistant.prompt.appDetail.configure'),
      ];
    default:
      return [
        t('assistant.prompt.default.help'),
        t('assistant.prompt.default.search'),
        t('assistant.prompt.default.summary'),
        t('assistant.prompt.default.draft'),
      ];
  }
}

// ─── Card response generators ───

function generateContextualCard(
  query: string,
  ctx: PageContext,
  t: (key: string, vars?: Record<string, string | number>) => string,
): { content: string; card?: AdaptiveCardData } {
  const q = query.toLowerCase();

  // Summarize
  if (q.includes('summarize') || q.includes('summary') || q.includes('recap')) {
    const target = ctx.channelName ? `#${ctx.channelName}` : ctx.spaceName || t('assistant.card.summary.defaultTarget');
    return {
      content: t('assistant.card.summary.intro', { target }),
      card: {
        type: 'AdaptiveCard', accentColor: '#5b5fc7',
        body: [
          { type: 'columnSet', columns: [
            { width: 'stretch', items: [
              { type: 'textBlock', text: t('assistant.card.summary.title', { target }), size: 'medium', weight: 'bolder' },
              { type: 'textBlock', text: t('assistant.card.summary.subtitle'), size: 'small', color: 'muted' },
            ]},
            { width: 'auto', items: [{ type: 'badge', text: t('assistant.card.summary.badge'), color: 'purple' }] },
          ]},
          { type: 'separator' },
          { type: 'container', style: 'emphasis', items: [
            { type: 'textBlock', text: t('assistant.card.summary.section.keyDiscussions'), weight: 'bolder', size: 'small' },
            { type: 'statusList', items: [
              { label: 'Project timeline was updated — new deadline is March 15', status: 'info' },
              { label: 'API integration completed and deployed to staging', status: 'success' },
              { label: 'Design review scheduled for tomorrow at 2 PM', status: 'pending' },
            ]},
          ]},
          { type: 'separator' },
          { type: 'container', style: 'accent', items: [
            { type: 'textBlock', text: t('assistant.card.summary.section.actionItems'), weight: 'bolder', size: 'small', color: 'accent' },
            { type: 'factSet', facts: [
              { title: 'You', value: 'Review PR #482 before EOD' },
              { title: 'Bob', value: 'Update API docs with new endpoints' },
              { title: 'Alice', value: 'Finalize design mockups for mobile' },
            ]},
          ]},
          { type: 'actionSet', actions: [
            { title: t('assistant.card.summary.action.share'), style: 'accent' },
            { title: t('assistant.card.summary.action.createTasks'), style: 'positive' },
            { title: t('assistant.card.summary.action.deeperAnalysis'), style: 'default' },
          ]},
        ],
      },
    };
  }

  // Focus / priorities
  if (q.includes('focus') || q.includes('priorities') || q.includes('should i') || q.includes('todo') || q.includes('to do')) {
    return {
      content: t('assistant.card.focus.intro'),
      card: {
        type: 'AdaptiveCard', accentColor: '#d4820c',
        body: [
          { type: 'columnSet', columns: [
            { width: 'stretch', items: [
              { type: 'textBlock', text: t('assistant.card.focus.title'), size: 'medium', weight: 'bolder' },
            ]},
            { width: 'auto', items: [{ type: 'badge', text: t('assistant.card.focus.badge'), color: 'orange' }] },
          ]},
          { type: 'separator' },
          { type: 'container', style: 'attention', items: [
            { type: 'textBlock', text: t('assistant.card.focus.section.urgent'), weight: 'bolder', size: 'small', color: 'attention' },
            { type: 'statusList', items: [
              { label: 'Review PR #482 — Bob requested your review', status: 'error', value: 'Due now' },
              { label: 'Respond to Acme Corp proposal — Jane waiting', status: 'warning', value: '2 hrs left' },
            ]},
          ]},
          { type: 'container', style: 'emphasis', items: [
            { type: 'textBlock', text: t('assistant.card.focus.section.important'), weight: 'bolder', size: 'small' },
            { type: 'statusList', items: [
              { label: 'Sprint planning meeting at 2:00 PM', status: 'info', value: 'In 3 hrs' },
              { label: 'Update project roadmap document', status: 'pending', value: 'Due today' },
              { label: 'Review Q1 budget allocation', status: 'pending', value: 'Due today' },
            ]},
          ]},
          { type: 'actionSet', actions: [
            { title: t('assistant.card.focus.action.startFocus'), style: 'accent' },
            { title: t('assistant.card.focus.action.blockCalendar'), style: 'default' },
            { title: t('assistant.card.focus.action.snoozeAll'), style: 'default' },
          ]},
        ],
      },
    };
  }

  // Tasks / create
  if (q.includes('create') || q.includes('new task') || q.includes('add task')) {
    return {
      content: t('assistant.card.create.intro'),
      card: {
        type: 'AdaptiveCard', accentColor: '#237b4b',
        body: [
          { type: 'textBlock', text: t('assistant.card.create.title'), size: 'medium', weight: 'bolder' },
          { type: 'textBlock', text: ctx.spaceName ? t('assistant.card.create.inSpace', { spaceName: ctx.spaceName }) : t('assistant.card.create.selectDestination'), size: 'small', color: 'muted' },
          { type: 'separator' },
          { type: 'inputText', id: 'title', label: t('assistant.card.create.label.title'), placeholder: t('assistant.card.create.placeholder.title') },
          { type: 'inputText', id: 'desc', label: t('assistant.card.create.label.description'), placeholder: t('assistant.card.create.placeholder.description'), isMultiline: true },
          { type: 'columnSet', columns: [
            { width: 'stretch', items: [
              { type: 'inputChoiceSet', id: 'type', label: t('assistant.card.create.label.type'), style: 'compact', choices: [
                { title: t('assistant.card.create.choice.task'), value: 'task' },
                { title: t('assistant.card.create.choice.bug'), value: 'bug' },
                { title: t('assistant.card.create.choice.feature'), value: 'feature' },
                { title: t('assistant.card.create.choice.document'), value: 'doc' },
              ]},
            ]},
            { width: 'stretch', items: [
              { type: 'inputChoiceSet', id: 'priority', label: t('assistant.card.create.label.priority'), style: 'compact', choices: [
                { title: t('assistant.card.create.choice.low'), value: 'low' },
                { title: t('assistant.card.create.choice.medium'), value: 'medium' },
                { title: t('assistant.card.create.choice.high'), value: 'high' },
                { title: t('assistant.card.create.choice.critical'), value: 'critical' },
              ]},
            ]},
          ]},
          { type: 'inputChoiceSet', id: 'assignee', label: t('assistant.card.create.label.assignTo'), style: 'compact', choices: [
            { title: t('assistant.card.create.choice.me'), value: 'me' },
            { title: 'Bob Johnson', value: 'bob' },
            { title: 'Alice Williams', value: 'alice' },
            { title: 'Charlie Brown', value: 'charlie' },
            { title: 'Jane Smith', value: 'jane' },
          ]},
          { type: 'inputToggle', id: 'notify', label: t('assistant.card.create.label.notify'), defaultValue: true },
          { type: 'separator' },
          { type: 'actionSet', actions: [
            { title: t('assistant.card.create.action.create'), style: 'positive' },
            { title: t('assistant.card.create.action.cancel'), style: 'default' },
          ]},
        ],
      },
    };
  }

  // Draft
  if (q.includes('draft') || q.includes('write') || q.includes('compose') || q.includes('reply')) {
    return {
      content: t('assistant.card.draft.intro'),
      card: {
        type: 'AdaptiveCard', accentColor: '#8764b8',
        body: [
          { type: 'columnSet', columns: [
            { width: 'stretch', items: [
              { type: 'textBlock', text: t('assistant.card.draft.title'), size: 'medium', weight: 'bolder' },
            ]},
            { width: 'auto', items: [{ type: 'badge', text: t('assistant.card.draft.badge'), color: 'purple' }] },
          ]},
          { type: 'separator' },
          { type: 'container', style: 'emphasis', items: [
            { type: 'textBlock', text: 'Hi team,\n\nI wanted to share a quick update on our progress this week:\n\n1. The API integration is now complete and deployed to staging\n2. Design review is scheduled for tomorrow at 2 PM\n3. We\'re on track for the March 15 deadline\n\nPlease review and let me know if you have any questions.\n\nBest,\nYou', size: 'small', wrap: true },
          ]},
          { type: 'actionSet', actions: [
            { title: t('assistant.card.draft.action.send'), style: 'accent' },
            { title: t('assistant.card.draft.action.edit'), style: 'default' },
            { title: t('assistant.card.draft.action.regenerate'), style: 'default' },
          ]},
        ],
      },
    };
  }

  // Search
  if (q.includes('search') || q.includes('find') || q.includes('look for') || q.includes('where')) {
    const searchTerm = q.replace(/search|find|look for|where|is|are|the|can i|you/gi, '').trim() || t('assistant.card.search.defaultQuery');
    return {
      content: t('assistant.card.search.intro', { query: searchTerm }),
      card: {
        type: 'AdaptiveCard', accentColor: '#0078d4',
        body: [
          { type: 'columnSet', columns: [
            { width: 'stretch', items: [
              { type: 'textBlock', text: t('assistant.card.search.title'), size: 'medium', weight: 'bolder' },
              { type: 'textBlock', text: t('assistant.card.search.subtitle'), size: 'small', color: 'muted' },
            ]},
            { width: 'auto', items: [{ type: 'badge', text: t('assistant.card.search.badge'), color: 'blue' }] },
          ]},
          { type: 'separator' },
          { type: 'statusList', items: [
            { label: '#eng-backend — "...API rate limiting was discussed in depth..."', status: 'info', value: 'Message' },
            { label: 'API Documentation.docx — Contains detailed endpoint specs', status: 'info', value: 'Document' },
            { label: 'ENG-342 — API rate limiting middleware task', status: 'success', value: 'Task' },
            { label: '#general — "...meeting notes about API changes..."', status: 'info', value: 'Message' },
          ]},
          { type: 'actionSet', actions: [
            { title: t('assistant.card.search.action.viewAll'), style: 'accent' },
            { title: t('assistant.card.search.action.refine'), style: 'default' },
          ]},
        ],
      },
    };
  }

  // Meeting / schedule
  if (q.includes('meeting') || q.includes('schedule') || q.includes('calendar') || q.includes('agenda')) {
    return {
      content: t('assistant.card.schedule.intro'),
      card: {
        type: 'AdaptiveCard', accentColor: '#4285F4',
        body: [
          { type: 'textBlock', text: t('assistant.card.schedule.title'), size: 'medium', weight: 'bolder' },
          { type: 'textBlock', text: 'Sunday, Feb 15, 2026', size: 'small', color: 'muted' },
          { type: 'separator' },
          { type: 'table', striped: true, columns: [{ label: t('assistant.card.schedule.column.time'), width: '25%' }, { label: t('assistant.card.schedule.column.meeting') }, { label: t('assistant.card.schedule.column.with') }], rows: [
            { cells: ['10:00 AM', 'Standup', 'Engineering'], highlight: false },
            { cells: ['11:30 AM', 'Design Review', 'Alice, Bob'], highlight: false },
            { cells: ['2:00 PM', 'Sprint Planning', 'Full Team'], highlight: true },
            { cells: ['4:00 PM', '1:1 with Jane', 'Jane Smith'], highlight: false },
          ]},
          { type: 'separator' },
          { type: 'metricRow', metrics: [
            { label: t('assistant.card.schedule.metric.meetings'), value: '4' },
            { label: t('assistant.card.schedule.metric.focusTime'), value: '3.5h' },
            { label: t('assistant.card.schedule.metric.next'), value: '1h 15m' },
          ]},
          { type: 'actionSet', actions: [
            { title: t('assistant.card.schedule.action.joinNext'), style: 'accent' },
            { title: t('assistant.card.schedule.action.scheduleNew'), style: 'default' },
            { title: t('assistant.card.schedule.action.blockFocus'), style: 'positive' },
          ]},
        ],
      },
    };
  }

  // Metrics / analytics / status
  if (q.includes('metric') || q.includes('stats') || q.includes('analytics') || q.includes('status') || q.includes('trend')) {
    return {
      content: t('assistant.card.metrics.intro'),
      card: {
        type: 'AdaptiveCard', accentColor: '#8764b8',
        body: [
          { type: 'textBlock', text: ctx.spaceName ? t('assistant.card.metrics.titleSpace', { spaceName: ctx.spaceName }) : t('assistant.card.metrics.titleWorkspace'), size: 'medium', weight: 'bolder' },
          { type: 'metricRow', metrics: [
            { label: t('assistant.card.metrics.metric.messages'), value: '1,247', change: '+12%', changeType: 'up' },
            { label: t('assistant.card.metrics.metric.activeUsers'), value: '23', change: '+2', changeType: 'up' },
            { label: t('assistant.card.metrics.metric.tasksDone'), value: '48', change: '+18%', changeType: 'up' },
            { label: t('assistant.card.metrics.metric.openIssues'), value: '7', change: '-3', changeType: 'down' },
          ]},
          { type: 'separator' },
          { type: 'progressBar', label: t('assistant.card.metrics.progress.sprint'), value: 34, max: 42, color: 'green' },
          { type: 'progressBar', label: t('assistant.card.metrics.progress.quarterly'), value: 7, max: 10, color: 'purple' },
          { type: 'progressBar', label: t('assistant.card.metrics.progress.bugResolution'), value: 15, max: 22, color: 'blue' },
          { type: 'separator' },
          { type: 'container', style: 'emphasis', items: [
            { type: 'textBlock', text: t('assistant.card.metrics.section.insights'), weight: 'bolder', size: 'small' },
            { type: 'statusList', items: [
              { label: 'Team velocity is 12% above average this sprint', status: 'success' },
              { label: '3 tasks at risk of missing their deadline', status: 'warning' },
              { label: 'Response time improved by 8% week-over-week', status: 'success' },
            ]},
          ]},
          { type: 'actionSet', actions: [
            { title: t('assistant.card.metrics.action.fullReport'), style: 'accent' },
            { title: t('assistant.card.metrics.action.export'), style: 'default' },
          ]},
        ],
      },
    };
  }

  // Overdue / urgent / triage
  if (q.includes('overdue') || q.includes('urgent') || q.includes('triage') || q.includes('blocker') || q.includes('attention')) {
    return {
      content: t('assistant.card.attention.intro'),
      card: {
        type: 'AdaptiveCard', accentColor: '#c4314b',
        body: [
          { type: 'columnSet', columns: [
            { width: 'stretch', items: [
              { type: 'textBlock', text: t('assistant.card.attention.title'), size: 'medium', weight: 'bolder' },
            ]},
            { width: 'auto', items: [{ type: 'badge', text: t('assistant.card.attention.badge'), color: 'red' }] },
          ]},
          { type: 'separator' },
          { type: 'container', style: 'attention', items: [
            { type: 'statusList', items: [
              { label: 'PR #479 has merge conflicts — blocking release', status: 'error', value: 'Critical' },
              { label: 'Staging environment down since 9:30 AM', status: 'error', value: 'Critical' },
              { label: 'Client escalation — Acme Corp contract renewal', status: 'warning', value: 'High' },
            ]},
          ]},
          { type: 'separator' },
          { type: 'container', style: 'warning', items: [
            { type: 'textBlock', text: t('assistant.card.attention.section.deadlines'), weight: 'bolder', size: 'small', color: 'warning' },
            { type: 'factSet', facts: [
              { title: 'ENG-345', value: 'API pagination fix — Due today' },
              { title: 'Design V3', value: 'Mobile mockups — Due tomorrow' },
            ]},
          ]},
          { type: 'actionSet', actions: [
            { title: t('assistant.card.attention.action.resolve'), style: 'destructive' },
            { title: t('assistant.card.attention.action.notify'), style: 'accent' },
            { title: t('assistant.card.attention.action.snooze'), style: 'default' },
          ]},
        ],
      },
    };
  }

  // Help / what can you do
  if (q.includes('help') || q.includes('what can') || q.includes('how do') || q.includes('capabilities')) {
    return {
      content: t('assistant.card.help.intro'),
      card: {
        type: 'AdaptiveCard', accentColor: '#5b5fc7',
        body: [
          { type: 'textBlock', text: t('assistant.card.help.title'), size: 'medium', weight: 'bolder' },
          { type: 'textBlock', text: t('assistant.card.help.subtitle'), size: 'small', color: 'muted' },
          { type: 'separator' },
          { type: 'factSet', facts: [
            { title: t('assistant.card.help.fact.summarize.title'), value: t('assistant.card.help.fact.summarize.value') },
            { title: t('assistant.card.help.fact.search.title'), value: t('assistant.card.help.fact.search.value') },
            { title: t('assistant.card.help.fact.draft.title'), value: t('assistant.card.help.fact.draft.value') },
            { title: t('assistant.card.help.fact.analyze.title'), value: t('assistant.card.help.fact.analyze.value') },
            { title: t('assistant.card.help.fact.create.title'), value: t('assistant.card.help.fact.create.value') },
            { title: t('assistant.card.help.fact.translate.title'), value: t('assistant.card.help.fact.translate.value') },
            { title: t('assistant.card.help.fact.triage.title'), value: t('assistant.card.help.fact.triage.value') },
            { title: t('assistant.card.help.fact.schedule.title'), value: t('assistant.card.help.fact.schedule.value') },
          ]},
          { type: 'separator' },
          { type: 'container', style: 'emphasis', items: [
            { type: 'textBlock', text: t('assistant.card.help.proTip'), size: 'small', color: 'accent' },
          ]},
        ],
      },
    };
  }

  // Translate
  if (q.includes('translate') || q.includes('translation')) {
    return {
      content: t('assistant.card.translate.intro'),
      card: {
        type: 'AdaptiveCard', accentColor: '#0078d4',
        body: [
          { type: 'textBlock', text: t('assistant.card.translate.title'), size: 'medium', weight: 'bolder' },
          { type: 'columnSet', columns: [
            { width: 'stretch', items: [
              { type: 'inputChoiceSet', id: 'from', label: t('assistant.card.translate.label.from'), style: 'compact', choices: [
                { title: t('assistant.card.translate.lang.english'), value: 'en' },
                { title: t('assistant.card.translate.lang.spanish'), value: 'es' },
                { title: t('assistant.card.translate.lang.french'), value: 'fr' },
                { title: t('assistant.card.translate.lang.german'), value: 'de' },
              ]},
            ]},
            { width: 'stretch', items: [
              { type: 'inputChoiceSet', id: 'to', label: t('assistant.card.translate.label.to'), style: 'compact', choices: [
                { title: t('assistant.card.translate.lang.spanish'), value: 'es' },
                { title: t('assistant.card.translate.lang.french'), value: 'fr' },
                { title: t('assistant.card.translate.lang.german'), value: 'de' },
                { title: t('assistant.card.translate.lang.japanese'), value: 'ja' },
                { title: t('assistant.card.translate.lang.portuguese'), value: 'pt' },
              ]},
            ]},
          ]},
          { type: 'inputText', id: 'text', label: t('assistant.card.translate.label.text'), placeholder: t('assistant.card.translate.placeholder.text'), isMultiline: true },
          { type: 'actionSet', actions: [
            { title: t('assistant.card.translate.action.translate'), style: 'accent' },
            { title: t('assistant.card.translate.action.swap'), style: 'default' },
          ]},
        ],
      },
    };
  }

  // Approve / approval
  if (q.includes('approv') || q.includes('pending') || q.includes('review')) {
    return {
      content: t('assistant.card.approvals.intro'),
      card: {
        type: 'AdaptiveCard', accentColor: '#d4820c',
        body: [
          { type: 'columnSet', columns: [
            { width: 'stretch', items: [
              { type: 'textBlock', text: t('assistant.card.approvals.title'), size: 'medium', weight: 'bolder' },
            ]},
            { width: 'auto', items: [{ type: 'badge', text: t('assistant.card.approvals.badge'), color: 'orange' }] },
          ]},
          { type: 'separator' },
          { type: 'table', striped: true, columns: [{ label: t('assistant.card.approvals.table.item') }, { label: t('assistant.card.approvals.table.from') }, { label: t('assistant.card.approvals.table.type') }, { label: t('assistant.card.approvals.table.age') }], rows: [
            { cells: ['PR #482 — WebSocket logic', 'Bob Johnson', 'Code Review', '2h'], highlight: true },
            { cells: ['Q1 Budget increase', 'Jane Smith', 'Approval', '1d'] },
            { cells: ['New hire: Sarah Chen', 'HR', 'Approval', '2d'] },
            { cells: ['Design V3 mockups', 'Alice Williams', 'Review', '3h'] },
          ]},
          { type: 'actionSet', actions: [
            { title: t('assistant.card.approvals.action.reviewFirst'), style: 'accent' },
            { title: t('assistant.card.approvals.action.approveAll'), style: 'positive' },
            { title: t('assistant.card.approvals.action.delegate'), style: 'default' },
          ]},
        ],
      },
    };
  }

  // Default — generic response without card
  return {
    content: t('assistant.card.defaultResponse', { context: ctx.label }),
  };
}

// ─── Main component ───

export function GlobalAIAssistant() {
  const { isOpen, activePanel, close } = useAIAssistant();
  const { t } = useI18n();
  const ctx = usePageContext();

  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const slashCommands = useMemo(() => getSlashCommands(t), [t]);
  const contextPrompts = useMemo(() => getContextPrompts(ctx, t), [ctx, t]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'system',
        content: '',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (value === '/') {
      setShowSlashMenu(true);
      setSlashFilter('');
    } else if (value.startsWith('/') && !value.includes(' ')) {
      setShowSlashMenu(true);
      setSlashFilter(value);
    } else {
      setShowSlashMenu(false);
    }
  };

  const handleSlashSelect = (cmd: SlashCommand) => {
    setInput(cmd.command + ' ');
    setShowSlashMenu(false);
    inputRef.current?.focus();
  };

  const handleSend = useCallback((text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    const userMsg: AIChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowSlashMenu(false);
    setIsTyping(true);

    setTimeout(() => {
      const response = generateContextualCard(content, ctx, t);
      const botMsg: AIChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        card: response.card,
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  }, [input, ctx, t]);

  const clearHistory = () => {
    setMessages([{
      id: 'welcome-new',
      role: 'system',
      content: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  const filteredSlash = slashCommands.filter(c =>
    !slashFilter || c.command.startsWith(slashFilter)
  );

  const autoResizeCopilot = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, []);

  const wrapCopilotSelection = useCallback((before: string, after: string) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.slice(start, end);
    const replacement = before + (selected || 'text') + after;
    const newVal = text.slice(0, start) + replacement + text.slice(end);
    handleInputChange(newVal);
    requestAnimationFrame(() => {
      el.focus();
      if (selected) {
        el.setSelectionRange(start + replacement.length, start + replacement.length);
      } else {
        el.setSelectionRange(start + before.length, start + before.length + 4);
      }
    });
  }, []);

  const insertCopilotPrefix = useCallback((prefix: string) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const text = el.value;
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const newVal = text.slice(0, lineStart) + prefix + text.slice(lineStart);
    handleInputChange(newVal);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  }, []);

  if (!isOpen) return null;

  const spaceIconMap: Record<string, React.ReactNode> = {
    general: <Building2 size={12} />,
    engineering: <Code2 size={12} />,
    design: <Palette size={12} />,
    marketing: <Megaphone size={12} />,
  };

  return (
    <div className="w-[400px] h-full border-l border-[#e1dfdd] dark:border-[#3d3d3d] flex flex-col bg-white dark:bg-[#1f1f1f] shrink-0">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
          {activePanel === 'copilot' ? <Sparkles size={18} className="text-white" /> : <LifeBuoy size={18} className="text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[14px] font-semibold text-white">{activePanel === 'copilot' ? t('assistant.title') : t('assistant.helpDesk.title')}</h2>
          <p className="text-[11px] text-white/60 truncate">{activePanel === 'copilot' ? ctx.label : t('assistant.helpDesk.subtitle')}</p>
        </div>
        {activePanel === 'copilot' && (
          <button
            onClick={clearHistory}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
            title={t('assistant.clearChat')}
          >
            <Trash2 size={14} />
          </button>
        )}
        <button
          onClick={close}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          title={t('common.close')}
        >
          <X size={16} />
        </button>
      </div>

      {/* Help Desk Panel */}
      {activePanel === 'helpdesk' && <HelpDesk />}

      {/* Copilot Panel */}
      {activePanel === 'copilot' && (
        <>
          {/* Context bar */}
          <div className="shrink-0 px-4 py-2 bg-[#faf9f8] dark:bg-[#252525] border-b border-[#e1dfdd] dark:border-[#3d3d3d] flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#eeeef8] dark:bg-[#5b5fc7]/10 rounded-md text-[11px] font-medium text-[#5b5fc7] dark:text-[#a6a9dc]">
              {ctx.spaceId ? (spaceIconMap[ctx.spaceId] || <Hash size={12} />) : <LayoutDashboard size={12} />}
              <span className="truncate max-w-[100px]">{ctx.label}</span>
            </div>
            <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">{t('assistant.contextAware')}</span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-on-hover">
            {messages.map(msg => {
              if (msg.role === 'system') {
                return (
                  <div key={msg.id} className="flex flex-col items-center text-center py-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5b5fc7] to-[#7b4db8] flex items-center justify-center mb-3 shadow-lg shadow-[#5b5fc7]/20">
                      <Sparkles size={28} className="text-white" />
                    </div>
                    <h3 className="text-[15px] font-semibold text-[#242424] dark:text-[#f0f0f0] mb-1">{t('assistant.greetingTitle')}</h3>
                    <p className="text-[12px] text-[#8a8a8a] dark:text-[#6d6f78] max-w-[280px] mb-4">
                      {t('assistant.greetingSubtitle')}
                    </p>
                    <div className="w-full space-y-1.5">
                      {contextPrompts.slice(0, 4).map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(prompt)}
                          className="w-full text-left px-3 py-2 rounded-lg bg-[#f5f5f5] dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/40 hover:bg-[#eeeef8] dark:hover:bg-[#5b5fc7]/5 transition-all group"
                        >
                          <span className="text-[12px] text-[#424242] dark:text-[#c8c8c8] group-hover:text-[#5b5fc7] dark:group-hover:text-[#a6a9dc] transition-colors">{prompt}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex gap-2.5 justify-end">
                    <div className="max-w-[80%]">
                      <div className="bg-[#5b5fc7] text-white rounded-2xl rounded-br-md px-3.5 py-2">
                        <div className="text-[13px]">
                          <MarkdownContent content={msg.content} variant="light" />
                        </div>
                        <p className="text-[10px] text-white/50 mt-1">{msg.time}</p>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#e8e8f8] dark:bg-[#3d3d3d] flex items-center justify-center shrink-0 mt-0.5">
                      <User size={12} className="text-[#5b5fc7]" />
                    </div>
                  </div>
                );
              }

              // Assistant message
              return (
                <div key={msg.id} className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#5b5fc7] to-[#7b4db8] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={12} className="text-white" />
                  </div>
                  <div className={`${msg.card ? 'max-w-[92%]' : 'max-w-[80%]'}`}>
                    <div className="bg-[#f5f5f5] dark:bg-[#252525] text-[#242424] dark:text-[#e0e0e0] rounded-2xl rounded-bl-md px-3.5 py-2">
                      <div className="text-[13px]">
                        <MarkdownContent content={msg.content} />
                      </div>
                      <p className="text-[10px] text-[#b9bbbe] dark:text-[#5a5a5a] mt-1">{msg.time}</p>
                    </div>
                    {msg.card && <AdaptiveCard card={msg.card} />}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#5b5fc7] to-[#7b4db8] flex items-center justify-center shrink-0">
                  <Sparkles size={12} className="text-white" />
                </div>
                <div className="bg-[#f5f5f5] dark:bg-[#252525] rounded-2xl rounded-bl-md px-3.5 py-2.5">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8a8a8a] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8a8a8a] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8a8a8a] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts (show when few messages) */}
          {messages.length > 1 && messages.length < 5 && (
            <div className="shrink-0 px-4 pb-2 flex items-center gap-1.5 overflow-x-auto">
              <Lightbulb size={11} className="text-[#8a8a8a] shrink-0" />
              {contextPrompts.slice(0, 3).map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#f0f0f0] dark:bg-[#252525] text-[#424242] dark:text-[#c8c8c8] hover:bg-[#eeeef8] dark:hover:bg-[#333] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc] transition-colors whitespace-nowrap border border-transparent hover:border-[#5b5fc7]/20"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Slash command menu */}
          {showSlashMenu && filteredSlash.length > 0 && (
            <div className="shrink-0 mx-4 mb-2 bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-xl shadow-lg overflow-hidden">
              <div className="px-3 py-1.5 bg-[#faf9f8] dark:bg-[#1e1f22] border-b border-[#f0f0f0] dark:border-[#333]">
                <span className="text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">{t('assistant.slash.title')}</span>
              </div>
              {filteredSlash.map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => handleSlashSelect(cmd)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-[#eeeef8] dark:bg-[#5b5fc7]/10 flex items-center justify-center text-[#5b5fc7] dark:text-[#a6a9dc]">
                    {cmd.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#242424] dark:text-[#e0e0e0]">{cmd.command}</p>
                    <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">{cmd.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="shrink-0 px-4 py-3 border-t border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#252525]">
            {/* Compact formatting toolbar */}
            <motion.div
              className="flex items-center gap-0.5 mb-1.5 flex-wrap"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {([
                { icon: <Bold size={13} />, action: () => wrapCopilotSelection('**', '**'), tip: t('assistant.format.bold') },
                { icon: <Italic size={13} />, action: () => wrapCopilotSelection('_', '_'), tip: t('assistant.format.italic') },
                { icon: <Strikethrough size={13} />, action: () => wrapCopilotSelection('~~', '~~'), tip: t('assistant.format.strikethrough') },
                { icon: <Code size={13} />, action: () => wrapCopilotSelection('`', '`'), tip: t('assistant.format.inlineCode') },
              ] as Array<{ icon: React.ReactNode; action: () => void; tip: string }>).map(item => (
                <Tooltip key={item.tip}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={item.action}
                      className="h-7 w-7 text-[#616161] dark:text-[#9e9e9e] hover:bg-[#e8e8f8] dark:hover:bg-[#333] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc]"
                    >
                      {item.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={4}>{item.tip}</TooltipContent>
                </Tooltip>
              ))}

              <Separator orientation="vertical" className="mx-0.5 h-3.5 bg-[#e1dfdd] dark:bg-[#3d3d3d]" />

              {([
                { icon: <List size={13} />, action: () => insertCopilotPrefix('- '), tip: t('assistant.format.bulletList') },
                { icon: <ListOrdered size={13} />, action: () => insertCopilotPrefix('1. '), tip: t('assistant.format.numberedList') },
                { icon: <Quote size={13} />, action: () => insertCopilotPrefix('> '), tip: t('assistant.format.blockquote') },
                { icon: <Link2 size={13} />, action: () => wrapCopilotSelection('[', '](url)'), tip: t('assistant.format.link') },
              ] as Array<{ icon: React.ReactNode; action: () => void; tip: string }>).map(item => (
                <Tooltip key={item.tip}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={item.action}
                      className="h-7 w-7 text-[#616161] dark:text-[#9e9e9e] hover:bg-[#e8e8f8] dark:hover:bg-[#333] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc]"
                    >
                      {item.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={4}>{item.tip}</TooltipContent>
                </Tooltip>
              ))}

              <div className="ml-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle
                      size="sm"
                      pressed={showPreview}
                      onPressedChange={setShowPreview}
                      className={cn(
                        'gap-1 px-2 h-7 text-[10px]',
                        showPreview && 'bg-[#5b5fc7]/10 text-[#5b5fc7] dark:bg-[#5b5fc7]/20 dark:text-[#a6a9dc]',
                      )}
                    >
                      <Eye size={12} />
                      {t('assistant.preview')}
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={4}>{t('assistant.togglePreview')}</TooltipContent>
                </Tooltip>
              </div>
            </motion.div>

            {/* Markdown preview */}
            <AnimatePresence>
              {showPreview && input.trim() && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="mb-1.5 px-3 py-2 bg-white dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-[13px] text-[#242424] dark:text-[#e0e0e0]">
                    <p className="text-[9px] text-[#8a8a8a] mb-1 uppercase tracking-wider">{t('assistant.preview')}</p>
                    <MarkdownContent content={input} animate />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => { handleInputChange(e.target.value); autoResizeCopilot(); }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && !showSlashMenu) {
                      e.preventDefault();
                      handleSend();
                    }
                    if (e.key === 'Escape') {
                      setShowSlashMenu(false);
                    }
                  }}
                  placeholder={t('assistant.placeholder')}
                  className="w-full pl-3.5 pr-9 py-2 bg-white dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-xl text-[13px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/40 transition-all resize-none overflow-y-auto scrollbar-on-hover"
                  rows={1}
                  style={{ maxHeight: 120 }}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1.5 top-1 h-7 w-7 text-[#b9bbbe] dark:text-[#5a5a5a] hover:text-[#5b5fc7]"
                      onClick={() => {
                        setInput('/');
                        handleInputChange('/');
                        inputRef.current?.focus();
                      }}
                    >
                      <Slash size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={4}>{t('assistant.slash.title')}</TooltipContent>
                </Tooltip>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileTap={input.trim() ? { scale: 0.9 } : {}}>
                    <Button
                      onClick={() => handleSend()}
                      disabled={!input.trim()}
                      size="icon"
                      className={cn(
                        'h-9 w-9 rounded-xl shrink-0 transition-all',
                        input.trim()
                          ? 'bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8] text-white shadow-sm hover:shadow-md'
                          : 'bg-[#f0f0f0] dark:bg-[#333] text-[#b9bbbe] dark:text-[#5a5a5a]',
                      )}
                    >
                      <Send size={14} />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={4}>{t('assistant.sendMessage')}</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1.5 text-center">
              {t('assistant.markdownHelp')}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
