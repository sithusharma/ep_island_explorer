// ---------------------------------------------------------------------------
// Data-driven canvas renderer — draws any MapData + car + NPCs + HUD
// ---------------------------------------------------------------------------

import type { Shape, Entity, MapData, CarState, NpcState } from "./types";

const CAR_L = 38;
const CAR_W = 22;
const MM_SIZE = 170;
const MM_MARGIN = 14;
const ENTITY_SAFETY_BUFFER_PX = 20;

const IMG_CACHE = new Map<string, HTMLImageElement>();
function getImage(src: string): HTMLImageElement {
  const cached = IMG_CACHE.get(src);
  if (cached) return cached;
  const img = new Image();
  img.src = src;
  IMG_CACHE.set(src, img);
  return img;
}

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
  if (s.shadow) {
    ctx.shadowColor = s.shadow.color;
    ctx.shadowBlur = s.shadow.blur;
  }

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
      ctx.lineWidth   = s.width ?? 1;
      // Always force round so road segments truly merge at every junction —
      // overriding per-shape values intentionally so the engine never
      // produces miter spikes or flat endcap blobs where roads intersect.
      ctx.lineCap  = "round";
      ctx.lineJoin = "round";
      if (s.dash) ctx.setLineDash(s.dash);
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
      ctx.stroke();
      if (s.dash)   ctx.setLineDash([]);
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

