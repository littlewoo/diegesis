import type { GameState, Script, Condition, Effect, TriggerType, Entity } from '../types';
import type { Action } from '../store/actions';

/**
 * ScriptEngine: The brain of the narrative interaction system.
 * It evaluates conditions against the current game state and determines triggers.
 */

// Define ScriptContext type for resolveTarget
type ScriptContext = {
    gameState: GameState;
    // Add other context properties as needed, e.g., current entity, player, etc.
};

export const resolveTarget = (targetAlias: string, context: ScriptContext): Entity | undefined => {
    if (!targetAlias) return undefined;

    // 1. Check if it's "player"
    if (targetAlias === 'player') {
        const playerId = context.gameState.player;
        return context.gameState.world.entities[playerId];
    }

    // 2. Lookup in Entities (by Alias)
    const entity = Object.values(context.gameState.world.entities).find(e => e.alias === targetAlias);
    if (entity) return entity;

    // 3. Fallback: Check if it's a raw numeric ID (as a string)
    const id = Number(targetAlias);
    if (!isNaN(id)) {
        if (context.gameState.world.entities[id]) return context.gameState.world.entities[id];
    }

    return undefined;
};

export const ScriptEngine = {
    /**
     * Checks if a script's conditions are met.
     */
    evaluateConditions(state: GameState, conditions?: Condition[]): boolean {
        if (!conditions || conditions.length === 0) return true;

        return conditions.every(condition => {
            switch (condition.type) {
                case 'FLAG_TRUE':
                    return !!state.variables[condition.flag];
                case 'FLAG_FALSE':
                    return !state.variables[condition.flag];
                default:
                    console.warn(`Unknown condition type: ${(condition as any).type}`);
                    return false;
            }
        });
    },

    /**
     * Processes a list of effects and converts them into Redux actions.
     * Note: Some effects (like SHOW_DIALOGUE) might need to be handled by the UI directly,
     * but we return them as "Intents" or actions where possible.
     */
    processEffects(effects: Effect[]): Action[] {
        const actions: Action[] = [];

        effects.forEach(effect => {
            switch (effect.type) {
                case 'SET_FLAG':
                    actions.push({
                        type: 'SET_VARIABLE',
                        payload: { key: effect.flag, value: effect.value }
                    });
                    break;
                case 'SHOW_DIALOGUE':
                    actions.push({
                        type: 'ADD_MESSAGE',
                        payload: { text: effect.text }
                    });
                    break;
            }
        });

        return actions;
    },

    /**
     * Main entry point: Given an entity and a trigger, find valid scripts and execute them.
     * Returns a list of Actions to dispatch.
     */
    executeTrigger(state: GameState, scripts: Record<string, Script[]> | undefined, trigger: TriggerType): Action[] {
        if (!scripts || !scripts[trigger]) return [];

        const validScript = scripts[trigger].find(script =>
            this.evaluateConditions(state, script.conditions)
        );

        if (!validScript) return [];

        return this.processEffects(validScript.effects);
    }
};
