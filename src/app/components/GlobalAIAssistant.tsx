import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useLocation } from 'react-router';
import { Button, Tooltip, TooltipTrigger, TooltipContent, Separator, Toggle } from "@/components/ui";
import {  X, Send, Sparkles, Bot, User, Trash2,
  ChevronDown, Slash, AtSign, Hash, Globe,
  Lightbulb, Zap, FileText, Search, MessageSquare,
  Code2, Palette, Megaphone, Building2, LayoutDashboard,
  Bold, Italic, Strikethrough, Code, List, ListOrdered, Link2, Quote, Eye,
  LifeBuoy,
} from 'lucide-react';
import { useAIAssistant } from '../context/AIAssistantContext';
import { AdaptiveCard, type AdaptiveCardData } from './AdaptiveCard';
import { spaces } from '../data/mockData';
import { MarkdownContent } from './MarkdownContent';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from "@/lib/utils";
import { HelpDesk } from './HelpDesk';

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
  const path = location.pathname;

  if (path === '/' || path === '/recent') return { type: 'recent', label: 'My Dashboard' };
  if (path === '/inbox') return { type: 'inbox', label: 'Inbox' };
  if (path === '/apps') return { type: 'apps', label: 'App Store' };
  if (path.startsWith('/chat')) return { type: 'chat', label: 'Direct Messages' };

  const space = spaces.find(s => s.id === spaceId);
  const spaceName = space?.name || spaceId || '';

  if (spaceId && appId) return { type: 'space-app-detail', spaceName, spaceId, label: `${spaceName} > App` };
  if (path.endsWith('/apps')) return { type: 'space-apps', spaceName, spaceId, label: `${spaceName} > Apps` };
  if (path.endsWith('/documents')) return { type: 'space-docs', spaceName, spaceId, label: `${spaceName} > Documents` };
  if (path.endsWith('/files')) return { type: 'space-files', spaceName, spaceId, label: `${spaceName} > Files` };
  if (path.endsWith('/tasks')) return { type: 'space-tasks', spaceName, spaceId, label: `${spaceName} > Tasks` };
  if (dashboardId) return { type: 'space-dashboard', spaceName, spaceId, label: `${spaceName} > Dashboard` };

  if (spaceId && channelId) {
    const channel = space?.channels.find(c => c.id === channelId);
    return { type: 'space-channel', spaceName, spaceId, channelName: channel?.name || channelId, label: `${spaceName} > #${channel?.name || channelId}` };
  }

  return { type: 'unknown', label: 'Workspace' };
}

// ─── Slash commands ───

const slashCommands: SlashCommand[] = [
  { command: '/summarize', description: 'Summarize current channel or thread', icon: <FileText size={14} /> },
  { command: '/search', description: 'Search across all spaces and channels', icon: <Search size={14} /> },
  { command: '/create', description: 'Create a task, document, or event', icon: <Zap size={14} /> },
  { command: '/draft', description: 'Draft a message or document', icon: <MessageSquare size={14} /> },
  { command: '/analyze', description: 'Analyze trends, data, or metrics', icon: <Lightbulb size={14} /> },
  { command: '/translate', description: 'Translate text to another language', icon: <Globe size={14} /> },
];

// ─── Context-aware prompts ───

function getContextPrompts(ctx: PageContext): string[] {
  switch (ctx.type) {
    case 'recent':
      return ['What should I focus on today?', 'Summarize my unread messages', 'Show pending approvals', 'What meetings do I have?'];
    case 'inbox':
      return ['Triage my notifications', 'Which notifications are urgent?', 'Mark all read and summarize', 'Show action-required items'];
    case 'chat':
      return ['Draft a reply', 'Summarize this conversation', 'Schedule a meeting with them', 'Find shared files in this chat'];
    case 'apps':
      return ['Recommend apps for my team', 'Compare project management tools', 'Which apps are trending?', 'Show security-verified apps'];
    case 'space-channel':
      return [`Summarize #${ctx.channelName}`, 'What were the key decisions?', 'List action items from today', `Who's most active in #${ctx.channelName}?`];
    case 'space-docs':
      return ['Find recently updated docs', 'Create a new document', 'Which docs need review?', 'Summarize the latest changes'];
    case 'space-files':
      return ['Find large files to clean up', 'Who uploaded the most this week?', 'Search for a specific file', 'Show files shared externally'];
    case 'space-tasks':
      return ['Show overdue tasks', "What's assigned to me?", 'Create a new task', 'Sprint burndown status'];
    case 'space-dashboard':
      return ['Explain these metrics', 'What needs attention?', 'Compare to last week', 'Generate a report'];
    case 'space-apps':
      return ['Which apps need updates?', 'Show app usage stats', 'Recommend new integrations', 'Check app health status'];
    case 'space-app-detail':
      return ['Show recent activity', 'Check connection status', 'Run a diagnostic', 'How do I configure this?'];
    default:
      return ['What can you help me with?', 'Search across my workspace', 'Show me a daily summary', 'Help me draft a message'];
  }
}

