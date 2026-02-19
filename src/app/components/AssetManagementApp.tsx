import { useState, useMemo } from 'react';
import {
  Package, Container, Library, Search, Shield, ShieldCheck, ShieldAlert, ShieldX,
  ChevronRight, ExternalLink, CheckCircle2, Clock, AlertTriangle,
  ArrowUpRight, Filter, MoreHorizontal, Tag, GitBranch, Box,
  Layers, TrendingUp, XCircle, RefreshCw, ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from './ui/utils';

// ─── Types ───

type AssetType = 'binary' | 'container' | 'library';
type Environment = 'dev' | 'staging' | 'production';
type ScanSeverity = 'critical' | 'high' | 'medium' | 'low';
type VersionStatus = 'built' | 'scanned' | 'reviewed' | 'promoted' | 'rejected';

interface Vulnerability {
  id: string;
  cve: string;
  severity: ScanSeverity;
  pkg: string;
  description: string;
  fixAvailable: boolean;
}

interface AssetVersion {
  version: string;
  buildDate: string;
  buildNumber: number;
  commit: string;
  status: VersionStatus;
  environment: Environment;
  scanner: string;
  vulnCounts: Record<ScanSeverity, number>;
  vulnerabilities: Vulnerability[];
  size: string;
  promotedBy?: string;
  promotedAt?: string;
}

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  description: string;
  latestVersion: string;
  versions: AssetVersion[];
  tags: string[];
  lastUpdated: string;
  owner: string;
}

// ─── Mock Data ───

