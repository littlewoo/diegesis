


// --- World Definition (Static "Cartridge") ---

export interface WorldDefinition {
    meta: {
        title: string;
        author: string;
        version: string;
        description?: string;
    };
    variables?: Record<string, boolean | string | number>;
    rooms: Record<number, Room>; // Indexed by DB ID
    entities: Record<number, GameObject>; // Indexed by DB ID
    start: {
        roomId: number; // DB ID
        player?: Partial<Player>;
    };
}

// --- Game Session (Dynamic "Save File") ---

export interface GameState {
    worldId?: string;
    meta: WorldDefinition['meta'];
    player: Player;
    world: World;
    time: number;
    variables: Record<string, any>;
    messageLog: string[];
}

export interface World {
    nextId: number; // Global counter for new IDs
    rooms: Record<number, Room>;
    entities: Record<number, GameObject>;
}

// Optimization: Using a Discriminated Union for GameObject types
export type GameObjectType = 'room' | 'npc' | 'item' | 'scenery' | 'exit';

export interface GameObject {
    id: number;           // Immutable DB ID
    alias: string;        // Mutable, unique human-readable ID
    type: GameObjectType;
    name: string;
    description: string;
    scripts?: Record<string, Script[]>; // Trigger -> Scripts
    components: {
        [key: string]: any;
    };
}

// --- Scripting Engine Types ---

export type TriggerType = 'ON_INTERACT';

export interface Script {
    conditions?: Condition[];
    effects: Effect[];
}

export type Condition =
    | { type: 'FLAG_TRUE'; flag: string }
    | { type: 'FLAG_FALSE'; flag: string };

export type Effect =
    | { type: 'SET_FLAG'; flag: string; value: boolean }
    | { type: 'SHOW_DIALOGUE'; text: string };

// --- Specific Game Object Interfaces (Convenience wrappers around GameObject) ---

export interface Room extends GameObject {
    type: 'room';
    // exits: Exit[]; // REMOVED: Exits are now entities in contents
    contents: number[]; // DB IDs of GameObjects
    mapPosition?: { x: number; y: number };
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

export interface ExitEntity extends GameObject {
    type: 'exit';
    components: {
        exit: ExitComponent;
        position: PositionComponent; // Which room it's in
        [key: string]: any;
    }
}

export interface Player extends GameObject {
    type: 'npc';
    components: {
        stats: StatsComponent;
        moods: MoodsComponent;
        inventory: InventoryComponent;
        position: PositionComponent;
    }
}

// --- Components ---

export interface ExitComponent {
    targetRoomId: number;
}

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
    items: number[]; // DB IDs
    capacity: number;
}

export interface PositionComponent {
    currentRoomId: number; // DB ID
}

export interface CarryableComponent {
    weight: number;
    value: number;
}

export interface Interaction {
    label: string;
    actionId: string;
    conditions?: Record<string, any>;
}

export interface InteractiveComponent {
    interactions: Interaction[];
}
