import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  Puzzle, CheckCircle2, Star, Settings, ToggleLeft, ToggleRight,
  ChevronRight, Download, Clock, User, Search,
  LayoutGrid, Bot, Send, Sparkles, Activity, ExternalLink,
  Shield, Info, Trash2, RefreshCw, Zap, ArrowRight,
  Bold, Italic, Strikethrough, Code, List, ListOrdered, Link2, Quote, Eye,
} from 'lucide-react';
import { spaces } from '../data/mockData';
import {
  getAppsForSpace, appCatalog,
  type AppIntegration, type InstalledApp,
} from '../data/appData';
import { format } from 'date-fns';
import { AdaptiveCard, type AdaptiveCardData } from '../components/AdaptiveCard';
import { MarkdownContent } from '../components/MarkdownContent';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '../components/ui/tooltip';
import { Separator } from '../components/ui/separator';
import { Toggle } from '../components/ui/toggle';
import { cn } from '../components/ui/utils';
import { MiroBoard } from '../components/MiroBoard';
import { FigmaDesignApp } from '../components/FigmaDesignApp';
import { GitLabApp } from '../components/GitLabApp';
import { JiraApp } from '../components/JiraApp';
import { SentryApp } from '../components/SentryApp';
import { GrafanaMonitor } from '../components/GrafanaMonitor';
import { AssetManagementApp } from '../components/AssetManagementApp';
import { YellowBookApp } from '../components/YellowBookApp';
import { MeetingCenterApp } from '../components/MeetingCenterApp';
import { ReleaseManagementApp } from '../components/ReleaseManagementApp';

// ─────────────────────────────────────────
//  Mock activity / assistant data generators
// ─────────────────────────────────────────

interface ActivityEvent {
  id: string;
  icon: string;
  title: string;
  detail: string;
  time: string;
  color: string;
}

interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  card?: AdaptiveCardData;
}

function generateActivity(app: AppIntegration): ActivityEvent[] {
  const map: Record<string, ActivityEvent[]> = {
    gitlab: [
      { id: '1', icon: '🔀', title: 'MR !482 merged', detail: 'Add WebSocket reconnection logic — merged by Bob Johnson', time: '12 min ago', color: 'green' },
      { id: '2', icon: '🐛', title: 'Issue #318 opened', detail: 'API returns 500 on malformed pagination token', time: '45 min ago', color: 'red' },
      { id: '3', icon: '🚀', title: 'Deploy to staging', detail: 'v2.14.0-rc.3 deployed successfully (32 commits)', time: '1 hr ago', color: 'blue' },
      { id: '4', icon: '👀', title: 'Review requested', detail: 'Charlie Brown requested your review on MR !479', time: '2 hrs ago', color: 'orange' },
      { id: '5', icon: '✅', title: 'Pipeline passed', detail: 'All 847 tests passed on branch feat/oauth-flow', time: '3 hrs ago', color: 'green' },
      { id: '6', icon: '🔖', title: 'Release v2.13.1 published', detail: 'Hotfix for payment gateway timeout', time: '5 hrs ago', color: 'purple' },
    ],
    jira: [
      { id: '1', icon: '📋', title: 'ENG-342 moved to In Review', detail: 'API rate limiting middleware — Charlie Brown', time: '20 min ago', color: 'blue' },
      { id: '2', icon: '🆕', title: 'ENG-345 created', detail: 'Fix pagination edge case in /users endpoint', time: '1 hr ago', color: 'green' },
      { id: '3', icon: '🏃', title: 'Sprint 14 updated', detail: 'Velocity: 42 pts · 4 days remaining', time: '2 hrs ago', color: 'purple' },
      { id: '4', icon: '💬', title: 'Comment on ENG-340', detail: 'Bob: "Can we use a decorator pattern here?"', time: '3 hrs ago', color: 'gray' },
      { id: '5', icon: '✅', title: 'ENG-339 marked Done', detail: 'Dashboard component tests — Jane Smith', time: '4 hrs ago', color: 'green' },
    ],
    figma: [
      { id: '1', icon: '🎨', title: 'Design updated', detail: 'Login screen — new password strength indicator added', time: '30 min ago', color: 'purple' },
      { id: '2', icon: '💬', title: 'New comment', detail: 'Alice: "Let\'s use the rounded variant for mobile"', time: '1 hr ago', color: 'blue' },
      { id: '3', icon: '📐', title: 'Component published', detail: 'Button/v3.2.0 — added loading state variants', time: '3 hrs ago', color: 'green' },
      { id: '4', icon: '👁️', title: 'File viewed', detail: 'Bob Johnson opened "Mobile App v3 — Spec"', time: '5 hrs ago', color: 'gray' },
    ],
    sentry: [
      { id: '1', icon: '🔴', title: 'New error: TypeError', detail: 'Cannot read property "id" of undefined — api/users.ts:142', time: '5 min ago', color: 'red' },
      { id: '2', icon: '📈', title: 'Error spike detected', detail: 'Payment module: +340% errors in last 15 min', time: '22 min ago', color: 'red' },
      { id: '3', icon: '✅', title: 'Issue resolved', detail: 'CORS preflight failure — resolved automatically', time: '1 hr ago', color: 'green' },
      { id: '4', icon: '🔔', title: 'Alert triggered', detail: 'P95 latency > 800ms on /api/checkout', time: '2 hrs ago', color: 'orange' },
    ],
    'openai-assistant': [
      { id: '1', icon: '📝', title: 'Thread summarized', detail: '#eng-backend: 47 messages → 3-paragraph summary', time: '15 min ago', color: 'green' },
      { id: '2', icon: '❓', title: 'Question answered', detail: '"What\'s our current API rate limit policy?"', time: '45 min ago', color: 'blue' },
      { id: '3', icon: '📊', title: 'Report generated', detail: 'Weekly sprint retrospective notes compiled', time: '2 hrs ago', color: 'purple' },
      { id: '4', icon: '🌐', title: 'Translation completed', detail: 'Docs translated: EN → ES, FR, DE (12 pages)', time: '5 hrs ago', color: 'blue' },
    ],
    'meeting-center': [
      { id: '1', icon: '📅', title: 'Meeting scheduled', detail: 'Sprint 15 Planning — Today 9:30 AM · Horizon room', time: '30 min ago', color: 'blue' },
      { id: '2', icon: '🏢', title: 'Room booked', detail: 'Summit (4F) reserved for Architecture Review — 2:00 PM', time: '1 hr ago', color: 'green' },
      { id: '3', icon: '✅', title: 'RSVP received', detail: 'Charlie Brown accepted Design Review invite', time: '2 hrs ago', color: 'green' },
      { id: '4', icon: '🔄', title: 'Recurring updated', detail: 'Weekly 1:1 moved to Ember room (2F)', time: '3 hrs ago', color: 'purple' },
    ],
    salesforce: [
      { id: '1', icon: '💰', title: 'Deal stage changed', detail: 'Acme Corp — Moved to Negotiation ($120K)', time: '30 min ago', color: 'green' },
      { id: '2', icon: '📞', title: 'Activity logged', detail: 'Call with TechFlow Inc. — 25 min', time: '2 hrs ago', color: 'blue' },
      { id: '3', icon: '🆕', title: 'New lead created', detail: 'Sarah Chen — VP Engineering at DataPro', time: '4 hrs ago', color: 'purple' },
    ],
    'google-drive': [
      { id: '1', icon: '📄', title: 'Document edited', detail: 'Q1 Marketing Plan.docx — 3 collaborators active', time: '10 min ago', color: 'blue' },
      { id: '2', icon: '📊', title: 'Spreadsheet shared', detail: 'Budget Tracker 2026 shared with Marketing team', time: '1 hr ago', color: 'green' },
      { id: '3', icon: '📁', title: 'Folder created', detail: 'New folder: "Campaign Assets — Q1"', time: '3 hrs ago', color: 'gray' },
    ],
    'yellow-book': [
      { id: '1', icon: '👤', title: 'New hire added', detail: 'Emily Park — UX Researcher, Design Team', time: '15 min ago', color: 'green' },
      { id: '2', icon: '🔍', title: 'People search', detail: 'Charlie Brown searched "SRE on-call"', time: '45 min ago', color: 'blue' },
      { id: '3', icon: '🏢', title: 'Org update', detail: 'Data Team moved under VP of Engineering', time: '2 hrs ago', color: 'purple' },
      { id: '4', icon: '📒', title: 'Profile updated', detail: 'Bob Johnson added "Kubernetes" to skills', time: '4 hrs ago', color: 'orange' },
    ],
    notion: [
      { id: '1', icon: '📝', title: 'Page updated', detail: 'Engineering Wiki: API Documentation refreshed', time: '20 min ago', color: 'blue' },
      { id: '2', icon: '🗃️', title: 'Database entry added', detail: 'New item in Feature Requests tracker', time: '1 hr ago', color: 'green' },
      { id: '3', icon: '🔗', title: 'Page linked', detail: 'Sprint 14 Planning linked to Roadmap Q1', time: '3 hrs ago', color: 'purple' },
    ],
    miro: [
      { id: '1', icon: '📌', title: 'Board updated', detail: 'Product Strategy Q1 2026 �� 5 sticky notes added by Alice', time: '2 min ago', color: 'orange' },
      { id: '2', icon: '💬', title: 'Comment thread', detail: 'Bob: "Can we re-prioritize the onboarding items?"', time: '15 min ago', color: 'blue' },
      { id: '3', icon: '🎨', title: 'Frame created', detail: 'New frame: "Signup Flow v2" added to board', time: '1 hr ago', color: 'purple' },
      { id: '4', icon: '👥', title: 'Collaboration session', detail: 'Design Sprint board — 4 collaborators active', time: '2 hrs ago', color: 'green' },
      { id: '5', icon: '📋', title: 'Board shared', detail: 'User Journey Mapping shared with Marketing team', time: '4 hrs ago', color: 'gray' },
    ],
    grafana: [
      { id: '1', icon: '🔴', title: 'Alert firing', detail: 'CPU > 80% on node-prod-3 — 12 min ago', time: '12 min ago', color: 'red' },
      { id: '2', icon: '🟠', title: 'Alert firing', detail: 'Memory > 90% on node-prod-3', time: '8 min ago', color: 'orange' },
      { id: '3', icon: '✅', title: 'Alert resolved', detail: 'Error rate > 2% on /api/checkout — auto-resolved', time: '45 min ago', color: 'green' },
      { id: '4', icon: '📊', title: 'Dashboard shared', detail: 'Infrastructure Overview shared to #sre-alerts', time: '1 hr ago', color: 'blue' },
      { id: '5', icon: '🔄', title: 'Panel updated', detail: 'Added Network I/O panel to Service Dashboard', time: '3 hrs ago', color: 'purple' },
    ],
    'asset-management': [
      { id: '1', icon: '📦', title: 'New version published', detail: 'main-app v2.14.0 — container image built (#1847)', time: '2 hrs ago', color: 'blue' },
      { id: '2', icon: '🛡️', title: 'Security scan complete', detail: 'main-app v2.14.0 — 1 high, 4 medium, 12 low', time: '2 hrs ago', color: 'orange' },
      { id: '3', icon: '🚀', title: 'Promoted to production', detail: 'main-app v2.13.1 promoted by Bob Johnson', time: '6 hrs ago', color: 'green' },
      { id: '4', icon: '🔴', title: 'Critical CVE detected', detail: 'payment-gateway v4.2.0-rc.1 — CVE-2026-2001 (log4j)', time: '30 min ago', color: 'red' },
      { id: '5', icon: '✅', title: 'Review approved', detail: 'auth-service v1.8.2 reviewed and approved for promotion', time: '5 hrs ago', color: 'green' },
    ],
    'release-management': [
      { id: '1', icon: '🚀', title: 'Deploy in progress', detail: 'main-app v2.14.0 deploying to production — 2/5 pods updated', time: '8 min ago', color: 'blue' },
      { id: '2', icon: '✅', title: 'Deploy succeeded', detail: 'auth-service v1.8.2 → production — all checks passed', time: '3 hrs ago', color: 'green' },
      { id: '3', icon: '❌', title: 'Deploy failed', detail: 'payment-gateway v4.2.0-rc.2 — integration tests failed (4/89)', time: '5 hrs ago', color: 'red' },
      { id: '4', icon: '🔔', title: 'Approval gate pending', detail: 'main-app v2.14.0 awaiting manual approval for production', time: '12 min ago', color: 'orange' },
      { id: '5', icon: '🛡️', title: 'Post-deploy checks passed', detail: 'notification-service v2.5.0 — 7/7 checks passed (1 warning)', time: '1 day ago', color: 'green' },
    ],
  };
  return map[app.id] || [
    { id: '1', icon: '🔔', title: 'Integration active', detail: `${app.name} is connected and running`, time: 'Just now', color: 'green' },
    { id: '2', icon: '📊', title: 'Status check', detail: 'All systems operational', time: '1 hr ago', color: 'blue' },
    { id: '3', icon: '🔄', title: 'Last sync', detail: 'Data synchronized successfully', time: '3 hrs ago', color: 'gray' },
  ];
}

