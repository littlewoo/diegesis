import React from 'react';
import { useGame } from '../store/GameContext';
import { getRoomEntities } from '../engine/entities';
import { InteractionList } from './InteractionList';
import { MessageLog } from './MessageLog';
import { ScriptEngine } from '../utils/scriptEngine';
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

    const handleInteract = (entityId: number, actionId: string) => {
        // Find the entity
        const entity = world.entities[entityId];
        if (!entity) return;

        // Execute "ON_INTERACT" scripts
        const actions = ScriptEngine.executeTrigger(state, entity.scripts, 'ON_INTERACT');

        if (actions.length > 0) {
            actions.forEach(dispatch);
        } else {
            // Default behavior if no script handles it
            dispatch({ type: 'ADD_MESSAGE', payload: { text: `You ${actionId} the ${entity.name}. Nothing happens.` } });
        }
    };
    const exitEntities = entities.filter(e => e.type === 'exit') as any[]; // Temporary cast or proper type import

    const handleMove = (exitEntityId: number) => {
        dispatch({ type: 'MOVE_PLAYER', payload: { exitEntityId } });
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

                <MessageLog messages={state.messageLog} />

                {/* Filter out exits from InteractionList if needed, though they might want to look at them? */}
                {/* For now let's just show non-exits in InteractionList to avoid duplication */}
                <InteractionList entities={entities.filter(e => e.type !== 'exit')} onInteract={handleInteract} />

                <div className="room-exits">
                    <h3>Exits</h3>
                    <div className="exits-grid">
                        {exitEntities.map(exit => (
                            <button key={exit.id} className="exit-btn" onClick={() => handleMove(exit.id)}>
                                {exit.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
