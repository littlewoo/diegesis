import type { Room, WorldDefinition, GameState, GameObject } from '../types';

export type Action =
    | { type: 'TICK_TIME'; payload: { ticks: number } }
    | { type: 'MOVE_PLAYER'; payload: { exitId: string } }
    | { type: 'TELEPORT_PLAYER'; payload: { roomId: string } }
    | { type: 'ADD_ROOM'; payload: { room: Room } }
    | { type: 'UPDATE_ROOM'; payload: { roomId: string; data: Partial<Room> } }
    | { type: 'ADD_ENTITY'; payload: { entity: GameObject; roomId: string } }
    | { type: 'UPDATE_ENTITY'; payload: { entityId: string; data: Partial<GameObject> } }
    | { type: 'REMOVE_ENTITY'; payload: { entityId: string; roomId: string } }
    | { type: 'SET_FLAG'; payload: { key: string; value: boolean } }
    | { type: 'SET_ROOM_POSITION'; payload: { roomId: string; x: number; y: number } }
    // Add more actions as needed (PickUp, Interact, etc.)
    | { type: 'LOAD_GAME'; payload: { state: GameState } }
    | { type: 'LOAD_WORLD'; payload: { definition: WorldDefinition } };
