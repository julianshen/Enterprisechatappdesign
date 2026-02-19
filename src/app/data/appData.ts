// App Integration data

export type AppCategory = 'DevOps' | 'Productivity' | 'Design' | 'Communication' | 'Analytics' | 'Project Management' | 'Security' | 'AI';

export interface AppIntegration {
  id: string;
  name: string;
  icon: string; // emoji or URL
  category: AppCategory;
  developer: string;
  version: string;
  shortDescription: string;
  longDescription: string;
  features: string[];
  permissions: string[];
  installs: number;
  rating: number;
  verified: boolean;
  configFields?: AppConfigField[];
  color: string; // brand color for card accents
}

export interface AppConfigField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'toggle' | 'channel';
  placeholder?: string;
  options?: string[];
  default?: string | boolean;
  required?: boolean;
  helpText?: string;
}

export interface InstalledApp {
  appId: string;
  spaceId: string;
  installedBy: string;
  installedAt: Date;
  enabled: boolean;
  config: Record<string, string | boolean>;
}

// ─── App Catalog ───
export const appCatalog: AppIntegration[] = [
  {
    id: 'gitlab',
    name: 'GitLab',
    icon: '🦊',
    category: 'DevOps',
    developer: 'GitLab Inc.',
    version: '4.2.0',
    shortDescription: 'Merge requests, CI/CD pipelines, issue tracking, and code review.',
    longDescription: 'Connect your GitLab projects to get real-time notifications about merge requests, issues, and CI/CD pipelines directly in your channels. Team members can review, comment, and merge MRs without leaving the chat.\n\nThe GitLab integration supports:\n• Automatic notifications for new MRs, issues, and releases\n• Rich previews for GitLab links shared in chat\n• Slash commands to create issues and check pipeline status\n• CI/CD pipeline and deployment status updates\n• Code snippet sharing with syntax highlighting',
    features: [
      'Real-time MR and issue notifications',
      'Rich link previews for projects, MRs, and issues',
      'Slash commands: /gitlab create-issue, /gitlab pipeline-status',
      'CI/CD pipeline and deployment status',
      'Code review reminders and assignments',
      'Branch protection rule alerts',
    ],
    permissions: [
      'Read channel messages',
      'Post messages to channels',
      'Access user profiles',
      'Manage webhooks',
    ],
    installs: 18420,
    rating: 4.8,
    verified: true,
    color: '#FC6D26',
    configFields: [
      { id: 'project_url', label: 'Project URL', type: 'text', placeholder: 'https://gitlab.com/org/repo', required: true, helpText: 'The GitLab project to connect' },
      { id: 'notify_channel', label: 'Notification Channel', type: 'channel', required: true, helpText: 'Channel to post notifications to' },
      { id: 'mr_notifications', label: 'MR Notifications', type: 'toggle', default: true },
      { id: 'issue_notifications', label: 'Issue Notifications', type: 'toggle', default: true },
      { id: 'pipeline_notifications', label: 'Pipeline Notifications', type: 'toggle', default: false },
      { id: 'review_reminders', label: 'Review Reminder Frequency', type: 'select', options: ['Off', 'Every 4 hours', 'Daily', 'Weekly'], default: 'Daily' },
    ],
  },
  {
    id: 'jira',
    name: 'Jira',
    icon: '🔷',
    category: 'Project Management',
    developer: 'Atlassian',
    version: '4.2.1',
    shortDescription: 'Issue tracking, sprint boards, and project management sync.',
    longDescription: 'Bring Jira project management into your workspace. Create and update issues, track sprint progress, and get notified about changes — all without switching tabs.\n\nKey capabilities:\n• Two-way sync between chat and Jira boards\n• Create issues from messages with one click\n• Sprint dashboard widgets for team dashboards\n• Automatic status updates posted to channels\n• JQL search from within chat',
    features: [
      'Create Jira issues from chat messages',
      'Bi-directional sync for issue updates',
      'Sprint progress notifications',
      'JQL search via slash commands',
      'Rich issue previews in chat',
      'Board and backlog quick views',
    ],
    permissions: [
      'Read channel messages',
      'Post messages to channels',
      'Access user profiles',
      'Create and modify external resources',
    ],
    installs: 15230,
    rating: 4.6,
    verified: true,
    color: '#0052CC',
    configFields: [
      { id: 'jira_url', label: 'Jira Instance URL', type: 'text', placeholder: 'https://yourorg.atlassian.net', required: true },
      { id: 'project_key', label: 'Project Key', type: 'text', placeholder: 'ENG', required: true, helpText: 'The Jira project key to sync' },
      { id: 'notify_channel', label: 'Notification Channel', type: 'channel', required: true },
      { id: 'sync_comments', label: 'Sync Comments', type: 'toggle', default: true },
      { id: 'auto_create', label: 'Auto-create from flagged messages', type: 'toggle', default: false },
    ],
  },
  {
    id: 'figma',
    name: 'Figma',
    icon: '🎨',
    category: 'Design',
    developer: 'Figma, Inc.',
    version: '2.5.0',
    shortDescription: 'Design previews, file sharing, and comment sync.',
    longDescription: 'The Figma integration brings design collaboration into your team communication. Share Figma links and get instant rich previews with frame thumbnails. Sync design comments to chat threads for contextual discussions.\n\nFeatures include:\n• Rich previews for any Figma link with live thumbnails\n• Comment sync — Figma comments appear as chat threads\n• Notification when designs are updated or reviewed\n• Design handoff links with specs and assets\n• Version history timeline in channel',
    features: [
      'Rich Figma link previews with thumbnails',
      'Comment sync between Figma and chat',
      'Design update notifications',
      'Frame embedding in messages',
      'Design system component search',
      'Version history timeline',
    ],
    permissions: [
      'Read channel messages',
      'Post messages to channels',
      'Embed content',
    ],
    installs: 9870,
    rating: 4.7,
    verified: true,
    color: '#F24E1E',
    configFields: [
      { id: 'team_id', label: 'Figma Team ID', type: 'text', placeholder: 'Your Figma team ID', required: true },
      { id: 'notify_channel', label: 'Notification Channel', type: 'channel', required: true },
      { id: 'comment_sync', label: 'Sync Comments to Threads', type: 'toggle', default: true },
      { id: 'update_notifications', label: 'File Update Notifications', type: 'toggle', default: true },
    ],
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    icon: '📁',
    category: 'Productivity',
    developer: 'Google LLC',
    version: '5.1.3',
    shortDescription: 'File sync, document collaboration, and Drive search.',
    longDescription: 'Access and share Google Drive files seamlessly. Get rich previews for shared links, collaborate on docs directly, and search your Drive from within any channel.\n\n• Rich previews for Docs, Sheets, Slides, and other Drive files\n• In-chat file browser to find and share files\n• Permission management — auto-grant access when sharing\n• Activity feed for shared files (edits, comments, shares)\n• Drag-and-drop upload to Drive folders',
    features: [
      'Rich file previews for all Google formats',
      'In-chat Drive file browser',
      'Auto-permission management on share',
      'File activity feed and change notifications',
      'Drag-and-drop upload to Drive',
      'Collaborative editing links',
    ],
    permissions: [
      'Read channel messages',
      'Post messages to channels',
      'Access file storage',
      'Manage file permissions',
    ],
    installs: 22100,
    rating: 4.5,
    verified: true,
    color: '#4285F4',
    configFields: [
      { id: 'drive_folder', label: 'Shared Drive Folder', type: 'text', placeholder: 'Folder ID or URL', required: false, helpText: 'Optional: link a specific shared folder' },
      { id: 'auto_permissions', label: 'Auto-grant permissions on share', type: 'toggle', default: true },
      { id: 'activity_notifications', label: 'File Activity Notifications', type: 'toggle', default: false },
    ],
  },
  {
    id: 'yellow-book',
    name: 'Yellow Book',
    icon: '📒',
    category: 'Productivity',
    developer: 'Built-in',
    version: '2.3.0',
    shortDescription: 'Company directory, org tree browser, and people search.',
    longDescription: 'Find anyone in the company instantly. Browse the organizational hierarchy with a visual tree view, search people by name, role, department, or skills, and view detailed profiles with contact info and reporting chains.\n\n• Interactive org tree with collapse/expand navigation\n• Minimal view scope — see your branch, traverse up and down\n• People search by name, title, department, or skills\n• Employee profile cards with contact details\n• Reporting chain visualization\n• Quick actions: message, email, schedule meeting',
    features: [
      'Interactive org tree hierarchy',
      'People search with filters',
      'Employee profile cards',
      'Reporting chain navigation',
      'Department & team browsing',
      'Quick contact actions',
      'Minimal view scope with traversal',
      'Skill and expertise lookup',
    ],
    permissions: [
      'Read organization directory',
      'Access user profiles',
      'Post messages to channels',
    ],
    installs: 24500,
    rating: 4.8,
    verified: true,
    color: '#D4A017',
    configFields: [
      { id: 'default_scope', label: 'Default View Scope', type: 'select', options: ['My Team', 'My Department', 'Full Org'], default: 'My Team' },
      { id: 'show_contact_info', label: 'Show Contact Info', type: 'toggle', default: true },
      { id: 'show_skills', label: 'Show Skills & Expertise', type: 'toggle', default: true },
    ],
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    category: 'Productivity',
    developer: 'Notion Labs',
    version: '3.0.1',
    shortDescription: 'Wiki integration, page sync, and database queries.',
    longDescription: 'Connect your Notion workspace for seamless knowledge management. Search and share Notion pages, sync database views, and get updates when wiki content changes.\n\n• Search Notion pages and databases from chat\n• Rich page previews with content snippets\n• Database query results as formatted tables\n• Page update notifications for watched content\n• Quick-create pages from chat messages',
    features: [
      'Notion page search from chat',
      'Rich previews with content snippets',
      'Database queries as formatted tables',
      'Page change notifications',
      'Quick-create pages from messages',
      'Linked database views in dashboards',
    ],
    permissions: [
      'Read channel messages',
      'Post messages to channels',
      'Access user profiles',
    ],
    installs: 11340,
    rating: 4.6,
    verified: true,
    color: '#000000',
    configFields: [
      { id: 'workspace_id', label: 'Notion Workspace ID', type: 'text', required: true },
      { id: 'notify_channel', label: 'Update Notification Channel', type: 'channel', required: false },
      { id: 'page_notifications', label: 'Page Update Notifications', type: 'toggle', default: true },
    ],
  },
  {
    id: 'sentry',
    name: 'Sentry',
    icon: '🛡️',
    category: 'DevOps',
    developer: 'Sentry.io',
    version: '2.3.4',
    shortDescription: 'Error tracking, crash reports, and performance alerts.',
    longDescription: 'Get real-time error and performance alerts from Sentry. Track issues, assign them to team members, and resolve them — all from chat.\n\n• Real-time error alerts with stack traces\n• Issue assignment and status management\n• Release tracking and regression detection\n• Performance transaction alerts\n• Customizable alert rules and thresholds',
    features: [
      'Real-time error notifications',
      'Stack trace previews in chat',
      'Issue assignment from chat',
      'Release and regression tracking',
      'Performance monitoring alerts',
      'Custom alert rule configuration',
    ],
    permissions: [
      'Post messages to channels',
      'Access user profiles',
      'Manage webhooks',
    ],
    installs: 7650,
    rating: 4.5,
    verified: true,
    color: '#362D59',
    configFields: [
      { id: 'sentry_org', label: 'Sentry Organization', type: 'text', required: true },
      { id: 'sentry_project', label: 'Sentry Project', type: 'text', required: true },
      { id: 'alert_channel', label: 'Alert Channel', type: 'channel', required: true },
      { id: 'alert_level', label: 'Minimum Alert Level', type: 'select', options: ['All', 'Warning+', 'Error+', 'Fatal Only'], default: 'Error+' },
      { id: 'performance_alerts', label: 'Performance Alerts', type: 'toggle', default: false },
    ],
  },
  {
    id: 'linear',
    name: 'Linear',
    icon: '🔺',
    category: 'Project Management',
    developer: 'Linear Inc.',
    version: '2.1.0',
    shortDescription: 'Streamlined issue tracking and roadmap integration.',
    longDescription: 'Bring Linear\'s fast issue tracking into your workspace. Create issues, track cycles, and view roadmaps without context switching.\n\n• Create and update issues from chat\n• Cycle progress notifications\n• Roadmap milestones and timeline\n• Issue previews with status, assignee, and priority\n• Triage inbox integration',
    features: [
      'Create issues from messages',
      'Cycle progress tracking',
      'Roadmap milestone notifications',
      'Rich issue link previews',
      'Priority and label management',
      'Team inbox integration',
    ],
    permissions: [
      'Read channel messages',
      'Post messages to channels',
      'Create and modify external resources',
    ],
    installs: 6200,
    rating: 4.7,
    verified: true,
    color: '#5E6AD2',
    configFields: [
      { id: 'team_key', label: 'Linear Team Key', type: 'text', required: true },
      { id: 'notify_channel', label: 'Notification Channel', type: 'channel', required: true },
      { id: 'cycle_updates', label: 'Cycle Update Notifications', type: 'toggle', default: true },
      { id: 'auto_create', label: 'Auto-create from flagged messages', type: 'toggle', default: false },
    ],
  },
  {
    id: 'miro',
    name: 'Miro',
    icon: '🟡',
    category: 'Design',
    developer: 'Miro, Inc.',
    version: '1.9.5',
    shortDescription: 'Whiteboard collaboration, brainstorming, and workshop tools.',
    longDescription: 'Bring Miro whiteboard collaboration into your workspace. Share boards, run brainstorming sessions, and embed live board views in channels.\n\n• Share and preview Miro boards in chat\n• Start collaborative sessions from any channel\n• Board update notifications\n• Template gallery for quick starts\n• Meeting integration with whiteboard prep',
    features: [
      'Miro board previews in chat',
      'Start collaboration sessions',
      'Board update notifications',
      'Template quick-start',
      'Embedded board views',
      'Workshop facilitation tools',
    ],
    permissions: [
      'Read channel messages',
      'Post messages to channels',
      'Embed content',
    ],
    installs: 4780,
    rating: 4.3,
    verified: true,
    color: '#FFD02F',
    configFields: [
      { id: 'team_id', label: 'Miro Team ID', type: 'text', required: true },
      { id: 'auto_embed', label: 'Auto-embed board previews', type: 'toggle', default: true },
    ],
  },
  {
    id: 'openai-assistant',
    name: 'AI Assistant',
    icon: '🤖',
    category: 'AI',
    developer: 'OpenAI',
    version: '1.5.0',
    shortDescription: 'AI-powered chat assistant for summarization, Q&A, and content generation.',
    longDescription: 'Add an AI assistant to your channels for intelligent assistance. Summarize long threads, answer questions from your wiki, generate content, and automate routine tasks.\n\n• Thread and channel summarization\n• Q&A powered by your connected knowledge bases\n• Content drafting and editing assistance\n• Meeting notes generation from transcripts\n• Custom bot personality and rules',
    features: [
      'Thread summarization on demand',
      'Knowledge base Q&A',
      'Content generation and editing',
      'Meeting notes from transcripts',
      'Custom instructions and personality',
      'Multi-language support',
    ],
    permissions: [
      'Read channel messages',
      'Post messages to channels',
      'Access user profiles',
      'Access file storage',
    ],
    installs: 13600,
    rating: 4.8,
    verified: true,
    color: '#10A37F',
    configFields: [
      { id: 'bot_name', label: 'Assistant Name', type: 'text', placeholder: 'e.g. Jarvis', default: 'AI Assistant' },
      { id: 'response_channel', label: 'Default Response Channel', type: 'channel', required: false },
      { id: 'knowledge_access', label: 'Access Connected Knowledge Bases', type: 'toggle', default: true },
      { id: 'auto_summarize', label: 'Auto-summarize Long Threads', type: 'toggle', default: false },
      { id: 'model_preference', label: 'Model Preference', type: 'select', options: ['GPT-4o', 'GPT-4o-mini', 'o1-preview'], default: 'GPT-4o' },
    ],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: '☁️',
    category: 'Analytics',
    developer: 'Salesforce, Inc.',
    version: '3.7.0',
    shortDescription: 'CRM sync, deal tracking, and customer insights.',
    longDescription: 'Connect Salesforce to bring CRM data into your team conversations. Track deals, view customer profiles, and get pipeline notifications directly in channels.\n\n• Deal and opportunity notifications\n• Customer 360 profiles accessible from chat\n• Pipeline dashboard widgets\n• Automatic account mention enrichment\n• Salesforce record search',
    features: [
      'Deal and opportunity alerts',
      'Customer profile quick views',
      'Pipeline dashboard integration',
      'Account mention enrichment',
      'Salesforce record search',
      'Automated deal-stage notifications',
    ],
    permissions: [
      'Read channel messages',
      'Post messages to channels',
      'Access user profiles',
      'Access external CRM data',
    ],
    installs: 8900,
    rating: 4.3,
    verified: true,
    color: '#00A1E0',
    configFields: [
      { id: 'sf_instance', label: 'Salesforce Instance URL', type: 'text', required: true },
      { id: 'notify_channel', label: 'Deal Notification Channel', type: 'channel', required: true },
      { id: 'deal_alerts', label: 'Deal Stage Change Alerts', type: 'toggle', default: true },
      { id: 'min_deal_size', label: 'Minimum Deal Size for Alerts', type: 'select', options: ['All', '$10K+', '$50K+', '$100K+'], default: '$10K+' },
    ],
  },
  {
    id: 'pagerduty',
    name: 'PagerDuty',
    icon: '🚨',
    category: 'Security',
    developer: 'PagerDuty, Inc.',
    version: '2.8.0',
    shortDescription: 'Incident management, on-call scheduling, and escalation.',
    longDescription: 'Manage incidents end-to-end from your chat workspace. Receive alerts, trigger escalations, and coordinate response — all without leaving the conversation.\n\n• Real-time incident alerts in channels\n• On-call schedule visibility\n• Acknowledge and resolve from chat\n• Escalation management\n• Post-incident review workflows',
    features: [
      'Real-time incident alerts',
      'Acknowledge / resolve from chat',
      'On-call schedule display',
      'Escalation chain management',
      'Incident timeline tracking',
      'Post-mortem workflow triggers',
    ],
    permissions: [
      'Post messages to channels',
      'Access user profiles',
      'Manage webhooks',
      'Trigger external actions',
    ],
    installs: 6100,
    rating: 4.5,
    verified: true,
    color: '#06AC38',
    configFields: [
      { id: 'pd_service', label: 'PagerDuty Service ID', type: 'text', required: true },
      { id: 'alert_channel', label: 'Incident Alert Channel', type: 'channel', required: true },
      { id: 'auto_ack', label: 'Auto-acknowledge on first reply', type: 'toggle', default: false },
    ],
  },
  {
    id: 'confluence',
    name: 'Confluence',
    icon: '📘',
    category: 'Productivity',
    developer: 'Atlassian',
    version: '3.4.2',
    shortDescription: 'Wiki pages, documentation sync, and knowledge search.',
    longDescription: 'Access your Confluence knowledge base from within chat. Search pages, get rich previews, and stay updated on documentation changes.\n\n• Search Confluence from slash commands\n• Rich page previews with excerpts\n• Page creation from messages\n• Space and page update notifications\n• Meeting notes integration',
    features: [
      'Confluence page search',
      'Rich page link previews',
      'Create pages from messages',
      'Page update notifications',
      'Space-level subscriptions',
      'Inline page excerpts',
    ],
    permissions: [
      'Read channel messages',
      'Post messages to channels',
      'Access external knowledge base',
    ],
    installs: 7800,
    rating: 4.2,
    verified: true,
    color: '#1868DB',
    configFields: [
      { id: 'confluence_url', label: 'Confluence Instance URL', type: 'text', required: true },
      { id: 'space_key', label: 'Default Space Key', type: 'text', required: false },
      { id: 'update_notifications', label: 'Page Update Notifications', type: 'toggle', default: true },
    ],
  },
  {
    id: 'asset-management',
    name: 'Asset Management',
    icon: '📦',
    category: 'DevOps',
    developer: 'Built-in',
    version: '1.4.0',
    shortDescription: 'Manage binary packages, container images, and libraries with security scanning and promotion workflows.',
    longDescription: 'Centralized software asset management for your engineering organization. Track built versions of binary packages, container images, and libraries. View security scan results, manage vulnerability remediation, and promote reviewed versions to production with approval workflows.\n\n• Binary packages, container images & library registry\n• Built version history with build metadata\n• Integrated security scanning (CVE detection)\n• Vulnerability severity breakdown (Critical/High/Medium/Low)\n• Promotion pipeline: Dev \u2192 Staging \u2192 Production\n• Approval workflows for production promotion',
    features: [
      'Multi-format asset registry',
      'Built version tracking & history',
      'Security vulnerability scanning',
      'CVE severity classification',
      'Promotion to production workflow',
      'Build metadata & provenance',
      'License compliance checks',
      'Approval chains for releases',
    ],
    permissions: [
      'Read asset registry',
      'Promote versions across environments',
      'View security scan results',
      'Post promotion notifications to channels',
    ],
    installs: 3800,
    rating: 4.5,
    verified: true,
    color: '#5b5fc7',
    configFields: [
      { id: 'registry_url', label: 'Registry URL', type: 'text', required: true },
      { id: 'scan_provider', label: 'Security Scanner', type: 'select', options: ['Trivy', 'Snyk', 'Grype', 'Built-in'], default: 'Trivy' },
      { id: 'auto_scan', label: 'Auto-scan on publish', type: 'select', options: ['Enabled', 'Disabled'], default: 'Enabled' },
      { id: 'promotion_approval', label: 'Require approval for promotion', type: 'select', options: ['Yes', 'No'], default: 'Yes' },
      { id: 'alert_channel', label: 'Notification Channel', type: 'channel', required: true },
    ],
  },
  {
    id: 'calendar',
    name: 'Calendar Sync',
    icon: '📅',
    category: 'Productivity',
    developer: 'Built-in',
    version: '1.0.0',
    shortDescription: 'Sync team calendars, meeting reminders, and availability status.',
    longDescription: 'Keep your team in sync with shared calendar integration. Get meeting reminders in channels, automatically update your status based on calendar events, and schedule team events.\n\n• Meeting reminders 5 min before start\n• Auto-set status (In a meeting, Busy)\n• Team calendar overlay view\n• Event creation from chat\n• Daily agenda digest in channels',
    features: [
      'Meeting reminders in channels',
      'Auto-status from calendar events',
      'Team availability overlay',
      'Quick event creation',
      'Daily agenda digest',
      'Room booking integration',
    ],
    permissions: [
      'Post messages to channels',
      'Access user profiles',
      'Modify user status',
    ],
    installs: 16200,
    rating: 4.6,
    verified: true,
    color: '#4285F4',
    configFields: [
      { id: 'calendar_provider', label: 'Calendar Provider', type: 'select', options: ['Google Calendar', 'Outlook', 'Apple Calendar'], required: true },
      { id: 'reminder_minutes', label: 'Reminder Before Meeting', type: 'select', options: ['1 min', '5 min', '10 min', '15 min'], default: '5 min' },
      { id: 'auto_status', label: 'Auto-update Status', type: 'toggle', default: true },
      { id: 'daily_digest', label: 'Daily Agenda Digest', type: 'toggle', default: true },
    ],
  },
  {
    id: 'grafana',
    name: 'Grafana',
    icon: '📊',
    category: 'Analytics',
    developer: 'Grafana Labs',
    version: '10.4.0',
    shortDescription: 'Infrastructure monitoring dashboards, alerts, and observability.',
    longDescription: 'Embed Grafana dashboards directly in your team spaces. Monitor infrastructure metrics, application performance, and alert statuses in real-time.\n\n• Live dashboard panels with auto-refresh\n• CPU, memory, network, and disk metrics\n• Service health monitoring\n• Alert integration with PagerDuty and Slack\n• Custom dashboard sharing to channels',
    features: [
      'Live dashboard embedding',
      'Infrastructure metrics monitoring',
      'Service health overview',
      'Alert state notifications',
      'Custom time range controls',
      'Panel sharing to channels',
    ],
    permissions: [
      'Post messages to channels',
      'Embed content',
      'Manage webhooks',
    ],
    installs: 9800,
    rating: 4.7,
    verified: true,
    color: '#FF9830',
    configFields: [
      { id: 'grafana_url', label: 'Grafana Instance URL', type: 'text', placeholder: 'https://grafana.company.com', required: true },
      { id: 'alert_channel', label: 'Alert Channel', type: 'channel', required: true },
      { id: 'auto_refresh', label: 'Auto-refresh Interval', type: 'select', options: ['Off', '5s', '10s', '30s', '1m'], default: '10s' },
      { id: 'alert_notifications', label: 'Alert Notifications', type: 'toggle', default: true },
    ],
  },
  {
    id: 'meeting-center',
    name: 'Meeting Center',
    icon: '📅',
    category: 'Communication',
    developer: 'Internal Tools',
    version: '2.0.0',
    shortDescription: 'Schedule meetings, book rooms, and manage your calendar.',
    longDescription: 'An all-in-one meeting management hub. Schedule meetings, find and book available conference rooms, track attendees, and view room amenities — all without leaving the workspace.\n\n• Schedule one-time or recurring meetings\n• Browse room availability with real-time status\n• View room amenities (display, webcam, whiteboard, phone)\n• Track attendee RSVP status\n• Hybrid, video, and in-person meeting types\n• Room availability heatmap for quick booking',
    features: [
      'One-click meeting scheduling',
      'Real-time room availability',
      'Room amenity browser',
      'Recurring meeting support',
      'Attendee RSVP tracking',
      'Availability heatmap',
    ],
    permissions: [
      'Read channel messages',
      'Post messages to channels',
      'Access user profiles',
      'Manage calendar events',
    ],
    installs: 15200,
    rating: 4.6,
    verified: true,
    color: '#5b5fc7',
    configFields: [
      { id: 'default_duration', label: 'Default Meeting Duration', type: 'select', options: ['15 min', '30 min', '45 min', '60 min'], default: '30 min' },
      { id: 'auto_book_room', label: 'Auto-suggest Available Room', type: 'toggle', default: true },
      { id: 'calendar_sync', label: 'Sync with Calendar', type: 'toggle', default: true },
    ],
  },
  {
    id: 'release-management',
    name: 'Release Management',
    icon: '🚀',
    category: 'DevOps',
    developer: 'Internal Platform Team',
    version: '2.4.0',
    shortDescription: 'Deploy pipeline management, release tracking, and post-deploy verification.',
    longDescription: 'Manage your entire deployment lifecycle from build to production. Track pipeline status, review deploy steps, run post-deployment checks, and roll back if needed.\n\n• Full pipeline visualization with step-by-step status\n• Post-deploy health checks and smoke tests\n• Canary analysis and performance baseline verification\n• One-click rollback capability\n• Multi-service deploy tracking',
    features: [
      'Pipeline step-by-step tracking',
      'Post-deploy verification checks',
      'Canary analysis and performance monitoring',
      'Approval gates and manual sign-off',
      'Rollback management',
      'Multi-service deploy coordination',
    ],
    permissions: [
      'Post messages to channels',
      'Manage webhooks',
      'Embed content',
    ],
    installs: 4820,
    rating: 4.6,
    verified: true,
    color: '#5b5fc7',
    configFields: [
      { id: 'pipeline_url', label: 'Pipeline API URL', type: 'text', required: true, helpText: 'Base URL for your CI/CD pipeline API' },
      { id: 'alert_channel', label: 'Deploy Notifications Channel', type: 'channel', required: true },
      { id: 'auto_checks', label: 'Auto-run Post-Deploy Checks', type: 'toggle', default: true },
      { id: 'approval_required', label: 'Require Manual Approval', type: 'toggle', default: true },
    ],
  },
];

