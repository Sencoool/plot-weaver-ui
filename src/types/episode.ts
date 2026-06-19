export type AiEnrichmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Episode {
  id: string;
  novelId: string;
  title: string;
  content: string;
  order: number;
  isPublished: boolean;
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
}

export interface UpdateEpisodeDto {
  title?: string;
  content?: string;
  order?: number;
  isPublished?: boolean;
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
