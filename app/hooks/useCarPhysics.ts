"use client";

import { useEffect, useRef, useCallback } from "react";
import { isOnIsland, ISLAND_CX, ISLAND_CY } from "@/app/lib/map";

// ── Tuning constants ───────────────────────────────────────────────────────

const ACCELERATION = 320; // px / s²
const REVERSE_ACCELERATION = 200;
const TURN_SPEED = 2.8; // rad / s
const FRICTION = 0.96; // multiplied per frame (< 1 = deceleration)
const MAX_SPEED = 380;

// ── Types ──────────────────────────────────────────────────────────────────

export interface CarState {
  x: number;
  y: number;
  rotation: number; // radians – 0 = pointing right
  speed: number;
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useCarPhysics() {
  const car = useRef<CarState>({
    x: ISLAND_CX,
    y: ISLAND_CY + 40, // spawn at Blacksburg centre
    rotation: -Math.PI / 2, // facing up
    speed: 0,
  });

  const keys = useRef<Set<string>>(new Set());

  // --- keyboard listeners ---------------------------------------------------

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keys.current.add(e.key.toLowerCase());
    };
    const onUp = (e: KeyboardEvent) => {
      keys.current.delete(e.key.toLowerCase());
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // --- per-frame update -----------------------------------------------------

  const update = useCallback((dt: number) => {
    const c = car.current;
    const k = keys.current;

    // Turning (only while the car has some speed)
    const canTurn = Math.abs(c.speed) > 5;
    const turnDir = canTurn ? (c.speed < 0 ? -1 : 1) : 0;

    if (k.has("a") || k.has("arrowleft")) {
      c.rotation -= TURN_SPEED * dt * turnDir;
    }
    if (k.has("d") || k.has("arrowright")) {
      c.rotation += TURN_SPEED * dt * turnDir;
    }

    // Acceleration
    if (k.has("w") || k.has("arrowup")) {
      c.speed += ACCELERATION * dt;
    }
    if (k.has("s") || k.has("arrowdown")) {
      c.speed -= REVERSE_ACCELERATION * dt;
    }

    // Friction
    c.speed *= FRICTION;

    // Clamp speed
    if (c.speed > MAX_SPEED) c.speed = MAX_SPEED;
    if (c.speed < -MAX_SPEED * 0.5) c.speed = -MAX_SPEED * 0.5;

    // Stop jitter near zero
    if (Math.abs(c.speed) < 0.5) c.speed = 0;

    // Proposed new position
    const nx = c.x + Math.cos(c.rotation) * c.speed * dt;
    const ny = c.y + Math.sin(c.rotation) * c.speed * dt;

    // Boundary: only move if still on the island
    if (isOnIsland(nx, ny)) {
      c.x = nx;
      c.y = ny;
    } else {
      // Bounce back slightly
      c.speed *= -0.3;
    }
  }, []);

  return { car, keys, update };
}
