import { create } from 'zustand';
import type { GenerationStatus } from '../types/ai';

interface AiStore {
  // Panel visibility
  isPanelOpen: boolean;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;

  // Prompt
  prompt: string;
  targetChars: number;
  temperature: number;
  setPrompt: (prompt: string) => void;
  setTargetChars: (chars: number) => void;
  setTemperature: (temp: number) => void;

  // Generation status
  status: GenerationStatus;
  error: string | null;

  // Segmented pipeline progress
  currentSegment: number;
  totalSegments: number;

  // Output
  streamedText: string;      // Accumulates SSE chunks in real-time
  generatedText: string;     // Final completed output
  originalText: string;      // Editor content BEFORE generation (for diff/reject)

  // Active request ID (for reference)
  requestId: string | null;

  // Actions called by useAiGeneration hook
  startGeneration: (originalEditorContent: string) => void;
  appendChunk: (text: string) => void;
  setSegmentProgress: (current: number, total: number) => void;
  finishGeneration: (requestId: string, totalChars: number) => void;
  setError: (message: string) => void;
  reset: () => void;
}

const defaultState = {
  isPanelOpen: false,
  prompt: '',
  targetChars: 2500,
  temperature: 0.8,
  status: 'idle' as GenerationStatus,
  error: null,
  currentSegment: 0,
  totalSegments: 0,
  streamedText: '',
  generatedText: '',
  originalText: '',
  requestId: null,
};

export const useAiStore = create<AiStore>((set) => ({
  ...defaultState,

  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),

  setPrompt: (prompt) => set({ prompt }),
  setTargetChars: (targetChars) => set({ targetChars }),
  setTemperature: (temperature) => set({ temperature }),

  startGeneration: (originalEditorContent: string) =>
    set({
      status: 'generating',
      error: null,
      streamedText: '',
      generatedText: '',
      originalText: originalEditorContent,
      currentSegment: 0,
      totalSegments: 0,
      requestId: null,
    }),

  appendChunk: (text: string) =>
    set((s) => ({ streamedText: s.streamedText + text, status: 'streaming' })),

  setSegmentProgress: (current, total) =>
    set({ currentSegment: current, totalSegments: total }),

  finishGeneration: (requestId, _totalChars) =>
    set((s) => ({
      status: 'done',
      generatedText: s.streamedText,
      requestId,
    })),

  setError: (message) =>
    set({ status: 'error', error: message }),

  reset: () => set({ ...defaultState }),
}));
