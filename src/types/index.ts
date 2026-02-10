
// Exit represents a named passage from one room to another
export interface Exit {
    id: string;          // Unique within the room
    label: string;       // User-facing name, e.g. "Front Door"
    targetRoomId: string;
}

// --- World Definition (Static "Cartridge") ---

export interface WorldDefinition {
    meta: {
        title: string;
        author: string;
        version: string;
        description?: string;
    };
    rooms: Record<string, Room>; // Initial state of rooms
    entities: Record<string, GameObject>; // Initial state of entities
    start: {
        roomId: string; // ID of the starting room
        player?: Partial<Player>; // Optional initial player config check
    };
}

// --- Game Session (Dynamic "Save File") ---

export interface GameState {
    worldId?: string; // ID/Hash of the WorldDefinition this session is based on
    meta: WorldDefinition['meta']; // Metadata from the WorldDefinition
    player: Player;
    world: World; // Current state of the world (initially cloned from Definition)
    time: number; // Global tick count
    flags: Record<string, boolean>; // Global flags for quests/events
}

export interface World {
    rooms: Record<string, Room>;
    entities: Record<string, GameObject>; // All entities (NPCs, Items, Objects) indexed by ID
}

// Optimization: Using a Discriminated Union for GameObject types
export type GameObjectType = 'room' | 'npc' | 'item' | 'scenery';

export interface GameObject {
    id: string;
    type: GameObjectType;
    name: string;
    description: string;
    components: {
        [key: string]: any; // Flexible component architecture
    };
}

// --- Specific Game Object Interfaces (Convenience wrappers around GameObject) ---

export interface Room extends GameObject {
    type: 'room';
    exits: Exit[]; // Array of named exits
    contents: string[]; // IDs of GameObjects in this room
    mapPosition?: { x: number; y: number }; // Persistent position on the creator map
}

export interface Item extends GameObject {
    type: 'item';
    components: {
        carryable: CarryableComponent;
        [key: string]: any;
    }
}

export interface WorldObject extends GameObject {
    type: 'scenery';
}

export interface Player extends GameObject {
    type: 'npc'; // Player is technically an NPC
    components: {
        stats: StatsComponent;
        moods: MoodsComponent;
        inventory: InventoryComponent;
        position: PositionComponent;
    }
}

// --- Components ---

export interface StatsComponent {
    strength: number;
    agility: number;
    intelligence: number;
    // Add more as needed
}

export interface MoodsComponent {
    health: number;
    stamina: number;
    morale: number;
}

export interface InventoryComponent {
    items: string[]; // List of Item IDs
    capacity: number;
}

export interface PositionComponent {
    currentRoomId: string;
}

export interface CarryableComponent {
    weight: number;
    value: number;
}

export interface Interaction {
    label: string;
    actionId: string; // ID of the action logic to trigger
    conditions?: Record<string, any>;
}

export interface InteractiveComponent {
    interactions: Interaction[];
}