// ─── Card response generators ───

function generateContextualCard(query: string, ctx: PageContext): { content: string; card?: AdaptiveCardData } {
  const q = query.toLowerCase();

  // Summarize
  if (q.includes('summarize') || q.includes('summary') || q.includes('recap')) {
    const target = ctx.channelName ? `#${ctx.channelName}` : ctx.spaceName || 'your workspace';
    return {
      content: `Here's a summary of ${target}:`,
      card: {
        type: 'AdaptiveCard', accentColor: '#5b5fc7',
        body: [
          { type: 'columnSet', columns: [
            { width: 'stretch', items: [
              { type: 'textBlock', text: `${target} — Summary`, size: 'medium', weight: 'bolder' },
              { type: 'textBlock', text: 'Last 24 hours · 34 messages · 5 participants', size: 'small', color: 'muted' },
            ]},
            { width: 'auto', items: [{ type: 'badge', text: 'AI Summary', color: 'purple' }] },
          ]},
          { type: 'separator' },
          { type: 'container', style: 'emphasis', items: [
            { type: 'textBlock', text: 'Key Discussions', weight: 'bolder', size: 'small' },
            { type: 'statusList', items: [
              { label: 'Project timeline was updated — new deadline is March 15', status: 'info' },
              { label: 'API integration completed and deployed to staging', status: 'success' },
              { label: 'Design review scheduled for tomorrow at 2 PM', status: 'pending' },
            ]},
          ]},
          { type: 'separator' },
          { type: 'container', style: 'accent', items: [
            { type: 'textBlock', text: 'Action Items', weight: 'bolder', size: 'small', color: 'accent' },
            { type: 'factSet', facts: [
              { title: 'You', value: 'Review PR #482 before EOD' },
              { title: 'Bob', value: 'Update API docs with new endpoints' },
              { title: 'Alice', value: 'Finalize design mockups for mobile' },
            ]},
          ]},
          { type: 'actionSet', actions: [
            { title: 'Share to Channel', style: 'accent' },
            { title: 'Create Tasks', style: 'positive' },
            { title: 'Deeper Analysis', style: 'default' },
          ]},
        ],
      },
    };
  }

  // Focus / priorities
  if (q.includes('focus') || q.includes('priorities') || q.includes('should i') || q.includes('todo') || q.includes('to do')) {
    return {
      content: 'Here\'s what needs your attention today:',
      card: {
        type: 'AdaptiveCard', accentColor: '#d4820c',
        body: [
          { type: 'columnSet', columns: [
            { width: 'stretch', items: [
              { type: 'textBlock', text: 'Today\'s Priority Items', size: 'medium', weight: 'bolder' },
            ]},
            { width: 'auto', items: [{ type: 'badge', text: '5 items', color: 'orange' }] },
          ]},
          { type: 'separator' },
          { type: 'container', style: 'attention', items: [
            { type: 'textBlock', text: 'Urgent', weight: 'bolder', size: 'small', color: 'attention' },
            { type: 'statusList', items: [
              { label: 'Review PR #482 — Bob requested your review', status: 'error', value: 'Due now' },
              { label: 'Respond to Acme Corp proposal — Jane waiting', status: 'warning', value: '2 hrs left' },
            ]},
          ]},
          { type: 'container', style: 'emphasis', items: [
            { type: 'textBlock', text: 'Important', weight: 'bolder', size: 'small' },
            { type: 'statusList', items: [
              { label: 'Sprint planning meeting at 2:00 PM', status: 'info', value: 'In 3 hrs' },
              { label: 'Update project roadmap document', status: 'pending', value: 'Due today' },
              { label: 'Review Q1 budget allocation', status: 'pending', value: 'Due today' },
            ]},
          ]},
          { type: 'actionSet', actions: [
            { title: 'Start Focus Mode', style: 'accent' },
            { title: 'Block Calendar', style: 'default' },
            { title: 'Snooze All', style: 'default' },
          ]},
        ],
      },
    };
  }

  // Tasks / create
  if (q.includes('create') || q.includes('new task') || q.includes('add task')) {
    return {
      content: 'Create a new item:',
      card: {
        type: 'AdaptiveCard', accentColor: '#237b4b',
        body: [
          { type: 'textBlock', text: 'Create New Item', size: 'medium', weight: 'bolder' },
          { type: 'textBlock', text: ctx.spaceName ? `In ${ctx.spaceName}` : 'Select a destination', size: 'small', color: 'muted' },
          { type: 'separator' },
          { type: 'inputText', id: 'title', label: 'Title', placeholder: 'Enter a title...' },
          { type: 'inputText', id: 'desc', label: 'Description', placeholder: 'Add details...', isMultiline: true },
          { type: 'columnSet', columns: [
            { width: 'stretch', items: [
              { type: 'inputChoiceSet', id: 'type', label: 'Type', style: 'compact', choices: [
                { title: 'Task', value: 'task' },
                { title: 'Bug', value: 'bug' },
                { title: 'Feature', value: 'feature' },
                { title: 'Document', value: 'doc' },
              ]},
            ]},
            { width: 'stretch', items: [
              { type: 'inputChoiceSet', id: 'priority', label: 'Priority', style: 'compact', choices: [
                { title: 'Low', value: 'low' },
                { title: 'Medium', value: 'medium' },
                { title: 'High', value: 'high' },
                { title: 'Critical', value: 'critical' },
              ]},
            ]},
          ]},
          { type: 'inputChoiceSet', id: 'assignee', label: 'Assign To', style: 'compact', choices: [
            { title: 'Me', value: 'me' },
            { title: 'Bob Johnson', value: 'bob' },
            { title: 'Alice Williams', value: 'alice' },
            { title: 'Charlie Brown', value: 'charlie' },
            { title: 'Jane Smith', value: 'jane' },
          ]},
          { type: 'inputToggle', id: 'notify', label: 'Notify assignee', defaultValue: true },
          { type: 'separator' },
          { type: 'actionSet', actions: [
            { title: 'Create', style: 'positive' },
            { title: 'Cancel', style: 'default' },
          ]},
        ],
      },
    };
  }

  // Draft
  if (q.includes('draft') || q.includes('write') || q.includes('compose') || q.includes('reply')) {
    return {
      content: 'Here\'s a draft for you:',
      card: {
        type: 'AdaptiveCard', accentColor: '#8764b8',
        body: [
          { type: 'columnSet', columns: [
            { width: 'stretch', items: [
              { type: 'textBlock', text: 'Message Draft', size: 'medium', weight: 'bolder' },
            ]},
            { width: 'auto', items: [{ type: 'badge', text: 'AI Draft', color: 'purple' }] },
          ]},
          { type: 'separator' },
          { type: 'container', style: 'emphasis', items: [
            { type: 'textBlock', text: 'Hi team,\n\nI wanted to share a quick update on our progress this week:\n\n1. The API integration is now complete and deployed to staging\n2. Design review is scheduled for tomorrow at 2 PM\n3. We\'re on track for the March 15 deadline\n\nPlease review and let me know if you have any questions.\n\nBest,\nYou', size: 'small', wrap: true },
          ]},
          { type: 'actionSet', actions: [
            { title: 'Send to Channel', style: 'accent' },
            { title: 'Edit', style: 'default' },
            { title: 'Regenerate', style: 'default' },
          ]},
        ],
      },
    };
  }

  // Search
  if (q.includes('search') || q.includes('find') || q.includes('look for') || q.includes('where')) {
    const searchTerm = q.replace(/search|find|look for|where|is|are|the|can i|you/gi, '').trim() || 'results';
    return {
      content: `Search results for "${searchTerm}":`,
      card: {
        type: 'AdaptiveCard', accentColor: '#0078d4',
        body: [
          { type: 'columnSet', columns: [
            { width: 'stretch', items: [
              { type: 'textBlock', text: `Search Results`, size: 'medium', weight: 'bolder' },
              { type: 'textBlock', text: `Found across your workspace`, size: 'small', color: 'muted' },
            ]},
            { width: 'auto', items: [{ type: 'badge', text: '12 results', color: 'blue' }] },
          ]},
          { type: 'separator' },
          { type: 'statusList', items: [
            { label: '#eng-backend — "...API rate limiting was discussed in depth..."', status: 'info', value: 'Message' },
            { label: 'API Documentation.docx — Contains detailed endpoint specs', status: 'info', value: 'Document' },
            { label: 'ENG-342 — API rate limiting middleware task', status: 'success', value: 'Task' },
            { label: '#general — "...meeting notes about API changes..."', status: 'info', value: 'Message' },
          ]},
          { type: 'actionSet', actions: [
            { title: 'View All Results', style: 'accent' },
            { title: 'Refine Search', style: 'default' },
          ]},
        ],
      },
    };
  }

  // Meeting / schedule
  if (q.includes('meeting') || q.includes('schedule') || q.includes('calendar') || q.includes('agenda')) {
    return {
      content: 'Here\'s your schedule:',
      card: {
        type: 'AdaptiveCard', accentColor: '#4285F4',
        body: [
          { type: 'textBlock', text: 'Today\'s Schedule', size: 'medium', weight: 'bolder' },
          { type: 'textBlock', text: 'Sunday, Feb 15, 2026', size: 'small', color: 'muted' },
          { type: 'separator' },
          { type: 'table', striped: true, columns: [{ label: 'Time', width: '25%' }, { label: 'Meeting' }, { label: 'With' }], rows: [
            { cells: ['10:00 AM', 'Standup', 'Engineering'], highlight: false },
            { cells: ['11:30 AM', 'Design Review', 'Alice, Bob'], highlight: false },
            { cells: ['2:00 PM', 'Sprint Planning', 'Full Team'], highlight: true },
            { cells: ['4:00 PM', '1:1 with Jane', 'Jane Smith'], highlight: false },
          ]},
          { type: 'separator' },
          { type: 'metricRow', metrics: [
            { label: 'Meetings', value: '4' },
            { label: 'Focus Time', value: '3.5h' },
            { label: 'Next', value: '1h 15m' },
          ]},
          { type: 'actionSet', actions: [
            { title: 'Join Next Meeting', style: 'accent' },
            { title: 'Schedule New', style: 'default' },
            { title: 'Block Focus Time', style: 'positive' },
          ]},
        ],
      },
    };
  }

  // Metrics / analytics / status
  if (q.includes('metric') || q.includes('stats') || q.includes('analytics') || q.includes('status') || q.includes('trend')) {
    return {
      content: `Here's a workspace overview:`,
      card: {
        type: 'AdaptiveCard', accentColor: '#8764b8',
        body: [
          { type: 'textBlock', text: ctx.spaceName ? `${ctx.spaceName} — Metrics` : 'Workspace Metrics', size: 'medium', weight: 'bolder' },
          { type: 'metricRow', metrics: [
            { label: 'Messages', value: '1,247', change: '+12%', changeType: 'up' },
            { label: 'Active Users', value: '23', change: '+2', changeType: 'up' },
            { label: 'Tasks Done', value: '48', change: '+18%', changeType: 'up' },
            { label: 'Open Issues', value: '7', change: '-3', changeType: 'down' },
          ]},
          { type: 'separator' },
          { type: 'progressBar', label: 'Sprint Progress', value: 34, max: 42, color: 'green' },
          { type: 'progressBar', label: 'Quarterly Goals', value: 7, max: 10, color: 'purple' },
          { type: 'progressBar', label: 'Bug Resolution', value: 15, max: 22, color: 'blue' },
          { type: 'separator' },
          { type: 'container', style: 'emphasis', items: [
            { type: 'textBlock', text: 'Insights', weight: 'bolder', size: 'small' },
            { type: 'statusList', items: [
              { label: 'Team velocity is 12% above average this sprint', status: 'success' },
              { label: '3 tasks at risk of missing their deadline', status: 'warning' },
              { label: 'Response time improved by 8% week-over-week', status: 'success' },
            ]},
          ]},
          { type: 'actionSet', actions: [
            { title: 'Full Report', style: 'accent' },
            { title: 'Export', style: 'default' },
          ]},
        ],
      },
    };
  }

  // Overdue / urgent / triage
  if (q.includes('overdue') || q.includes('urgent') || q.includes('triage') || q.includes('blocker') || q.includes('attention')) {
    return {
      content: 'Items requiring immediate attention:',
      card: {
        type: 'AdaptiveCard', accentColor: '#c4314b',
        body: [
          { type: 'columnSet', columns: [
            { width: 'stretch', items: [
              { type: 'textBlock', text: 'Attention Required', size: 'medium', weight: 'bolder' },
            ]},
            { width: 'auto', items: [{ type: 'badge', text: '3 urgent', color: 'red' }] },
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
            { type: 'textBlock', text: 'Approaching Deadlines', weight: 'bolder', size: 'small', color: 'warning' },
            { type: 'factSet', facts: [
              { title: 'ENG-345', value: 'API pagination fix — Due today' },
              { title: 'Design V3', value: 'Mobile mockups — Due tomorrow' },
            ]},
          ]},
          { type: 'actionSet', actions: [
            { title: 'Resolve Top Issue', style: 'destructive' },
            { title: 'Notify Team', style: 'accent' },
            { title: 'Snooze 1hr', style: 'default' },
          ]},
        ],
      },
    };
  }

  // Help / what can you do
  if (q.includes('help') || q.includes('what can') || q.includes('how do') || q.includes('capabilities')) {
    return {
      content: 'Here\'s what I can help you with:',
      card: {
        type: 'AdaptiveCard', accentColor: '#5b5fc7',
        body: [
          { type: 'textBlock', text: 'Copilot Capabilities', size: 'medium', weight: 'bolder' },
          { type: 'textBlock', text: 'I\'m available across your entire workspace. Here\'s what I can do:', size: 'small', color: 'muted' },
          { type: 'separator' },
          { type: 'factSet', facts: [
            { title: '📝 Summarize', value: 'Channels, threads, documents, meetings' },
            { title: '🔍 Search', value: 'Messages, files, tasks, people across all spaces' },
            { title: '✏️ Draft', value: 'Messages, emails, documents, meeting agendas' },
            { title: '📊 Analyze', value: 'Metrics, trends, team workload, sprint progress' },
            { title: '✅ Create', value: 'Tasks, events, documents, reminders' },
            { title: '🌐 Translate', value: 'Text to 30+ languages' },
            { title: '🔔 Triage', value: 'Notifications, emails, approvals' },
            { title: '📅 Schedule', value: 'Meetings, focus time, reminders' },
          ]},
          { type: 'separator' },
          { type: 'container', style: 'emphasis', items: [
            { type: 'textBlock', text: 'Pro Tip: Use slash commands like /summarize, /search, /create for quick actions!', size: 'small', color: 'accent' },
          ]},
        ],
      },
    };
  }

  // Translate
  if (q.includes('translate') || q.includes('translation')) {
    return {
      content: 'Translation ready:',
      card: {
        type: 'AdaptiveCard', accentColor: '#0078d4',
        body: [
          { type: 'textBlock', text: 'Translation', size: 'medium', weight: 'bolder' },
          { type: 'columnSet', columns: [
            { width: 'stretch', items: [
              { type: 'inputChoiceSet', id: 'from', label: 'From', style: 'compact', choices: [
                { title: 'English', value: 'en' },
                { title: 'Spanish', value: 'es' },
                { title: 'French', value: 'fr' },
                { title: 'German', value: 'de' },
              ]},
            ]},
            { width: 'stretch', items: [
              { type: 'inputChoiceSet', id: 'to', label: 'To', style: 'compact', choices: [
                { title: 'Spanish', value: 'es' },
                { title: 'French', value: 'fr' },
                { title: 'German', value: 'de' },
                { title: 'Japanese', value: 'ja' },
                { title: 'Portuguese', value: 'pt' },
              ]},
            ]},
          ]},
          { type: 'inputText', id: 'text', label: 'Text to Translate', placeholder: 'Enter text...', isMultiline: true },
          { type: 'actionSet', actions: [
            { title: 'Translate', style: 'accent' },
            { title: 'Swap Languages', style: 'default' },
          ]},
        ],
      },
    };
  }

  // Approve / approval
  if (q.includes('approv') || q.includes('pending') || q.includes('review')) {
    return {
      content: 'Here are your pending items:',
      card: {
        type: 'AdaptiveCard', accentColor: '#d4820c',
        body: [
          { type: 'columnSet', columns: [
            { width: 'stretch', items: [
              { type: 'textBlock', text: 'Pending Reviews & Approvals', size: 'medium', weight: 'bolder' },
            ]},
            { width: 'auto', items: [{ type: 'badge', text: '4 pending', color: 'orange' }] },
          ]},
          { type: 'separator' },
          { type: 'table', striped: true, columns: [{ label: 'Item' }, { label: 'From' }, { label: 'Type' }, { label: 'Age' }], rows: [
            { cells: ['PR #482 — WebSocket logic', 'Bob Johnson', 'Code Review', '2h'], highlight: true },
            { cells: ['Q1 Budget increase', 'Jane Smith', 'Approval', '1d'] },
            { cells: ['New hire: Sarah Chen', 'HR', 'Approval', '2d'] },
            { cells: ['Design V3 mockups', 'Alice Williams', 'Review', '3h'] },
          ]},
          { type: 'actionSet', actions: [
            { title: 'Review First Item', style: 'accent' },
            { title: 'Approve All', style: 'positive' },
            { title: 'Delegate', style: 'default' },
          ]},
        ],
      },
    };
  }

  // Default — generic response without card
  return {
    content: `I've looked into that for you. Based on your current context in **${ctx.label}**, here's what I found:\n\nEverything looks good. Your workspace is running smoothly with no critical issues. Want me to dig deeper into any specific area, or would you like me to help with something else?`,
  };
}

