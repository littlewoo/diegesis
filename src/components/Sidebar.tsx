import React from 'react';
import { useGame } from '../store/GameContext';
import { formatTime, getTimeData } from '../engine/time';
import './Sidebar.css';

interface SidebarProps {
    isAdmin: boolean;
    onToggleAdmin: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin, onToggleAdmin }) => {
    const { state } = useGame();
    const timeData = getTimeData(state.time);
    const playerEntity = state.world.entities[state.player];

    if (!playerEntity) return null; // Safe guard

    const stats = playerEntity.components.stats || { strength: 0, health: 0, maxHealth: 0 };

    return (
        <div className="sidebar-content">
            <section className="sidebar-section time-display">
                <h2>Time</h2>
                <div className="time-value">{formatTime(timeData)}</div>
                <div className="time-phase">{timeData.phase.toUpperCase()}</div>
            </section>

            <section className="sidebar-section player-stats">
                <h2>Stats</h2>
                <div className="stat-row">
                    <span>STR</span>
                    <span>{stats.strength}</span>
                </div>
                <div className="stat-row">
                    <span>HP</span>
                    <span>{stats.health} / {stats.maxHealth}</span>
                </div>
            </section>

            <section className="sidebar-section system-menu">
                <button onClick={() => console.log('Save')}>Save Game</button>
                <button onClick={() => console.log('Load')}>Load Game</button>
                <button
                    onClick={onToggleAdmin}
                    style={{
                        color: isAdmin ? 'var(--highlight)' : 'inherit',
                        borderColor: isAdmin ? 'var(--highlight)' : ''
                    }}
                >
                    {isAdmin ? 'Exit Creator Mode' : 'Creator Mode'}
                </button>
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <ThemeToggle />
                </div>
            </section>
        </div>
    );
};

import { useThemeStore } from '../store/themeStore';

const ThemeToggle = () => {
    const { mode, setMode } = useThemeStore();

    return (
        <div style={{ display: 'flex', gap: '5px' }}>
            <button
                onClick={() => setMode('light')}
                style={{ flex: 1, fontSize: '0.8em', opacity: mode === 'light' ? 1 : 0.5 }}
            >
                Light
            </button>
            <button
                onClick={() => setMode('dark')}
                style={{ flex: 1, fontSize: '0.8em', opacity: mode === 'dark' ? 1 : 0.5 }}
            >
                Dark
            </button>
            <button
                onClick={() => setMode('system')}
                style={{ flex: 1, fontSize: '0.8em', opacity: mode === 'system' ? 1 : 0.5 }}
            >
                Auto
            </button>
        </div>
    );
}
