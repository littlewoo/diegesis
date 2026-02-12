import type { GameState, Entity } from '../types';

export function getRoomEntities(state: GameState, roomId: number): Entity[] {
    const room = state.world.entities[roomId];
    if (!room || !room.components.container) return [];

    // Map contents IDs to actual entities
    return room.components.container.contents
        .map(id => state.world.entities[id])
        .filter((e): e is Entity => e !== undefined);
}

export function isItem(entity: Entity): boolean {
    return !!entity.components.portable || entity.type === 'item';
}

export function isNPC(entity: Entity): boolean {
    // Check for stats or type 'npc'
    return !!entity.components.stats || entity.type === 'npc';
}

export function isInteractable(entity: Entity): boolean {
    // Check if it has scripts handling interaction
    // OR if it's a prop (interactable fixture)
    // OR if it's an item/npc which usually have default interactions
    const hasInteractScript = entity.components.scripts?.['ON_INTERACT']?.length && entity.components.scripts['ON_INTERACT'].length > 0;
    return !!hasInteractScript || !!entity.components.prop || isItem(entity) || isNPC(entity);
}
