"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useInput } from "@/app/hooks/useInput";
import { useEngine } from "@/app/hooks/useEngine";
import { useMultiplayer } from "@/app/hooks/useMultiplayer";
import { useGameSession } from "@/app/hooks/useGameSession";
import type { PeerState } from "@/app/lib/types";
import JukeboxUI from "./JukeboxUI";
import MemoryGallery from "./MemoryGallery";

// ── Icon / accent helpers ─────────────────────────────────────────────────────

function triggerIcon(type: string, name: string): string {
  if (type === "jukebox")   return "♫";
  if (type === "graveyard") return "🪦";
  if (name.toLowerCase().includes("stadium") || name.toLowerCase().includes("coliseum")) return "🏟";
  if (name.toLowerCase().includes("pizza") || name.toLowerCase().includes("wings")) return "🍕";
  if (name.toLowerCase().includes("bar") || name.toLowerCase().includes("house") || name.toLowerCase().includes("burg")) return "🍺";
  if (name.toLowerCase().includes("wild")) return "🌿";
  if (name.toLowerCase().includes("dorm")) return "🛏";
  if (name.toLowerCase().includes("apt") || name.toLowerCase().includes("apartment") || name.toLowerCase().includes("hub")) return "🏠";
  if (name.toLowerCase().includes("store")) return "🛒";
  if (name.toLowerCase().includes("beach") || name.toLowerCase().includes("bay")) return "🏖";
  if (name.toLowerCase().includes("forest") || name.toLowerCase().includes("yunque")) return "🌲";
  if (name.toLowerCase().includes("frat")) return "🏛";
  return "📍";
}

function triggerAccent(type: string): string {
  if (type === "jukebox")   return "border-purple-500/40 text-purple-400";
  if (type === "graveyard") return "border-gray-600/40 text-gray-400";
  return "border-white/20 text-white";
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  user: User;
}

export default function GameCanvas({ user }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef({ w: 0, h: 0 });
  const keys = useInput();

  const [activeGallery, setActiveGallery] = useState<string | null>(null);
  const [showJukebox,   setShowJukebox]   = useState(false);
  const [showGraveyard, setShowGraveyard] = useState(false);

  // ── Canvas sizing ──────────────────────────────────────────────────────────

  const syncSize = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    cvs.width  = w * dpr;
    cvs.height = h * dpr;
    cvs.style.width  = `${w}px`;
    cvs.style.height = `${h}px`;
    viewportRef.current = { w, h };
  }, []);

  const canvasCallbackRef = useCallback(
    (node: HTMLCanvasElement | null) => {
      (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = node;
      if (node) { syncSize(); window.addEventListener("resize", syncSize); }
    },
    [syncSize]
  );

  // ── Peers ref — written by useMultiplayer, read by useEngine each frame ────

  const peersRef = useRef<PeerState[]>([]);

  // ── Snapshot ref — stable getter for the current car position ─────────────

  const snapshotRef = useRef<() => { x: number; y: number; rotation: number; currentMap: string }>(
    () => ({ x: 0, y: 0, rotation: 0, currentMap: "vt-island" })
  );

  // ── Game engine ────────────────────────────────────────────────────────────

  const { activeTrigger, activeMapId, carRef } = useEngine(canvasRef, viewportRef, keys, peersRef);

  // Wire the snapshot getter to the live engine refs
  useEffect(() => {
    snapshotRef.current = () => ({
      x: carRef.current.x,
      y: carRef.current.y,
      rotation: carRef.current.rotation,
      currentMap: activeMapId,
    });
  }, [carRef, activeMapId]);

  // ── Multiplayer ────────────────────────────────────────────────────────────

  const username = user.user_metadata?.username as string | undefined
    ?? user.email?.split("@")[0]
    ?? "Player";

  const { peers } = useMultiplayer(user.id, username, snapshotRef);

  // Sync peers → peersRef so the renderer can read them without React re-renders
  useEffect(() => {
    peersRef.current = Array.from(peers.values()).map((p) => ({
      id: p.id,
      username: p.username,
      renderX: p.renderX ?? p.x,
      renderY: p.renderY ?? p.y,
      renderRotation: p.renderRotation ?? p.rotation,
    }));
  }, [peers]);

  // ── Game session (Supabase Realtime) ──────────────────────────────────────

  const { isArtifact } = useGameSession();

  // ── Keyboard handlers ─────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (!activeTrigger) return;
      if (activeTrigger.type === "jukebox")   { setShowJukebox(true);   return; }
      if (activeTrigger.type === "graveyard") { setShowGraveyard(true); return; }
      setActiveGallery(activeTrigger.entityId);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTrigger]);

  useEffect(() => {
    if (!showGraveyard) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setShowGraveyard(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [showGraveyard]);

  // ── Render ────────────────────────────────────────────────────────────────

  const showPrompt = activeTrigger !== null && !activeGallery && !showJukebox && !showGraveyard;
  const accent = activeTrigger ? triggerAccent(activeTrigger.type) : "";
  const icon   = activeTrigger ? triggerIcon(activeTrigger.type, activeTrigger.name) : "";

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

      {/* Peer count badge */}
      {peers.size > 0 && (
        <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs text-cyan-400 backdrop-blur-sm z-10">
          {peers.size} online
        </div>
      )}

      {/* Artifact mode ribbon */}
      {isArtifact && (
        <div className="absolute inset-x-0 top-0 flex justify-center py-2 bg-amber-500/20 backdrop-blur-sm z-10">
          <span className="text-xs font-semibold text-amber-300 tracking-widest uppercase">
            ✦ Artifact Mode — the journey lives on ✦
          </span>
        </div>
      )}

      {/* Memory Gallery */}
      {activeGallery && (
        <MemoryGallery locationId={activeGallery} onClose={() => setActiveGallery(null)} />
      )}

      {/* Jukebox */}
      {showJukebox && <JukeboxUI onClose={() => setShowJukebox(false)} />}

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

      {/* Universal "Press Enter" prompt */}
      {showPrompt && (
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
