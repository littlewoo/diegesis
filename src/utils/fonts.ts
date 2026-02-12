import type { DiegesisTheme } from '../types/theme';

export interface FontDefinition {
    name: string;
    family: string;
    type: 'google' | 'system';
    category: 'serif' | 'sans-serif' | 'display' | 'monospace' | 'handwriting';
}

export const FONT_REGISTRY: FontDefinition[] = [
    // Sans Serif
    { name: 'Lato', family: "'Lato', sans-serif", type: 'google', category: 'sans-serif' },
    { name: 'Roboto', family: "'Roboto', sans-serif", type: 'google', category: 'sans-serif' },
    { name: 'Open Sans', family: "'Open Sans', sans-serif", type: 'google', category: 'sans-serif' },
    { name: 'Poppins', family: "'Poppins', sans-serif", type: 'google', category: 'sans-serif' },
    { name: 'Inter', family: "'Inter', sans-serif", type: 'google', category: 'sans-serif' },
    { name: 'Montserrat', family: "'Montserrat', sans-serif", type: 'google', category: 'sans-serif' },
    { name: 'Raleway', family: "'Raleway', sans-serif", type: 'google', category: 'sans-serif' },

    // Serif
    { name: 'Lora', family: "'Lora', serif", type: 'google', category: 'serif' },
    { name: 'Merriweather', family: "'Merriweather', serif", type: 'google', category: 'serif' },
    { name: 'Crimson Text', family: "'Crimson Text', serif", type: 'google', category: 'serif' },
    { name: 'Bitter', family: "'Bitter', serif", type: 'google', category: 'serif' },
    { name: 'Playfair Display', family: "'Playfair Display', serif", type: 'google', category: 'serif' },
    { name: 'Unna', family: "'Unna', serif", type: 'google', category: 'serif' },
    { name: 'Sorts Mill Goudy', family: "'Sorts Mill Goudy', serif", type: 'google', category: 'serif' },
    { name: 'IM Fell English', family: "'IM Fell English', serif", type: 'google', category: 'serif' },

    // Display / Fantasy / Horror
    { name: 'Cinzel', family: "'Cinzel', serif", type: 'google', category: 'display' },
    { name: 'Orbitron', family: "'Orbitron', sans-serif", type: 'google', category: 'display' },
    { name: 'Rye', family: "'Rye', serif", type: 'google', category: 'display' },
    { name: 'Creepster', family: "'Creepster', cursive", type: 'google', category: 'display' },
    { name: 'Butcherman', family: "'Butcherman', cursive", type: 'google', category: 'display' },
    { name: 'Nosifer', family: "'Nosifer', cursive", type: 'google', category: 'display' },
    { name: 'Rubik Beastly', family: "'Rubik Beastly', cursive", type: 'google', category: 'display' },
    { name: 'Metal Mania', family: "'Metal Mania', cursive", type: 'google', category: 'display' },
    { name: 'Papyrus', family: "'Papyrus', fantasy", type: 'system', category: 'display' },
    { name: 'Uncial Antiqua', family: "'Uncial Antiqua', serif", type: 'google', category: 'display' },
    { name: 'Sancreek', family: "'Sancreek', cursive", type: 'google', category: 'display' },
    { name: 'UnifrakturMaguntia', family: "'UnifrakturMaguntia', cursive", type: 'google', category: 'display' },
    { name: 'Babylonica', family: "'Babylonica', cursive", type: 'google', category: 'display' },
    { name: 'Macondo', family: "'Macondo', cursive", type: 'google', category: 'display' },

    // Monospace
    { name: 'Fira Code', family: "'Fira Code', monospace", type: 'google', category: 'monospace' },
    { name: 'VT323', family: "'VT323', monospace", type: 'google', category: 'monospace' },
    { name: 'Courier Prime', family: "'Courier Prime', monospace", type: 'google', category: 'monospace' },
    { name: 'Source Code Pro', family: "'Source Code Pro', monospace", type: 'google', category: 'monospace' },
];

/**
 * Extracts the pure font family name from a CSS definition string.
 * e.g. "'Cinzel', serif" -> "Cinzel"
 */
function getFontNameFromFamily(family: string): string | null {
    const match = family.match(/'([^']+)'/);
    return match ? match[1] : null;
}

/**
 * Dynamically loads Google Fonts required by the current theme.
 * Checks the document head to avoid duplicate links.
 */
export function loadThemeFonts(theme: DiegesisTheme) {
    const fontsToLoad = new Set<string>();

    const checkAndAdd = (fontFamilyWithFallback: string) => {
        const fontName = getFontNameFromFamily(fontFamilyWithFallback);
        if (!fontName) return;

        const fontDef = FONT_REGISTRY.find(f => f.name === fontName);
        if (fontDef) {
            if (fontDef.type === 'google') {
                fontsToLoad.add(fontName);
            }
        } else {
            // If not in registry, assume it's a custom Google Font added by the user
            // We trust the user typed a valid Google Font name
            fontsToLoad.add(fontName);
        }
    };

    checkAndAdd(theme.fonts.heading);
    checkAndAdd(theme.fonts.body);

    if (fontsToLoad.size === 0) return;

    // Construct Google Fonts URL
    // Format: family=Font1:wght@400;700&family=Font2:wght@400;700
    const families = Array.from(fontsToLoad)
        .map(name => `family=${name.replace(/\s+/g, '+')}:wght@400;700`)
        .join('&');

    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    const id = 'diegesis-google-fonts';

    // Update or create link tag
    let link = document.getElementById(id) as HTMLLinkElement;
    if (!link) {
        link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    // Only update if changed to avoid unnecessary reloads
    if (link.href !== href) {
        link.href = href;
    }
}

/**
 * Loads ALL fonts in the registry.
 * Used for the Theme Editor to preview fonts in dropdowns and cards.
 * Batches requests to avoid Google Fonts URL length limits.
 */
export function loadAllRegistryFonts() {
    const googleFonts = FONT_REGISTRY.filter(f => f.type === 'google');
    const BATCH_SIZE = 15; // Conservative batch size to keep URLs reasonable

    for (let i = 0; i < googleFonts.length; i += BATCH_SIZE) {
        const batch = googleFonts.slice(i, i + BATCH_SIZE);
        const families = batch
            .map(f => `family=${f.name.replace(/\s+/g, '+')}:wght@400;700`)
            .join('&');

        const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
        const id = `diegesis-all-fonts-${i / BATCH_SIZE}`;

        let link = document.getElementById(id) as HTMLLinkElement;
        if (!link) {
            link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        if (link.href !== href) {
            link.href = href;
        }
    }
}

