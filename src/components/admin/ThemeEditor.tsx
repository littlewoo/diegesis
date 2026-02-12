import React from 'react';
import { useThemeStore } from '../../store/themeStore';
import type { DiegesisTheme, ThemeVariant, ColorPalette } from '../../types/theme';
import { FONT_REGISTRY, loadAllRegistryFonts } from '../../utils/fonts';
import './ThemeEditor.css';

export const ThemeEditor: React.FC = () => {
    const { themes, activeThemeId, setActiveTheme, addTheme, deleteTheme, updateTheme } = useThemeStore();

    React.useEffect(() => {
        loadAllRegistryFonts();
    }, []);

    const activeTheme = themes.find(t => t.id === activeThemeId) || themes[0];

    // Helper to create a new theme based on current one
    const handleCloneTheme = () => {
        const newTheme: DiegesisTheme = {
            ...activeTheme,
            id: crypto.randomUUID(),
            name: `${activeTheme.name} (Copy)`,
            isPreset: false,
        };
        addTheme(newTheme);
        setActiveTheme(newTheme.id);
    };

    const handleDeleteTheme = (id: string) => {
        if (confirm('Are you sure you want to delete this theme?')) {
            deleteTheme(id);
        }
    };

    // Custom Font Select Component
    const FontPicker = ({
        label,
        currentFontFamily,
        onChange,
        disabled
    }: {
        label: string;
        currentFontFamily: string;
        onChange: (fontFamily: string) => void;
        disabled: boolean;
    }) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const wrapperRef = React.useRef<HTMLDivElement>(null);

        const currentFont = FONT_REGISTRY.find(f => f.family === currentFontFamily) || FONT_REGISTRY[0];

        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        return (
            <div className="font-picker-wrapper" ref={wrapperRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '300px', position: 'relative' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9em', color: 'var(--text-secondary)' }}>{label}</label>

                <button
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-primary)', // changed from secondary to primary
                        color: 'var(--text-primary)',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        textAlign: 'left',
                        fontFamily: currentFont.family,
                        fontSize: '1em',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <span>{currentFont.name} ({currentFont.category})</span>
                    <span style={{ fontSize: '0.8em', opacity: 0.7 }}>▼</span>
                </button>

                {isOpen && !disabled && (
                    <div className="font-dropdown-list" style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        maxHeight: '60vh',
                        minHeight: '200px',
                        overflowY: 'auto',
                        background: 'var(--bg-secondary)', // ensuring contrast against primary bg
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        zIndex: 100,
                        marginTop: '4px',
                        boxShadow: 'var(--shadow-md)',
                        minWidth: '300px'
                    }}>
                        {FONT_REGISTRY.map(f => (
                            <div
                                key={f.name}
                                onClick={() => {
                                    onChange(f.family);
                                    setIsOpen(false);
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    fontFamily: f.family,
                                    fontSize: '1em',
                                    borderBottom: '1px solid var(--border)',
                                    background: f.family === currentFontFamily ? 'var(--bg-tertiary)' : 'transparent',
                                    color: 'var(--text-primary)' // Explicit color
                                }}
                                className="font-option"
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = f.family === currentFontFamily ? 'var(--bg-tertiary)' : 'transparent'}
                            >
                                {f.name} <span style={{ fontSize: '0.8em', opacity: 0.6 }}>({f.category})</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderColorInput = (
        color: string,
        onChange: (val: string) => void,
        label: string
    ) => (
        <div className="color-input-wrapper" title={label}>
            <input
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
            />
            {/* <span className="color-label">{label}</span> */}
        </div>
    );

    const renderVariantEditor = (
        variant: ThemeVariant,
        onChange: (newVariant: ThemeVariant) => void
    ) => {
        const updatecategory = (
            category: keyof ThemeVariant,
            index: 0 | 1 | 2,
            value: string
        ) => {
            const newPalette = [...variant[category]] as ColorPalette;
            newPalette[index] = value;
            onChange({ ...variant, [category]: newPalette });
        };

        return (
            <div className="variant-grid">
                <div className="grid-labels">
                    <span>Primary</span>
                    <span>Secondary</span>
                    <span>Tertiary (Muted/Border)</span>
                </div>

                <div className="grid-row">
                    <span className="row-label">Surface</span>
                    {variant.surface.map((c, i) => renderColorInput(c, (v) => updatecategory('surface', i as 0 | 1 | 2, v), `Surface ${i + 1}`))}
                </div>

                <div className="grid-row">
                    <span className="row-label">Text</span>
                    {variant.text.map((c, i) => renderColorInput(c, (v) => updatecategory('text', i as 0 | 1 | 2, v), `Text ${i + 1}`))}
                </div>

                <div className="grid-row">
                    <span className="row-label">Accent</span>
                    {variant.accent.map((c, i) => renderColorInput(c, (v) => updatecategory('accent', i as 0 | 1 | 2, v), `Accent ${i + 1}`))}
                </div>
            </div>
        );
    };

    return (
        <div className="theme-editor">
            <div className="theme-list">
                <h3>Installed Themes</h3>
                <div className="theme-cards">
                    {themes.map(theme => (
                        <div
                            key={theme.id}
                            className={`theme-card ${activeThemeId === theme.id ? 'active' : ''}`}
                            onClick={() => setActiveTheme(theme.id)}
                        >
                            <div className="theme-preview" style={{
                                background: theme.colors.dark.surface[0],
                                borderColor: theme.colors.dark.accent[0]
                            }}>
                                <div className="preview-dot" style={{ background: theme.colors.dark.accent[0] }} />
                                <div className="preview-dot" style={{ background: theme.colors.dark.accent[1] }} />
                                <div className="preview-dot" style={{ background: theme.colors.dark.surface[1] }} />
                            </div>
                            <div className="theme-info">
                                <span className="theme-name" style={{ fontFamily: theme.fonts.heading }}>{theme.name}</span>
                                {theme.isPreset && <span className="preset-badge">Preset</span>}
                            </div>
                            {!theme.isPreset && (
                                <button
                                    className="delete-btn-small"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteTheme(theme.id); }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                    <button className="add-theme-btn" onClick={handleCloneTheme}>
                        + New Custom Theme
                    </button>
                </div>
            </div>

            <div className="theme-config">
                <div className="config-header">
                    {activeTheme.isPreset ? (
                        <div className="preset-notice">
                            This is a read-only preset. Clone it to make changes.
                        </div>
                    ) : (
                        <div className="theme-name-input" style={{ maxWidth: '300px' }}>
                            <label>Theme Name</label>
                            <input
                                value={activeTheme.name}
                                onChange={(e) => updateTheme({ ...activeTheme, name: e.target.value })}
                                placeholder="My Awesome Theme"
                            />
                        </div>
                    )}
                </div>

                <div className="font-config-section" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    padding: '0 0 1.5rem 0',
                    borderBottom: '1px solid var(--border)'
                }}>
                    <FontPicker
                        label="Heading Font"
                        currentFontFamily={activeTheme.fonts.heading}
                        onChange={(family) => updateTheme({
                            ...activeTheme,
                            fonts: { ...activeTheme.fonts, heading: family }
                        })}
                        disabled={false} // Fonts are editable even on presets for preview
                    />
                    <FontPicker
                        label="Body Font"
                        currentFontFamily={activeTheme.fonts.body}
                        onChange={(family) => updateTheme({
                            ...activeTheme,
                            fonts: { ...activeTheme.fonts, body: family }
                        })}
                        disabled={false} // Fonts are editable even on presets for preview
                    />

                    {/* Custom Font Input */}
                    <div className="custom-font-input" style={{ paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                fontSize: '0.9em'
                            }}
                            onClick={() => {
                                const fontName = prompt('Enter a Google Font name (e.g. "Pacifico"):');
                                if (fontName) {
                                    // Construct family string. We assume Google Fonts are usually sans-serif fallback if not specified
                                    const family = `'${fontName}', sans-serif`;

                                    // We need to manually inject this into the registry so the loader picks it up?
                                    // Actually, loadThemeFonts extracts the name from the family string string.
                                    // So we just need to update the theme.
                                    // BUT, loadThemeFonts only loads if it finds it in the registry to know it's a google font.
                                    // We should probably add a "custom" type or just handle it.

                                    // For now, let's just update the body font as a test
                                    updateTheme({
                                        ...activeTheme,
                                        fonts: { ...activeTheme.fonts, body: family }
                                    });

                                    // NOTE: This simplistic approach won't Auto-Load the custom font from Google
                                    // because FONT_REGISTRY doesn't know about it.
                                    // We'll need to update fonts.ts to handle arbitrary fonts if requested.
                                }
                            }}
                        >
                            <span style={{ fontSize: '1.2em' }}>+</span> Add Custom Google Font
                        </div>
                    </div>
                </div>

                <div className="variant-editors">
                    <div className="variant-section">
                        <h4>Dark Mode Colors</h4>
                        {activeTheme.isPreset ? (
                            <div className="disabled-overlay" />
                        ) : null}
                        {renderVariantEditor(activeTheme.colors.dark, (newVariant) =>
                            !activeTheme.isPreset && updateTheme({
                                ...activeTheme,
                                colors: { ...activeTheme.colors, dark: newVariant }
                            })
                        )}
                    </div>

                    <div className="variant-section">
                        <h4>Light Mode Colors</h4>
                        {activeTheme.isPreset ? (
                            <div className="disabled-overlay" />
                        ) : null}
                        {renderVariantEditor(activeTheme.colors.light, (newVariant) =>
                            !activeTheme.isPreset && updateTheme({
                                ...activeTheme,
                                colors: { ...activeTheme.colors, light: newVariant }
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
