import { Badge, Button } from "@/components/ui";
import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from "@/lib/utils";
import type { MessageAttachment } from '../data/mockData';

interface ImageCarouselViewerProps {
  images: MessageAttachment[];
  currentIndex: number;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

export function ImageCarouselViewer({
  images,
  currentIndex,
  onClose,
  onChangeIndex,
}: ImageCarouselViewerProps) {
  const current = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) onChangeIndex(currentIndex - 1);
  }, [hasPrev, currentIndex, onChangeIndex]);

  const handleNext = useCallback(() => {
    if (hasNext) onChangeIndex(currentIndex + 1);
  }, [hasNext, currentIndex, onChangeIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handlePrev, handleNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      {/* ─── Top bar ─── */}
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Badge
            variant="secondary"
            className="px-2.5 py-1 rounded-md bg-white/10 text-white/70 text-xs font-medium tabular-nums border-white/10"
          >
            {currentIndex + 1} / {images.length}
          </Badge>
          <div className="min-w-0">
            <p className="text-sm text-white truncate">{current?.name}</p>
            {current?.size && (
              <p className="text-[11px] text-white/50">{current.size}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {current?.url && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/10"
              title="Download"
            >
              <a href={current.url} download>
                <Download size={18} />
              </a>
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      {/* ─── Main image area ─── */}
      <div
        className="flex-1 relative flex items-center justify-center px-16 py-4 min-h-0"
        onClick={e => e.stopPropagation()}
      >
        {/* Prev button */}
        {hasPrev && (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-sm transition-all border border-white/10 hover:border-white/20 shadow-lg"
            onClick={handlePrev}
          >
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
            >
              <ChevronLeft size={24} />
            </motion.button>
          </Button>
        )}

        {/* Next button */}
        {hasNext && (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-sm transition-all border border-white/10 hover:border-white/20 shadow-lg"
            onClick={handleNext}
          >
            <motion.button
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
            >
              <ChevronRight size={24} />
            </motion.button>
          </Button>
        )}

        {/* Image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={current?.id || currentIndex}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            src={current?.thumbnailUrl || current?.url}
            alt={current?.name}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none"
            draggable={false}
          />
        </AnimatePresence>
      </div>

      {/* ─── Thumbnail strip ─── */}
      {images.length > 1 && (
        <div
          className="shrink-0 flex items-center justify-center gap-2 px-5 py-3"
          onClick={e => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <Button
              key={img.id}
              asChild
              variant="ghost"
              size="icon"
              className={cn(
                'w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 relative p-0',
                idx === currentIndex
                  ? 'border-[#5b5fc7] ring-2 ring-[#5b5fc7]/30 shadow-lg shadow-[#5b5fc7]/20'
                  : 'border-white/10 hover:border-white/30 opacity-50 hover:opacity-80',
              )}
              onClick={() => onChangeIndex(idx)}
            >
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={img.thumbnailUrl || img.url}
                  alt={img.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                {idx === currentIndex && (
                  <motion.div
                    layoutId="carousel-indicator"
                    className="absolute inset-0 border-2 border-[#5b5fc7] rounded-lg"
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  />
                )}
              </motion.button>
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
