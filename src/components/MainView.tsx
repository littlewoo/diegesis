import React from 'react';
import { useGame } from '../store/GameContext';
import { getRoomEntities } from '../engine/entities';
import { InteractionList } from './InteractionList';
import { MessageLog } from './MessageLog';
import { ScriptEngine } from '../utils/scriptEngine';
import './MainView.css';

export const MainView: React.FC = () => {
    const { state, dispatch } = useGame();
    const { world } = state;
    const player = world.entities[state.player];

    // Safety check if player entity is missing (e.g. during load)
    if (!player) return <div>Loading...</div>;

    const currentRoomId = player.components.position?.roomId;
    const room = currentRoomId ? world.entities[currentRoomId] : undefined;

    if (!room || !room.components.room) {
        return <div>Error: Room {currentRoomId} not found or invalid.</div>;
    }

    const entities = getRoomEntities(state, currentRoomId!).filter(e => e.visible !== false);

    const handleInteract = (entityId: number, actionId: string) => {
        // Find the entity
        const entity = world.entities[entityId];
        if (!entity) return;

        // Execute "ON_INTERACT" scripts
        const scripts = entity.components.scripts || {};
        const actions = ScriptEngine.executeTrigger(state, scripts, 'ON_INTERACT');

        if (actions.length > 0) {
            actions.forEach(dispatch);
        } else {
            // Default behavior if no script handles it
            dispatch({ type: 'ADD_MESSAGE', payload: { text: `You ${actionId} the ${entity.components.identity.name}. Nothing happens.` } });
        }
    };

    // Exits are entities that have the 'exit' component (or we check type 'exit' if we kept legacy tag)
    // types/index.ts says Entity has type: 'room' | 'npc' | 'item' | 'prop'
    // I removed 'exit' from types!
    // But I added ExitComponent.
    // So exits are entities with components.exit defined.
    const exitEntities = entities.filter(e => e.components.exit);

    const handleMove = (exitEntityId: number) => {
        dispatch({ type: 'MOVE_PLAYER', payload: { exitEntityId } });
    };

    return (
        <div className="room-container">
            <div className="room-image-placeholder">
                <div className="art-box">
                    <span>{room.components.identity.name} Art</span>
                </div>
            </div>

            <div className="room-content">
                <h1 className="room-title">{room.components.identity.name}</h1>
                <p className="room-description">{room.components.identity.description}</p>

                <MessageLog messages={state.messageLog} />

                {/* Filter out exits from InteractionList */}
                <InteractionList entities={entities.filter(e => !e.components.exit)} onInteract={handleInteract} />

                <div className="room-exits">
                    <h3>Exits</h3>
                    <div className="exits-grid">
                        {exitEntities.map(exit => (
                            <button key={exit.id} className="exit-btn" onClick={() => handleMove(exit.id)}>
                                {exit.components.identity.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
