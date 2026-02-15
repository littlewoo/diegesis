import type { GameState, Entity, WorldDefinition } from '../types';


// --- Factory Helpers ---

const createEntity = (id: number, alias: string, type: Entity['type'], name: string, description: string, components: any = {}, visible: boolean = true): Entity => ({
    id,
    alias,
    type,
    visible,
    components: {
        identity: { name, description },
        ...components
    }
});

const createRoom = (id: number, alias: string, name: string, description: string, contents: number[] = []): Entity => {
    return createEntity(id, alias, 'room', name, description, {
        room: { exits: [] },
        container: { contents },
        identity: { name, description }
    });
};

const createItem = (id: number, alias: string, name: string, description: string, weight = 1, value = 1): Entity => {
    return createEntity(id, alias, 'item', name, description, {
        portable: { weight, value },
    });
};

const createProp = (id: number, alias: string, name: string, description: string): Entity => {
    return createEntity(id, alias, 'prop', name, description, {
        prop: {},
    });
};

const createExit = (id: number, alias: string, label: string, currentRoomId: number, targetRoomId: number): Entity => {
    return createEntity(id, alias, 'prop', label, `Exit to room ${targetRoomId}`, {
        exit: { targetRoomId },
        position: { roomId: currentRoomId },
        prop: {},
    });
};

// --- Definitions ---

// Rooms
const atrium = createRoom(2, 'atrium', 'Grand Atrium', 'A vast, echoing chamber with a high vaulted ceiling. Light filters in through dust-moted shafts from high windows.', [5, 6, 20, 21]);
const garden = createRoom(3, 'garden', 'Overgrown Garden', 'Nature has reclaimed this space. Vines thick as a man\'s arm slightly obscure the crumbling stone walls.', [8, 22]);
const lab = createRoom(4, 'lab', 'Research Lab', 'Clean, white, and sterile. Banks of servers blink rhythmically against the far wall.', [7, 23]);

// Items & Props
const statue = createProp(5, 'statue_hero', 'Marble Statue', 'A statue of a forgotten hero, their face worn away by time.');
statue.components.position = { roomId: 2 };

const key = createItem(6, 'rusty_key', 'Rusty Key', 'An old iron key, heavy and covered in rust.');
key.components.position = { roomId: 2 };

const datapad = createItem(7, 'datapad', 'Cracked Datapad', 'A screen displaying a fragmented log entry.');
datapad.components.position = { roomId: 4 };

// NPC
const npc: Entity = {
    id: 8,
    alias: 'gardener_bot',
    type: 'npc',
    visible: true,
    components: {
        identity: {
            name: 'Unit-734',
            description: 'A hovering maintenance droid, pruning a rosebush with delicate lasers.'
        },
        stats: { strength: 10, health: 50, maxHealth: 50 },
        container: { contents: [] },
        position: { roomId: 3 },
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
        }
    }
};

// Exits
const exitGarden = createExit(20, 'exit_garden', 'Garden Gate', 2, 3);
const exitLab = createExit(21, 'exit_lab', 'Lab Corridor', 2, 4);
const exitAtriumFromGarden = createExit(22, 'exit_atrium_garden', 'Back to Atrium', 3, 2);
const exitAtriumFromLab = createExit(23, 'exit_atrium_lab', 'Main Hall', 4, 2);

// Player
const playerEntity: Entity = {
    id: 1,
    alias: 'player',
    type: 'player', // Special type for the player
    visible: false, // Player is hidden by default
    components: {
        identity: { name: 'Traveler', description: 'A wanderer in this strange place.' },
        stats: { strength: 12, health: 100, maxHealth: 100 },
        container: { contents: [], capacity: 10 },
        position: { roomId: 2 } // Start in Atrium
    }
};

// Aggregate all entities
const allEntitiesList = [atrium, garden, lab, statue, key, datapad, npc, exitGarden, exitLab, exitAtriumFromGarden, exitAtriumFromLab, playerEntity];
const entitiesMap: Record<number, Entity> = {};
allEntitiesList.forEach(e => entitiesMap[e.id] = e);

// World Def
const EMBEDDED_WORLD = (window as any).DIEGESIS_WORLD_DEFINITION as WorldDefinition | undefined;

export const INITIAL_WORLD: WorldDefinition = EMBEDDED_WORLD || {
    meta: {
        title: 'The Abandoned Station',
        author: 'System',
        version: '2.0.1'
    },
    entities: entitiesMap,
    start: {
        roomId: 2,
        player: { ...playerEntity }
    }
};

export const INITIAL_STATE: GameState = {
    worldId: `${INITIAL_WORLD.meta.title}_${INITIAL_WORLD.meta.version}`,
    meta: INITIAL_WORLD.meta,
    player: 1,
    world: {
        nextId: 100,
        entities: INITIAL_WORLD.entities,
    },
    time: 0,
    variables: {},
    messageLog: [],
};

