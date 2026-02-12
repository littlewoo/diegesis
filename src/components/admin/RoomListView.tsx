import React, { useState, useMemo } from 'react';
import { useGame } from '../../store/GameContext';
import { AdminListItem } from './common/AdminListItem';
import type { Entity } from '../../types';
import './EntityListView.css';

export const RoomListView: React.FC = () => {
    const { state, dispatch } = useGame();
    const [searchQuery, setSearchQuery] = useState('');

    const playerEntity = state.world.entities[state.player];
    const currentRoomId = playerEntity?.components.position?.roomId;

    const allRooms = useMemo(() => {
        return Object.values(state.world.entities).filter(e => e.type === 'room');
    }, [state.world.entities]);

    const filteredRooms = useMemo(() => {
        return allRooms.filter(room => {
            const query = searchQuery.toLowerCase();
            const identity = room.components.identity;
            if (searchQuery &&
                !identity?.name.toLowerCase().includes(query) &&
                !room.alias.toLowerCase().includes(query)) {
                return false;
            }
            return true;
        });
    }, [allRooms, searchQuery]);

    const handleTeleport = (roomId: number) => {
        dispatch({ type: 'TELEPORT_PLAYER', payload: { roomId } });
    };

    const handleCreateRoom = () => {
        const newId = state.world.nextId;
        // Default Room Entity
        const newRoom: Entity = {
            id: newId,
            alias: `room_${newId}`,
            type: 'room',
            components: {
                identity: { name: 'New Room', description: 'An empty room.' },
                room: { exits: [] },
                container: { contents: [] }
            }
        };

        dispatch({ type: 'ADD_ENTITY', payload: { entity: newRoom } });
        // Teleport to new room?
        dispatch({ type: 'TELEPORT_PLAYER', payload: { roomId: newId } });
    };

    return (
        <div className="entity-list-view">
            <div className="entity-list-controls">
                <button className="add-btn" onClick={handleCreateRoom}>+ Create New Room</button>

                <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-bar"
                />
            </div>

            <div className="entity-list-scroll">
                {filteredRooms.map(room => (
                    <AdminListItem
                        key={room.id}
                        label={room.components.identity?.name || room.alias}
                        subLabel={`ID: ${room.id} • ${room.alias}`}
                        onClick={() => handleTeleport(room.id)}
                        isActive={room.id === currentRoomId}
                        deleteTitle="Current Room"
                        onDelete={undefined}
                    />
                ))}
            </div>
        </div>
    );
};
