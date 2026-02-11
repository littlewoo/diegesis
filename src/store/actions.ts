import type { Room, WorldDefinition, GameState, GameObject } from '../types';

export type Action =
    | { type: 'TICK_TIME'; payload: { ticks: number } }
    | { type: 'MOVE_PLAYER'; payload: { exitEntityId: number } }
    | { type: 'TELEPORT_PLAYER'; payload: { roomId: number } }
    | { type: 'ADD_ROOM'; payload: { room: Room } }
    | { type: 'UPDATE_ROOM'; payload: { roomId: number; data: Partial<Room> } }
    | { type: 'ADD_ENTITY'; payload: { entity: GameObject; roomId: number } }
    | { type: 'UPDATE_ENTITY'; payload: { entityId: number; data: Partial<GameObject> } }
    | { type: 'REMOVE_ENTITY'; payload: { entityId: number; roomId: number } }
    | { type: 'SET_VARIABLE'; payload: { key: string; value: boolean | string | number } }
    | { type: 'SET_ROOM_POSITION'; payload: { roomId: number; x: number; y: number } }
    | { type: 'MOVE_ENTITY'; payload: { entityId: number; fromRoomId: number; toRoomId: number } }
    // Add more actions as needed (PickUp, Interact, etc.)
    | { type: 'LOAD_GAME'; payload: { state: GameState } }
    | { type: 'LOAD_WORLD'; payload: { definition: WorldDefinition } }
    | { type: 'ADD_MESSAGE'; payload: { text: string } };
