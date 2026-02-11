import React, { useState, useMemo } from 'react';
import { useGame } from '../../store/GameContext';
import { AdminListItem } from './common/AdminListItem';
import type { Room } from '../../types';
import './EntityListView.css'; // Reuse existing styles

export const RoomListView: React.FC = () => {
    const { state, dispatch } = useGame();
    const [searchQuery, setSearchQuery] = useState('');
    const currentRoomId = state.player.components.position.currentRoomId;

    const allRooms = useMemo(() => Object.values(state.world.rooms), [state.world.rooms]);

    const filteredRooms = useMemo(() => {
        return allRooms.filter(room => {
            const query = searchQuery.toLowerCase();
            if (searchQuery &&
                !room.name.toLowerCase().includes(query) &&
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
        const newRoom: Room = {
            id: newId,
            alias: `#${newId}`,
            type: 'room',
            name: 'New Room',
            description: 'An empty room.',
            components: {},
            contents: [],
        };
        dispatch({ type: 'ADD_ROOM', payload: { room: newRoom } });
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
                        label={room.name}
                        subLabel={`ID: ${room.id} • ${room.alias}`}
                        onClick={() => handleTeleport(room.id)}
                        isActive={room.id === currentRoomId}
                        deleteTitle="Current Room"
                        onDelete={undefined} // Can't delete rooms easily yet without breaking graph
                    />
                ))}
            </div>
        </div>
    );
};
