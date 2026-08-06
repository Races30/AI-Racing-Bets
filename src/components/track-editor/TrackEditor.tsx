'use client';

import { useState, useCallback, useMemo } from 'react';
import type { PlacedPiece, PieceType, PieceVariant, EditorTool } from '@/lib/track-editor/types';
import { validateTrack } from '@/lib/track-editor/validation';
import { saveTrack, updateTrack, TrackRow } from '@/lib/track-editor/supabase-track';
import { TrackCanvas } from './TrackCanvas';
import { Toolbar } from './Toolbar';
import { TrackList } from './TrackList';

export function TrackEditor() {
    const [pieces, setPieces] = useState<PlacedPiece[]>([]);
    const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<EditorTool>('place');
    const [activePieceType, setActivePieceType] = useState<PieceType | null>('straight');
    const [activePieceVariant, setActivePieceVariant] = useState<PieceVariant | null>('medium');

    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const [zoom, setZoom] = useState(1);

    const [trackName, setTrackName] = useState('Nuovo Circuito');
    const [savedTrackId, setSavedTrackId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isTrackListOpen, setIsTrackListOpen] = useState(false);

    // Validazione automatica ad ogni cambio pezzi
    const validation = useMemo(() => validateTrack(pieces), [pieces]);

    // Handler azioni
    const handlePiecePlaced = useCallback((newPiece: PlacedPiece) => {
        setPieces((prev) => [...prev, newPiece]);
    }, []);

    const handlePieceDelete = useCallback((id: string) => {
        setPieces((prev) => prev.filter((p) => p.id !== id));
        setSelectedPieceId((prev) => (prev === id ? null : prev));
    }, []);

    const handlePan = useCallback((dx: number, dy: number) => {
        setPanX((prev) => prev + dx);
        setPanY((prev) => prev + dy);
    }, []);

    const handleZoom = useCallback((delta: number, cx: number, cy: number) => {
        setZoom((prevZoom) => {
            const next = Math.max(0.3, Math.min(3, prevZoom + delta * 0.0015));
            return next;
        });
    }, []);

    const handleSelectPiece = (type: PieceType, variant: PieceVariant) => {
        setActivePieceType(type);
        setActivePieceVariant(variant);
        setActiveTool('place');
    };

    const handleSave = async () => {
        if (validation.status !== 'valid') return;
        setIsSaving(true);

        if (savedTrackId) {
            const { error } = await updateTrack(savedTrackId, trackName, pieces);
            if (error) alert(`Errore aggiornamento: ${error}`);
            else alert('Pista aggiornata con successo!');
        } else {
            const { id, error } = await saveTrack(trackName, pieces);
            if (error) alert(`Errore salvataggio: ${error}`);
            else if (id) {
                setSavedTrackId(id);
                alert('Nuova pista salvata con successo!');
            }
        }
        setIsSaving(false);
    };

    const handleClear = () => {
        if (pieces.length === 0) return;
        if (confirm('Vuoi davvero cancellare la pista corrente?')) {
            setPieces([]);
            setSavedTrackId(null);
            setSelectedPieceId(null);
        }
    };

    const handleSelectTrackFromList = (track: TrackRow) => {
        setPieces(track.layout);
        setTrackName(track.name);
        setSavedTrackId(track.id);
        setSelectedPieceId(null);
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
            <Toolbar
                activeTool={activeTool}
                activePieceType={activePieceType}
                activePieceVariant={activePieceVariant}
                trackName={trackName}
                validation={validation}
                isSaving={isSaving}
                onSelectTool={setActiveTool}
                onSelectPiece={handleSelectPiece}
                onTrackNameChange={setTrackName}
                onSave={handleSave}
                onClear={handleClear}
                onOpenTrackList={() => setIsTrackListOpen(true)}
            />

            <TrackCanvas
                pieces={pieces}
                selectedPieceId={selectedPieceId}
                activeTool={activeTool}
                activePieceType={activePieceType}
                activePieceVariant={activePieceVariant}
                panX={panX}
                panY={panY}
                zoom={zoom}
                validation={validation}
                onPiecePlaced={handlePiecePlaced}
                onPieceSelect={setSelectedPieceId}
                onPan={handlePan}
                onZoom={handleZoom}
                onPieceDelete={handlePieceDelete}
            />

            <TrackList
                isOpen={isTrackListOpen}
                onClose={() => setIsTrackListOpen(false)}
                onSelectTrack={handleSelectTrackFromList}
            />
        </div>
    );
}
