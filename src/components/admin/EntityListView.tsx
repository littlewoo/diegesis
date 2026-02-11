import React, { useState, useMemo } from 'react';
import { useGame } from '../../store/GameContext';
import type { GameObject, GameObjectType } from '../../types';
import { AdminListItem } from './common/AdminListItem';
import './EntityListView.css';

interface EntityListViewProps {
    onEdit: (entity: GameObject) => void;
    onDelete: (entityId: number) => void;
    onCreate: () => void;
    currentRoomId: number;
    forcedType?: GameObjectType | 'all';
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
    const [filterType, setFilterType] = useState<GameObjectType | 'all'>(forcedType);
    const [onlyCurrentRoom, setOnlyCurrentRoom] = useState(initialRoomFilter);

    // If forcedType changes (e.g. switching tabs), update the filter
    React.useEffect(() => {
        if (forcedType) setFilterType(forcedType);
        // We also want to respect the initialRoomFilter when tabs switch, if desired.
        // But since this component is likely remounted or key changes on tab switch in AdminPanel, 
        // the initial state should handle it. 
        // AdminPanel uses key={activeTab} for EntityEditor, so it remounts.
    }, [forcedType]);

    const allEntities = useMemo(() => Object.values(state.world.entities), [state.world.entities]);

    const filteredEntities = useMemo(() => {
        return allEntities.filter(entity => {
            // Search Query - check Name and Alias
            const query = searchQuery.toLowerCase();
            if (searchQuery &&
                !entity.name.toLowerCase().includes(query) &&
                !entity.alias.toLowerCase().includes(query)) {
                return false;
            }

            // Type Filter
            if (filterType !== 'all' && entity.type !== filterType) {
                return false;
            }

            // Exits are separate now, never show them in general lists unless explicitly asked?
            // User put Exits in their own tab. 'All' might want everything though?
            // For now, let's exclude 'exit' type unless specifically requested or 'all' is selected.
            // Actually 'all' implies everything. But the prompt implies "NPCs - Items - Objects - All".
            // If 'Exits' is a separate tab, maybe 'All' should still include them?
            // Let's assume standard behavior: filterType matches check.

            // Room Filter
            if (onlyCurrentRoom) {
                const currentRoom = state.world.rooms[currentRoomId];
                if (currentRoom && !currentRoom.contents.includes(entity.id)) {
                    return false;
                }
            }

            return true;
        });
    }, [allEntities, searchQuery, filterType, onlyCurrentRoom, currentRoomId, state.world.rooms]);

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
                                onChange={(e) => setFilterType(e.target.value as GameObjectType | 'all')}
                                className="filter-select"
                            >
                                <option value="all">All</option>
                                <option value="item">Item</option>
                                <option value="npc">NPC</option>
                                <option value="scenery">Scenery</option>
                                <option value="exit">Exit</option>
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
                            label={entity.name}
                            subLabel={`${forcedType === 'all' ? entity.type + ' • ' : ''}${entity.alias || '#' + entity.id}`}
                            onClick={() => onEdit(entity)}
                            onDelete={() => onDelete(entity.id)}
                            deleteTitle="Delete Entity"
                        />
                    ))
                )}
            </div>
        </div>
    );
};
