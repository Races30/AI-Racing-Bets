'use client';

import { useState } from 'react';
import type { PieceType, PieceVariant, EditorTool, ValidationResult } from '@/lib/track-editor/types';
import { PIECE_CATALOG, PieceDefinitionFull } from '@/lib/track-editor/pieces';

interface ToolbarProps {
    activeTool: EditorTool;
    activePieceType: PieceType | null;
    activePieceVariant: PieceVariant | null;
    trackName: string;
    validation: ValidationResult;
    isSaving: boolean;
    onSelectTool: (tool: EditorTool) => void;
    onSelectPiece: (type: PieceType, variant: PieceVariant) => void;
    onTrackNameChange: (name: string) => void;
    onSave: () => void;
    onClear: () => void;
    onOpenTrackList: () => void;
}

const CATEGORIES: { id: PieceType; label: string; icon: string }[] = [
    { id: 'straight', label: 'Rettilinei', icon: '📏' },
    { id: 'curve-right', label: 'Curve Des', icon: '↪️' },
    { id: 'curve-left', label: 'Curve Sin', icon: '↩️' },
    { id: 'chicane', label: 'Chicane', icon: '🔀' },
    { id: 'border', label: 'Bordi & Cordoli', icon: '🚧' },
];

export function Toolbar({
    activeTool,
    activePieceType,
    activePieceVariant,
    trackName,
    validation,
    isSaving,
    onSelectTool,
    onSelectPiece,
    onTrackNameChange,
    onSave,
    onClear,
    onOpenTrackList,
}: ToolbarProps) {
    const [activeCategory, setActiveCategory] = useState<PieceType>('straight');

    const categoryPieces = PIECE_CATALOG.filter((p) => p.type === activeCategory);

    return (
        <div className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-3 pointer-events-none">
            {/* Bar Superiore: Titolo + Strumenti + Stato + Salvataggio */}
            <div className="flex items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl shadow-2xl pointer-events-auto">
                {/* Nome pista */}
                <div className="flex items-center gap-2">
                    <span className="text-xl">🏎️</span>
                    <input
                        type="text"
                        value={trackName}
                        onChange={(e) => onTrackNameChange(e.target.value)}
                        placeholder="Nome della pista..."
                        className="bg-slate-800 border border-slate-700 text-slate-100 font-semibold px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-cyan-500 w-48 transition"
                    />
                </div>

                {/* Strumenti principali */}
                <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                        onClick={() => onSelectTool('select')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${activeTool === 'select'
                                ? 'bg-cyan-600 text-white shadow'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        🎯 Seleziona
                    </button>
                    <button
                        onClick={() => onSelectTool('pan')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${activeTool === 'pan'
                                ? 'bg-cyan-600 text-white shadow'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        ✋ Sposta (Pan)
                    </button>
                </div>

                {/* Status Validazione */}
                <div className="flex items-center gap-2">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${validation.status === 'valid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : validation.status === 'open'
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                    >
                        <span
                            className={`w-2 h-2 rounded-full ${validation.status === 'valid'
                                    ? 'bg-emerald-400 animate-pulse'
                                    : validation.status === 'open'
                                        ? 'bg-rose-400 animate-ping'
                                        : 'bg-amber-400'
                                }`}
                        />
                        {validation.message}
                    </span>
                </div>

                {/* Azioni */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenTrackList}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                    >
                        📂 Carica
                    </button>
                    <button
                        onClick={onClear}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-800/50 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-medium transition"
                    >
                        🗑️ Svuota
                    </button>
                    <button
                        onClick={onSave}
                        disabled={validation.status !== 'valid' || isSaving}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${validation.status === 'valid' && !isSaving
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-50 cursor-not-allowed'
                            }`}
                    >
                        {isSaving ? 'Salvataggio...' : '💾 Salva Pista'}
                    </button>
                </div>
            </div>

            {/* Palette Pezzi */}
            <div className="w-fit bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl shadow-2xl pointer-events-auto flex flex-col gap-2">
                {/* Categorie */}
                <div className="flex items-center gap-1 border-b border-slate-800 pb-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${activeCategory === cat.id
                                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Lista Varianti Categoria */}
                <div className="flex items-center gap-2 overflow-x-auto max-w-xl py-1">
                    {categoryPieces.map((piece) => {
                        const isSelected =
                            activeTool === 'place' &&
                            activePieceType === piece.type &&
                            activePieceVariant === piece.variant;

                        return (
                            <button
                                key={`${piece.type}-${piece.variant}`}
                                onClick={() => onSelectPiece(piece.type, piece.variant)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition min-w-[80px] ${isSelected
                                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500'
                                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                    }`}
                            >
                                <div className="w-12 h-8 flex items-center justify-center">
                                    <svg viewBox={`-10 -20 ${piece.previewWidth} ${piece.previewHeight}`} className="w-full h-full">
                                        <path
                                            d={piece.svgPath}
                                            fill="none"
                                            stroke={piece.color}
                                            strokeWidth={piece.trackWidth / 3}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-medium leading-tight text-center">
                                    {piece.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
