import React from 'react';
import type { Entity } from '../types';
import './InteractionList.css';

interface InteractionListProps {
    entities: Entity[];
    onInteract: (entityId: number, actionId: string) => void;
}

export const InteractionList: React.FC<InteractionListProps> = ({ entities, onInteract }) => {
    if (entities.length === 0) return null;

    return (
        <div className="interaction-list">
            <h3>Interactables</h3>
            <div className="entity-grid">
                {entities.map(entity => {
                    const isItem = !!entity.components.portable;
                    const isNPC = !!entity.components.stats || entity.type === 'npc';
                    const name = entity.components.identity.name; // Assumes identity always exists
                    const icon = entity.components.identity.icon || (isItem ? '📦' : (isNPC ? '👤' : '❓'));

                    return (
                        <div key={entity.id} className="interaction-card">
                            <div className="card-header">
                                <span className="entity-icon">{icon}</span>
                                <span className="entity-name">{name}</span>
                            </div>
                            <div className="card-actions">
                                <button onClick={() => onInteract(entity.id, 'examine')}>Examine</button>
                                {isItem && <button onClick={() => onInteract(entity.id, 'pickup')}>Pick Up</button>}
                                {isNPC && <button onClick={() => onInteract(entity.id, 'talk')}>Talk</button>}

                                {/* Future: Dynamic actions from ScriptComponent keywords? */}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
