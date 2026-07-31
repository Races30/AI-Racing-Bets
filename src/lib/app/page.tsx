import React from "react";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Effetti di luce in sottofondo */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="z-10 max-w-2xl text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    Setup Iniziale Completato
                </div>

                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                    AI Racing Bets
                </h1>

                <p className="text-slate-400 text-lg sm:text-xl">
                    Simulatore di corse con AI (rete neurale che guida) e scommesse in crediti virtuali.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
                        <div className="text-cyan-400 font-bold text-sm mb-1">Framework</div>
                        <div className="text-slate-200 font-medium">Next.js 14 (App Router)</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
                        <div className="text-cyan-400 font-bold text-sm mb-1">Styling</div>
                        <div className="text-slate-200 font-medium">Tailwind CSS + Strict TS</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur">
                        <div className="text-cyan-400 font-bold text-sm mb-1">Database</div>
                        <div className="text-slate-200 font-medium">Supabase Client SSR</div>
                    </div>
                </div>
            </div>
        </main>
    );
}
