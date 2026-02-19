import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MousePointer2, Hand, Square, StickyNote as StickyNoteIcon, Type,
  ArrowUpRight, Pen, MessageSquare, ZoomIn, ZoomOut, Maximize2,
  MoreHorizontal, Lock, Unlock, Share2, Play, Undo2, Redo2,
  ChevronDown, Plus, Star, Search, LayoutGrid, Clock,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './ui/utils';

// ─── Types ───

interface StickyNote {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  color: string;
  rotation?: number;
  fontSize?: number;
}

interface ShapeItem {
  id: string;
  type: 'rect' | 'circle' | 'diamond' | 'rounded-rect';
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  fill: string;
  stroke: string;
  strokeWidth?: number;
}

interface TextItem {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  fontWeight?: string;
}

interface Connector {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  dashed?: boolean;
  arrow?: boolean;
}

interface FrameItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  color: string;
}

interface CursorData {
  name: string;
  color: string;
  x: number;
  y: number;
  avatar: string;
}

interface BoardData {
  id: string;
  name: string;
  lastEdited: string;
  starred: boolean;
  thumbnail?: string;
}

// ─── Mock Data ───

const stickyNotes: StickyNote[] = [
  // User Research frame
  { id: 's1', x: 80, y: 120, w: 160, h: 140, text: 'User interviews reveal need for faster onboarding flow', color: '#FEF3C7', rotation: -1 },
  { id: 's2', x: 260, y: 130, w: 160, h: 140, text: 'Survey: 73% of users prefer dark mode as default', color: '#FEF3C7', rotation: 2 },
  { id: 's3', x: 440, y: 120, w: 160, h: 140, text: 'Competitor analysis shows gap in mobile experience', color: '#FEF3C7', rotation: -0.5 },
  { id: 's4', x: 170, y: 280, w: 160, h: 140, text: '⚡ Key Insight: Users abandon at step 3 of signup', color: '#FECACA', rotation: 1 },
  { id: 's5', x: 350, y: 280, w: 160, h: 140, text: 'Need to reduce form fields from 8 to 4', color: '#FECACA', rotation: -1.5 },

  // Sprint Planning frame
  { id: 's6', x: 720, y: 120, w: 140, h: 120, text: '✅ Auth flow redesign\n3 pts', color: '#D1FAE5', rotation: 0.5 },
  { id: 's7', x: 880, y: 120, w: 140, h: 120, text: '🔄 Dashboard widgets\n5 pts', color: '#DBEAFE', rotation: -1 },
  { id: 's8', x: 720, y: 260, w: 140, h: 120, text: '🐛 Fix nav collapse\n2 pts', color: '#FEE2E2', rotation: 1 },
  { id: 's9', x: 880, y: 260, w: 140, h: 120, text: '📊 Analytics page\n8 pts', color: '#DBEAFE', rotation: -0.5 },
  { id: 's10', x: 800, y: 400, w: 140, h: 120, text: '🎯 Sprint Goal:\nShip v2.5 beta', color: '#E9D5FF', rotation: 0 },

  // Ideas frame
  { id: 's11', x: 80, y: 530, w: 150, h: 130, text: '💡 AI-powered search across all spaces', color: '#FEF3C7', rotation: 1 },
  { id: 's12', x: 250, y: 540, w: 150, h: 130, text: '💡 Voice messages in chat', color: '#D1FAE5', rotation: -1 },
  { id: 's13', x: 420, y: 530, w: 150, h: 130, text: '💡 Custom emoji reactions', color: '#DBEAFE', rotation: 0.5 },
  { id: 's14', x: 170, y: 680, w: 150, h: 130, text: '💡 Kanban board templates', color: '#FCE7F3', rotation: -0.5 },
  { id: 's15', x: 340, y: 680, w: 150, h: 130, text: '💡 Workflow automations builder', color: '#E9D5FF', rotation: 1 },
];

