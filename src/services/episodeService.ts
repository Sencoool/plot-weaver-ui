import api from './api';
import type {
  Episode,
  CreateEpisodeDto,
  UpdateEpisodeDto,
  UploadContentResponse,
} from '../types/episode';

export const episodeService = {
  /** GET /novels/:novelId/episodes */
  async getAllForNovel(novelId: string): Promise<Episode[]> {
    const { data } = await api.get<Episode[]>(`/novels/${novelId}/episodes`);
    return data;
  },

  /** GET /episodes/:id */
  async getOne(id: string): Promise<Episode> {
    const { data } = await api.get<Episode>(`/episodes/${id}`);
    return data;
  },

  /** POST /novels/:novelId/episodes */
  async create(novelId: string, dto: CreateEpisodeDto): Promise<Episode> {
    const { data } = await api.post<Episode>(`/novels/${novelId}/episodes`, dto);
    return data;
  },

  /**
   * POST /novels/:novelId/episodes/upload-content
   * Uploads a .txt file — returns episode immediately with aiEnrichmentStatus='pending'
   */
  async uploadContent(
    novelId: string,
    file: File,
    title?: string,
    order?: number,
  ): Promise<UploadContentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (order !== undefined) formData.append('order', String(order));

    const { data } = await api.post<UploadContentResponse>(
      `/novels/${novelId}/episodes/upload-content`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },

  /** PATCH /episodes/:id */
  async update(id: string, dto: UpdateEpisodeDto): Promise<Episode> {
    const { data } = await api.patch<Episode>(`/episodes/${id}`, dto);
    return data;
  },

  /** DELETE /episodes/:id — also removes vector chunks */
  async remove(id: string): Promise<void> {
    await api.delete(`/episodes/${id}`);
  },
};
