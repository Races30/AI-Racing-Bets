'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
    PlacedPiece,
    PieceType,
    PieceVariant,
    EditorTool,
    ValidationResult,
} from '@/lib/track-editor/types';
import { getPieceDef } from '@/lib/track-editor/pieces';
import {
    pieceTransform,
    trySnap,
    getAbsoluteExit,
    computeUsedExits,
} from '@/lib/track-editor/geometry';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TrackCanvasProps {
    pieces: PlacedPiece[];
    selectedPieceId: string | null;
    activeTool: EditorTool;
    activePieceType: PieceType | null;
    activePieceVariant: PieceVariant | null;
    panX: number;
    panY: number;
    zoom: number;
    validation: ValidationResult;
    onPiecePlaced: (piece: PlacedPiece) => void;
    onPieceSelect: (id: string | null) => void;
    onPan: (dx: number, dy: number) => void;
    onZoom: (delta: number, cx: number, cy: number) => void;
    onPieceDelete: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TrackCanvas({
    pieces,
    selectedPieceId,
    activeTool,
    activePieceType,
    activePieceVariant,
    panX,
    panY,
    zoom,
    validation,
    onPiecePlaced,
    onPieceSelect,
    onPan,
    onZoom,
    onPieceDelete,
}: TrackCanvasProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const isPanning = useRef(false);
    const lastPointer = useRef({ x: 0, y: 0 });

    const [ghost, setGhost] = useState<{
        x: number;
        y: number;
        rotation: number;
        snapped: boolean;
    } | null>(null);

    const usedExits = computeUsedExits(pieces);

    // ─── Scroll/zoom non-passivo (deve chiamare preventDefault) ────────────────
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        const handler = (e: WheelEvent) => {
            e.preventDefault();
            onZoom(-e.deltaY * 0.8, e.clientX, e.clientY);
        };
        svg.addEventListener('wheel', handler, { passive: false });
        return () => svg.removeEventListener('wheel', handler);
    }, [onZoom]);

    // ─── Delete/Backspace per eliminare pezzo selezionato ──────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPieceId) {
                onPieceDelete(selectedPieceId);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [selectedPieceId, onPieceDelete]);

    // ─── Conversione coordinate schermo → mondo SVG ────────────────────────────
    const screenToWorld = useCallback(
        (sx: number, sy: number) => {
            const rect = svgRef.current?.getBoundingClientRect();
            if (!rect) return { x: 0, y: 0 };
            return {
                x: (sx - rect.left - panX) / zoom,
                y: (sy - rect.top - panY) / zoom,
            };
        },
        [panX, panY, zoom],
    );

    // ─── Mouse events ──────────────────────────────────────────────────────────
    const handleMouseMove = useCallback(
        (e: React.MouseEvent<SVGSVGElement>) => {
            if (isPanning.current) {
                onPan(e.clientX - lastPointer.current.x, e.clientY - lastPointer.current.y);
                lastPointer.current = { x: e.clientX, y: e.clientY };
                return;
            }
            if (activeTool === 'place' && activePieceType && activePieceVariant) {
                const w = screenToWorld(e.clientX, e.clientY);
                const snap = trySnap(w.x, w.y, pieces, usedExits);
                setGhost(
                    snap
                        ? { x: snap.x, y: snap.y, rotation: snap.rotation, snapped: true }
                        : { x: w.x, y: w.y, rotation: 0, snapped: false },
                );
            }
        },
        [activeTool, activePieceType, activePieceVariant, pieces, usedExits, screenToWorld, onPan],
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<SVGSVGElement>) => {
            if (activeTool === 'pan' || e.button === 1) {
                isPanning.current = true;
                lastPointer.current = { x: e.clientX, y: e.clientY };
                e.preventDefault();
            }
        },
        [activeTool],
    );

    const handleMouseUp = useCallback(() => { isPanning.current = false; }, []);
    const handleMouseLeave = useCallback(() => { isPanning.current = false; setGhost(null); }, []);

    const handleClick = useCallback(
        (e: React.MouseEvent<SVGSVGElement>) => {
            if (activeTool !== 'place' || !activePieceType || !activePieceVariant || !ghost) return;
            const newPiece: PlacedPiece = {
                id: crypto.randomUUID(),
                type: activePieceType,
                variant: activePieceVariant,
                x: ghost.x,
                y: ghost.y,
                rotation: ghost.rotation,
            };
            onPiecePlaced(newPiece);
        },
        [activeTool, activePieceType, activePieceVariant, ghost, onPiecePlaced],
    );

    // ─── Render pezzo SVG ──────────────────────────────────────────────────────
    const renderPiece = (piece: PlacedPiece, isGhost = false) => {
        const def = getPieceDef(piece.type, piece.variant);
        if (!def) return null;

        const isSelected = !isGhost && piece.id === selectedPieceId;
        const isBorder = piece.type === 'border';

        let roadColor = def.color;
        if (isGhost) roadColor = ghost?.snapped ? '#4ade80' : '#94a3b8';
        if (isSelected) roadColor = '#38bdf8';

        return (
            <g
                key={piece.id}
                transform={pieceTransform(piece)}
                opacity={isGhost ? 0.55 : 1}
                style={{ cursor: activeTool === 'select' && !isGhost ? 'pointer' : 'default' }}
                onClick={
                    activeTool === 'select' && !isGhost
                        ? (e) => { e.stopPropagation(); onPieceSelect(piece.id); }
                        : undefined
                }
            >
                {/* Alone selezione */}
                {isSelected && (
                    <path
                        d={def.svgPath}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth={def.trackWidth + 18}
                        strokeLinecap="round"
                        strokeOpacity={0.22}
                    />
                )}
                {/* Bordo asfalto */}
                <path
                    d={def.svgPath}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth={def.trackWidth + 10}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Superficie strada */}
                <path
                    d={def.svgPath}
                    fill="none"
                    stroke={roadColor}
                    strokeWidth={def.trackWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={isBorder ? '10 6' : undefined}
                />
                {/* Linea di mezzeria tratteggiata */}
                {!isBorder && (
                    <path
                        d={def.svgPath}
                        fill="none"
                        stroke="rgba(255,255,255,0.18)"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeDasharray="14 10"
                    />
                )}
            </g>
        );
    };

    // ─── Render connettori ─────────────────────────────────────────────────────
    const renderConnector = (piece: PlacedPiece) => {
        const def = getPieceDef(piece.type, piece.variant);
        if (!def) return null;
        const exit = getAbsoluteExit(piece, def);
        const free = !usedExits.has(piece.id);

        return (
            <g key={`conn-${piece.id}`}>
                <circle cx={exit.x} cy={exit.y} r={5} fill={free ? '#ef4444' : '#22c55e'} stroke="#0f172a" strokeWidth={2} />
                {free && (
                    <circle cx={exit.x} cy={exit.y} r={5} fill="none" stroke="#ef4444" strokeWidth={1.5}>
                        <animate attributeName="r" values="5;16;5" dur="1.4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.9;0;0.9" dur="1.4s" repeatCount="indefinite" />
                    </circle>
                )}
            </g>
        );
    };

    const cursor = activeTool === 'pan' ? 'grab' : activeTool === 'place' ? 'crosshair' : 'default';

    // ─── JSX ──────────────────────────────────────────────────────────────────
    return (
        <svg
            ref={svgRef}
            className="w-full h-full select-none"
            style={{ cursor, background: '#080d18' }}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {/* Griglia di sfondo */}
            <defs>
                <pattern
                    id="track-grid"
                    width={40 * zoom}
                    height={40 * zoom}
                    patternUnits="userSpaceOnUse"
                    x={panX % (40 * zoom)}
                    y={panY % (40 * zoom)}
                >
                    <path
                        d={`M ${40 * zoom} 0 L 0 0 0 ${40 * zoom}`}
                        fill="none"
                        stroke="rgba(255,255,255,0.035)"
                        strokeWidth={1}
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#track-grid)" />

            {/* Gruppo mondo (pan + zoom) */}
            <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
                {/* Area trasparente per deselezionare in select mode */}
                {activeTool === 'select' && (
                    <rect
                        x="-50000" y="-50000" width="100000" height="100000"
                        fill="transparent"
                        onClick={() => onPieceSelect(null)}
                    />
                )}

                {/* Pezzi piazzati */}
                {pieces.map((p) => renderPiece(p))}

                {/* Connettori */}
                {pieces.map((p) => renderConnector(p))}

                {/* Ghost di piazzamento */}
                {ghost && activePieceType && activePieceVariant &&
                    renderPiece({ id: '__ghost__', type: activePieceType, variant: activePieceVariant, x: ghost.x, y: ghost.y, rotation: ghost.rotation }, true)
                }

                {/* Marker circuito aperto */}
                {validation.status === 'open' && validation.openPoint && (
                    <g transform={`translate(${validation.openPoint.x}, ${validation.openPoint.y})`}>
                        <circle r={20} fill="none" stroke="#ef4444" strokeWidth={2.5} opacity={0.7}>
                            <animate attributeName="r" values="16;26;16" dur="1.2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.2s" repeatCount="indefinite" />
                        </circle>
                        <line x1="-10" y1="0" x2="10" y2="0" stroke="#ef4444" strokeWidth={3} strokeLinecap="round" />
                        <line x1="0" y1="-10" x2="0" y2="10" stroke="#ef4444" strokeWidth={3} strokeLinecap="round" />
                    </g>
                )}
            </g>
        </svg>
    );
}
