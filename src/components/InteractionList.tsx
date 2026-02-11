import React from 'react';
import type { GameObject } from '../types';
import './InteractionList.css';

interface InteractionListProps {
    entities: GameObject[];
    onInteract: (entityId: number, actionId: string) => void;
}

export const InteractionList: React.FC<InteractionListProps> = ({ entities, onInteract }) => {
    if (entities.length === 0) return null;

    return (
        <div className="interaction-list">
            <h3>Interactables</h3>
            <div className="entity-grid">
                {entities.map(entity => {
                    // For now, hardcoding a "Look" action for everyone, and "Pick Up" for items
                    // real logic would check entity.components.interactions
                    const isItem = entity.type === 'item';

                    return (
                        <div key={entity.id} className="interaction-card">
                            <div className="card-header">
                                <span className="entity-icon">{isItem ? '📦' : '👤'}</span>
                                <span className="entity-name">{entity.name}</span>
                            </div>
                            <div className="card-actions">
                                <button onClick={() => onInteract(entity.id, 'examine')}>Examine</button>
                                {isItem && <button onClick={() => onInteract(entity.id, 'pickup')}>Pick Up</button>}

                                {entity.components?.interactions?.map((interaction: any) => (
                                    <button
                                        key={interaction.actionId}
                                        onClick={() => onInteract(entity.id, interaction.actionId)}
                                    >
                                        {interaction.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
