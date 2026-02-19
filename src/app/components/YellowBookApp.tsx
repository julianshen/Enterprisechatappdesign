import { useState, useMemo, useCallback } from 'react';
import {
  Search, ChevronRight, ChevronDown, User, Mail, Phone,
  MessageSquare, Calendar, MapPin, Building2, Users,
  Award, Globe, Clock,
  ArrowUp, ArrowDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './ui/utils';

// ─── Types ───

interface Person {
  id: string;
  name: string;
  title: string;
  department: string;
  team: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;       // initials + color
  avatarColor: string;
  managerId: string | null;
  skills: string[];
  startDate: string;
  status: 'active' | 'away' | 'busy' | 'offline';
  timezone: string;
}

interface OrgNode {
  person: Person;
  children: OrgNode[];
}

// ─── Mock Data ───

const people: Person[] = [
  // C-Suite
  { id: 'p-ceo', name: 'Margaret Liu', title: 'CEO', department: 'Executive', team: 'Leadership', email: 'margaret.liu@company.com', phone: '+1 (555) 001-0001', location: 'San Francisco, CA', avatar: 'ML', avatarColor: '#5b5fc7', managerId: null, skills: ['Strategy', 'Leadership', 'M&A'], startDate: 'Mar 2018', status: 'active', timezone: 'PST' },
  { id: 'p-cto', name: 'Richard Yamada', title: 'CTO', department: 'Executive', team: 'Leadership', email: 'richard.yamada@company.com', phone: '+1 (555) 001-0002', location: 'San Francisco, CA', avatar: 'RY', avatarColor: '#2d8cff', managerId: 'p-ceo', skills: ['Architecture', 'Cloud', 'AI/ML'], startDate: 'Jun 2019', status: 'active', timezone: 'PST' },
  { id: 'p-cpo', name: 'Nadia Kowalski', title: 'CPO', department: 'Executive', team: 'Leadership', email: 'nadia.kowalski@company.com', phone: '+1 (555) 001-0003', location: 'New York, NY', avatar: 'NK', avatarColor: '#f24e1e', managerId: 'p-ceo', skills: ['Product Strategy', 'User Research', 'GTM'], startDate: 'Jan 2020', status: 'away', timezone: 'EST' },
  { id: 'p-cfo', name: 'David Park', title: 'CFO', department: 'Executive', team: 'Leadership', email: 'david.park@company.com', phone: '+1 (555) 001-0004', location: 'San Francisco, CA', avatar: 'DP', avatarColor: '#06ac38', managerId: 'p-ceo', skills: ['Financial Planning', 'Fundraising', 'M&A'], startDate: 'Sep 2019', status: 'busy', timezone: 'PST' },

  // VP Engineering
  { id: 'p-vpe', name: 'Sarah Chen', title: 'VP of Engineering', department: 'Engineering', team: 'Engineering Leadership', email: 'sarah.chen@company.com', phone: '+1 (555) 002-0001', location: 'San Francisco, CA', avatar: 'SC', avatarColor: '#7b4db8', managerId: 'p-cto', skills: ['System Design', 'Team Building', 'Kubernetes'], startDate: 'Aug 2019', status: 'active', timezone: 'PST' },

  // Engineering Managers under VP Eng
  { id: 'p-em1', name: 'Bob Johnson', title: 'Sr. Engineering Manager', department: 'Engineering', team: 'Platform', email: 'bob.johnson@company.com', phone: '+1 (555) 002-0010', location: 'San Francisco, CA', avatar: 'BJ', avatarColor: '#fc6d26', managerId: 'p-vpe', skills: ['Go', 'Kubernetes', 'Microservices', 'gRPC'], startDate: 'Jan 2020', status: 'active', timezone: 'PST' },
  { id: 'p-em2', name: 'Charlie Brown', title: 'Sr. Engineering Manager', department: 'Engineering', team: 'SRE', email: 'charlie.brown@company.com', phone: '+1 (555) 002-0011', location: 'New York, NY', avatar: 'CB', avatarColor: '#d33833', managerId: 'p-vpe', skills: ['Kubernetes', 'Terraform', 'AWS', 'Observability'], startDate: 'Mar 2020', status: 'active', timezone: 'EST' },
  { id: 'p-em3', name: 'Diana Martinez', title: 'Engineering Manager', department: 'Engineering', team: 'Backend', email: 'diana.martinez@company.com', phone: '+1 (555) 002-0012', location: 'Austin, TX', avatar: 'DM', avatarColor: '#0052cc', managerId: 'p-vpe', skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Redis'], startDate: 'Jul 2020', status: 'away', timezone: 'CST' },
  { id: 'p-em4', name: 'Evan Liu', title: 'Engineering Manager', department: 'Engineering', team: 'Frontend', email: 'evan.liu@company.com', phone: '+1 (555) 002-0013', location: 'Remote', avatar: 'EL', avatarColor: '#10a37f', managerId: 'p-vpe', skills: ['React', 'TypeScript', 'Next.js', 'Design Systems'], startDate: 'Nov 2020', status: 'active', timezone: 'PST' },

  // Engineers under Bob (Platform)
  { id: 'p-e1', name: 'Tom Harris', title: 'Sr. Software Engineer', department: 'Engineering', team: 'Platform', email: 'tom.harris@company.com', phone: '+1 (555) 002-0020', location: 'San Francisco, CA', avatar: 'TH', avatarColor: '#e67e22', managerId: 'p-em1', skills: ['Go', 'Kubernetes', 'Docker', 'CI/CD'], startDate: 'Apr 2021', status: 'active', timezone: 'PST' },
  { id: 'p-e2', name: 'Lisa Wang', title: 'Software Engineer', department: 'Engineering', team: 'Platform', email: 'lisa.wang@company.com', phone: '+1 (555) 002-0021', location: 'San Francisco, CA', avatar: 'LW', avatarColor: '#9b59b6', managerId: 'p-em1', skills: ['Python', 'Terraform', 'AWS'], startDate: 'Aug 2021', status: 'offline', timezone: 'PST' },
  { id: 'p-e3', name: 'Ryan Patel', title: 'Software Engineer', department: 'Engineering', team: 'Platform', email: 'ryan.patel@company.com', phone: '+1 (555) 002-0022', location: 'Austin, TX', avatar: 'RP', avatarColor: '#2ecc71', managerId: 'p-em1', skills: ['Rust', 'Go', 'gRPC', 'Protobuf'], startDate: 'Jan 2022', status: 'active', timezone: 'CST' },

  // Engineers under Charlie (SRE)
  { id: 'p-e4', name: 'Maria Santos', title: 'Sr. SRE Engineer', department: 'Engineering', team: 'SRE', email: 'maria.santos@company.com', phone: '+1 (555) 002-0030', location: 'New York, NY', avatar: 'MS', avatarColor: '#e74c3c', managerId: 'p-em2', skills: ['Prometheus', 'Grafana', 'Kubernetes', 'Incident Response'], startDate: 'May 2021', status: 'active', timezone: 'EST' },
  { id: 'p-e5', name: 'Kevin Nakamura', title: 'SRE Engineer', department: 'Engineering', team: 'SRE', email: 'kevin.nakamura@company.com', phone: '+1 (555) 002-0031', location: 'Remote', avatar: 'KN', avatarColor: '#3498db', managerId: 'p-em2', skills: ['Terraform', 'PagerDuty', 'Linux', 'Networking'], startDate: 'Sep 2021', status: 'busy', timezone: 'PST' },

  // Engineers under Diana (Backend)
  { id: 'p-e6', name: 'Ana Ruiz', title: 'Sr. Backend Engineer', department: 'Engineering', team: 'Backend', email: 'ana.ruiz@company.com', phone: '+1 (555) 002-0040', location: 'Austin, TX', avatar: 'AR', avatarColor: '#1abc9c', managerId: 'p-em3', skills: ['Java', 'PostgreSQL', 'Kafka', 'Spring Boot'], startDate: 'Feb 2021', status: 'active', timezone: 'CST' },
  { id: 'p-e7', name: 'James Kim', title: 'Backend Engineer', department: 'Engineering', team: 'Backend', email: 'james.kim@company.com', phone: '+1 (555) 002-0041', location: 'Austin, TX', avatar: 'JK', avatarColor: '#f39c12', managerId: 'p-em3', skills: ['Node.js', 'TypeScript', 'MongoDB', 'Redis'], startDate: 'Jun 2022', status: 'active', timezone: 'CST' },

  // Engineers under Evan (Frontend)
  { id: 'p-e8', name: 'Sophie Turner', title: 'Sr. Frontend Engineer', department: 'Engineering', team: 'Frontend', email: 'sophie.turner@company.com', phone: '+1 (555) 002-0050', location: 'Remote', avatar: 'ST', avatarColor: '#e91e63', managerId: 'p-em4', skills: ['React', 'TypeScript', 'CSS', 'Accessibility'], startDate: 'Mar 2021', status: 'active', timezone: 'EST' },
  { id: 'p-e9', name: 'Alex Rivera', title: 'Frontend Engineer', department: 'Engineering', team: 'Frontend', email: 'alex.rivera@company.com', phone: '+1 (555) 002-0051', location: 'Remote', avatar: 'AR', avatarColor: '#ff5722', managerId: 'p-em4', skills: ['React', 'Next.js', 'Motion', 'Tailwind'], startDate: 'Oct 2022', status: 'away', timezone: 'CST' },

  // VP Design
  { id: 'p-vpd', name: 'Alice Williams', title: 'VP of Design', department: 'Design', team: 'Design Leadership', email: 'alice.williams@company.com', phone: '+1 (555) 003-0001', location: 'San Francisco, CA', avatar: 'AW', avatarColor: '#f24e1e', managerId: 'p-cpo', skills: ['Design Strategy', 'Figma', 'User Research'], startDate: 'Feb 2020', status: 'active', timezone: 'PST' },
  { id: 'p-d1', name: 'Emily Park', title: 'UX Researcher', department: 'Design', team: 'UX Research', email: 'emily.park@company.com', phone: '+1 (555) 003-0010', location: 'San Francisco, CA', avatar: 'EP', avatarColor: '#ff9830', managerId: 'p-vpd', skills: ['User Interviews', 'Usability Testing', 'Analytics'], startDate: 'Feb 2026', status: 'active', timezone: 'PST' },
  { id: 'p-d2', name: 'Oliver Chen', title: 'Sr. Product Designer', department: 'Design', team: 'Product Design', email: 'oliver.chen@company.com', phone: '+1 (555) 003-0011', location: 'San Francisco, CA', avatar: 'OC', avatarColor: '#5e6ad2', managerId: 'p-vpd', skills: ['Figma', 'Prototyping', 'Design Systems', 'Motion Design'], startDate: 'Jun 2021', status: 'active', timezone: 'PST' },

  // VP Marketing
  { id: 'p-vpm', name: 'Jane Smith', title: 'VP of Marketing', department: 'Marketing', team: 'Marketing Leadership', email: 'jane.smith@company.com', phone: '+1 (555) 004-0001', location: 'New York, NY', avatar: 'JS', avatarColor: '#00a1e0', managerId: 'p-cpo', skills: ['Brand Strategy', 'Content', 'Analytics'], startDate: 'Apr 2020', status: 'active', timezone: 'EST' },
  { id: 'p-m1', name: 'Grace Lee', title: 'Content Marketing Manager', department: 'Marketing', team: 'Content', email: 'grace.lee@company.com', phone: '+1 (555) 004-0010', location: 'New York, NY', avatar: 'GL', avatarColor: '#e67e22', managerId: 'p-vpm', skills: ['SEO', 'Copywriting', 'HubSpot'], startDate: 'Sep 2021', status: 'active', timezone: 'EST' },
  { id: 'p-m2', name: 'Marcus Johnson', title: 'Growth Marketing Lead', department: 'Marketing', team: 'Growth', email: 'marcus.johnson@company.com', phone: '+1 (555) 004-0011', location: 'Remote', avatar: 'MJ', avatarColor: '#632ca6', managerId: 'p-vpm', skills: ['Ads', 'Analytics', 'A/B Testing', 'SQL'], startDate: 'Jan 2022', status: 'busy', timezone: 'CST' },
];

function buildOrgTree(): OrgNode | null {
  const nodeMap = new Map<string, OrgNode>();

  // Create nodes
  for (const p of people) {
    nodeMap.set(p.id, { person: p, children: [] });
  }

  // Build tree
  let root: OrgNode | null = null;
  for (const p of people) {
    const node = nodeMap.get(p.id)!;
    if (p.managerId && nodeMap.has(p.managerId)) {
      nodeMap.get(p.managerId)!.children.push(node);
    } else if (!p.managerId) {
      root = node;
    }
  }
  return root;
}

const STATUS_DOT: Record<string, string> = {
  active: 'bg-emerald-500',
  away: 'bg-amber-400',
  busy: 'bg-red-500',
  offline: 'bg-gray-400',
};

type TabId = 'org-tree' | 'search';

// ─── Org Tree Node Component ───

function OrgTreeNode({
  node,
  depth,
  expandedNodes,
  toggleNode,
  onSelect,
  selectedId,
  scopeRootId,
}: {
  node: OrgNode;
  depth: number;
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
  onSelect: (p: Person) => void;
  selectedId: string | null;
  scopeRootId: string;
}) {
  const isExpanded = expandedNodes.has(node.person.id);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.person.id;
  const indent = depth * 24;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: depth * 0.03 }}
        onClick={() => onSelect(node.person)}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(node.person); } }}
        className={cn(
          'w-full flex items-center gap-2.5 py-2 px-3 text-left rounded-lg transition-all group cursor-pointer',
          isSelected
            ? 'bg-[#D4A017]/10 dark:bg-[#D4A017]/15'
            : 'hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]',
        )}
        style={{ paddingLeft: `${12 + indent}px` }}
      >
        {/* Expand/collapse */}
        <button
          onClick={e => { e.stopPropagation(); if (hasChildren) toggleNode(node.person.id); }}
          className={cn('w-5 h-5 flex items-center justify-center rounded transition-colors shrink-0', hasChildren ? 'hover:bg-[#e0e0e0] dark:hover:bg-[#444]' : '')}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={13} className="text-[#8a8a8a]" /> : <ChevronRight size={13} className="text-[#8a8a8a]" />
          ) : (
            <span className="w-1 h-1 rounded-full bg-[#d0d0d0] dark:bg-[#555]" />
          )}
        </button>

        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{ backgroundColor: node.person.avatarColor }}
          >
            {node.person.avatar}
          </div>
          <span className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#252525]', STATUS_DOT[node.person.status])} />
        </div>

        {/* Name & title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('text-[12px] font-medium truncate', isSelected ? 'text-[#D4A017] dark:text-[#f0c040]' : 'text-[#242424] dark:text-[#f0f0f0]')}>
              {node.person.name}
            </span>
            {node.person.id === scopeRootId && (
              <span className="text-[8px] px-1 py-0.5 rounded bg-[#D4A017]/10 text-[#D4A017] font-bold">YOU</span>
            )}
          </div>
          <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] truncate">{node.person.title}</p>
        </div>

        {/* Team badge */}
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#f0f0f0] dark:bg-[#333] text-[#8a8a8a] dark:text-[#aaa] whitespace-nowrap shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {node.person.team}
        </span>

        {hasChildren && (
          <span className="text-[9px] text-[#bbb] dark:text-[#555] shrink-0">{node.children.length}</span>
        )}
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && node.children.map(child => (
          <OrgTreeNode
            key={child.person.id}
            node={child}
            depth={depth + 1}
            expandedNodes={expandedNodes}
            toggleNode={toggleNode}
            onSelect={onSelect}
            selectedId={selectedId}
            scopeRootId={scopeRootId}
          />
        ))}
      </AnimatePresence>
    </>
  );
}