const shapes: ShapeItem[] = [
  // Flow diagram shapes
  { id: 'sh1', type: 'rounded-rect', x: 720, y: 540, w: 160, h: 60, text: 'User signs up', fill: '#EEF2FF', stroke: '#6366F1', strokeWidth: 2 },
  { id: 'sh2', type: 'diamond', x: 730, y: 630, w: 140, h: 80, text: 'Email verified?', fill: '#FFF7ED', stroke: '#F97316', strokeWidth: 2 },
  { id: 'sh3', type: 'rounded-rect', x: 640, y: 740, w: 140, h: 50, text: 'Send reminder', fill: '#FEF2F2', stroke: '#EF4444', strokeWidth: 2 },
  { id: 'sh4', type: 'rounded-rect', x: 840, y: 740, w: 140, h: 50, text: 'Onboarding flow', fill: '#ECFDF5', stroke: '#10B981', strokeWidth: 2 },
  { id: 'sh5', type: 'rounded-rect', x: 840, y: 820, w: 140, h: 50, text: 'Dashboard', fill: '#EEF2FF', stroke: '#6366F1', strokeWidth: 2 },
];

const textItems: TextItem[] = [
  { id: 't1', x: 260, y: 82, text: 'User Research', fontSize: 16, color: '#6B7280', fontWeight: '700' },
  { id: 't2', x: 800, y: 82, text: 'Sprint 15 Planning', fontSize: 16, color: '#6B7280', fontWeight: '700' },
  { id: 't3', x: 250, y: 500, text: 'Ideas Backlog', fontSize: 16, color: '#6B7280', fontWeight: '700' },
  { id: 't4', x: 780, y: 500, text: 'Signup Flow v2', fontSize: 16, color: '#6B7280', fontWeight: '700' },
  { id: 't5', x: 80, y: 450, text: '👥 3 votes', fontSize: 11, color: '#9CA3AF' },
  { id: 't6', x: 250, y: 450, text: '👥 7 votes', fontSize: 11, color: '#9CA3AF' },
  { id: 't7', x: 420, y: 450, text: '👥 5 votes', fontSize: 11, color: '#9CA3AF' },
];

const connectors: Connector[] = [
  // Flow diagram connectors
  { id: 'c1', x1: 800, y1: 600, x2: 800, y2: 630, color: '#6366F1', arrow: true },
  { id: 'c2', x1: 730, y1: 670, x2: 710, y2: 740, color: '#EF4444', arrow: true, dashed: true },
  { id: 'c3', x1: 870, y1: 670, x2: 910, y2: 740, color: '#10B981', arrow: true },
  { id: 'c4', x1: 910, y1: 790, x2: 910, y2: 820, color: '#6366F1', arrow: true },
  // Grouping connectors
  { id: 'c5', x1: 600, y1: 350, x2: 700, y2: 350, color: '#D1D5DB', dashed: true },
];

const frames: FrameItem[] = [
  { id: 'f1', x: 60, y: 70, w: 560, h: 380, title: '', color: '#E5E7EB' },
  { id: 'f2', x: 700, y: 70, w: 340, h: 480, title: '', color: '#E5E7EB' },
  { id: 'f3', x: 60, y: 490, w: 530, h: 350, title: '', color: '#E5E7EB' },
  { id: 'f4', x: 620, y: 490, w: 400, h: 400, title: '', color: '#E5E7EB' },
];

const collaborators: CursorData[] = [
  { name: 'Alice W.', color: '#EC4899', x: 380, y: 200, avatar: 'AW' },
  { name: 'Bob J.', color: '#3B82F6', x: 850, y: 320, avatar: 'BJ' },
  { name: 'Charlie B.', color: '#10B981', x: 200, y: 620, avatar: 'CB' },
];

const boards: BoardData[] = [
  { id: 'b1', name: 'Product Strategy Q1 2026', lastEdited: '2 min ago', starred: true },
  { id: 'b2', name: 'Design Sprint — Mobile App v3', lastEdited: '1 hr ago', starred: true },
  { id: 'b3', name: 'User Journey Mapping', lastEdited: '3 hrs ago', starred: false },
  { id: 'b4', name: 'Retrospective Sprint 14', lastEdited: 'Yesterday', starred: false },
  { id: 'b5', name: 'Architecture Diagram', lastEdited: '2 days ago', starred: false },
];

