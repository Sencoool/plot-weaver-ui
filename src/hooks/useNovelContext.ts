import { useState, useEffect, useCallback } from 'react';
import { novelService } from '../services/novelService';
import type { NovelContext, Character } from '../types/novel';

export interface PinnedItem {
  type: 'character' | 'world' | 'plot' | 'style';
  label: string;
  content: string;
}

interface UseNovelContextResult {
  context: NovelContext | null;
  characters: Character[];
  isLoading: boolean;
  pinnedItems: PinnedItem[];
  togglePin: (item: PinnedItem) => void;
  isPinned: (type: PinnedItem['type'], label: string) => boolean;
  buildPinnedContext: () => string;
  refetch: () => void;
}

export function useNovelContext(novelId: string): UseNovelContextResult {
  const [context, setContext] = useState<NovelContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);

  const fetchContext = useCallback(async () => {
    if (!novelId) return;
    setIsLoading(true);
    try {
      const ctx = await novelService.getContext(novelId);
      setContext(ctx);
    } catch {
      // Context may not exist yet — that's okay
      setContext(null);
    } finally {
      setIsLoading(false);
    }
  }, [novelId]);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

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

  return { context, characters, isLoading, pinnedItems, togglePin, isPinned, buildPinnedContext, refetch: fetchContext };
}
