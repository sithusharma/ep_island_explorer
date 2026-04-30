"use client";

// ---------------------------------------------------------------------------
// useMultiplayer — connects to the PartyKit room, broadcasts the local car
// position at 20 fps, and maintains a peer-state map.
//
// Environment variable required:
//   NEXT_PUBLIC_PARTYKIT_HOST=<your-project>.partykit.dev
//   (defaults to localhost:1999 for local dev)
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState, useCallback } from "react";

// ── Public types ─────────────────────────────────────────────────────────────

export interface Peer {
  id: string;
  username: string;
  x: number;
  y: number;
  rotation: number;
  currentMap: string;
  // Interpolation targets (client-side only, not from server)
  renderX?: number;
  renderY?: number;
  renderRotation?: number;
}

// ── Linear interpolation utility (exported for renderer) ─────────────────────

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Smallest signed angle difference, used to lerp rotations correctly.
export function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  while (diff > Math.PI)  diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PARTY_HOST =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_PARTYKIT_HOST) ||
  "localhost:1999";
const ROOM = "ep-island";
const SEND_INTERVAL_MS = 50; // 20 fps
const LERP_SPEED = 0.18;     // per-frame blend toward server position

// ── Server message shapes (mirror party/index.ts) ─────────────────────────────

type ServerMsg =
  | { type: "init"; players: Peer[] }
  | { type: "playerMoved"; player: Peer }
  | { type: "removePlayer"; id: string };

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useMultiplayer(
  userId: string | null,
  username: string,
  /** Stable ref to a snapshot getter — avoids stale closures inside setInterval */
  getSnapshot: React.RefObject<() => { x: number; y: number; rotation: number; currentMap: string }>
) {
  const [peers, setPeers] = useState<Map<string, Peer>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const connectedRef = useRef(false);

  // Advance interpolation every animation frame
  const rafRef = useRef<number>(0);
  const advanceLerp = useCallback(() => {
    setPeers((prev) => {
      let changed = false;
      const next = new Map(prev);
      for (const [id, p] of next) {
        const rx = lerp(p.renderX ?? p.x, p.x, LERP_SPEED);
        const ry = lerp(p.renderY ?? p.y, p.y, LERP_SPEED);
        const rr = lerpAngle(p.renderRotation ?? p.rotation, p.rotation, LERP_SPEED);
        if (Math.abs(rx - (p.renderX ?? p.x)) > 0.1 || Math.abs(ry - (p.renderY ?? p.y)) > 0.1) {
          next.set(id, { ...p, renderX: rx, renderY: ry, renderRotation: rr });
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    rafRef.current = requestAnimationFrame(advanceLerp);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(advanceLerp);
    return () => cancelAnimationFrame(rafRef.current);
  }, [advanceLerp]);

  // WebSocket connection
  useEffect(() => {
    if (!userId) return;

    const proto = PARTY_HOST.startsWith("localhost") ? "ws" : "wss";
    const url = `${proto}://${PARTY_HOST}/parties/main/${ROOM}`;

    let ws: WebSocket;
    let sendTimer: ReturnType<typeof setInterval>;
    let destroyed = false;

    function connect() {
      ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        connectedRef.current = true;
        // Start throttled position broadcast
        sendTimer = setInterval(() => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const snap = getSnapshot.current?.();
          if (!snap) return;
          ws.send(
            JSON.stringify({
              type: "move",
              username,
              x: snap.x,
              y: snap.y,
              rotation: snap.rotation,
              currentMap: snap.currentMap,
            })
          );
        }, SEND_INTERVAL_MS);
      };

      ws.onmessage = (event: MessageEvent) => {
        let msg: ServerMsg;
        try { msg = JSON.parse(event.data as string); } catch { return; }

        if (msg.type === "init") {
          const m = new Map<string, Peer>();
          for (const p of msg.players) {
            if (p.id !== userId) m.set(p.id, { ...p, renderX: p.x, renderY: p.y, renderRotation: p.rotation });
          }
          setPeers(m);
        } else if (msg.type === "playerMoved") {
          const p = msg.player;
          if (p.id === userId) return;
          setPeers((prev) => {
            const existing = prev.get(p.id);
            const next = new Map(prev);
            next.set(p.id, {
              ...p,
              renderX: existing?.renderX ?? p.x,
              renderY: existing?.renderY ?? p.y,
              renderRotation: existing?.renderRotation ?? p.rotation,
            });
            return next;
          });
        } else if (msg.type === "removePlayer") {
          setPeers((prev) => {
            const next = new Map(prev);
            next.delete(msg.id);
            return next;
          });
        }
      };

      ws.onclose = () => {
        connectedRef.current = false;
        clearInterval(sendTimer);
        if (!destroyed) setTimeout(connect, 3000); // auto-reconnect
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      destroyed = true;
      clearInterval(sendTimer);
      ws?.close();
    };
  // username change resets connection so the server gets the updated name
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, username]);

  return { peers };
}
