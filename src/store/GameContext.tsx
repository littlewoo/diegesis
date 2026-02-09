import React, { createContext, useContext, useReducer, type Dispatch } from 'react';
import type { GameState } from '../types';
import type { Action } from './actions';
import { gameReducer } from './gameReducer';
import { INITIAL_STATE } from '../data/initialState';

interface GameContextProps {
    state: GameState;
    dispatch: Dispatch<Action>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

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
