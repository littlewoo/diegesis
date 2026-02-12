export type ColorPalette = [string, string, string]; // 3 colors

export interface ThemeVariant {
    surface: ColorPalette;
    text: ColorPalette;
    accent: ColorPalette;
}

export interface DiegesisTheme {
    id: string;
    name: string;
    isPreset: boolean;
    fonts: {
        heading: string;
        body: string;
    };
    colors: {
        light: ThemeVariant;
        dark: ThemeVariant;
    };
}

export type ThemeMode = 'light' | 'dark' | 'system';