const mockAssets: Asset[] = [
  {
    id: 'asset-1',
    name: 'main-app',
    type: 'container',
    description: 'Primary application Docker image',
    latestVersion: '2.14.0',
    tags: ['latest', 'stable', 'production'],
    lastUpdated: '2 hours ago',
    owner: 'Platform Team',
    versions: [
      {
        version: '2.14.0', buildDate: 'Feb 18, 2026 09:15', buildNumber: 1847, commit: 'a3f21bc',
        status: 'scanned', environment: 'staging', scanner: 'Trivy', size: '342 MB',
        vulnCounts: { critical: 0, high: 1, medium: 4, low: 12 },
        vulnerabilities: [
          { id: 'v1', cve: 'CVE-2026-1234', severity: 'high', pkg: 'openssl 3.0.13', description: 'Buffer overflow in X.509 certificate verification', fixAvailable: true },
          { id: 'v2', cve: 'CVE-2026-0891', severity: 'medium', pkg: 'libcurl 8.5.0', description: 'HTTP/2 header injection via HPACK decoder', fixAvailable: true },
          { id: 'v3', cve: 'CVE-2025-9920', severity: 'medium', pkg: 'zlib 1.3.0', description: 'Denial of service via crafted deflate stream', fixAvailable: false },
          { id: 'v4', cve: 'CVE-2025-8812', severity: 'medium', pkg: 'nodejs 20.11', description: 'Prototype pollution in URL parsing', fixAvailable: true },
          { id: 'v5', cve: 'CVE-2025-7734', severity: 'medium', pkg: 'busybox 1.36', description: 'Arbitrary file write in tar extraction', fixAvailable: false },
        ],
      },
      {
        version: '2.13.1', buildDate: 'Feb 15, 2026 14:30', buildNumber: 1839, commit: 'f8e90ab',
        status: 'promoted', environment: 'production', scanner: 'Trivy', size: '338 MB',
        vulnCounts: { critical: 0, high: 0, medium: 2, low: 8 },
        promotedBy: 'Bob Johnson', promotedAt: 'Feb 16, 2026 10:00',
        vulnerabilities: [
          { id: 'v6', cve: 'CVE-2025-9920', severity: 'medium', pkg: 'zlib 1.3.0', description: 'Denial of service via crafted deflate stream', fixAvailable: false },
          { id: 'v7', cve: 'CVE-2025-7734', severity: 'medium', pkg: 'busybox 1.36', description: 'Arbitrary file write in tar extraction', fixAvailable: false },
        ],
      },
      {
        version: '2.13.0', buildDate: 'Feb 12, 2026 11:00', buildNumber: 1831, commit: 'c4d12ef',
        status: 'promoted', environment: 'production', scanner: 'Trivy', size: '335 MB',
        vulnCounts: { critical: 0, high: 0, medium: 3, low: 10 },
        promotedBy: 'Charlie Brown', promotedAt: 'Feb 13, 2026 09:00',
        vulnerabilities: [],
      },
    ],
  },
  {
    id: 'asset-2',
    name: 'auth-service',
    type: 'binary',
    description: 'OAuth 2.0 authentication service binary',
    latestVersion: '1.8.2',
    tags: ['latest', 'security'],
    lastUpdated: '5 hours ago',
    owner: 'Security Team',
    versions: [
      {
        version: '1.8.2', buildDate: 'Feb 17, 2026 16:45', buildNumber: 412, commit: 'e7b34cd',
        status: 'reviewed', environment: 'staging', scanner: 'Snyk', size: '28 MB',
        vulnCounts: { critical: 0, high: 0, medium: 1, low: 3 },
        vulnerabilities: [
          { id: 'v8', cve: 'CVE-2026-0523', severity: 'medium', pkg: 'golang.org/x/crypto v0.18', description: 'Timing side-channel in ECDSA verification', fixAvailable: true },
        ],
      },
      {
        version: '1.8.1', buildDate: 'Feb 14, 2026 10:20', buildNumber: 408, commit: '2a9f1bc',
        status: 'promoted', environment: 'production', scanner: 'Snyk', size: '27 MB',
        vulnCounts: { critical: 0, high: 0, medium: 0, low: 2 },
        promotedBy: 'Alice Williams', promotedAt: 'Feb 15, 2026 08:30',
        vulnerabilities: [],
      },
    ],
  },
  {
    id: 'asset-3',
    name: '@company/ui-components',
    type: 'library',
    description: 'Shared React component library',
    latestVersion: '3.12.0',
    tags: ['latest', 'design-system'],
    lastUpdated: '1 day ago',
    owner: 'Design Team',
    versions: [
      {
        version: '3.12.0', buildDate: 'Feb 16, 2026 13:00', buildNumber: 256, commit: 'f1a23de',
        status: 'promoted', environment: 'production', scanner: 'Trivy', size: '4.2 MB',
        vulnCounts: { critical: 0, high: 0, medium: 0, low: 1 },
        promotedBy: 'Alice Williams', promotedAt: 'Feb 17, 2026 09:00',
        vulnerabilities: [],
      },
    ],
  },
  {
    id: 'asset-4',
    name: 'payment-gateway',
    type: 'container',
    description: 'Payment processing microservice',
    latestVersion: '4.2.0-rc.1',
    tags: ['rc', 'pci-compliant'],
    lastUpdated: '30 min ago',
    owner: 'Payments Team',
    versions: [
      {
        version: '4.2.0-rc.1', buildDate: 'Feb 18, 2026 11:30', buildNumber: 934, commit: '7bc45ef',
        status: 'built', environment: 'dev', scanner: 'Grype', size: '198 MB',
        vulnCounts: { critical: 1, high: 2, medium: 5, low: 7 },
        vulnerabilities: [
          { id: 'v9', cve: 'CVE-2026-2001', severity: 'critical', pkg: 'log4j 2.21.0', description: 'Remote code execution via JNDI lookup injection', fixAvailable: true },
          { id: 'v10', cve: 'CVE-2026-1567', severity: 'high', pkg: 'spring-web 6.1.3', description: 'Server-side request forgery via URL redirection', fixAvailable: true },
          { id: 'v11', cve: 'CVE-2026-1234', severity: 'high', pkg: 'openssl 3.0.13', description: 'Buffer overflow in X.509 certificate verification', fixAvailable: true },
        ],
      },
      {
        version: '4.1.3', buildDate: 'Feb 10, 2026 09:00', buildNumber: 928, commit: '1de98ab',
        status: 'promoted', environment: 'production', scanner: 'Grype', size: '195 MB',
        vulnCounts: { critical: 0, high: 0, medium: 1, low: 4 },
        promotedBy: 'Bob Johnson', promotedAt: 'Feb 11, 2026 14:00',
        vulnerabilities: [],
      },
    ],
  },
  {
    id: 'asset-5',
    name: 'data-pipeline',
    type: 'binary',
    description: 'ETL data processing pipeline runner',
    latestVersion: '2.6.0',
    tags: ['latest'],
    lastUpdated: '3 days ago',
    owner: 'Data Team',
    versions: [
      {
        version: '2.6.0', buildDate: 'Feb 15, 2026 08:00', buildNumber: 189, commit: 'ab12c3d',
        status: 'promoted', environment: 'production', scanner: 'Trivy', size: '56 MB',
        vulnCounts: { critical: 0, high: 0, medium: 0, low: 2 },
        promotedBy: 'Charlie Brown', promotedAt: 'Feb 16, 2026 11:00',
        vulnerabilities: [],
      },
    ],
  },
];