// ─── Per-space installed apps ───
export const installedApps: InstalledApp[] = [
  // Company HQ
  { appId: 'yellow-book', spaceId: 'general', installedBy: 'Jane Smith', installedAt: new Date('2026-01-05T10:00:00'), enabled: true, config: { default_scope: 'My Team', show_contact_info: 'true', show_skills: 'true' } },
  { appId: 'meeting-center', spaceId: 'general', installedBy: 'Jane Smith', installedAt: new Date('2026-01-05T10:15:00'), enabled: true, config: { default_duration: '30 min', auto_book_room: 'true', calendar_sync: 'true' } },
  { appId: 'calendar', spaceId: 'general', installedBy: 'Jane Smith', installedAt: new Date('2026-01-06T09:00:00'), enabled: true, config: { calendar_provider: 'Google Calendar', auto_status: 'true' } },
  { appId: 'notion', spaceId: 'general', installedBy: 'Bob Johnson', installedAt: new Date('2026-01-10T14:00:00'), enabled: true, config: { page_notifications: 'true' } },

  // Engineering
  { appId: 'gitlab', spaceId: 'engineering', installedBy: 'Bob Johnson', installedAt: new Date('2026-01-02T08:00:00'), enabled: true, config: { project_url: 'https://gitlab.com/company/main-app', mr_notifications: 'true', issue_notifications: 'true', pipeline_notifications: 'true', review_reminders: 'Daily' } },
  { appId: 'jira', spaceId: 'engineering', installedBy: 'Bob Johnson', installedAt: new Date('2026-01-02T08:30:00'), enabled: true, config: { project_key: 'ENG', sync_comments: 'true' } },
  { appId: 'sentry', spaceId: 'engineering', installedBy: 'Charlie Brown', installedAt: new Date('2026-01-03T11:00:00'), enabled: true, config: { alert_level: 'Error+', performance_alerts: 'true' } },
  { appId: 'asset-management', spaceId: 'engineering', installedBy: 'Charlie Brown', installedAt: new Date('2026-01-04T09:00:00'), enabled: true, config: { scan_provider: 'Trivy', auto_scan: 'Enabled', promotion_approval: 'Yes' } },
  { appId: 'openai-assistant', spaceId: 'engineering', installedBy: 'Bob Johnson', installedAt: new Date('2026-01-15T10:00:00'), enabled: true, config: { bot_name: 'DevBot', model_preference: 'GPT-4o', auto_summarize: 'true' } },
  { appId: 'pagerduty', spaceId: 'engineering', installedBy: 'Charlie Brown', installedAt: new Date('2026-01-08T15:00:00'), enabled: false, config: { auto_ack: 'false' } },
  { appId: 'release-management', spaceId: 'engineering', installedBy: 'Bob Johnson', installedAt: new Date('2026-01-05T13:00:00'), enabled: true, config: { auto_checks: 'true', approval_required: 'true' } },

  // Design
  { appId: 'figma', spaceId: 'design', installedBy: 'Alice Williams', installedAt: new Date('2026-01-02T09:00:00'), enabled: true, config: { comment_sync: 'true', update_notifications: 'true' } },
  { appId: 'miro', spaceId: 'design', installedBy: 'Alice Williams', installedAt: new Date('2026-01-03T10:00:00'), enabled: true, config: { auto_embed: 'true' } },
  { appId: 'notion', spaceId: 'design', installedBy: 'Alice Williams', installedAt: new Date('2026-01-05T11:00:00'), enabled: true, config: { page_notifications: 'true' } },
  { appId: 'openai-assistant', spaceId: 'design', installedBy: 'Alice Williams', installedAt: new Date('2026-01-20T14:00:00'), enabled: true, config: { bot_name: 'DesignBot', model_preference: 'GPT-4o' } },

  // Marketing
  { appId: 'salesforce', spaceId: 'marketing', installedBy: 'Jane Smith', installedAt: new Date('2026-01-04T10:00:00'), enabled: true, config: { deal_alerts: 'true', min_deal_size: '$10K+' } },
  { appId: 'google-drive', spaceId: 'marketing', installedBy: 'Jane Smith', installedAt: new Date('2026-01-04T10:30:00'), enabled: true, config: { auto_permissions: 'true' } },
  { appId: 'calendar', spaceId: 'marketing', installedBy: 'Jane Smith', installedAt: new Date('2026-01-05T09:00:00'), enabled: true, config: { calendar_provider: 'Google Calendar', daily_digest: 'true' } },
  { appId: 'confluence', spaceId: 'marketing', installedBy: 'Jane Smith', installedAt: new Date('2026-01-06T11:00:00'), enabled: true, config: { update_notifications: 'true' } },
  { appId: 'openai-assistant', spaceId: 'marketing', installedBy: 'Jane Smith', installedAt: new Date('2026-01-18T16:00:00'), enabled: true, config: { bot_name: 'ContentBot', model_preference: 'GPT-4o', knowledge_access: 'true' } },

  // SRE
  { appId: 'grafana', spaceId: 'sre', installedBy: 'Charlie Brown', installedAt: new Date('2026-01-02T09:00:00'), enabled: true, config: { grafana_url: 'https://grafana.company.com', auto_refresh: '10s', alert_notifications: 'true' } },
  { appId: 'sentry', spaceId: 'sre', installedBy: 'Charlie Brown', installedAt: new Date('2026-01-02T09:30:00'), enabled: true, config: { alert_level: 'Warning+', performance_alerts: 'true' } },
  { appId: 'pagerduty', spaceId: 'sre', installedBy: 'Charlie Brown', installedAt: new Date('2026-01-03T10:30:00'), enabled: true, config: { auto_ack: 'true' } },
  { appId: 'openai-assistant', spaceId: 'sre', installedBy: 'Charlie Brown', installedAt: new Date('2026-01-10T14:00:00'), enabled: true, config: { bot_name: 'OpsBot', model_preference: 'GPT-4o', auto_summarize: 'true' } },
  { appId: 'release-management', spaceId: 'sre', installedBy: 'Charlie Brown', installedAt: new Date('2026-01-03T10:00:00'), enabled: true, config: { auto_checks: 'true', approval_required: 'true' } },
];

// ─── Helpers ───
export const appCategories: AppCategory[] = [...new Set(appCatalog.map(a => a.category))];

export function getAppsForSpace(spaceId: string): (InstalledApp & { app: AppIntegration })[] {
  return installedApps
    .filter(ia => ia.spaceId === spaceId)
    .map(ia => {
      const app = appCatalog.find(a => a.id === ia.appId)!;
      return { ...ia, app };
    })
    .filter(ia => ia.app);
}

export function getInstalledSpaces(appId: string): string[] {
  return installedApps
    .filter(ia => ia.appId === appId && ia.enabled)
    .map(ia => ia.spaceId);
}