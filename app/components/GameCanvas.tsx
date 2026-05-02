"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/app/utils/supabase";
import { useInput } from "@/app/hooks/useInput";
import { useEngine } from "@/app/hooks/useEngine";
import { useInventory } from "@/app/hooks/useInventory";
import { useMultiplayer } from "@/app/hooks/useMultiplayer";
import { getMiloHint, useGameState } from "@/app/hooks/useGameState";
import type { PeerState } from "@/app/lib/types";
import { getCanonicalPlayerName, isPlayerMatch } from "@/app/lib/playerIdentity";
import DialogBox from "./DialogBox";
import GraveyardUI from "./GraveyardUI";
import InventoryBar from "./InventoryBar";
import JukeboxUI from "./JukeboxUI";
import MemoryGallery from "./MemoryGallery";

// ── Icon / accent helpers ─────────────────────────────────────────────────────

function triggerIcon(type: string, name: string): string {
  if (type === "jukebox") return "♫";
  if (type === "graveyard") return "🪦";
  if (name.toLowerCase().includes("stadium") || name.toLowerCase().includes("coliseum")) return "🏟";
  if (name.toLowerCase().includes("pizza") || name.toLowerCase().includes("wings")) return "🍕";
  if (name.toLowerCase().includes("bar") || name.toLowerCase().includes("house") || name.toLowerCase().includes("burg")) return "🍺";
  if (name.toLowerCase().includes("wild")) return "🌿";
  if (name.toLowerCase().includes("dorm")) return "🛏";
  if (name.toLowerCase().includes("apt") || name.toLowerCase().includes("apartment") || name.toLowerCase().includes("hub") || name.toLowerCase().includes("airbnb")) return "🏠";
  if (name.toLowerCase().includes("store")) return "🛒";
  if (name.toLowerCase().includes("beach") || name.toLowerCase().includes("bay")) return "🏖";
  if (name.toLowerCase().includes("forest") || name.toLowerCase().includes("yunque")) return "🌲";
  if (name.toLowerCase().includes("frat")) return "🏛";
  return "📍";
}

function triggerAccent(type: string): string {
  if (type === "jukebox") return "border-purple-500/40 text-purple-400";
  if (type === "graveyard") return "border-gray-600/40 text-gray-400";
  return "border-white/20 text-white";
}

function playMiloMeow() {
  if (typeof window === "undefined") return;
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(620, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.08);
  osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.18);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1800, ctx.currentTime);

  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.24);
  osc.onended = () => {
    void ctx.close();
  };
}

function isKeyPhoto(imageName: string) {
  const lower = imageName.toLowerCase();
  return lower === "key.jpg" || lower === "key.jpeg" || lower === "key.png" || lower === "key.heic" || lower === "key.heif";
}

const TOKEN_SCREEN_IMAGES: Record<string, string> = {
  jake: "/images/token_screen/jake.jpg",
  riya: "/images/token_screen/riya.jpg",
  sanjana: "/images/token_screen/sanjana.jpg",
  arav: "/images/token_screen/arav.jpg",
  arnav: "/images/token_screen/arnav.jpg",
  ani: "/images/token_screen/ani.jpg",
  shrey: "/images/token_screen/shrey.jpeg",
  suraj: "/images/token_screen/suraj.jpg",
  sarthak: "/images/token_screen/sarthak.jpeg",
};

function getTokenScreenImage(name: string) {
  return TOKEN_SCREEN_IMAGES[name.toLowerCase()] ?? "/images/token.png";
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  user: User;
}

interface ToastState {
  message: string;
  tone?: "info" | "success" | "warning";
  durationMs?: number;
}

function getEdgeY2Progress(session: { completed_milestones?: Record<string, unknown> } | null, playerName: string) {
  const milestones = session?.completed_milestones;
  if (!milestones || typeof milestones !== "object") return [] as string[];

  const edgeProgressRoot = milestones.edge_y2_progress;
  if (!edgeProgressRoot || typeof edgeProgressRoot !== "object") return [] as string[];

  const playerProgress = (edgeProgressRoot as Record<string, unknown>)[playerName];
  if (!Array.isArray(playerProgress)) return [] as string[];

  return playerProgress.filter((value): value is string => typeof value === "string");
}

