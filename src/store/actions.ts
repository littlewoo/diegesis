import type { Room } from '../types';

export type Action =
    | { type: 'TICK_TIME'; payload: { ticks: number } }
    | { type: 'MOVE_PLAYER'; payload: { exitId: string } }
    | { type: 'TELEPORT_PLAYER'; payload: { roomId: string } }
    | { type: 'ADD_ROOM'; payload: { room: Room } }
    | { type: 'UPDATE_ROOM'; payload: { roomId: string; data: Partial<Room> } }
    | { type: 'ADD_ENTITY'; payload: { entity: any; roomId: string } } // entity should be GameObject
    | { type: 'UPDATE_ENTITY'; payload: { entityId: string; data: any } } // data should be Partial<GameObject>
    | { type: 'REMOVE_ENTITY'; payload: { entityId: string; roomId: string } }
    | { type: 'SET_FLAG'; payload: { key: string; value: boolean } }
    | { type: 'SET_ROOM_POSITION'; payload: { roomId: string; x: number; y: number } }
    // Add more actions as needed (PickUp, Interact, etc.)
    | { type: 'LOAD_GAME'; payload: { state: any } }; // any for now, should be GameState
