'use client';

import { useEffect, useState } from 'react';
import { loadUserTracks, deleteTrack, TrackRow } from '@/lib/track-editor/supabase-track';

interface TrackListProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTrack: (track: TrackRow) => void;
}

export function TrackList({ isOpen, onClose, onSelectTrack }: TrackListProps) {
    const [tracks, setTracks] = useState<TrackRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchTracks();
        }
    }, [isOpen]);

    const fetchTracks = async () => {
        setLoading(true);
        setError(null);
        const { tracks, error } = await loadUserTracks();
        if (error) setError(error);
        else setTracks(tracks);
        setLoading(false);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Sei sicuro di voler eliminare questa pista?')) return;
        const { error } = await deleteTrack(id);
        if (!error) {
            setTracks((prev) => prev.filter((t) => t.id !== id));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header Modal */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <span>🏁</span> Piste Salvate
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-200 text-lg font-semibold w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2">
                    {loading && (
                        <div className="text-center py-8 text-slate-400 text-sm animate-pulse">
                            Caricamento piste da Supabase...
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
                            {error}
                        </div>
                    )}

                    {!loading && !error && tracks.length === 0 && (
                        <div className="text-center py-12 text-slate-500 text-sm">
                            Nessuna pista salvata al momento.
                        </div>
                    )}

                    {!loading &&
                        tracks.map((track) => (
                            <div
                                key={track.id}
                                onClick={() => {
                                    onSelectTrack(track);
                                    onClose();
                                }}
                                className="group flex items-center justify-between p-3.5 bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl cursor-pointer transition"
                            >
                                <div>
                                    <h3 className="font-semibold text-slate-200 text-sm group-hover:text-cyan-300 transition">
                                        {track.name}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                        <span>🧩 {track.layout.length} pezzi</span>
                                        <span>•</span>
                                        <span>Modificato: {new Date(track.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => handleDelete(e, track.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                                    title="Elimina pista"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
