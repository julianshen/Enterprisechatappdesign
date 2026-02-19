import React from 'react';
import { Shield, Lock, Eye } from 'lucide-react';

export type SecurityLevel = 'A' | 'B' | 'C';

const SECURITY_CONFIG: Record<SecurityLevel, {
  label: string;
  description: string;
  icon: React.ReactNode;
  bg: string;
  text: string;
  border: string;
  dot: string;
  iconColor: string;
}> = {
  A: {
    label: 'Level A',
    description: 'Top Secret',
    icon: <Shield size={10} strokeWidth={2.5} />,
    bg: 'bg-[#fce8e6] dark:bg-[#3a1a1a]',
    text: 'text-[#c4314b] dark:text-[#f47067]',
    border: 'border-[#f5c6c2] dark:border-[#5a2a28]',
    dot: 'bg-[#c4314b]',
    iconColor: 'text-[#c4314b] dark:text-[#f47067]',
  },
  B: {
    label: 'Level B',
    description: 'Confidential',
    icon: <Lock size={10} strokeWidth={2.5} />,
    bg: 'bg-[#fff4e5] dark:bg-[#3a2e1a]',
    text: 'text-[#b45309] dark:text-[#f59e0b]',
    border: 'border-[#fde68a] dark:border-[#5a4418]',
    dot: 'bg-[#d97706]',
    iconColor: 'text-[#b45309] dark:text-[#f59e0b]',
  },
  C: {
    label: 'Level C',
    description: 'Internal',
    icon: <Eye size={10} strokeWidth={2.5} />,
    bg: 'bg-[#e6f4ea] dark:bg-[#1a2e1e]',
    text: 'text-[#237b4b] dark:text-[#4ade80]',
    border: 'border-[#b7ddc0] dark:border-[#2a4a30]',
    dot: 'bg-[#237b4b]',
    iconColor: 'text-[#237b4b] dark:text-[#4ade80]',
  },
};

interface SecurityBadgeProps {
  level: SecurityLevel;
  variant?: 'full' | 'compact' | 'dot' | 'icon';
  className?: string;
}

export const SecurityBadge = React.forwardRef<HTMLDivElement, SecurityBadgeProps>(
  ({ level, variant = 'compact', className = '' }, ref) => {
    const config = SECURITY_CONFIG[level];

    if (variant === 'dot') {
      return (
        <div
          ref={ref}
          className={`flex items-center gap-1 ${className}`}
          title={`${config.label} — ${config.description}`}
        >
          <span className={`w-[6px] h-[6px] rounded-full ${config.dot} flex-shrink-0`} />
        </div>
      );
    }

    if (variant === 'icon') {
      return (
        <div
          ref={ref}
          className={`flex items-center justify-center w-[18px] h-[18px] rounded ${config.bg} ${config.iconColor} flex-shrink-0 ${className}`}
          title={`${config.label} — ${config.description}`}
        >
          {config.icon}
        </div>
      );
    }

    if (variant === 'full') {
      return (
        <div
          ref={ref}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${config.bg} ${config.text} ${config.border} ${className}`}
          title={config.description}
        >
          {config.icon}
          <span className="text-[11px] font-semibold tracking-wide">{config.label}</span>
          <span className="text-[10px] opacity-70">· {config.description}</span>
        </div>
      );
    }

    // compact (default)
    return (
      <div
        ref={ref}
        className={`inline-flex items-center gap-1 px-1.5 py-[1px] rounded border ${config.bg} ${config.text} ${config.border} flex-shrink-0 ${className}`}
        title={`${config.label} — ${config.description}`}
      >
        {config.icon}
        <span className="text-[10px] font-semibold tracking-wide">{level}</span>
      </div>
    );
  }
);

SecurityBadge.displayName = 'SecurityBadge';

export { SECURITY_CONFIG };
