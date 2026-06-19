import api from './api';
import type {
  Novel,
  CreateNovelDto,
  UpdateNovelDto,
  FindNovelsQuery,
  PaginatedResponse,
  NovelContext,
  UpsertNovelContextDto,
} from '../types/novel';

export const novelService = {
  /** GET /novels */
  async getAll(query: FindNovelsQuery = {}): Promise<PaginatedResponse<Novel>> {
    const { data } = await api.get<PaginatedResponse<Novel>>('/novels', { params: query });
    return data;
  },

  /** GET /novels/:id */
  async getOne(id: string): Promise<Novel> {
    const { data } = await api.get<Novel>(`/novels/${id}`);
    return data;
  },

  /** POST /novels */
  async create(dto: CreateNovelDto): Promise<Novel> {
    const { data } = await api.post<Novel>('/novels', dto);
    return data;
  },

  /** PATCH /novels/:id */
  async update(id: string, dto: UpdateNovelDto): Promise<Novel> {
    const { data } = await api.patch<Novel>(`/novels/${id}`, dto);
    return data;
  },

  /** DELETE /novels/:id */
  async remove(id: string): Promise<void> {
    await api.delete(`/novels/${id}`);
  },

  /** GET /novels/:novelId/context */
  async getContext(novelId: string): Promise<NovelContext> {
    const { data } = await api.get<NovelContext>(`/novels/${novelId}/context`);
    return data;
  },

  /** PUT /novels/:novelId/context */
  async upsertContext(novelId: string, dto: UpsertNovelContextDto): Promise<NovelContext> {
    const { data } = await api.put<NovelContext>(`/novels/${novelId}/context`, dto);
    return data;
  },
};
