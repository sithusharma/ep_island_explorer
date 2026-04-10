// ---------------------------------------------------------------------------
// AABB collision detection, boundary checks, and trigger detection
// ---------------------------------------------------------------------------

import type { CarState, Entity, Boundary } from "./types";

const CAR_HALF_L = 19;
const CAR_HALF_W = 11;

// ── Car corners (rotated AABB) ────────────────────────────────────────────

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

// ── Solid collision ───────────────────────────────────────────────────────

export function checkSolids(car: CarState, entities: Entity[]): boolean {
  for (const e of entities) {
    if (!e.solid || !e.hitbox) continue;
    const bx = e.x + e.hitbox.ox;
    const by = e.y + e.hitbox.oy;
    const bw = e.hitbox.w;
    const bh = e.hitbox.h;

    // Centre point
    if (ptInRect(car.x, car.y, bx, by, bw, bh)) return true;

    // All 4 corners
    for (const c of getCarCorners(car)) {
      if (ptInRect(c.x, c.y, bx, by, bw, bh)) return true;
    }
  }
  return false;
}

// ── Boundary ──────────────────────────────────────────────────────────────

export function isInBoundary(x: number, y: number, b: Boundary): boolean {
  const dx = (x - b.cx) / b.rx;
  const dy = (y - b.cy) / b.ry;
  return dx * dx + dy * dy <= 1;
}

// ── Trigger detection ─────────────────────────────────────────────────────

export function findTrigger(car: CarState, entities: Entity[]): Entity | null {
  for (const e of entities) {
    if (!e.trigger) continue;
    const hb = e.trigger.hitbox;
    const bx = e.x + hb.ox;
    const by = e.y + hb.oy;
    if (ptInRect(car.x, car.y, bx, by, hb.w, hb.h)) return e;
  }
  return null;
}
