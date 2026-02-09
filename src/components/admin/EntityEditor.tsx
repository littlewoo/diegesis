import React, { useState } from 'react';
import { useGame } from '../../store/GameContext';
import { getRoomEntities } from '../../engine/entities';
import type { GameObject, GameObjectType } from '../../types';
import './EntityEditor.css';

export const EntityEditor: React.FC = () => {
    const { state, dispatch } = useGame();
    const currentRoomId = state.player.components.position.currentRoomId;
    const entities = getRoomEntities(state, currentRoomId);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<GameObject>>({ name: '', description: '', type: 'item' });

    const handleEdit = (entity: GameObject) => {
        setEditingId(entity.id);
        setFormData({ name: entity.name, description: entity.description, type: entity.type });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', type: 'item' });
    };

    const handleSave = () => {
        if (!formData.name || !formData.type) return;

        if (editingId) {
            dispatch({
                type: 'UPDATE_ENTITY',
                payload: {
                    entityId: editingId,
                    data: formData
                }
            });
        } else {
            const newId = `ent_${Date.now()}`;
            const newEntity: GameObject = {
                id: newId,
                name: formData.name,
                description: formData.description || '',
                type: formData.type as GameObjectType,
                components: {} // Default components depending on type could go here
            };
            dispatch({
                type: 'ADD_ENTITY',
                payload: {
                    entity: newEntity,
                    roomId: currentRoomId
                }
            });
        }
        handleCancel();
    };

    const handleDelete = (entityId: string) => {
        if (confirm('Are you sure you want to delete this entity?')) {
            dispatch({
                type: 'REMOVE_ENTITY',
                payload: { entityId, roomId: currentRoomId }
            });
        }
    };

    return (
        <div className="entity-editor">
            {!editingId && (
                <div className="entity-list">
                    <button className="add-btn" onClick={() => setEditingId('new')}>+ Create New Entity</button>
                    {entities.map(entity => (
                        <div key={entity.id} className="entity-list-item">
                            <span>{entity.name} <small>({entity.type})</small></span>
                            <div className="item-actions">
                                <button onClick={() => handleEdit(entity)}>Edit</button>
                                <button onClick={() => handleDelete(entity.id)} className="delete-btn">Del</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(editingId || editingId === 'new') && (
                <div className="entity-form">
                    <h4>{editingId === 'new' ? 'Create Entity' : 'Edit Entity'}</h4>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            value={formData.name}
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
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="editor-textarea"
                            rows={3}
                        />
                    </div>
                    <div className="editor-actions">
                        <button onClick={handleSave} className="save-btn">Save</button>
                        <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};
