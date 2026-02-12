import type { Entity, WorldDefinition, GameState } from '../types';

export type Action =
    | { type: 'TICK_TIME'; payload: { ticks: number } }
    | { type: 'MOVE_PLAYER'; payload: { exitEntityId: number } }
    | { type: 'TELEPORT_PLAYER'; payload: { roomId: number } }
    // ADD_ROOM now just adds an Entity (constructed as a room)
    // But for editor convenience, we might want to keep semantic names or specific payloads?
    // Let's genericize:
    | { type: 'ADD_ENTITY'; payload: { entity: Entity } }
    | { type: 'UPDATE_ENTITY'; payload: { entityId: number; data: Partial<Entity> } }
    | { type: 'REMOVE_ENTITY'; payload: { entityId: number } }
    | { type: 'SET_VARIABLE'; payload: { key: string; value: boolean | string | number } }
    // | { type: 'SET_ROOM_POSITION'; payload: { roomId: number; x: number; y: number } } // Obsolete? Or update PositionComponent?
    // Let's keep it but map it to UPDATE_ENTITY on the room.
    | { type: 'SET_ROOM_POSITION'; payload: { roomId: number; x: number; y: number } }
    | { type: 'MOVE_ENTITY'; payload: { entityId: number; targetContainerId: number } }
    // Add more actions as needed (PickUp, Interact, etc.)
    | { type: 'LOAD_GAME'; payload: { state: GameState } }
    | { type: 'LOAD_WORLD'; payload: { definition: WorldDefinition } }
    | { type: 'ADD_MESSAGE'; payload: { text: string } };
