import { useState } from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, Info, Clock,
} from 'lucide-react';

// ─── Adaptive Card Schema ───

export type ACElement =
  | ACTextBlock
  | ACFactSet
  | ACColumnSet
  | ACTable
  | ACProgressBar
  | ACActionSet
  | ACInputText
  | ACInputChoiceSet
  | ACInputToggle
  | ACSeparator
  | ACContainer
  | ACBadge
  | ACStatusList
  | ACImageRow
  | ACMetricRow;

export interface ACTextBlock {
  type: 'textBlock';
  text: string;
  size?: 'small' | 'medium' | 'large';
  weight?: 'lighter' | 'default' | 'bolder';
  color?: 'default' | 'accent' | 'good' | 'warning' | 'attention' | 'muted';
  wrap?: boolean;
}

export interface ACFactSet {
  type: 'factSet';
  facts: { title: string; value: string }[];
}

export interface ACColumnSet {
  type: 'columnSet';
  columns: { width: string; items: ACElement[] }[];
}

export interface ACTable {
  type: 'table';
  columns: { label: string; width?: string }[];
  rows: { cells: string[]; highlight?: boolean }[];
  striped?: boolean;
}

export interface ACProgressBar {
  type: 'progressBar';
  label: string;
  value: number;
  max: number;
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'red';
  showValue?: boolean;
}

export interface ACActionSet {
  type: 'actionSet';
  actions: ACAction[];
}

export interface ACAction {
  title: string;
  style?: 'default' | 'positive' | 'destructive' | 'accent';
  icon?: string;
}

export interface ACInputText {
  type: 'inputText';
  id: string;
  label: string;
  placeholder?: string;
  isMultiline?: boolean;
}

export interface ACInputChoiceSet {
  type: 'inputChoiceSet';
  id: string;
  label: string;
  choices: { title: string; value: string }[];
  style?: 'compact' | 'expanded';
}

export interface ACInputToggle {
  type: 'inputToggle';
  id: string;
  label: string;
  defaultValue?: boolean;
}

export interface ACSeparator {
  type: 'separator';
}

export interface ACContainer {
  type: 'container';
  style?: 'default' | 'emphasis' | 'accent' | 'good' | 'warning' | 'attention';
  items: ACElement[];
  bleed?: boolean;
}

export interface ACBadge {
  type: 'badge';
  text: string;
  color?: 'green' | 'red' | 'blue' | 'orange' | 'purple' | 'gray' | 'yellow';
}

export interface ACStatusList {
  type: 'statusList';
  items: { label: string; value?: string; status: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'running' }[];
}

export interface ACImageRow {
  type: 'imageRow';
  images: { url: string; label: string; size?: number }[];
}

export interface ACMetricRow {
  type: 'metricRow';
  metrics: { label: string; value: string; change?: string; changeType?: 'up' | 'down' | 'neutral' }[];
}

export interface AdaptiveCardData {
  type: 'AdaptiveCard';
  accentColor?: string;
  body: ACElement[];
}

// ─── Adaptive Card Renderer ───

const statusIcons: Record<string, React.ReactNode> = {
  success: <CheckCircle2 size={13} className="text-[#237b4b] dark:text-[#57ab5a]" />,
  warning: <AlertTriangle size={13} className="text-[#d4820c] dark:text-[#f0b850]" />,
  error: <XCircle size={13} className="text-[#c4314b] dark:text-[#f47067]" />,
  info: <Info size={13} className="text-[#0078d4] dark:text-[#6cb8f6]" />,
  pending: <Clock size={13} className="text-[#8a8a8a] dark:text-[#6d6f78]" />,
  running: <Clock size={13} className="text-[#0078d4] dark:text-[#6cb8f6] animate-spin" />,
};

const statusColors: Record<string, string> = {
  success: 'text-[#237b4b] dark:text-[#57ab5a]',
  warning: 'text-[#d4820c] dark:text-[#f0b850]',
  error: 'text-[#c4314b] dark:text-[#f47067]',
  info: 'text-[#0078d4] dark:text-[#6cb8f6]',
  pending: 'text-[#8a8a8a] dark:text-[#6d6f78]',
  running: 'text-[#0078d4] dark:text-[#6cb8f6]',
};

