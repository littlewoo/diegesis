// --- Legacy Types Removed ---
// The following types have been replaced by the Entity-Component system:
// World, GameObject, Room, Item, etc.
//
// Any code referencing these must be updated to use 'Entity' and check for components.

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

export interface Interaction {
    label: string;
    actionId: string;
    conditions?: Record<string, any>;
}

// --- Universal Entity Core ---

export interface Entity {
    id: number;
    alias: string;
    // We keep 'type' for high-level classification/filtering (the "Archetype" tag)
    // but actual logic is driven by components.
    type: 'room' | 'npc' | 'item' | 'prop';
    components: ComponentMap;
}

export interface ComponentMap {
    identity: IdentityComponent;
    room?: RoomComponent;         // Makes it a Location
    container?: ContainerComponent; // Makes it hold things
    portable?: PortableComponent;   // Makes it carryable
    prop?: PropComponent;           // Makes it a fixture
    stats?: StatsComponent;         // Makes it alive
    position?: PositionComponent;   // Makes it located somewhere
    exit?: ExitComponent;           // Makes it a link to another room
    scripts?: ScriptComponent;      // Logic triggers
}

// --- Components ---

export interface IdentityComponent {
    name: string;
    description: string;
    icon?: string;
}

export interface ScriptComponent {
    [trigger: string]: Script[];
}

export interface ExitComponent {
    targetRoomId: number;
    // direction?: 'north' | 'south' ... (Future)
}

export interface PositionComponent {
    x?: number;
    y?: number;
    roomId: number; // The container Room ID
}

export interface RoomComponent {
    exits: any[]; // To be defined (ExitEntity is now an Entity in contents?)
    // Actually, Exits are weird. If they are entities, they cease to be a component property.
    // BUT for now, let's keep exits structurally here or moved to contents?
    // Plan says "Exits are entities in contents" was previous thought.
    // Let's stick to: Exits are conceptual links, likely Entities in the room.
    // But for the 'Room' component, maybe we just track theme?
    themeId?: string | null;
}

export interface ContainerComponent {
    contents: number[]; // List of Entity IDs
    capacity?: number;
}

export interface PortableComponent {
    weight?: number;
    value?: number;
}

export interface PropComponent {
    isLocked?: boolean;
    keyId?: string;
}

export interface StatsComponent {
    strength: number;
    health: number;
    maxHealth: number;
}

// --- World State ---

export interface WorldDefinition {
    meta: {
        title: string;
        author: string;
        version: string;
    };
    entities: Record<number, Entity>; // Flat list of ALL entities
    start: {
        roomId: number;
        player: Partial<Entity>;
    };
    variables?: Record<string, any>;
}

export interface GameState {
    worldId?: string;
    meta: WorldDefinition['meta'];
    player: number; // Just an ID now? Or we keep the Player Object separate for runtime speed?
    // Actually, Player should just be an Entity in the world. 
    // But for Reducer convenience, we often keep 'player' accessible.
    // Let's stick to standard GameState but 'player' is an Entity.

    // To match legacy code minimal breakage, let's keep 'player' structure somewhat 
    // but mapped to Entity? 
    // Refactor Plan: "World.rooms" and "World.entities" merge?
    // The previous design had "rooms" and "entities". 
    // New design: EVERYTHING is an entity. 
    // So `world.entities` is the only storage.

    world: {
        nextId: number;
        entities: Record<number, Entity>;
    };

    time: number;
    variables: Record<string, any>;
    messageLog: string[];
}

// --- Legacy Compat / Helpers ---
// We might need to keep some old types or alias them to avoid breaking EVERYTHING instantly.
// But the task is "Refactor", so we break and fix.

