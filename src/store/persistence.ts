import type { GameState, WorldDefinition } from '../types';

const SAVE_KEY_PREFIX = 'diegesis_save_';
const INDEX_KEY = 'diegesis_save_index';

export interface SaveSlot {
    id: string;
    timestamp: number;
    preview: string; // Brief description (e.g. "Lush Garden - Day 1")
}

export function listSaveSlots(): SaveSlot[] {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export function saveGame(slotId: string, state: GameState, preview: string) {
    // 1. Save the actual state
    localStorage.setItem(SAVE_KEY_PREFIX + slotId, JSON.stringify(state));

    // 2. Update the index
    const index = listSaveSlots();
    const existingEntryIndex = index.findIndex(s => s.id === slotId);

    const newEntry: SaveSlot = { id: slotId, timestamp: Date.now(), preview };

    if (existingEntryIndex >= 0) {
        index[existingEntryIndex] = newEntry;
    } else {
        index.push(newEntry);
    }

    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

export function loadGame(slotId: string): GameState | null {
    const raw = localStorage.getItem(SAVE_KEY_PREFIX + slotId);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to load save", e);
        return null;
    }
}

export function deleteSave(slotId: string) {
    localStorage.removeItem(SAVE_KEY_PREFIX + slotId);
    const index = listSaveSlots().filter(s => s.id !== slotId);
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}
const CURRENT_WORLD_KEY = 'diegesis_active_world';

export function saveWorldDefinition(definition: WorldDefinition) {
    try {
        localStorage.setItem(CURRENT_WORLD_KEY, JSON.stringify(definition));
    } catch (e) {
        console.error("Failed to save world definition", e);
    }
}

export function loadWorldDefinition(): WorldDefinition | null {
    const raw = localStorage.getItem(CURRENT_WORLD_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}
