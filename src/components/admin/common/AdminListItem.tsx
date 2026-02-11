import React from 'react';
import './AdminComponents.css';

interface AdminListItemProps {
    label: React.ReactNode;
    subLabel?: React.ReactNode;
    onClick: () => void;
    onDelete?: () => void;
    deleteTitle?: string;
    className?: string;
    isActive?: boolean;
}

export const AdminListItem: React.FC<AdminListItemProps> = ({
    label,
    subLabel,
    onClick,
    onDelete,
    deleteTitle = "Delete",
    className = '',
    isActive = false
}) => {
    return (
        <div
            className={`admin-list-item ${className} ${isActive ? 'active' : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
        >
            <div className="admin-list-info" style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <span className="admin-list-label">{label}</span>
                {subLabel && <span className="admin-list-sublabel">{subLabel}</span>}
            </div>

            <div className="admin-list-actions">
                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="delete-btn"
                        title={deleteTitle}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};
