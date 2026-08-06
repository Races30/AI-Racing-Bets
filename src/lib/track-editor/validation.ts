import type { PlacedPiece, ValidationResult } from './types';
import {
    getAbsoluteEntry,
    getAbsoluteExit,
    distance,
    SNAP_DISTANCE,
} from './geometry';
import { getPieceDef } from './pieces';

// ─── Costanti ─────────────────────────────────────────────────────────────────

/** Numero minimo di pezzi per formare un circuito sensato */
const MIN_PIECES = 3;

// ─── Validazione principale ───────────────────────────────────────────────────

/**
 * Valida se l'insieme dei pezzi forma un circuito chiuso e valido.
 *
 * Algoritmo:
 * 1. Controlli base (vuoto, troppo pochi pezzi)
 * 2. Costruisce il grafo successori: exitOf[A] → B se exit(A) ≈ entry(B)
 * 3. Verifica che ogni pezzo abbia un successore e un predecessore
 * 4. DFS dal primo pezzo: se visita tutti i pezzi e torna al punto di partenza,
 *    il circuito è chiuso
 */
export function validateTrack(pieces: PlacedPiece[]): ValidationResult {
    // ── 1. Controlli base ────────────────────────────────────────────────────────
    if (pieces.length === 0) {
        return {
            status: 'empty',
            message: 'La pista è vuota. Inizia piazzando un pezzo dalla toolbar.',
        };
    }

    if (pieces.length < MIN_PIECES) {
        return {
            status: 'too-few',
            message: `Servono almeno ${MIN_PIECES} pezzi per formare un circuito chiuso.`,
        };
    }

    // ── 2. Costruzione grafo (successore + predecessore) ──────────────────────────
    /** exitOf[A.id] = B.id: l'uscita di A è collegata all'ingresso di B */
    const successor = new Map<string, string>();
    /** entryOf[B.id] = A.id: l'ingresso di B viene dall'uscita di A */
    const predecessor = new Map<string, string>();

    for (const pieceA of pieces) {
        const defA = getPieceDef(pieceA.type, pieceA.variant);
        if (!defA) continue;
        const exitA = getAbsoluteExit(pieceA, defA);

        for (const pieceB of pieces) {
            if (pieceA.id === pieceB.id) continue;
            const entryB = getAbsoluteEntry(pieceB);

            if (distance(exitA, entryB) < SNAP_DISTANCE) {
                successor.set(pieceA.id, pieceB.id);
                predecessor.set(pieceB.id, pieceA.id);
                break;
            }
        }
    }

    // ── 3. Connettori liberi ──────────────────────────────────────────────────────
    const freeExits = pieces.filter((p) => !successor.has(p.id));
    const freeEntries = pieces.filter((p) => !predecessor.has(p.id));

    if (freeExits.length > 0 || freeEntries.length > 0) {
        const totalFree = freeExits.length + freeEntries.length;

        // Calcola il punto "aperto" più visibile (exit libero, se esiste)
        let openPoint: { x: number; y: number } | undefined;
        if (freeExits.length > 0) {
            const fp = freeExits[0];
            const def = getPieceDef(fp.type, fp.variant);
            if (def) {
                const e = getAbsoluteExit(fp, def);
                openPoint = { x: e.x, y: e.y };
            }
        } else {
            openPoint = { x: freeEntries[0].x, y: freeEntries[0].y };
        }

        return {
            status: 'open',
            message: `Pista aperta — ${totalFree} connettore${totalFree > 1 ? 'i' : ''} libero${totalFree > 1 ? 'i' : ''}.`,
            openPoint,
        };
    }

    // ── 4. DFS per ciclo chiuso ───────────────────────────────────────────────────
    const startId = pieces[0].id;
    const visited = new Set<string>();
    let current: string | undefined = startId;

    while (current !== undefined) {
        if (visited.has(current)) {
            // Siamo tornati a un nodo già visitato
            if (current === startId && visited.size === pieces.length) {
                // Ciclo perfetto: tutti i pezzi visitati e si torna all'inizio
                return {
                    status: 'valid',
                    message: '✓ Circuito chiuso e valido. Puoi salvare la pista.',
                };
            }
            // Ciclo parziale: alcuni pezzi sono isolati
            break;
        }
        visited.add(current);
        current = successor.get(current);
    }

    const isolated = pieces.length - visited.size;
    return {
        status: 'open',
        message: `Pista non connessa — ${isolated} pezzo${isolated > 1 ? 'i' : ''} isolato${isolated > 1 ? 'i' : ''}.`,
    };
}
