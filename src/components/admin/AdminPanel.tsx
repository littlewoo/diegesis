import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { RoomEditor } from './RoomEditor';
import { EntityEditor } from './EntityEditor';
import { ExitEditor } from './ExitEditor';
import { GameMap } from './GameMap';
import './AdminPanel.css';

export const AdminPanel: React.FC = () => {
    const { state } = useGame();
    const [activeTab, setActiveTab] = useState<'game' | 'room' | 'entity' | 'exit'>('game');

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h3>Creator Tools</h3>
                <div className="admin-tabs">
                    <button
                        className={activeTab === 'game' ? 'active' : ''}
                        onClick={() => setActiveTab('game')}
                    >
                        Game
                    </button>
                    <button
                        className={activeTab === 'room' ? 'active' : ''}
                        onClick={() => setActiveTab('room')}
                    >
                        Room
                    </button>
                    <button
                        className={activeTab === 'entity' ? 'active' : ''}
                        onClick={() => setActiveTab('entity')}
                    >
                        Entities
                    </button>
                    <button
                        className={activeTab === 'exit' ? 'active' : ''}
                        onClick={() => setActiveTab('exit')}
                    >
                        Exits
                    </button>
                </div>
            </div>

            <div className="admin-content">
                {activeTab === 'game' && (
                    <div className="admin-section full-height">
                        <h4>Game Overview & Map</h4>
                        <GameMap />
                    </div>
                )}
                {activeTab === 'room' && (
                    <div className="admin-section">
                        <h4>Edit Current Room</h4>
                        <p>Room ID: {state.player.components.position.currentRoomId}</p>
                        <RoomEditor />
                    </div>
                )}
                {activeTab === 'entity' && (
                    <div className="admin-section">
                        <h4>Manage Entities</h4>
                        <EntityEditor />
                    </div>
                )}
                {activeTab === 'exit' && (
                    <div className="admin-section">
                        <h4>Manage Exits</h4>
                        <ExitEditor />
                    </div>
                )}
            </div>
        </div>
    );
};
