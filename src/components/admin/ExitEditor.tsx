import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import type { Exit, Room } from '../../types';
import './ExitEditor.css';

export const ExitEditor: React.FC = () => {
    const { state, dispatch } = useGame();
    const currentRoomId = state.player.components.position.currentRoomId;
    const room = state.world.rooms[currentRoomId];

    const [editingId, setEditingId] = useState<string | null>(null);
    const [label, setLabel] = useState('');
    const [targetRoomId, setTargetRoomId] = useState('');

    if (!room) return null;

    const handleEdit = (exit: Exit) => {
        setEditingId(exit.id);
        setLabel(exit.label);
        setTargetRoomId(exit.targetRoomId);
    };

    const handleCancel = () => {
        setEditingId(null);
        setLabel('');
        setTargetRoomId('');
    };

    const handleSave = () => {
        if (!label) return;

        const newExits = room.exits.filter(e => e.id !== editingId);

        if (editingId === 'new') {
            // Create new exit
            const newExit: Exit = {
                id: `exit_${Date.now()}`,
                label,
                targetRoomId: targetRoomId || ''
            };
            newExits.push(newExit);
        } else if (editingId) {
            // Update existing exit
            newExits.push({ id: editingId, label, targetRoomId });
        }

        dispatch({
            type: 'UPDATE_ROOM',
            payload: { roomId: currentRoomId, data: { exits: newExits } }
        });
        handleCancel();
    };

    const handleDelete = (exitId: string) => {
        if (confirm('Remove this exit?')) {
            const newExits = room.exits.filter(e => e.id !== exitId);
            dispatch({
                type: 'UPDATE_ROOM',
                payload: { roomId: currentRoomId, data: { exits: newExits } }
            });
        }
    };

    const handleCreateNewRoom = () => {
        if (!label) return;

        const newRoomId = `room_${Date.now()}`;
        const newRoom: Room = {
            id: newRoomId,
            type: 'room',
            name: 'New Room',
            description: 'An empty room.',
            components: {},
            exits: [{ id: `exit_back`, label: 'Back', targetRoomId: currentRoomId }],
            contents: []
        };

        // Add the new room
        dispatch({ type: 'ADD_ROOM', payload: { room: newRoom } });

        // Add exit to current room
        const newExit: Exit = {
            id: `exit_${Date.now()}`,
            label,
            targetRoomId: newRoomId
        };
        dispatch({
            type: 'UPDATE_ROOM',
            payload: { roomId: currentRoomId, data: { exits: [...room.exits, newExit] } }
        });

        handleCancel();
    };

    const allRoomIds = Object.keys(state.world.rooms);

    return (
        <div className="exit-editor">
            {!editingId && (
                <div className="exit-list">
                    <button className="add-btn" onClick={() => setEditingId('new')}>+ Add Exit</button>
                    {room.exits.map(exit => {
                        const targetRoom = state.world.rooms[exit.targetRoomId];
                        return (
                            <div key={exit.id} className="exit-list-item">
                                <span className="exit-label">{exit.label}</span>
                                <span className="exit-target">→ {targetRoom?.name || exit.targetRoomId}</span>
                                <div className="item-actions">
                                    <button onClick={() => handleEdit(exit)}>Edit</button>
                                    <button onClick={() => handleDelete(exit.id)} className="delete-btn">Del</button>
                                </div>
                            </div>
                        );
                    })}
                    {room.exits.length === 0 && <p className="no-exits">No exits defined.</p>}
                </div>
            )}

            {editingId && (
                <div className="exit-form">
                    <h4>{editingId === 'new' ? 'Add Exit' : 'Edit Exit'}</h4>
                    <div className="form-group">
                        <label>Label</label>
                        <input
                            value={label}
                            onChange={e => setLabel(e.target.value)}
                            placeholder="e.g., Front Door"
                            className="editor-input"
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label>Target Room</label>
                        <select
                            value={targetRoomId}
                            onChange={e => setTargetRoomId(e.target.value)}
                            className="editor-input"
                        >
                            <option value="">-- Select Room --</option>
                            {allRoomIds.filter(id => id !== currentRoomId).map(id => (
                                <option key={id} value={id}>{state.world.rooms[id].name} ({id})</option>
                            ))}
                        </select>
                    </div>
                    <div className="editor-actions">
                        <button onClick={handleSave} className="save-btn">{editingId === 'new' ? 'Add' : 'Save'}</button>
                        {editingId === 'new' && <button onClick={handleCreateNewRoom} className="create-btn">Create New Room & Link</button>}
                        <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};
