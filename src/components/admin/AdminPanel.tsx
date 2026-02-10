import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { RoomEditor } from './RoomEditor';
import { EntityEditor } from './EntityEditor';
import { ExitEditor } from './ExitEditor';
import { GameMap } from './GameMap';
import './AdminPanel.css';

export const AdminPanel: React.FC = () => {
    const { state, dispatch } = useGame();
    const [activeTab, setActiveTab] = useState<'game' | 'room' | 'entity' | 'exit'>('game');

    const exportWorld = () => {
        const worldDefinition = {
            meta: state.meta || { title: 'Untitled', author: 'Anonymous', version: '0.0.1' },
            rooms: state.world.rooms,
            entities: state.world.entities,
            start: {
                roomId: state.player.components.position.currentRoomId,
                player: {
                    components: state.player.components // Approximate: export current player stats as starting stats
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
            // Self-Replication Strategy:
            // 1. Clone the current document (which works offline/file://)
            const htmlClone = document.documentElement.cloneNode(true) as HTMLElement;

            // 2. Clean the state: Empty the React root so it re-initializes fresh
            const root = htmlClone.querySelector('#root');
            if (root) {
                root.innerHTML = '';
            }

            // 3. Remove existing World Definition if present (to avoid duplicates)
            // Use ID if available, otherwise fallback to strict content check
            const oldScript = htmlClone.querySelector('#diegesis-world-def');
            if (oldScript) {
                oldScript.remove();
            } else {
                // Fallback: cleanup ONLY if we find a script that literally starts with the definition assignment
                // This prevents accidental deletion of the app bundle which *references* the variable
                const scripts = htmlClone.getElementsByTagName('script');
                for (let i = scripts.length - 1; i >= 0; i--) {
                    if (scripts[i].textContent?.trim().startsWith('window.DIEGESIS_WORLD_DEFINITION =')) {
                        scripts[i].remove();
                    }
                }
            }

            // 4. Prepare the new World Definition
            const worldDefinition = {
                meta: state.meta || { title: 'Untitled', author: 'Anonymous', version: '0.0.1' },
                rooms: state.world.rooms,
                entities: state.world.entities,
                start: {
                    roomId: state.player.components.position.currentRoomId,
                    player: {
                        components: state.player.components
                    }
                }
            };

            // 5. Inject the new definition with an ID for future easy removal
            const head = htmlClone.querySelector('head');
            if (head) {
                const script = document.createElement('script');
                script.id = 'diegesis-world-def';
                script.textContent = `window.DIEGESIS_WORLD_DEFINITION = ${JSON.stringify(worldDefinition)};`;
                head.appendChild(script);
            }

            // 6. Serialize and Download
            // We need the DOCTYPE which isn't in outerHTML
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
                        <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button onClick={exportWorld}>Save Source (JSON)</button>
                            <button onClick={publishGame}>Publish (Standalone HTML)</button>
                            {/* Hidden Import (Load Source) for restoration if needed */}
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
                                                if (definition.meta && definition.rooms) {
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
