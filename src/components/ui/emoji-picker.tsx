import { Popover, PopoverTrigger, PopoverContent, Button, Input } from "@/components/ui";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from "@/lib/utils";
import data from '@emoji-mart/data';
import { useI18n } from '@/app/context/I18nContext';

const EMOJI_DATA = data as any;
const EMOJI_CATEGORIES = EMOJI_DATA?.categories ?? [];
const EMOJI_BY_ID = EMOJI_DATA?.emojis ?? {};
const EMOJI_ALL = Object.values(EMOJI_BY_ID) as any[];
const CATEGORY_ICONS: Record<string, string> = {
  'people': '🙂',
  'nature': '🌿',
  'foods': '🍔',
  'activity': '⚽',
  'places': '🌍',
  'objects': '📦',
  'symbols': '❤️',
  'flags': '🏳️',
};
const SKIN_TONES = [
  { key: 'emoji.skin.default', mod: '' },
  { key: 'emoji.skin.light', mod: '🏻' },
  { key: 'emoji.skin.mediumLight', mod: '🏼' },
  { key: 'emoji.skin.medium', mod: '🏽' },
  { key: 'emoji.skin.mediumDark', mod: '🏾' },
  { key: 'emoji.skin.dark', mod: '🏿' },
];
const RECENT_EMOJI_KEY = 'rich_message_recent_emojis';
const FREQUENT_EMOJI_KEY = 'rich_message_frequent_emojis';
const EMOJI_PAGE_SIZE = 20; // 5x4

