import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useGame } from '../../store/GameContext';
import './GameMap.css';

interface Node {
    id: number;
    name: string;
    x: number;
    y: number;
}

interface Transform {
    x: number;
    y: number;
    k: number;
}

interface DragScale {
    x: number;
    y: number;
}

interface EdgeHover {
    label: string;
    x: number;
    y: number;
}

export const GameMap: React.FC = () => {
    const { state, dispatch } = useGame();
    // const rooms = state.world.rooms; // OLD
    const currentRoomId = state.world.entities[state.player]?.components.position?.roomId;

    const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [draggingNode, setDraggingNode] = useState<number | null>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [hoveredEdge, setHoveredEdge] = useState<EdgeHover | null>(null);

    // Local override for node positions during drag
    const [localNodePos, setLocalNodePos] = useState<Record<number, { x: number, y: number }>>({});

    const svgRef = useRef<SVGSVGElement>(null);
    const lastMousePos = useRef({ x: 0, y: 0 }); // Screen coords

    // Persistence tracking
    const dragStartTransform = useRef<Transform>({ x: 0, y: 0, k: 1 });
    const dragScaleRef = useRef<DragScale>({ x: 1, y: 1 });

    // Refs for stable event handlers
    const transformRef = useRef(transform);

    useEffect(() => {
        transformRef.current = transform;
    }, [transform]);

    // Calculate effective nodes
    const nodes = useMemo(() => {
        // Filter for Room Type Exclusively
        const roomEntities = Object.values(state.world.entities).filter(e => e.type === 'room');
        const roomIds = roomEntities.map(r => r.id);

        const centerX = 250;
        const centerY = 250;
        const radius = Math.min(roomIds.length * 15, 100);

        return roomEntities.reduce((acc, room, index) => {
            const id = room.id;
            // TODO: Store mapPosition in a component? e.g. components.editor { x, y }
            // For now, we don't have persistent map positions in the new Entity component map standard yet.
            // But we can fallback to auto-layout.

            // Checking if we have saved positions in local state (or maybe we should add 'editor' component?)
            const pos = localNodePos[id]; // || room.components.editor?.mapPosition;

            if (pos) {
                acc[id] = { id, name: room.components.identity?.name || room.alias, ...pos };
            } else {
                const angle = (index / roomIds.length) * 2 * Math.PI;
                acc[id] = {
                    id,
                    name: room.components.identity?.name || room.alias,
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                };
            }
            return acc;
        }, {} as Record<number, Node>);
    }, [state.world.entities, localNodePos]);

    const nodesRef = useRef(nodes);
    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    const edges = useMemo(() => {
        const result: { from: number, to: number, label: string }[] = [];
        const entities = state.world.entities;

        // Iterate all rooms
        Object.values(entities).filter(e => e.type === 'room').forEach(room => {
            // Find exits in this room's contents
            const contents = room.components.container?.contents || [];

            contents.forEach(entityId => {
                const entity = entities[entityId];
                // Check if it's an exit (has exit component)
                if (entity && entity.components.exit) {
                    const targetRoomId = entity.components.exit.targetRoomId;
                    if (targetRoomId && nodes[room.id] && nodes[targetRoomId]) {
                        result.push({
                            from: room.id,
                            to: targetRoomId,
                            label: entity.components.identity?.name || entity.alias
                        });
                    }
                }
            });
        });
        return result;
    }, [nodes, state.world.entities]);

    // Precise coordinate conversion helper


    const screenToSvg = useCallback((clientX: number, clientY: number) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        return pt.matrixTransform(svg.getScreenCTM()?.inverse());
    }, []);

    // --- Interaction Handlers ---

    const handleWheel = (e: React.WheelEvent) => {
        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newK = Math.min(Math.max(transform.k * scaleFactor, 0.2), 5);

        const coords = screenToSvg(e.clientX, e.clientY);
        const worldX = (coords.x - transform.x) / transform.k;
        const worldY = (coords.y - transform.y) / transform.k;

        setTransform({
            x: coords.x - worldX * newK,
            y: coords.y - worldY * newK,
            k: newK
        });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        const svgCoords = screenToSvg(e.clientX, e.clientY);

        // Cache the current SVG scale factor (Screen -> SVG)
        // This accounts for strict aspect ratio (meet) and avoids layout thrashing during move
        if (svgRef.current) {
            const ctm = svgRef.current.getScreenCTM();
            if (ctm) {
                const inverse = ctm.inverse();
                dragScaleRef.current = { x: inverse.a, y: inverse.d };
            }
        }

        const target = e.target as SVGElement;
        const nodeG = target.closest('.map-node');

        if (nodeG) {
            const nodeId = Number(nodeG.getAttribute('data-id'));
            // If we are clicking specifically the teleport bubble, don't drag
            if (target.closest('.teleport-bubble')) return;

            if (!isNaN(nodeId)) setDraggingNode(nodeId);
        } else {
            setIsPanning(true);
            dragStartTransform.current = { ...transform };
            // Coordinate for panning is in SVG space
            dragStartCoords.current = svgCoords;
            setSelectedRoomId(null);
        }
    };

    const dragStartCoords = useRef({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const dx_screen = e.clientX - lastMousePos.current.x;
        const dy_screen = e.clientY - lastMousePos.current.y;
        lastMousePos.current = { x: e.clientX, y: e.clientY };

        const scale = dragScaleRef.current;

        if (draggingNode !== null) {
            // Use ref for transform k to avoid dependency
            const currentK = transformRef.current.k;
            const dx_world = (dx_screen * scale.x) / currentK;
            const dy_world = (dy_screen * scale.y) / currentK;

            setLocalNodePos(prev => {
                // Use ref for nodes to avoid dependency
                const currentPos = prev[draggingNode] || nodesRef.current[draggingNode];
                if (!currentPos) return prev; // Safety check

                return {
                    ...prev,
                    [draggingNode]: {
                        x: currentPos.x + dx_world,
                        y: currentPos.y + dy_world
                    }
                };
            });
        } else if (isPanning) {
            setTransform(prev => ({
                ...prev,
                x: prev.x + dx_screen * scale.x,
                y: prev.y + dy_screen * scale.y
            }));
        }
    }, [draggingNode, isPanning]);

    const handleMouseUp = useCallback(() => {
        if (draggingNode !== null) {
            const finalPos = localNodePos[draggingNode];
            if (finalPos) {
                dispatch({
                    type: 'SET_ROOM_POSITION',
                    payload: { roomId: draggingNode, ...finalPos }
                });
            }
        }
        setDraggingNode(null);
        setIsPanning(false);
    }, [draggingNode, localNodePos, dispatch]);

    useEffect(() => {
        if (draggingNode !== null || isPanning) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingNode, isPanning, handleMouseMove, handleMouseUp]);

    const handleTeleport = (roomId: number) => {
        dispatch({ type: 'TELEPORT_PLAYER', payload: { roomId } });
        setSelectedRoomId(null);
    };

    const resetView = () => setTransform({ x: 0, y: 0, k: 1 });


    return (
        <div className="game-map-container" onWheel={handleWheel}>
            <div className="map-controls">
                <button title="Zoom In" onClick={() => setTransform(t => ({ ...t, k: t.k * 1.2 }))}>+</button>
                <button title="Zoom Out" onClick={() => setTransform(t => ({ ...t, k: t.k * 0.8 }))}>-</button>
                <button title="Reset View" onClick={resetView}>Reset</button>
            </div>

            <svg
                ref={svgRef}
                viewBox="0 0 500 500"
                className={`game-map-svg ${isPanning ? 'grabbing' : ''}`}
                onMouseDown={handleMouseDown}
            >
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7"
                        refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="var(--border)" />
                    </marker>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
                    {/* Draw Edges */}
                    {edges.map((edge, i) => {
                        const from = nodes[edge.from];
                        const to = nodes[edge.to];

                        const dx = to.x - from.x;
                        const dy = to.y - from.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist === 0) return null;

                        const offsetX = (dy / dist) * 4;
                        const offsetY = (-dx / dist) * 4;

                        const startX = from.x + offsetX + (dx / dist) * 15;
                        const startY = from.y + offsetY + (dy / dist) * 15;
                        const endX = to.x + offsetX - (dx / dist) * 18;
                        const endY = to.y + offsetY - (dy / dist) * 18;

                        const midX = (startX + endX) / 2;
                        const midY = (startY + endY) / 2;

                        return (
                            <g key={`${edge.from}-${edge.to}-${i}`} className="map-edge-group">
                                <line
                                    x1={startX} y1={startY}
                                    x2={endX} y2={endY}
                                    stroke="var(--border)"
                                    strokeWidth="1.5"
                                    markerEnd="url(#arrowhead)"
                                    className="map-edge"
                                />
                                <line
                                    x1={startX} y1={startY}
                                    x2={endX} y2={endY}
                                    stroke="transparent"
                                    strokeWidth="10"
                                    onMouseEnter={() => setHoveredEdge({ label: edge.label, x: midX, y: midY })}
                                    onMouseLeave={() => setHoveredEdge(null)}
                                    className="map-edge-hitbox"
                                />
                            </g>
                        );
                    })}

                    {/* Draw Nodes */}
                    {Object.values(nodes).map(node => (
                        <g
                            key={node.id}
                            data-id={node.id}
                            className={`map-node ${node.id === currentRoomId ? 'current' : ''} ${selectedRoomId === node.id ? 'selected' : ''}`}
                            onClick={() => {
                                if (!isPanning && !draggingNode) {
                                    setSelectedRoomId(node.id === selectedRoomId ? null : node.id);
                                }
                            }}
                        >
                            <circle cx={node.x} cy={node.y} r="15" />
                            <text x={node.x} y={node.y + 25} textAnchor="middle" className="node-label">
                                {node.name}
                            </text>

                            {/* SVG-based Teleport Bubble - Clickable g instead of just text */}
                            {selectedRoomId === node.id && (
                                <g
                                    className="teleport-bubble"
                                    transform={`translate(${node.x}, ${node.y - 25})`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTeleport(node.id);
                                    }}
                                >
                                    <rect x="-10" y="-6" width="20" height="12" rx="6" className="bubble-bg" />
                                    <text y="2.5" textAnchor="middle" className="bubble-text">
                                        GO
                                    </text>
                                </g>
                            )}
                        </g>
                    ))}

                    {/* Edge Hover Tooltip */}
                    {hoveredEdge && (
                        <g className="edge-tooltip" transform={`translate(${hoveredEdge.x}, ${hoveredEdge.y})`}>
                            <rect x={-hoveredEdge.label.length * 3 - 5} y="-12" width={hoveredEdge.label.length * 6 + 10} height="16" rx="2" className="edge-tip-bg" />
                            <text y="0" textAnchor="middle" className="edge-tip-text">{hoveredEdge.label}</text>
                        </g>
                    )}
                </g>
            </svg>
        </div>
    );
};
