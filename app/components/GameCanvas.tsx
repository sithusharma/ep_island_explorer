"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useInput } from "@/app/hooks/useInput";
import { useEngine } from "@/app/hooks/useEngine";
import ZoneOverlay from "./ZoneOverlay";
import AirportModal from "./AirportModal";
import JukeboxOverlay from "./JukeboxOverlay";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef({ w: 0, h: 0 });
  const keys = useInput();
  const [showAirport, setShowAirport] = useState(false);

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

  // Enter key handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (!activeTrigger) return;

      if (activeTrigger.type === "airport") {
        setShowAirport(true);
      }
      // Jukebox Enter — placeholder for future audio
      // Zones — no action on Enter for now
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTrigger]);

  const handleAirportSelect = useCallback(
    (destId: string) => {
      setShowAirport(false);
      startTransition(destId);
    },
    [startTransition]
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <canvas ref={canvasCallbackRef} className="block" />

      {/* Controls hint */}
      <div className="absolute left-4 bottom-4 rounded-xl bg-black/60 px-4 py-2 text-xs text-gray-500 backdrop-blur-sm z-10">
        <span className="font-semibold text-gray-300">WASD</span> or{" "}
        <span className="font-semibold text-gray-300">Arrow Keys</span> to drive
      </div>

      {/* Zone overlay */}
      {activeTrigger?.type === "zone" && (
        <ZoneOverlay name={activeTrigger.name} />
      )}

      {/* Airport trigger hint */}
      {activeTrigger?.type === "airport" && !showAirport && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-6 z-20">
          <div className="rounded-2xl border border-amber-500/30 bg-black/80 px-8 py-4 text-center shadow-2xl backdrop-blur-md max-w-md w-[92%]">
            <p className="text-lg font-bold text-white">
              <span className="mr-1 text-amber-400">✈</span> Airport
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Press{" "}
              <kbd className="mx-0.5 rounded border border-gray-600 bg-gray-800 px-1.5 py-0.5 font-mono text-xs text-gray-200">
                Enter
              </kbd>{" "}
              to check flights
            </p>
          </div>
        </div>
      )}

      {/* Airport modal */}
      {showAirport && (
        <AirportModal
          onSelect={handleAirportSelect}
          onClose={() => setShowAirport(false)}
        />
      )}

      {/* Jukebox overlay */}
      {activeTrigger?.type === "jukebox" && <JukeboxOverlay />}
    </div>
  );
}