// ─── Person Detail Card ───

function PersonDetail({ person, onNavigateUp, onClose }: { person: Person; onNavigateUp: (id: string) => void; onClose: () => void }) {
  const manager = person.managerId ? people.find(p => p.id === person.managerId) : null;
  const directReports = people.filter(p => p.managerId === person.id);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden"
    >
      {/* Profile header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md"
              style={{ backgroundColor: person.avatarColor }}
            >
              {person.avatar}
            </div>
            <span className={cn('absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#252525]', STATUS_DOT[person.status])} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{person.name}</h3>
            <p className="text-[12px] text-[#616161] dark:text-[#b9bbbe]">{person.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#D4A017]/10 text-[#D4A017] font-medium">{person.department}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#5b5fc7]/10 text-[#5b5fc7] dark:text-[#a6a9dc] font-medium">{person.team}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-[11px] text-[#8a8a8a] hover:text-[#D4A017] transition-colors">Close</button>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-4">
          {[
            { icon: MessageSquare, label: 'Message', color: 'bg-[#5b5fc7] text-white' },
            { icon: Mail, label: 'Email', color: 'bg-[#5b5fc7]/10 text-[#5b5fc7] dark:text-[#a6a9dc]' },
            { icon: Phone, label: 'Call', color: 'bg-[#5b5fc7]/10 text-[#5b5fc7] dark:text-[#a6a9dc]' },
            { icon: Calendar, label: 'Schedule', color: 'bg-[#5b5fc7]/10 text-[#5b5fc7] dark:text-[#a6a9dc]' },
          ].map(a => (
            <button
              key={a.label}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:opacity-80', a.color)}
            >
              <a.icon size={12} />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 px-5 py-3 space-y-3">
        {/* Contact info */}
        <div className="space-y-1.5">
          <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider">Contact</p>
          {[
            { icon: Mail, value: person.email },
            { icon: Phone, value: person.phone },
            { icon: MapPin, value: person.location },
            { icon: Globe, value: person.timezone },
          ].map(i => (
            <div key={i.value} className="flex items-center gap-2 text-[11px] text-[#616161] dark:text-[#b9bbbe]">
              <i.icon size={12} className="text-[#8a8a8a] shrink-0" />
              <span className="truncate">{i.value}</span>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div>
          <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider mb-1.5">Skills & Expertise</p>
          <div className="flex flex-wrap gap-1.5">
            {person.skills.map(s => (
              <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#D4A017]/8 text-[#D4A017] dark:bg-[#D4A017]/15 dark:text-[#f0c040]">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Start date */}
        <div className="flex items-center gap-2 text-[11px] text-[#8a8a8a]">
          <Clock size={12} />
          <span>Joined {person.startDate}</span>
        </div>
      </div>

      {/* Reporting chain */}
      <div className="border-t border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 px-5 py-3">
        {/* Manager */}
        {manager && (
          <div className="mb-3">
            <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider mb-1.5 flex items-center gap-1"><ArrowUp size={9} /> Reports to</p>
            <button
              onClick={() => onNavigateUp(manager.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#faf9f8] dark:bg-[#1e1f22] hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] transition-colors text-left"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                style={{ backgroundColor: manager.avatarColor }}
              >
                {manager.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[#5b5fc7] dark:text-[#a6a9dc] truncate">{manager.name}</p>
                <p className="text-[10px] text-[#8a8a8a] truncate">{manager.title}</p>
              </div>
              <ChevronRight size={12} className="text-[#ccc]" />
            </button>
          </div>
        )}

        {/* Direct reports */}
        {directReports.length > 0 && (
          <div>
            <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider mb-1.5 flex items-center gap-1"><ArrowDown size={9} /> Direct Reports ({directReports.length})</p>
            <div className="space-y-1">
              {directReports.map(r => (
                <button
                  key={r.id}
                  onClick={() => onNavigateUp(r.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#faf9f8] dark:hover:bg-[#1e1f22] transition-colors text-left"
                >
                  <div className="relative">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                      style={{ backgroundColor: r.avatarColor }}
                    >
                      {r.avatar}
                    </div>
                    <span className={cn('absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-[#252525]', STATUS_DOT[r.status])} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-[#242424] dark:text-[#f0f0f0] truncate">{r.name}</p>
                    <p className="text-[9px] text-[#8a8a8a] truncate">{r.title}</p>
                  </div>
                  <ChevronRight size={11} className="text-[#ddd] dark:text-[#555]" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───

export function YellowBookApp() {
  const [activeTab, setActiveTab] = useState<TabId>('org-tree');
  const [search, setSearch] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['p-ceo', 'p-cto', 'p-vpe']));
  const scopeRootId = 'p-em1'; // "You" are Bob Johnson for demo purposes

  const orgTree = useMemo(() => buildOrgTree(), []);

  const toggleNode = useCallback((id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectPerson = useCallback((p: Person) => {
    setSelectedPerson(p);
  }, []);

  const handleNavigateFromDetail = useCallback((id: string) => {
    const p = people.find(pp => pp.id === id);
    if (p) {
      setSelectedPerson(p);
      // Expand the path to this person
      setExpandedNodes(prev => {
        const next = new Set(prev);
        let current = p;
        while (current.managerId) {
          next.add(current.managerId);
          const mgr = people.find(pp => pp.id === current.managerId);
          if (!mgr) break;
          current = mgr;
        }
        return next;
      });
    }
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return people.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      p.team.toLowerCase().includes(q) ||
      p.skills.some(s => s.toLowerCase().includes(q))
    );
  }, [search]);

  // Stats
  const totalPeople = people.length;
  const departments = [...new Set(people.map(p => p.department))];
  const teams = [...new Set(people.map(p => p.team))];

  const tabs: { id: TabId; label: string; icon: typeof Users }[] = [
    { id: 'org-tree', label: 'Org Tree', icon: Building2 },
    { id: 'search', label: 'People Search', icon: Search },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D4A017] to-[#B8860B] flex items-center justify-center shadow-sm">
              <Users size={16} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#242424] dark:text-[#f0f0f0]">Yellow Book</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D4A017]/10 text-[#D4A017] dark:bg-[#D4A017]/20 dark:text-[#f0c040] font-bold">Company Directory</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">
                <span className="flex items-center gap-1"><User size={9} /> {totalPeople} people</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Building2 size={9} /> {departments.length} departments</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Users size={9} /> {teams.length} teams</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); if (e.target.value) setActiveTab('search'); }}
              placeholder="Search people, skills, teams..."
              className="pl-8 pr-3 py-1.5 text-[12px] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#1e1f22] text-[#242424] dark:text-[#f0f0f0] placeholder-[#b9bbbe] w-[240px] focus:outline-none focus:ring-1 focus:ring-[#D4A017]/50"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 flex items-center gap-1 border-t border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); if (t.id === 'org-tree') setSearch(''); }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-colors border-b-2 -mb-px',
                activeTab === t.id
                  ? 'text-[#D4A017] dark:text-[#f0c040] border-[#D4A017]'
                  : 'text-[#8a8a8a] dark:text-[#6d6f78] border-transparent hover:text-[#424242] dark:hover:text-[#d1d1d1]',
              )}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-[1fr,1fr] gap-4">
        {/* Left panel — tree or search results */}
        <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
          {activeTab === 'org-tree' && orgTree && (
            <>
              <div className="px-4 py-2.5 border-b border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 size={13} className="text-[#D4A017]" />
                  <span className="text-[12px] font-medium text-[#242424] dark:text-[#f0f0f0]">Organization Hierarchy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setExpandedNodes(new Set(people.map(p => p.id)))}
                    className="text-[10px] px-2 py-0.5 rounded text-[#8a8a8a] hover:bg-[#f0f0f0] dark:hover:bg-[#333] transition-colors"
                  >
                    Expand all
                  </button>
                  <button
                    onClick={() => setExpandedNodes(new Set())}
                    className="text-[10px] px-2 py-0.5 rounded text-[#8a8a8a] hover:bg-[#f0f0f0] dark:hover:bg-[#333] transition-colors"
                  >
                    Collapse
                  </button>
                </div>
              </div>
              <div className="py-1 max-h-[520px] overflow-y-auto scrollbar-on-hover">
                <OrgTreeNode
                  node={orgTree}
                  depth={0}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                  onSelect={handleSelectPerson}
                  selectedId={selectedPerson?.id ?? null}
                  scopeRootId={scopeRootId}
                />
              </div>
              {/* Scope notice */}
              <div className="px-4 py-2 border-t border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 flex items-center gap-2 bg-[#D4A017]/5 dark:bg-[#D4A017]/8">
                <Award size={12} className="text-[#D4A017] shrink-0" />
                <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">
                  Viewing as <span className="font-medium text-[#D4A017]">Bob Johnson</span> · You can navigate up and down the org tree from your position
                </p>
              </div>
            </>
          )}

          {activeTab === 'search' && (
            <>
              <div className="px-4 py-2.5 border-b border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 flex items-center gap-2">
                <Search size={13} className="text-[#D4A017]" />
                <span className="text-[12px] font-medium text-[#242424] dark:text-[#f0f0f0]">
                  {search ? `Results for "${search}" — ${searchResults.length} found` : 'All People'}
                </span>
              </div>
              <div className="py-1 max-h-[520px] overflow-y-auto scrollbar-on-hover">
                {(search ? searchResults : people).map((p, i) => (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => setSelectedPerson(p)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      selectedPerson?.id === p.id
                        ? 'bg-[#D4A017]/10 dark:bg-[#D4A017]/15'
                        : 'hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]',
                    )}
                  >
                    <div className="relative shrink-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: p.avatarColor }}
                      >
                        {p.avatar}
                      </div>
                      <span className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#252525]', STATUS_DOT[p.status])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-[#242424] dark:text-[#f0f0f0] truncate">{p.name}</span>
                        {p.id === scopeRootId && (
                          <span className="text-[8px] px-1 py-0.5 rounded bg-[#D4A017]/10 text-[#D4A017] font-bold">YOU</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] truncate">{p.title} · {p.team}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 max-w-[120px] justify-end">
                      {p.skills.slice(0, 2).map(s => (
                        <span key={s} className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#D4A017]/8 text-[#D4A017] dark:text-[#f0c040] whitespace-nowrap">
                          {s}
                        </span>
                      ))}
                    </div>
                    <ChevronRight size={12} className="text-[#ddd] dark:text-[#555] shrink-0" />
                  </motion.button>
                ))}
                {search && searchResults.length === 0 && (
                  <div className="px-4 py-12 text-center">
                    <Search size={28} className="text-[#ddd] dark:text-[#555] mx-auto mb-2" />
                    <p className="text-[13px] text-[#8a8a8a]">No people found for "{search}"</p>
                    <p className="text-[11px] text-[#bbb] mt-1">Try searching by name, title, team, or skill</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right panel — person detail */}
        <AnimatePresence mode="wait">
          {selectedPerson ? (
            <PersonDetail
              key={selectedPerson.id}
              person={selectedPerson}
              onNavigateUp={handleNavigateFromDetail}
              onClose={() => setSelectedPerson(null)}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-[400px] rounded-xl bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d]"
            >
              <div className="text-center">
                <User size={32} className="text-[#ddd] dark:text-[#555] mx-auto mb-2" />
                <p className="text-[13px] text-[#8a8a8a]">Select a person to view their profile</p>
                <p className="text-[11px] text-[#bbb] mt-1">Browse the org tree or search by name</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}