import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import type { Entity } from '../../types';
import './EntityEditor.css';
import { EntityListView } from './EntityListView';

interface EntityEditorProps {
    initialFilter?: string | 'all'; // Type loose for now as 'item' | 'npc' etc are strings
    initialRoomFilter?: boolean;
}

export const EntityEditor: React.FC<EntityEditorProps> = ({ initialFilter = 'all', initialRoomFilter = false }) => {
    const { state, dispatch } = useGame();
    // Safe access to player room
    const playerEntity = state.world.entities[state.player];
    const currentRoomId = playerEntity?.components.position?.roomId || 0;

    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [formData, setFormData] = useState<Partial<Entity>>({
        alias: '',
        type: (initialFilter !== 'all' ? initialFilter : 'item') as any,
        components: {
            identity: { name: '', description: '' }
        }
    });
    const [selectedRoomId, setSelectedRoomId] = useState<number>(currentRoomId);

    // Helper to find which room an entity is currently in
    const findEntityRoom = (entityId: number): number | undefined => {
        // We can just check the entity's position component directly!
        const entity = state.world.entities[entityId];
        return entity?.components.position?.roomId;
    };

    const handleEdit = (entity: Entity) => {
        setEditingId(entity.id);
        const components = entity.components || {};

        setFormData({
            id: entity.id,
            alias: entity.alias,
            type: entity.type,
            components: JSON.parse(JSON.stringify(components)) // Deep copy to avoid mutating state
        });

        const room = findEntityRoom(entity.id);
        if (room) setSelectedRoomId(room);
    };

    const handleCreate = () => {
        setEditingId('new');

        let initialType: Entity['type'] = 'item';
        let defaultComponents: any = { identity: { name: '', description: '' } };

        if (initialFilter === 'npc') initialType = 'npc';
        else if (initialFilter === 'room') initialType = 'room';
        else if (initialFilter === 'scenery') initialType = 'prop';
        else if (initialFilter === 'exit') {
            initialType = 'prop';
            defaultComponents.exit = { targetRoomId: 0 };
            defaultComponents.identity.description = 'Exit to...';
        } else if (initialFilter !== 'all') {
            initialType = initialFilter as any; // Fallback
        }

        setFormData({
            id: 0,
            alias: '',
            type: initialType,
            components: defaultComponents
        });
        // Keep current room selection
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({});
    };

    const getName = () => formData.components?.identity?.name;
    const setName = (name: string) => setFormData({
        ...formData,
        components: {
            ...formData.components!,
            identity: { ...formData.components!.identity!, name }
        }
    });

    const setType = (type: any) => setFormData({ ...formData, type });

    const processData = (data: Partial<Entity>): boolean => {
        const name = data.components?.identity?.name;
        if (!name || name.trim() === '') {
            alert('Name cannot be empty.');
            return false;
        }
        if (!data.type) {
            alert('Type cannot be empty.');
            return false;
        }
        if (data.components?.exit) {
            const targetId = data.components.exit.targetRoomId;
            if (targetId === undefined || targetId === null) {
                alert('Exits must have a Target Room.');
                return false;
            }
        }
        return true;
    };

    const handleSave = () => {
        if (!processData(formData)) return;

        // Ensure defaults
        const dataToSave: Partial<Entity> = {
            ...formData,
            components: {
                ...formData.components!,
                // Ensure position is set
                position: {
                    ...(formData.components?.position || {}),
                    roomId: selectedRoomId
                }
            }
        };

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
                        targetContainerId: selectedRoomId
                    }
                });
            }
        } else {
            // Create New
            dispatch({
                type: 'ADD_ENTITY',
                payload: {
                    entity: dataToSave as Entity
                }
            });
        }
        setEditingId(null);
    };

    const handleDelete = (entityId: number) => {
        if (confirm('Are you sure you want to delete this entity?')) {
            dispatch({ type: 'REMOVE_ENTITY', payload: { entityId } });
            setEditingId(null);
        }
    };

    // Exit Specific: Create New Room & Link
    const handleCreateNewRoomAndLink = () => {
        const name = getName();
        if (!name) {
            alert("Please enter a name for the exit first.");
            return;
        }

        // 1. Create New Room
        const newRoomId = state.world.nextId;
        // We assume nextId is correct.

        const newRoom: Entity = {
            id: newRoomId,
            alias: `#${newRoomId}`,
            type: 'room',
            visible: true,
            components: {
                identity: { name: 'New Room', description: 'An empty room.' },
                room: { exits: [] },
                container: { contents: [] },
                position: { roomId: 0 } // Rooms might not be in a container, or in "Universe" (0)? check
            }
        };
        dispatch({ type: 'ADD_ENTITY', payload: { entity: newRoom } });

        // 2. Create This Exit (Forward)
        const forwardExit = {
            ...formData,
            components: {
                ...formData.components,
                identity: { ...formData.components!.identity!, description: `Exit to room ${newRoomId}` },
                exit: { targetRoomId: newRoomId },
                position: { roomId: selectedRoomId }
            }
        };

        dispatch({
            type: 'ADD_ENTITY',
            payload: { entity: forwardExit as Entity }
        });

        // 3. Create Back Exit (Backward)
        // Since we don't know the exact ID generated for forwardExit without waiting, 
        // we just fire the action for backExit.

        // Wait, "backExit" is a separate entity.
        const backExit: Partial<Entity> = {
            alias: `exit_back_${Date.now()}`,
            type: 'prop', // Exits are props
            components: {
                identity: { name: 'Back', description: `Exit to room ${selectedRoomId}` },
                exit: { targetRoomId: selectedRoomId },
                position: { roomId: newRoomId },
                prop: {}
            }
        };

        dispatch({
            type: 'ADD_ENTITY',
            payload: { entity: backExit as Entity }
        });

        setEditingId(null);
    };

    // Helper to get all rooms
    const allRooms = Object.values(state.world.entities).filter(e => e.type === 'room');

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

            <div className="entity-form">
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
                        value={formData.components?.identity?.name || ''}
                        onChange={e => setName(e.target.value)}
                        className="editor-input"
                    />
                </div>

                <div className="form-group">
                    <label>Type</label>
                    <select
                        value={formData.type}
                        onChange={e => setType(e.target.value)}
                        className="editor-input"
                        disabled={editingId === 'new' && initialFilter !== 'all'}
                    >
                        <option value="item">Item</option>
                        <option value="npc">NPC</option>
                        <option value="player">Player</option>
                        <option value="prop">Object / Scenery</option>
                        {/* Exits are Props with ExitComponent. If we are creating an 'exit', it falls under 'prop' type but has extra component. */}
                        <option value="prop">Exit</option>
                    </select>
                    <small>Note: Exits are Props with an Exit Component.</small>
                </div>

                <div className="form-group">
                    <label>Location (Room) {formData.components?.exit && '(Origin)'}</label>
                    <select
                        value={selectedRoomId}
                        onChange={e => setSelectedRoomId(Number(e.target.value))}
                        className="editor-input"
                    >
                        {allRooms.map(room => (
                            <option key={room.id} value={room.id}>
                                {room.components?.identity?.name} (#{room.id})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Exit Target Selector - Only show if already has exit component (or creating Exit) */}
                {formData.components?.exit && (
                    <div className="form-group" style={{ background: 'rgba(var(--highlight-rgb), 0.05)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        <label style={{ color: 'var(--highlight)' }}>Target Room</label>
                        <select
                            value={formData.components?.exit?.targetRoomId || ''}
                            onChange={e => {
                                const val = Number(e.target.value);
                                if (val) {
                                    setFormData({
                                        ...formData,
                                        components: {
                                            ...formData.components!,
                                            exit: { targetRoomId: val }
                                        }
                                    });
                                }
                            }}
                            className="editor-input"
                        >
                            <option value="">-- Select Room --</option>
                            {allRooms.map(room => (
                                <option key={room.id} value={room.id}>
                                    {room.components.identity.name} (#{room.id})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                        value={formData.components?.identity?.description || ''}
                        onChange={e => setFormData({
                            ...formData,
                            components: {
                                ...formData.components!,
                                identity: { ...formData.components!.identity!, description: e.target.value }
                            }
                        })}
                        className="editor-textarea"
                        rows={5}
                    />
                </div>

                {/* Simple JSON editor for components */}
                <div className="form-group full-width">
                    <label>All Components (JSON)</label>
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
            </div>

            <div className="editor-actions">
                <button onClick={handleSave} className="btn-primary">Save Entity</button>
                {formData.components?.exit && editingId === 'new' && (
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
