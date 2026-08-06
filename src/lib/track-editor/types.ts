// ─── Tipi base di geometria ───────────────────────────────────────────────────

/** Punto 2D sul canvas */
export interface Point {
    x: number;
    y: number;
}

/**
 * Punto di connessione (entry o exit) di un pezzo.
 * Le coordinate sono RELATIVE all'origine del pezzo (punto entry).
 * angle è in gradi: 0 = destra, 90 = basso, 180 = sinistra, 270 = su.
 */
export interface ConnectionPoint {
    x: number;
    y: number;
    angle: number;
}

// ─── Tipi dei pezzi ──────────────────────────────────────────────────────────

export type StraightVariant = 'short' | 'medium' | 'long';
export type CurveDirection = 'left' | 'right';
export type CurveRadius = 'tight' | 'medium' | 'wide';
export type ChicaneVariant = 'left-right' | 'right-left';
export type BorderVariant = 'curb-left' | 'curb-right' | 'gravel-left' | 'gravel-right';

export type PieceType =
    | 'straight'
    | 'curve-left'
    | 'curve-right'
    | 'chicane'
    | 'border';

export type PieceVariant =
    | StraightVariant
    | CurveRadius
    | ChicaneVariant
    | BorderVariant;

// ─── Definizione geometrica di un pezzo (statica, non dipende dalla posizione) ─

export interface PieceDefinition {
    type: PieceType;
    variant: PieceVariant;
    label: string;
    /** Larghezza della carreggiata in pixel */
    trackWidth: number;
    /** Punto di entry relativo — è sempre (0, 0, angleIn) per convenzione */
    entry: ConnectionPoint;
    /** Punto di exit relativo all'entry */
    exit: ConnectionPoint;
    /** Colore di anteprima nella palette */
    color: string;
}

// ─── Pezzo piazzato sul canvas ───────────────────────────────────────────────

export interface PlacedPiece {
    /** UUID generato al momento del piazzamento */
    id: string;
    type: PieceType;
    variant: PieceVariant;
    /** Posizione assoluta canvas del punto ENTRY del pezzo */
    x: number;
    y: number;
    /**
     * Rotazione assoluta in gradi del pezzo sul canvas.
     * Corrisponde all'angolo di uscita del pezzo precedente.
     */
    rotation: number;
}

// ─── Risultato validazione ────────────────────────────────────────────────────

export type ValidationStatus = 'valid' | 'open' | 'too-few' | 'empty';

export interface ValidationResult {
    status: ValidationStatus;
    message: string;
    /** Punto in cui il circuito non è chiuso (per mostrare indicatore rosso) */
    openPoint?: Point;
}

// ─── Track (salvata su Supabase) ─────────────────────────────────────────────

export interface Track {
    id?: string;
    name: string;
    pieces: PlacedPiece[];
    created_at?: string;
    updated_at?: string;
}

// ─── Stato editor ─────────────────────────────────────────────────────────────

export type EditorTool = 'place' | 'select' | 'pan';

export interface EditorState {
    pieces: PlacedPiece[];
    selectedPieceId: string | null;
    activeTool: EditorTool;
    activePieceType: PieceType | null;
    activePieceVariant: PieceVariant | null;
    /** Offset pan del canvas */
    panX: number;
    panY: number;
    zoom: number;
    validation: ValidationResult;
    trackName: string;
    savedTrackId: string | null;
}
