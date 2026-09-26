export type AiEnrichmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Episode {
  id: string;
  novelId: string;
  title: string;
  content: string;
  order: number;
  isPublished: boolean;
  cast: string[];
  aiEnrichmentStatus: AiEnrichmentStatus;
  summary: string | null;
  aiEnrichedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEpisodeDto {
  title: string;
  content: string;
  order?: number;
  isPublished?: boolean;
  cast?: string[];
}

export interface UpdateEpisodeDto {
  title?: string;
  content?: string;
  order?: number;
  isPublished?: boolean;
  cast?: string[];
}

/**
 * A snapshot of an episode taken before the editor overwrote its text.
 * `content` is editor HTML. The API keeps the newest five per episode.
 */
export interface EpisodeRevision {
  id: string;
  episodeId: string;
  title: string;
  content: string;
  order: number;
  cast: string[];
  createdAt: string;
}

/** Returned by POST /novels/:novelId/episodes/upload-content */
export interface UploadContentResponse {
  id: string;
  novelId: string;
  title: string;
  order: number;
  isPublished: boolean;
  aiEnrichmentStatus: AiEnrichmentStatus;
  summary: null;
  aiEnrichedAt: null;
  createdAt: string;
  updatedAt: string;
}