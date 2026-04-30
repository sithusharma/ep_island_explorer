"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { useInput } from "@/app/hooks/useInput";
import { useEngine } from "@/app/hooks/useEngine";
import JukeboxUI from "./JukeboxUI";
import MemoryGallery from "./MemoryGallery";

// Icon map for known trigger types / names
function triggerIcon(type: string, name: string): string {
  if (type === "jukebox")   return "♫";
  if (type === "graveyard") return "🪦";
  if (name.toLowerCase().includes("stadium")) return "🏟";
  if (name.toLowerCase().includes("pizza") || name.toLowerCase().includes("wings")) return "🍕";
  if (name.toLowerCase().includes("bar") || name.toLowerCase().includes("house") || name.toLowerCase().includes("burg")) return "🍺";
  if (name.toLowerCase().includes("weed") || name.toLowerCase().includes("wild")) return "🌿";
  if (name.toLowerCase().includes("dorm")) return "🛏";
  if (name.toLowerCase().includes("apt") || name.toLowerCase().includes("apartment") || name.toLowerCase().includes("hub")) return "🏠";
  if (name.toLowerCase().includes("store")) return "🛒";
  return "📍";
}

// Accent colour per trigger type
function triggerAccent(type: string): string {
  if (type === "jukebox")   return "border-purple-500/40 text-purple-400";
  if (type === "graveyard") return "border-gray-600/40 text-gray-400";
  return "border-white/20 text-white";
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef({ w: 0, h: 0 });
  const keys = useInput();
  const [activeGallery, setActiveGallery] = useState<string | null>(null);
  const [showGraveyard, setShowGraveyard] = useState(false);

  // Sync canvas size
  const syncSize = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    cvs.width = w * dpr;
    cvs.height = h * dpr;
    cvs.style.width = `${w}px`;
    cvs.style.height = `${h}px`;
    viewportRef.current = { w, h };
  }, []);

  const canvasCallbackRef = useCallback(
    (node: HTMLCanvasElement | null) => {
      (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = node;
      if (node) {
        syncSize();
        window.addEventListener("resize", syncSize);
      }
    },
    [syncSize]
  );

  // Engine
  const { activeTrigger, startTransition } = useEngine(canvasRef, viewportRef, keys);

  const [showJukebox, setShowJukebox] = useState(false);

  // Universal Enter handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (!activeTrigger) return;
      if (activeTrigger.type === "jukebox") {
        setShowJukebox(true);
        return;
      }
      if (activeTrigger.type === "graveyard") {
        setShowGraveyard(true);
        return;
      }
      setActiveGallery(activeTrigger.entityId);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTrigger, startTransition]);

  useEffect(() => {
    if (!showGraveyard) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setShowGraveyard(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [showGraveyard]);

  // Determine whether to show the prompt
  const showPrompt = activeTrigger !== null;
  const accent = activeTrigger ? triggerAccent(activeTrigger.type) : "";
  const icon = activeTrigger ? triggerIcon(activeTrigger.type, activeTrigger.name) : "";

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <canvas ref={canvasCallbackRef} className="block" />

      {/* Controls hint */}
      {!activeGallery && (
        <div className="absolute left-4 bottom-4 rounded-xl bg-black/60 px-4 py-2 text-xs text-gray-500 backdrop-blur-sm z-10">
          <span className="font-semibold text-gray-300">WASD</span> or{" "}
          <span className="font-semibold text-gray-300">Arrow Keys</span> to drive
        </div>
      )}

      {/* Memory Gallery */}
      {activeGallery && (
        <MemoryGallery 
          locationId={activeGallery} 
          onClose={() => setActiveGallery(null)} 
        />
      )}

        {showJukebox && (
          <JukeboxUI onClose={() => setShowJukebox(false)} />
        )}

        {/* Graveyard alert */}
        {showGraveyard && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowGraveyard(false)}
          >
            <div className="text-center" onClick={(e) => e.stopPropagation()}>
              <p className="text-4xl font-bold tracking-wide text-white">
                Here lies the fallen members.
              </p>
              <p className="mt-5 text-sm text-gray-500">Click or press Esc to close</p>
            </div>
          </div>
        )}
      {/* Universal "Press Enter" prompt — shown for every trigger */}
      {showPrompt && !activeGallery && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-6 z-20">
          <div
            className={`rounded-2xl border bg-black/85 px-8 py-4 text-center shadow-2xl backdrop-blur-md max-w-md w-[92%] transition-all duration-200 ${accent}`}
          >
            <p className="text-lg font-bold text-white">
              <span className="mr-2">{icon}</span>
              {activeTrigger!.name}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Press{" "}
              <kbd className="mx-0.5 rounded border border-gray-600 bg-gray-800 px-1.5 py-0.5 font-mono text-xs text-gray-200">
                Enter
              </kbd>{" "}
              to explore
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
