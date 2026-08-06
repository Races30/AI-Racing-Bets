import type { PlacedPiece, ConnectionPoint, Point } from './types';
import type { PieceDefinitionFull } from './pieces';
import { getPieceDef } from './pieces';

// ─── Costanti ─────────────────────────────────────────────────────────────────

/** Distanza massima (px) tra cursore e connettore per attivare lo snap */
export const SNAP_DISTANCE = 24;

// ─── Geometria di base ────────────────────────────────────────────────────────

const DEG = Math.PI / 180;

/** Ruota un punto attorno all'origine di `angleDeg` gradi (senso orario SVG) */
export function rotatePoint(p: Point, angleDeg: number): Point {
    const rad = angleDeg * DEG;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
        x: p.x * cos - p.y * sin,
        y: p.x * sin + p.y * cos,
    };
}

/** Distanza euclidea tra due punti */
export function distance(a: Point, b: Point): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/** Normalizza un angolo nell'intervallo [-180, 180) */
export function normalizeAngle(deg: number): number {
    let a = deg % 360;
    if (a > 180) a -= 360;
    if (a <= -180) a += 360;
    return a;
}

// ─── Connettori assoluti ──────────────────────────────────────────────────────

/**
 * Connettore di INGRESSO assoluto di un pezzo piazzato.
 * L'entry locale è sempre (0,0,0) per convenzione, quindi l'assoluta
 * corrisponde direttamente alla posizione e rotazione del pezzo.
 */
export function getAbsoluteEntry(piece: PlacedPiece): ConnectionPoint {
    return { x: piece.x, y: piece.y, angle: piece.rotation };
}

/**
 * Connettore di USCITA assoluto di un pezzo piazzato.
 * Ruota l'exit locale con la rotazione del pezzo e lo trasla alla sua posizione.
 */
export function getAbsoluteExit(
    piece: PlacedPiece,
    def: PieceDefinitionFull,
): ConnectionPoint {
    const rotated = rotatePoint({ x: def.exit.x, y: def.exit.y }, piece.rotation);
    return {
        x: piece.x + rotated.x,
        y: piece.y + rotated.y,
        angle: normalizeAngle(def.exit.angle + piece.rotation),
    };
}

// ─── Snap ─────────────────────────────────────────────────────────────────────

export interface SnapResult {
    /** Posizione assoluta del punto entry del nuovo pezzo dopo lo snap */
    x: number;
    y: number;
    /** Rotazione da applicare al nuovo pezzo (= angolo exit del pezzo target) */
    rotation: number;
    /** ID del pezzo a cui ci si è agganciati */
    targetId: string;
}

/**
 * Cerca lo snap: se il cursore è entro SNAP_DISTANCE dall'exit di un pezzo
 * esistente (non ancora collegato), restituisce posizione e rotazione corretti.
 *
 * @param cursorX       Posizione X corrente del cursore sul canvas
 * @param cursorY       Posizione Y corrente del cursore sul canvas
 * @param existingPieces Pezzi già piazzati
 * @param usedExits     Set di IDs di pezzi il cui exit è già occupato
 */
export function trySnap(
    cursorX: number,
    cursorY: number,
    existingPieces: PlacedPiece[],
    usedExits: Set<string>,
): SnapResult | null {
    for (const piece of existingPieces) {
        if (usedExits.has(piece.id)) continue;
        const def = getPieceDef(piece.type, piece.variant);
        if (!def) continue;

        const exitAbs = getAbsoluteExit(piece, def);
        const d = distance({ x: cursorX, y: cursorY }, { x: exitAbs.x, y: exitAbs.y });

        if (d <= SNAP_DISTANCE) {
            return {
                x: exitAbs.x,
                y: exitAbs.y,
                rotation: exitAbs.angle,
                targetId: piece.id,
            };
        }
    }
    return null;
}

// ─── SVG transform ────────────────────────────────────────────────────────────

/**
 * Stringa `transform` SVG per rendere un pezzo nella posizione e rotazione corrette.
 * La rotazione avviene attorno al punto di entry (origine locale).
 */
export function pieceTransform(piece: PlacedPiece): string {
    return `translate(${piece.x}, ${piece.y}) rotate(${piece.rotation})`;
}

/**
 * Calcola il set degli ID dei pezzi il cui connettore EXIT è già collegato
 * a un connettore ENTRY di un altro pezzo.
 */
export function computeUsedExits(pieces: PlacedPiece[]): Set<string> {
    const used = new Set<string>();

    for (const pieceA of pieces) {
        const defA = getPieceDef(pieceA.type, pieceA.variant);
        if (!defA) continue;
        const exitA = getAbsoluteExit(pieceA, defA);

        for (const pieceB of pieces) {
            if (pieceA.id === pieceB.id) continue;
            const entryB = getAbsoluteEntry(pieceB);
            if (distance(exitA, entryB) < SNAP_DISTANCE) {
                used.add(pieceA.id);
                break;
            }
        }
    }

    return used;
}