// ─── Main component ───

export function GlobalAIAssistant() {
  const { isOpen, activePanel, close } = useAIAssistant();
  const ctx = usePageContext();

  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const contextPrompts = useMemo(() => getContextPrompts(ctx), [ctx]);

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
      const response = generateContextualCard(content, ctx);
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
  }, [input, ctx]);

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
          <h2 className="text-[14px] font-semibold text-white">{activePanel === 'copilot' ? 'Copilot' : 'Help Desk'}</h2>
          <p className="text-[11px] text-white/60 truncate">{activePanel === 'copilot' ? ctx.label : 'IT Support & Resources'}</p>
        </div>
        {activePanel === 'copilot' && (
          <button
            onClick={clearHistory}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
            title="Clear chat"
          >
            <Trash2 size={14} />
          </button>
        )}
        <button
          onClick={close}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          title="Close"
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
            <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">Context-aware responses</span>
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
                    <h3 className="text-[15px] font-semibold text-[#242424] dark:text-[#f0f0f0] mb-1">Hi, I'm Copilot</h3>
                    <p className="text-[12px] text-[#8a8a8a] dark:text-[#6d6f78] max-w-[280px] mb-4">
                      Your AI assistant across the entire workspace. I can summarize, search, draft, analyze, and help you stay on top of everything.
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
                <span className="text-[10px] font-semibold text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">Slash Commands</span>
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
                { icon: <Bold size={13} />, action: () => wrapCopilotSelection('**', '**'), tip: 'Bold' },
                { icon: <Italic size={13} />, action: () => wrapCopilotSelection('_', '_'), tip: 'Italic' },
                { icon: <Strikethrough size={13} />, action: () => wrapCopilotSelection('~~', '~~'), tip: 'Strikethrough' },
                { icon: <Code size={13} />, action: () => wrapCopilotSelection('`', '`'), tip: 'Inline code' },
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
                { icon: <List size={13} />, action: () => insertCopilotPrefix('- '), tip: 'Bullet list' },
                { icon: <ListOrdered size={13} />, action: () => insertCopilotPrefix('1. '), tip: 'Numbered list' },
                { icon: <Quote size={13} />, action: () => insertCopilotPrefix('> '), tip: 'Blockquote' },
                { icon: <Link2 size={13} />, action: () => wrapCopilotSelection('[', '](url)'), tip: 'Link' },
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
                      Preview
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={4}>Toggle preview</TooltipContent>
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
                    <p className="text-[9px] text-[#8a8a8a] mb-1 uppercase tracking-wider">Preview</p>
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
                  placeholder="Ask Copilot anything... (type / for commands)"
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
                  <TooltipContent side="top" sideOffset={4}>Slash commands</TooltipContent>
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
                <TooltipContent side="top" sideOffset={4}>Send message</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1.5 text-center">
              Markdown supported · Shift+Enter for new line
            </p>
          </div>
        </>
      )}
    </div>
  );
}
