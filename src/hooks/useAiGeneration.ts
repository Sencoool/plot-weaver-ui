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
    cancelGeneration,
  } = useAiStore();

  const { addToast } = useUiStore();

  const generate = useCallback(async () => {
    console.log("🔥 generate() WAS CALLED!", { novelId, episodeId, prompt });

    if (!novelId) {
      addToast({ type: 'error', title: 'Generation blocked', message: 'novelId is missing' });
      return;
    }
    if (!prompt.trim()) {
      addToast({ type: 'error', title: 'Generation blocked', message: 'Prompt is empty' });
      return;
    }

    let currentContent = "";
    try {
      currentContent = getEditorContent();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addToast({ type: 'error', title: 'Failed to get editor content', message });
      return;
    }

    // Abort any ongoing generation
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    console.log("🔥 Calling startGeneration...", currentContent);
    startGeneration(currentContent);

    const request: StreamGenerationRequest = {
      novelId,
      ...(episodeId ? { episodeId } : {}),
      userMessage: prompt.trim(),
      targetChars,
      temperature,
    };

    console.log("🔥 Request payload built:", request);

    try {
      console.log("🔥 Calling streamStoryGeneration API...");
      await streamStoryGeneration(
        request,
        (event) => {
          console.log("🔥 Received event from stream:", event.type);
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
      console.log("🔥 streamStoryGeneration finished successfully");
    } catch (err) {
      console.error("🔥 Error in streamStoryGeneration:", err);
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
    cancelGeneration();
  }, [cancelGeneration]);

  return { generate, cancel };
}
