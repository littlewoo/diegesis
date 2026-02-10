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

    // Initial Load
    React.useEffect(() => {
        const savedDefinition = loadWorldDefinition();
        if (savedDefinition) {
            dispatch({ type: 'LOAD_WORLD', payload: { definition: savedDefinition } });
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
