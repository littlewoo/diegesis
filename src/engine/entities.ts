import type { GameState, GameObject, Item } from '../types';

export function getRoomEntities(state: GameState, roomId: string): GameObject[] {
    const room = state.world.rooms[roomId];
    if (!room) return [];

    // In a real implementation with `contents` array of IDs:
    // return room.contents.map(id => state.world.entities[id]).filter(Boolean);

    // For now, since `entities` might be global or local, let's assume `world.entities` has everything
    // and we filter by some location component if it existed, or just use the contents array.

    // Currently `room.contents` is just `string[]`.
    return room.contents.map(id => state.world.entities[id]).filter(e => e !== undefined);
}

export function isItem(entity: GameObject): entity is Item {
    return entity.type === 'item';
}

export function isNPC(entity: GameObject): boolean {
    return entity.type === 'npc';
}

export function isInteractable(entity: GameObject): boolean {
    // Check if it has interactions or is an item/npc
    // For now, simpler check:
    return !!entity.components?.interactions || entity.type === 'npc' || entity.type === 'item';
}
