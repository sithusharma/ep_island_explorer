// ---------------------------------------------------------------------------
// UVA Island — compact Jeffersonian campus with Rotunda, Lawn & Pavilions
// ---------------------------------------------------------------------------

import type { Entity, MapData, Shape } from "../types";

const W  = 1800;
const CX = W / 2;   // 900
const CY = W / 2;   // 900

// UVA palette
const BRICK   = "#9c4a2c";   // Warm Jeffersonian brick
const BRICK_D = "#7a3820";   // Darker brick (roofs, shadows)
const UVA_NAVY  = "#232d4b"; // Cavalier navy
const UVA_ORANGE = "#e57200"; // UVA orange accent

// ── Utilities ─────────────────────────────────────────────────────────────

function dk(hex: string, n = 28): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - n);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - n);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - n);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Road */
function road(id: string, pts: number[]): Entity {
  return {
    id, x: 0, y: 0, layer: 2,
    shapes: [
      { type: "polyline", points: pts, color: "rgba(0,0,0,0.14)", width: 46, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#5d4e37",           width: 40, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#ffca28",           width: 2,  dash: [12, 9], cap: "butt", join: "round" },
    ],
  };
}

/** Academical Village Pavilion — small brick building with white columns */
function pavilion(id: string, x: number, y: number, facing: "left" | "right"): Entity {
  const colX = facing === "right" ? -18 : 4;
  const shapes: Shape[] = [
    { type: "rect", x: -(20) + 3, y: -(23) + 3, w: 40, h: 48, color: "rgba(0,0,0,0.22)", radius: 2 },
    { type: "rect", x: -20,       y: -23,        w: 40, h: 48, color: BRICK, radius: 2 },
    { type: "rect", x: -22,       y: -27,        w: 44, h: 7,  color: BRICK_D, radius: 1 },
    // White columns
    { type: "rect", x: colX,      y: -23, w: 5, h: 48, color: "#fff9f0", radius: 1 },
    { type: "rect", x: colX + 14, y: -23, w: 5, h: 48, color: "#fff9f0", radius: 1 },
    // Windows
    { type: "rect", x: colX - 8,  y: -15, w: 8, h: 10, color: "rgba(180,220,255,0.38)", radius: 1 },
    { type: "rect", x: colX + 20, y: -15, w: 8, h: 10, color: "rgba(180,220,255,0.38)", radius: 1 },
  ];
  return {
    id, x, y, layer: 3, shapes,
    solid: true,
    hitbox:  { ox: -24, oy: -29, w: 48, h: 62 },
    trigger: { type: "zone", name: "Academical Village", hitbox: { ox: -42, oy: -42, w: 84, h: 84 } },
  };
}

// ── Base terrain ──────────────────────────────────────────────────────────

const ocean: Entity = {
  id: "ocean", x: 0, y: 0, layer: 0,
  shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0e4a7a" }],
};

const island: Entity = {
  id: "island", x: 0, y: 0, layer: 0,
  shapes: [
    { type: "ellipse", x: CX, y: CY, rx: 692, ry: 652, color: "#d9c49a" },   // Sandy shore
    { type: "ellipse", x: CX, y: CY, rx: 680, ry: 640, color: "#5a8c5e" },   // Campus green
    { type: "ellipse", x: CX, y: CY, rx: 420, ry: 395, color: "#4e8052", alpha: 0.35 }, // Inner quad tint
  ],
};

// ── Roads ─────────────────────────────────────────────────────────────────

const roads: Entity[] = [
  road("main-ns",  [CX, 290, CX, 1510]),     // University Avenue (N–S)
  road("main-ew",  [320, CY, 1480, CY]),     // Rugby Road (E–W)
  road("lawn-w",   [855, 520, 855, 900]),    // West Range path
  road("lawn-e",   [945, 520, 945, 900]),    // East Range path
];

// ── The Rotunda ───────────────────────────────────────────────────────────
// Iconic domed centrepiece of UVA's Academic Village — Jefferson's masterwork

const rotundaShapes: Shape[] = [
  // Drop shadow
  { type: "ellipse", x: 5, y: 6, rx: 56, ry: 46, color: "rgba(0,0,0,0.22)" },
  // Main colonnaded body
  { type: "rect", x: -52, y: -14, w: 104, h: 58, color: "#f5f0e8", radius: 2 },
  // Orange accent band (UVA colour) below roof line
  { type: "rect", x: -52, y: -16, w: 104, h: 5, color: UVA_ORANGE },
  // Four white pilasters/columns
  { type: "rect", x: -38, y: -14, w: 7, h: 58, color: "#fffbf5", radius: 1 },
  { type: "rect", x: -16, y: -14, w: 7, h: 58, color: "#fffbf5", radius: 1 },
  { type: "rect", x:   9, y: -14, w: 7, h: 58, color: "#fffbf5", radius: 1 },
  { type: "rect", x:  31, y: -14, w: 7, h: 58, color: "#fffbf5", radius: 1 },
  // Portico steps
  { type: "rect", x: -40, y: 42, w: 80, h: 10, color: "#e8ddd0", radius: 1 },
  // Lower dome
  { type: "ellipse", x: 0, y: -28, rx: 48, ry: 36, color: "#f5f0e8" },
  // Upper dome
  { type: "ellipse", x: 0, y: -40, rx: 36, ry: 26, color: "#ede7d4" },
  // Drum ring
  { type: "ellipse", x: 0, y: -40, rx: 36, ry: 8, color: UVA_NAVY, alpha: 0.35 },
  // Lantern top
  { type: "circle", x: 0, y: -62, r: 7, color: "#f5f0e8" },
  // Lantern cap
  { type: "circle", x: 0, y: -62, r: 4, color: UVA_ORANGE },
];

const rotunda: Entity = {
  id: "rotunda", x: CX, y: 508, layer: 3,
  shapes: rotundaShapes,
  label: { text: "The Rotunda", color: "#fff", font: "bold 14px sans-serif", offsetY: 64, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
  solid: true,
  hitbox:  { ox: -56, oy: -70, w: 112, h: 126 },
  trigger: { type: "zone", name: "The Rotunda", hitbox: { ox: -75, oy: -85, w: 150, h: 160 } },
};

// ── The Lawn ──────────────────────────────────────────────────────────────
// The long rectangular green that runs south from the Rotunda

const theLawn: Entity = {
  id: "the-lawn", x: CX, y: 722, layer: 1,
  shapes: [
    // Lawn turf
    { type: "rect", x: -78, y: -152, w: 156, h: 305, color: "#3a7d44", radius: 2 },
    // Central gravel path
    { type: "rect", x: -6, y: -152, w: 12, h: 305, color: "rgba(210,195,170,0.45)" },
    // Diagonal garden paths
    { type: "line", x1: -78, y1: -152, x2:  0, y2: 0, color: "rgba(210,195,170,0.22)", width: 2 },
    { type: "line", x1:  78, y1: -152, x2:  0, y2: 0, color: "rgba(210,195,170,0.22)", width: 2 },
  ],
  label: { text: "The Lawn", color: "#a5d6a7", font: "bold 13px sans-serif", offsetY: 163, shadow: { color: "rgba(0,0,0,0.7)", blur: 3 } },
};

// ── Academical Village Pavilions ──────────────────────────────────────────
// Three on each side of The Lawn, facing inward

const pavilions: Entity[] = [
  // West side (facing right/east toward Lawn)
  pavilion("pav-w1", 808, 618, "right"),
  pavilion("pav-w2", 808, 718, "right"),
  pavilion("pav-w3", 808, 818, "right"),
  // East side (facing left/west toward Lawn)
  pavilion("pav-e1", 992, 618, "left"),
  pavilion("pav-e2", 992, 718, "left"),
  pavilion("pav-e3", 992, 818, "left"),
];

// ── Alderman Library ──────────────────────────────────────────────────────

const aldermanLibrary: Entity = {
  id: "alderman-lib", x: 718, y: 1012, layer: 3,
  shapes: [
    { type: "rect", x: -53, y: -35, w: 106, h: 70, color: "rgba(0,0,0,0.20)", radius: 3 },
    { type: "rect", x: -50, y: -38, w: 100, h: 70, color: BRICK, radius: 3 },
    { type: "rect", x: -52, y: -44, w: 104, h: 9,  color: BRICK_D, radius: 2 },
    // White entry columns
    { type: "rect", x: -34, y: -38, w: 6, h: 70, color: "#fff9f0", radius: 1 },
    { type: "rect", x: -14, y: -38, w: 6, h: 70, color: "#fff9f0", radius: 1 },
    { type: "rect", x:   6, y: -38, w: 6, h: 70, color: "#fff9f0", radius: 1 },
    { type: "rect", x:  26, y: -38, w: 6, h: 70, color: "#fff9f0", radius: 1 },
    // Windows
    { type: "rect", x: -40, y: -26, w: 10, h: 14, color: "rgba(180,220,255,0.35)", radius: 1 },
    { type: "rect", x:  -4, y: -26, w: 10, h: 14, color: "rgba(180,220,255,0.35)", radius: 1 },
    { type: "rect", x:  32, y: -26, w: 10, h: 14, color: "rgba(180,220,255,0.35)", radius: 1 },
  ],
  label: { text: "Alderman Library", color: "#fff", font: "bold 12px sans-serif", offsetY: 50, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
  solid: true,
  hitbox:  { ox: -54, oy: -46, w: 108, h: 84 },
  trigger: { type: "zone", name: "Alderman Library", hitbox: { ox: -70, oy: -60, w: 140, h: 108 } },
};

// ── John Paul Jones Arena ──────────────────────────────────────────────────

const jpjArena: Entity = {
  id: "jpj-arena", x: 1082, y: 1028, layer: 3,
  shapes: [
    { type: "ellipse", x: 4, y: 5, rx: 68, ry: 52, color: "rgba(0,0,0,0.22)" },
    { type: "ellipse", x: 0, y: 0, rx: 68, ry: 52, color: UVA_NAVY },
    { type: "ellipse", x: 0, y: 0, rx: 52, ry: 40, color: "#2e3f6e" },
    { type: "ellipse", x: 0, y: 0, rx: 36, ry: 28, color: "#1a2a52" },
    { type: "text", x: 0, y: 0, text: "JPJ", color: UVA_ORANGE,
      font: "bold 11px sans-serif",
      align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
  ],
  label: { text: "JPJ Arena", color: "#fff", font: "bold 12px sans-serif", offsetY: 62, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
  solid: true,
  hitbox:  { ox: -70, oy: -54, w: 140, h: 108 },
  trigger: { type: "zone", name: "JPJ Arena", hitbox: { ox: -88, oy: -68, w: 176, h: 136 } },
};

// ── Return trigger ─────────────────────────────────────────────────────────

const returnTrigger: Entity = {
  id: "return", x: CX, y: CY + 462, layer: 5,
  shapes: [
    { type: "rect", x: -70, y: -18, w: 140, h: 36, color: "rgba(33,150,243,0.88)", radius: 8 },
    { type: "text", x: 0, y: 0, text: "← Back to VT", color: "#fff",
      font: "bold 12px sans-serif",
      align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
  ],
  trigger: { type: "highway", name: "Return to VT", destination: "vt-island", hitbox: { ox: -90, oy: -45, w: 180, h: 90 } },
};

// ── Map export ────────────────────────────────────────────────────────────

export const uvaMap: MapData = {
  id: "uva", name: "UVA",
  worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY + 180,
  spawnRotation: -Math.PI / 2,
  bgColor: "#0e4a7a",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 680, ry: 640 },
  entities: [
    ocean, island,
    ...roads,
    theLawn,
    rotunda,
    ...pavilions,
    aldermanLibrary,
    jpjArena,
    returnTrigger,
  ],
  items: [], npcs: [],
};