const TYPE_CONFIG: Record<AssetType, { label: string; icon: typeof Package; color: string; bg: string }> = {
  binary: { label: 'Binary', icon: Box, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  container: { label: 'Container', icon: Layers, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  library: { label: 'Library', icon: Package, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
};

const STATUS_CONFIG: Record<VersionStatus, { label: string; color: string; icon: typeof Clock }> = {
  built: { label: 'Built', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20', icon: Clock },
  scanned: { label: 'Scanned', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: Shield },
  reviewed: { label: 'Reviewed', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: ShieldCheck },
  promoted: { label: 'Production', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', icon: XCircle },
};

const SEVERITY_CONFIG: Record<ScanSeverity, { label: string; color: string; chartColor: string }> = {
  critical: { label: 'Critical', color: 'text-red-600 dark:text-red-400 bg-red-500/10', chartColor: '#ef4444' },
  high: { label: 'High', color: 'text-orange-600 dark:text-orange-400 bg-orange-500/10', chartColor: '#f97316' },
  medium: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10', chartColor: '#eab308' },
  low: { label: 'Low', color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10', chartColor: '#3b82f6' },
};

const ENV_CONFIG: Record<Environment, { label: string; color: string }> = {
  dev: { label: 'Dev', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400' },
  staging: { label: 'Staging', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  production: { label: 'Production', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
};

type TabId = 'registry' | 'security' | 'promotions';

// ─── Summary Cards ───

function SummaryCards() {
  const totalAssets = mockAssets.length;
  const totalVulns = mockAssets.reduce((sum, a) => {
    const latest = a.versions[0];
    return sum + (latest ? Object.values(latest.vulnCounts).reduce((s, v) => s + v, 0) : 0);
  }, 0);
  const criticalVulns = mockAssets.reduce((sum, a) => sum + (a.versions[0]?.vulnCounts.critical || 0), 0);
  const promoted = mockAssets.filter(a => a.versions.some(v => v.status === 'promoted')).length;

  const cards = [
    { label: 'Total Assets', value: totalAssets, icon: Package, color: 'text-[#5b5fc7] dark:text-[#a6a9dc]', bg: 'bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20' },
    { label: 'Open Vulnerabilities', value: totalVulns, icon: ShieldAlert, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 dark:bg-amber-500/20' },
    { label: 'Critical Issues', value: criticalVulns, icon: ShieldX, color: criticalVulns > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400', bg: criticalVulns > 0 ? 'bg-red-500/10 dark:bg-red-500/20' : 'bg-emerald-500/10 dark:bg-emerald-500/20' },
    { label: 'In Production', value: promoted, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="px-4 py-3 rounded-xl bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d] flex items-center gap-3"
        >
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', c.bg)}>
            <c.icon size={18} className={c.color} />
          </div>
          <div>
            <p className="text-lg font-bold text-[#242424] dark:text-[#f0f0f0] leading-tight">{c.value}</p>
            <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">{c.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Asset Detail Panel ───

function AssetDetail({ asset, onClose, onPromote }: { asset: Asset; onClose: () => void; onPromote: (assetId: string, version: string) => void }) {
  const [selectedVersion, setSelectedVersion] = useState(asset.versions[0]);
  const typeConf = TYPE_CONFIG[asset.type];
  const TypeIcon = typeConf.icon;

  const vulnData = Object.entries(selectedVersion.vulnCounts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: SEVERITY_CONFIG[k as ScanSeverity].label, value: v, fill: SEVERITY_CONFIG[k as ScanSeverity].chartColor }));

  const canPromote = selectedVersion.status === 'reviewed' || (selectedVersion.status === 'scanned' && selectedVersion.vulnCounts.critical === 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#e1dfdd] dark:border-[#3d3d3d]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', typeConf.bg)}>
              <TypeIcon size={20} className={typeConf.color} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{asset.name}</h3>
              <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">{asset.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[11px] text-[#8a8a8a] hover:text-[#5b5fc7] transition-colors">Close</button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          {asset.tags.map(t => (
            <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#5b5fc7]/8 text-[#5b5fc7] dark:bg-[#5b5fc7]/15 dark:text-[#a6a9dc] flex items-center gap-1">
              <Tag size={8} />{t}
            </span>
          ))}
          <span className="text-[10px] text-[#8a8a8a] ml-auto">Owner: {asset.owner}</span>
        </div>
      </div>

      {/* Version selector */}
      <div className="px-5 py-3 border-b border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50 flex items-center gap-2 overflow-x-auto">
        {asset.versions.map(v => {
          const sc = STATUS_CONFIG[v.status];
          const isSelected = v.version === selectedVersion.version;
          return (
            <button
              key={v.version}
              onClick={() => setSelectedVersion(v)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap border',
                isSelected
                  ? 'bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc] border-[#5b5fc7]/30'
                  : 'bg-transparent text-[#616161] dark:text-[#b9bbbe] border-transparent hover:bg-[#f5f5f5] dark:hover:bg-[#333]',
              )}
            >
              <GitBranch size={11} />
              v{v.version}
              <span className={cn('px-1.5 py-0.5 rounded-full text-[9px] border', sc.color)}>{sc.label}</span>
            </button>
          );
        })}
      </div>

      {/* Version details */}
      <div className="px-5 py-4 space-y-4">
        {/* Build info */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Build', value: `#${selectedVersion.buildNumber}` },
            { label: 'Commit', value: selectedVersion.commit },
            { label: 'Size', value: selectedVersion.size },
            { label: 'Environment', value: ENV_CONFIG[selectedVersion.environment].label },
          ].map(i => (
            <div key={i.label} className="px-3 py-2 rounded-lg bg-[#faf9f8] dark:bg-[#1e1f22]">
              <p className="text-[9px] text-[#8a8a8a] uppercase tracking-wider">{i.label}</p>
              <p className="text-[13px] font-medium text-[#242424] dark:text-[#f0f0f0] font-mono">{i.value}</p>
            </div>
          ))}
        </div>

        {/* Vulnerability summary */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[11px] text-[#8a8a8a] mb-2 uppercase tracking-wider">Security Scan — {selectedVersion.scanner}</p>
            <div className="flex items-center gap-3">
              {(['critical', 'high', 'medium', 'low'] as ScanSeverity[]).map(s => {
                const count = selectedVersion.vulnCounts[s];
                const conf = SEVERITY_CONFIG[s];
                return (
                  <div key={s} className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg', conf.color)}>
                    <span className="text-[13px] font-bold">{count}</span>
                    <span className="text-[10px]">{conf.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {vulnData.length > 0 && (
            <div className="w-16 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vulnData} dataKey="value" cx="50%" cy="50%" innerRadius={16} outerRadius={28} strokeWidth={0}>
                    {vulnData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Vulnerability list */}
        {selectedVersion.vulnerabilities.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] text-[#8a8a8a] uppercase tracking-wider">Vulnerabilities</p>
            {selectedVersion.vulnerabilities.map(v => {
              const conf = SEVERITY_CONFIG[v.severity];
              return (
                <div key={v.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#faf9f8] dark:bg-[#1e1f22] hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] transition-colors">
                  <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold uppercase', conf.color)}>{v.severity}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-mono font-medium text-[#5b5fc7] dark:text-[#a6a9dc]">{v.cve}</span>
                      <span className="text-[11px] text-[#8a8a8a]">{v.pkg}</span>
                    </div>
                    <p className="text-[11px] text-[#616161] dark:text-[#b9bbbe] truncate">{v.description}</p>
                  </div>
                  {v.fixAvailable ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Fix available</span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-500/10 text-gray-500 whitespace-nowrap">No fix</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Promotion info or action */}
        {selectedVersion.status === 'promoted' && selectedVersion.promotedBy && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 dark:from-emerald-500/10 dark:to-emerald-500/15 border border-emerald-500/20">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-[12px]">
              <span className="font-medium text-emerald-700 dark:text-emerald-300">Promoted to production</span>
              <span className="text-[#8a8a8a] ml-2">by {selectedVersion.promotedBy} on {selectedVersion.promotedAt}</span>
            </div>
          </div>
        )}

        {canPromote && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onPromote(asset.id, selectedVersion.version)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8] text-white text-[13px] font-medium shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowUpRight size={15} />
            Promote v{selectedVersion.version} to Production
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───

export function AssetManagementApp() {
  const [activeTab, setActiveTab] = useState<TabId>('registry');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssetType | 'all'>('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState(mockAssets);
  const [promotionToast, setPromotionToast] = useState<string | null>(null);

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [assets, typeFilter, search]);

  const handlePromote = (assetId: string, version: string) => {
    setAssets(prev => prev.map(a => {
      if (a.id !== assetId) return a;
      return {
        ...a,
        versions: a.versions.map(v => {
          if (v.version !== version) return v;
          return { ...v, status: 'promoted' as VersionStatus, environment: 'production' as Environment, promotedBy: 'John Doe', promotedAt: 'Feb 18, 2026 16:00' };
        }),
      };
    }));
    const asset = assets.find(a => a.id === assetId);
    setPromotionToast(`${asset?.name} v${version} promoted to production`);
    setTimeout(() => setPromotionToast(null), 4000);
    // Update selectedAsset state
    setSelectedAsset(prev => {
      if (!prev || prev.id !== assetId) return prev;
      return {
        ...prev,
        versions: prev.versions.map(v => {
          if (v.version !== version) return v;
          return { ...v, status: 'promoted' as VersionStatus, environment: 'production' as Environment, promotedBy: 'John Doe', promotedAt: 'Feb 18, 2026 16:00' };
        }),
      };
    });
  };

  // Vuln chart data across all assets
  const vulnChartData = useMemo(() => {
    return assets.map(a => ({
      name: a.name.length > 12 ? a.name.slice(0, 12) + '...' : a.name,
      Critical: a.versions[0]?.vulnCounts.critical || 0,
      High: a.versions[0]?.vulnCounts.high || 0,
      Medium: a.versions[0]?.vulnCounts.medium || 0,
      Low: a.versions[0]?.vulnCounts.low || 0,
    }));
  }, [assets]);

  const tabs: { id: TabId; label: string; icon: typeof Package }[] = [
    { id: 'registry', label: 'Asset Registry', icon: Package },
    { id: 'security', label: 'Security Overview', icon: Shield },
    { id: 'promotions', label: 'Promotions', icon: ArrowUpRight },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#5b5fc7] to-[#7b4db8] flex items-center justify-center shadow-sm">
              <Package size={16} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#242424] dark:text-[#f0f0f0]">Asset Management</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#5b5fc7]/10 text-[#5b5fc7] dark:bg-[#5b5fc7]/20 dark:text-[#a6a9dc] font-bold">{assets.length} assets</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">
                <span className="flex items-center gap-1"><Shield size={9} /> Scanner: Trivy</span>
                <span>·</span>
                <span className="flex items-center gap-1"><RefreshCw size={9} /> Last scan: 2 hours ago</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search assets..."
                className="pl-8 pr-3 py-1.5 text-[12px] rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-[#faf9f8] dark:bg-[#1e1f22] text-[#242424] dark:text-[#f0f0f0] placeholder-[#b9bbbe] w-[200px] focus:outline-none focus:ring-1 focus:ring-[#5b5fc7]/50"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 flex items-center gap-1 border-t border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-colors border-b-2 -mb-px',
                activeTab === t.id
                  ? 'text-[#5b5fc7] dark:text-[#a6a9dc] border-[#5b5fc7]'
                  : 'text-[#8a8a8a] dark:text-[#6d6f78] border-transparent hover:text-[#424242] dark:hover:text-[#d1d1d1]',
              )}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <SummaryCards />

      {/* Tab content */}
      {activeTab === 'registry' && (
        <div className="grid grid-cols-[1fr,1fr] gap-4">
          {/* Asset list */}
          <div className="space-y-3">
            {/* Type filter */}
            <div className="flex items-center gap-1.5">
              {[{ key: 'all', label: 'All' }, { key: 'container', label: 'Containers' }, { key: 'binary', label: 'Binaries' }, { key: 'library', label: 'Libraries' }].map(f => (
                <button
                  key={f.key}
                  onClick={() => setTypeFilter(f.key as AssetType | 'all')}
                  className={cn(
                    'px-3 py-1 rounded-full text-[11px] font-medium transition-colors',
                    typeFilter === f.key
                      ? 'bg-[#5b5fc7]/10 dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc]'
                      : 'text-[#8a8a8a] hover:bg-[#f0f0f0] dark:hover:bg-[#333]',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Asset cards */}
            {filteredAssets.map(asset => {
              const tc = TYPE_CONFIG[asset.type];
              const TIcon = tc.icon;
              const latest = asset.versions[0];
              const sc = latest ? STATUS_CONFIG[latest.status] : null;
              const isSelected = selectedAsset?.id === asset.id;
              const totalVulns = latest ? Object.values(latest.vulnCounts).reduce((s, v) => s + v, 0) : 0;

              return (
                <motion.button
                  key={asset.id}
                  whileHover={{ scale: 1.005 }}
                  onClick={() => setSelectedAsset(asset)}
                  className={cn(
                    'w-full text-left px-4 py-3.5 rounded-xl border transition-all',
                    isSelected
                      ? 'bg-[#5b5fc7]/5 dark:bg-[#5b5fc7]/10 border-[#5b5fc7]/30 shadow-sm'
                      : 'bg-white dark:bg-[#252525] border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/20',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', tc.bg)}>
                      <TIcon size={15} className={tc.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0] truncate">{asset.name}</span>
                        <span className="text-[10px] font-mono text-[#5b5fc7] dark:text-[#a6a9dc]">v{asset.latestVersion}</span>
                      </div>
                      <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] truncate">{asset.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {sc && (
                          <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium border', sc.color)}>
                            {sc.label}
                          </span>
                        )}
                        {latest && latest.vulnCounts.critical > 0 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-bold">
                            {latest.vulnCounts.critical} CRITICAL
                          </span>
                        )}
                        {totalVulns > 0 && (
                          <span className="text-[10px] text-[#8a8a8a]">{totalVulns} vulns</span>
                        )}
                        <span className="text-[10px] text-[#aaa] ml-auto">{asset.lastUpdated}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-[#ccc] dark:text-[#555] shrink-0 mt-1" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Detail panel */}
          <AnimatePresence mode="wait">
            {selectedAsset ? (
              <AssetDetail
                key={selectedAsset.id}
                asset={selectedAsset}
                onClose={() => setSelectedAsset(null)}
                onPromote={handlePromote}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-[400px] rounded-xl bg-white dark:bg-[#252525] border border-[#e1dfdd] dark:border-[#3d3d3d]"
              >
                <div className="text-center">
                  <Package size={32} className="text-[#ccc] dark:text-[#555] mx-auto mb-2" />
                  <p className="text-[13px] text-[#8a8a8a]">Select an asset to view details</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-4">
          {/* Vuln chart */}
          <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-5">
            <h3 className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0] mb-3">Vulnerability Distribution by Asset</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vulnChartData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e1dfdd" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8a8a8a' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#8a8a8a' }} />
                  <RTooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e1dfdd' }} />
                  <Bar dataKey="Critical" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="High" stackId="a" fill="#f97316" />
                  <Bar dataKey="Medium" stackId="a" fill="#eab308" />
                  <Bar dataKey="Low" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* All vulnerabilities table */}
          <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50">
              <h3 className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0]">All Detected Vulnerabilities</h3>
            </div>
            <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
              {assets.flatMap(a => a.versions[0]?.vulnerabilities.map(v => ({ ...v, asset: a.name, version: a.versions[0].version })) || [])
                .sort((a, b) => {
                  const order: Record<ScanSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
                  return order[a.severity] - order[b.severity];
                })
                .map(v => {
                  const conf = SEVERITY_CONFIG[v.severity];
                  return (
                    <div key={v.id} className="flex items-center gap-4 px-5 py-2.5 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors">
                      <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold uppercase w-[60px] text-center', conf.color)}>{v.severity}</span>
                      <span className="text-[12px] font-mono text-[#5b5fc7] dark:text-[#a6a9dc] w-[130px]">{v.cve}</span>
                      <span className="text-[11px] text-[#8a8a8a] w-[120px] truncate">{v.pkg}</span>
                      <span className="text-[11px] text-[#616161] dark:text-[#b9bbbe] flex-1 truncate">{v.description}</span>
                      <span className="text-[10px] text-[#8a8a8a] w-[100px] truncate">{v.asset}</span>
                      {v.fixAvailable ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Fix</span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-500/10 text-gray-500 whitespace-nowrap">None</span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'promotions' && (
        <div className="space-y-4">
          {/* Promotion pipeline */}
          <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-5">
            <h3 className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0] mb-4">Promotion Pipeline</h3>
            <div className="flex items-center justify-between mb-6">
              {(['dev', 'staging', 'production'] as Environment[]).map((env, i) => (
                <div key={env} className="flex items-center gap-3 flex-1">
                  <div className={cn('flex-1 text-center px-4 py-3 rounded-xl border', ENV_CONFIG[env].color, 'border-current/20')}>
                    <p className="text-[12px] font-semibold">{ENV_CONFIG[env].label}</p>
                    <p className="text-[18px] font-bold mt-0.5">
                      {assets.filter(a => a.versions.some(v => v.environment === env)).length}
                    </p>
                    <p className="text-[10px] opacity-70">assets</p>
                  </div>
                  {i < 2 && <ArrowRight size={16} className="text-[#ccc] dark:text-[#555] shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Promotion history */}
          <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50">
              <h3 className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0]">Recent Promotions</h3>
            </div>
            <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
              {assets.flatMap(a =>
                a.versions
                  .filter(v => v.status === 'promoted' && v.promotedBy)
                  .map(v => ({ asset: a, version: v }))
              )
                .sort((a, b) => (b.version.promotedAt || '').localeCompare(a.version.promotedAt || ''))
                .map(({ asset, version }) => {
                  const tc = TYPE_CONFIG[asset.type];
                  const TI = tc.icon;
                  return (
                    <div key={`${asset.id}-${version.version}`} className="flex items-center gap-4 px-5 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', tc.bg)}>
                        <TI size={14} className={tc.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-[#242424] dark:text-[#f0f0f0]">{asset.name}</span>
                          <span className="text-[11px] font-mono text-[#5b5fc7] dark:text-[#a6a9dc]">v{version.version}</span>
                          <ArrowRight size={12} className="text-[#ccc]" />
                          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Production</span>
                        </div>
                        <p className="text-[11px] text-[#8a8a8a]">
                          by {version.promotedBy} · {version.promotedAt}
                        </p>
                      </div>
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Pending promotions */}
          <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#e1dfdd]/50 dark:border-[#3d3d3d]/50">
              <h3 className="text-[13px] font-semibold text-[#242424] dark:text-[#f0f0f0]">Ready for Promotion</h3>
            </div>
            <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
              {assets.flatMap(a =>
                a.versions
                  .filter(v => (v.status === 'reviewed' || (v.status === 'scanned' && v.vulnCounts.critical === 0)) && v.environment !== 'production')
                  .map(v => ({ asset: a, version: v }))
              ).map(({ asset, version }) => {
                const tc = TYPE_CONFIG[asset.type];
                const TI = tc.icon;
                return (
                  <div key={`${asset.id}-${version.version}`} className="flex items-center gap-4 px-5 py-3 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', tc.bg)}>
                      <TI size={14} className={tc.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-[#242424] dark:text-[#f0f0f0]">{asset.name}</span>
                        <span className="text-[11px] font-mono text-[#5b5fc7] dark:text-[#a6a9dc]">v{version.version}</span>
                        <span className="text-[10px] text-[#8a8a8a]">({version.environment})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">0 critical vulns</span>
                        <span className="text-[10px] text-[#8a8a8a]">· Build #{version.buildNumber}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePromote(asset.id, version.version)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#5b5fc7] to-[#7b4db8] text-white text-[11px] font-medium hover:shadow-md transition-shadow"
                    >
                      <ArrowUpRight size={12} />
                      Promote
                    </button>
                  </div>
                );
              })}
              {assets.every(a => a.versions.every(v => v.status === 'promoted' || v.status === 'built' || v.vulnCounts.critical > 0)) && (
                <div className="px-5 py-6 text-center text-[13px] text-[#8a8a8a]">
                  No assets ready for promotion
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Promotion toast */}
      <AnimatePresence>
        {promotionToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-2xl shadow-emerald-500/30"
          >
            <CheckCircle2 size={16} />
            <span className="text-[13px] font-medium">{promotionToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