const CANVAS_W = 1100;
const CANVAS_H = 920;

// ─── Tool sidebar items ───

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
  { id: 'sticky', icon: StickyNoteIcon, label: 'Sticky note', shortcut: 'N' },
  { id: 'shape', icon: Square, label: 'Shape', shortcut: 'R' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'connector', icon: ArrowUpRight, label: 'Connection line', shortcut: 'L' },
  { id: 'pen', icon: Pen, label: 'Pen', shortcut: 'P' },
  { id: 'comment', icon: MessageSquare, label: 'Comment', shortcut: 'C' },
  { id: 'frame', icon: Layers, label: 'Frame', shortcut: 'F' },
];

// ─── Component ───

export function MiroBoard() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState('select');
  const [zoom, setZoom] = useState(55);
  const [selectedBoard, setSelectedBoard] = useState(boards[0]);
  const [showBoardPicker, setShowBoardPicker] = useState(false);
  const [cursorPositions, setCursorPositions] = useState(collaborators);
  const [hoveredSticky, setHoveredSticky] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  // Animate collaborator cursors slightly
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorPositions(prev =>
        prev.map(c => ({
          ...c,
          x: c.x + (Math.random() - 0.5) * 8,
          y: c.y + (Math.random() - 0.5) * 8,
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const zoomIn = useCallback(() => setZoom(z => Math.min(z + 10, 200)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(z - 10, 20)), []);
  const zoomFit = useCallback(() => setZoom(55), []);

  const scale = zoom / 100;

  return (
    <div className="space-y-4">
      {/* Board Header */}
      <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#f0f0f0] dark:border-[#333]">
          {/* Left: board picker */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowBoardPicker(!showBoardPicker)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors"
              >
                <div className="w-6 h-6 rounded bg-[#FFD02F] flex items-center justify-center">
                  <LayoutGrid size={12} className="text-[#1a1a2e]" />
                </div>
                <span className="text-sm font-semibold text-[#242424] dark:text-[#f0f0f0]">{selectedBoard.name}</span>
                <ChevronDown size={14} className="text-[#8a8a8a]" />
              </button>

              <AnimatePresence>
                {showBoardPicker && (
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
                        <input
                          placeholder="Search boards..."
                          className="bg-transparent text-xs text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] outline-none flex-1"
                        />
                      </div>
                    </div>
                    <div className="py-1 max-h-60 overflow-y-auto scrollbar-on-hover">
                      {boards.map(board => (
                        <button
                          key={board.id}
                          onClick={() => { setSelectedBoard(board); setShowBoardPicker(false); }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors text-left',
                            selectedBoard.id === board.id && 'bg-[#eeeef8] dark:bg-[#5b5fc7]/10',
                          )}
                        >
                          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#FFD02F] to-[#FFAB00] flex items-center justify-center shrink-0">
                            <LayoutGrid size={12} className="text-[#1a1a2e]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#242424] dark:text-[#e0e0e0] truncate">{board.name}</p>
                            <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] flex items-center gap-1">
                              <Clock size={9} /> {board.lastEdited}
                            </p>
                          </div>
                          {board.starred && <Star size={12} className="text-[#FFD02F] fill-[#FFD02F] shrink-0" />}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-[#f0f0f0] dark:border-[#333] p-2">
                      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#333] text-[#5b5fc7] dark:text-[#a6a9dc] transition-colors">
                        <Plus size={14} />
                        <span className="text-xs font-medium">Create new board</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-0.5 ml-2">
              <button className="p-1.5 rounded hover:bg-[#f5f5f5] dark:hover:bg-[#333] text-[#8a8a8a] hover:text-[#242424] dark:hover:text-[#e0e0e0] transition-colors">
                <Undo2 size={14} />
              </button>
              <button className="p-1.5 rounded hover:bg-[#f5f5f5] dark:hover:bg-[#333] text-[#d1d1d1] dark:text-[#3d3d3d] cursor-not-allowed">
                <Redo2 size={14} />
              </button>
            </div>
          </div>

          {/* Right: collaborators + share */}
          <div className="flex items-center gap-3">
            {/* Collaborator avatars */}
            <div className="flex items-center -space-x-1.5">
              {collaborators.map((c, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white dark:border-[#252525] flex items-center justify-center text-white text-[9px] font-bold"
                  style={{ backgroundColor: c.color, zIndex: collaborators.length - i }}
                  title={c.name}
                >
                  {c.avatar}
                </div>
              ))}
              <div className="w-7 h-7 rounded-full border-2 border-white dark:border-[#252525] bg-[#f0f0f0] dark:bg-[#3d3d3d] flex items-center justify-center text-[10px] text-[#616161] dark:text-[#8a8a8a] font-medium">
                +2
              </div>
            </div>

            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4262FF] hover:bg-[#3551E0] text-white text-xs font-medium transition-colors">
              <Share2 size={12} />
              Share
            </button>
            <button className="p-1.5 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#333] text-[#8a8a8a] transition-colors">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden" style={{ height: 560 }}>
        {/* Toolbar (left) */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col bg-white dark:bg-[#2a2a2a] rounded-xl shadow-lg border border-[#e5e5e5] dark:border-[#3d3d3d] overflow-hidden">
          {tools.map((tool, i) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              title={`${tool.label} (${tool.shortcut})`}
              className={cn(
                'w-10 h-10 flex items-center justify-center transition-all relative group',
                activeTool === tool.id
                  ? 'bg-[#4262FF] text-white'
                  : 'text-[#616161] dark:text-[#8a8a8a] hover:bg-[#f5f5f5] dark:hover:bg-[#333] hover:text-[#242424] dark:hover:text-[#e0e0e0]',
                i > 0 && 'border-t border-[#f0f0f0] dark:border-[#333]',
              )}
            >
              <tool.icon size={16} />
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a2e] text-white text-[10px] rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                {tool.label}
                <span className="ml-1.5 text-[#8a8a8a]">{tool.shortcut}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="absolute inset-0 overflow-hidden"
          style={{ cursor: activeTool === 'hand' ? 'grab' : activeTool === 'select' ? 'default' : 'crosshair' }}
        >
          {/* Dot grid background */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.4 }}>
            <defs>
              <pattern id="miro-dots" x="0" y="0" width={20 * scale} height={20 * scale} patternUnits="userSpaceOnUse">
                <circle cx={10 * scale} cy={10 * scale} r={0.8 * scale} className="fill-[#d1d5db] dark:fill-[#3d3d3d]" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#miro-dots)" />
          </svg>

          {/* Scaled canvas content */}
          <div
            className="relative"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: CANVAS_W,
              height: CANVAS_H,
            }}
          >
            {/* Frames */}
            {frames.map(frame => (
              <div
                key={frame.id}
                className="absolute rounded-xl border-2 border-dashed"
                style={{
                  left: frame.x,
                  top: frame.y,
                  width: frame.w,
                  height: frame.h,
                  borderColor: `${frame.color}`,
                }}
              />
            ))}

            {/* Connectors (SVG) */}
            <svg className="absolute inset-0" width={CANVAS_W} height={CANVAS_H} style={{ pointerEvents: 'none' }}>
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#6366F1" />
                </marker>
                <marker id="arrowhead-red" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#EF4444" />
                </marker>
                <marker id="arrowhead-green" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#10B981" />
                </marker>
              </defs>
              {connectors.map(c => {
                const markerId = c.color === '#EF4444' ? 'arrowhead-red'
                  : c.color === '#10B981' ? 'arrowhead-green'
                  : 'arrowhead';
                return (
                  <line
                    key={c.id}
                    x1={c.x1}
                    y1={c.y1}
                    x2={c.x2}
                    y2={c.y2}
                    stroke={c.color}
                    strokeWidth={2}
                    strokeDasharray={c.dashed ? '6 4' : undefined}
                    markerEnd={c.arrow ? `url(#${markerId})` : undefined}
                  />
                );
              })}
            </svg>

            {/* Sticky Notes */}
            {stickyNotes.map(note => (
              <motion.div
                key={note.id}
                className="absolute select-none"
                style={{
                  left: note.x,
                  top: note.y,
                  width: note.w,
                  height: note.h,
                  transform: `rotate(${note.rotation || 0}deg)`,
                }}
                onHoverStart={() => setHoveredSticky(note.id)}
                onHoverEnd={() => setHoveredSticky(null)}
                whileHover={{ scale: 1.04, zIndex: 10 }}
                transition={{ duration: 0.15 }}
              >
                <div
                  className="w-full h-full rounded-sm shadow-md flex items-start p-3 relative"
                  style={{
                    backgroundColor: note.color,
                    boxShadow: hoveredSticky === note.id
                      ? '0 8px 25px rgba(0,0,0,0.15)'
                      : '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  <p className="text-[11px] text-[#1a1a2e] leading-relaxed whitespace-pre-wrap break-words">{note.text}</p>
                  {/* Fold effect */}
                  <div className="absolute bottom-0 right-0 w-4 h-4 overflow-hidden">
                    <div
                      className="absolute -bottom-2 -right-2 w-6 h-6 rotate-45"
                      style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Shapes */}
            {shapes.map(shape => (
              <div
                key={shape.id}
                className="absolute flex items-center justify-center"
                style={{ left: shape.x, top: shape.y, width: shape.w, height: shape.h }}
              >
                {shape.type === 'rounded-rect' && (
                  <div
                    className="w-full h-full rounded-lg flex items-center justify-center border-2"
                    style={{ backgroundColor: shape.fill, borderColor: shape.stroke }}
                  >
                    <span className="text-[10px] font-medium text-[#1a1a2e] text-center px-2">{shape.text}</span>
                  </div>
                )}
                {shape.type === 'diamond' && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div
                      className="absolute inset-2 rotate-45 rounded-sm border-2"
                      style={{ backgroundColor: shape.fill, borderColor: shape.stroke }}
                    />
                    <span className="relative z-10 text-[9px] font-medium text-[#1a1a2e] text-center">{shape.text}</span>
                  </div>
                )}
                {shape.type === 'circle' && (
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center border-2"
                    style={{ backgroundColor: shape.fill, borderColor: shape.stroke }}
                  >
                    <span className="text-[10px] font-medium text-[#1a1a2e] text-center">{shape.text}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Text items */}
            {textItems.map(t => (
              <div
                key={t.id}
                className="absolute"
                style={{ left: t.x, top: t.y, fontSize: t.fontSize, color: t.color, fontWeight: t.fontWeight || 'normal' }}
              >
                {t.text}
              </div>
            ))}

            {/* Collaborator cursors */}
            {cursorPositions.map((cursor, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none z-30"
                animate={{ x: cursor.x, y: cursor.y }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              >
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                  <path
                    d="M1 1L6 18L8.5 11L15 9L1 1Z"
                    fill={cursor.color}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                </svg>
                <div
                  className="absolute left-4 top-4 px-1.5 py-0.5 rounded text-[8px] font-medium text-white whitespace-nowrap"
                  style={{ backgroundColor: cursor.color }}
                >
                  {cursor.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Zoom controls (bottom-right) */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-white dark:bg-[#2a2a2a] rounded-lg shadow-lg border border-[#e5e5e5] dark:border-[#3d3d3d] p-0.5">
          <button
            onClick={zoomOut}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f5f5f5] dark:hover:bg-[#333] text-[#616161] dark:text-[#8a8a8a] transition-colors"
          >
            <ZoomOut size={13} />
          </button>
          <span className="text-[10px] font-medium text-[#616161] dark:text-[#8a8a8a] w-10 text-center">{zoom}%</span>
          <button
            onClick={zoomIn}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f5f5f5] dark:hover:bg-[#333] text-[#616161] dark:text-[#8a8a8a] transition-colors"
          >
            <ZoomIn size={13} />
          </button>
          <div className="w-px h-4 bg-[#e5e5e5] dark:bg-[#3d3d3d]" />
          <button
            onClick={zoomFit}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f5f5f5] dark:hover:bg-[#333] text-[#616161] dark:text-[#8a8a8a] transition-colors"
          >
            <Maximize2 size={13} />
          </button>
        </div>

        {/* Minimap (bottom-left, above toolbar) */}
        <div className="absolute bottom-3 left-16 z-20 w-28 h-20 bg-white dark:bg-[#2a2a2a] rounded-lg shadow-lg border border-[#e5e5e5] dark:border-[#3d3d3d] overflow-hidden p-1">
          <div className="relative w-full h-full bg-[#fafafa] dark:bg-[#1e1e1e] rounded">
            {/* Mini representations of frames */}
            {frames.map(f => (
              <div
                key={f.id}
                className="absolute border border-[#d1d5db] dark:border-[#3d3d3d] rounded-[1px]"
                style={{
                  left: `${(f.x / CANVAS_W) * 100}%`,
                  top: `${(f.y / CANVAS_H) * 100}%`,
                  width: `${(f.w / CANVAS_W) * 100}%`,
                  height: `${(f.h / CANVAS_H) * 100}%`,
                }}
              />
            ))}
            {/* Mini sticky note dots */}
            {stickyNotes.slice(0, 8).map(n => (
              <div
                key={n.id}
                className="absolute w-1 h-1 rounded-[0.5px]"
                style={{
                  left: `${(n.x / CANVAS_W) * 100}%`,
                  top: `${(n.y / CANVAS_H) * 100}%`,
                  backgroundColor: n.color === '#FEF3C7' ? '#F59E0B' : n.color === '#D1FAE5' ? '#10B981' : n.color === '#DBEAFE' ? '#3B82F6' : '#EC4899',
                }}
              />
            ))}
            {/* Viewport indicator */}
            <div
              className="absolute border-2 border-[#4262FF] rounded-[1px] opacity-60"
              style={{
                left: '5%',
                top: '5%',
                width: `${Math.min(90, 90 / scale)}%`,
                height: `${Math.min(90, 90 / scale)}%`,
              }}
            />
          </div>
        </div>

        {/* Lock indicator */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={() => setLocked(!locked)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-all',
              locked
                ? 'bg-[#FEE2E2] dark:bg-[#c4314b]/15 text-[#c4314b] dark:text-[#f47067]'
                : 'bg-[#f5f5f5] dark:bg-[#333] text-[#8a8a8a] hover:text-[#616161]',
            )}
          >
            {locked ? <Lock size={10} /> : <Unlock size={10} />}
            {locked ? 'View only' : 'Can edit'}
          </button>
        </div>

        {/* Timer / presentation mode (top-left) */}
        <div className="absolute top-3 left-16 z-20 flex items-center gap-1.5">
          <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f5f5f5] dark:bg-[#333] hover:bg-[#eee] dark:hover:bg-[#3a3a3a] text-[#616161] dark:text-[#8a8a8a] text-[10px] font-medium transition-colors">
            <Play size={9} />
            Present
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#f5f5f5] dark:bg-[#333] hover:bg-[#eee] dark:hover:bg-[#3a3a3a] text-[#616161] dark:text-[#8a8a8a] text-[10px] font-medium transition-colors">
            <Clock size={9} />
            Timer
          </button>
        </div>
      </div>

      {/* Board Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Objects', value: `${stickyNotes.length + shapes.length}`, sub: 'sticky notes & shapes' },
          { label: 'Collaborators', value: '5', sub: '3 active now' },
          { label: 'Comments', value: '12', sub: '3 unresolved' },
          { label: 'Last edited', value: '2 min ago', sub: 'by Alice Williams' },
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
