"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { CarState, MapData, NpcState, ActiveTrigger } from "@/app/lib/types";
import { checkSolids, isInBoundary, findTrigger } from "@/app/lib/collision";
import { initNpc, updateNpc } from "@/app/lib/npc";
import { renderFrame } from "@/app/lib/renderer";
import { getMap } from "@/app/lib/maps/registry";
import { useGameLoop } from "./useGameLoop";

// ── Physics constants ─────────────────────────────────────────────────────

const ACCEL = 320;
const REV_ACCEL = 200;
const TURN = 2.8;
const FRICTION = 0.96;
const MAX_SPD = 380;
const FADE_DUR = 0.55; // seconds per fade direction

// ── Hook ──────────────────────────────────────────────────────────────────

export function useEngine(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  viewportRef: React.RefObject<{ w: number; h: number }>,
  keys: React.RefObject<Set<string>>
) {
  // ── Active map state (React-level, triggers re-render for UI) ──────
  const [activeMapId, setActiveMapId] = useState("vt-island");
  const [activeTrigger, setActiveTrigger] = useState<ActiveTrigger | null>(null);

  // ── Refs for mutable game state (no re-renders) ────────────────────
  const mapRef = useRef<MapData>(getMap("vt-island"));
  const carRef = useRef<CarState>({
    x: mapRef.current.spawnX,
    y: mapRef.current.spawnY,
    speed: 0,
    rotation: mapRef.current.spawnRotation,
  });
  const npcsRef = useRef<NpcState[]>(mapRef.current.npcs.map(initNpc));

  // Fade transition
  const fadeRef = useRef({ alpha: 0, dir: 0 as -1 | 0 | 1, dest: "" });

  // ── Map transition ─────────────────────────────────────────────────
  const startTransition = useCallback((destId: string) => {
    if (fadeRef.current.dir !== 0) return; // already transitioning
    fadeRef.current = { alpha: 0, dir: 1, dest: destId };
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
    setActiveMapId(destId);
    setActiveTrigger(null);
  }, []);

  // ── Enter key listener (for zone interactions) ─────────────────────
  useEffect(() => {
    // We don't read activeTrigger from state inside the loop;
    // instead use a ref to avoid stale closure issues.
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
        swapMap(fade.dest);
        fade.dir = -1;
      } else if (fade.dir === -1 && fade.alpha <= 0) {
        fade.alpha = 0;
        fade.dir = 0;
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
      const nx = car.x + Math.cos(car.rotation) * car.speed * dt;
      const ny = car.y + Math.sin(car.rotation) * car.speed * dt;

      // Collision checks
      const proposed: CarState = { ...car, x: nx, y: ny };
      const hitSolid = checkSolids(proposed, map.entities);
      const outOfBounds = !isInBoundary(nx, ny, map.boundary);

      if (!hitSolid && !outOfBounds) {
        car.x = nx;
        car.y = ny;
      } else {
        car.speed *= -0.3;
      }

      // ── Trigger detection ──────────────────────────────────────────
      const trigEntity = findTrigger(car, map.entities);
      if (trigEntity?.trigger) {
        const t = trigEntity.trigger;

        // Highway auto-transition
        if (t.type === "highway" && t.destination) {
          startTransition(t.destination);
        }

        // Update React state for UI overlays (zone, airport, jukebox)
        setActiveTrigger((prev) => {
          if (prev?.entityId === trigEntity.id) return prev;
          return {
            type: t.type,
            name: t.name,
            entityId: trigEntity.id,
            destination: t.destination,
          };
        });
      } else {
        setActiveTrigger((prev) => (prev === null ? null : null));
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

    renderFrame(ctx, map, car, npcsRef.current, vp, dpr, fade.alpha);
  });

  return { activeMapId, activeTrigger, startTransition };
}
