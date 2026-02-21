import { Button, Slider } from "@/components/ui";
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {  X, Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Film, Download,
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface VideoPlayerViewerProps {
  posterUrl?: string;
  videoUrl?: string;
  name: string;
  size?: string;
  duration?: string;
  onClose: () => void;
}

export function VideoPlayerViewer({
  posterUrl,
  videoUrl,
  name,
  size,
  duration,
  onClose,
}: VideoPlayerViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parse duration string into seconds for mock playback
  const parsedDuration = (() => {
    if (!duration) return 180;
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 180;
  })();

  useEffect(() => {
    setTotalDuration(parsedDuration);
    // Simulate loading
    const t = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(t);
  }, [parsedDuration]);

  // Mock playback simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, resetControlsTimeout]);

  // Keyboard handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        setIsPlaying(p => !p);
      }
      if (e.key === 'ArrowRight') setCurrentTime(t => Math.min(t + 10, totalDuration));
      if (e.key === 'ArrowLeft') setCurrentTime(t => Math.max(t - 10, 0));
      if (e.key === 'm') setIsMuted(m => !m);
      if (e.key === 'f') setIsFullscreen(f => !f);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, totalDuration]);

  const togglePlay = () => {
    setIsPlaying(p => !p);
    resetControlsTimeout();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setCurrentTime(Math.round(pct * totalDuration));
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
      onMouseMove={resetControlsTimeout}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Close button */}
      <Button
        asChild
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-20 h-11 w-11 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
      >
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: showControls ? 1 : 0, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <X size={20} />
        </motion.button>
      </Button>

      {/* Video name + info bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: showControls ? 1 : 0, y: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute top-4 left-4 z-20 flex items-center gap-3"
      >
        <div className="p-2 rounded-lg bg-[#5b5fc7]/20 backdrop-blur-sm">
          <Film size={16} className="text-[#a6a9dc]" />
        </div>
        <div>
          <p className="text-[14px] font-medium text-white">{name}</p>
          <div className="flex items-center gap-2">
            {size && <span className="text-[12px] text-white/60">{size}</span>}
            {duration && (
              <>
                <span className="text-[12px] text-white/40">·</span>
                <span className="text-[12px] text-white/60">{duration}</span>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Video area */}
      <div
        className={cn(
          'relative flex items-center justify-center cursor-pointer select-none',
          isFullscreen ? 'w-full h-full' : 'w-[85vw] max-w-[1200px] aspect-video',
        )}
        onClick={togglePlay}
      >
        {/* Poster / Video frame */}
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={name}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center">
            <Film size={80} className="text-white/10" />
          </div>
        )}

        {/* Dark overlay when controls visible */}
        <div className={cn(
          'absolute inset-0 rounded-xl transition-opacity duration-300',
          showControls ? 'bg-black/30' : 'bg-transparent',
        )} />

        {/* Loading spinner */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Central play/pause button */}
        <AnimatePresence>
          {(showControls || !isPlaying) && isLoaded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center transition-colors',
                isPlaying
                  ? 'bg-white/10 backdrop-blur-sm'
                  : 'bg-[#5b5fc7]/80 backdrop-blur-sm shadow-xl shadow-[#5b5fc7]/30',
              )}>
                {isPlaying ? (
                  <Pause size={32} className="text-white" />
                ) : (
                  <Play size={32} className="text-white ml-1" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom controls bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 10 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div
            className="group/progress relative h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 hover:h-2.5 transition-all"
            onClick={handleSeek}
          >
            {/* Buffered (mock) */}
            <div
              className="absolute inset-y-0 left-0 bg-white/20 rounded-full"
              style={{ width: `${Math.min(progress + 15, 100)}%` }}
            />
            {/* Played */}
            <div
              className="absolute inset-y-0 left-0 bg-[#5b5fc7] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `${progress}%`, marginLeft: '-7px' }}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Button
                onClick={togglePlay}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/10"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </Button>

              {/* Skip buttons */}
              <Button
                onClick={() => setCurrentTime(t => Math.max(t - 10, 0))}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
              >
                <SkipBack size={16} />
              </Button>
              <Button
                onClick={() => setCurrentTime(t => Math.min(t + 10, totalDuration))}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
              >
                <SkipForward size={16} />
              </Button>

              {/* Time */}
              <span className="text-[12px] text-white/80 font-mono tabular-nums ml-1">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Volume */}
              <div className="flex items-center gap-1.5 group/vol">
                <Button
                  onClick={() => setIsMuted(m => !m)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                >
                  {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </Button>
                <div className="w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-200">
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={[isMuted ? 0 : volume]}
                    onValueChange={([v]) => {
                      setVolume(v);
                      if (v > 0) setIsMuted(false);
                    }}
                    className="w-full [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-white/20 [&_[data-slot=slider-range]]:bg-[#5b5fc7] [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-white/60 [&_[data-slot=slider-thumb]]:size-3.5"
                  />
                </div>
              </div>

              {/* Download */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
              >
                <Download size={16} />
              </Button>

              {/* Fullscreen */}
              <Button
                onClick={() => setIsFullscreen(f => !f)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Keyboard shortcuts hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[10px] text-white/30"
      >
        <span>Space: Play/Pause</span>
        <span>← →: Seek 10s</span>
        <span>M: Mute</span>
        <span>F: Fullscreen</span>
        <span>Esc: Close</span>
      </motion.div>
    </motion.div>
  );
}
