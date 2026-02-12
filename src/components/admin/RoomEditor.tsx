import React, { useState, useEffect } from 'react';
import { useGame } from '../../store/GameContext';
import { useThemeStore } from '../../store/themeStore';
import './RoomEditor.css';

export const RoomEditor: React.FC = () => {
    const { state, dispatch } = useGame();
    const { themes } = useThemeStore();

    // Get Player Entity to find current room
    const playerEntity = state.world.entities[state.player];
    const currentRoomId = playerEntity?.components.position?.roomId;
    const room = currentRoomId ? state.world.entities[currentRoomId] : undefined;

    // Use safe accessors or defaults
    const identity = room?.components.identity || { name: '', description: '' };
    const roomComp = room?.components.room || { themeId: '' };

    const [name, setName] = useState(identity.name);
    const [alias, setAlias] = useState(room?.alias || '');
    const [description, setDescription] = useState(identity.description);
    const [themeId, setThemeId] = useState<string>(roomComp.themeId || '');

    // Sync state when room changes
    useEffect(() => {
        if (room) {
            const identity = room.components.identity || { name: '', description: '' };
            const roomComp = room.components.room || { themeId: '' };
            setName(identity.name);
            setAlias(room.alias);
            setDescription(identity.description);
            setThemeId(roomComp.themeId || '');
        }
    }, [room]);

    if (!room) return <div>No room found</div>;

    const handleSave = () => {
        dispatch({
            type: 'UPDATE_ENTITY',
            payload: {
                entityId: currentRoomId!, // safe because room exists
                data: {
                    alias,
                    components: {
                        identity: {
                            ...room.components.identity, // preserve icon etc
                            name,
                            description
                        },
                        room: {
                            ...room.components.room, // preserve exits etc
                            exits: room.components.room?.exits || [],
                            themeId: themeId || null
                        }
                    }
                }
            }
        });
    };

    return (
        <div className="room-editor">
            <div className="form-group">
                <label>Room Name (ID: {room.id})</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="editor-input"
                />
            </div>
            <div className="form-group">
                <label>Alias</label>
                <input
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    className="editor-input"
                    placeholder="Unique alias (e.g. 'start_room')"
                />
            </div>
            <div className="form-group">
                <label>Theme Override</label>
                <select
                    value={themeId}
                    onChange={(e) => setThemeId(e.target.value)}
                    className="editor-select"
                >
                    <option value="">Default (Global Theme)</option>
                    {themes.map(t => (
                        <option key={t.id} value={t.id}>
                            {t.name} {t.isPreset ? '(Preset)' : ''}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="editor-textarea"
                    rows={5}
                />
            </div>
            <div className="editor-actions">
                <button onClick={handleSave} className="save-btn">Apply Changes</button>
            </div>
        </div>
    );
};

