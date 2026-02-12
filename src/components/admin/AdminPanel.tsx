import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { RoomEditor } from './RoomEditor';
import { EntityEditor } from './EntityEditor';
import { ThemeEditor } from './ThemeEditor';

import { GameMap } from './GameMap';
import { RoomListView } from './RoomListView';
import './AdminPanel.css';

type AdminTab = 'game' | 'current-room' | 'rooms' | 'exits' | 'npc' | 'item' | 'scenery' | 'all';

export const AdminPanel: React.FC = () => {
    const { state, dispatch } = useGame();
    const [activeTab, setActiveTab] = useState<AdminTab>('game');

    const exportWorld = () => {
        const playerEntity = state.world.entities[state.player];
        const worldDefinition = {
            meta: state.meta || { title: 'Untitled', author: 'Anonymous', version: '0.0.1' },
            entities: state.world.entities,
            start: {
                roomId: playerEntity?.components.position?.roomId || 0,
                player: {
                    alias: playerEntity?.alias,
                    type: playerEntity?.type,
                    components: playerEntity?.components
                }
            }
        };

        const blob = new Blob([JSON.stringify(worldDefinition, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(state.meta?.title || 'world').toLowerCase().replace(/\s+/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const publishGame = async () => {
        try {
            const htmlClone = document.documentElement.cloneNode(true) as HTMLElement;
            const root = htmlClone.querySelector('#root');
            if (root) root.innerHTML = '';

            const oldScript = htmlClone.querySelector('#diegesis-world-def');
            if (oldScript) {
                oldScript.remove();
            } else {
                const scripts = htmlClone.getElementsByTagName('script');
                for (let i = scripts.length - 1; i >= 0; i--) {
                    if (scripts[i].textContent?.trim().startsWith('window.DIEGESIS_WORLD_DEFINITION =')) {
                        scripts[i].remove();
                    }
                }
            }

            const playerEntity = state.world.entities[state.player];
            const worldDefinition = {
                meta: state.meta || { title: 'Untitled', author: 'Anonymous', version: '0.0.1' },
                entities: state.world.entities,
                start: {
                    roomId: playerEntity?.components.position?.roomId || 0,
                    player: {
                        alias: playerEntity?.alias,
                        type: playerEntity?.type,
                        components: playerEntity?.components
                    }
                }
            };

            const head = htmlClone.querySelector('head');
            if (head) {
                const script = document.createElement('script');
                script.id = 'diegesis-world-def';
                script.textContent = `window.DIEGESIS_WORLD_DEFINITION = ${JSON.stringify(worldDefinition)};`;
                head.appendChild(script);
            }

            const finalHtml = `<!DOCTYPE html>\n${htmlClone.outerHTML}`;
            const blob = new Blob([finalHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${(state.meta?.title || 'game').toLowerCase().replace(/\s+/g, '-')}.html`;
            a.click();
            URL.revokeObjectURL(url);

        } catch (e) {
            console.error('Publish failed:', e);
            alert('Failed to publish game. See console for details.');
        }
    };

    const renderTabButton = (id: AdminTab, label: string) => (
        <button
            className={activeTab === id ? 'active' : ''}
            onClick={() => setActiveTab(id)}
        >
            {label}
        </button>
    );

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h3>Creator Tools</h3>
                <div className="admin-tabs">
                    {renderTabButton('game', 'Game')}
                    {renderTabButton('current-room', 'Current Room')}
                    {renderTabButton('rooms', 'Rooms')}
                    {renderTabButton('exits', 'Exits')}
                    <div className="tab-separator" style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }}></div>
                    {renderTabButton('npc', 'NPCs')}
                    {renderTabButton('item', 'Items')}
                    {renderTabButton('scenery', 'Objects')}
                    {renderTabButton('all', 'All')}
                </div>
            </div>

            <div className="admin-content">
                {activeTab === 'game' && (
                    <div className="admin-section full-height">
                        <h4>Game Overview</h4>
                        <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button onClick={exportWorld}>Save Source (JSON)</button>
                            <button onClick={publishGame}>Publish (Standalone HTML)</button>
                            <label className="file-upload" style={{ fontSize: '0.8em', opacity: 0.7 }}>
                                Load Source
                                <input
                                    type="file"
                                    accept=".json"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            try {
                                                const definition = JSON.parse(event.target?.result as string);
                                                if (definition.meta && definition.entities) {
                                                    dispatch({ type: 'LOAD_WORLD', payload: { definition } });
                                                } else {
                                                    alert('Invalid World Definition file');
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                alert('Failed to parse JSON');
                                            }
                                        };
                                        reader.readAsText(file);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                        </div>
                        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', paddingBottom: '3rem' }}>
                            <h4 style={{ marginBottom: '1.5rem', paddingLeft: '2rem' }}>Theme Settings</h4>
                            <ThemeEditor />
                        </div>
                    </div>
                )}
                {activeTab === 'current-room' && (
                    <div className="admin-section">
                        <h4>Edit Current Room</h4>
                        <p>Room ID: {state.world.entities[state.player]?.components.position?.roomId}</p>
                        <RoomEditor />
                    </div>
                )}
                {activeTab === 'rooms' && (
                    <div className="admin-section full-height">
                        <h4>All Rooms & Map</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
                            <div style={{ flex: '1', minHeight: '400px' }}>
                                <GameMap />
                            </div>
                            <div style={{ flex: '1', minHeight: '0', overflowY: 'auto' }}>
                                <RoomListView />
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'exits' && (
                    <div className="admin-section">
                        <h4>Manage Exits</h4>
                        <EntityEditor initialFilter="exit" initialRoomFilter={true} />
                    </div>
                )}
                {(activeTab === 'npc' || activeTab === 'item' || activeTab === 'scenery') && (
                    <div className="admin-section">
                        <h4>Manage {activeTab === 'npc' ? 'NPCs' : activeTab === 'item' ? 'Items' : 'Objects'}</h4>
                        <EntityEditor initialFilter={activeTab} initialRoomFilter={true} key={activeTab} />
                    </div>
                )}
                {activeTab === 'all' && (
                    <div className="admin-section">
                        <h4>All Entities</h4>
                        <EntityEditor initialFilter="all" />
                    </div>
                )}
            </div>
        </div>
    );
};
