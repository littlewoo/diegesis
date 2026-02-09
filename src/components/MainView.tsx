import React from 'react';
import { useGame } from '../store/GameContext';
import { getRoomEntities } from '../engine/entities';
import { InteractionList } from './InteractionList';
import './MainView.css';

export const MainView: React.FC = () => {
    const { state, dispatch } = useGame();
    const { player, world } = state;
    const currentRoomId = player.components.position.currentRoomId;
    const room = world.rooms[currentRoomId];

    if (!room) {
        return <div>Error: Room {currentRoomId} not found.</div>;
    }

    const entities = getRoomEntities(state, currentRoomId);

    const handleMove = (exitId: string) => {
        dispatch({ type: 'MOVE_PLAYER', payload: { exitId } });
    };

    const handleInteract = (entityId: string, actionId: string) => {
        console.log(`Interacting with ${entityId}: ${actionId}`);
    };

    return (
        <div className="room-container">
            <div className="room-image-placeholder">
                <div className="art-box">
                    <span>{room.name} Art</span>
                </div>
            </div>

            <div className="room-content">
                <h1 className="room-title">{room.name}</h1>
                <p className="room-description">{room.description}</p>

                <InteractionList entities={entities} onInteract={handleInteract} />

                <div className="room-exits">
                    <h3>Exits</h3>
                    <div className="exits-grid">
                        {room.exits.map(exit => (
                            <button key={exit.id} className="exit-btn" onClick={() => handleMove(exit.id)}>
                                {exit.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