export function EmojiPickerPopover({
  onSelect,
  trigger,
  side = 'top',
  align = 'start',
  open,
  onOpenChange,
}: {
  onSelect: (emoji: string) => void;
  trigger: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const [emojiQuery, setEmojiQuery] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [frequentMap, setFrequentMap] = useState<Record<string, number>>({});
  const [emojiSort, setEmojiSort] = useState<'recent' | 'frequent'>('recent');
  const [selectedToneIndex, setSelectedToneIndex] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    EMOJI_CATEGORIES[0]?.id ?? '',
  );
  const [emojiPage, setEmojiPage] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_EMOJI_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setRecentEmojis(parsed.filter(Boolean));
      }
      const freq = localStorage.getItem(FREQUENT_EMOJI_KEY);
      if (freq) {
        const parsed = JSON.parse(freq);
        if (parsed && typeof parsed === 'object') setFrequentMap(parsed);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const pushRecentEmoji = useCallback((emoji: string) => {
    setRecentEmojis(prev => {
      const next = [emoji, ...prev.filter(e => e !== emoji)].slice(0, 12);
      try {
        localStorage.setItem(RECENT_EMOJI_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });

    setFrequentMap(prev => {
      const next = { ...prev, [emoji]: (prev[emoji] || 0) + 1 };
      try {
        localStorage.setItem(FREQUENT_EMOJI_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const getEmojiNative = useCallback((emoji: any) => {
    if (!emoji) return '';
    const skins = emoji.skins || [];
    if (skins.length === 0) return emoji.native || '';
    const index = Math.min(Math.max(selectedToneIndex, 0), skins.length - 1);
    return skins[index]?.native || emoji.native || '';
  }, [selectedToneIndex]);

  const filteredEmojis = useCallback(() => {
    if (!emojiQuery) return [];
    const q = emojiQuery.toLowerCase();
    return EMOJI_ALL.filter((e: any) => {
      const name = (e.id || '').toLowerCase();
      const label = (e.name || '').toLowerCase();
      const keywords = (e.keywords || []).join(' ').toLowerCase();
      const emoticons = (e.emoticons || []).join(' ').toLowerCase();
      return (
        name.includes(q) ||
        label.includes(q) ||
        keywords.includes(q) ||
        emoticons.includes(q) ||
        (e.native || '').includes(emojiQuery)
      );
    });
  }, [emojiQuery]);

  const searchResults = emojiQuery ? filteredEmojis() : [];
  const selectedCategory = EMOJI_CATEGORIES.find((c: any) => c.id === selectedCategoryId) || EMOJI_CATEGORIES[0];
  const categoryNameMap: Record<string, string> = {
    people: t('emoji.category.people'),
    nature: t('emoji.category.nature'),
    foods: t('emoji.category.foods'),
    activity: t('emoji.category.activity'),
    places: t('emoji.category.places'),
    objects: t('emoji.category.objects'),
    symbols: t('emoji.category.symbols'),
    flags: t('emoji.category.flags'),
  };
  const categoryEmojis = (selectedCategory?.emojis || [])
    .map((id: string) => EMOJI_BY_ID[id])
    .filter(Boolean);
  const pageCount = Math.max(1, Math.ceil(categoryEmojis.length / EMOJI_PAGE_SIZE));
  const currentPage = Math.min(emojiPage, pageCount - 1);
  const pagedCategoryEmojis = categoryEmojis.slice(
    currentPage * EMOJI_PAGE_SIZE,
    currentPage * EMOJI_PAGE_SIZE + EMOJI_PAGE_SIZE,
  );
  const frequentEmojis = useMemo(() => {
    return Object.entries(frequentMap)
      .sort((a, b) => b[1] - a[1])
      .map(([emoji]) => emoji)
      .slice(0, 12);
  }, [frequentMap]);

  const handlePick = (emoji: string) => {
    onSelect(emoji);
    pushRecentEmoji(emoji);
    onOpenChange?.(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent side={side} align={align} className="w-80 p-2">
        <Input
          value={emojiQuery}
          onChange={e => setEmojiQuery(e.target.value)}
          placeholder={t('emoji.searchPlaceholder')}
          className="h-8 mb-2"
        />

        <div className="flex items-center gap-1.5 mb-2">
          {SKIN_TONES.map((tone, idx) => (
            <Button
              key={tone.key}
              variant="ghost"
              size="icon"
              className={cn('h-7 w-7 text-xs', selectedToneIndex === idx && 'bg-muted')}
              onClick={() => setSelectedToneIndex(idx)}
              title={t(tone.key)}
            >
              {tone.mod ? `👍${tone.mod}` : '👍'}
            </Button>
          ))}
        </div>

        {!emojiQuery && (recentEmojis.length > 0 || frequentEmojis.length > 0) && (
          <>
            <div className="flex items-center justify-between px-1 mb-1.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {emojiSort === 'recent' ? t('emoji.recent') : t('emoji.frequent')}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn('h-6 px-2 text-[10px]', emojiSort === 'recent' && 'bg-muted')}
                  onClick={() => setEmojiSort('recent')}
                >
                  {t('emoji.recent')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn('h-6 px-2 text-[10px]', emojiSort === 'frequent' && 'bg-muted')}
                  onClick={() => setEmojiSort('frequent')}
                >
                  {t('emoji.frequent')}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-1 mb-2">
              {(emojiSort === 'recent' ? recentEmojis : frequentEmojis).map(emoji => (
                <Button
                  key={`recent-${emoji}`}
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-lg"
                  onClick={() => handlePick(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </>
        )}

        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 px-1">{t('emoji.categories')}</p>
        <div className="flex flex-wrap items-center gap-1 pb-2 mb-2 max-w-full border-b border-border">
          {EMOJI_CATEGORIES.map((cat: any) => (
            <Button
              key={cat.id}
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 px-2 text-[11px] whitespace-nowrap shrink-0 gap-1.5',
                selectedCategoryId === cat.id && 'bg-muted'
              )}
              onClick={() => {
                setSelectedCategoryId(cat.id);
                setEmojiPage(0);
              }}
            >
              <span className="text-base">{CATEGORY_ICONS[cat.id] || '⭐'}</span>
              <span>{categoryNameMap[cat.id] || cat.name}</span>
            </Button>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
          {emojiQuery ? t('emoji.results') : (categoryNameMap[selectedCategory?.id] || selectedCategory?.name || t('emoji.title'))}
        </p>
        <div className="grid grid-cols-5 gap-1">
          {(emojiQuery ? searchResults : pagedCategoryEmojis).map((emoji: any) => {
            const out = getEmojiNative(emoji);
            return (
              <Button
                key={`emoji-${emoji.id}`}
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-lg"
                onClick={() => handlePick(out)}
              >
                {out}
              </Button>
            );
          })}
        </div>

        {!emojiQuery && pageCount > 1 && (
          <div className="flex items-center justify-between mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={() => setEmojiPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              {t('emoji.prev')}
            </Button>
            <span className="text-[10px] text-muted-foreground">
              {t('emoji.page', { current: currentPage + 1, total: pageCount })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={() => setEmojiPage(p => Math.min(pageCount - 1, p + 1))}
              disabled={currentPage >= pageCount - 1}
            >
              {t('emoji.next')}
            </Button>
          </div>
        )}

        {emojiQuery && searchResults.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">{t('emoji.noResults')}</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
