import { create } from 'zustand';
import { episodeService } from '../services/episodeService';
import type { Episode, CreateEpisodeDto, UpdateEpisodeDto } from '../types/episode';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface EpisodeStore {
  episodes: Episode[];
  activeEpisode: Episode | null;
  saveStatus: SaveStatus;
  isLoading: boolean;
  error: string | null;

  fetchEpisodes: (novelId: string) => Promise<void>;
  fetchEpisode: (id: string) => Promise<void>;
  createEpisode: (novelId: string, dto: CreateEpisodeDto) => Promise<Episode>;
  updateEpisode: (id: string, dto: UpdateEpisodeDto) => Promise<void>;
  deleteEpisode: (id: string) => Promise<void>;
  setActiveEpisode: (episode: Episode | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
  /** Optimistically update episode content locally (before debounced save) */
  updateActiveContent: (content: string) => void;
  clearError: () => void;
}

export const useEpisodeStore = create<EpisodeStore>((set, _get) => ({
  episodes: [],
  activeEpisode: null,
  saveStatus: 'idle',
  isLoading: false,
  error: null,

  fetchEpisodes: async (novelId: string) => {
    set({ isLoading: true, error: null });
    try {
      const episodes = await episodeService.getAllForNovel(novelId);
      set({ episodes });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load episodes' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEpisode: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const episode = await episodeService.getOne(id);
      set({ activeEpisode: episode });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load episode' });
    } finally {
      set({ isLoading: false });
    }
  },

  createEpisode: async (novelId: string, dto: CreateEpisodeDto) => {
    const episode = await episodeService.create(novelId, dto);
    set((state) => ({ episodes: [...state.episodes, episode] }));
    return episode;
  },

  updateEpisode: async (id: string, dto: UpdateEpisodeDto) => {
    set({ saveStatus: 'saving' });
    try {
      const updated = await episodeService.update(id, dto);
      set((state) => ({
        episodes: state.episodes.map((e) => (e.id === id ? updated : e)),
        activeEpisode: state.activeEpisode?.id === id ? updated : state.activeEpisode,
        saveStatus: 'saved',
      }));
    } catch (err) {
      set({
        saveStatus: 'error',
        error: err instanceof Error ? err.message : 'Failed to save',
      });
    }
  },

  deleteEpisode: async (id: string) => {
    await episodeService.remove(id);
    set((state) => ({
      episodes: state.episodes.filter((e) => e.id !== id),
      activeEpisode: state.activeEpisode?.id === id ? null : state.activeEpisode,
    }));
  },

  setActiveEpisode: (episode) => set({ activeEpisode: episode }),
  setSaveStatus: (status) => set({ saveStatus: status }),

  updateActiveContent: (content: string) =>
    set((state) => ({
      activeEpisode: state.activeEpisode
        ? { ...state.activeEpisode, content }
        : null,
      saveStatus: 'idle',
    })),

  clearError: () => set({ error: null }),
}));