const badgeColors: Record<string, string> = {
  green: 'bg-[#edf7f0] dark:bg-[#237b4b]/15 text-[#237b4b] dark:text-[#57ab5a] border-[#237b4b]/15',
  red: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15 text-[#c4314b] dark:text-[#f47067] border-[#c4314b]/15',
  blue: 'bg-[#ecf5fe] dark:bg-[#0078d4]/15 text-[#0078d4] dark:text-[#6cb8f6] border-[#0078d4]/15',
  orange: 'bg-[#fef7ec] dark:bg-[#d4820c]/15 text-[#d4820c] dark:text-[#f0b850] border-[#d4820c]/15',
  purple: 'bg-[#f3eef9] dark:bg-[#5b5fc7]/15 text-[#5b5fc7] dark:text-[#a6a9dc] border-[#5b5fc7]/15',
  gray: 'bg-[#f0f0f0] dark:bg-[#3d3d3d] text-[#616161] dark:text-[#b9bbbe] border-[#616161]/15',
  yellow: 'bg-[#fef7ec] dark:bg-[#d4820c]/10 text-[#8a6b15] dark:text-[#f0b850] border-[#d4820c]/15',
};

const progressColors: Record<string, string> = {
  purple: 'bg-[#5b5fc7]',
  blue: 'bg-[#0078d4]',
  green: 'bg-[#237b4b]',
  orange: 'bg-[#d4820c]',
  red: 'bg-[#c4314b]',
};

const containerStyles: Record<string, string> = {
  default: 'bg-transparent',
  emphasis: 'bg-[#f5f5f5] dark:bg-[#1e1f22] rounded-lg p-3',
  accent: 'bg-[#eeeef8] dark:bg-[#5b5fc7]/10 border-l-[3px] border-[#5b5fc7] rounded-r-lg p-3',
  good: 'bg-[#edf7f0] dark:bg-[#237b4b]/10 border-l-[3px] border-[#237b4b] rounded-r-lg p-3',
  warning: 'bg-[#fef7ec] dark:bg-[#d4820c]/10 border-l-[3px] border-[#d4820c] rounded-r-lg p-3',
  attention: 'bg-[#fdf0f2] dark:bg-[#c4314b]/10 border-l-[3px] border-[#c4314b] rounded-r-lg p-3',
};

function ACElementRenderer({ element }: { element: ACElement }) {
  switch (element.type) {
    case 'textBlock':
      return <TextBlockEl el={element} />;
    case 'factSet':
      return <FactSetEl el={element} />;
    case 'columnSet':
      return <ColumnSetEl el={element} />;
    case 'table':
      return <TableEl el={element} />;
    case 'progressBar':
      return <ProgressBarEl el={element} />;
    case 'actionSet':
      return <ActionSetEl el={element} />;
    case 'inputText':
      return <InputTextEl el={element} />;
    case 'inputChoiceSet':
      return <InputChoiceSetEl el={element} />;
    case 'inputToggle':
      return <InputToggleEl el={element} />;
    case 'separator':
      return <div className="h-px bg-[#e1dfdd] dark:bg-[#3d3d3d] my-2" />;
    case 'container':
      return <ContainerEl el={element} />;
    case 'badge':
      return <BadgeEl el={element} />;
    case 'statusList':
      return <StatusListEl el={element} />;
    case 'imageRow':
      return <ImageRowEl el={element} />;
    case 'metricRow':
      return <MetricRowEl el={element} />;
    default:
      return null;
  }
}

// ─── Element Renderers ───

function TextBlockEl({ el }: { el: ACTextBlock }) {
  const sizeClass = {
    small: 'text-[11px]',
    medium: 'text-[13px]',
    large: 'text-[16px]',
  }[el.size || 'medium'];

  const weightClass = {
    lighter: 'font-normal opacity-70',
    default: '',
    bolder: 'font-semibold',
  }[el.weight || 'default'];

  const colorClass = {
    default: 'text-[#242424] dark:text-[#e0e0e0]',
    accent: 'text-[#5b5fc7] dark:text-[#a6a9dc]',
    good: 'text-[#237b4b] dark:text-[#57ab5a]',
    warning: 'text-[#d4820c] dark:text-[#f0b850]',
    attention: 'text-[#c4314b] dark:text-[#f47067]',
    muted: 'text-[#8a8a8a] dark:text-[#6d6f78]',
  }[el.color || 'default'];

  return (
    <p className={`${sizeClass} ${weightClass} ${colorClass} ${el.wrap ? '' : 'truncate'}`}>
      {el.text}
    </p>
  );
}

function FactSetEl({ el }: { el: ACFactSet }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
      {el.facts.map((f, i) => (
        <div key={i} className="contents">
          <span className="text-[12px] text-[#8a8a8a] dark:text-[#6d6f78] font-medium whitespace-nowrap">{f.title}</span>
          <span className="text-[12px] text-[#242424] dark:text-[#e0e0e0] font-medium">{f.value}</span>
        </div>
      ))}
    </div>
  );
}

