import React, { useState, useEffect } from 'react';
import { useGame } from '../../store/GameContext';
import './RoomEditor.css';

export const RoomEditor: React.FC = () => {
    const { state, dispatch } = useGame();
    const currentRoomId = state.player.components.position.currentRoomId;
    const room = state.world.rooms[currentRoomId];

    const [name, setName] = useState(room?.name || '');
    const [description, setDescription] = useState(room?.description || '');

    // Sync state when room changes
    useEffect(() => {
        if (room) {
            setName(room.name);
            setDescription(room.description);
        }
    }, [room]);

    if (!room) return <div>No room found</div>;

    const handleSave = () => {
        dispatch({
            type: 'UPDATE_ROOM',
            payload: {
                roomId: currentRoomId,
                data: {
                    name,
                    description
                }
            }
        });
    };

    return (
        <div className="room-editor">
            <div className="form-group">
                <label>Room Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="editor-input"
                />
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
