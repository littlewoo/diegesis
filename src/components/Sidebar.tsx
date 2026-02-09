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
    const { player } = state;
    const stats = player.components.stats;
    const moods = player.components.moods;

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
                    <span>AGI</span>
                    <span>{stats.agility}</span>
                </div>
                <div className="stat-row">
                    <span>INT</span>
                    <span>{stats.intelligence}</span>
                </div>
            </section>

            <section className="sidebar-section player-moods">
                <h2>Moods</h2>
                <div className="stat-row">
                    <span>Health</span>
                    <span>{moods.health}%</span>
                </div>
                <div className="stat-row">
                    <span>Stamina</span>
                    <span>{moods.stamina}%</span>
                </div>
                <div className="stat-row">
                    <span>Morale</span>
                    <span>{moods.morale}%</span>
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
            </section>
        </div>
    );
};
