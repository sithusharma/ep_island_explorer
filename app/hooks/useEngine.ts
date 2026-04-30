"use client";

import { useRef, useState, useCallback } from "react";
import type { CarState, MapData, NpcState, ActiveTrigger, PeerState } from "@/app/lib/types";
import { isInBoundary, findTrigger } from "@/app/lib/collision";
import { initNpc, updateNpc } from "@/app/lib/npc";
import { renderFrame } from "@/app/lib/renderer";
import { getMap } from "@/app/lib/maps/registry";
import { useGameLoop } from "./useGameLoop";

// ── Physics constants ─────────────────────────────────────────────────────

const ACCEL     = 320;   // reduced for slower acceleration
const REV_ACCEL = 200;   // reduced reverse acceleration
const TURN      = 3.0;   // slightly smoother steering
const FRICTION  = 0.97;  // slightly higher friction for easier control
const MAX_SPD   = 380;   // lower max speed
const FADE_DUR  = 0.5;   // seconds per fade direction

const CAR_HALF_L = 19;
const CAR_HALF_W = 11;
const SOLID_PAD_PX = 3;

function getCarCorners(car: CarState): { x: number; y: number }[] {
  const cos = Math.cos(car.rotation);
  const sin = Math.sin(car.rotation);
  return [
    { x: car.x + cos * CAR_HALF_L - sin * CAR_HALF_W, y: car.y + sin * CAR_HALF_L + cos * CAR_HALF_W },
    { x: car.x + cos * CAR_HALF_L + sin * CAR_HALF_W, y: car.y + sin * CAR_HALF_L - cos * CAR_HALF_W },
    { x: car.x - cos * CAR_HALF_L - sin * CAR_HALF_W, y: car.y - sin * CAR_HALF_L + cos * CAR_HALF_W },
    { x: car.x - cos * CAR_HALF_L + sin * CAR_HALF_W, y: car.y - sin * CAR_HALF_L - cos * CAR_HALF_W },
  ];
}

function ptInRect(px: number, py: number, rx: number, ry: number, rw: number, rh: number) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

