import type { GameState, Room, Player, Item, WorldObject, GameObject, ExitEntity } from '../types';

const INITIAL_ROOM_ID = 2; // Atrium

// Helper to create basic entities
const createItem = (id: number, alias: string, name: string, description: string): Item => ({
    id, alias, type: 'item', name, description,
    components: { carryable: { weight: 1, value: 10 } }
});

const createScenery = (id: number, alias: string, name: string, description: string): WorldObject => ({
    id, alias, type: 'scenery', name, description,
    components: {}
});

// Helper to create exit entities
const createExit = (id: number, alias: string, label: string, currentRoomId: number, targetRoomId: number): ExitEntity => ({
    id, alias, type: 'exit', name: label, description: `Exit to room ${targetRoomId}`,
    components: {
        exit: { targetRoomId },
        position: { currentRoomId }
    }
});

const atrium: Room = {
    id: 2,
    alias: 'atrium',
    type: 'room',
    name: 'Grand Atrium',
    description: 'A vast, echoing chamber with a high vaulted ceiling. Light filters in through dust-moted shafts from high windows.',
    components: {},
    // Exits moved to contents
    contents: [5, 6, 20, 21], // Statue, Key, Exit Garden, Exit Lab
};

const garden: Room = {
    id: 3,
    alias: 'garden',
    type: 'room',
    name: 'Overgrown Garden',
    description: 'Nature has reclaimed this space. Vines thick as a man\'s arm slightly obscure the crumbling stone walls.',
    components: {},
    // Exits moved to contents
    contents: [8, 22], // NPC, Exit Atrium
};

const lab: Room = {
    id: 4,
    alias: 'lab',
    type: 'room',
    name: 'Research Lab',
    description: 'Clean, white, and sterile. Banks of servers blink rhythmically against the far wall.',
    components: {},
    // Exits moved to contents
    contents: [7, 23], // Datapad, Exit Atrium
};

// Entities
// ID 5 = Statue
const statue: WorldObject = createScenery(5, 'statue_hero', 'Marble Statue', 'A statue of a forgotten hero, their face worn away by time.');
// ID 6 = Key
const key: Item = createItem(6, 'rusty_key', 'Rusty Key', 'An old iron key, heavy and covered in rust.');
// ID 7 = Datapad
const datapad: Item = createItem(7, 'datapad', 'Cracked Datapad', 'A screen displaying a fragmented log entry.');

const npc: GameObject = {
    id: 8,
    alias: 'gardener_bot',
    type: 'npc',
    name: 'Unit-734',
    description: 'A hovering maintenance droid, pruning a rosebush with delicate lasers.',
    scripts: {
        'ON_INTERACT': [
            {
                conditions: [{ type: 'FLAG_TRUE', flag: 'met_gardener' }],
                effects: [
                    { type: 'SHOW_DIALOGUE', text: 'Unit-734 buzzes angrily at you.' }
                ]
            },
            {
                // Default / First time
                effects: [
                    { type: 'SHOW_DIALOGUE', text: 'Unit-734 chirps: "Organic lifeform detected. Pruning protocols active."' },
                    { type: 'SET_FLAG', flag: 'met_gardener', value: true }
                ]
            }
        ]
    },
    components: {
        interactions: [
            { label: 'Talk', actionId: 'talk_gardener' }
        ]
    }
};

// Exits as Entities (IDs 20+)
const exitGarden = createExit(20, 'exit_garden', 'Garden Gate', 2, 3);
const exitLab = createExit(21, 'exit_lab', 'Lab Corridor', 2, 4);
const exitAtriumFromGarden = createExit(22, 'exit_atrium_garden', 'Back to Atrium', 3, 2);
const exitAtriumFromLab = createExit(23, 'exit_atrium_lab', 'Main Hall', 4, 2);

const player: Player = {
    id: 1,
    alias: 'player',
    type: 'npc',
    name: 'Traveler',
    description: 'A wanderer in this strange place.',
    components: {
        stats: { strength: 12, agility: 14, intelligence: 16 },
        moods: { health: 100, stamina: 90, morale: 85 },
        inventory: { items: [], capacity: 10 },
        position: { currentRoomId: INITIAL_ROOM_ID },
    },
};

import type { WorldDefinition } from '../types';

// Check for embedded world definition (for standalone builds)
const EMBEDDED_WORLD = (window as any).DIEGESIS_WORLD_DEFINITION as WorldDefinition | undefined;

export const INITIAL_WORLD: WorldDefinition = EMBEDDED_WORLD || {
    meta: {
        title: 'The Abandoned Station',
        author: 'System',
        version: '1.0.3' // Bumped version to force reset
    },
    rooms: {
        [atrium.id]: atrium,
        [garden.id]: garden,
        [lab.id]: lab,
    },
    entities: {
        [statue.id]: statue,
        [key.id]: key,
        [datapad.id]: datapad,
        [npc.id]: npc,
        [exitGarden.id]: exitGarden,
        [exitLab.id]: exitLab,
        [exitAtriumFromGarden.id]: exitAtriumFromGarden,
        [exitAtriumFromLab.id]: exitAtriumFromLab,
    },
    variables: {}, // Initial global state
    start: {
        roomId: INITIAL_ROOM_ID,
        player: {
            components: player.components // Use the pre-defined player components
        }
    }
};

export const INITIAL_STATE: GameState = {
    worldId: `${INITIAL_WORLD.meta.title}_${INITIAL_WORLD.meta.version}`,
    meta: INITIAL_WORLD.meta,
    player,
    world: {
        nextId: 100, // Safe starting ID for new creations
        rooms: INITIAL_WORLD.rooms,
        entities: INITIAL_WORLD.entities,
    },
    time: 0,
    variables: {},
    messageLog: [],
};
