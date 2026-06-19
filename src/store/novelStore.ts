import { create } from 'zustand';
import { novelService } from '../services/novelService';
import type { Novel, CreateNovelDto, UpdateNovelDto, FindNovelsQuery, PaginatedResponse } from '../types/novel';

interface NovelStore {
  novels: Novel[];
  paginationMeta: PaginatedResponse<Novel>['meta'] | null;
  activeNovel: Novel | null;
  isLoading: boolean;
  error: string | null;

  fetchNovels: (query?: FindNovelsQuery) => Promise<void>;
  fetchNovel: (id: string) => Promise<void>;
  createNovel: (dto: CreateNovelDto) => Promise<Novel>;
  updateNovel: (id: string, dto: UpdateNovelDto) => Promise<void>;
  deleteNovel: (id: string) => Promise<void>;
  setActiveNovel: (novel: Novel | null) => void;
  clearError: () => void;
}

export const useNovelStore = create<NovelStore>((set, get) => ({
  novels: [],
  paginationMeta: null,
  activeNovel: null,
  isLoading: false,
  error: null,

  fetchNovels: async (query = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await novelService.getAll(query);
      set({ novels: result.data, paginationMeta: result.meta });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load novels' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchNovel: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const novel = await novelService.getOne(id);
      set({ activeNovel: novel });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load novel' });
    } finally {
      set({ isLoading: false });
    }
  },

  createNovel: async (dto: CreateNovelDto) => {
    const novel = await novelService.create(dto);
    set((state) => ({ novels: [novel, ...state.novels] }));
    return novel;
  },

  updateNovel: async (id: string, dto: UpdateNovelDto) => {
    const updated = await novelService.update(id, dto);
    set((state) => ({
      novels: state.novels.map((n) => (n.id === id ? updated : n)),
      activeNovel: state.activeNovel?.id === id ? updated : state.activeNovel,
    }));
  },

  deleteNovel: async (id: string) => {
    await novelService.remove(id);
    set((state) => ({
      novels: state.novels.filter((n) => n.id !== id),
      activeNovel: state.activeNovel?.id === id ? null : state.activeNovel,
    }));
  },

  setActiveNovel: (novel) => set({ activeNovel: novel }),
  clearError: () => set({ error: null }),
}));