function checkSolidsPadded(car: CarState, entities: MapData["entities"], padPx: number): boolean {
  for (const e of entities) {
    if (!e.solid || !e.hitbox) continue;
    const bx = e.x + e.hitbox.ox - padPx;
    const by = e.y + e.hitbox.oy - padPx;
    const bw = e.hitbox.w + padPx * 2;
    const bh = e.hitbox.h + padPx * 2;

    if (ptInRect(car.x, car.y, bx, by, bw, bh)) return true;
    for (const c of getCarCorners(car)) {
      if (ptInRect(c.x, c.y, bx, by, bw, bh)) return true;
    }
  }
  return false;
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useEngine(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  viewportRef: React.RefObject<{ w: number; h: number }>,
  keys: React.RefObject<Set<string>>,
  peersRef?: React.RefObject<PeerState[]>
) {
  // ── Active map state (React-level, triggers re-render for UI) ──────
  const [activeMapId, setActiveMapId] = useState("vt-island");
  const [activeTrigger, setActiveTrigger] = useState<ActiveTrigger | null>(null);

  // ── Refs for mutable game state (no re-renders) ────────────────────
  const initialMap = getMap("vt-island");
  const mapRef = useRef<MapData>(initialMap);
  const carRef = useRef<CarState>({
    x: initialMap.spawnX,
    y: initialMap.spawnY,
    speed: 0,
    rotation: initialMap.spawnRotation,
  });
  const npcsRef = useRef<NpcState[]>(initialMap.npcs.map(initNpc));
  const safePosRef = useRef({ x: initialMap.spawnX, y: initialMap.spawnY });

  // Fade transition
  const fadeRef = useRef({
    alpha: 0,
    dir: 0 as -1 | 0 | 1,
    dest: "",
    teleport: null as null | { x: number; y: number },
  });

  // Ferry cooldown — prevents instant bounce-back after teleport
  const ferryRef = useRef({ cooldown: 0 });

  // ── Map transition ─────────────────────────────────────────────────
  const startTransition = useCallback((destId: string) => {
    if (fadeRef.current.dir !== 0) return; // already transitioning
    fadeRef.current = { alpha: 0, dir: 1, dest: destId, teleport: null };
  }, []);

  const startTeleportTransition = useCallback((x: number, y: number) => {
    if (fadeRef.current.dir !== 0) return;
    fadeRef.current = { alpha: 0, dir: 1, dest: "", teleport: { x, y } };
  }, []);

  // Actually swap the map (called at peak of fade)
  const swapMap = useCallback((destId: string) => {
    const m = getMap(destId);
    mapRef.current = m;
    carRef.current = {
      x: m.spawnX,
      y: m.spawnY,
      speed: 0,
      rotation: m.spawnRotation,
    };
    npcsRef.current = m.npcs.map(initNpc);
    safePosRef.current = { x: m.spawnX, y: m.spawnY };
    setActiveMapId(destId);
    setActiveTrigger(null);
  }, [mapRef, carRef, npcsRef]);

  const finishTeleport = useCallback((x: number, y: number) => {
    carRef.current.x = x;
    carRef.current.y = y;
    carRef.current.speed = 0;
    safePosRef.current = { x, y };
    setActiveTrigger(null);
  }, []);

  // ── Game Loop ──────────────────────────────────────────────────────
  useGameLoop((dt) => {
    const map = mapRef.current;
    const car = carRef.current;
    const k = keys.current!;

    // ── Fade transition logic ────────────────────────────────────────
    const fade = fadeRef.current;
    if (fade.dir !== 0) {
      fade.alpha += fade.dir * (dt / FADE_DUR);
      if (fade.dir === 1 && fade.alpha >= 1) {
        fade.alpha = 1;
        if (fade.dest) {
          swapMap(fade.dest);
        } else if (fade.teleport) {
          finishTeleport(fade.teleport.x, fade.teleport.y);
          ferryRef.current.cooldown = 1.5;
        }
        fade.dir = -1;
      } else if (fade.dir === -1 && fade.alpha <= 0) {
        fade.alpha = 0;
        fade.dir = 0;
        fade.dest = "";
        fade.teleport = null;
      }
    }

    // ── Vehicle physics (skip during transition) ─────────────────────
    if (fade.dir === 0) {
      const canTurn = Math.abs(car.speed) > 5;
      const tDir = canTurn ? (car.speed < 0 ? -1 : 1) : 0;

      if (k.has("a") || k.has("arrowleft")) car.rotation -= TURN * dt * tDir;
      if (k.has("d") || k.has("arrowright")) car.rotation += TURN * dt * tDir;
      if (k.has("w") || k.has("arrowup")) car.speed += ACCEL * dt;
      if (k.has("s") || k.has("arrowdown")) car.speed -= REV_ACCEL * dt;

      car.speed *= FRICTION;
      if (car.speed > MAX_SPD) car.speed = MAX_SPD;
      if (car.speed < -MAX_SPD * 0.5) car.speed = -MAX_SPD * 0.5;
      if (Math.abs(car.speed) < 0.5) car.speed = 0;

      // Proposed position
      const vx = Math.cos(car.rotation) * car.speed * dt;
      const vy = Math.sin(car.rotation) * car.speed * dt;
      const nx = car.x + vx;
      const ny = car.y + vy;

      // Collision checks
      const proposed: CarState = { ...car, x: nx, y: ny };
      const hitSolid = checkSolidsPadded(proposed, map.entities, SOLID_PAD_PX);
      const outOfBounds = !isInBoundary(nx, ny, map.boundary);

      if (!hitSolid && !outOfBounds) {
        car.x = nx;
        car.y = ny;
        safePosRef.current = { x: car.x, y: car.y };
      } else {
        // Push-back so the car doesn't settle inside a hitbox.
        // Also apply a small bounce by inverting velocity.
        const push = 1.2;
        car.x -= vx * push;
        car.y -= vy * push;

        // If the car still collides (e.g. spawned into a corner), nudge it further back.
        if (checkSolidsPadded(car, map.entities, SOLID_PAD_PX)) {
          const len = Math.hypot(vx, vy) || 1;
          car.x -= (vx / len) * 4;
          car.y -= (vy / len) * 4;
        }

        // Boundary bounce-back
        if (!isInBoundary(car.x, car.y, map.boundary)) {
          car.x -= (vx === 0 ? 0 : Math.sign(vx)) * 6;
          car.y -= (vy === 0 ? 0 : Math.sign(vy)) * 6;
        }

        if (checkSolidsPadded(car, map.entities, SOLID_PAD_PX) || !isInBoundary(car.x, car.y, map.boundary)) {
          car.x = safePosRef.current.x;
          car.y = safePosRef.current.y;
        }

        car.speed *= -0.3;
      }

      // ── Ferry cooldown tick ────────────────────────────────────────
      if (ferryRef.current.cooldown > 0) ferryRef.current.cooldown -= dt;

      // ── Trigger detection ──────────────────────────────────────────
      const trigEntity = findTrigger(car, map.entities);
      if (trigEntity?.trigger) {
        const t = trigEntity.trigger;
        const vp = viewportRef.current!;
        const screenX = trigEntity.x - car.x + vp.w / 2;
        const screenY = trigEntity.y - car.y + vp.h / 2;

        if ((t.type === "highway" || t.type === "airport") && t.destination) {
          car.speed = 0;
          setActiveTrigger(null);
          startTransition(t.destination);
        } else if (t.type === "ferry") {
          if (ferryRef.current.cooldown <= 0 && t.destX !== undefined && t.destY !== undefined) {
            car.speed = 0;
            setActiveTrigger(null);
            startTeleportTransition(t.destX, t.destY);
          }
        } else {
          // Update React state for UI overlays (zone, airport, highway, jukebox)
          setActiveTrigger((prev) => {
            if (
              prev?.entityId === trigEntity.id &&
              Math.abs((prev.screenX ?? 0) - screenX) < 6 &&
              Math.abs((prev.screenY ?? 0) - screenY) < 6
            ) {
              return prev;
            }
            return {
              type: t.type,
              name: t.name,
              entityId: trigEntity.id,
              destination: t.destination,
              screenX,
              screenY,
            };
          });
        }
      } else {
        setActiveTrigger(null);
      }
    }

    // ── NPC updates ──────────────────────────────────────────────────
    for (const npc of npcsRef.current) {
      updateNpc(npc, dt, map.boundary, map.entities);
    }

    // ── Render ───────────────────────────────────────────────────────
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const vp = viewportRef.current!;

    renderFrame(ctx, map, car, npcsRef.current, vp, dpr, fade.alpha, peersRef?.current ?? []);
  });

  return { activeMapId, activeTrigger, startTransition, carRef };
}