export default function GameCanvas({ user }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef({ w: 0, h: 0 });
  const keys = useInput();

  const [activeGallery, setActiveGallery] = useState<string | null>(null);
  const [showJukebox, setShowJukebox] = useState(false);
  const [showGraveyard, setShowGraveyard] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAbcHint, setShowAbcHint] = useState(false);
  const [showJakeToken, setShowJakeToken] = useState(false);
  const [showRiyaToken, setShowRiyaToken] = useState(false);
  const [showSanjanaToken, setShowSanjanaToken] = useState(false);
  const [showAravToken, setShowAravToken] = useState(false);
  const [showArnavToken, setShowArnavToken] = useState(false);
  const [showPersonalEdgeToken, setShowPersonalEdgeToken] = useState(false);
  const [showFloofToken, setShowFloofToken] = useState(false);
  const [showFinalNote, setShowFinalNote] = useState(false);
  const [showFinalPhoto, setShowFinalPhoto] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // ── Canvas sizing ──────────────────────────────────────────────────────────

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

  const username = user.user_metadata?.username as string | undefined
    ?? user.email?.split("@")[0]
    ?? "Player";
  const canonicalUsername = getCanonicalPlayerName(username);

  const {
    items: inventoryItems,
    activeArtifacts,
    collectArtifact,
  } = useInventory(username);

  const { currentStage, isArtifact, advanceStage, unlockToken, completeMilestone, session } = useGameState();
  const collegiatePhotosDone = ["COLLEGIATE_Y2_TOKEN", "COLLEGIATE_Y3_TOKEN", "COLLEGIATE_Y4_TOKEN"].every((token) =>
    (session?.unlocked_tokens ?? []).includes(token)
  );
  const showArtifactMode = isArtifact || collegiatePhotosDone;
  const hasFakeId = activeArtifacts.some((a) => a.trim().toLowerCase() === "fake id");
  const hasWheelchair = activeArtifacts.some((a) => a.trim().toLowerCase() === "wheelchair");

  useEffect(() => {
    if (collegiatePhotosDone && currentStage < 10) {
      void advanceStage(10);
    }
  }, [advanceStage, collegiatePhotosDone, currentStage]);

  const { activeTrigger, activeMapId, nearbyNpcId, carRef } = useEngine(
    canvasRef,
    viewportRef,
    keys,
    peersRef,
    {
      currentPlayerName: username,
      currentStage,
      unlockedTokens: session?.unlocked_tokens ?? [],
      collectedArtifactNames: activeArtifacts,
      onCollectArtifact: async (artifact) => {
        await collectArtifact(artifact.name);
        if (artifact.name === "Lord Floof") setShowFloofToken(true);
        if (artifact.name === "Beer") {
          setToast({ message: "Oh boy. I hope you do not go out now... or, even worse, try to talk to some girl.", tone: "info", durationMs: 5000 });
        }
        if (artifact.name === "Fake ID") {
          setToast({ message: "You got a fake ID!", tone: "success", durationMs: 5000 });
        }
        if (artifact.name === "Wheelchair") {
          setToast({ message: "Oh man, this guy is so gone. We have to go back to the hotel now.", tone: "warning", durationMs: 5000 });
        }
        if (artifact.name === "Condom") {
          setToast({ message: "Oh man, please do not use this, especially not where we are sleeping.", tone: "warning", durationMs: 5000 });
        }
        if (artifact.unlockToken) await unlockToken(artifact.unlockToken);
        if (artifact.advanceStageTo !== undefined) await advanceStage(artifact.advanceStageTo);
      },
      onRejectArtifact: (artifact) => {
        setToast({ message: "Sorry, you cannot pick this up.", tone: "warning", durationMs: 5000 });
      },
    }
  );

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
  // ── Keyboard handlers ─────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (nearbyNpcId === "milo") {
        playMiloMeow();
        setIsDialogOpen(true);
        return;
      }
      if (!activeTrigger) return;

      if (activeTrigger.entityId === "nightlife") {
        if (currentStage === 5 && activeArtifacts.some(a => a.trim().toLowerCase() === "beer")) {
          setShowAravToken(true);
          void unlockToken("ARAV_TOKEN");
          void advanceStage(6);
          return;
        }
      }

      if (activeTrigger.entityId === "riu" && hasWheelchair && currentStage < 2) {
        setShowJakeToken(true);
        void unlockToken("JAKE_TOKEN");
        void advanceStage(2);
        return;
      }

      if (activeTrigger.entityId === "scary-airbnb") {
        if (currentStage < 4) {
          if (activeArtifacts.some(a => a.trim().toLowerCase() === "condom")) {
            setShowRiyaToken(true);
            void unlockToken("RIYA_TOKEN");
            void advanceStage(4);
          } else {
            setToast({ message: "The AirBnB is locked.", tone: "warning", durationMs: 5000 });
          }
          return;
        }
      }

      if (activeTrigger.entityId === "abc-store" && !hasFakeId) {
        setToast({ message: "ABC is locked. You need an ID. Where were we all when we got our fake ID?", tone: "warning", durationMs: 5000 });
        return;
      }
      if (activeTrigger.entityId === "abc-store" && hasFakeId) {
        setShowAbcHint(true);
        return;
      }
      if (activeTrigger.entityId === "final-note") {
        setShowFinalNote(true);
        return;
      }
      if (activeTrigger.type === "jukebox") { setShowJukebox(true); return; }
      if (activeTrigger.type === "graveyard") { setShowGraveyard(true); return; }
      setActiveGallery(activeTrigger.entityId);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTrigger, hasFakeId, hasWheelchair, currentStage, nearbyNpcId, unlockToken, advanceStage]);

  useEffect(() => {
    if (!isDialogOpen) return;
    playMiloMeow();
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setIsDialogOpen(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isDialogOpen]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), toast.durationMs ?? 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  // ── Render ────────────────────────────────────────────────────────────────

  const graveyardDone = (session?.unlocked_tokens ?? []).includes("graveyard-done");
  const activePromptBlockers = !activeGallery && !showJukebox && !showGraveyard && !isDialogOpen && !showAbcHint && !showJakeToken && !showRiyaToken && !showSanjanaToken && !showAravToken && !showArnavToken && !showPersonalEdgeToken && !showFloofToken && !showFinalNote && !showFinalPhoto;
  const showPrompt = activeTrigger !== null && activePromptBlockers;
  const activeNpcLabel = nearbyNpcId === "milo" ? "🐈 Milo" : null;
  const showNpcPrompt = activeNpcLabel !== null && activePromptBlockers;
  const accent = activeTrigger ? triggerAccent(activeTrigger.type) : "";
  const icon = activeTrigger ? triggerIcon(activeTrigger.type, activeTrigger.name) : "";
  const triggerPromptText =
    activeTrigger?.entityId === "final-note"
      ? "Press Enter to read the note"
      : "Press Enter to explore";
  const npcPromptText =
    currentStage >= 10
      ? "Press Enter to celebrate"
      : "Press Enter to talk";

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

      <InventoryBar items={inventoryItems} slots={8} />

      {/* Logout */}
      <button
        type="button"
        onClick={() => supabase.auth.signOut()}
        className="absolute z-10 rounded-full bg-black/50 px-2.5 py-1 text-[10px] text-gray-500 backdrop-blur-sm hover:text-gray-300 hover:bg-black/70 transition"
        style={{ left: 14, top: 48 }}
      >
        sign out
      </button>

      {/* Peer count badge */}
      {peers.size > 0 && (
        <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs text-cyan-400 backdrop-blur-sm z-10">
          {peers.size} online
        </div>
      )}

      {/* Artifact mode ribbon */}
      {showArtifactMode && (
        <div className="absolute inset-x-0 top-0 flex justify-center py-2 bg-amber-500/20 backdrop-blur-sm z-10">
          <span className="text-xs font-semibold text-amber-300 tracking-widest uppercase">
            ✦ Artifact Mode — the journey lives on ✦
          </span>
        </div>
      )}

      {/* Memory Gallery */}
      {activeGallery && (
        <MemoryGallery
          locationId={activeGallery}
          mapId={activeMapId}
          onClose={() => setActiveGallery(null)}
          onImageSelect={async (imageName, subfolder) => {
            if (activeGallery === "edges-apt" && subfolder) {
              if (isKeyPhoto(imageName)) {
                if (subfolder.toUpperCase() !== "Y2") {
                  return;
                }

                const isOgEdgeMember = ["suraj", "sarthak", "shrey", "ani"].some((name) => isPlayerMatch(canonicalUsername, name));
                if (isOgEdgeMember) {
                  const personalToken = `${canonicalUsername.toUpperCase()}_EDGE_TOKEN`;
                  const unlocked = session?.unlocked_tokens ?? [];
                  const lowerImageName = imageName.toLowerCase();
                  const trackedKeyName = lowerImageName === "key.jpeg" ? "key.jpeg" : "key.jpg";
                  const currentProgress = getEdgeY2Progress(session, canonicalUsername);
                  const nextProgress = Array.from(new Set([...currentProgress, trackedKeyName]));

                  await completeMilestone("edge_y2_progress", {
                    ...((session?.completed_milestones?.edge_y2_progress as Record<string, unknown> | undefined) ?? {}),
                    [canonicalUsername]: nextProgress,
                  });

                  if (unlocked.includes(personalToken)) {
                    setToast({ message: "You already found both of your Edge photos.", tone: "info", durationMs: 5000 });
                  } else if (nextProgress.includes("key.jpg") && nextProgress.includes("key.jpeg")) {
                    setActiveGallery(null);
                    setShowPersonalEdgeToken(true);
                    void unlockToken(personalToken);
                    if (currentStage === 7) {
                      void advanceStage(8);
                    }
                  } else {
                    setToast({ message: `You found ${trackedKeyName}. Find the other Edge photo too.`, tone: "info", durationMs: 5000 });
                  }
                } else if (isPlayerMatch(canonicalUsername, "sithu")) {
                  setToast({ message: "Lol. Game master.", tone: "info", durationMs: 5000 });
                } else {
                  setToast({ message: "Good job, but you are not part of the OG Edge group.", tone: "warning", durationMs: 5000 });
                }
              }
              return;
            }

            if (activeGallery === "abc-store") {
              if (isKeyPhoto(imageName)) {
                setToast({
                  message: "You found the photo! I wonder where this photo took place at?",
                  tone: "info",
                  durationMs: 6000,
                });
              }
              return;
            }
            if (activeGallery.startsWith("garage-")) {
              if (isKeyPhoto(imageName)) {
                setToast({
                  message: "Lol, there is no hint here. I just wanted you guys to see your chopped asses.",
                  tone: "info",
                  durationMs: 6000,
                });
                if (currentStage === 6) {
                  void advanceStage(7);
                }
              }
              return;
            }
            if (activeGallery.startsWith("nyc")) {
              if (!isKeyPhoto(imageName)) return;
              if (isPlayerMatch(canonicalUsername, "sanjana") || isPlayerMatch(canonicalUsername, "sithu")) {
                setActiveGallery(null);
                setShowSanjanaToken(true);
                await unlockToken("SANJANA_TOKEN");
                await advanceStage(5);
              } else {
                setToast({
                  message: "Good job, you found the token, but you are not the right person.",
                  tone: "warning",
                  durationMs: 5000,
                });
              }
              return;
            }
            if (currentStage === 8 && imageName.toLowerCase().startsWith("smoke")) {
              if (isPlayerMatch(canonicalUsername, "arnav") || isPlayerMatch(canonicalUsername, "sithu")) {
                setActiveGallery(null);
                setShowArnavToken(true);
                await unlockToken("ARNAV_TOKEN");
                await advanceStage(9);
              } else {
                setToast({
                  message: "Good job, you found the token, but you are not the right person.",
                  tone: "warning",
                  durationMs: 5000,
                });
              }
              return;
            }
            if (currentStage === 9 && activeGallery === "collegiate-apt" && subfolder) {
              if (isKeyPhoto(imageName)) {
                const yearToken = `COLLEGIATE_${subfolder.toUpperCase()}_TOKEN`;
                const unlocked = session?.unlocked_tokens ?? [];
                
                if (!unlocked.includes(yearToken)) {
                  await unlockToken(yearToken);
                  const newUnlocked = [...unlocked, yearToken];
                  
                  if (newUnlocked.includes("COLLEGIATE_Y2_TOKEN") && newUnlocked.includes("COLLEGIATE_Y3_TOKEN") && newUnlocked.includes("COLLEGIATE_Y4_TOKEN")) {
                    setToast({ message: "All Collegiate photos found! Go talk to Milo.", tone: "success", durationMs: 7000 });
                    await advanceStage(10);
                  } else {
                    setToast({ message: `You found the key photo for Collegiate ${subfolder}!`, tone: "success", durationMs: 4000 });
                  }
                } else {
                  setToast({ message: `Already found the key photo for Collegiate ${subfolder}!`, tone: "info", durationMs: 5000 });
                }
              }
              return;
            }
          }}
        />
      )}

      {/* Jukebox */}
      {showJukebox && <JukeboxUI onClose={() => setShowJukebox(false)} />}

      {isDialogOpen && (
        <DialogBox
          title="Milo"
          message={getMiloHint(currentStage, session?.unlocked_tokens ?? [])}
          onClose={() => setIsDialogOpen(false)}
        />
      )}

      {showFinalNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="w-full max-w-3xl rounded-3xl border border-amber-300/20 bg-neutral-950/95 px-8 py-8 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-300 mb-3">A Note From Us</p>
            <div className="max-h-[62vh] space-y-4 overflow-y-auto pr-2 text-sm leading-7 text-gray-200">
              <p>
                If you are reading this, then you actually made it. That means you drove around, looked through all the chaos,
                found the weird clues, and stuck with the game all the way to the end.
              </p>
              <p>
                We made this because these memories matter to us. Some of them are funny, some are embarrassing, some are
                unbelievably cursed, and some are the kind of moments that only make sense because all of you were there for them.
              </p>
              <p>
                Thank you for taking the time to play through it together. The whole point was never just to win. It was to go back
                through the places, the photos, the stories, and the people that made everything feel like ours in the first place.
              </p>
              <p>
                Even when life changes, people move, and everything gets messier than we expected, we still get to keep this version
                of all of us somewhere. Loud, dumb, sentimental, and very online.
              </p>
              <p>
                We hope this made you laugh, made you remember something good, and maybe made you feel a little loved too.
              </p>
              <p>
                Seriously, thank you for playing our ridiculous game.
              </p>
              <p className="text-amber-200">
                Love,
                <br />
                Us
              </p>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowFinalNote(false)}
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/10"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFinalNote(false);
                  setShowFinalPhoto(true);
                }}
                className="rounded-full border border-amber-400/40 bg-amber-500/20 px-6 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/35"
              >
                See the final photo
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinalPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
          <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-neutral-950/95 px-8 py-8 shadow-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-300 mb-3">The End</p>
            <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img
                src="/images/group_photo.JPG"
                alt="Final group photo"
                className="h-auto w-full object-cover"
              />
            </div>
            <p className="mx-auto max-w-2xl text-base leading-7 text-gray-200">
              Thanks for playing, for looking through the memories, and for making the stories worth saving in the first place.
              We love you guys.
            </p>
            <button
              type="button"
              onClick={() => setShowFinalPhoto(false)}
              className="mt-8 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-8 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/30"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showAbcHint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-[90%] max-w-lg rounded-3xl border border-amber-400/30 bg-neutral-950/95 px-10 py-10 shadow-2xl text-center">
            <p className="text-2xl font-bold text-amber-300 mb-4">🍺 ABC Store Hint</p>
            <p className="text-lg leading-8 text-white">
              These pictures include all of us super drunk. One of them will lead you to the next hint. For some help look for a petite person.
            </p>
            <button
              type="button"
              onClick={() => { setShowAbcHint(false); setActiveGallery("abc-store"); }}
              className="mt-8 rounded-full border border-amber-400/40 bg-amber-500/20 px-8 py-3 text-base font-semibold text-amber-100 transition hover:bg-amber-500/40"
            >
              Got it ✕
            </button>
          </div>
        </div>
      )}

      {/* Jake Token — theatrical reveal */}
      {showJakeToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "radial-gradient(ellipse at center, #1a0a00 0%, #000 70%)" }}>

          {/* Ambient glow rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full opacity-20 animate-ping"
              style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[400px] h-[400px] rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, #fde68a 0%, transparent 60%)" }} />
          </div>

          {/* Card */}
          <div className="relative z-10 flex flex-col items-center text-center px-12 py-10 max-w-2xl w-[92%] rounded-3xl border border-amber-400/20"
            style={{ background: "linear-gradient(160deg, rgba(120,53,15,0.35) 0%, rgba(0,0,0,0.6) 100%)", backdropFilter: "blur(12px)" }}>

            {/* Photo */}
            <div className="mb-5 rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-400/40 w-full max-w-xs aspect-square">
              <img src={getTokenScreenImage("jake")} alt="Jake" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.4em] text-amber-400 mb-2">
              Token Unlocked
            </p>

            <h1 className="text-5xl font-black text-white mb-2 tracking-tight"
              style={{ textShadow: "0 0 40px rgba(251,191,36,0.6)" }}>
              Congrats Jake! 🏆
            </h1>

            <p className="text-lg text-amber-200 font-semibold mb-5">
              Now stop drinking so much.
            </p>



            <button
              type="button"
              onClick={() => {
                setShowJakeToken(false);
                setToast({ message: "Milo will give you the next hint.", tone: "info", durationMs: 6000 });
              }}
              className="rounded-full border border-amber-400/50 bg-amber-500/20 px-14 py-4 text-lg font-bold text-amber-100 transition hover:bg-amber-500/40 hover:scale-105 active:scale-95"
            >
              Claim ✦
            </button>
          </div>
        </div>
      )}

      {showRiyaToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "radial-gradient(ellipse at center, #2e004f 0%, #000 70%)" }}>

          {/* Ambient glow rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full opacity-20 animate-ping"
              style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }} />
          </div>

          {/* Card */}
          <div className="relative z-10 flex flex-col items-center text-center px-12 py-10 max-w-2xl w-[92%] rounded-3xl border border-purple-400/20"
            style={{ background: "linear-gradient(160deg, rgba(88,28,135,0.35) 0%, rgba(0,0,0,0.6) 100%)", backdropFilter: "blur(12px)" }}>

            {/* Photo */}
            <div className="mb-5 rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-400/40 w-full max-w-xs aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getTokenScreenImage("riya")} alt="Riya" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.4em] text-purple-400 mb-2">
              Token Unlocked
            </p>

            <h1 className="text-5xl font-black text-white mb-2 tracking-tight"
              style={{ textShadow: "0 0 40px rgba(168,85,247,0.6)" }}>
              Congrats Riya! 🏆
            </h1>

            <p className="text-lg text-purple-200 font-semibold mb-5">
              man you guys are nasty
            </p>



            <button
              type="button"
              onClick={() => {
                setShowRiyaToken(false);
                setActiveGallery("scary-airbnb");
                setToast({ message: "Milo will give you the next hint.", tone: "info", durationMs: 6000 });
              }}
              className="rounded-full border border-purple-400/50 bg-purple-500/20 px-14 py-4 text-lg font-bold text-purple-100 transition hover:bg-purple-500/40 hover:scale-105 active:scale-95"
            >
              Claim ✦
            </button>
          </div>
        </div>
      )}

      {showSanjanaToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "radial-gradient(ellipse at center, #0a1f2c 0%, #000 70%)" }}>

          {/* Ambient glow rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full opacity-20 animate-ping"
              style={{ background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)" }} />
          </div>

          {/* Card */}
          <div className="relative z-10 flex flex-col items-center text-center px-12 py-10 max-w-2xl w-[92%] rounded-3xl border border-sky-400/20"
            style={{ background: "linear-gradient(160deg, rgba(12,74,110,0.35) 0%, rgba(0,0,0,0.6) 100%)", backdropFilter: "blur(12px)" }}>
            <img src={getTokenScreenImage("sanjana")} alt="Sanjana" className="w-32 h-32 object-cover rounded-xl mb-4 border border-sky-400/30 shadow-xl" onError={(e) => e.currentTarget.style.display = 'none'} />
            <div className="text-6xl mb-3 animate-bounce select-none">🩼</div>

            <p className="text-xs font-bold uppercase tracking-[0.4em] text-sky-400 mb-2">
              Token Unlocked
            </p>

            <h1 className="text-5xl font-black text-white mb-2 tracking-tight"
              style={{ textShadow: "0 0 40px rgba(14,165,233,0.6)" }}>
              Congrats Sanjana! 🏆
            </h1>

            <p className="text-lg text-sky-200 font-semibold mb-5">
              Hope the crutches were fun!
            </p>



            <button
              type="button"
              onClick={() => {
                setShowSanjanaToken(false);
                setToast({ message: "Milo will give you the next hint.", tone: "info", durationMs: 6000 });
              }}
              className="rounded-full border border-sky-400/50 bg-sky-500/20 px-14 py-4 text-lg font-bold text-sky-100 transition hover:bg-sky-500/40 hover:scale-105 active:scale-95"
            >
              Claim ✦
            </button>
          </div>
        </div>
      )}

      {showNpcPrompt && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-6 z-20">
          <div className="rounded-2xl border border-emerald-400/30 bg-black/85 px-7 py-3 text-center shadow-2xl backdrop-blur-md max-w-sm w-[92%]">
            <p className="text-lg font-bold text-white">
              {activeNpcLabel}
            </p>
            <p className="mt-1 text-sm text-emerald-200">
              Press{" "}
              <kbd className="mx-0.5 rounded border border-emerald-300/30 bg-emerald-950/40 px-1.5 py-0.5 font-mono text-xs text-emerald-100">
                Enter
              </kbd>{" "}
              {npcPromptText.replace("Press Enter ", "")}
            </p>
          </div>
        </div>
      )}

      {showAravToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-md">

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full opacity-30 animate-ping"
              style={{ background: "radial-gradient(circle, #fcd34d 0%, transparent 70%)" }} />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-12 py-10 max-w-2xl w-[92%] rounded-3xl border border-amber-300/30 bg-neutral-900/80 shadow-2xl backdrop-blur-xl">
            <img src={getTokenScreenImage("arav")} alt="Arav" className="w-32 h-32 object-cover rounded-xl mb-4 border border-amber-300/30 shadow-xl" onError={(e) => e.currentTarget.style.display = 'none'} />
            <div className="text-6xl mb-3 animate-bounce select-none">🏆</div>

            <p className="text-xs font-bold uppercase tracking-[0.4em] text-amber-400 mb-2">
              maybe next time
            </p>

            <h1 className="text-5xl font-black text-white mb-2 tracking-tight"
              style={{ textShadow: "0 0 30px rgba(251,191,36,0.4)" }}>
              Congrats Arav! 🏆
            </h1>



            <button
              type="button"
              onClick={() => {
                setShowAravToken(false);
                setToast({ message: "Something appeared at VT! Ask Milo about it for your next hint.", tone: "info", durationMs: 6000 });
              }}
              className="rounded-full border border-amber-400/40 bg-amber-500/20 px-14 py-4 text-lg font-bold text-amber-50 transition hover:bg-amber-500/40 hover:scale-105 active:scale-95"
            >
              Claim ✦
            </button>
          </div>
        </div>
      )}

      {showArnavToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-md">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full opacity-30 animate-ping"
              style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }} />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-12 py-10 max-w-2xl w-[92%] rounded-3xl border border-blue-300/30 bg-neutral-900/80 shadow-2xl backdrop-blur-xl">
            <img src={getTokenScreenImage("arnav")} alt="Arnav" className="w-32 h-32 object-cover rounded-xl mb-4 border border-blue-300/30 shadow-xl" onError={(e) => e.currentTarget.style.display = 'none'} />
            <div className="text-6xl mb-3 animate-bounce select-none">🏆</div>

            <p className="text-xs font-bold uppercase tracking-[0.4em] text-blue-400 mb-2">
              Smoke Token Unlocked
            </p>

            <h1 className="text-5xl font-black text-white mb-2 tracking-tight"
              style={{ textShadow: "0 0 30px rgba(59,130,246,0.4)" }}>
              Congrats Arnav! 🏆
            </h1>



            <button
              type="button"
              onClick={() => {
                setShowArnavToken(false);
                setToast({ message: "Milo will give you the next hint.", tone: "info", durationMs: 6000 });
              }}
              className="rounded-full border border-blue-400/40 bg-blue-500/20 px-14 py-4 text-lg font-bold text-blue-50 transition hover:bg-blue-500/40 hover:scale-105 active:scale-95"
            >
              Claim ✦
            </button>
          </div>
        </div>
      )}

      {showPersonalEdgeToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/80 backdrop-blur-md">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full opacity-40 animate-pulse"
              style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-12 py-10 max-w-2xl w-[92%] rounded-3xl border border-violet-500/30 bg-neutral-900/80 shadow-2xl backdrop-blur-xl">
            <img src={getTokenScreenImage(username)} alt="Token" className="w-32 h-32 object-cover rounded-xl mb-4 border border-violet-500/30 shadow-xl" onError={(e) => e.currentTarget.style.display = 'none'} />
            <div className="text-6xl mb-3 animate-bounce select-none">🗝️</div>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-violet-400 mb-2">
              edge memories complete
            </p>
            <h1 className="text-5xl font-black text-white mb-2 tracking-tight capitalize"
              style={{ textShadow: "0 0 30px rgba(139,92,246,0.4)" }}>
              Congrats {username}! 🏆
            </h1>

            <button
              type="button"
              onClick={() => {
                setShowPersonalEdgeToken(false);
                setToast({ message: "Milo will give you the next hint.", tone: "info", durationMs: 6000 });
              }}
              className="rounded-full border border-violet-500/40 bg-violet-600/20 px-14 py-4 text-lg font-bold text-violet-50 transition hover:bg-violet-600/40 hover:scale-105 active:scale-95"
            >
              Claim ✦
            </button>
          </div>
        </div>
      )}

      {/* Lord Floof — theatrical token reveal */}
      {showFloofToken && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #ff4fa3 0%, #c471ed 30%, #7b52f6 60%, #12c2e9 100%)" }}
        >
          {/* Floating sparkles */}
          {["✦", "✧", "✦", "✧", "✦", "✧", "✦", "✧"].map((s, i) => (
            <span
              key={i}
              className="pointer-events-none absolute text-white/40 animate-pulse select-none"
              style={{
                top: `${10 + (i * 11) % 80}%`,
                left: `${5 + (i * 13) % 90}%`,
                fontSize: `${14 + (i % 3) * 8}px`,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              {s}
            </span>
          ))}

          {/* Card */}
          <div
            className="relative z-10 flex flex-col items-center text-center px-10 py-10 max-w-2xl w-[94%] rounded-3xl shadow-2xl"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            {/* Photo */}
            <div className="mb-6 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30 w-full max-w-sm aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/floof.jpeg"
                alt="Sarah and Lord Floof"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-6xl mb-3 animate-bounce select-none">🦄</div>

            <h1
              className="text-5xl font-black mb-2 tracking-tight"
              style={{
                background: "linear-gradient(90deg, #fff 0%, #fde68a 40%, #fff 80%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "none",
              }}
            >
              Congrats Sarah! YOU GOT A TOKEN!
            </h1>

            <p className="text-lg font-semibold text-white/80 mb-5">
              Why you so weird though 😭
            </p>



            <button
              type="button"
              onClick={() => {
                setShowFloofToken(false);
                setToast({ message: "Milo will give you the next hint.", tone: "info", durationMs: 6000 });
              }}
              className="rounded-full px-14 py-4 text-lg font-black text-white transition hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(90deg, #ff4fa3, #c471ed, #7b52f6)", boxShadow: "0 0 30px rgba(196,113,237,0.6)" }}
            >
              Claim ✦
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-[100] flex justify-center px-4">
          <div
            className={[
              "max-w-xl rounded-2xl border px-5 py-3 text-sm font-semibold shadow-2xl backdrop-blur-md",
              toast.tone === "success" && "border-emerald-400/30 bg-emerald-950/85 text-emerald-100",
              toast.tone === "warning" && "border-amber-400/30 bg-amber-950/85 text-amber-100",
              (!toast.tone || toast.tone === "info") && "border-white/10 bg-neutral-950/88 text-white",
            ].filter(Boolean).join(" ")}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* Graveyard */}
      {showGraveyard && (
        <GraveyardUI
          onClose={() => setShowGraveyard(false)}
          alreadyDone={graveyardDone}
          onComplete={async () => {
            await unlockToken("graveyard-done");
            setToast({ message: "The fallen have been honored.", tone: "success", durationMs: 6000 });
          }}
        />
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
              {triggerPromptText.replace("Press Enter ", "")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
