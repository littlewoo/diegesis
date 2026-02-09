import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Layout.css';

interface LayoutProps {
    sidebar: React.ReactNode;
    main: React.ReactNode;
    bottomPanel?: React.ReactNode; // For Admin tools later
}

export const Layout: React.FC<LayoutProps> = ({ sidebar, main, bottomPanel }) => {
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [adminHeight, setAdminHeight] = useState(250);
    const isResizingSidebar = useRef(false);
    const isResizingAdmin = useRef(false);

    // Initial load from localStorage
    useEffect(() => {
        const savedSidebarWidth = localStorage.getItem('diegesis_sidebar_width');
        const savedAdminHeight = localStorage.getItem('diegesis_admin_height');
        if (savedSidebarWidth) setSidebarWidth(parseInt(savedSidebarWidth, 10));
        if (savedAdminHeight) setAdminHeight(parseInt(savedAdminHeight, 10));
    }, []);

    const startResizingSidebar = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizingSidebar.current = true;
        document.body.style.cursor = 'col-resize';
    }, []);

    const startResizingAdmin = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizingAdmin.current = true;
        document.body.style.cursor = 'row-resize';
    }, []);

    const stopResizing = useCallback(() => {
        if (isResizingSidebar.current) {
            localStorage.setItem('diegesis_sidebar_width', sidebarWidth.toString());
        }
        if (isResizingAdmin.current) {
            localStorage.setItem('diegesis_admin_height', adminHeight.toString());
        }
        isResizingSidebar.current = false;
        isResizingAdmin.current = false;
        document.body.style.cursor = 'default';
    }, [sidebarWidth, adminHeight]);

    const resize = useCallback((e: MouseEvent) => {
        if (isResizingSidebar.current) {
            setSidebarWidth(e.clientX);
        } else if (isResizingAdmin.current) {
            const height = window.innerHeight - e.clientY;
            setAdminHeight(height);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    return (
        <div
            className="game-layout"
            style={{
                gridTemplateColumns: `${sidebarWidth}px 1fr`,
                gridTemplateRows: bottomPanel ? `1fr ${adminHeight}px` : '1fr auto'
            } as React.CSSProperties}
        >
            <aside className="game-sidebar">
                {sidebar}
            </aside>
            <div className="resizer-v" onMouseDown={startResizingSidebar} />
            <main className="game-viewport">
                {main}
            </main>
            {bottomPanel && (
                <>
                    <div className="resizer-h" onMouseDown={startResizingAdmin} />
                    <footer className="game-bottom-panel">
                        {bottomPanel}
                    </footer>
                </>
            )}
        </div>
    );
};
