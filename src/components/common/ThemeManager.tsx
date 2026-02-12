import { useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { applyTheme } from '../../utils/themeUtils';
import { loadThemeFonts } from '../../utils/fonts';
import { useGame } from '../../store/GameContext';

export function ThemeManager() {
    const { themes, activeThemeId, mode } = useThemeStore();
    const { state } = useGame();

    // Get current room and its potential theme
    const playerEntity = state.world.entities[state.player];
    const currentRoomId = playerEntity?.components.position?.roomId;

    const room = currentRoomId ? state.world.entities[currentRoomId] : undefined;
    const roomThemeId = room?.components.room?.themeId;

    // Determine effective theme
    // 1. If room has a theme AND that theme exists in our store, use it.
    // 2. Otherwise use the global active theme.
    const effectiveThemeId = (roomThemeId && themes.find(t => t.id === roomThemeId))
        ? roomThemeId
        : activeThemeId;

    const activeTheme = themes.find(t => t.id === effectiveThemeId) || themes[0];

    useEffect(() => {
        applyTheme(activeTheme, mode);
        loadThemeFonts(activeTheme);
    }, [activeTheme, mode]);

    // Listen for system preference changes if in system mode
    useEffect(() => {
        if (mode !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            applyTheme(activeTheme, 'system');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [mode, activeTheme]);

    return null;
}

