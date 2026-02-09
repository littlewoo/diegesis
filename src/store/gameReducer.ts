import type { GameState } from '../types';
import type { Action } from './actions';

export function gameReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case 'TICK_TIME':
            return {
                ...state,
                time: state.time + action.payload.ticks,
            };

        case 'MOVE_PLAYER': {
            const currentRoomId = state.player.components.position.currentRoomId;
            const currentRoom = state.world.rooms[currentRoomId];
            const exit = currentRoom.exits.find(e => e.id === action.payload.exitId);

            if (!exit) {
                // Exit not found
                return state;
            }

            return {
                ...state,
                time: state.time + 10, // Movement costs time
                player: {
                    ...state.player,
                    components: {
                        ...state.player.components,
                        position: {
                            currentRoomId: exit.targetRoomId,
                        },
                    },
                },
            };
        }

        case 'TELEPORT_PLAYER':
            return {
                ...state,
                player: {
                    ...state.player,
                    components: {
                        ...state.player.components,
                        position: {
                            currentRoomId: action.payload.roomId
                        }
                    }
                }
            }

        case 'ADD_ROOM': {
            const { room } = action.payload;
            return {
                ...state,
                world: {
                    ...state.world,
                    rooms: {
                        ...state.world.rooms,
                        [room.id]: room
                    }
                }
            };
        }

        case 'UPDATE_ROOM': {
            const { roomId, data } = action.payload;
            const room = state.world.rooms[roomId];
            if (!room) return state;

            return {
                ...state,
                world: {
                    ...state.world,
                    rooms: {
                        ...state.world.rooms,
                        [roomId]: {
                            ...room,
                            ...data
                        }
                    }
                }
            };
        }

        case 'ADD_ENTITY': {
            const { entity, roomId } = action.payload;
            const room = state.world.rooms[roomId];
            if (!room) return state;

            return {
                ...state,
                world: {
                    ...state.world,
                    entities: {
                        ...state.world.entities,
                        [entity.id]: entity
                    },
                    rooms: {
                        ...state.world.rooms,
                        [roomId]: {
                            ...room,
                            contents: [...room.contents, entity.id]
                        }
                    }
                }
            };
        }

        case 'UPDATE_ENTITY': {
            const { entityId, data } = action.payload;
            const entity = state.world.entities[entityId];
            if (!entity) return state;

            return {
                ...state,
                world: {
                    ...state.world,
                    entities: {
                        ...state.world.entities,
                        [entityId]: {
                            ...entity,
                            ...data
                        }
                    }
                }
            };
        }

        case 'REMOVE_ENTITY': {
            const { entityId, roomId } = action.payload;
            const room = state.world.rooms[roomId];
            if (!room) return state;

            // Remove from room contents
            const newContents = room.contents.filter(id => id !== entityId);

            // Remove from world entities (cleanup)
            const newEntities = { ...state.world.entities };
            delete newEntities[entityId];

            return {
                ...state,
                world: {
                    ...state.world,
                    entities: newEntities,
                    rooms: {
                        ...state.world.rooms,
                        [roomId]: {
                            ...room,
                            contents: newContents
                        }
                    }
                }
            };
        }

        case 'LOAD_GAME':
            return action.payload.state as GameState;

        case 'SET_FLAG':
            return {
                ...state,
                flags: {
                    ...state.flags,
                    [action.payload.key]: action.payload.value,
                },
            };

        case 'SET_ROOM_POSITION': {
            const { roomId, x, y } = action.payload;
            const room = state.world.rooms[roomId];
            if (!room) return state;

            return {
                ...state,
                world: {
                    ...state.world,
                    rooms: {
                        ...state.world.rooms,
                        [roomId]: {
                            ...room,
                            mapPosition: { x, y }
                        }
                    }
                }
            };
        }

        default:
            return state;
    }
}
