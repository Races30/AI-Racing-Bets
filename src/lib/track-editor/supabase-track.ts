import { createClient } from '@/lib/supabase/client';
import type { PlacedPiece } from './types';

// ─── Tipi risposta Supabase ───────────────────────────────────────────────────

export interface TrackRow {
    id: string;
    name: string;
    layout: PlacedPiece[];
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface SaveResult {
    id: string | null;
    error: string | null;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Salva una nuova pista su Supabase.
 * Restituisce l'ID generato o un messaggio di errore.
 */
export async function saveTrack(
    name: string,
    pieces: PlacedPiece[],
): Promise<SaveResult> {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { id: null, error: 'Devi essere loggato per salvare una pista.' };
    }

    const { data, error } = await supabase
        .from('tracks')
        .insert({
            name,
            layout: pieces,
            user_id: user.id,
        })
        .select('id')
        .single();

    if (error) return { id: null, error: error.message };
    return { id: data.id, error: null };
}

/**
 * Aggiorna una pista esistente (nome e/o layout).
 */
export async function updateTrack(
    id: string,
    name: string,
    pieces: PlacedPiece[],
): Promise<{ error: string | null }> {
    const supabase = createClient();

    const { error } = await supabase
        .from('tracks')
        .update({ name, layout: pieces })
        .eq('id', id);

    if (error) return { error: error.message };
    return { error: null };
}

/**
 * Carica tutte le piste dell'utente corrente, ordinate per data di modifica.
 */
export async function loadUserTracks(): Promise<{
    tracks: TrackRow[];
    error: string | null;
}> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('tracks')
        .select('id, name, layout, user_id, created_at, updated_at')
        .order('updated_at', { ascending: false });

    if (error) return { tracks: [], error: error.message };
    return { tracks: (data as TrackRow[]) ?? [], error: null };
}

/**
 * Carica una singola pista per ID.
 */
export async function loadTrackById(id: string): Promise<{
    track: TrackRow | null;
    error: string | null;
}> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('tracks')
        .select('id, name, layout, user_id, created_at, updated_at')
        .eq('id', id)
        .single();

    if (error) return { track: null, error: error.message };
    return { track: data as TrackRow, error: null };
}

/**
 * Elimina una pista per ID.
 */
export async function deleteTrack(id: string): Promise<{ error: string | null }> {
    const supabase = createClient();

    const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', id);

    if (error) return { error: error.message };
    return { error: null };
}
