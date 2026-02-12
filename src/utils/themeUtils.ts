import type { DiegesisTheme, ThemeMode } from '../types/theme';

export const DEFAULT_PRESET_ID = 'diegesis';

export const PRESET_THEMES: DiegesisTheme[] = [
    {
        id: DEFAULT_PRESET_ID,
        name: 'Diegesis',
        isPreset: true,
        fonts: {
            heading: "'Bitter', serif",
            body: "'Lato', sans-serif"
        },
        colors: {
            dark: {
                surface: ['#121212', '#1e1e1e', '#252525'],
                text: ['#e0e0e0', '#a0a0a0', '#666666'],
                accent: ['#ffd700', '#4a9eff', '#ffed4a']
            },
            light: {
                surface: ['#fdfbf7', '#f4f0e6', '#e8e4da'],
                text: ['#1a1a1a', '#4a4a4a', '#8a8a8a'],
                accent: ['#d4af37', '#2196f3', '#c5a000']
            }
        }
    },
    {
        id: 'preset-high-fantasy',
        name: 'High Fantasy',
        isPreset: true,
        fonts: {
            heading: "'Cinzel', serif",
            body: "'Sorts Mill Goudy', serif"
        },
        colors: {
            dark: {
                surface: ['#0a1a2f', '#112240', '#233554'],
                text: ['#ccd6f6', '#8892b0', '#56668c'],
                accent: ['#64ffda', '#ffd700', '#55c1b4']
            },
            light: {
                surface: ['#f8f5f2', '#f0ebe6', '#e6decb'],
                text: ['#2c3e50', '#556677', '#8899aa'],
                accent: ['#e6c200', '#2980b9', '#f39c12']
            }
        }
    },
    {
        id: 'preset-cyberpunk',
        name: 'Cyberpunk',
        isPreset: true,
        fonts: { heading: "'Orbitron', sans-serif", body: "'Roboto', sans-serif" },
        colors: {
            dark: {
                surface: ['#050510', '#121225', '#1e1e35'],
                text: ['#e0e0e0', '#b0b0cc', '#707090'],
                accent: ['#ff00ff', '#00ffff', '#cc00cc']
            },
            light: {
                surface: ['#e0e0e0', '#d0d0d0', '#c0c0c0'],
                text: ['#202020', '#404040', '#606060'],
                accent: ['#ff0055', '#00ccff', '#cc0044']
            }
        }
    },
    {
        id: 'preset-steampunk',
        name: 'Steampunk',
        isPreset: true,
        fonts: { heading: "'Rye', serif", body: "'Lora', serif" },
        colors: {
            dark: {
                surface: ['#2b2118', '#3e3025', '#524032'],
                text: ['#d6c6b2', '#a89885', '#7a6a58'],
                accent: ['#e09f3e', '#cd7f32', '#c68c36']
            },
            light: {
                surface: ['#f4e9d7', '#efe0c6', '#e5d1b1'],
                text: ['#4a3b2a', '#6d5a45', '#8f7b66'],
                accent: ['#d35400', '#b87333', '#e67e22']
            }
        }
    },
    {
        id: 'preset-terminal',
        name: 'Terminal',
        isPreset: true,
        fonts: { heading: "'VT323', monospace", body: "'Fira Code', monospace" },
        colors: {
            dark: {
                surface: ['#000000', '#0a0a0a', '#141414'],
                text: ['#33ff33', '#22cc22', '#119911'],
                accent: ['#33ff33', '#ffff00', '#22bb22']
            },
            light: {
                surface: ['#8bac0f', '#9bbc0f', '#306230'],
                text: ['#0f380f', '#206020', '#306230'],
                accent: ['#0f380f', '#000000', '#1a4a1a']
            }
        }
    },
    {
        id: 'preset-beach',
        name: 'Beach',
        isPreset: true,
        fonts: { heading: "'Poppins', sans-serif", body: "'Open Sans', sans-serif" },
        colors: {
            dark: {
                surface: ['#001f3f', '#003366', '#004080'],
                text: ['#f0e68c', '#e0d699', '#c0b878'],
                accent: ['#ff7f50', '#00bfff', '#ff6347']
            },
            light: {
                surface: ['#fffbf0', '#fff5e0', '#ffeeb0'],
                text: ['#004466', '#006699', '#0088cc'],
                accent: ['#ffcc00', '#ff6b6b', '#ffaa00']
            }
        }
    },
    {
        id: 'preset-national-park',
        name: 'National Park',
        isPreset: true,
        fonts: { heading: "'Bitter', serif", body: "'Merriweather', serif" },
        colors: {
            dark: {
                surface: ['#1a2e1a', '#243b24', '#2e492e'],
                text: ['#e0e0e0', '#b0c0b0', '#8a9a8a'],
                accent: ['#d2691e', '#daa520', '#cd853f']
            },
            light: {
                surface: ['#f0f5f0', '#e0ebe0', '#c8d6c8'],
                text: ['#1a331a', '#2e4a2e', '#456045'],
                accent: ['#ca5c2e', '#e6ae25', '#b64d26']
            }
        }
    },
    {
        id: 'preset-eldritch-void',
        name: 'Eldritch Void',
        isPreset: true,
        fonts: { heading: "'IM Fell English', serif", body: "'IM Fell English', serif" },
        colors: {
            dark: {
                surface: ['#0f0518', '#1a0b2e', '#251145'],
                text: ['#d8bfd8', '#a080b0', '#705080'],
                accent: ['#7fff00', '#ba55d3', '#66cc00']
            },
            light: {
                surface: ['#e6e6fa', '#d8bfd8', '#dda0dd'],
                text: ['#4b0082', '#663399', '#800080'],
                accent: ['#ff00ff', '#8b008b', '#cc00cc']
            }
        }
    },
    {
        id: 'preset-papyrus',
        name: 'Papyrus',
        isPreset: true,
        fonts: { heading: "'Macondo', cursive", body: "'Lato', sans-serif" },
        colors: {
            dark: {
                surface: ['#3e2723', '#4e342e', '#5d4037'],
                text: ['#ffecb3', '#ffe082', '#ffd54f'],
                accent: ['#b71c1c', '#d32f2f', '#c62828']
            },
            light: {
                surface: ['#fff8e1', '#ffecb3', '#ffe082'],
                text: ['#3e2723', '#5d4037', '#795548'],
                accent: ['#b71c1c', '#8d6e63', '#d32f2f']
            }
        }
    }
];

export const DEFAULT_THEME = PRESET_THEMES[0];

export function applyTheme(theme: DiegesisTheme, mode: ThemeMode) {
    const root = document.documentElement;

    // Determine actual mode if system
    const effectiveMode = mode === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : mode;

    const variant = theme.colors[effectiveMode];

    // Fonts
    root.style.setProperty('--font-heading', theme.fonts.heading);
    root.style.setProperty('--font-body', theme.fonts.body);

    // Surface
    root.style.setProperty('--bg-primary', variant.surface[0]);
    root.style.setProperty('--bg-secondary', variant.surface[1]);
    root.style.setProperty('--bg-tertiary', variant.surface[2]);
    root.style.setProperty('--border', variant.surface[2]); // Mapping border to tertiary

    // Text
    root.style.setProperty('--text-primary', variant.text[0]);
    root.style.setProperty('--text-secondary', variant.text[1]);
    root.style.setProperty('--text-muted', variant.text[2]);

    // Accent
    root.style.setProperty('--accent', variant.accent[0]);
    root.style.setProperty('--border-active', variant.accent[0]); // Mapping active border to primary accent
    root.style.setProperty('--highlight', variant.accent[1]);
    root.style.setProperty('--accent-hover', variant.accent[2]);
}
