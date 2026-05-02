"use client";

import { useState, useRef, useEffect } from "react";

const FALLEN = ["HUMSI", "VEDANT", "LOVEY", "VED", "KASHISH", "SID", "ROHITH", "RIYA"];

interface Props {
  onClose: () => void;
  onComplete: () => void;
  alreadyDone: boolean;
}

export default function GraveyardUI({ onClose, onComplete, alreadyDone }: Props) {
  const [found, setFound] = useState<Set<string>>(alreadyDone ? new Set(FALLEN) : new Set());
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(alreadyDone);
  const inputRef = useRef<HTMLInputElement>(null);

  const done = found.size === FALLEN.length;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const submit = () => {
    const name = input.trim().toUpperCase();
    setInput("");

    if (!name) return;

    if (found.has(name)) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (FALLEN.includes(name)) {
      const next = new Set(found);
      next.add(name);
      setFound(next);
      setFlash(name);
      setTimeout(() => setFlash(null), 1200);

      if (next.size === FALLEN.length) {
        setTimeout(() => {
          setRevealed(true);
          onComplete();
        }, 800);
      }
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md overflow-y-auto py-10"
      style={{ background: "radial-gradient(ellipse at center, #0d0d0d 0%, #000 100%)" }}
    >
      {/* Header */}
      <div className="text-center mb-8 px-6">
        <p className="text-5xl mb-4 select-none">🪦</p>
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
          Here Lie the Fallen
        </h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          Some never made it to the end. Go through <span className="text-gray-300 font-semibold">Edge</span> and find who they were — then enter their names below.
        </p>
      </div>

      {/* Tombstone grid */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 px-6 max-w-lg">
        {FALLEN.map((name) => {
          const isFound = found.has(name);
          const isFlashing = flash === name;
          return (
            <div
              key={name}
              className={[
                "w-28 h-36 rounded-t-full rounded-b-lg border flex flex-col items-center justify-center transition-all duration-500 select-none",
                isFound
                  ? "border-gray-400/50 bg-gray-800/60 shadow-lg shadow-gray-700/20"
                  : "border-gray-700/30 bg-gray-900/40",
                isFlashing ? "scale-110" : "",
              ].join(" ")}
            >
              {isFound ? (
                <>
                  <p className="text-2xl mb-1">🕯️</p>
                  <p className="text-xs font-bold text-gray-200 text-center px-2 leading-tight">
                    {name}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">R.I.P.</p>
                </>
              ) : (
                <p className="text-gray-700 text-2xl">?</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Input — hidden once all found */}
      {!done && (
        <div className="flex flex-col items-center gap-3 mb-6 px-6 w-full max-w-sm">
          <div className={["flex w-full rounded-xl border overflow-hidden transition-all", shake ? "border-red-500/70 animate-pulse" : "border-gray-600/50"].join(" ")}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); submit(); } }}
              placeholder="Type a name…"
              className="flex-1 bg-black/60 px-4 py-3 text-white text-sm placeholder-gray-600 outline-none uppercase tracking-widest font-mono"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={submit}
              className="px-4 bg-gray-800 text-gray-300 text-sm font-semibold hover:bg-gray-700 transition"
            >
              Enter
            </button>
          </div>
          <p className="text-xs text-gray-600">
            {found.size} / {FALLEN.length} found
          </p>
        </div>
      )}

      {/* Reveal message */}
      {revealed && (
        <div className="text-center px-6 mb-8 max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-6 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">
              Their message to you
            </p>
            <p className="text-2xl font-black text-white leading-snug"
              style={{ textShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
              Find me! I&apos;m fluffy and love rollercoasters.
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className="mt-2 rounded-full border border-gray-700/50 bg-gray-900/60 px-8 py-2.5 text-sm text-gray-400 hover:text-white hover:border-gray-500 transition"
      >
        {done ? "Close" : "ESC to close"}
      </button>
    </div>
  );
}
