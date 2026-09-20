import api from './api';
import type {
  UserModelConfig,
  CreateUserModelDto,
  UpdateUserModelDto,
  TestModelDto,
  TestModelResponse,
} from '../types/model';

export const userModelService = {
  /** GET /user-models */
  async getAll(): Promise<UserModelConfig[]> {
    const { data } = await api.get<UserModelConfig[]>('/user-models');
    return data;
  },

  /** GET /user-models/:id */
  async getOne(id: string): Promise<UserModelConfig> {
    const { data } = await api.get<UserModelConfig>(`/user-models/${id}`);
    return data;
  },

  /** POST /user-models */
  async create(dto: CreateUserModelDto): Promise<UserModelConfig> {
    const { data } = await api.post<UserModelConfig>('/user-models', dto);
    return data;
  },

  /** PATCH /user-models/:id */
  async update(id: string, dto: UpdateUserModelDto): Promise<UserModelConfig> {
    const { data } = await api.patch<UserModelConfig>(`/user-models/${id}`, dto);
    return data;
  },

  /** DELETE /user-models/:id */
  async remove(id: string): Promise<void> {
    await api.delete(`/user-models/${id}`);
  },

  /** POST /user-models/:id/set-default */
  async setDefault(id: string): Promise<void> {
    await api.post(`/user-models/${id}/set-default`);
  },

  /** POST /user-models/test */
  async testConnection(dto: TestModelDto): Promise<TestModelResponse> {
    const { data } = await api.post<TestModelResponse>('/user-models/test', dto);
    return data;
  },

  /**
   * Probes Ollama running on localhost (browser-side) to discover installed models.
   */
  async probeLocalOllama(baseUrl = 'http://localhost:11434'): Promise<{ success: boolean; models: string[]; error?: string }> {
    try {
      const root = baseUrl.replace(/\/+$/, '');
      const res = await fetch(`${root}/api/tags`);
      if (!res.ok) {
        return { success: false, models: [], error: `HTTP ${res.status}: ${res.statusText}` };
      }
      const json = await res.json() as { models?: Array<{ name: string }> };
      const models = json.models?.map((m) => m.name) ?? [];
      return { success: true, models };
    } catch (err) {
      return {
        success: false,
        models: [],
        error: err instanceof Error ? err.message : 'Cannot reach local Ollama on ' + baseUrl,
      };
    }
  },
};
