import React, { createContext, useContext, useReducer, type Dispatch } from 'react';
import type { GameState } from '../types';
import type { Action } from './actions';
import { gameReducer } from './gameReducer';
import { INITIAL_STATE } from '../data/initialState';

interface GameContextProps {
    state: GameState;
    dispatch: Dispatch<Action>;
}

import { saveWorldDefinition, loadWorldDefinition } from './persistence';

const GameContext = createContext<GameContextProps | undefined>(undefined);

const AUTO_SAVE_DELAY = 1000; // 1 second debounce

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
    const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initial Load with Version Check
    React.useEffect(() => {
        const savedDefinition = loadWorldDefinition();

        // Version Check: If the code has a newer version than the save, we reset.
        if (savedDefinition && savedDefinition.meta.version === INITIAL_STATE.meta.version) {
            console.log('Loading saved world:', savedDefinition.meta.version);
            dispatch({ type: 'LOAD_WORLD', payload: { definition: savedDefinition } });
        } else {
            console.log('Version mismatch or no save. resetting to default:', INITIAL_STATE.meta.version);
            // We don't need to dispatch LOAD_WORLD because INITIAL_STATE is already loaded by useReducer default
            // But if we want to be explicit or if INITIAL_STATE was just a seed, we could.
            // In this case, useReducer(..., INITIAL_STATE) handles it.
            // However, if we had a save in localStorage but it's old, we should probably clear it to avoid confusion later?
            // saveWorldDefinition(INITIAL_WORLD); // Optional: immediately overwrite old save
        }
    }, []);

    // Auto-Save Middleware
    React.useEffect(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            if (state.meta) { // Only save if we have a valid world loaded
                const worldDefinition = {
                    meta: state.meta,
                    rooms: state.world.rooms,
                    entities: state.world.entities,
                    start: {
                        roomId: state.player.components.position.currentRoomId,
                        player: {
                            components: state.player.components
                        }
                    }
                };
                saveWorldDefinition(worldDefinition);
            }
        }, AUTO_SAVE_DELAY);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [state.world.rooms, state.world.entities, state.meta, state.player.components]); // Dependencies for auto-save

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
