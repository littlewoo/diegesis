import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import type { GameObject, GameObjectType, Room } from '../../types';
import './EntityEditor.css';
import { EntityListView } from './EntityListView';

interface EntityEditorProps {
    initialFilter?: GameObjectType | 'all';
    initialRoomFilter?: boolean;
}

export const EntityEditor: React.FC<EntityEditorProps> = ({ initialFilter = 'all', initialRoomFilter = false }) => {
    const { state, dispatch } = useGame();
    const currentRoomId = state.player.components.position.currentRoomId;

    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [formData, setFormData] = useState<Partial<GameObject>>({
        name: '',
        description: '',
        type: initialFilter !== 'all' ? initialFilter : 'item'
    });
    const [selectedRoomId, setSelectedRoomId] = useState<number>(currentRoomId);

    // Exit specific state (derived from formData or separate? Form data handling is cleaner)
    // We will extract targetRoomId from formData.components.exit manually when rendering/saving

    // Helper to find which room an entity is currently in
    const findEntityRoom = (entityId: number): number | undefined => {
        return Object.values(state.world.rooms).find(room => room.contents.includes(entityId))?.id;
    };

    const handleEdit = (entity: GameObject) => {
        setEditingId(entity.id);
        const scripts = entity.scripts || {};
        const components = entity.components || {};

        setFormData({
            id: entity.id,
            alias: entity.alias,
            name: entity.name,
            description: entity.description,
            type: entity.type,
            components: components,
            scripts: scripts
        });

        const room = findEntityRoom(entity.id);
        if (room) setSelectedRoomId(room);
    };

    const handleCreate = () => {
        setEditingId('new');
        setFormData({
            id: 0,
            alias: '',
            name: '',
            description: '',
            type: initialFilter !== 'all' ? initialFilter : 'item',
            components: {},
            scripts: {}
        });
        // Keep current room selection
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', type: 'item' });
    };

    const processData = (data: Partial<GameObject>): boolean => {
        if (!data.name || data.name.trim() === '') {
            alert('Name cannot be empty.');
            return false;
        }
        if (!data.type) {
            alert('Type cannot be empty.');
            return false;
        }
        if (data.type === 'exit') {
            const targetId = data.components?.exit?.targetRoomId;
            if (targetId === undefined || targetId === '' || targetId === null) {
                alert('Exits must have a Target Room.');
                return false;
            }
        }
        return true;
    };

    const handleSave = () => {
        if (!processData(formData)) return;

        const dataToSave: Partial<GameObject> = { ...formData };

        if (editingId && editingId !== 'new') {
            // Update Entity Properties
            dispatch({
                type: 'UPDATE_ENTITY',
                payload: {
                    entityId: editingId as number,
                    data: dataToSave
                }
            });

            // Handle Movement if room changed
            const currentEntityRoomId = findEntityRoom(editingId as number);
            if (currentEntityRoomId && currentEntityRoomId !== selectedRoomId) {
                dispatch({
                    type: 'MOVE_ENTITY',
                    payload: {
                        entityId: editingId as number,
                        fromRoomId: currentEntityRoomId,
                        toRoomId: selectedRoomId
                    }
                });
            }
        } else {
            // Create New
            dispatch({
                type: 'ADD_ENTITY',
                payload: {
                    entity: dataToSave as GameObject,
                    roomId: selectedRoomId
                }
            });
        }
        setEditingId(null);
    };

    const handleDelete = (entityId: number) => {
        if (confirm('Are you sure you want to delete this entity?')) {
            const roomId = findEntityRoom(entityId);
            if (roomId) {
                dispatch({ type: 'REMOVE_ENTITY', payload: { entityId, roomId } });
                setEditingId(null);
            } else {
                alert("Could not find entity in any room to delete.");
            }
        }
    };

    // Exit Specific: Create New Room & Link
    const handleCreateNewRoomAndLink = () => {
        if (!formData.name) {
            alert("Please enter a name for the exit first.");
            return;
        }

        // 1. Create New Room
        const newRoomId = state.world.nextId;
        // Note: nextId usage here is optimistic prediction. 
        // Real nextId is determined by reducer. But ADD_ROOM uses payload room.id if provided?
        // Let's check Reducer. Usually ADD_ROOM takes room object. 
        // InitialState has hardcoded IDs. 
        // We assume safe to pick nextId from state.

        const newRoom: Room = {
            id: newRoomId,
            alias: `#${newRoomId}`,
            type: 'room',
            name: 'New Room',
            description: 'An empty room.',
            components: {},
            contents: [],
        };
        dispatch({ type: 'ADD_ROOM', payload: { room: newRoom } });

        // 2. Create This Exit (Forward)
        // We use handleSave logic but override targetRoomId
        const forwardExit = {
            ...formData,
            description: `Exit to room ${newRoomId}`,
            components: {
                ...formData.components,
                exit: { targetRoomId: newRoomId },
                position: { currentRoomId: selectedRoomId }
            }
        };

        dispatch({
            type: 'ADD_ENTITY',
            payload: { entity: forwardExit as GameObject, roomId: selectedRoomId }
        });

        // 3. Create Back Exit (Backward)
        // ID prediction for second entity is tricky if we don't know what ID forwardExit got. 
        // Reducer manages IDs. We don't set ID here.

        const backExit = {
            id: 0,
            alias: `exit_back_${Date.now()}`,
            type: 'exit' as const,
            name: 'Back',
            description: `Exit to room ${selectedRoomId}`,
            scripts: {},
            components: {
                exit: { targetRoomId: selectedRoomId },
                position: { currentRoomId: newRoomId } // It is IN the new room
            }
        };
        dispatch({
            type: 'ADD_ENTITY',
            payload: { entity: backExit, roomId: newRoomId }
        });

        setEditingId(null);
    };

    if (!editingId) return (
        <div className="entity-editor">
            <EntityListView
                onEdit={handleEdit}
                onDelete={(id) => handleDelete(Number(id))}
                onCreate={handleCreate}
                currentRoomId={currentRoomId}
                forcedType={initialFilter}
                initialRoomFilter={initialRoomFilter}
            />
        </div>
    );

    return (
        <div className="entity-editor">
            <h2>{editingId === 'new' ? 'Create Entity' : `Editing: ${formData.alias || '#' + formData.id}`}</h2>

            <div className="form-group">
                <label>Alias (ID: {formData.id === 0 ? 'New' : formData.id})</label>
                <input
                    type="text"
                    value={formData.alias || ''}
                    onChange={e => setFormData({ ...formData, alias: e.target.value })}
                    placeholder="(Optional) e.g. 'my_sword'"
                    className="editor-input"
                />
                <small>Leave blank to auto-generate from ID</small>
            </div>

            <div className="form-group">
                <label>Name</label>
                <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="editor-input"
                />
            </div>

            <div className="form-group">
                <label>Type</label>
                <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as GameObjectType })}
                    className="editor-input"
                >
                    <option value="item">Item</option>
                    <option value="npc">NPC</option>
                    <option value="scenery">Scenery</option>
                    <option value="exit">Exit</option>
                </select>
            </div>

            <div className="form-group">
                <label>Location (Room) {formData.type === 'exit' && '(Origin)'}</label>
                <select
                    value={selectedRoomId}
                    onChange={e => setSelectedRoomId(Number(e.target.value))}
                    className="editor-input"
                >
                    {Object.values(state.world.rooms).map(room => (
                        <option key={room.id} value={room.id}>
                            {room.name} (#{room.id})
                        </option>
                    ))}
                </select>
            </div>

            {formData.type === 'exit' && (
                <div className="form-group" style={{ background: 'rgba(var(--highlight-rgb), 0.05)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    <label style={{ color: 'var(--highlight)' }}>Destination (Target Room)</label>
                    <select
                        value={formData.components?.exit?.targetRoomId || ''}
                        onChange={e => {
                            const val = Number(e.target.value);
                            setFormData({
                                ...formData,
                                components: {
                                    ...formData.components,
                                    exit: { targetRoomId: val }
                                }
                            });
                        }}
                        className="editor-input"
                    >
                        <option value="">-- Select Target Room --</option>
                        {Object.values(state.world.rooms).map(room => (
                            <option key={room.id} value={room.id}>
                                {room.name} (#{room.id})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="form-group">
                <label>Description</label>
                <textarea
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="editor-textarea"
                    rows={5}
                />
            </div>

            {/* Simple JSON editor for components */}
            <div className="form-group">
                <label>Components (JSON)</label>
                <textarea
                    value={JSON.stringify(formData.components, null, 2)}
                    onChange={e => {
                        try {
                            const parsed = JSON.parse(e.target.value);
                            setFormData({ ...formData, components: parsed });
                        } catch (err) {
                            // ignore parse errors while typing
                        }
                    }}
                    className="editor-textarea code-font"
                    rows={10}
                />
            </div>

            {/* Scripts JSON editor */}
            <div className="form-group">
                <label>Scripts (JSON)</label>
                <textarea
                    value={JSON.stringify(formData.scripts, null, 2)}
                    onChange={e => {
                        try {
                            const parsed = JSON.parse(e.target.value);
                            setFormData({ ...formData, scripts: parsed });
                        } catch (err) {
                            // ignore parse errors while typing
                        }
                    }}
                    className="editor-textarea code-font"
                    rows={8}
                    placeholder='{ "ON_INTERACT": [ ... ] }'
                />
            </div>

            <div className="editor-actions">
                <button onClick={handleSave} className="btn-primary">Save Entity</button>
                {formData.type === 'exit' && editingId === 'new' && (
                    <button onClick={handleCreateNewRoomAndLink} className="btn-secondary" style={{ borderColor: 'var(--highlight)', color: 'var(--highlight)' }}>
                        Create New Room & Link
                    </button>
                )}
                <button onClick={handleCancel} className="btn-secondary">Cancel</button>
                {editingId !== 'new' && (
                    <button
                        onClick={() => handleDelete(editingId as number)}
                        className="btn-danger"
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
};