function buildBoundaryPath(ctx: CanvasRenderingContext2D, map: MapData, insetPx = 0) {
  ctx.beginPath();
  if (map.boundary.type === "ellipse") {
    const rx = Math.max(1, map.boundary.rx - insetPx);
    const ry = Math.max(1, map.boundary.ry - insetPx);
    ctx.ellipse(map.boundary.cx, map.boundary.cy, rx, ry, 0, 0, Math.PI * 2);
    return;
  }

  for (const ellipse of map.boundary.ellipses) {
    const rx = Math.max(1, ellipse.rx - insetPx);
    const ry = Math.max(1, ellipse.ry - insetPx);
    ctx.moveTo(ellipse.cx + rx, ellipse.cy);
    ctx.ellipse(ellipse.cx, ellipse.cy, rx, ry, 0, 0, Math.PI * 2);
  }
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

// ── NPC renderer — floating chibi cat face (no body) ─────────────────────
//
// Layout (all coords relative to npc centre after translate):
//
//            ╭──╮   ears   ╭──╮
//           ▕  ██████████████  ▏  ← head circle r=18
//            ▕   ◉       ◉   ▏   ← big eyes
//             ▕   ╰ ♥ ╯     ▏    ← nose + tuxedo snout
//              ╰────────────╯
//

function drawNpc(ctx: CanvasRenderingContext2D, npc: NpcState) {
  ctx.save();
  ctx.translate(npc.x, npc.y);

  // ── Ground shadow ──────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(0, 20, 15, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (npc.spriteSrc) {
    const img = getImage(npc.spriteSrc);
    if (img.complete && img.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, -24, -34, 48, 48);
      ctx.restore();
      return;
    }
  }

  // ── Ears — drawn first so head circle covers the bases ────────────────
  // Outer ears (same as bodyColor so they read as part of the head)
  ctx.fillStyle = npc.bodyColor;
  // Left outer
  ctx.beginPath(); ctx.moveTo(-21, -11); ctx.lineTo(-15, -30); ctx.lineTo(-5, -14); ctx.closePath(); ctx.fill();
  // Right outer
  ctx.beginPath(); ctx.moveTo(21, -11); ctx.lineTo(15, -30); ctx.lineTo(5, -14); ctx.closePath(); ctx.fill();
  // Inner ears (pink)
  ctx.fillStyle = "#ffb6c1";
  // Left inner
  ctx.beginPath(); ctx.moveTo(-18, -13); ctx.lineTo(-14, -25); ctx.lineTo(-7, -15); ctx.closePath(); ctx.fill();
  // Right inner
  ctx.beginPath(); ctx.moveTo(18, -13); ctx.lineTo(14, -25); ctx.lineTo(7, -15); ctx.closePath(); ctx.fill();

  // ── Head — big round dark circle ──────────────────────────────────────
  ctx.fillStyle = npc.bodyColor;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  // ── Tuxedo snout — white rounded muzzle area ──────────────────────────
  // Covers the lower face and gives the classic tuxedo look
  ctx.fillStyle = npc.accentColor;
  ctx.beginPath();
  ctx.ellipse(0, 9, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Eyes ──────────────────────────────────────────────────────────────
  // White sclera
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-7, -4, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( 7, -4, 6, 0, Math.PI * 2); ctx.fill();
  // Warm amber iris
  ctx.fillStyle = "#ffc400";
  ctx.beginPath(); ctx.arc(-7, -3.5, 4.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( 7, -3.5, 4.2, 0, Math.PI * 2); ctx.fill();
  // Black pupil (slightly tall — cat-style)
  ctx.fillStyle = "#111";
  ctx.beginPath(); ctx.ellipse(-7, -3.5, 2, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( 7, -3.5, 2, 3, 0, 0, Math.PI * 2); ctx.fill();
  // Main shine (upper-left of each eye)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-8.5, -6, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( 5.5, -6, 1.5, 0, Math.PI * 2); ctx.fill();
  // Secondary tiny shine
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath(); ctx.arc(-5.5, -2.5, 0.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(  8,  -2.5, 0.8, 0, Math.PI * 2); ctx.fill();

  // ── Nose — tiny pink heart-ish triangle ───────────────────────────────
  ctx.fillStyle = "#ff8fa3";
  ctx.beginPath();
  ctx.moveTo(-2, 4); ctx.lineTo(2, 4); ctx.lineTo(0, 6.5);
  ctx.closePath();
  ctx.fill();

  // ── Blush marks ───────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,140,140,0.28)";
  ctx.beginPath(); ctx.ellipse(-13,  1, 4.5, 2.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse( 13,  1, 4.5, 2.8, 0, 0, Math.PI * 2); ctx.fill();

  // ── Whiskers — emanate from the snout ─────────────────────────────────
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 0.9;
  ctx.lineCap = "round";
  ctx.beginPath();
  // Left side (3 whiskers)
  ctx.moveTo(-4, 7);  ctx.lineTo(-18,  4);
  ctx.moveTo(-4, 9);  ctx.lineTo(-18,  9);
  ctx.moveTo(-4, 11); ctx.lineTo(-17, 13);
  // Right side
  ctx.moveTo(4, 7);   ctx.lineTo(18,  4);
  ctx.moveTo(4, 9);   ctx.lineTo(18,  9);
  ctx.moveTo(4, 11);  ctx.lineTo(17, 13);
  ctx.stroke();

  // ── Name tag — above the ear tips ─────────────────────────────────────
  ctx.shadowColor = "rgba(0,0,0,0.70)";
  ctx.shadowBlur  = 3;
  ctx.fillStyle   = "#ffffff";
  ctx.font        = "bold 10px sans-serif";
  ctx.textAlign   = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(npc.name, 0, -32);
  ctx.shadowBlur = 0;

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

  // Island(s)
  ctx.fillStyle = "#4caf50";
  if (map.boundary.type === "ellipse") {
    ctx.beginPath();
    ctx.ellipse(mx + map.boundary.cx * scale, my + map.boundary.cy * scale, map.boundary.rx * scale, map.boundary.ry * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    for (const e of map.boundary.ellipses) {
      ctx.beginPath();
      ctx.ellipse(mx + e.cx * scale, my + e.cy * scale, e.rx * scale, e.ry * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

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

  // Draw all entities in strict layer order
  const layered = [...map.entities].sort((a, b) => a.layer - b.layer);

  for (const e of layered) {
    if (e.layer === 0) drawEntity(ctx, e);
  }

  // Clamp all gameplay entities, labels, and soft background treatments to an
  // inset version of the island boundary so nothing renders across the edge.
  ctx.save();
  buildBoundaryPath(ctx, map, ENTITY_SAFETY_BUFFER_PX);
  ctx.clip();
  for (const e of layered) {
    if (e.layer > 0) drawEntity(ctx, e);
  }

  // NPCs
  for (const npc of npcs) drawNpc(ctx, npc);

  // Car
  drawCar(ctx, car);
  ctx.restore();

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
