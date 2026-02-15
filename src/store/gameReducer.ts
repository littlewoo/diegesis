import type { GameState, Entity } from '../types';
import type { Action } from './actions';

// Helper to create a default entity
const createEntity = (id: number, template: Partial<Entity>): Entity => ({
    id,
    alias: template.alias || `#${id}`,
    type: template.type || 'prop',
    visible: template.visible !== undefined ? template.visible : true,
    components: {
        identity: { name: 'Unknown', description: '...' },
        ...template.components
    }
});

export function gameReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case 'TICK_TIME':
            return {
                ...state,
                time: state.time + action.payload.ticks,
            };

        case 'MOVE_PLAYER': {
            const { exitEntityId } = action.payload;
            const exitEntity = state.world.entities[exitEntityId];

            if (!exitEntity || !exitEntity.components.exit) {
                return state;
            }

            const targetRoomId = exitEntity.components.exit.targetRoomId;

            // Reuse TELEPORT logic primarily, but might add time/flavor
            // For now, just teleport
            // We can dispatch TELEPORT_PLAYER or duplicate logic. 
            // Duplicating logic to avoid side-effects of dispatch within reducer (impossible)

            const player = state.world.entities[state.player];
            if (!player) return state;

            // 1. Remove from old room
            const oldRoomId = player.components.position?.roomId;
            const oldRoom = oldRoomId ? state.world.entities[oldRoomId] : null;

            let newEntities = { ...state.world.entities };

            if (oldRoom && oldRoom.components.container) {
                newEntities[oldRoom.id] = {
                    ...oldRoom,
                    components: {
                        ...oldRoom.components,
                        container: {
                            ...oldRoom.components.container,
                            contents: oldRoom.components.container.contents.filter(id => id !== state.player)
                        }
                    }
                };
            }

            // 2. Add to new room
            const newRoom = newEntities[targetRoomId];
            if (newRoom && newRoom.components.container) {
                newEntities[targetRoomId] = {
                    ...newRoom,
                    components: {
                        ...newRoom.components,
                        container: {
                            ...newRoom.components.container,
                            contents: [...newRoom.components.container.contents, state.player]
                        }
                    }
                };
            }

            // 3. Update Player Position
            newEntities[state.player] = {
                ...player,
                components: {
                    ...player.components,
                    position: {
                        ...player.components.position,
                        roomId: targetRoomId
                    }
                }
            };

            return {
                ...state,
                time: state.time + 10, // Cost of moving
                world: {
                    ...state.world,
                    entities: newEntities
                }
            };
        }

        case 'TELEPORT_PLAYER': {
            const { roomId } = action.payload;
            const player = state.world.entities[state.player];
            if (!player) return state;

            // 1. Remove from old room
            const oldRoomId = player.components.position?.roomId;
            const oldRoom = oldRoomId ? state.world.entities[oldRoomId] : null;

            let newEntities = { ...state.world.entities };

            if (oldRoom && oldRoom.components.container) {
                newEntities[oldRoom.id] = {
                    ...oldRoom,
                    components: {
                        ...oldRoom.components,
                        container: {
                            ...oldRoom.components.container,
                            contents: oldRoom.components.container.contents.filter(id => id !== state.player)
                        }
                    }
                };
            }

            // 2. Add to new room
            const newRoom = newEntities[roomId];
            if (newRoom && newRoom.components.container) {
                newEntities[roomId] = {
                    ...newRoom,
                    components: {
                        ...newRoom.components,
                        container: {
                            ...newRoom.components.container,
                            contents: [...newRoom.components.container.contents, state.player]
                        }
                    }
                };
            }

            // 3. Update Player Position
            newEntities[state.player] = {
                ...player,
                components: {
                    ...player.components,
                    position: {
                        ...player.components.position,
                        roomId: roomId // Container ID
                    }
                }
            };

            return {
                ...state,
                world: {
                    ...state.world,
                    entities: newEntities
                }
            };
        }

        case 'ADD_ENTITY': {
            const { entity } = action.payload;
            const newId = state.world.nextId;

            // Hydrate the entity with data from payload
            const newEntity = createEntity(newId, entity);

            let newEntities = { ...state.world.entities, [newId]: newEntity };

            // If it has a position (container), add it to that container's contents
            const containerId = newEntity.components.position?.roomId;
            if (containerId && newEntities[containerId]) {
                const container = newEntities[containerId];
                if (container.components.container) {
                    newEntities[containerId] = {
                        ...container,
                        components: {
                            ...container.components,
                            container: {
                                ...container.components.container,
                                contents: [...container.components.container.contents, newId]
                            }
                        }
                    };
                }
            }

            return {
                ...state,
                world: {
                    ...state.world,
                    nextId: state.world.nextId + 1,
                    entities: newEntities
                }
            };
        }

        case 'UPDATE_ENTITY': {
            const { entityId, data } = action.payload;
            const entity = state.world.entities[entityId];
            if (!entity) return state;

            // Deep merge logic for components might be needed, but for now shallow merge of 'data' which includes components overwrites?
            // The usage usually is { components: { ...entity.components, ...newComponents } }
            // So standard spread works if 'data' is constructed correctly.

            // SPECIAL CASE: If 'position' changes, we must update containers!
            // But this action is generic update. 
            // We should use MOVE_ENTITY for changing containers to ensure consistency.
            // If data contains 'components.position', we might desync 'contents'.
            // For now, assume UPDATE_ENTITY is local property updates only.

            return {
                ...state,
                world: {
                    ...state.world,
                    entities: {
                        ...state.world.entities,
                        [entityId]: {
                            ...entity,
                            ...data,
                            components: {
                                ...entity.components,
                                ...data.components
                            }
                        }
                    }
                }
            };
        }

        case 'REMOVE_ENTITY': {
            const { entityId } = action.payload;
            const entity = state.world.entities[entityId];
            if (!entity) return state;

            const containerId = entity.components.position?.roomId;
            const newEntities = { ...state.world.entities };

            // Remove from container
            if (containerId && newEntities[containerId]) {
                const container = newEntities[containerId];
                if (container.components.container) {
                    newEntities[containerId] = {
                        ...container,
                        components: {
                            ...container.components,
                            container: {
                                ...container.components.container,
                                contents: container.components.container.contents.filter(id => id !== entityId)
                            }
                        }
                    };
                }
            }

            delete newEntities[entityId];

            return {
                ...state,
                world: {
                    ...state.world,
                    entities: newEntities
                }
            };
        }

        case 'MOVE_ENTITY': {
            const { entityId, targetContainerId } = action.payload;
            const entity = state.world.entities[entityId];
            const targetContainer = state.world.entities[targetContainerId];

            if (!entity || !targetContainer || !targetContainer.components.container) return state;

            const oldContainerId = entity.components.position?.roomId;
            const oldContainer = oldContainerId ? state.world.entities[oldContainerId] : null;

            let newEntities = { ...state.world.entities };

            // 1. Remove from old container
            if (oldContainer && oldContainer.components.container) {
                newEntities[oldContainer.id] = {
                    ...oldContainer,
                    components: {
                        ...oldContainer.components,
                        container: {
                            ...oldContainer.components.container,
                            contents: oldContainer.components.container.contents.filter(id => id !== entityId)
                        }
                    }
                };
            }

            // 2. Add to new container
            newEntities[targetContainerId] = {
                ...targetContainer,
                components: {
                    ...targetContainer.components,
                    container: {
                        ...targetContainer.components.container,
                        contents: [...targetContainer.components.container.contents, entityId]
                    }
                }
            };

            // 3. Update Entity Position
            newEntities[entityId] = {
                ...entity,
                components: {
                    ...entity.components,
                    // Ensure position component exists
                    position: {
                        ...(entity.components.position || { x: 0, y: 0 }),
                        roomId: targetContainerId
                    }
                }
            };

            return {
                ...state,
                world: {
                    ...state.world,
                    entities: newEntities
                }
            };
        }

        case 'LOAD_GAME':
            return action.payload.state as GameState;

        case 'LOAD_WORLD': {
            const { definition } = action.payload;

            // Create specific default entities for player and start room if needed
            // But usually 'definition' contains the full world dump.
            // We just need to ensure the structure matches GameState.

            // Re-construct the definition into the runtime state
            // Assuming definition.entities is already in the right format.

            return {
                worldId: `${definition.meta.title}_${definition.meta.version}`,
                meta: definition.meta,
                player: 1, // Hardcoded ID for now, or find entity with 'isPlayer'? 
                // For now, let's assume Entity 1 is Player.
                world: {
                    nextId: 100,
                    entities: { ...definition.entities }
                },
                time: 0,
                variables: definition.variables || {},
                messageLog: []
            };
        }

        case 'SET_VARIABLE':
            return {
                ...state,
                variables: {
                    ...state.variables,
                    [action.payload.key]: action.payload.value,
                },
            };

        case 'ADD_MESSAGE':
            return {
                ...state,
                messageLog: [...state.messageLog, action.payload.text],
            };

        default:
            return state;
    }
}