function generateConversation(app: AppIntegration, botName: string): AssistantMessage[] {
  const map: Record<string, AssistantMessage[]> = {
    gitlab: [
      { id: '1', role: 'assistant', content: `Hey! I'm **${botName}**, your GitLab assistant for this space. I can help you check MR statuses, create issues, view pipelines, and more. Just ask!`, time: '10:00 AM' },
      { id: '2', role: 'user', content: 'Show me open merge requests that need review', time: '10:02 AM' },
      {
        id: '3', role: 'assistant', content: 'Here are the MRs awaiting review:', time: '10:02 AM',
        card: {
          type: 'AdaptiveCard', accentColor: '#FC6D26',
          body: [
            { type: 'textBlock', text: 'Merge Requests — Needs Review', size: 'medium', weight: 'bolder' },
            { type: 'table', striped: true, columns: [{ label: 'MR', width: '20%' }, { label: 'Title' }, { label: 'Author', width: '22%' }, { label: 'Changes', width: '16%' }], rows: [
              { cells: ['!482', 'Add WebSocket reconnection logic', 'Bob Johnson', '+312/-45'], highlight: true },
              { cells: ['!479', 'Refactor payment service', 'Charlie Brown', '+89/-234'] },
              { cells: ['!475', 'Upgrade React Router to v7', 'Alice Williams', '+56/-78'] },
            ]},
            { type: 'separator' },
            { type: 'actionSet', actions: [
              { title: 'Review !482', style: 'accent', icon: '👀' },
              { title: 'Assign Reviewers', style: 'default' },
              { title: 'View All MRs', style: 'default' },
            ]},
          ],
        },
      },
      { id: '4', role: 'user', content: 'What\'s the pipeline status on !482?', time: '10:04 AM' },
      {
        id: '5', role: 'assistant', content: 'Pipeline status for MR !482:', time: '10:04 AM',
        card: {
          type: 'AdaptiveCard', accentColor: '#237b4b',
          body: [
            { type: 'columnSet', columns: [
              { width: 'stretch', items: [
                { type: 'textBlock', text: 'MR !482 — CI/CD Pipeline', size: 'medium', weight: 'bolder' },
                { type: 'textBlock', text: 'Add WebSocket reconnection logic', size: 'small', color: 'muted' },
              ]},
              { width: 'auto', items: [
                { type: 'badge', text: 'Passing', color: 'green' },
              ]},
            ]},
            { type: 'separator' },
            { type: 'statusList', items: [
              { label: 'Unit Tests — 847/847', status: 'success', value: 'Passed' },
              { label: 'Integration Tests — 124/124', status: 'success', value: 'Passed' },
              { label: 'Lint / Format', status: 'success', value: 'Passed' },
              { label: 'Build (2m 14s)', status: 'success', value: 'Passed' },
              { label: 'E2E Tests (est. 4 min)', status: 'running', value: 'Running' },
            ]},
            { type: 'separator' },
            { type: 'progressBar', label: 'Overall Progress', value: 4, max: 5, color: 'green' },
            { type: 'actionSet', actions: [
              { title: 'Approve & Merge', style: 'positive' },
              { title: 'Notify on Complete', style: 'default' },
              { title: 'View Logs', style: 'default' },
            ]},
          ],
        },
      },
    ],
    jira: [
      { id: '1', role: 'assistant', content: `Hi! I'm your **Jira assistant**. I can create issues, check sprint progress, search tickets, and update statuses. What do you need?`, time: '9:30 AM' },
      { id: '2', role: 'user', content: 'How is Sprint 14 going?', time: '9:32 AM' },
      {
        id: '3', role: 'assistant', content: 'Here\'s the Sprint 14 overview:', time: '9:32 AM',
        card: {
          type: 'AdaptiveCard', accentColor: '#0052CC',
          body: [
            { type: 'columnSet', columns: [
              { width: 'stretch', items: [
                { type: 'textBlock', text: 'Sprint 14', size: 'large', weight: 'bolder' },
                { type: 'textBlock', text: 'Feb 5 — Feb 19 · 4 days remaining', size: 'small', color: 'muted' },
              ]},
              { width: 'auto', items: [
                { type: 'badge', text: 'On Track', color: 'green' },
              ]},
            ]},
            { type: 'separator' },
            { type: 'metricRow', metrics: [
              { label: 'Velocity', value: '42', change: '+6', changeType: 'up' },
              { label: 'Completed', value: '26', change: 'pts', changeType: 'neutral' },
              { label: 'Burn Rate', value: '87%', change: '', changeType: 'neutral' },
            ]},
            { type: 'separator' },
            { type: 'progressBar', label: 'Done — 8 stories', value: 26, max: 42, color: 'green', showValue: true },
            { type: 'progressBar', label: 'In Progress — 4 stories', value: 11, max: 42, color: 'blue', showValue: true },
            { type: 'progressBar', label: 'To Do — 2 stories', value: 5, max: 42, color: 'purple', showValue: true },
            { type: 'separator' },
            { type: 'container', style: 'warning', items: [
              { type: 'textBlock', text: '⚠️ 2 Blockers', weight: 'bolder', size: 'small', color: 'warning' },
              { type: 'factSet', facts: [
                { title: 'ENG-341', value: 'Waiting on API team for schema changes' },
                { title: 'ENG-338', value: 'Test env deployment blocked by infra' },
              ]},
            ]},
            { type: 'actionSet', actions: [
              { title: 'View Board', style: 'accent' },
              { title: 'Resolve Blockers', style: 'destructive' },
              { title: 'Sprint Report', style: 'default' },
            ]},
          ],
        },
      },
    ],
    figma: [
      { id: '1', role: 'assistant', content: `Welcome! I'm your **Figma assistant**. I can search files, check component status, find recent changes, and sync comments. How can I help?`, time: '11:00 AM' },
      { id: '2', role: 'user', content: 'What changed in the login screen design today?', time: '11:05 AM' },
      {
        id: '3', role: 'assistant', content: 'Here\'s what changed in the Login Screen today:', time: '11:05 AM',
        card: {
          type: 'AdaptiveCard', accentColor: '#F24E1E',
          body: [
            { type: 'textBlock', text: 'Login Screen — Today\'s Changes', size: 'medium', weight: 'bolder' },
            { type: 'textBlock', text: '2 updates · 2 new comments', size: 'small', color: 'muted' },
            { type: 'separator' },
            { type: 'container', style: 'emphasis', items: [
              { type: 'columnSet', columns: [
                { width: 'auto', items: [{ type: 'badge', text: 'Updated', color: 'purple' }] },
                { width: 'stretch', items: [
                  { type: 'textBlock', text: 'Password strength indicator added', weight: 'bolder', size: 'small' },
                  { type: 'textBlock', text: 'Alice Williams · 10:30 AM', size: 'small', color: 'muted' },
                ]},
              ]},
              { type: 'factSet', facts: [
                { title: 'Component', value: 'Animated strength meter' },
                { title: 'Colors', value: 'Red → Yellow → Green (semantic)' },
              ]},
            ]},
            { type: 'container', style: 'emphasis', items: [
              { type: 'columnSet', columns: [
                { width: 'auto', items: [{ type: 'badge', text: 'Comments', color: 'blue' }] },
                { width: 'stretch', items: [
                  { type: 'textBlock', text: '2 new comments from Bob Johnson', weight: 'bolder', size: 'small' },
                ]},
              ]},
              { type: 'statusList', items: [
                { label: '"Should we add biometric login option?"', status: 'info' },
                { label: '"The error state needs more contrast"', status: 'warning' },
              ]},
            ]},
            { type: 'actionSet', actions: [
              { title: 'Open in Figma', style: 'accent' },
              { title: 'Reply to Comments', style: 'default' },
            ]},
          ],
        },
      },
    ],
    miro: [
      { id: '1', role: 'assistant', content: `Hey! I'm your **Miro assistant**. I can help you manage boards, find content, start collaboration sessions, and keep track of whiteboard activity. What do you need?`, time: '10:00 AM' },
      { id: '2', role: 'user', content: 'Show me the most active boards this week', time: '10:02 AM' },
      {
        id: '3', role: 'assistant', content: 'Here are your most active boards:', time: '10:02 AM',
        card: {
          type: 'AdaptiveCard', accentColor: '#FFD02F',
          body: [
            { type: 'columnSet', columns: [
              { width: 'stretch', items: [
                { type: 'textBlock', text: 'Most Active Boards — This Week', size: 'medium', weight: 'bolder' },
                { type: 'textBlock', text: '5 boards · 14 collaborators', size: 'small', color: 'muted' },
              ]},
              { width: 'auto', items: [{ type: 'badge', text: 'Live', color: 'green' }] },
            ]},
            { type: 'separator' },
            { type: 'table', striped: true, columns: [{ label: 'Board' }, { label: 'Edits' }, { label: 'People' }, { label: 'Updated' }], rows: [
              { cells: ['Product Strategy Q1', '47', '5', '2 min ago'], highlight: true },
              { cells: ['Design Sprint — Mobile', '32', '4', '1 hr ago'] },
              { cells: ['User Journey Mapping', '18', '3', '3 hrs ago'] },
              { cells: ['Architecture Diagram', '12', '2', '2 days ago'] },
            ]},
            { type: 'separator' },
            { type: 'actionSet', actions: [
              { title: 'Open Top Board', style: 'accent' },
              { title: 'Start Session', style: 'positive' },
              { title: 'Activity Report', style: 'default' },
            ]},
          ],
        },
      },
    ],
    'openai-assistant': [
      { id: '1', role: 'assistant', content: `Hey there! I'm **${botName}**, your AI assistant. I can summarize threads, answer questions, draft content, and more. What would you like to do?`, time: '9:00 AM' },
      { id: '2', role: 'user', content: 'Summarize the #backend channel from the last 24 hours', time: '9:15 AM' },
      {
        id: '3', role: 'assistant', content: 'Here\'s the channel summary:', time: '9:15 AM',
        card: {
          type: 'AdaptiveCard', accentColor: '#10A37F',
          body: [
            { type: 'columnSet', columns: [
              { width: 'stretch', items: [
                { type: 'textBlock', text: '#backend — Last 24 Hours', size: 'medium', weight: 'bolder' },
                { type: 'textBlock', text: '47 messages · 6 participants', size: 'small', color: 'muted' },
              ]},
              { width: 'auto', items: [{ type: 'badge', text: 'AI Summary', color: 'green' }] },
            ]},
            { type: 'separator' },
            { type: 'container', style: 'emphasis', items: [
              { type: 'textBlock', text: 'Key Discussions', weight: 'bolder', size: 'small' },
              { type: 'statusList', items: [
                { label: 'OAuth 2.0 implementation — token refresh logic finalized, CORS issue resolved', status: 'success' },
                { label: 'Database migration — Postgres 14 → 16 planned for Feb 22 maintenance window', status: 'info' },
                { label: 'Rate limiting — New middleware PR in review (100 req/min standard)', status: 'pending' },
              ]},
            ]},
            { type: 'separator' },
            { type: 'container', style: 'accent', items: [
              { type: 'textBlock', text: 'Action Items', weight: 'bolder', size: 'small', color: 'accent' },
              { type: 'factSet', facts: [
                { title: 'Bob', value: 'Update OAuth docs by EOD Friday' },
                { title: 'Charlie', value: 'Test Postgres 16 migration on staging' },
                { title: 'Jane', value: 'Review rate limiting PR #479' },
              ]},
            ]},
            { type: 'actionSet', actions: [
              { title: 'Share to Channel', style: 'accent' },
              { title: 'Create Tasks', style: 'positive' },
              { title: 'Deeper Analysis', style: 'default' },
            ]},
          ],
        },
      },
      { id: '4', role: 'user', content: 'What does our API rate limit policy say?', time: '9:20 AM' },
      {
        id: '5', role: 'assistant', content: 'Here\'s the current policy from the Engineering Wiki:', time: '9:20 AM',
        card: {
          type: 'AdaptiveCard', accentColor: '#5b5fc7',
          body: [
            { type: 'columnSet', columns: [
              { width: 'stretch', items: [
                { type: 'textBlock', text: 'API Rate Limiting Policy v2.1', size: 'medium', weight: 'bolder' },
              ]},
              { width: 'auto', items: [{ type: 'badge', text: 'Wiki', color: 'purple' }] },
            ]},
            { type: 'table', striped: true, columns: [{ label: 'Tier' }, { label: 'Rate Limit' }, { label: 'Burst' }], rows: [
              { cells: ['Free', '60/min', '10'] },
              { cells: ['Standard', '100/min', '25'], highlight: true },
              { cells: ['Premium', '1,000/min', '100'] },
              { cells: ['Internal', 'Unlimited', '—'] },
            ]},
            { type: 'container', style: 'emphasis', items: [
              { type: 'factSet', facts: [
                { title: 'Response Headers', value: 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset' },
                { title: 'Over Limit', value: '429 Too Many Requests + Retry-After header' },
                { title: 'Source', value: 'Engineering Wiki > API > Rate Limiting' },
                { title: 'Last Updated', value: 'Jan 28, 2026' },
              ]},
            ]},
            { type: 'actionSet', actions: [
              { title: 'Open Wiki Page', style: 'accent' },
              { title: 'Compare with PR #479', style: 'default' },
            ]},
          ],
        },
      },
    ],
    sentry: [
      { id: '1', role: 'assistant', content: `I'm your **Sentry assistant**. I can check error trends, look up issues, analyze stack traces, and help triage alerts. What's up?`, time: '2:00 PM' },
      { id: '2', role: 'user', content: 'Any critical errors in the last hour?', time: '2:05 PM' },
      {
        id: '3', role: 'assistant', content: 'Found 2 issues in the last hour:', time: '2:05 PM',
        card: {
          type: 'AdaptiveCard', accentColor: '#c4314b',
          body: [
            { type: 'textBlock', text: 'Error Report — Last Hour', size: 'medium', weight: 'bolder' },
            { type: 'metricRow', metrics: [
              { label: 'Errors', value: '14', change: '+340%', changeType: 'up' },
              { label: 'Affected Users', value: '3' },
              { label: 'Unresolved', value: '1' },
            ]},
            { type: 'separator' },
            { type: 'container', style: 'attention', items: [
              { type: 'columnSet', columns: [
                { width: 'auto', items: [{ type: 'badge', text: 'Critical', color: 'red' }] },
                { width: 'stretch', items: [
                  { type: 'textBlock', text: 'TypeError: Cannot read property "id" of undefined', weight: 'bolder', size: 'small' },
                ]},
              ]},
              { type: 'factSet', facts: [
                { title: 'File', value: 'api/users.ts:142' },
                { title: 'Occurrences', value: '12 times in 5 min' },
                { title: 'Affected Users', value: '3' },
                { title: 'Status', value: 'Unresolved' },
              ]},
              { type: 'actionSet', actions: [
                { title: 'View Stack Trace', style: 'accent' },
                { title: 'Assign to Me', style: 'positive' },
                { title: 'Ignore', style: 'destructive' },
              ]},
            ]},
            { type: 'container', style: 'warning', items: [
              { type: 'columnSet', columns: [
                { width: 'auto', items: [{ type: 'badge', text: 'Warning', color: 'orange' }] },
                { width: 'stretch', items: [
                  { type: 'textBlock', text: 'P95 latency spike on /api/checkout', weight: 'bolder', size: 'small' },
                ]},
              ]},
              { type: 'factSet', facts: [
                { title: 'Duration', value: '1,240ms (threshold: 800ms)' },
                { title: 'Started', value: '15 min ago · Trending down' },
                { title: 'Status', value: 'Auto-resolving' },
              ]},
            ]},
          ],
        },
      },
    ],
    'asset-management': [
      { id: '1', role: 'assistant', content: `Hi! I'm the **Asset Management assistant**. I can show you asset versions, security scan results, promote builds, and check vulnerability status. What do you need?`, time: '10:00 AM' },
      { id: '2', role: 'user', content: 'Show me assets with critical vulnerabilities', time: '10:02 AM' },
      {
        id: '3', role: 'assistant', content: 'Found 1 asset with critical vulnerabilities:', time: '10:02 AM',
        card: {
          type: 'AdaptiveCard', accentColor: '#ef4444',
          body: [
            { type: 'textBlock', text: 'Critical Vulnerabilities', size: 'medium', weight: 'bolder' },
            { type: 'table', striped: true, columns: [{ label: 'Asset' }, { label: 'Version' }, { label: 'CVE' }, { label: 'Package' }, { label: 'Fix' }], rows: [
              { cells: ['payment-gateway', 'v4.2.0-rc.1', 'CVE-2026-2001', 'log4j 2.21.0', 'Available'], highlight: true },
            ]},
            { type: 'separator' },
            { type: 'actionSet', actions: [
              { title: 'View Full Scan', style: 'accent', icon: '🛡️' },
              { title: 'Apply Fix', style: 'positive' },
            ]},
          ],
        },
      },
      { id: '4', role: 'user', content: 'What versions are ready for promotion?', time: '10:05 AM' },
      {
        id: '5', role: 'assistant', content: 'These versions are eligible for promotion to production:', time: '10:05 AM',
        card: {
          type: 'AdaptiveCard', accentColor: '#5b5fc7',
          body: [
            { type: 'textBlock', text: 'Ready for Promotion', size: 'medium', weight: 'bolder' },
            { type: 'table', striped: true, columns: [{ label: 'Asset' }, { label: 'Version' }, { label: 'Status' }, { label: 'Critical' }, { label: 'Env' }], rows: [
              { cells: ['auth-service', 'v1.8.2', 'Reviewed', '0', 'Staging'], highlight: true },
              { cells: ['main-app', 'v2.14.0', 'Scanned', '0', 'Staging'] },
            ]},
            { type: 'actionSet', actions: [
              { title: 'Promote auth-service', style: 'accent', icon: '🚀' },
              { title: 'Promote main-app', style: 'accent', icon: '🚀' },
              { title: 'View Details', style: 'default' },
            ]},
          ],
        },
      },
    ],
    'release-management': [
      { id: '1', role: 'assistant', content: `Hi! I'm the **Release Management assistant**. I can check deploy status, show pipeline progress, run post-deploy checks, and help with rollbacks. What do you need?`, time: '10:00 AM' },
      { id: '2', role: 'user', content: 'What deployments are currently in progress?', time: '10:02 AM' },
      {
        id: '3', role: 'assistant', content: 'Here are the active deployments:', time: '10:02 AM',
        card: {
          type: 'AdaptiveCard', accentColor: '#5b5fc7',
          body: [
            { type: 'textBlock', text: 'Active Deployments', size: 'medium', weight: 'bolder' },
            { type: 'metricRow', metrics: [
              { label: 'In Progress', value: '1', change: '', changeType: 'neutral' },
              { label: 'Pending Approval', value: '0', change: '', changeType: 'neutral' },
              { label: 'Completed Today', value: '3', change: '+2', changeType: 'up' },
            ]},
            { type: 'separator' },
            { type: 'table', striped: true, columns: [{ label: 'Service' }, { label: 'Version' }, { label: 'Env' }, { label: 'Status' }, { label: 'Step' }], rows: [
              { cells: ['main-app', 'v2.14.0', 'Production', 'Deploying', '8/9 — Deploy to Prod'], highlight: true },
            ]},
            { type: 'separator' },
            { type: 'actionSet', actions: [
              { title: 'View Pipeline', style: 'accent', icon: '🔍' },
              { title: 'Approve Gate', style: 'positive' },
              { title: 'All Deploys', style: 'default' },
            ]},
          ],
        },
      },
      { id: '4', role: 'user', content: 'Show me the post-deploy checks for the last successful deploy', time: '10:05 AM' },
      {
        id: '5', role: 'assistant', content: 'Here are the post-deploy checks for main-app v2.13.1:', time: '10:05 AM',
        card: {
          type: 'AdaptiveCard', accentColor: '#237b4b',
          body: [
            { type: 'columnSet', columns: [
              { width: 'stretch', items: [
                { type: 'textBlock', text: 'Post-Deploy Checks — main-app v2.13.1', size: 'medium', weight: 'bolder' },
                { type: 'textBlock', text: 'All 7 checks passed', size: 'small', color: 'muted' },
              ]},
              { width: 'auto', items: [{ type: 'badge', text: 'All Pass', color: 'green' }] },
            ]},
            { type: 'separator' },
            { type: 'statusList', items: [
              { label: 'Health Check — 5/5 pods healthy', status: 'success', value: '8s' },
              { label: 'API Endpoints — 24/24 responding', status: 'success', value: '32s' },
              { label: 'Auth Flow — Login, token refresh, logout OK', status: 'success', value: '12s' },
              { label: 'Latency — P95 at 142ms (baseline: 180ms)', status: 'success', value: '60s' },
              { label: 'Error Rate — 0.02% (threshold: 1%)', status: 'success', value: '60s' },
              { label: 'Canary Analysis — Score: 98', status: 'success', value: '180s' },
              { label: 'OWASP Scan — 0 findings', status: 'success', value: '45s' },
            ]},
            { type: 'actionSet', actions: [
              { title: 'View Full Report', style: 'accent' },
              { title: 'Re-run Checks', style: 'default' },
            ]},
          ],
        },
      },
    ],
    'meeting-center': [
      { id: '1', role: 'assistant', content: `Hi! I'm the **Meeting Center assistant**. I can help you schedule meetings, find available rooms, check attendee availability, and manage your meeting calendar. What do you need?`, time: '10:00 AM' },
      { id: '2', role: 'user', content: 'What rooms are available right now?', time: '10:02 AM' },
      {
        id: '3', role: 'assistant', content: 'Here are the currently available rooms:', time: '10:02 AM',
        card: {
          type: 'AdaptiveCard', accentColor: '#5b5fc7',
          body: [
            { type: 'textBlock', text: 'Available Rooms — Right Now', size: 'medium', weight: 'bolder' },
            { type: 'table', striped: true, columns: [{ label: 'Room' }, { label: 'Floor' }, { label: 'Capacity' }, { label: 'Amenities' }], rows: [
              { cells: ['Aurora', '3F', '8 seats', 'Display, Webcam, Phone'], highlight: true },
              { cells: ['Summit', '4F', '20 seats', 'All amenities'] },
              { cells: ['Oasis', '1F', '10 seats', 'Display, Webcam, Whiteboard, Phone'] },
              { cells: ['Zen', '1F', '2 seats', 'Display, Webcam'] },
            ]},
            { type: 'separator' },
            { type: 'actionSet', actions: [
              { title: 'Book Aurora', style: 'accent' },
              { title: 'Book Summit', style: 'positive' },
              { title: 'View All Rooms', style: 'default' },
            ]},
          ],
        },
      },
      { id: '4', role: 'user', content: 'What meetings do I have today?', time: '10:05 AM' },
      {
        id: '5', role: 'assistant', content: 'Here\'s your schedule for today:', time: '10:05 AM',
        card: {
          type: 'AdaptiveCard', accentColor: '#5b5fc7',
          body: [
            { type: 'textBlock', text: 'Today\'s Meetings — Bob Johnson', size: 'medium', weight: 'bolder' },
            { type: 'metricRow', metrics: [
              { label: 'Meetings', value: '5' },
              { label: 'Hours Booked', value: '4.5' },
              { label: 'Rooms Used', value: '4' },
            ]},
            { type: 'separator' },
            { type: 'table', striped: true, columns: [{ label: 'Time' }, { label: 'Meeting' }, { label: 'Room' }, { label: 'Type' }], rows: [
              { cells: ['9:30–10:30', 'Sprint 15 Planning', 'Horizon', 'Hybrid'], highlight: true },
              { cells: ['11:00–12:00', 'Design Review', 'Cascade', 'Hybrid'] },
              { cells: ['1:00–1:30', '1:1 — Bob & Sarah', 'Ember', 'In-person'] },
              { cells: ['2:00–3:00', 'Architecture Review', 'Summit', 'Video'] },
              { cells: ['3:30–4:15', 'SRE Incident Retro', 'Oasis', 'In-person'] },
            ]},
            { type: 'actionSet', actions: [
              { title: 'Join Current Meeting', style: 'accent' },
              { title: 'Schedule New', style: 'positive' },
            ]},
          ],
        },
      },
    ],
    salesforce: [
      { id: '1', role: 'assistant', content: `Hi! I'm your **Salesforce assistant**. I can check deal pipelines, pull customer profiles, search accounts, and report on metrics. How can I help?`, time: '10:00 AM' },
      { id: '2', role: 'user', content: 'What big deals are close to closing?', time: '10:05 AM' },
      {
        id: '3', role: 'assistant', content: 'Here\'s your late-stage pipeline:', time: '10:05 AM',
        card: {
          type: 'AdaptiveCard', accentColor: '#00A1E0',
          body: [
            { type: 'textBlock', text: 'Pipeline — Late Stage (>$50K)', size: 'medium', weight: 'bolder' },
            { type: 'metricRow', metrics: [
              { label: 'Total Pipeline', value: '$405K' },
              { label: 'Weighted', value: '$246K' },
              { label: 'Deals', value: '3' },
            ]},
            { type: 'separator' },
            { type: 'table', striped: true, columns: [{ label: 'Account' }, { label: 'Value' }, { label: 'Stage' }, { label: 'Close Date' }, { label: 'Prob' }], rows: [
              { cells: ['Acme Corp', '$120K', 'Negotiation', 'Mar 15', '75%'], highlight: true },
              { cells: ['TechFlow Inc.', '$85K', 'Proposal', 'Feb 28', '60%'] },
              { cells: ['DataPro Systems', '$200K', 'Negotiation', 'Mar 30', '50%'] },
            ]},
            { type: 'actionSet', actions: [
              { title: 'View Acme Details', style: 'accent' },
              { title: 'Export Pipeline', style: 'default' },
              { title: 'Schedule Follow-ups', style: 'positive' },
            ]},
          ],
        },
      },
    ],
    'yellow-book': [
      { id: '1', role: 'assistant', content: `Hi! I'm the **Yellow Book assistant**. I can help you search for people, browse the org tree, look up contact info, and find colleagues by skills or department. Who are you looking for?`, time: '10:00 AM' },
      { id: '2', role: 'user', content: 'Who reports to the VP of Engineering?', time: '10:02 AM' },
      {
        id: '3', role: 'assistant', content: 'Here are the direct reports to **Sarah Chen, VP of Engineering**:', time: '10:02 AM',
        card: {
          type: 'AdaptiveCard', accentColor: '#D4A017',
          body: [
            { type: 'textBlock', text: 'Org Tree — VP of Engineering', size: 'medium', weight: 'bolder' },
            { type: 'table', striped: true, columns: [{ label: 'Name' }, { label: 'Title' }, { label: 'Team' }, { label: 'Location' }], rows: [
              { cells: ['Bob Johnson', 'Sr. Engineering Manager', 'Platform', 'San Francisco'], highlight: true },
              { cells: ['Charlie Brown', 'Sr. Engineering Manager', 'SRE', 'New York'] },
              { cells: ['Diana Martinez', 'Engineering Manager', 'Backend', 'Austin'] },
              { cells: ['Evan Liu', 'Engineering Manager', 'Frontend', 'Remote'] },
            ]},
            { type: 'separator' },
            { type: 'actionSet', actions: [
              { title: 'View Full Org Tree', style: 'accent', icon: '🏢' },
              { title: 'Message Sarah Chen', style: 'default' },
            ]},
          ],
        },
      },
      { id: '4', role: 'user', content: 'Find someone with Kubernetes expertise', time: '10:05 AM' },
      {
        id: '5', role: 'assistant', content: 'Found 3 people with **Kubernetes** skills:', time: '10:05 AM',
        card: {
          type: 'AdaptiveCard', accentColor: '#D4A017',
          body: [
            { type: 'textBlock', text: 'People — Kubernetes Expertise', size: 'medium', weight: 'bolder' },
            { type: 'table', striped: true, columns: [{ label: 'Name' }, { label: 'Title' }, { label: 'Team' }, { label: 'Level' }], rows: [
              { cells: ['Charlie Brown', 'Sr. Engineering Manager', 'SRE', 'Expert'], highlight: true },
              { cells: ['Bob Johnson', 'Sr. Engineering Manager', 'Platform', 'Advanced'] },
              { cells: ['Tom Harris', 'DevOps Engineer', 'SRE', 'Intermediate'] },
            ]},
            { type: 'actionSet', actions: [
              { title: 'View Charlie\'s Profile', style: 'accent' },
              { title: 'Message All', style: 'default' },
            ]},
          ],
        },
      },
    ],
  };
  return map[app.id] || [
    { id: '1', role: 'assistant', content: `Hi! I'm the **${app.name} assistant** for this space. I can help you interact with ${app.name} — search, check status, and run common actions. What would you like to do?`, time: '10:00 AM' },
    { id: '2', role: 'user', content: `What's the current status?`, time: '10:01 AM' },
    {
      id: '3', role: 'assistant', content: 'Current integration status:', time: '10:01 AM',
      card: {
        type: 'AdaptiveCard', accentColor: '#5b5fc7',
        body: [
          { type: 'textBlock', text: `${app.name} — Status`, size: 'medium', weight: 'bolder' },
          { type: 'statusList', items: [
            { label: 'Connection', status: 'success', value: 'Active' },
            { label: 'Last sync', status: 'success', value: '5 min ago' },
            { label: 'Errors', status: 'success', value: 'None' },
            { label: 'Webhooks', status: 'success', value: 'Healthy' },
          ]},
          { type: 'actionSet', actions: [
            { title: 'Run Sync', style: 'accent' },
            { title: 'View Logs', style: 'default' },
          ]},
        ],
      },
    },
  ];
}

function getQuickActions(app: AppIntegration): { label: string; desc: string }[] {
  const map: Record<string, { label: string; desc: string }[]> = {
    gitlab: [
      { label: 'View open MRs', desc: 'List merge requests awaiting review' },
      { label: 'Check pipeline', desc: 'Current CI/CD pipeline status' },
      { label: 'Create issue', desc: 'File a new GitLab issue' },
      { label: 'Recent commits', desc: 'Last 10 commits on main' },
    ],
    jira: [
      { label: 'Sprint overview', desc: 'Current sprint progress and stats' },
      { label: 'My assigned issues', desc: 'Issues assigned to you' },
      { label: 'Create ticket', desc: 'Create a new Jira issue' },
      { label: 'Search issues', desc: 'Search with JQL' },
    ],
    figma: [
      { label: 'Recent files', desc: 'Files updated in the last 7 days' },
      { label: 'Component status', desc: 'Design system component health' },
      { label: 'Open comments', desc: 'Unresolved design comments' },
      { label: 'Share a file', desc: 'Generate a shareable link' },
    ],
    'openai-assistant': [
      { label: 'Summarize channel', desc: 'Get a summary of recent messages' },
      { label: 'Search knowledge base', desc: 'Find info from connected sources' },
      { label: 'Draft content', desc: 'Help write or edit content' },
      { label: 'Generate report', desc: 'Create a formatted report' },
    ],
    sentry: [
      { label: 'Error overview', desc: 'Recent errors and trends' },
      { label: 'Unresolved issues', desc: 'Issues needing attention' },
      { label: 'Performance stats', desc: 'Transaction latencies and throughput' },
      { label: 'Set alert rule', desc: 'Configure custom alert thresholds' },
    ],
    'asset-management': [
      { label: 'Asset registry', desc: 'Browse all packages, images & libs' },
      { label: 'Security scan', desc: 'Check latest vulnerability results' },
      { label: 'Promote version', desc: 'Promote a reviewed build to production' },
      { label: 'Version history', desc: 'View build history for an asset' },
    ],
    'yellow-book': [
      { label: 'Search people', desc: 'Find someone by name, title, or skills' },
      { label: 'Browse org tree', desc: 'Navigate the organizational hierarchy' },
      { label: 'My team', desc: 'View your direct team members' },
      { label: 'New hires', desc: 'Recently added employees' },
    ],
    salesforce: [
      { label: 'Pipeline summary', desc: 'Current deal pipeline value' },
      { label: 'Recent activities', desc: 'Calls, emails, and meetings' },
      { label: 'Search contacts', desc: 'Find customer profiles' },
      { label: 'Deal forecast', desc: 'Weighted pipeline forecast' },
    ],
    miro: [
      { label: 'Open board', desc: 'View a board in the canvas' },
      { label: 'Create board', desc: 'Start a new whiteboard' },
      { label: 'Recent activity', desc: 'See who edited which board' },
      { label: 'Start session', desc: 'Launch a live collaboration session' },
    ],
    grafana: [
      { label: 'View dashboard', desc: 'Open infrastructure dashboard' },
      { label: 'Check alerts', desc: 'View active and recent alerts' },
      { label: 'Node health', desc: 'Cluster node status overview' },
      { label: 'Service status', desc: 'Check service latency and errors' },
    ],
    'meeting-center': [
      { label: 'Schedule meeting', desc: 'Create a new meeting with room booking' },
      { label: 'Find a room', desc: 'Browse available meeting rooms' },
      { label: "Today's schedule", desc: 'View all meetings for today' },
      { label: 'Book instant room', desc: 'Grab an available room right now' },
    ],
    'release-management': [
      { label: 'Pipeline status', desc: 'View current deploy pipeline progress' },
      { label: 'Run post-deploy checks', desc: 'Execute health and smoke tests' },
      { label: 'Recent deploys', desc: 'List recent deployments across services' },
      { label: 'Rollback', desc: 'Roll back a failed deployment' },
    ],
  };
  return map[app.id] || [
    { label: 'Check status', desc: 'Current connection status' },
    { label: 'Recent activity', desc: 'Latest events and actions' },
    { label: 'Run sync', desc: 'Manually trigger a data sync' },
    { label: 'View docs', desc: 'Open integration documentation' },
  ];
}

const suggestedPrompts: Record<string, string[]> = {
  gitlab: ['Show recent deployments', 'Who has the most open MRs?', 'List failing pipelines'],
  jira: ['Show my blockers', 'What was completed last sprint?', 'Who is overloaded?'],
  figma: ['Show recent design updates', 'Which components need review?', 'List open threads'],
  'openai-assistant': ['Summarize today\'s messages', 'What are our action items?', 'Draft a meeting agenda'],
  sentry: ['Show error trends this week', 'Which endpoints are slowest?', 'New regressions today?'],
  miro: ['Show recent board changes', 'Who is active on the strategy board?', 'Create a new brainstorm board'],
  salesforce: ['Pipeline by rep', 'Deals closing this month', 'Top accounts by revenue'],
  grafana: ['Show active alerts', 'Which nodes are under pressure?', 'Service latency report'],
  'meeting-center': ['What rooms are free right now?', 'Show my meetings today', 'Book a room for 2 PM'],
  'release-management': ['Show active deploys', 'What failed recently?', 'Run post-deploy checks for main-app'],
};

// Dynamic card generator for user-initiated messages
function generateDynamicCard(app: AppIntegration, query: string): AdaptiveCardData | null {
  const q = query.toLowerCase();

  // Keywords that trigger card responses
  if (q.includes('status') || q.includes('health') || q.includes('check')) {
    return {
      type: 'AdaptiveCard', accentColor: '#237b4b',
      body: [
        { type: 'textBlock', text: `${app.name} — System Health`, size: 'medium', weight: 'bolder' },
        { type: 'statusList', items: [
          { label: 'API Connection', status: 'success', value: 'Healthy' },
          { label: 'Webhook Delivery', status: 'success', value: '100%' },
          { label: 'Data Sync', status: 'success', value: '2 min ago' },
          { label: 'Rate Limit Usage', status: 'info', value: '23/100' },
        ]},
        { type: 'separator' },
        { type: 'metricRow', metrics: [
          { label: 'Uptime', value: '99.9%' },
          { label: 'Avg Latency', value: '145ms' },
          { label: 'Events Today', value: '342' },
        ]},
        { type: 'actionSet', actions: [
          { title: 'View Full Report', style: 'accent' },
          { title: 'Run Diagnostics', style: 'default' },
        ]},
      ],
    };
  }

  if (q.includes('deploy') || q.includes('release') || q.includes('build')) {
    return {
      type: 'AdaptiveCard', accentColor: '#0078d4',
      body: [
        { type: 'textBlock', text: 'Recent Deployments', size: 'medium', weight: 'bolder' },
        { type: 'table', striped: true,
          columns: [{ label: 'Version' }, { label: 'Environment' }, { label: 'Status' }, { label: 'Time' }],
          rows: [
            { cells: ['v2.14.0-rc.3', 'Staging', '✅ Success', '1 hr ago'], highlight: true },
            { cells: ['v2.13.1', 'Production', '✅ Success', '5 hrs ago'] },
            { cells: ['v2.14.0-rc.2', 'Staging', '❌ Failed', 'Yesterday'] },
          ],
        },
        { type: 'actionSet', actions: [
          { title: 'Deploy to Production', style: 'positive' },
          { title: 'Rollback', style: 'destructive' },
          { title: 'View Pipeline', style: 'default' },
        ]},
      ],
    };
  }

  if (q.includes('summary') || q.includes('summarize') || q.includes('overview') || q.includes('report')) {
    return {
      type: 'AdaptiveCard', accentColor: '#5b5fc7',
      body: [
        { type: 'columnSet', columns: [
          { width: 'stretch', items: [
            { type: 'textBlock', text: `${app.name} — Today's Summary`, size: 'medium', weight: 'bolder' },
          ]},
          { width: 'auto', items: [{ type: 'badge', text: 'Auto-generated', color: 'purple' }] },
        ]},
        { type: 'metricRow', metrics: [
          { label: 'Events', value: '47', change: '+12%', changeType: 'up' },
          { label: 'Actions', value: '18', change: '+3', changeType: 'up' },
          { label: 'Alerts', value: '2', change: '-1', changeType: 'down' },
        ]},
        { type: 'separator' },
        { type: 'progressBar', label: 'Task Completion', value: 14, max: 18, color: 'green' },
        { type: 'progressBar', label: 'Alert Resolution', value: 1, max: 2, color: 'orange' },
        { type: 'separator' },
        { type: 'container', style: 'emphasis', items: [
          { type: 'textBlock', text: 'Highlights', weight: 'bolder', size: 'small' },
          { type: 'statusList', items: [
            { label: 'All critical tasks completed on time', status: 'success' },
            { label: '1 medium-priority alert still open', status: 'warning' },
            { label: 'Team velocity trending upward this week', status: 'info' },
          ]},
        ]},
        { type: 'actionSet', actions: [
          { title: 'Share Summary', style: 'accent' },
          { title: 'Export PDF', style: 'default' },
        ]},
      ],
    };
  }

  if (q.includes('create') || q.includes('new') || q.includes('add') || q.includes('file') || q.includes('draft')) {
    return {
      type: 'AdaptiveCard', accentColor: '#5b5fc7',
      body: [
        { type: 'textBlock', text: `Create New Item`, size: 'medium', weight: 'bolder' },
        { type: 'textBlock', text: `Fill in the details below to create a new item in ${app.name}.`, size: 'small', color: 'muted' },
        { type: 'separator' },
        { type: 'inputText', id: 'title', label: 'Title', placeholder: 'Enter a title...' },
        { type: 'inputText', id: 'description', label: 'Description', placeholder: 'Add details...', isMultiline: true },
        { type: 'inputChoiceSet', id: 'priority', label: 'Priority', style: 'compact', choices: [
          { title: 'Low', value: 'low' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'high' },
          { title: 'Critical', value: 'critical' },
        ]},
        { type: 'inputToggle', id: 'notify', label: 'Notify team members', defaultValue: true },
        { type: 'separator' },
        { type: 'actionSet', actions: [
          { title: 'Create', style: 'positive' },
          { title: 'Cancel', style: 'default' },
        ]},
      ],
    };
  }

  if (q.includes('assign') || q.includes('who') || q.includes('team') || q.includes('member')) {
    return {
      type: 'AdaptiveCard', accentColor: '#5b5fc7',
      body: [
        { type: 'textBlock', text: 'Team Activity', size: 'medium', weight: 'bolder' },
        { type: 'imageRow', images: [
          { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', label: 'Bob J.', size: 32 },
          { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', label: 'Alice W.', size: 32 },
          { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', label: 'Charlie B.', size: 32 },
          { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', label: 'Jane S.', size: 32 },
          { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve', label: 'Eve D.', size: 32 },
        ]},
        { type: 'separator' },
        { type: 'table', striped: true, columns: [{ label: 'Member' }, { label: 'Active Items' }, { label: 'Completed' }, { label: 'Load' }], rows: [
          { cells: ['Bob Johnson', '6', '12', '🟢 Normal'] },
          { cells: ['Alice Williams', '8', '9', '🟡 High'], highlight: true },
          { cells: ['Charlie Brown', '4', '15', '🟢 Normal'] },
          { cells: ['Jane Smith', '3', '8', '🟢 Low'] },
        ]},
        { type: 'actionSet', actions: [
          { title: 'Rebalance Work', style: 'accent' },
          { title: 'Message Team', style: 'default' },
        ]},
      ],
    };
  }

  if (q.includes('trend') || q.includes('chart') || q.includes('analytics') || q.includes('metric')) {
    return {
      type: 'AdaptiveCard', accentColor: '#8764b8',
      body: [
        { type: 'textBlock', text: 'Trends — Last 7 Days', size: 'medium', weight: 'bolder' },
        { type: 'metricRow', metrics: [
          { label: 'Total Events', value: '2,847', change: '+18%', changeType: 'up' },
          { label: 'Avg Response', value: '142ms', change: '-8%', changeType: 'down' },
          { label: 'Error Rate', value: '0.3%', change: '-0.1%', changeType: 'down' },
        ]},
        { type: 'separator' },
        { type: 'progressBar', label: 'Mon', value: 380, max: 500, color: 'purple' },
        { type: 'progressBar', label: 'Tue', value: 420, max: 500, color: 'purple' },
        { type: 'progressBar', label: 'Wed', value: 455, max: 500, color: 'purple' },
        { type: 'progressBar', label: 'Thu', value: 390, max: 500, color: 'blue' },
        { type: 'progressBar', label: 'Fri', value: 500, max: 500, color: 'green' },
        { type: 'progressBar', label: 'Sat', value: 210, max: 500, color: 'purple' },
        { type: 'progressBar', label: 'Sun', value: 192, max: 500, color: 'purple' },
        { type: 'actionSet', actions: [
          { title: 'Full Analytics', style: 'accent' },
          { title: 'Export Data', style: 'default' },
        ]},
      ],
    };
  }

  // For any other queries, return null (plain text reply)
  return null;
}

// ─────────────────────────────────────────
//  Tab 1: App Screen
// ─────────────────────────────────────────

function AppScreenTab({ app, config }: { app: AppIntegration; config: Record<string, string | boolean> }) {
  // Custom embedded app experiences
  if (app.id === 'miro') return <MiroBoard />;
  if (app.id === 'figma') return <FigmaDesignApp />;
  if (app.id === 'gitlab') return <GitLabApp />;
  if (app.id === 'jira') return <JiraApp />;
  if (app.id === 'sentry') return <SentryApp />;
  if (app.id === 'grafana') return <GrafanaMonitor />;
  if (app.id === 'asset-management') return <AssetManagementApp />;
  if (app.id === 'yellow-book') return <YellowBookApp />;
  if (app.id === 'meeting-center') return <MeetingCenterApp />;
  if (app.id === 'release-management') return <ReleaseManagementApp />;

  const activity = useMemo(() => generateActivity(app), [app]);
  const quickActions = useMemo(() => getQuickActions(app), [app]);

  const colorMap: Record<string, string> = {
    green: 'bg-[#edf7f0] dark:bg-[#237b4b]/15 text-[#237b4b] dark:text-[#57ab5a]',
    blue: 'bg-[#ecf5fe] dark:bg-[#0078d4]/15 text-[#0078d4] dark:text-[#6cb8f6]',
    red: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15 text-[#c4314b] dark:text-[#f47067]',
    orange: 'bg-[#fef7ec] dark:bg-[#d4820c]/15 text-[#d4820c] dark:text-[#f0b850]',
    purple: 'bg-[#f3eef9] dark:bg-[#8764b8]/15 text-[#8764b8] dark:text-[#c49ded]',
    gray: 'bg-[#f0f0f0] dark:bg-[#3d3d3d] text-[#616161] dark:text-[#b9bbbe]',
  };

  return (
    <div className="space-y-5">
      {/* Status + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Card */}
        <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] bg-[#faf9f8] dark:bg-[#1e1f22]">
            <h3 className="font-semibold text-[13px] text-[#242424] dark:text-[#f0f0f0] flex items-center gap-2">
              <Activity size={14} className="text-[#5b5fc7]" />
              Connection Status
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#237b4b] shadow-sm shadow-[#237b4b]/50 animate-pulse" />
              <span className="text-sm font-medium text-[#237b4b] dark:text-[#57ab5a]">Connected & Active</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-[#616161] dark:text-[#8a8a8a]">
              <div className="flex items-center gap-1.5">
                <RefreshCw size={11} />
                <span>Last sync: 2 min ago</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap size={11} />
                <span>Webhook: Healthy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={11} />
                <span>Uptime: 99.9%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity size={11} />
                <span>{activity.length} events today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] bg-[#faf9f8] dark:bg-[#1e1f22]">
            <h3 className="font-semibold text-[13px] text-[#242424] dark:text-[#f0f0f0] flex items-center gap-2">
              <Zap size={14} className="text-[#d4820c]" />
              Quick Actions
            </h3>
          </div>
          <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
            {quickActions.map((action, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors text-left group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#242424] dark:text-[#e0e0e0] font-medium group-hover:text-[#5b5fc7] dark:group-hover:text-[#a6a9dc] transition-colors">{action.label}</p>
                  <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">{action.desc}</p>
                </div>
                <ArrowRight size={14} className="text-[#d1d1d1] dark:text-[#3d3d3d] group-hover:text-[#5b5fc7] dark:group-hover:text-[#a6a9dc] transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] bg-[#faf9f8] dark:bg-[#1e1f22] flex items-center justify-between">
          <h3 className="font-semibold text-[13px] text-[#242424] dark:text-[#f0f0f0]">Recent Activity</h3>
          <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">Today</span>
        </div>
        <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
          {activity.map(ev => (
            <div key={ev.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${colorMap[ev.color] || colorMap.gray}`}>
                {ev.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#242424] dark:text-[#e0e0e0] font-medium">{ev.title}</p>
                <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78] truncate">{ev.detail}</p>
              </div>
              <span className="text-[11px] text-[#b9bbbe] dark:text-[#5a5a5a] whitespace-nowrap shrink-0">{ev.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  Tab 2: Assistant (Conversational)
// ─────────────────────────────────────────

function AssistantTab({ app, config }: { app: AppIntegration; config: Record<string, string | boolean> }) {
  const botName = (config.bot_name as string) || `${app.name} Assistant`;
  const initialMessages = useMemo(() => generateConversation(app, botName), [app, botName]);
  const [messages, setMessages] = useState<AssistantMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const prompts = suggestedPrompts[app.id] || ['Check status', 'Show recent activity', 'Help me get started'];

  const autoResize = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, []);

  const wrapSelection = useCallback((before: string, after: string) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.slice(start, end);
    const replacement = before + (selected || 'text') + after;
    const newVal = text.slice(0, start) + replacement + text.slice(end);
    setInput(newVal);
    requestAnimationFrame(() => {
      el.focus();
      const cursorPos = start + before.length + (selected ? selected.length : 4);
      el.setSelectionRange(
        selected ? start + replacement.length : start + before.length,
        selected ? start + replacement.length : start + before.length + (selected || 'text').length
      );
    });
  }, []);

  const insertLinePrefix = useCallback((prefix: string) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const text = el.value;
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const newVal = text.slice(0, lineStart) + prefix + text.slice(lineStart);
    setInput(newVal);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    const userMsg: AssistantMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowPreview(false);
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsTyping(true);

    setTimeout(() => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // Generate a contextual adaptive card reply
      const replyCard = generateDynamicCard(app, content);
      const reply: AssistantMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: replyCard ? `Here's what I found:` : `I've processed your request regarding: **"${content}"**\n\nEverything is looking good on the ${app.name} side. Let me know if you'd like more details or want to take any action.`,
        time: now,
        card: replyCard || undefined,
      };
      setMessages(prev => [...prev, reply]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-210px)] bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] bg-[#faf9f8] dark:bg-[#1e1f22] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5b5fc7] to-[#7b7dd8] flex items-center justify-center text-sm">
          <Bot size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#242424] dark:text-[#f0f0f0]">{botName}</p>
          <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">Powered by {app.name} · Always online</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#237b4b] animate-pulse" />
          <span className="text-[11px] text-[#237b4b] dark:text-[#57ab5a] font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5b5fc7] to-[#7b7dd8] flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div className={`${msg.card ? 'max-w-[85%]' : 'max-w-[75%]'}`}>
              <div className={`${msg.role === 'user'
                ? 'bg-[#5b5fc7] text-white rounded-2xl rounded-br-md px-4 py-2.5'
                : 'bg-[#f5f5f5] dark:bg-[#1e1f22] text-[#242424] dark:text-[#e0e0e0] rounded-2xl rounded-bl-md px-4 py-2.5'
              }`}>
                <div className="text-sm">
                  <MarkdownContent content={msg.content} variant={msg.role === 'user' ? 'light' : 'auto'} />
                </div>
                <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/60' : 'text-[#b9bbbe] dark:text-[#5a5a5a]'}`}>{msg.time}</p>
              </div>
              {msg.card && <AdaptiveCard card={msg.card} />}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-[#e8e8f8] dark:bg-[#3d3d3d] flex items-center justify-center shrink-0 mt-0.5">
                <User size={14} className="text-[#5b5fc7]" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5b5fc7] to-[#7b7dd8] flex items-center justify-center shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-[#f5f5f5] dark:bg-[#1e1f22] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#8a8a8a] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#8a8a8a] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#8a8a8a] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto">
        <Sparkles size={12} className="text-[#8a8a8a] shrink-0" />
        {prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#f0f0f0] dark:bg-[#1e1f22] text-[#424242] dark:text-[#c8c8c8] hover:bg-[#e8e8f8] dark:hover:bg-[#333] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc] transition-colors whitespace-nowrap border border-transparent hover:border-[#5b5fc7]/20"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Rich Input */}
      <div className="px-4 py-3 border-t border-[#f0f0f0] dark:border-[#333] bg-[#faf9f8] dark:bg-[#1e1f22]">
        {/* Formatting toolbar */}
        <motion.div
          className="flex items-center gap-0.5 mb-2 flex-wrap"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {([
            { icon: <Bold size={14} />, action: () => wrapSelection('**', '**'), tip: 'Bold' },
            { icon: <Italic size={14} />, action: () => wrapSelection('_', '_'), tip: 'Italic' },
            { icon: <Strikethrough size={14} />, action: () => wrapSelection('~~', '~~'), tip: 'Strikethrough' },
            { icon: <Code size={14} />, action: () => wrapSelection('`', '`'), tip: 'Inline code' },
          ] as Array<{ icon: React.ReactNode; action: () => void; tip: string }>).map(item => (
            <Tooltip key={item.tip}>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" onClick={item.action}
                  className="h-8 w-8 text-[#616161] dark:text-[#9e9e9e] hover:bg-[#e8e8f8] dark:hover:bg-[#333] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc]"
                >{item.icon}</Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={4}>{item.tip}</TooltipContent>
            </Tooltip>
          ))}

          <Separator orientation="vertical" className="mx-1 h-4 bg-[#e1dfdd] dark:bg-[#3d3d3d]" />

          {([
            { icon: <List size={14} />, action: () => insertLinePrefix('- '), tip: 'Bullet list' },
            { icon: <ListOrdered size={14} />, action: () => insertLinePrefix('1. '), tip: 'Numbered list' },
            { icon: <Quote size={14} />, action: () => insertLinePrefix('> '), tip: 'Blockquote' },
            { icon: <Link2 size={14} />, action: () => wrapSelection('[', '](url)'), tip: 'Link' },
          ] as Array<{ icon: React.ReactNode; action: () => void; tip: string }>).map(item => (
            <Tooltip key={item.tip}>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" onClick={item.action}
                  className="h-8 w-8 text-[#616161] dark:text-[#9e9e9e] hover:bg-[#e8e8f8] dark:hover:bg-[#333] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc]"
                >{item.icon}</Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={4}>{item.tip}</TooltipContent>
            </Tooltip>
          ))}

          <Separator orientation="vertical" className="mx-1 h-4 bg-[#e1dfdd] dark:bg-[#3d3d3d]" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon" onClick={() => wrapSelection('\n```\n', '\n```\n')}
                className="h-8 w-8 text-[#616161] dark:text-[#9e9e9e] hover:bg-[#e8e8f8] dark:hover:bg-[#333] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc]"
              ><span className="text-[11px] font-mono font-semibold">{'{}'}</span></Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4}>Code block</TooltipContent>
          </Tooltip>

          <div className="ml-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={showPreview}
                  onPressedChange={setShowPreview}
                  className={cn(
                    'gap-1 px-2 h-8 text-[11px]',
                    showPreview && 'bg-[#5b5fc7]/10 text-[#5b5fc7] dark:bg-[#5b5fc7]/20 dark:text-[#a6a9dc]',
                  )}
                >
                  <Eye size={13} />
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
              <div className="mb-2 px-4 py-2.5 bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-xl text-sm text-[#242424] dark:text-[#e0e0e0]">
                <p className="text-[10px] text-[#8a8a8a] mb-1.5 uppercase tracking-wider">Preview</p>
                <MarkdownContent content={input} animate />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea + Send */}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize(); }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Ask ${botName}... (Markdown supported · Shift+Enter for new line)`}
            rows={1}
            className="flex-1 px-4 py-2.5 bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-xl text-sm text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/50 transition-all resize-none overflow-y-auto"
            style={{ maxHeight: 160 }}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileTap={input.trim() ? { scale: 0.9 } : {}}>
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  size="icon"
                  className={cn(
                    'h-10 w-10 rounded-xl shrink-0 transition-all',
                    input.trim()
                      ? 'bg-[#5b5fc7] text-white hover:bg-[#4f52b5] shadow-sm'
                      : 'bg-[#f0f0f0] dark:bg-[#333] text-[#b9bbbe] dark:text-[#5a5a5a]',
                  )}
                >
                  <Send size={16} />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={4}>Send message</TooltipContent>
          </Tooltip>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-[10px] text-muted-foreground mt-1.5 ml-1"
        >
          Markdown supported · Shift+Enter for new line
        </motion.p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  Tab 3: Settings
// ─────────────────────────────────────────

function SettingsTab({ app, ia }: { app: AppIntegration; ia: InstalledApp }) {
  const [formValues, setFormValues] = useState<Record<string, string | boolean>>(ia.config);
  const [isEnabled, setIsEnabled] = useState(ia.enabled);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Enable / Disable */}
      <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-[#242424] dark:text-[#f0f0f0]">Integration Status</h3>
            <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78] mt-0.5">Enable or disable this integration for the space</p>
          </div>
          <button onClick={() => setIsEnabled(!isEnabled)} className="flex items-center gap-2">
            {isEnabled ? (
              <ToggleRight size={32} className="text-[#237b4b] dark:text-[#57ab5a]" />
            ) : (
              <ToggleLeft size={32} className="text-[#b9bbbe] dark:text-[#5a5a5a]" />
            )}
            <span className={`text-sm font-medium ${isEnabled ? 'text-[#237b4b] dark:text-[#57ab5a]' : 'text-[#8a8a8a]'}`}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </button>
        </div>
      </div>

      {/* Configuration */}
      {app.configFields && app.configFields.length > 0 && (
        <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] bg-[#faf9f8] dark:bg-[#1e1f22]">
            <h3 className="font-semibold text-[13px] text-[#242424] dark:text-[#f0f0f0] flex items-center gap-2">
              <Settings size={14} className="text-[#5b5fc7]" />
              Configuration
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {app.configFields.map(field => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-[#242424] dark:text-[#e0e0e0] mb-1">
                  {field.label}
                  {field.required && <span className="text-[#c4314b] ml-0.5">*</span>}
                </label>
                {field.helpText && (
                  <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] mb-1.5">{field.helpText}</p>
                )}

                {field.type === 'text' || field.type === 'channel' ? (
                  <input
                    type="text"
                    value={(formValues[field.id] as string) || ''}
                    onChange={e => setFormValues({ ...formValues, [field.id]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#1e1f22] text-sm text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/50 transition-all"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={(formValues[field.id] as string) || (field.default as string) || ''}
                    onChange={e => setFormValues({ ...formValues, [field.id]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#1e1f22] text-sm text-[#242424] dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/50 transition-all"
                  >
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'toggle' ? (
                  <button
                    onClick={() => setFormValues({ ...formValues, [field.id]: formValues[field.id] === 'true' ? 'false' : 'true' })}
                    className="flex items-center gap-2"
                  >
                    {formValues[field.id] === 'true' || (formValues[field.id] === undefined && field.default === true) ? (
                      <ToggleRight size={24} className="text-[#237b4b] dark:text-[#57ab5a]" />
                    ) : (
                      <ToggleLeft size={24} className="text-[#b9bbbe] dark:text-[#5a5a5a]" />
                    )}
                    <span className="text-sm text-[#424242] dark:text-[#c8c8c8]">
                      {formValues[field.id] === 'true' || (formValues[field.id] === undefined && field.default === true) ? 'Enabled' : 'Disabled'}
                    </span>
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-[#f0f0f0] dark:border-[#333] flex justify-end">
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                saved
                  ? 'bg-[#237b4b] text-white'
                  : 'bg-[#5b5fc7] hover:bg-[#4f52b5] text-white shadow-sm'
              }`}
            >
              {saved ? '✓ Saved' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Permissions */}
      <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] bg-[#faf9f8] dark:bg-[#1e1f22]">
          <h3 className="font-semibold text-[13px] text-[#242424] dark:text-[#f0f0f0] flex items-center gap-2">
            <Shield size={14} className="text-[#d4820c]" />
            Permissions
          </h3>
        </div>
        <div className="p-4">
          <ul className="space-y-2">
            {app.permissions.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#424242] dark:text-[#c8c8c8]">
                <CheckCircle2 size={14} className="text-[#237b4b] dark:text-[#57ab5a] shrink-0 mt-0.5" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Info & Danger Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#f0f0f0] dark:border-[#333] bg-[#faf9f8] dark:bg-[#1e1f22]">
            <h3 className="font-semibold text-[13px] text-[#242424] dark:text-[#f0f0f0] flex items-center gap-2">
              <Info size={14} className="text-[#0078d4]" />
              Information
            </h3>
          </div>
          <div className="p-4 space-y-2 text-sm text-[#424242] dark:text-[#c8c8c8]">
            <div className="flex justify-between">
              <span className="text-[#8a8a8a] dark:text-[#6d6f78]">Developer</span>
              <span>{app.developer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a8a8a] dark:text-[#6d6f78]">Version</span>
              <span>v{app.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a8a8a] dark:text-[#6d6f78]">Category</span>
              <span>{app.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a8a8a] dark:text-[#6d6f78]">Installed by</span>
              <span>{ia.installedBy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a8a8a] dark:text-[#6d6f78]">Installed on</span>
              <span>{format(ia.installedAt, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8a8a8a] dark:text-[#6d6f78]">Rating</span>
              <span className="flex items-center gap-1">
                <Star size={12} className="text-[#d4820c] fill-[#d4820c]" />
                {app.rating}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#c4314b]/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#c4314b]/10 bg-[#fdf0f2] dark:bg-[#c4314b]/5">
            <h3 className="font-semibold text-[13px] text-[#c4314b] dark:text-[#f47067] flex items-center gap-2">
              <Trash2 size={14} />
              Danger Zone
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-[#424242] dark:text-[#c8c8c8]">
              Removing this app will disconnect all webhooks, stop notifications, and delete app-specific data for this space.
            </p>
            <button className="px-4 py-2 rounded-lg text-sm font-medium border border-[#c4314b]/30 text-[#c4314b] dark:text-[#f47067] hover:bg-[#c4314b]/10 transition-colors">
              Uninstall {app.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  Installed App Row (for list view)
// ─────────────────────────────────────────

function InstalledAppRow({
  app,
  installedBy,
  installedAt,
  enabled,
  spaceId,
  onSelect,
}: {
  app: AppIntegration;
  installedBy: string;
  installedAt: Date;
  enabled: boolean;
  spaceId: string;
  onSelect: () => void;
}) {
  return (
    <Link
      to={`/space/${spaceId}/apps/${app.id}`}
      className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden hover:shadow-md hover:border-[#5b5fc7]/30 transition-all block group"
    >
      <div className="flex items-center gap-4 p-4">
        <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] dark:bg-[#333] flex items-center justify-center text-xl shrink-0 shadow-sm">
          {app.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-[#242424] dark:text-[#f0f0f0] group-hover:text-[#5b5fc7] dark:group-hover:text-[#a6a9dc] transition-colors">{app.name}</h3>
            {app.verified && <CheckCircle2 size={12} className="text-[#0078d4] dark:text-[#6cb8f6]" />}
            <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">v{app.version}</span>
          </div>
          <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78] truncate">{app.shortDescription}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`flex items-center gap-1.5 text-[11px] font-medium ${enabled ? 'text-[#237b4b] dark:text-[#57ab5a]' : 'text-[#c4314b] dark:text-[#f47067]'}`}>
            <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-[#237b4b] dark:bg-[#57ab5a]' : 'bg-[#c4314b] dark:bg-[#f47067]'}`} />
            {enabled ? 'Active' : 'Disabled'}
          </span>
          <ChevronRight size={16} className="text-[#d1d1d1] dark:text-[#3d3d3d] group-hover:text-[#5b5fc7] transition-colors" />
        </div>
      </div>
      <div className="px-4 py-2 bg-[#faf9f8] dark:bg-[#1e1f22] border-t border-[#f0f0f0] dark:border-[#333] flex items-center gap-4 text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">
        <span className="flex items-center gap-1">
          <User size={11} />
          {installedBy}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {format(installedAt, 'MMM d, yyyy')}
        </span>
        <span className="flex items-center gap-1">
          <Star size={11} className="text-[#d4820c] fill-[#d4820c]" />
          {app.rating}
        </span>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────
//  App Detail View with 3 tabs
// ─────────────────────────────────────────

type AppTab = 'app' | 'assistant' | 'settings';

function AppDetailView({
  app,
  ia,
  spaceId,
  space,
}: {
  app: AppIntegration;
  ia: InstalledApp;
  spaceId: string;
  space: { name: string; channels: { id: string }[] };
}) {
  const [activeTab, setActiveTab] = useState<AppTab>('app');

  const tabs: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    { id: 'app', label: 'App', icon: <LayoutGrid size={15} /> },
    { id: 'assistant', label: 'Assistant', icon: <Bot size={15} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={15} /> },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f8] dark:bg-[#1f1f1f] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-white dark:bg-[#252525] border-b border-[#e1dfdd] dark:border-[#3d3d3d]">
        <div className="px-6 pt-4 pb-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#8a8a8a] dark:text-[#6d6f78] mb-3">
            <Link
              to={`/space/${spaceId}/${space.channels[0]?.id}`}
              className="hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc] transition-colors"
            >
              {space.name}
            </Link>
            <span className="text-[#d1d1d1] dark:text-[#3d3d3d]">/</span>
            <Link
              to={`/space/${spaceId}/apps`}
              className="hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc] transition-colors"
            >
              Apps
            </Link>
            <span className="text-[#d1d1d1] dark:text-[#3d3d3d]">/</span>
            <span className="text-[#424242] dark:text-[#c8c8c8]">{app.name}</span>
          </div>

          {/* App identity */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] dark:bg-[#333] flex items-center justify-center text-2xl shrink-0 shadow-sm">
              {app.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-[18px] font-bold text-[#242424] dark:text-[#f0f0f0]">{app.name}</h1>
                {app.verified && (
                  <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#ecf5fe] dark:bg-[#0078d4]/15 text-[#0078d4] dark:text-[#6cb8f6]">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                )}
                <span className={`flex items-center gap-1.5 text-[11px] font-medium ${ia.enabled ? 'text-[#237b4b] dark:text-[#57ab5a]' : 'text-[#c4314b] dark:text-[#f47067]'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${ia.enabled ? 'bg-[#237b4b] animate-pulse' : 'bg-[#c4314b]'}`} />
                  {ia.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78]">{app.developer} · v{app.version}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-[#5b5fc7] text-[#5b5fc7] dark:text-[#a6a9dc] dark:border-[#a6a9dc]'
                    : 'border-transparent text-[#616161] dark:text-[#8a8a8a] hover:text-[#242424] dark:hover:text-[#e0e0e0] hover:border-[#d1d1d1] dark:hover:border-[#3d3d3d]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-on-hover">
        <div className={activeTab === 'assistant' || (activeTab === 'app' && ['figma', 'miro', 'gitlab', 'jira', 'sentry', 'grafana', 'release-management'].includes(app.id)) ? '' : 'max-w-4xl'}>
          {activeTab === 'app' && <AppScreenTab app={app} config={ia.config} />}
          {activeTab === 'assistant' && <AssistantTab app={app} config={ia.config} />}
          {activeTab === 'settings' && <SettingsTab app={app} ia={ia} />}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  Main Page Export
// ─────────────────────────────────────────

export function SpaceApps() {
  const { spaceId, appId: routeAppId } = useParams();
  const navigate = useNavigate();

  const space = spaces.find(s => s.id === spaceId);
  const installedApps = getAppsForSpace(spaceId || '');

  if (!space) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#1f1f1f]">
        <p className="text-[#616161]">Space not found</p>
      </div>
    );
  }

  // ── If appId present, show 3-tab detail view ──
  if (routeAppId) {
    const installedItem = installedApps.find(a => a.appId === routeAppId);
    if (!installedItem) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#faf9f8] dark:bg-[#1f1f1f]">
          <div className="w-14 h-14 bg-[#f0f0f0] dark:bg-[#292929] rounded-2xl flex items-center justify-center mb-4">
            <Puzzle size={24} className="text-[#b9bbbe]" />
          </div>
          <p className="text-[#242424] dark:text-[#f0f0f0] font-medium mb-1">App not found</p>
          <p className="text-sm text-[#616161] dark:text-[#8a8a8a] mb-4">This app isn't installed in this space.</p>
          <Link
            to={`/space/${spaceId}/apps`}
            className="text-sm text-[#5b5fc7] hover:underline"
          >
            Back to installed apps
          </Link>
        </div>
      );
    }

    return (
      <AppDetailView
        app={installedItem.app}
        ia={installedItem}
        spaceId={spaceId || ''}
        space={space}
      />
    );
  }

  // ── List view ──
  return (
    <div className="flex-1 flex flex-col bg-[#faf9f8] dark:bg-[#1f1f1f] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 pt-5 pb-4 bg-white dark:bg-[#252525] border-b border-[#e1dfdd] dark:border-[#3d3d3d]">
        <div className="flex items-center gap-2 text-xs text-[#8a8a8a] dark:text-[#6d6f78] mb-3">
          <Link
            to={`/space/${spaceId}/${space.channels[0]?.id}`}
            className="hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc] transition-colors"
          >
            {space.name}
          </Link>
          <span className="text-[#d1d1d1] dark:text-[#3d3d3d]">/</span>
          <span className="text-[#424242] dark:text-[#c8c8c8]">Apps</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5b5fc7] to-[#7b7dd8] flex items-center justify-center shadow-sm">
              <Puzzle size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-[#242424] dark:text-[#f0f0f0]">Installed Apps</h1>
              <p className="text-sm text-[#616161] dark:text-[#8a8a8a]">
                {installedApps.length} app{installedApps.length !== 1 ? 's' : ''} installed in {space.name}
              </p>
            </div>
          </div>
          <Link
            to="/apps"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[#5b5fc7] text-white hover:bg-[#4f52b5] transition-colors shadow-sm"
          >
            <Search size={14} />
            Browse App Store
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-3">
          {installedApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-[#f0f0f0] dark:bg-[#292929] rounded-2xl flex items-center justify-center mb-4">
                <Puzzle size={24} className="text-[#b9bbbe] dark:text-[#5a5a5a]" />
              </div>
              <p className="text-[#242424] dark:text-[#f0f0f0] font-medium mb-1">No apps installed</p>
              <p className="text-sm text-[#616161] dark:text-[#8a8a8a] mb-4">Browse the App Store to find integrations for this space.</p>
              <Link
                to="/apps"
                className="px-4 py-2 rounded-lg bg-[#5b5fc7] text-white text-sm font-medium hover:bg-[#4f52b5] transition-colors"
              >
                Browse App Store
              </Link>
            </div>
          ) : (
            installedApps.map(ia => (
              <InstalledAppRow
                key={ia.appId}
                app={ia.app}
                installedBy={ia.installedBy}
                installedAt={ia.installedAt}
                enabled={ia.enabled}
                spaceId={spaceId || ''}
                onSelect={() => navigate(`/space/${spaceId}/apps/${ia.appId}`)}
              />
            ))
          )}

          {/* Suggested apps */}
          {installedApps.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-sm text-[#242424] dark:text-[#f0f0f0] mb-3">Suggested for {space.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {appCatalog
                  .filter(a => !installedApps.find(ia => ia.appId === a.id))
                  .slice(0, 4)
                  .map(app => (
                    <Link
                      key={app.id}
                      to="/apps"
                      className="flex items-center gap-3 p-3 bg-white dark:bg-[#252525] rounded-xl border border-dashed border-[#d1d1d1] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/40 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#f5f5f5] dark:bg-[#333] flex items-center justify-center text-lg shrink-0">
                        {app.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#242424] dark:text-[#e0e0e0] group-hover:text-[#5b5fc7] dark:group-hover:text-[#a6a9dc] transition-colors truncate">{app.name}</p>
                        <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] truncate">{app.shortDescription}</p>
                      </div>
                      <Download size={14} className="text-[#d1d1d1] dark:text-[#3d3d3d] group-hover:text-[#5b5fc7] transition-colors shrink-0" />
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
