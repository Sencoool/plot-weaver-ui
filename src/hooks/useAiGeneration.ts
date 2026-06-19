import { useRef, useCallback } from 'react';
import { streamStoryGeneration } from '../services/aiService';
import { useAiStore } from '../store/aiStore';
import { useUiStore } from '../store/uiStore';
import type { StreamGenerationRequest } from '../types/ai';

/**
 * Hook that orchestrates the entire AI generation flow.
 * Reads config from aiStore, calls aiService, and dispatches events back to aiStore.
 *
 * @param novelId - The current novel's UUID
 * @param episodeId - The current episode's UUID (used as seed)
 * @param getEditorContent - Function to get current editor HTML content
 */
export function useAiGeneration(
  novelId: string,
  episodeId: string | undefined,
  getEditorContent: () => string,
) {
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    prompt,
    targetChars,
    temperature,
    startGeneration,
    appendChunk,
    setSegmentProgress,
    finishGeneration,
    setError,
    reset,
  } = useAiStore();

  const { addToast } = useUiStore();

  const generate = useCallback(async () => {
    if (!novelId || !prompt.trim()) return;

    // Abort any ongoing generation
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const currentContent = getEditorContent();
    startGeneration(currentContent);

    const request: StreamGenerationRequest = {
      novelId,
      ...(episodeId ? { episodeId } : {}),
      userMessage: prompt.trim(),
      targetChars,
      temperature,
    };

    try {
      await streamStoryGeneration(
        request,
        (event) => {
          switch (event.type) {
            case 'chunk':
              appendChunk(event.text);
              break;
            case 'segment_start':
              setSegmentProgress(event.segment, event.total);
              break;
            case 'segment_done':
              // no-op: segment_start handles the progress UI
              break;
            case 'done':
              finishGeneration(event.requestId, event.totalChars);
              break;
            case 'error':
              setError(event.message);
              addToast({ type: 'error', title: 'AI Generation Failed', message: event.message });
              break;
          }
        },
        abortControllerRef.current.signal,
      );
    } catch (err) {
      if ((err as Error).name === 'AbortError') return; // User cancelled
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      addToast({ type: 'error', title: 'AI Generation Failed', message });
    }
  }, [
    novelId,
    episodeId,
    prompt,
    targetChars,
    temperature,
    getEditorContent,
    startGeneration,
    appendChunk,
    setSegmentProgress,
    finishGeneration,
    setError,
    addToast,
  ]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    reset();
  }, [reset]);

  return { generate, cancel };
}
