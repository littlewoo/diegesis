import type { GameState, Room, Player, Item, WorldObject, GameObject } from '../types';

const INITIAL_ROOM_ID = 'atrium';

// Helper to create basic entities
const createItem = (id: string, name: string, description: string): Item => ({
    id, type: 'item', name, description,
    components: { carryable: { weight: 1, value: 10 } }
});

const createScenery = (id: string, name: string, description: string): WorldObject => ({
    id, type: 'scenery', name, description,
    components: {}
});

const atrium: Room = {
    id: 'atrium',
    type: 'room',
    name: 'Grand Atrium',
    description: 'A vast, echoing chamber with a high vaulted ceiling. Light filters in through dust-moted shafts from high windows.',
    components: {},
    exits: [
        { id: 'exit_garden', label: 'Garden Gate', targetRoomId: 'garden' },
        { id: 'exit_lab', label: 'Lab Corridor', targetRoomId: 'lab' },
    ],
    contents: ['statue_hero', 'rusty_key'],
};

const garden: Room = {
    id: 'garden',
    type: 'room',
    name: 'Overgrown Garden',
    description: 'Nature has reclaimed this space. Vines thick as a man\'s arm slightly obscure the crumbling stone walls.',
    components: {},
    exits: [
        { id: 'exit_atrium', label: 'Back to Atrium', targetRoomId: 'atrium' }
    ],
    contents: ['gardener_bot'],
};

const lab: Room = {
    id: 'lab',
    type: 'room',
    name: 'Research Lab',
    description: 'Clean, white, and sterile. Banks of servers blink rhythmically against the far wall.',
    components: {},
    exits: [
        { id: 'exit_atrium', label: 'Main Hall', targetRoomId: 'atrium' }
    ],
    contents: ['datapad'],
};

// Entities
const statue: WorldObject = createScenery('statue_hero', 'Marble Statue', 'A statue of a forgotten hero, their face worn away by time.');
const key: Item = createItem('rusty_key', 'Rusty Key', 'An old iron key, heavy and covered in rust.');
const datapad: Item = createItem('datapad', 'Cracked Datapad', 'A screen displaying a fragmented log entry.');

const npc: GameObject = {
    id: 'gardener_bot',
    type: 'npc',
    name: 'Unit-734',
    description: 'A hovering maintenance droid, pruning a rosebush with delicate lasers.',
    components: {
        interactions: [
            { label: 'Talk', actionId: 'talk_gardener' }
        ]
    }
};

const player: Player = {
    id: 'player',
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

export const INITIAL_STATE: GameState = {
    player,
    world: {
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
        },
    },
    time: 0,
    flags: {},
};
