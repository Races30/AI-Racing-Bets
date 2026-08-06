import type { PieceDefinition, PieceType, PieceVariant } from './types';

// ─── Tipo esteso con info di rendering ────────────────────────────────────────

export interface PieceDefinitionFull extends PieceDefinition {
    /** Path SVG nel sistema locale del pezzo (entry = origine 0,0) */
    svgPath: string;
    previewWidth: number;
    previewHeight: number;
}

// ─── Costanti ─────────────────────────────────────────────────────────────────

/** Larghezza carreggiata standard in pixel */
const TW = 40;

// ─── Catalogo ─────────────────────────────────────────────────────────────────
// Convenzione assi (SVG): X cresce verso destra, Y cresce verso il basso.
// entry è sempre (0, 0, angle 0) → la pista entra da sinistra verso destra.
// Gli archi curva-destra girano in senso orario (sweep-flag=1),
// le curve-sinistra in senso antiorario (sweep-flag=0).
//
// Formule uscita curva destra (raggio R, angolo θ):
//   exitX = R * sin(θ),  exitY = R * (1 - cos(θ)),  exitAngle = +θ
// Formule uscita curva sinistra:
//   exitX = R * sin(θ),  exitY = -R * (1 - cos(θ)), exitAngle = -θ

export const PIECE_CATALOG: PieceDefinitionFull[] = [
    // ── RETTILINEI ──────────────────────────────────────────────────────────────
    {
        type: 'straight', variant: 'short',
        label: 'Rettilineo corto',
        trackWidth: TW,
        entry: { x: 0, y: 0, angle: 0 },
        exit: { x: 80, y: 0, angle: 0 },
        svgPath: 'M 0 0 L 80 0',
        previewWidth: 90, previewHeight: 60,
        color: '#64748b',
    },
    {
        type: 'straight', variant: 'medium',
        label: 'Rettilineo medio',
        trackWidth: TW,
        entry: { x: 0, y: 0, angle: 0 },
        exit: { x: 160, y: 0, angle: 0 },
        svgPath: 'M 0 0 L 160 0',
        previewWidth: 170, previewHeight: 60,
        color: '#64748b',
    },
    {
        type: 'straight', variant: 'long',
        label: 'Rettilineo lungo',
        trackWidth: TW,
        entry: { x: 0, y: 0, angle: 0 },
        exit: { x: 240, y: 0, angle: 0 },
        svgPath: 'M 0 0 L 240 0',
        previewWidth: 250, previewHeight: 60,
        color: '#64748b',
    },

    // ── CURVE DESTRA (orario, sweep=1) ──────────────────────────────────────────
    // R=80,  θ=45° → exit (56.57, 23.43)
    {
        type: 'curve-right', variant: 'tight',
        label: 'Curva destra stretta',
        trackWidth: TW,
        entry: { x: 0, y: 0, angle: 0 },
        exit: { x: 56.57, y: 23.43, angle: 45 },
        svgPath: 'M 0 0 A 80 80 0 0 1 56.57 23.43',
        previewWidth: 100, previewHeight: 80,
        color: '#f59e0b',
    },
    // R=120, θ=90° → exit (120, 120)
    {
        type: 'curve-right', variant: 'medium',
        label: 'Curva destra media',
        trackWidth: TW,
        entry: { x: 0, y: 0, angle: 0 },
        exit: { x: 120, y: 120, angle: 90 },
        svgPath: 'M 0 0 A 120 120 0 0 1 120 120',
        previewWidth: 150, previewHeight: 150,
        color: '#f59e0b',
    },
    // R=200, θ=30° → exit (100, 26.79)
    {
        type: 'curve-right', variant: 'wide',
        label: 'Curva destra ampia',
        trackWidth: TW,
        entry: { x: 0, y: 0, angle: 0 },
        exit: { x: 100, y: 26.79, angle: 30 },
        svgPath: 'M 0 0 A 200 200 0 0 1 100 26.79',
        previewWidth: 130, previewHeight: 80,
        color: '#f59e0b',
    },

    // ── CURVE SINISTRA (antiorario, sweep=0) ────────────────────────────────────
    // R=80,  θ=45° → exit (56.57, -23.43)
    {
        type: 'curve-left', variant: 'tight',
        label: 'Curva sinistra stretta',
        trackWidth: TW,
        entry: { x: 0, y: 0, angle: 0 },
        exit: { x: 56.57, y: -23.43, angle: -45 },
        svgPath: 'M 0 0 A 80 80 0 0 0 56.57 -23.43',
        previewWidth: 100, previewHeight: 80,
        color: '#3b82f6',
    },
    // R=120, θ=90° → exit (120, -120)
    {
        type: 'curve-left', variant: 'medium',
        label: 'Curva sinistra media',
        trackWidth: TW,
        entry: { x: 0, y: 0, angle: 0 },
        exit: { x: 120, y: -120, angle: -90 },
        svgPath: 'M 0 0 A 120 120 0 0 0 120 -120',
        previewWidth: 150, previewHeight: 150,
        color: '#3b82f6',
    },
    // R=200, θ=30° → exit (100, -26.79)
    {
        type: 'curve-left', variant: 'wide',
        label: 'Curva sinistra ampia',
        trackWidth: TW,
        entry: { x: 0, y: 0, angle: 0 },
        exit: { x: 100, y: -26.79, angle: -30 },
        svgPath: 'M 0 0 A 200 200 0 0 0 100 -26.79',
        previewWidth: 130, previewHeight: 80,
        color: '#3b82f6',
    },

    // ── CHICANE (Bézier cubica, uscita parallela all'entrata) ───────────────────
    {
        type: 'chicane', variant: 'left-right',
        label: 'Chicane sin→des',
        trackWidth: TW,
        entry: { x: 0, y: 0, angle: 0 },
        exit: { x: 160, y: 0, angle: 0 },
        svgPath: 'M 0 0 C 40 0 40 -50 80 -50 C 120 -50 120 0 160 0',
        previewWidth: 170, previewHeight: 100,
        color: '#a855f7',
    },
    {
        type: 'chicane', variant: 'right-left',
        label: 'Chicane des→sin',
        trackWidth: TW,
        entry: { x: 0, y: 0, angle: 0 },
        exit: { x: 160, y: 0, angle: 0 },
        svgPath: 'M 0 0 C 40 0 40 50 80 50 C 120 50 120 0 160 0',
        previewWidth: 170, previewHeight: 100,
        color: '#a855f7',
    },

    // ── ZONE BORDO ──────────────────────────────────────────────────────────────
    {
        type: 'border', variant: 'curb-left',
        label: 'Cordolo sinistra',
        trackWidth: 16,
        entry: { x: 0, y: 0, angle: 0 },
        exit: { x: 160, y: 0, angle: 0 },
        svgPath: 'M 0 0 L 160 0',
        previewWidth: 170, previewHeight: 40,
        color: '#ef4444',
    },
    {
        type: 'border', variant: 'curb-right',
        label: 'Cordolo destra',
        trackWidth: 16,
        entry: { x: 0, y: 0, angle: 0 },
        exit: { x: 160, y: 0, angle: 0 },
        svgPath: 'M 0 0 L 160 0',
        previewWidth: 170, previewHeight: 40,
        color: '#ef4444',
    },
    {
        type: 'border', variant: 'gravel-left',
        label: 'Ghiaia sinistra',
        trackWidth: 24,
        entry: { x: 0, y: 0, angle: 0 },
        exit: { x: 160, y: 0, angle: 0 },
        svgPath: 'M 0 0 L 160 0',
        previewWidth: 170, previewHeight: 48,
        color: '#d97706',
    },
    {
        type: 'border', variant: 'gravel-right',
        label: 'Ghiaia destra',
        trackWidth: 24,
        entry: { x: 0, y: 0, angle: 0 },
        exit: { x: 160, y: 0, angle: 0 },
        svgPath: 'M 0 0 L 160 0',
        previewWidth: 170, previewHeight: 48,
        color: '#d97706',
    },
];

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Restituisce la definizione di un pezzo per tipo+variante */
export function getPieceDef(
    type: PieceType,
    variant: PieceVariant,
): PieceDefinitionFull | undefined {
    return PIECE_CATALOG.find((p) => p.type === type && p.variant === variant);
}

/** Raggruppa il catalogo per tipo (per la toolbar) */
export function getPiecesByType(): Map<PieceType, PieceDefinitionFull[]> {
    const map = new Map<PieceType, PieceDefinitionFull[]>();
    for (const piece of PIECE_CATALOG) {
        if (!map.has(piece.type)) map.set(piece.type, []);
        map.get(piece.type)!.push(piece);
    }
    return map;
}
