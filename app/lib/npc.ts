// ---------------------------------------------------------------------------
// NPC AI — simple wander-and-idle state machine
// ---------------------------------------------------------------------------

import type { NpcState, NpcDef, Entity, Boundary } from "./types";
import { isInBoundary } from "./collision";

export function initNpc(def: NpcDef): NpcState {
  return {
    id: def.id,
    name: def.name,
    x: def.spawnX,
    y: def.spawnY,
    targetX: def.spawnX,
    targetY: def.spawnY,
    speed: def.speed,
    wanderRadius: def.wanderRadius,
    spriteSrc: def.spriteSrc,
    spriteScale: def.spriteScale,
    bodyColor: def.bodyColor,
    accentColor: def.accentColor,
    state: "idle",
    idleTimer: 1 + Math.random() * 2,
    homeX: def.spawnX,
    homeY: def.spawnY,
  };
}

function pickTarget(npc: NpcState, boundary: Boundary) {
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = Math.random() * npc.wanderRadius;
    const tx = npc.homeX + Math.cos(a) * d;
    const ty = npc.homeY + Math.sin(a) * d;
    if (isInBoundary(tx, ty, boundary)) return { x: tx, y: ty };
  }
  return { x: npc.homeX, y: npc.homeY };
}

export function updateNpc(
  npc: NpcState,
  dt: number,
  boundary: Boundary,
  solids: Entity[]
): void {
  if (npc.speed <= 0 || npc.wanderRadius <= 0) {
    npc.x = npc.homeX;
    npc.y = npc.homeY;
    npc.targetX = npc.homeX;
    npc.targetY = npc.homeY;
    npc.state = "idle";
    return;
  }

  if (npc.state === "idle") {
    npc.idleTimer -= dt;
    if (npc.idleTimer <= 0) {
      const t = pickTarget(npc, boundary);
      npc.targetX = t.x;
      npc.targetY = t.y;
      npc.state = "walking";
    }
    return;
  }

  const dx = npc.targetX - npc.x;
  const dy = npc.targetY - npc.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 10) {
    npc.state = "idle";
    npc.idleTimer = 1.5 + Math.random() * 2.5;
    return;
  }

  const nx = npc.x + (dx / dist) * npc.speed * dt;
  const ny = npc.y + (dy / dist) * npc.speed * dt;

  if (!isInBoundary(nx, ny, boundary)) {
    npc.state = "idle";
    npc.idleTimer = 1;
    return;
  }

  for (const e of solids) {
    if (!e.solid || !e.hitbox) continue;
    const bx = e.x + e.hitbox.ox;
    const by = e.y + e.hitbox.oy;
    if (nx >= bx && nx <= bx + e.hitbox.w && ny >= by && ny <= by + e.hitbox.h) {
      npc.state = "idle";
      npc.idleTimer = 0.5;
      return;
    }
  }

  npc.x = nx;
  npc.y = ny;
}
