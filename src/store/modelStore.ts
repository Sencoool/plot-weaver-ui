import { create } from 'zustand';
import { userModelService } from '../services/userModelService';
import { getErrorMessage } from '../utils/errors';
import type {
  UserModelConfig,
  CreateUserModelDto,
  UpdateUserModelDto,
  TestModelDto,
  TestModelResponse,
} from '../types/model';

interface ModelState {
  models: UserModelConfig[];
  activeModel: UserModelConfig | null;
  isLoading: boolean;
  error: string | null;

  fetchModels: () => Promise<void>;
  createModel: (dto: CreateUserModelDto) => Promise<UserModelConfig>;
  updateModel: (id: string, dto: UpdateUserModelDto) => Promise<void>;
  deleteModel: (id: string) => Promise<void>;
  setDefaultModel: (id: string) => Promise<void>;
  testConnection: (dto: TestModelDto) => Promise<TestModelResponse>;
}

export const useModelStore = create<ModelState>((set) => ({
  models: [],
  activeModel: null,
  isLoading: false,
  error: null,

  fetchModels: async () => {
    set({ isLoading: true, error: null });
    try {
      const models = await userModelService.getAll();
      const active = models.find((m) => m.isDefault) ?? models[0] ?? null;
      set({ models, activeModel: active, isLoading: false });
    } catch (err: unknown) {
      set({
        error: getErrorMessage(err, 'Failed to fetch models'),
        isLoading: false,
      });
    }
  },

  createModel: async (dto: CreateUserModelDto) => {
    set({ isLoading: true, error: null });
    try {
      const created = await userModelService.create(dto);
      const models = await userModelService.getAll();
      const active = models.find((m) => m.isDefault) ?? models[0] ?? null;
      set({ models, activeModel: active, isLoading: false });
      return created;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  updateModel: async (id: string, dto: UpdateUserModelDto) => {
    set({ isLoading: true, error: null });
    try {
      await userModelService.update(id, dto);
      const models = await userModelService.getAll();
      const active = models.find((m) => m.isDefault) ?? models[0] ?? null;
      set({ models, activeModel: active, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  deleteModel: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await userModelService.remove(id);
      const models = await userModelService.getAll();
      const active = models.find((m) => m.isDefault) ?? models[0] ?? null;
      set({ models, activeModel: active, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  setDefaultModel: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await userModelService.setDefault(id);
      const models = await userModelService.getAll();
      const active = models.find((m) => m.id === id) ?? models[0] ?? null;
      set({ models, activeModel: active, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  testConnection: async (dto: TestModelDto) => {
    return userModelService.testConnection(dto);
  },
}));
