import { useState, useEffect, useCallback } from 'react';
import { novelService } from '../services/novelService';
import type { NovelContext, Character } from '../types/novel';

export interface PinnedItem {
  type: 'character' | 'world' | 'plot' | 'style';
  label: string;
  content: string;
}

export interface UseNovelContextResult {
  context: NovelContext | null;
  characters: Character[];
  isLoading: boolean;
  pinnedItems: PinnedItem[];
  togglePin: (item: PinnedItem) => void;
  isPinned: (type: PinnedItem['type'], label: string) => boolean;
  buildPinnedContext: () => string;
  buildEpisodeCastContext: (cast: string[], editorText?: string) => string;
  refetch: () => void;
}

export function useNovelContext(novelId: string): UseNovelContextResult {
  const [context, setContext] = useState<NovelContext | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(novelId));
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);

  // Fetch on mount and whenever the novel changes. State is written from the
  // promise callbacks (never synchronously in the effect body) so mounting does
  // not cascade an extra render; `cancelled` drops responses for a stale novel.
  useEffect(() => {
    if (!novelId) return;

    let cancelled = false;

    novelService
      .getContext(novelId)
      .then((ctx) => { if (!cancelled) setContext(ctx); })
      .catch(() => { if (!cancelled) setContext(null); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [novelId]);

  // Manual re-fetch (used by the context drawer's refresh affordance)
  const refetch = useCallback(() => {
    if (!novelId) return;
    setIsLoading(true);
    novelService
      .getContext(novelId)
      .then(setContext)
      .catch(() => setContext(null))
      .finally(() => setIsLoading(false));
  }, [novelId]);

  // Parse characters (API may return as JSON string)
  const characters: Character[] = (() => {
    if (!context?.characters) return [];
    if (typeof context.characters === 'string') {
      try { return JSON.parse(context.characters as unknown as string); } catch { return []; }
    }
    return context.characters;
  })();

  const togglePin = useCallback((item: PinnedItem) => {
    setPinnedItems((prev) => {
      const exists = prev.some((p) => p.type === item.type && p.label === item.label);
      if (exists) return prev.filter((p) => !(p.type === item.type && p.label === item.label));
      return [...prev, item];
    });
  }, []);

  const isPinned = useCallback(
    (type: PinnedItem['type'], label: string) =>
      pinnedItems.some((p) => p.type === type && p.label === label),
    [pinnedItems],
  );

  const buildPinnedContext = useCallback((): string => {
    if (pinnedItems.length === 0) return '';
    const lines = ['[pinned context]'];
    for (const item of pinnedItems) {
      lines.push(item.label + ': ' + item.content);
    }
    return lines.join('\n');
  }, [pinnedItems]);

  /**
   * Build a context string containing only the characters in `cast`.
   *
   * Fallback behaviour (when cast is empty):
   *   1. Scan editorText for character name occurrences and auto-include matches.
   *   2. If editorText is empty too, include ALL characters (legacy behaviour).
   */
  const buildEpisodeCastContext = useCallback(
    (cast: string[], editorText?: string): string => {
      if (characters.length === 0) return '';

      let selected: Character[];

      if (cast.length > 0) {
        // Explicit cast — only include chosen characters
        const castSet = new Set(cast.map((n) => n.toLowerCase()));
        selected = characters.filter((c) => castSet.has(c.name.toLowerCase()));
      } else if (editorText && editorText.trim().length > 0) {
        // Auto-detect: include characters whose name appears in the episode text
        const lowerText = editorText.toLowerCase();
        selected = characters.filter((c) => lowerText.includes(c.name.toLowerCase()));
      } else {
        // No cast, no text — include all characters
        selected = characters;
      }

      if (selected.length === 0) return '';

      const lines = ['[Episode Characters]'];
      for (const char of selected) {
        const desc = char.description ? ': ' + char.description : '';
        lines.push('- ' + char.name + (char.role ? ' (' + char.role + ')' : '') + desc);
      }
      return lines.join('\n');
    },
    [characters],
  );

  return {
    context,
    characters,
    isLoading,
    pinnedItems,
    togglePin,
    isPinned,
    buildPinnedContext,
    buildEpisodeCastContext,
    refetch,
  };
}