function ColumnSetEl({ el }: { el: ACColumnSet }) {
  return (
    <div className="flex gap-3">
      {el.columns.map((col, i) => (
        <div key={i} className="space-y-1.5" style={{ flex: col.width === 'auto' ? '0 0 auto' : col.width === 'stretch' ? '1' : `0 0 ${col.width}` }}>
          {col.items.map((item, j) => (
            <ACElementRenderer key={j} element={item} />
          ))}
        </div>
      ))}
    </div>
  );
}

function TableEl({ el }: { el: ACTable }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d]">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="bg-[#f5f5f5] dark:bg-[#1e1f22]">
            {el.columns.map((col, i) => (
              <th
                key={i}
                className="text-left px-3 py-2 text-[#616161] dark:text-[#8a8a8a] font-semibold border-b border-[#e1dfdd] dark:border-[#3d3d3d]"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {el.rows.map((row, i) => (
            <tr
              key={i}
              className={`${row.highlight ? 'bg-[#eeeef8] dark:bg-[#5b5fc7]/5' : el.striped && i % 2 === 1 ? 'bg-[#faf9f8] dark:bg-[#1e1f22]/50' : ''} border-b border-[#f0f0f0] dark:border-[#333] last:border-0`}
            >
              {row.cells.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-[#242424] dark:text-[#e0e0e0]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProgressBarEl({ el }: { el: ACProgressBar }) {
  const pct = Math.round((el.value / el.max) * 100);
  const barColor = progressColors[el.color || 'purple'];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-[#242424] dark:text-[#e0e0e0] font-medium">{el.label}</span>
        {el.showValue !== false && (
          <span className="text-[#8a8a8a] dark:text-[#6d6f78]">{el.value}/{el.max} ({pct}%)</span>
        )}
      </div>
      <div className="h-2 bg-[#e1dfdd] dark:bg-[#3d3d3d] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ActionSetEl({ el }: { el: ACActionSet }) {
  const [clicked, setClicked] = useState<number | null>(null);

  const styleMap: Record<string, string> = {
    default: 'bg-white dark:bg-[#333] border border-[#e1dfdd] dark:border-[#3d3d3d] text-[#242424] dark:text-[#e0e0e0] hover:bg-[#f0f0f0] dark:hover:bg-[#3d3d3d]',
    positive: 'bg-[#237b4b] text-white hover:bg-[#1e6b41] shadow-sm',
    destructive: 'bg-white dark:bg-[#333] border border-[#c4314b]/30 text-[#c4314b] dark:text-[#f47067] hover:bg-[#c4314b]/5',
    accent: 'bg-[#5b5fc7] text-white hover:bg-[#4f52b5] shadow-sm',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {el.actions.map((action, i) => (
        <button
          key={i}
          onClick={() => setClicked(i)}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
            clicked === i
              ? 'bg-[#237b4b] text-white'
              : styleMap[action.style || 'default']
          }`}
        >
          {clicked === i ? '✓ ' : action.icon ? `${action.icon} ` : ''}{clicked === i ? 'Done' : action.title}
        </button>
      ))}
    </div>
  );
}

function InputTextEl({ el }: { el: ACInputText }) {
  const [value, setValue] = useState('');
  return (
    <div className="space-y-1">
      <label className="text-[12px] font-medium text-[#242424] dark:text-[#e0e0e0]">{el.label}</label>
      {el.isMultiline ? (
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={el.placeholder}
          rows={3}
          className="w-full px-2.5 py-1.5 rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#1e1f22] text-[12px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] focus:outline-none focus:ring-1 focus:ring-[#5b5fc7]/50 resize-none transition-all"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={el.placeholder}
          className="w-full px-2.5 py-1.5 rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#1e1f22] text-[12px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] focus:outline-none focus:ring-1 focus:ring-[#5b5fc7]/50 transition-all"
        />
      )}
    </div>
  );
}

function InputChoiceSetEl({ el }: { el: ACInputChoiceSet }) {
  const [selected, setSelected] = useState('');

  if (el.style === 'expanded') {
    return (
      <div className="space-y-1">
        <label className="text-[12px] font-medium text-[#242424] dark:text-[#e0e0e0]">{el.label}</label>
        <div className="space-y-1">
          {el.choices.map((c, i) => (
            <label key={i} className="flex items-center gap-2 text-[12px] text-[#242424] dark:text-[#e0e0e0] cursor-pointer py-0.5">
              <input
                type="radio"
                name={el.id}
                value={c.value}
                checked={selected === c.value}
                onChange={() => setSelected(c.value)}
                className="accent-[#5b5fc7] w-3.5 h-3.5"
              />
              {c.title}
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-[12px] font-medium text-[#242424] dark:text-[#e0e0e0]">{el.label}</label>
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        className="w-full px-2.5 py-1.5 rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] bg-white dark:bg-[#1e1f22] text-[12px] text-[#242424] dark:text-[#e0e0e0] focus:outline-none focus:ring-1 focus:ring-[#5b5fc7]/50 transition-all"
      >
        <option value="">Select...</option>
        {el.choices.map((c, i) => (
          <option key={i} value={c.value}>{c.title}</option>
        ))}
      </select>
    </div>
  );
}

function InputToggleEl({ el }: { el: ACInputToggle }) {
  const [on, setOn] = useState(el.defaultValue ?? false);
  return (
    <label className="flex items-center justify-between cursor-pointer py-0.5">
      <span className="text-[12px] font-medium text-[#242424] dark:text-[#e0e0e0]">{el.label}</span>
      <button
        onClick={() => setOn(!on)}
        className={`w-8 h-[18px] rounded-full transition-colors relative ${on ? 'bg-[#5b5fc7]' : 'bg-[#d1d1d1] dark:bg-[#5a5a5a]'}`}
      >
        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[2px] transition-transform ${on ? 'translate-x-[16px]' : 'translate-x-[2px]'}`} />
      </button>
    </label>
  );
}

function ContainerEl({ el }: { el: ACContainer }) {
  return (
    <div className={containerStyles[el.style || 'default']}>
      <div className="space-y-2">
        {el.items.map((item, i) => (
          <ACElementRenderer key={i} element={item} />
        ))}
      </div>
    </div>
  );
}

function BadgeEl({ el }: { el: ACBadge }) {
  return (
    <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColors[el.color || 'gray']}`}>
      {el.text}
    </span>
  );
}

function StatusListEl({ el }: { el: ACStatusList }) {
  return (
    <div className="space-y-1.5">
      {el.items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          {statusIcons[item.status]}
          <span className="text-[12px] text-[#242424] dark:text-[#e0e0e0] flex-1">{item.label}</span>
          {item.value && (
            <span className={`text-[11px] font-medium ${statusColors[item.status]}`}>{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function ImageRowEl({ el }: { el: ACImageRow }) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {el.images.map((img, i) => (
        <div key={i} className="flex flex-col items-center gap-1 shrink-0">
          <img
            src={img.url}
            alt={img.label}
            className="rounded-full object-cover border-2 border-white dark:border-[#333] shadow-sm"
            style={{ width: img.size || 32, height: img.size || 32 }}
          />
          <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] text-center max-w-[50px] truncate">{img.label}</span>
        </div>
      ))}
    </div>
  );
}

function MetricRowEl({ el }: { el: ACMetricRow }) {
  return (
    <div className="flex gap-4">
      {el.metrics.map((m, i) => (
        <div key={i} className="flex-1 min-w-0">
          <p className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78] uppercase tracking-wider mb-0.5">{m.label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[18px] font-bold text-[#242424] dark:text-[#f0f0f0]">{m.value}</span>
            {m.change && (
              <span className={`text-[11px] font-medium ${
                m.changeType === 'up' ? 'text-[#237b4b] dark:text-[#57ab5a]' :
                m.changeType === 'down' ? 'text-[#c4314b] dark:text-[#f47067]' :
                'text-[#8a8a8a]'
              }`}>
                {m.changeType === 'up' ? '↑' : m.changeType === 'down' ? '↓' : '—'}{m.change}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Card Component ───

export function AdaptiveCard({ card }: { card: AdaptiveCardData }) {
  return (
    <div
      className="bg-white dark:bg-[#2a2a2a] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden shadow-sm mt-2"
      style={card.accentColor ? { borderTop: `3px solid ${card.accentColor}` } : undefined}
    >
      <div className="p-3.5 space-y-2.5">
        {card.body.map((element, i) => (
          <ACElementRenderer key={i} element={element} />
        ))}
      </div>
    </div>
  );
}
