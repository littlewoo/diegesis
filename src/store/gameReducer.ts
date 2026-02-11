import type { GameState, Player, GameObject } from '../types';
import type { Action } from './actions';

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

            if (!exitEntity || exitEntity.type !== 'exit') {
                return state;
            }

            const targetRoomId = exitEntity.components.exit.targetRoomId;

            return {
                ...state,
                time: state.time + 10,
                player: {
                    ...state.player,
                    components: {
                        ...state.player.components,
                        position: {
                            currentRoomId: targetRoomId,
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
            // Room payload comes with an ID (from editor logic or blank)
            // But we should follow the central counter if it matches internal logic

            // Logic: The Action Payload should probably carry the finalized ID
            // but for safety we can re-assign or trust the payload matches `nextId`.
            // Given the plan: Reducer manages ID assignment? 
            // Better: Action Creator/Component claims nextId. Reducer consumes it and increments.

            // Actually, per plan: "Always assign id = state.world.nextId"

            const newId = state.world.nextId;
            const newRoom = {
                ...room,
                id: newId,
                alias: room.alias || `#${newId}`,
                contents: [] // Ensure contents are initialized
            };

            return {
                ...state,
                world: {
                    ...state.world,
                    nextId: state.world.nextId + 1,
                    rooms: {
                        ...state.world.rooms,
                        [newId]: newRoom
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

            const newId = state.world.nextId;
            const newEntity: GameObject = {
                ...entity,
                id: newId,
                alias: entity.alias || `#${newId}`,
                type: entity.type // explicit type
            };

            return {
                ...state,
                world: {
                    ...state.world,
                    nextId: state.world.nextId + 1,
                    entities: {
                        ...state.world.entities,
                        [newId]: newEntity
                    },
                    rooms: {
                        ...state.world.rooms,
                        [roomId]: {
                            ...room,
                            contents: [...room.contents, newId]
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

        case 'MOVE_ENTITY': {
            const { entityId, fromRoomId, toRoomId } = action.payload;
            const fromRoom = state.world.rooms[fromRoomId];
            const toRoom = state.world.rooms[toRoomId];

            if (!fromRoom || !toRoom) return state;

            // Remove from old room
            const newFromContents = fromRoom.contents.filter(id => id !== entityId);

            // Add to new room (prevent duplicates just in case)
            const newToContents = [...toRoom.contents, entityId].filter((value, index, self) => self.indexOf(value) === index);

            return {
                ...state,
                world: {
                    ...state.world,
                    rooms: {
                        ...state.world.rooms,
                        [fromRoomId]: {
                            ...fromRoom,
                            contents: newFromContents
                        },
                        [toRoomId]: {
                            ...toRoom,
                            contents: newToContents
                        }
                    }
                }
            };
        }

        case 'LOAD_GAME':
            return action.payload.state as GameState;

        case 'LOAD_WORLD': {
            const { definition } = action.payload;

            // Construct initial player state merging defaults with definition
            const initialPlayer: Player = {
                id: 1, // Hardcoded Player ID as per spec
                alias: 'player',
                type: 'npc',
                name: 'Traveler',
                description: 'A wanderer.',
                components: {
                    stats: { strength: 10, agility: 10, intelligence: 10 },
                    moods: { health: 100, stamina: 100, morale: 100 },
                    inventory: { items: [], capacity: 10 },
                    position: { currentRoomId: definition.start.roomId },
                    ...(definition.start.player?.components || {})
                },
                ...(definition.start.player || {})
            };

            return {
                worldId: `${definition.meta.title}_${definition.meta.version}`, // Simple ID generation
                meta: definition.meta,
                player: initialPlayer,
                world: {
                    nextId: 100, // Default start for new worlds
                    rooms: { ...definition.rooms }, // Clone to avoid mutation of definition
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

        case 'ADD_MESSAGE':
            return {
                ...state,
                messageLog: [...state.messageLog, action.payload.text],
            };

        default:
            return state;
    }
}
