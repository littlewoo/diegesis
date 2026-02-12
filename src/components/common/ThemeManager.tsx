import { useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { applyTheme } from '../../utils/themeUtils';
import { loadThemeFonts } from '../../utils/fonts';

export function ThemeManager() {
    const { themes, activeThemeId, mode } = useThemeStore();
    const activeTheme = themes.find(t => t.id === activeThemeId) || themes[0];

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
