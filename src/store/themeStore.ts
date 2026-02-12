import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DiegesisTheme, ThemeMode } from '../types/theme';
import { DEFAULT_THEME, PRESET_THEMES, DEFAULT_PRESET_ID } from '../utils/themeUtils';

interface ThemeState {
    themes: DiegesisTheme[];
    activeThemeId: string;
    mode: ThemeMode;

    // Actions
    setMode: (mode: ThemeMode) => void;
    setActiveTheme: (id: string) => void;
    addTheme: (theme: DiegesisTheme) => void;
    updateTheme: (theme: DiegesisTheme) => void;
    deleteTheme: (id: string) => void;
    getActiveTheme: () => DiegesisTheme;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            themes: PRESET_THEMES,
            activeThemeId: DEFAULT_PRESET_ID,
            mode: 'system',

            setMode: (mode) => set({ mode }),
            setActiveTheme: (id) => set({ activeThemeId: id }),

            addTheme: (theme) => set((state) => ({
                themes: [...state.themes, theme]
            })),

            updateTheme: (updatedTheme) => set((state) => ({
                themes: state.themes.map((t) =>
                    t.id === updatedTheme.id ? updatedTheme : t
                )
            })),

            deleteTheme: (id) => set((state) => ({
                themes: state.themes.filter((t) => t.id !== id),
                // If deleting active theme, revert to default
                activeThemeId: state.activeThemeId === id ? DEFAULT_PRESET_ID : state.activeThemeId
            })),

            getActiveTheme: () => {
                const state = get();
                return state.themes.find(t => t.id === state.activeThemeId) || DEFAULT_THEME;
            }
        }),
        {
            name: 'diegesis-theme-storage',
            merge: (persistedState, currentState) => {
                const persisted = persistedState as ThemeState;

                // Filter out any OLD presets from the persisted state, so we always use the latest code definitions
                const customThemes = (persisted.themes || []).filter(t => !t.isPreset);

                // Combine latest presets + persisted custom themes
                const mergedThemes = [...PRESET_THEMES, ...customThemes];

                const activeExists = mergedThemes.some(t => t.id === persisted.activeThemeId);

                return {
                    ...currentState,
                    ...persisted,
                    themes: mergedThemes,
                    activeThemeId: activeExists ? persisted.activeThemeId : DEFAULT_PRESET_ID
                };
            }
        }
    )
);
