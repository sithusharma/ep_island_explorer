// ---------------------------------------------------------------------------
// Data-driven canvas renderer — draws any MapData + car + NPCs + HUD
// ---------------------------------------------------------------------------

import type { Shape, Entity, MapData, CarState, NpcState } from "./types";

const CAR_L = 38;
const CAR_W = 22;
const MM_SIZE = 170;
const MM_MARGIN = 14;

// ── Rounded-rect helper ───────────────────────────────────────────────────

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Shape renderer ────────────────────────────────────────────────────────

function drawShape(ctx: CanvasRenderingContext2D, s: Shape) {
  ctx.save();
  if (s.alpha !== undefined) ctx.globalAlpha = s.alpha;

  switch (s.type) {
    case "rect": {
      ctx.fillStyle = s.color ?? "#888";
      if (s.radius) {
        rrect(ctx, s.x ?? 0, s.y ?? 0, s.w ?? 0, s.h ?? 0, s.radius);
        ctx.fill();
      } else {
        ctx.fillRect(s.x ?? 0, s.y ?? 0, s.w ?? 0, s.h ?? 0);
      }
      if (s.stroke) {
        ctx.strokeStyle = s.stroke;
        ctx.lineWidth = s.lineWidth ?? 1;
        if (s.radius) ctx.stroke();
        else ctx.strokeRect(s.x ?? 0, s.y ?? 0, s.w ?? 0, s.h ?? 0);
      }
      break;
    }
    case "ellipse": {
      ctx.fillStyle = s.color ?? "#888";
      ctx.beginPath();
      ctx.ellipse(s.x ?? 0, s.y ?? 0, s.rx ?? 0, s.ry ?? 0, 0, 0, Math.PI * 2);
      ctx.fill();
      if (s.stroke) {
        ctx.strokeStyle = s.stroke;
        ctx.lineWidth = s.lineWidth ?? 1;
        ctx.stroke();
      }
      break;
    }
    case "circle": {
      ctx.fillStyle = s.color ?? "#888";
      ctx.beginPath();
      ctx.arc(s.x ?? 0, s.y ?? 0, s.r ?? 0, 0, Math.PI * 2);
      ctx.fill();
      if (s.stroke) {
        ctx.strokeStyle = s.stroke;
        ctx.lineWidth = s.lineWidth ?? 1;
        ctx.stroke();
      }
      break;
    }
    case "triangle": {
      ctx.fillStyle = s.color ?? "#888";
      ctx.beginPath();
      ctx.moveTo(s.x1 ?? 0, s.y1 ?? 0);
      ctx.lineTo(s.x2 ?? 0, s.y2 ?? 0);
      ctx.lineTo(s.x3 ?? 0, s.y3 ?? 0);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "line": {
      ctx.strokeStyle = s.color ?? "#888";
      ctx.lineWidth = s.width ?? 1;
      ctx.lineCap = s.cap ?? "round";
      if (s.dash) ctx.setLineDash(s.dash);
      ctx.beginPath();
      ctx.moveTo(s.x1 ?? 0, s.y1 ?? 0);
      ctx.lineTo(s.x2 ?? 0, s.y2 ?? 0);
      ctx.stroke();
      if (s.dash) ctx.setLineDash([]);
      break;
    }
    case "polyline": {
      const p = s.points;
      if (!p || p.length < 4) break;
      ctx.strokeStyle = s.color ?? "#888";
      ctx.lineWidth = s.width ?? 1;
      ctx.lineCap = s.cap ?? "round";
      ctx.lineJoin = s.join ?? "round";
      if (s.dash) ctx.setLineDash(s.dash);
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
      ctx.stroke();
      if (s.dash) ctx.setLineDash([]);
      break;
    }
    case "polygon": {
      const p = s.points;
      if (!p || p.length < 6) break;
      ctx.fillStyle = s.color ?? "#888";
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
      ctx.closePath();
      ctx.fill();
      if (s.stroke) {
        ctx.strokeStyle = s.stroke;
        ctx.lineWidth = s.lineWidth ?? 1;
        ctx.stroke();
      }
      break;
    }
    case "text": {
      if (s.shadow) {
        ctx.shadowColor = s.shadow.color;
        ctx.shadowBlur = s.shadow.blur;
      }
      ctx.fillStyle = s.color ?? "#fff";
      ctx.font = s.font ?? "12px sans-serif";
      ctx.textAlign = (s.align as CanvasTextAlign) ?? "center";
      ctx.textBaseline = (s.baseline as CanvasTextBaseline) ?? "middle";
      ctx.fillText(s.text ?? "", s.x ?? 0, s.y ?? 0);
      break;
    }
  }
  ctx.restore();
}

// ── Entity renderer ───────────────────────────────────────────────────────

function drawEntity(ctx: CanvasRenderingContext2D, e: Entity) {
  ctx.save();
  ctx.translate(e.x, e.y);
  for (const s of e.shapes) drawShape(ctx, s);
  if (e.label) {
    ctx.save();
    if (e.label.shadow) {
      ctx.shadowColor = e.label.shadow.color;
      ctx.shadowBlur = e.label.shadow.blur;
    }
    ctx.fillStyle = e.label.color;
    ctx.font = e.label.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(e.label.text, 0, e.label.offsetY);
    ctx.restore();
  }
  ctx.restore();
}

// ── Car renderer ──────────────────────────────────────────────────────────

function drawCar(ctx: CanvasRenderingContext2D, car: CarState) {
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.rotation);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(2, 3, CAR_L / 2 + 2, CAR_W / 2 + 1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = "#e53935";
  rrect(ctx, -CAR_L / 2, -CAR_W / 2, CAR_L, CAR_W, 5);
  ctx.fill();

  // Windshield
  ctx.fillStyle = "#90caf9";
  ctx.fillRect(CAR_L / 2 - 11, -CAR_W / 2 + 3, 9, CAR_W - 6);

  // Rear
  ctx.fillStyle = "#b71c1c";
  ctx.fillRect(-CAR_L / 2, -CAR_W / 2 + 2, 6, CAR_W - 4);

  // Headlights
  ctx.fillStyle = "#fff9c4";
  ctx.fillRect(CAR_L / 2 - 3, -CAR_W / 2 + 2, 3, 5);
  ctx.fillRect(CAR_L / 2 - 3, CAR_W / 2 - 7, 3, 5);

  ctx.restore();
}

// ── NPC renderer ──────────────────────────────────────────────────────────

function drawNpc(ctx: CanvasRenderingContext2D, npc: NpcState) {
  ctx.save();
  ctx.translate(npc.x, npc.y);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(1, 8, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = npc.bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Chest
  ctx.fillStyle = npc.accentColor;
  ctx.beginPath();
  ctx.ellipse(2, 3, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = npc.bodyColor;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(dir * 7, -6);
    ctx.lineTo(dir * 10, -14);
    ctx.lineTo(dir * 3, -8);
    ctx.closePath();
    ctx.fill();
  }
  // Inner ears
  ctx.fillStyle = "#ffb6c1";
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(dir * 6, -7);
    ctx.lineTo(dir * 8, -12);
    ctx.lineTo(dir * 4, -8);
    ctx.closePath();
    ctx.fill();
  }

  // Eyes
  ctx.fillStyle = "#ffd600";
  ctx.beginPath(); ctx.arc(-4, -2, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4, -2, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#000";
  ctx.beginPath(); ctx.arc(-4, -2, 1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(4, -2, 1, 0, Math.PI * 2); ctx.fill();

  // Tail
  ctx.strokeStyle = npc.bodyColor;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-8, 4);
  ctx.quadraticCurveTo(-18, -2, -14, -10);
  ctx.stroke();

  // Name
  ctx.fillStyle = "#fff";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 2;
  ctx.fillText(npc.name, 0, -20);

  ctx.restore();
}

// ── Minimap ───────────────────────────────────────────────────────────────

function drawMinimap(ctx: CanvasRenderingContext2D, map: MapData, car: CarState, npcs: NpcState[], vw: number) {
  const mx = vw - MM_SIZE - MM_MARGIN;
  const my = MM_MARGIN;
  const scale = MM_SIZE / Math.max(map.worldWidth, map.worldHeight);

  ctx.save();
  ctx.globalAlpha = 0.88;

  ctx.fillStyle = map.bgColor;
  rrect(ctx, mx, my, MM_SIZE, MM_SIZE, 8);
  ctx.fill();

  ctx.save();
  rrect(ctx, mx, my, MM_SIZE, MM_SIZE, 8);
  ctx.clip();

  // Island
  ctx.fillStyle = "#4caf50";
  ctx.beginPath();
  ctx.ellipse(mx + map.boundary.cx * scale, my + map.boundary.cy * scale, map.boundary.rx * scale, map.boundary.ry * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Roads (layer 2 polylines, no dashes)
  ctx.strokeStyle = "#78909c";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  for (const e of map.entities) {
    if (e.layer !== 2) continue;
    for (const s of e.shapes) {
      if (s.type === "polyline" && !s.dash && s.points) {
        const p = s.points;
        ctx.beginPath();
        ctx.moveTo(mx + (e.x + p[0]) * scale, my + (e.y + p[1]) * scale);
        for (let i = 2; i < p.length; i += 2) ctx.lineTo(mx + (e.x + p[i]) * scale, my + (e.y + p[i + 1]) * scale);
        ctx.stroke();
      }
    }
  }

  // Landmark dots
  ctx.font = "bold 6px sans-serif";
  ctx.textAlign = "center";
  for (const e of map.entities) {
    if (e.layer < 3 || !e.trigger) continue;
    ctx.fillStyle = e.trigger.type === "airport" ? "#ff9800" : e.trigger.type === "jukebox" ? "#e040fb" : e.trigger.type === "highway" ? "#42a5f5" : "#fff";
    ctx.beginPath();
    ctx.arc(mx + e.x * scale, my + e.y * scale, 3, 0, Math.PI * 2);
    ctx.fill();
    if (e.label) {
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fillText(e.label.text, mx + e.x * scale, my + e.y * scale - 6);
    }
  }

  // NPCs
  for (const npc of npcs) {
    ctx.fillStyle = npc.bodyColor;
    ctx.beginPath();
    ctx.arc(mx + npc.x * scale, my + npc.y * scale, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Car
  ctx.fillStyle = "#e53935";
  ctx.beginPath();
  ctx.arc(mx + car.x * scale, my + car.y * scale, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore(); // clip

  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  rrect(ctx, mx, my, MM_SIZE, MM_SIZE, 8);
  ctx.stroke();

  ctx.restore(); // alpha
}

// ── Speedometer ───────────────────────────────────────────────────────────

function drawSpeed(ctx: CanvasRenderingContext2D, car: CarState, vw: number, vh: number) {
  const spd = Math.abs(car.speed);
  const pct = Math.min(1, spd / 380);
  const bW = 100, bH = 6;
  const bx = vw - bW - 20;
  const by = vh - 30;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  rrect(ctx, bx - 6, by - 18, bW + 12, 30, 6);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.15)";
  rrect(ctx, bx, by, bW, bH, 3);
  ctx.fill();

  if (pct > 0) {
    ctx.fillStyle = pct > 0.8 ? "#ef5350" : pct > 0.5 ? "#ffb74d" : "#66bb6a";
    rrect(ctx, bx, by, bW * pct, bH, 3);
    ctx.fill();
  }

  ctx.fillStyle = "#ccc";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`${Math.round(spd)} px/s`, bx, by - 5);
  ctx.restore();
}

// ── Main entry point ──────────────────────────────────────────────────────

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  map: MapData,
  car: CarState,
  npcs: NpcState[],
  viewport: { w: number; h: number },
  dpr: number,
  fadeAlpha: number
) {
  const { w: vw, h: vh } = viewport;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, vw * dpr, vh * dpr);
  ctx.scale(dpr, dpr);

  // Camera centred on car
  ctx.translate(-(car.x - vw / 2), -(car.y - vh / 2));

  // Draw all entities sorted by layer
  for (const e of map.entities) drawEntity(ctx, e);

  // NPCs
  for (const npc of npcs) drawNpc(ctx, npc);

  // Car
  drawCar(ctx, car);

  // HUD (screen-space)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  drawMinimap(ctx, map, car, npcs, vw);
  drawSpeed(ctx, car, vw, vh);

  // Map name badge
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  rrect(ctx, 14, 14, ctx.measureText(map.name).width + 28, 28, 6);
  ctx.font = "bold 13px sans-serif";
  const tw = ctx.measureText(map.name).width;
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  rrect(ctx, 14, 14, tw + 28, 28, 6);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(map.name, 28, 28);
  ctx.restore();

  // Fade overlay for transitions
  if (fadeAlpha > 0) {
    ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
    ctx.fillRect(0, 0, vw, vh);
  }
}
