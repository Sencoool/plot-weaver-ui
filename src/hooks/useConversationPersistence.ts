import { useEffect, useCallback, useRef } from 'react';
import { useAiStore } from '../store/aiStore';
import { conversationService } from '../services/conversationService';
import type { ChatMessage } from '../types/ai';

const LS_PREFIX = 'pw_conv_';
const MAX_STORED = 50;

// Exported for reuse by other persistence paths. `export` on a plain const in a
// React Fast Refresh module is fine (non-component export), it only disables
// hot-reloading for this module.
export const PERSISTED_STATUSES = ['done', 'accepted', 'rejected', 'error'] as const;

/**
 * Phase E: Persists AI conversation history.
 *
 * - When episodeId is known (existing episode): loads from the server API and
 *   syncs every finished message to the server automatically.
 * - When episodeId is undefined (new episode, not saved yet): history lives in
 *   memory only until the episode is created and gets an id.
 * - Exposes clearAndPersist() to wipe history from both stores.
 */
export function useConversationPersistence(episodeId: string | undefined) {
  const messages = useAiStore((s) => s.messages);
  const clearConversation = useAiStore((s) => s.clearConversation);
  const loadedForRef = useRef<string | undefined>(undefined);

  // Ids of messages already written to the server for the current episode.
  // Index-based tracking cannot work here: an assistant message is appended
  // while still 'streaming' and only becomes persistable when the stream ends,
  // so any cursor over the array advances past it before it is ever written.
  const persistedIdsRef = useRef<Set<string>>(new Set());
  const persistedForRef = useRef<string | undefined>(undefined);

  const markPersisted = useCallback((msgs: ChatMessage[]) => {
    persistedIdsRef.current = new Set(msgs.map((m) => m.id));
  }, []);

  // ── Load conversation from server (or localStorage cache) ─────────────────
  useEffect(() => {
    if (!episodeId) return;
    if (loadedForRef.current === episodeId) return; // already loaded

    loadedForRef.current = episodeId;
    persistedForRef.current = episodeId;
    persistedIdsRef.current = new Set();

    conversationService
      .getByEpisode(episodeId)
      .then((msgs) => {
        if (msgs.length === 0) return;
        useAiStore.setState({
          messages: msgs,
          status: 'idle',
          streamingMessageId: null,
        });
        markPersisted(msgs);
      })
      .catch(() => {
        // API unavailable — try the localStorage fallback
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
          // These came *from* the cache, so they are not re-uploaded this session.
          markPersisted(hydrated);
        } catch {
          // ignore
        }
      });
  }, [episodeId, markPersisted]);

  // ── Persist finished messages to the server + keep the local cache fresh ──
  useEffect(() => {
    if (!episodeId) return;

    if (persistedForRef.current !== episodeId) {
      persistedForRef.current = episodeId;
      persistedIdsRef.current = new Set();
    }

    const finished = messages.filter((m) =>
      (PERSISTED_STATUSES as readonly string[]).includes(m.status),
    );

    // Upload only what this session has not sent yet
    for (const msg of finished) {
      if (persistedIdsRef.current.has(msg.id)) continue;
      persistedIdsRef.current.add(msg.id);
      conversationService.append(episodeId, msg).catch(() => {
        // Request failed — forget the id so a later render retries it
        persistedIdsRef.current.delete(msg.id);
      });
    }

    // Cache locally as a fallback for API outages. Streaming messages are
    // excluded so a truncated reply is never what gets cached.
    if (finished.length > 0) {
      try {
        localStorage.setItem(
          LS_PREFIX + episodeId,
          JSON.stringify(finished.slice(-MAX_STORED)),
        );
      } catch {
        // storage full
      }
    }
  }, [episodeId, messages]);

  // ── Clear ─────────────────────────────────────────────────────────────────
  const clearAndPersist = useCallback(() => {
    if (episodeId) {
      conversationService.clear(episodeId).catch(() => {});
      localStorage.removeItem(LS_PREFIX + episodeId);
    }
    persistedIdsRef.current = new Set();
    persistedForRef.current = undefined;
    loadedForRef.current = undefined;
    clearConversation();
  }, [episodeId, clearConversation]);

  return { clearAndPersist };
}
