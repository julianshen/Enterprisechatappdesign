import { useState, useEffect } from 'react';
import {
  MousePointer2, Hand, Square, Circle, Type, Pen, MessageSquare,
  ZoomIn, ZoomOut, ChevronDown, ChevronRight, Plus,
  Search, LayoutGrid, Clock, Play, Eye, EyeOff, Lock,
  Move, Layers, Image as ImageIcon, Component, Frame, Minus,
  AlignLeft, AlignCenter, AlignRight, AlignStartVertical,
  AlignCenterVertical, AlignEndVertical,
  Share2, Hash,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from "@/lib/utils";
import { useI18n } from '../context/I18nContext';

// ─── Types ───

interface LayerItem {
  id: string;
  name: string;
  type: 'frame' | 'group' | 'rectangle' | 'ellipse' | 'text' | 'component' | 'instance' | 'vector' | 'image';
  visible: boolean;
  locked: boolean;
  children?: LayerItem[];
  expanded?: boolean;
}

interface CursorData {
  name: string;
  color: string;
  x: number;
  y: number;
}

interface FigmaFile {
  id: string;
  name: string;
  lastEdited: string;
  editors: string[];
  thumbnail: string;
  pages: string[];
}

// ─── Mock Data ───

const layerTree: LayerItem[] = [
  {
    id: 'f1', name: 'Login Screen', type: 'frame', visible: true, locked: false, expanded: true,
    children: [
      {
        id: 'g1', name: 'Header', type: 'group', visible: true, locked: false, expanded: true,
        children: [
          { id: 'l1', name: 'Logo', type: 'vector', visible: true, locked: false },
          { id: 'l2', name: 'App Title', type: 'text', visible: true, locked: false },
          { id: 'l3', name: 'Subtitle', type: 'text', visible: true, locked: false },
        ],
      },
      {
        id: 'g2', name: 'Form', type: 'group', visible: true, locked: false, expanded: true,
        children: [
          { id: 'l4', name: 'Email Input', type: 'component', visible: true, locked: false },
          { id: 'l5', name: 'Password Input', type: 'component', visible: true, locked: false },
          { id: 'l6', name: 'Remember Me', type: 'instance', visible: true, locked: false },
          { id: 'l7', name: 'Forgot Password', type: 'text', visible: true, locked: false },
        ],
      },
      {
        id: 'g3', name: 'Actions', type: 'group', visible: true, locked: false, expanded: false,
        children: [
          { id: 'l8', name: 'Sign In Button', type: 'component', visible: true, locked: false },
          { id: 'l9', name: 'Divider', type: 'rectangle', visible: true, locked: false },
          { id: 'l10', name: 'Google Sign In', type: 'instance', visible: true, locked: false },
          { id: 'l11', name: 'Apple Sign In', type: 'instance', visible: true, locked: false },
        ],
      },
      { id: 'l12', name: 'Background', type: 'rectangle', visible: true, locked: true },
    ],
  },
  {
    id: 'f2', name: 'Dashboard', type: 'frame', visible: true, locked: false, expanded: false,
    children: [
      { id: 'l13', name: 'Sidebar', type: 'group', visible: true, locked: false },
      { id: 'l14', name: 'Header Bar', type: 'group', visible: true, locked: false },
      { id: 'l15', name: 'Stats Cards', type: 'group', visible: true, locked: false },
      { id: 'l16', name: 'Chart Area', type: 'group', visible: true, locked: false },
      { id: 'l17', name: 'Recent Activity', type: 'group', visible: true, locked: false },
    ],
  },
  {
    id: 'f3', name: 'Components', type: 'frame', visible: true, locked: false, expanded: false,
    children: [
      { id: 'l18', name: 'Button / Primary', type: 'component', visible: true, locked: false },
      { id: 'l19', name: 'Button / Secondary', type: 'component', visible: true, locked: false },
      { id: 'l20', name: 'Input / Default', type: 'component', visible: true, locked: false },
      { id: 'l21', name: 'Input / Error', type: 'component', visible: true, locked: false },
      { id: 'l22', name: 'Avatar', type: 'component', visible: true, locked: false },
      { id: 'l23', name: 'Badge', type: 'component', visible: true, locked: false },
    ],
  },
];

const comments = [
  { id: 'c1', x: 185, y: 205, user: 'Bob J.', color: '#3B82F6', text: 'Should we use a gradient here?', resolved: false },
  { id: 'c2', x: 255, y: 395, user: 'Charlie B.', color: '#10B981', text: 'Can we add biometric login?', resolved: false },
  { id: 'c3', x: 130, y: 310, user: 'Alice W.', color: '#EC4899', text: 'Looks great! Approved.', resolved: true },
];

const cursors: CursorData[] = [
  { name: 'Alice W.', color: '#EC4899', x: 220, y: 280 },
  { name: 'Bob J.', color: '#3B82F6', x: 390, y: 190 },
];

const figmaFiles: FigmaFile[] = [
  { id: 'f1', name: 'Mobile App v3 — Designs', lastEdited: 'Editing now', editors: ['AW', 'BJ'], thumbnail: '', pages: ['Login', 'Dashboard', 'Components', 'Prototype'] },
  { id: 'f2', name: 'Design System 2.0', lastEdited: '2 hrs ago', editors: ['AW'], thumbnail: '', pages: ['Foundations', 'Components', 'Patterns'] },
  { id: 'f3', name: 'Marketing Landing Page', lastEdited: 'Yesterday', editors: [], thumbnail: '', pages: ['Hero', 'Features', 'Pricing'] },
  { id: 'f4', name: 'Dashboard Redesign', lastEdited: '3 days ago', editors: [], thumbnail: '', pages: ['Overview', 'Analytics', 'Settings'] },
];

// ─── Layer icon helper ───

function LayerIcon({ type, size = 12 }: { type: LayerItem['type']; size?: number }) {
  const s = size;
  switch (type) {
    case 'frame': return <Frame size={s} className="text-[#8B5CF6]" />;
    case 'group': return <Layers size={s} className="text-[#6366F1]" />;
    case 'rectangle': return <Square size={s} className="text-[#64748B]" />;
    case 'ellipse': return <Circle size={s} className="text-[#64748B]" />;
    case 'text': return <Type size={s} className="text-[#64748B]" />;
    case 'component': return <Component size={s} className="text-[#10B981]" />;
    case 'instance': return <Component size={s} className="text-[#8B5CF6]" />;
    case 'vector': return <Pen size={s} className="text-[#64748B]" />;
    case 'image': return <ImageIcon size={s} className="text-[#64748B]" />;
    default: return <Square size={s} className="text-[#64748B]" />;
  }
}

// ─── Layer tree renderer ───

function LayerTreeItem({ layer, depth, selectedId, onSelect }: {
  layer: LayerItem;
  depth: number;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(layer.expanded ?? false);
  const hasChildren = layer.children && layer.children.length > 0;
  const selected = selectedId === layer.id;

  return (
    <>
      <button
        onClick={() => { onSelect(layer.id); if (hasChildren) setExpanded(!expanded); }}
        className={cn(
          'w-full flex items-center gap-1 py-[3px] pr-2 text-left transition-colors group',
          selected
            ? 'bg-[#0C8CE9]/15 dark:bg-[#0C8CE9]/20'
            : 'hover:bg-[#f5f5f5] dark:hover:bg-[#333]',
        )}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        {hasChildren ? (
          <span className="w-3 h-3 flex items-center justify-center shrink-0">
            {expanded
              ? <ChevronDown size={9} className="text-[#8a8a8a]" />
              : <ChevronRight size={9} className="text-[#8a8a8a]" />
            }
          </span>
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <LayerIcon type={layer.type} size={11} />
        <span className={cn(
          'text-[11px] truncate flex-1',
          selected ? 'text-[#0C8CE9] font-medium' : 'text-[#333] dark:text-[#ccc]',
        )}>
          {layer.name}
        </span>
        {layer.locked && <Lock size={8} className="text-[#ccc] dark:text-[#555] shrink-0" />}
        {!layer.visible && <EyeOff size={8} className="text-[#ccc] dark:text-[#555] shrink-0" />}
      </button>
      {hasChildren && expanded && layer.children!.map(child => (
        <LayerTreeItem key={child.id} layer={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </>
  );
}

// ─── Toolbar tools ───

const figmaTools = [
  { id: 'move', icon: MousePointer2, label: 'Move' },
  { id: 'scale', icon: Move, label: 'Scale' },
  { id: 'frame', icon: Hash, label: 'Frame' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'pen', icon: Pen, label: 'Pen' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'hand', icon: Hand, label: 'Hand tool' },
  { id: 'comment', icon: MessageSquare, label: 'Comment' },
];

// ─── Main Component ───

export function FigmaDesignApp() {
  const { t } = useI18n();
  const [activeTool, setActiveTool] = useState('move');
  const [selectedLayer, setSelectedLayer] = useState('g2');
  const [selectedPage, setSelectedPage] = useState('Login');
  const [zoom, setZoom] = useState(65);
  const [showComments, setShowComments] = useState(true);
  const [cursorPositions, setCursorPositions] = useState(cursors);
  const [rightTab, setRightTab] = useState<'design' | 'prototype' | 'inspect'>('design');
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(figmaFiles[0]);

  const scale = zoom / 100;

  // Animate collaborator cursors
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorPositions(prev =>
        prev.map(c => ({
          ...c,
          x: c.x + (Math.random() - 0.5) * 6,
          y: c.y + (Math.random() - 0.5) * 6,
        }))
      );
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* File Header */}
      <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5">
          {/* Left: file picker */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowFilePicker(!showFilePicker)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors"
              >
                {/* Figma logo */}
                <div className="w-6 h-6 rounded flex items-center justify-center bg-[#1E1E1E] dark:bg-[#333]">
                  <svg width="12" height="16" viewBox="0 0 38 57" fill="none">
                    <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
                    <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
                    <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
                    <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
                    <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
                  </svg>
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold text-[#242424] dark:text-[#f0f0f0] block">{selectedFile.name}</span>
                  <span className="text-[10px] text-[#8a8a8a]">{selectedFile.lastEdited}</span>
                </div>
                <ChevronDown size={14} className="text-[#8a8a8a] ml-1" />
              </button>

              <AnimatePresence>
                {showFilePicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-1 w-80 bg-white dark:bg-[#2a2a2a] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-xl shadow-xl z-50"
                  >
                    <div className="p-2 border-b border-[#f0f0f0] dark:border-[#333]">
                      <div className="flex items-center gap-2 px-2 py-1.5 bg-[#f5f5f5] dark:bg-[#1e1f22] rounded-lg">
                        <Search size={13} className="text-[#8a8a8a]" />
                        <input placeholder={t('search.files')} className="bg-transparent text-xs text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] outline-none flex-1" />
                      </div>
                    </div>
                    <div className="py-1 max-h-60 overflow-y-auto scrollbar-on-hover">
                      {figmaFiles.map(file => (
                        <button
                          key={file.id}
                          onClick={() => { setSelectedFile(file); setShowFilePicker(false); }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors text-left',
                            selectedFile.id === file.id && 'bg-[#eeeef8] dark:bg-[#5b5fc7]/10',
                          )}
                        >
                          <div className="w-10 h-8 rounded bg-gradient-to-br from-[#A259FF] to-[#F24E1E] flex items-center justify-center shrink-0">
                            <LayoutGrid size={12} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#242424] dark:text-[#e0e0e0] truncate">{file.name}</p>
                            <p className="text-[10px] text-[#8a8a8a] flex items-center gap-1">
                              <Clock size={9} /> {file.lastEdited}
                              {file.editors.length > 0 && (
                                <span className="ml-1 text-[#0C8CE9]">· {file.editors.length} editing</span>
                              )}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Page tabs */}
            <div className="flex items-center gap-0.5 ml-2 border-l border-[#e5e5e5] dark:border-[#3d3d3d] pl-3">
              {selectedFile.pages.map(page => (
                <button
                  key={page}
                  onClick={() => setSelectedPage(page)}
                  className={cn(
                    'px-2.5 py-1 text-[11px] rounded-md font-medium transition-colors',
                    selectedPage === page
                      ? 'bg-[#E8E8FF] dark:bg-[#5b5fc7]/20 text-[#5b5fc7] dark:text-[#a6a9dc]'
                      : 'text-[#8a8a8a] hover:text-[#242424] dark:hover:text-[#e0e0e0] hover:bg-[#f5f5f5] dark:hover:bg-[#333]',
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>

          {/* Right: collab + share */}
          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-1.5">
              {cursors.map((c, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white dark:border-[#252525] flex items-center justify-center text-white text-[9px] font-bold"
                  style={{ backgroundColor: c.color, zIndex: cursors.length - i }}
                  title={c.name}
                >
                  {c.name.split(' ').map(w => w[0]).join('')}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowComments(!showComments)}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                showComments ? 'bg-[#E8E8FF] dark:bg-[#5b5fc7]/20 text-[#5b5fc7]' : 'text-[#8a8a8a] hover:bg-[#f5f5f5] dark:hover:bg-[#333]',
              )}
            >
              <MessageSquare size={14} />
            </button>

            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C8CE9] hover:bg-[#0A7BD6] text-white text-xs font-medium transition-colors">
              <Share2 size={12} />
              Share
            </button>

            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1E1E1E] dark:bg-[#444] hover:bg-[#333] dark:hover:bg-[#555] text-white text-xs font-medium transition-colors">
              <Play size={10} />
              Present
            </button>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex gap-0 bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden" style={{ height: 520 }}>
        {/* Left: Layers Panel */}
        <div className="w-52 shrink-0 border-r border-[#e5e5e5] dark:border-[#3d3d3d] flex flex-col bg-[#fafafa] dark:bg-[#1e1f22]">
          {/* Layers header */}
          <div className="px-3 py-2 border-b border-[#e5e5e5] dark:border-[#333] flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#333] dark:text-[#ccc] uppercase tracking-wider">Layers</span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-[#eee] dark:hover:bg-[#333] text-[#999] transition-colors">
                <Search size={11} />
              </button>
              <button className="p-1 rounded hover:bg-[#eee] dark:hover:bg-[#333] text-[#999] transition-colors">
                <Plus size={11} />
              </button>
            </div>
          </div>
          {/* Layer tree */}
          <div className="flex-1 overflow-y-auto scrollbar-on-hover py-1">
            {layerTree.map(layer => (
              <LayerTreeItem
                key={layer.id}
                layer={layer}
                depth={0}
                selectedId={selectedLayer}
                onSelect={setSelectedLayer}
              />
            ))}
          </div>
          {/* Pages */}
          <div className="border-t border-[#e5e5e5] dark:border-[#333] px-3 py-2">
            <span className="text-[10px] font-semibold text-[#999] uppercase tracking-wider">Pages</span>
            <div className="mt-1 space-y-0.5">
              {selectedFile.pages.map(page => (
                <button
                  key={page}
                  onClick={() => setSelectedPage(page)}
                  className={cn(
                    'w-full text-left px-2 py-1 rounded text-[11px] transition-colors',
                    selectedPage === page
                      ? 'bg-[#0C8CE9]/10 text-[#0C8CE9] font-medium'
                      : 'text-[#666] dark:text-[#999] hover:bg-[#eee] dark:hover:bg-[#333]',
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Canvas + Toolbar */}
        <div className="flex-1 flex flex-col relative">
          {/* Toolbar */}
          <div className="h-10 border-b border-[#e5e5e5] dark:border-[#333] bg-[#2c2c2c] dark:bg-[#1a1a1a] flex items-center px-2 gap-0.5">
            {figmaTools.map((tool, i) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-md transition-colors',
                  activeTool === tool.id
                    ? 'bg-[#0C8CE9] text-white'
                    : 'text-[#999] hover:text-white hover:bg-[#444]',
                  i === 2 && 'ml-2',
                  i === 7 && 'ml-2',
                  i === 8 && 'ml-2',
                )}
              >
                <tool.icon size={14} />
              </button>
            ))}
            <div className="flex-1" />
            {/* Zoom display */}
            <div className="flex items-center gap-1 mr-2">
              <button onClick={() => setZoom(z => Math.max(z - 10, 20))} className="w-6 h-6 flex items-center justify-center rounded text-[#999] hover:text-white hover:bg-[#444] transition-colors">
                <ZoomOut size={12} />
              </button>
              <span className="text-[10px] text-[#999] w-8 text-center font-mono">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(z + 10, 200))} className="w-6 h-6 flex items-center justify-center rounded text-[#999] hover:text-white hover:bg-[#444] transition-colors">
                <ZoomIn size={12} />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div
            className="flex-1 relative overflow-hidden"
            style={{
              backgroundColor: '#e5e5e5',
              backgroundImage: 'radial-gradient(circle, #d0d0d0 0.5px, transparent 0.5px)',
              backgroundSize: `${20 * scale}px ${20 * scale}px`,
              cursor: activeTool === 'hand' ? 'grab' : activeTool === 'move' ? 'default' : 'crosshair',
            }}
          >
            {/* The artboard */}
            <div
              className="absolute"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                left: 40,
                top: 20,
              }}
            >
              {/* Frame label */}
              <div className="absolute -top-5 left-0 text-[11px] font-medium text-[#333] dark:text-[#999]">
                Login Screen — 390×844
              </div>

              {/* The actual frame / artboard */}
              <div
                className="relative bg-white rounded-[8px] overflow-hidden"
                style={{
                  width: 390,
                  height: 500,
                  boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
                }}
              >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#667EEA] via-[#764BA2] to-[#F093FB] opacity-[0.04]" />

                {/* Status bar mock */}
                <div className="flex items-center justify-between px-6 pt-4 pb-2">
                  <span className="text-[10px] font-semibold text-[#333]">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-2 border border-[#333] rounded-[1px] relative">
                      <div className="absolute inset-[1px] right-[2px] bg-[#333] rounded-[0.5px]" />
                    </div>
                  </div>
                </div>

                {/* Header area */}
                <div className="flex flex-col items-center pt-6 pb-4 px-8">
                  {/* Logo */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center mb-4 shadow-lg shadow-[#6366F1]/20">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  </div>
                  <h2 className="text-[18px] font-bold text-[#1a1a2e] tracking-tight">Welcome back</h2>
                  <p className="text-[12px] text-[#888] mt-1">Sign in to your account</p>
                </div>

                {/* Form */}
                <div className="px-8 space-y-3">
                  {/* Email */}
                  <div>
                    <label className="text-[10px] font-semibold text-[#555] uppercase tracking-wider block mb-1">Email</label>
                    <div className="h-10 rounded-lg border-2 border-[#E5E7EB] bg-[#F9FAFB] flex items-center px-3">
                      <span className="text-[12px] text-[#9CA3AF]">you@company.com</span>
                    </div>
                  </div>
                  {/* Password */}
                  <div>
                    <label className="text-[10px] font-semibold text-[#555] uppercase tracking-wider block mb-1">Password</label>
                    <div className="h-10 rounded-lg border-2 border-[#E5E7EB] bg-[#F9FAFB] flex items-center px-3 justify-between">
                      <span className="text-[12px] text-[#9CA3AF]">••••••••</span>
                      <Eye size={12} className="text-[#9CA3AF]" />
                    </div>
                  </div>
                  {/* Remember + Forgot */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-[#6366F1] bg-[#6366F1] flex items-center justify-center">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="text-[11px] text-[#555]">Remember me</span>
                    </div>
                    <span className="text-[11px] text-[#6366F1] font-medium">Forgot password?</span>
                  </div>
                  {/* Button */}
                  <button className="w-full h-11 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-semibold text-[13px] shadow-lg shadow-[#6366F1]/25 mt-1">
                    Sign In
                  </button>
                  {/* Divider */}
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-[#E5E7EB]" />
                    <span className="text-[10px] text-[#9CA3AF] uppercase">or continue with</span>
                    <div className="flex-1 h-px bg-[#E5E7EB]" />
                  </div>
                  {/* Social buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 h-10 rounded-lg border-2 border-[#E5E7EB] flex items-center justify-center gap-2 hover:bg-[#F9FAFB]">
                      <svg width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      <span className="text-[11px] font-medium text-[#333]">Google</span>
                    </button>
                    <button className="flex-1 h-10 rounded-lg border-2 border-[#E5E7EB] flex items-center justify-center gap-2 hover:bg-[#F9FAFB]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#000"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                      <span className="text-[11px] font-medium text-[#333]">Apple</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Selection outline on the Form group */}
              <div
                className="absolute border-2 border-[#0C8CE9] rounded pointer-events-none"
                style={{ left: 24, top: 190, width: 342, height: 245 }}
              >
                {/* Selection handles */}
                {[
                  { left: -4, top: -4 }, { right: -4, top: -4 },
                  { left: -4, bottom: -4 }, { right: -4, bottom: -4 },
                  { left: '50%', top: -4, transform: 'translateX(-50%)' },
                  { left: '50%', bottom: -4, transform: 'translateX(-50%)' },
                  { left: -4, top: '50%', transform: 'translateY(-50%)' },
                  { right: -4, top: '50%', transform: 'translateY(-50%)' },
                ].map((pos, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white border-2 border-[#0C8CE9] rounded-[1px]"
                    style={pos as any}
                  />
                ))}
                {/* Size label */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#0C8CE9] text-white text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap">
                  342 × 245
                </div>
              </div>

              {/* Distance guides */}
              <div className="absolute pointer-events-none" style={{ left: 24, top: 185 }}>
                <div className="w-px h-[5px] bg-[#FF3366] mx-auto" />
                <div className="bg-[#FF3366] text-white text-[8px] font-mono px-1 rounded -ml-2 -mt-0.5">24</div>
              </div>
            </div>

            {/* Second artboard thumbnail */}
            <div
              className="absolute"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                left: 40 + 390 * scale + 40,
                top: 20,
              }}
            >
              <div className="absolute -top-5 left-0 text-[11px] font-medium text-[#999]">
                Dashboard — 1440×900
              </div>
              <div
                className="relative bg-white rounded-[4px] overflow-hidden opacity-70"
                style={{
                  width: 320,
                  height: 200,
                  boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
                }}
              >
                {/* Mini dashboard preview */}
                <div className="flex h-full">
                  {/* Sidebar */}
                  <div className="w-12 bg-[#1a1a2e] flex flex-col items-center py-2 gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#6366F1] opacity-80" />
                    <div className="w-5 h-1 bg-[#444] rounded-full mt-2" />
                    <div className="w-5 h-1 bg-[#444] rounded-full" />
                    <div className="w-5 h-1 bg-[#6366F1] rounded-full" />
                    <div className="w-5 h-1 bg-[#444] rounded-full" />
                  </div>
                  {/* Content area */}
                  <div className="flex-1 p-3">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-24 h-2.5 bg-[#e5e5e5] rounded-full" />
                      <div className="w-6 h-6 rounded-full bg-[#e5e5e5]" />
                    </div>
                    {/* Stats row */}
                    <div className="flex gap-2 mb-3">
                      {['#6366F1', '#10B981', '#F59E0B', '#EF4444'].map((c, i) => (
                        <div key={i} className="flex-1 h-12 rounded-lg border border-[#e5e5e5] p-1.5">
                          <div className="w-8 h-1.5 rounded-full mb-1" style={{ backgroundColor: c, opacity: 0.3 }} />
                          <div className="w-12 h-2 bg-[#e5e5e5] rounded-full" />
                        </div>
                      ))}
                    </div>
                    {/* Chart area */}
                    <div className="h-16 rounded-lg border border-[#e5e5e5] flex items-end px-2 pb-1 gap-1">
                      {[40, 65, 45, 80, 60, 70, 55, 85, 75, 50, 90, 68].map((h, i) => (
                        <div key={i} className="flex-1 bg-[#6366F1] rounded-t-sm opacity-20" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments */}
            {showComments && comments.map(comment => (
              <motion.div
                key={comment.id}
                className="absolute z-20"
                style={{
                  left: comment.x * scale + 40,
                  top: comment.y * scale + 20,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.4 }}
              >
                <div className="relative group">
                  {/* Comment pin */}
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold cursor-pointer shadow-lg',
                      comment.resolved ? 'opacity-50' : '',
                    )}
                    style={{ backgroundColor: comment.color }}
                  >
                    {comment.user.split(' ')[0][0]}{comment.user.split(' ')[1]?.[0]}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute left-8 top-0 bg-white dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#3d3d3d] rounded-lg shadow-xl p-2 min-w-[160px] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[6px] font-bold" style={{ backgroundColor: comment.color }}>
                        {comment.user[0]}
                      </div>
                      <span className="text-[10px] font-semibold text-[#242424] dark:text-[#e0e0e0]">{comment.user}</span>
                      {comment.resolved && <span className="text-[8px] text-[#10B981] font-medium">Resolved</span>}
                    </div>
                    <p className="text-[10px] text-[#666] dark:text-[#999]">{comment.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Cursors */}
            {cursorPositions.map((cursor, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none z-30"
                animate={{
                  left: cursor.x * scale + 40,
                  top: cursor.y * scale + 20,
                }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
              >
                <svg width="14" height="18" viewBox="0 0 16 20" fill="none">
                  <path d="M1 1L6 18L8.5 11L15 9L1 1Z" fill={cursor.color} stroke="white" strokeWidth="1.5" />
                </svg>
                <div
                  className="absolute left-3.5 top-3.5 px-1.5 py-0.5 rounded text-[7px] font-medium text-white whitespace-nowrap"
                  style={{ backgroundColor: cursor.color }}
                >
                  {cursor.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Properties Panel */}
        <div className="w-56 shrink-0 border-l border-[#e5e5e5] dark:border-[#3d3d3d] flex flex-col bg-[#fafafa] dark:bg-[#1e1f22]">
          {/* Tabs */}
          <div className="flex border-b border-[#e5e5e5] dark:border-[#333]">
            {(['design', 'prototype', 'inspect'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={cn(
                  'flex-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px',
                  rightTab === tab
                    ? 'text-[#0C8CE9] border-[#0C8CE9]'
                    : 'text-[#999] border-transparent hover:text-[#666]',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Properties content */}
          <div className="flex-1 overflow-y-auto scrollbar-on-hover">
            {rightTab === 'design' && (
              <div className="text-[11px]">
                {/* Alignment */}
                <div className="px-3 py-2.5 border-b border-[#e5e5e5] dark:border-[#333]">
                  <div className="flex items-center gap-1 mb-2">
                    {[AlignLeft, AlignCenter, AlignRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical].map((Icon, i) => (
                      <button key={i} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#eee] dark:hover:bg-[#333] text-[#666] dark:text-[#999] transition-colors">
                        <Icon size={12} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position & Size */}
                <div className="px-3 py-2.5 border-b border-[#e5e5e5] dark:border-[#333]">
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: 'X', value: '24' },
                      { label: 'Y', value: '190' },
                      { label: 'W', value: '342' },
                      { label: 'H', value: '245' },
                    ].map(prop => (
                      <div key={prop.label} className="flex items-center gap-1 bg-white dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#3d3d3d] rounded px-2 py-1">
                        <span className="text-[9px] text-[#999] w-3">{prop.label}</span>
                        <span className="text-[10px] text-[#333] dark:text-[#ccc] font-mono">{prop.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1 bg-white dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#3d3d3d] rounded px-2 py-1">
                      <span className="text-[9px] text-[#999] w-3">R</span>
                      <span className="text-[10px] text-[#333] dark:text-[#ccc] font-mono">0°</span>
                    </div>
                  </div>
                </div>

                {/* Auto Layout */}
                <div className="px-3 py-2.5 border-b border-[#e5e5e5] dark:border-[#333]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-[#333] dark:text-[#ccc]">Auto layout</span>
                    <div className="flex items-center gap-0.5">
                      <Plus size={10} className="text-[#0C8CE9]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#666] dark:text-[#999]">
                    <div className="flex items-center gap-1 bg-[#E8E8FF] dark:bg-[#5b5fc7]/20 text-[#5b5fc7] px-1.5 py-0.5 rounded">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="3" width="4" height="10" rx="1"/><rect x="6" y="3" width="4" height="10" rx="1"/><rect x="11" y="3" width="4" height="10" rx="1"/></svg>
                      Vertical
                    </div>
                    <span>Gap: <span className="font-mono">12</span></span>
                    <span>Pad: <span className="font-mono">32</span></span>
                  </div>
                </div>

                {/* Fill */}
                <div className="px-3 py-2.5 border-b border-[#e5e5e5] dark:border-[#333]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-[#333] dark:text-[#ccc]">Fill</span>
                    <Plus size={10} className="text-[#0C8CE9] cursor-pointer" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded border border-[#e5e5e5] dark:border-[#3d3d3d] bg-white" />
                    <span className="font-mono text-[10px] text-[#333] dark:text-[#ccc]">FFFFFF</span>
                    <span className="text-[10px] text-[#999] ml-auto">100%</span>
                  </div>
                </div>

                {/* Stroke */}
                <div className="px-3 py-2.5 border-b border-[#e5e5e5] dark:border-[#333]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-[#333] dark:text-[#ccc]">Stroke</span>
                    <Plus size={10} className="text-[#0C8CE9] cursor-pointer" />
                  </div>
                  <span className="text-[10px] text-[#999]">None</span>
                </div>

                {/* Effects */}
                <div className="px-3 py-2.5 border-b border-[#e5e5e5] dark:border-[#333]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-[#333] dark:text-[#ccc]">Effects</span>
                    <Plus size={10} className="text-[#0C8CE9] cursor-pointer" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={10} className="text-[#999]" />
                    <span className="text-[10px] text-[#333] dark:text-[#ccc]">Drop shadow</span>
                    <span className="text-[10px] text-[#999] ml-auto">0, 4, 40</span>
                  </div>
                </div>

                {/* Export */}
                <div className="px-3 py-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-[#333] dark:text-[#ccc]">Export</span>
                    <Plus size={10} className="text-[#0C8CE9] cursor-pointer" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#3d3d3d] rounded px-2 py-1">
                      <span className="text-[10px] text-[#333] dark:text-[#ccc] font-mono">1x</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#3d3d3d] rounded px-2 py-1">
                      <span className="text-[10px] text-[#333] dark:text-[#ccc]">PNG</span>
                    </div>
                    <button className="ml-auto text-[10px] text-[#0C8CE9] font-medium">Export</button>
                  </div>
                </div>
              </div>
            )}

            {rightTab === 'prototype' && (
              <div className="px-3 py-4 text-center">
                <div className="w-12 h-12 mx-auto bg-[#f0f0f0] dark:bg-[#333] rounded-xl flex items-center justify-center mb-3">
                  <Play size={18} className="text-[#999]" />
                </div>
                <p className="text-[11px] font-semibold text-[#333] dark:text-[#ccc] mb-1">Interactions</p>
                <p className="text-[10px] text-[#999]">Select a layer and add prototype interactions.</p>
                <div className="mt-4 space-y-2">
                  <div className="bg-white dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#3d3d3d] rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-3 h-3 rounded-full bg-[#0C8CE9]" />
                      <span className="text-[10px] font-semibold text-[#333] dark:text-[#ccc]">On click</span>
                    </div>
                    <p className="text-[9px] text-[#999]">Navigate to → Dashboard</p>
                    <p className="text-[9px] text-[#999]">Animation: Smart animate, 300ms</p>
                  </div>
                </div>
              </div>
            )}

            {rightTab === 'inspect' && (
              <div className="text-[10px]">
                <div className="px-3 py-2.5 border-b border-[#e5e5e5] dark:border-[#333]">
                  <span className="font-semibold text-[#333] dark:text-[#ccc] text-[11px]">CSS</span>
                  <div className="mt-2 bg-[#1e1e1e] rounded-lg p-2.5 font-mono text-[#d4d4d4] leading-relaxed">
                    <div><span className="text-[#569CD6]">display</span>: <span className="text-[#CE9178]">flex</span>;</div>
                    <div><span className="text-[#569CD6]">flex-direction</span>: <span className="text-[#CE9178]">column</span>;</div>
                    <div><span className="text-[#569CD6]">gap</span>: <span className="text-[#B5CEA8]">12px</span>;</div>
                    <div><span className="text-[#569CD6]">padding</span>: <span className="text-[#B5CEA8]">32px</span>;</div>
                    <div><span className="text-[#569CD6]">width</span>: <span className="text-[#B5CEA8]">342px</span>;</div>
                    <div><span className="text-[#569CD6]">height</span>: <span className="text-[#B5CEA8]">245px</span>;</div>
                  </div>
                </div>
                <div className="px-3 py-2.5">
                  <span className="font-semibold text-[#333] dark:text-[#ccc] text-[11px]">Properties</span>
                  <div className="mt-2 space-y-1.5">
                    {[
                      { key: 'Background', val: '#FFFFFF' },
                      { key: 'Border radius', val: '0px' },
                      { key: 'Opacity', val: '100%' },
                      { key: 'Blend mode', val: 'Pass through' },
                    ].map(p => (
                      <div key={p.key} className="flex items-center justify-between">
                        <span className="text-[#999]">{p.key}</span>
                        <span className="text-[#333] dark:text-[#ccc] font-mono">{p.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Components', value: '24', sub: '6 published to library' },
          { label: 'Frames', value: '3', sub: 'Login, Dashboard, Components' },
          { label: 'Comments', value: '12', sub: '2 unresolved threads' },
          { label: 'Version', value: 'v2.5', sub: 'Last saved 2 min ago' },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] px-4 py-3"
          >
            <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider">{stat.label}</p>
            <p className="text-lg font-bold text-[#242424] dark:text-[#f0f0f0] mt-0.5">{stat.value}</p>
            <p className="text-[10px] text-[#b9bbbe] dark:text-[#5a5a5a]">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
