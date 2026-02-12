import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../store/GameContext';
import type { Entity } from '../../types';
import { AdminListItem } from './common/AdminListItem';
import './EntityListView.css';

interface EntityListViewProps {
    onEdit: (entity: Entity) => void;
    onDelete: (entityId: number) => void;
    onCreate: () => void;
    currentRoomId: number;
    forcedType?: string | 'all';
    initialRoomFilter?: boolean;
}

export const EntityListView: React.FC<EntityListViewProps> = ({
    onEdit,
    onDelete,
    onCreate,
    currentRoomId,
    forcedType = 'all',
    initialRoomFilter = false
}) => {
    const { state } = useGame();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string | 'all'>(forcedType);
    const [onlyCurrentRoom, setOnlyCurrentRoom] = useState(initialRoomFilter);

    // If forcedType changes (e.g. switching tabs), update the filter
    useEffect(() => {
        if (forcedType) setFilterType(forcedType);
    }, [forcedType]);

    const allEntities = useMemo(() => Object.values(state.world.entities), [state.world.entities]);

    const filteredEntities = useMemo(() => {
        return allEntities.filter(entity => {
            const name = entity.components.identity?.name || '';

            // Search Query - check Name and Alias
            const query = searchQuery.toLowerCase();
            if (searchQuery &&
                !name.toLowerCase().includes(query) &&
                !entity.alias.toLowerCase().includes(query)) {
                return false;
            }

            // Type Filter
            if (filterType !== 'all') {
                if (filterType === 'exit') {
                    // Special case: Exits are Props with an exit component
                    if (!entity.components.exit) return false;
                } else if (filterType === 'scenery') {
                    // Special case: Scenery are Props (without exit component usually, or just all props?)
                    // Let's say Scenery = 'prop' but NOT exits?
                    if (entity.type !== 'prop') return false;
                    if (entity.components.exit) return false; // Exclude exits from "Objects/Scenery" list?
                } else if (filterType === 'prop') {
                    // Generic prop filter
                    if (entity.type !== 'prop') return false;
                } else {
                    // Normal type match (room, npc, item)
                    if (entity.type !== filterType) return false;
                }
            }

            // Room Filter (Location Check)
            if (onlyCurrentRoom) {
                const entityRoomId = entity.components.position?.roomId;
                if (entityRoomId !== currentRoomId) {
                    return false;
                }
            }

            return true;
        });
    }, [allEntities, searchQuery, filterType, onlyCurrentRoom, currentRoomId]);

    return (
        <div className="entity-list-view">
            <div className="entity-list-controls">
                <button className="add-btn" onClick={onCreate}>+ Create New {forcedType !== 'all' ? forcedType : 'Entity'}</button>

                <input
                    type="text"
                    placeholder="Search entities (name or alias)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-bar"
                />

                <div className="filters">
                    {forcedType === 'all' && (
                        <div className="filter-group">
                            <label>Type:</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="filter-select"
                            >
                                <option value="all">All</option>
                                <option value="item">Item</option>
                                <option value="npc">NPC</option>
                                <option value="prop">Prop</option>
                                <option value="room">Room</option>
                            </select>
                        </div>
                    )}

                    <div className="filter-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={onlyCurrentRoom}
                                onChange={(e) => setOnlyCurrentRoom(e.target.checked)}
                            />
                            Current Room Only
                        </label>
                    </div>
                </div>
            </div>

            <div className="entity-list-scroll">
                {filteredEntities.length === 0 ? (
                    <div style={{ padding: '1rem', color: '#888', textAlign: 'center' }}>
                        No entities found matching filters.
                    </div>
                ) : (
                    filteredEntities.map(entity => (
                        <AdminListItem
                            key={entity.id}
                            label={entity.components.identity?.name || 'Unnamed'}
                            subLabel={`${forcedType === 'all' ? entity.type + ' • ' : ''}${entity.alias || '#' + entity.id}`}
                            onClick={() => onEdit(entity)}
                            onDelete={() => onDelete(entity.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
