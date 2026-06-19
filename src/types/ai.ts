export type GenerationStatus = 'idle' | 'generating' | 'streaming' | 'done' | 'error';

/** POST /story-generations/stream request body */
export interface StreamGenerationRequest {
  novelId: string;
  episodeId?: string;
  userMessage: string;
  /** 1–15000 chars. ≤2500 = single-shot, >2500 = segmented */
  targetChars?: number;
  temperature?: number;
}

/** SSE event types from the API */
export type SseEventType = 'chunk' | 'segment_start' | 'segment_done' | 'done' | 'error';

export interface SseChunkEvent {
  type: 'chunk';
  text: string;
}

export interface SseSegmentStartEvent {
  type: 'segment_start';
  segment: number;
  total: number;
}

export interface SseSegmentDoneEvent {
  type: 'segment_done';
  segment: number;
  chars: number;
}

export interface SseDoneEvent {
  type: 'done';
  requestId: string;
  totalChars: number;
}

export interface SseErrorEvent {
  type: 'error';
  message: string;
}

export type SseEvent =
  | SseChunkEvent
  | SseSegmentStartEvent
  | SseSegmentDoneEvent
  | SseDoneEvent
  | SseErrorEvent;

/** Diff token for Before/After view */
export interface DiffToken {
  text: string;
  type: 'equal' | 'insert' | 'delete';
}
