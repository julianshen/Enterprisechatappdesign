import { useState } from 'react';
import { Table } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Separator } from './ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { cn } from './ui/utils';

const MAX_ROWS = 6;
const MAX_COLS = 6;

interface TableGridPickerProps {
  compact?: boolean;
  iconSize: number;
  onInsert: (rows: number, cols: number) => void;
}

export function TableGridPicker({ compact, iconSize, onInsert }: TableGridPickerProps) {
  const [open, setOpen] = useState(false);
  const [hoverRow, setHoverRow] = useState(0);
  const [hoverCol, setHoverCol] = useState(0);

  const handleSelect = (r: number, c: number) => {
    onInsert(r, c);
    setOpen(false);
    setHoverRow(0);
    setHoverCol(0);
  };

  return (
    <>
      <Separator orientation="vertical" className="mx-1 h-4 bg-[#e1dfdd] dark:bg-[#3d3d3d]" />
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'text-[#616161] dark:text-[#9e9e9e] hover:bg-[#e8e8f8] dark:hover:bg-[#333] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc]',
                  compact ? 'h-7 w-7' : 'h-8 w-8',
                  open && 'bg-[#e8e8f8] dark:bg-[#333] text-[#5b5fc7] dark:text-[#a6a9dc]',
                )}
              >
                <Table size={iconSize} />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          {!open && (
            <TooltipContent side="top" sideOffset={4}>
              Insert table
            </TooltipContent>
          )}
        </Tooltip>

        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={6}
          className="w-auto p-3 bg-white dark:bg-[#2b2b2b] border-[#e1dfdd] dark:border-[#3d3d3d] shadow-xl"
          onMouseLeave={() => { setHoverRow(0); setHoverCol(0); }}
        >
          <p className="text-[11px] font-semibold text-[#616161] dark:text-[#999] mb-2">
            Insert Table
          </p>

          {/* Grid selector */}
          <div className="inline-grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)` }}>
            {Array.from({ length: MAX_ROWS }, (_, r) =>
              Array.from({ length: MAX_COLS }, (_, c) => {
                const isHighlighted = r < hoverRow && c < hoverCol;
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onMouseEnter={() => { setHoverRow(r + 1); setHoverCol(c + 1); }}
                    onClick={() => handleSelect(r + 1, c + 1)}
                    className={cn(
                      'w-[22px] h-[22px] rounded-[3px] border transition-all duration-75',
                      isHighlighted
                        ? 'bg-[#5b5fc7]/20 border-[#5b5fc7]/50 dark:bg-[#5b5fc7]/30 dark:border-[#5b5fc7]/60'
                        : 'bg-[#f5f5f5] dark:bg-[#333] border-[#e1dfdd] dark:border-[#444] hover:border-[#5b5fc7]/30',
                    )}
                  />
                );
              })
            )}
          </div>

          {/* Size label */}
          <p className="text-[11px] text-center mt-2 text-[#8a8a8a] dark:text-[#666] tabular-nums">
            {hoverRow > 0 && hoverCol > 0
              ? <span className="text-[#5b5fc7] dark:text-[#a6a9dc] font-medium">{hoverRow} x {hoverCol}</span>
              : 'Select size'
            }
          </p>
        </PopoverContent>
      </Popover>
    </>
  );
}
