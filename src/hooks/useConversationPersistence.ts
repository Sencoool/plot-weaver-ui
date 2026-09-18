import { useEffect, useCallback, useRef } from 'react';
import { useAiStore } from '../store/aiStore';
import { conversationService } from '../services/conversationService';
import type { ChatMessage } from '../types/ai';

const LS_PREFIX = 'pw_conv_';
const MAX_STORED = 50;

/**
 * Phase E: Persists AI conversation history.
 *
 * - When episodeId is known (existing episode): loads from server API and
 *   syncs every new message to the server automatically.
 * - When episodeId is undefined (new episode): falls back to localStorage.
 * - Exposes clearAndPersist() to wipe history from both stores.
 */
export function useConversationPersistence(episodeId: string | undefined) {
  const messages = useAiStore((s) => s.messages);
  const clearConversation = useAiStore((s) => s.clearConversation);
  const prevCountRef = useRef(0);
  const loadedForRef = useRef<string | undefined>(undefined);

  // ── Load conversation from server (or localStorage for new episodes) ──────
  useEffect(() => {
    if (!episodeId) return;
    if (loadedForRef.current === episodeId) return; // already loaded

    loadedForRef.current = episodeId;

    conversationService
      .getByEpisode(episodeId)
      .then((msgs) => {
        if (msgs.length === 0) return;
        useAiStore.setState({
          messages: msgs,
          status: 'idle',
          streamingMessageId: null,
        });
        prevCountRef.current = msgs.length;
      })
      .catch(() => {
        // API unavailable — try localStorage fallback
        try {
          const raw = localStorage.getItem(LS_PREFIX + episodeId);
          if (!raw) return;
          const saved = JSON.parse(raw) as ChatMessage[];
          if (!Array.isArray(saved) || saved.length === 0) return;
          const hydrated = saved.map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp),
            status: m.status === 'streaming' ? ('done' as const) : m.status,
          }));
          useAiStore.setState({ messages: hydrated, status: 'idle', streamingMessageId: null });
          prevCountRef.current = hydrated.length;
        } catch {
          // ignore
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId]);

  // ── Append new completed messages to server ───────────────────────────────
  useEffect(() => {
    const prev = prevCountRef.current;
    const curr = messages.length;
    if (curr <= prev || !episodeId) {
      // Keep track of any growth even if we're not persisting
      if (curr !== prev) prevCountRef.current = curr;
      return;
    }

    // Only persist messages that are "done" or "accepted"/"rejected" (not streaming)
    const newMsgs = messages.slice(prev).filter(
      (m) => m.status === 'done' || m.status === 'accepted' || m.status === 'rejected' || m.status === 'error',
    );

    prevCountRef.current = curr;

    for (const msg of newMsgs) {
      conversationService.append(episodeId, msg).catch(() => {
        // Silently fall back — localStorage backup below
      });
    }

    // Always update localStorage as a fallback cache
    try {
      const toSave = messages.slice(-MAX_STORED);
      localStorage.setItem(LS_PREFIX + episodeId, JSON.stringify(toSave));
    } catch {
      // storage full
    }
  }, [episodeId, messages]);

  // ── Clear ─────────────────────────────────────────────────────────────────
  const clearAndPersist = useCallback(() => {
    if (episodeId) {
      conversationService.clear(episodeId).catch(() => {});
      localStorage.removeItem(LS_PREFIX + episodeId);
    }
    prevCountRef.current = 0;
    loadedForRef.current = undefined;
    clearConversation();
  }, [episodeId, clearConversation]);

  return { clearAndPersist };
}