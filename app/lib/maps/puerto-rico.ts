// ---------------------------------------------------------------------------
// Puerto Rico — Main island + Culebra + Vieques
// Ferry mechanic connects the three islands via intra-map teleport.
//
// World: 6200 × 6200
// Main island : centre (2200, 2800)
// Vieques     : centre (4700, 3250)
// Culebra     : centre (4550, 1900)
// ---------------------------------------------------------------------------

import type { Entity, MapData, Shape } from "../types";

const W = 6200;

// ── Island centres ─────────────────────────────────────────────────────────
const MX = 2200, MY = 2800;    // Main island
const VX = 4700, VY = 3250;    // Vieques
const CUX = 4550, CUY = 1900;  // Culebra

const MAIN_DX = 300;
const MAIN_DY = 400;
const V_DX = 1420;
const V_DY = 550;
const C_DX = 1530;
const C_DY = -60;

// ── Utilities ─────────────────────────────────────────────────────────────

function darker(hex: string, n = 30): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - n);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - n);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - n);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Single palm tree — 3-shape sprite */
function tree(x: number, y: number, r: number): Shape[] {
  return [
    { type: "circle", x, y: y + 2, r: r + 2, color: "rgba(0,0,0,0.18)" },
    { type: "circle", x, y, r, color: "#2e7d32" },
    { type: "circle", x: x - r / 4, y: y - r / 4, r: r / 1.6, color: "#4caf50" },
  ];
}

/** Road polyline */
function road(id: string, pts: number[]): Entity {
  return {
    id, x: 0, y: 0, layer: 2,
    shapes: [
      { type: "polyline", points: pts, color: "rgba(0,0,0,0.12)", width: 44, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#5d4e37",           width: 38, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#ffca28",           width: 2,  dash: [14, 10], cap: "butt", join: "round" },
    ],
  };
}

/** Ferry dock — sign + pier planks + ferry trigger */
function ferryDock(
  id: string, x: number, y: number,
  destIsland: string, destX: number, destY: number,
): Entity {
  return {
    id, x, y, layer: 4,
    shapes: [
      { type: "rect", x: -27, y: -5,  w: 54, h: 20, color: "rgba(0,0,0,0.22)", radius: 3 },
      { type: "rect", x: -25, y: -8,  w: 50, h: 18, color: "#8d6e63", radius: 3 },
      { type: "line", x1: -25, y1: -3, x2: 25, y2: -3, color: "rgba(0,0,0,0.18)", width: 1 },
      { type: "line", x1: -25, y1:  2, x2: 25, y2:  2, color: "rgba(0,0,0,0.18)", width: 1 },
      { type: "line", x1: -25, y1:  7, x2: 25, y2:  7, color: "rgba(0,0,0,0.18)", width: 1 },
      { type: "circle", x: -21, y: -8, r: 4, color: "#5d4037" },
      { type: "circle", x:  21, y: -8, r: 4, color: "#5d4037" },
      { type: "rect", x: -44, y: -34, w: 88, h: 22, color: "rgba(0,140,190,0.92)", radius: 5 },
      { type: "text", x: 0, y: -23, text: `⛴  To ${destIsland}`, color: "#fff",
        font: "bold 10px sans-serif",
        align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    label: { text: `Ferry → ${destIsland}`, color: "#7ee8fa", font: "bold 11px sans-serif", offsetY: 28, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
    trigger: { type: "ferry", name: `Ferry to ${destIsland}`, destX, destY, hitbox: { ox: -55, oy: -55, w: 110, h: 90 } },
  };
}

/** Golf cart — top-down view, decorative solid obstacle */
function golfCart(id: string, x: number, y: number, color: string): Entity {
  return {
    id, x, y, layer: 3,
    shapes: [
      { type: "rect", x: -8,  y:  1,  w: 16, h: 22, color: "rgba(0,0,0,0.25)", radius: 2 },
      { type: "rect", x: -7,  y: -2,  w: 14, h: 20, color, radius: 2 },
      { type: "rect", x: -5,  y: -2,  w: 10, h:  8, color: "rgba(200,230,255,0.55)", radius: 1 },
      { type: "rect", x: -10, y: -2,  w:  4, h:  6, color: "#212121", radius: 1 },
      { type: "rect", x:   6, y: -2,  w:  4, h:  6, color: "#212121", radius: 1 },
      { type: "rect", x: -10, y: 12,  w:  4, h:  6, color: "#212121", radius: 1 },
      { type: "rect", x:   6, y: 12,  w:  4, h:  6, color: "#212121", radius: 1 },
    ],
    solid: true,
    hitbox: { ox: -10, oy: -2, w: 20, h: 22 },
  };
}

/** Jeep — top-down view, larger decorative solid obstacle */
function jeep(id: string, x: number, y: number, color: string): Entity {
  return {
    id, x, y, layer: 3,
    shapes: [
      { type: "rect", x: -10, y:  1,  w: 20, h: 30, color: "rgba(0,0,0,0.25)", radius: 2 },
      { type: "rect", x:  -9, y: -3,  w: 18, h: 28, color, radius: 2 },
      { type: "rect", x:  -6, y: -3,  w: 12, h:  9, color: "rgba(180,220,255,0.45)", radius: 1 },
      { type: "rect", x:  -8, y: -8,  w: 16, h:  6, color: darker(color, 20) },
      { type: "rect", x:  -4, y: -9,  w:  8, h:  3, color: darker(color, 40) },
      { type: "rect", x: -13, y:  0,  w:  5, h:  8, color: "#212121", radius: 1 },
      { type: "rect", x:   8, y:  0,  w:  5, h:  8, color: "#212121", radius: 1 },
      { type: "rect", x: -13, y: 16,  w:  5, h:  8, color: "#212121", radius: 1 },
      { type: "rect", x:   8, y: 16,  w:  5, h:  8, color: "#212121", radius: 1 },
    ],
    solid: true,
    hitbox: { ox: -13, oy: -9, w: 26, h: 36 },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// BASE TERRAIN
// ═══════════════════════════════════════════════════════════════════════════

const ocean: Entity = {
  id: "ocean", x: 0, y: 0, layer: 0,
  shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0b7dab" }],
};

const shallows: Entity = {
  id: "shallows", x: 0, y: 0, layer: 0,
  shapes: [
    { type: "ellipse", x: MX,  y: MY,  rx: 1320,  ry: 840,  color: "#1a9fc0", alpha: 0.45 },
    { type: "ellipse", x: VX,  y: VY,  rx: 760,   ry: 430,  color: "#1a9fc0", alpha: 0.45 },
    { type: "ellipse", x: CUX, y: CUY, rx: 590,   ry: 360,  color: "#1a9fc0", alpha: 0.45 },
  ],
};

const terrain: Entity = {
  id: "terrain", x: 0, y: 0, layer: 0,
  shapes: [
    // ── Main island ─────────────────────────────────────────────────────
    { type: "ellipse", x: MX,  y: MY,  rx: 1220, ry: 760, color: "#e8d5a3" },
    { type: "ellipse", x: MX,  y: MY,  rx: 1190, ry: 730, color: "#4caf50" },
    { type: "ellipse", x: MX - 120, y: MY - 70, rx: 760, ry: 380, color: "#2e7d32" },
    { type: "ellipse", x: MX + 420, y: MY + 110, rx: 500, ry: 300, color: "#43a047" },
    { type: "ellipse", x: MX - 560, y: MY + 60, rx: 400, ry: 250, color: "#66bb6a" },
    // ── Vieques ─────────────────────────────────────────────────────────
    { type: "ellipse", x: VX,      y: VY,      rx: 700, ry: 380, color: "#e8d5a3" },
    { type: "ellipse", x: VX,      y: VY,      rx: 610, ry: 320, color: "#4caf50" },
    { type: "ellipse", x: VX + 100, y: VY - 10, rx: 360, ry: 178, color: "#2e7d32" },
    // ── Culebra ─────────────────────────────────────────────────────────
    { type: "ellipse", x: CUX, y: CUY, rx: 540, ry: 330, color: "#e8d5a3" },
    { type: "ellipse", x: CUX, y: CUY, rx: 430, ry: 255, color: "#4caf50" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SPARSE TREES (hardcoded — deterministic and minimal)
// ═══════════════════════════════════════════════════════════════════════════

const treeShapes: Shape[] = [
  // Main island — spread to the perimeter so landmarks stay clear
  ...tree(1600 + MAIN_DX, 2040 + MAIN_DY, 16),
  ...tree(2040 + MAIN_DX, 2020 + MAIN_DY, 17),
  ...tree(1200 + MAIN_DX, 2800 + MAIN_DY, 12),
  ...tree(2580 + MAIN_DX, 2740 + MAIN_DY, 12),
  ...tree(1420 + MAIN_DX, 3320 + MAIN_DY, 12),
  ...tree(1840 + MAIN_DX, 3460 + MAIN_DY, 14),
  ...tree(2360 + MAIN_DX, 3360 + MAIN_DY, 13),
  // Vieques — fewer and farther apart
  ...tree(3360 + V_DX, 2600 + V_DY, 14),
  ...tree(3510 + V_DX, 2860 + V_DY, 11),
  // Culebra — perimeter trees only
  ...tree(3200 + C_DX, 1940 + C_DY, 12),
  ...tree(3010 + C_DX, 2120 + C_DY, 9),
];

const trees: Entity = { id: "trees", x: 0, y: 0, layer: 4, shapes: treeShapes, solid: false };

// ═══════════════════════════════════════════════════════════════════════════
// ROADS — main island
// ═══════════════════════════════════════════════════════════════════════════

const roads: Entity[] = [
  // Main E–W highway
  road("rd-ew",         [980 + MAIN_DX, 2400 + MAIN_DY, 3140 + MAIN_DX, 2400 + MAIN_DY]),
  // Old San Juan spur north (to OSJ at y=2290)
  road("rd-sj",         [1300 + MAIN_DX, 2400 + MAIN_DY, 1300 + MAIN_DX, 2270 + MAIN_DY]),
  // Nightlife spur south (to nightlife district at y=2460)
  road("rd-nightlife",  [1480 + MAIN_DX, 2400 + MAIN_DY, 1480 + MAIN_DX, 2460 + MAIN_DY]),
  // Airbnb spur south
  road("rd-airbnb",     [1700 + MAIN_DX, 2400 + MAIN_DY, 1700 + MAIN_DX, 2505 + MAIN_DY]),
  // Mountain road — Zipline & Mountain
  road("rd-forest-z",   [1700 + MAIN_DX, 2400 + MAIN_DY, 1730 + MAIN_DX, 2280 + MAIN_DY, 1820 + MAIN_DX, 2200 + MAIN_DY]),
  // Airport spur south-east
  road("rd-airport",    [2500 + MAIN_DX, 2400 + MAIN_DY, 2420 + MAIN_DX, 2550 + MAIN_DY]),
  // Culebra ferry spur north-east (dock now at 2860, 2340)
  road("rd-culebra",    [2200 + MAIN_DX, 2400 + MAIN_DY, 2360 + MAIN_DX, 2100 + MAIN_DY, 2560 + MAIN_DX, 1940 + MAIN_DY]),
  // Vieques ferry spur east end (dock now at 3150, 2880)
  road("rd-vieques",    [2850 + MAIN_DX, 2400 + MAIN_DY, 2850 + MAIN_DX, 2480 + MAIN_DY]),
];

// Vieques internal road
const viequesRoad: Entity = road("rd-vieques-int", [3010 + V_DX, 2695 + V_DY, 3290 + V_DX, 2680 + V_DY, 3560 + V_DX, 2695 + V_DY]);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ISLAND LANDMARKS
// ═══════════════════════════════════════════════════════════════════════════

// ── Old San Juan ───────────────────────────────────────────────────────────
// Dense cluster of brightly-coloured colonial buildings + El Morro fort hint

const oldSanJuanShapes: Shape[] = [
  // Stone street base
  { type: "rect", x: -130, y: -95, w: 260, h: 195, color: "#9e9e9e", radius: 4 },
];
const sjColors = ["#f48fb1", "#81d4fa", "#ffe082", "#a5d6a7", "#ce93d8", "#ffab91", "#ef9a9a", "#b0bec5", "#80deea", "#ffcc80"];
for (let r2 = 0; r2 < 3; r2++) {
  for (let c2 = 0; c2 < 4; c2++) {
    const col = sjColors[(r2 * 4 + c2) % sjColors.length];
    const bx = -118 + c2 * 60;
    const by = -84  + r2 * 62;
    oldSanJuanShapes.push({ type: "rect", x: bx,      y: by,      w: 52, h: 46, color: col, radius: 2 });
    oldSanJuanShapes.push({ type: "rect", x: bx + 4,  y: by - 6,  w: 44, h:  9, color: darker(col, 25), radius: 1 }); // terracotta roof band
    oldSanJuanShapes.push({ type: "rect", x: bx + 8,  y: by + 8,  w:  9, h: 13, color: "#fff" }); // window L
    oldSanJuanShapes.push({ type: "rect", x: bx + 34, y: by + 8,  w:  9, h: 13, color: "#fff" }); // window R
    oldSanJuanShapes.push({ type: "rect", x: bx + 20, y: by + 26, w: 12, h: 20, color: "#5d4037" }); // door
  }
}
// El Morro fort — north-west corner stub
oldSanJuanShapes.push({ type: "rect", x: -148, y: -108, w: 35, h: 30, color: "#b0bec5", radius: 2 });
oldSanJuanShapes.push({ type: "rect", x: -152, y: -116, w: 43, h: 12, color: "#90a4ae", radius: 2 });
// Plaza fountain
oldSanJuanShapes.push({ type: "circle", x: -8, y: -22, r: 14, color: "#90a4ae" });
oldSanJuanShapes.push({ type: "circle", x: -8, y: -22, r:  9, color: "#29b6f6", alpha: 0.8 });

const oldSanJuan: Entity = {
  id: "sanjuan", x: 1350 + MAIN_DX, y: 2220 + MAIN_DY, layer: 3,
  shapes: oldSanJuanShapes,
  label: { text: "Old San Juan", color: "#fff", font: "bold 15px sans-serif", offsetY: 112, shadow: { color: "rgba(0,0,0,0.85)", blur: 5 } },
  solid: true,
  hitbox:  { ox: -152, oy: -116, w: 304, h: 228 },
  trigger: { type: "zone", name: "Old San Juan", hitbox: { ox: -178, oy: -140, w: 356, h: 284 } },
};

// ── Nightlife District ─────────────────────────────────────────────────────
// Three dark club buildings with neon signs — south of the main highway

const nightlifeDistrict: Entity = {
  id: "nightlife", x: 1480 + MAIN_DX, y: 2520 + MAIN_DY, layer: 3,
  shapes: [
    // ── Club 1 (dark purple) ──────────────────────────────────────
    { type: "rect", x: -86, y: -40, w: 54, h: 62, color: "rgba(0,0,0,0.22)", radius: 3 },
    { type: "rect", x: -84, y: -44, w: 52, h: 62, color: "#1a0033", radius: 3 },
    { type: "rect", x: -84, y: -50, w: 52, h:  9, color: "#6a0080", radius: 2 }, // roof
    { type: "rect", x: -80, y: -36, w: 36, h:  8, color: "rgba(255,0,210,0.9)", radius: 2 }, // neon
    { type: "rect", x: -78, y: -24, w: 12, h: 15, color: "rgba(255,80,200,0.35)", radius: 1 },
    { type: "rect", x: -58, y: -24, w: 12, h: 15, color: "rgba(120,80,255,0.35)", radius: 1 },
    // ── Club 2 (dark teal) ────────────────────────────────────────
    { type: "rect", x: -22, y: -3, w: 58, h: 22, color: "rgba(0,0,0,0.22)", radius: 3 },
    { type: "rect", x: -24, y: -48, w: 60, h: 68, color: "#001a1a", radius: 3 },
    { type: "rect", x: -24, y: -55, w: 60, h:  9, color: "#004d4d", radius: 2 },
    { type: "rect", x: -20, y: -40, w: 42, h:  8, color: "rgba(0,255,200,0.9)", radius: 2 },
    { type: "rect", x: -18, y: -28, w: 14, h: 17, color: "rgba(0,255,180,0.30)", radius: 1 },
    { type: "rect", x:   4, y: -28, w: 14, h: 17, color: "rgba(0,180,255,0.30)", radius: 1 },
    { type: "rect", x:  24, y: -28, w: 14, h: 17, color: "rgba(80,80,255,0.30)", radius: 1 },
    // ── Club 3 (dark red-orange) ──────────────────────────────────
    { type: "rect", x:  46, y: -2, w: 46, h: 20, color: "rgba(0,0,0,0.22)", radius: 3 },
    { type: "rect", x:  44, y: -38, w: 46, h: 58, color: "#1a0000", radius: 3 },
    { type: "rect", x:  44, y: -45, w: 46, h:  9, color: "#4d0000", radius: 2 },
    { type: "rect", x:  48, y: -30, w: 34, h:  8, color: "rgba(255,80,0,0.92)", radius: 2 },
    { type: "rect", x:  50, y: -18, w: 12, h: 15, color: "rgba(255,120,0,0.30)", radius: 1 },
    { type: "rect", x:  68, y: -18, w: 12, h: 15, color: "rgba(255,210,0,0.30)", radius: 1 },
  ],
  label: { text: "Nightlife District", color: "#d6d3d4", font: "bold 13px sans-serif", offsetY: 54, shadow: { color: "rgba(0,0,0,0.9)", blur: 5 } },
  solid: true,
  hitbox:  { ox: -88, oy: -59, w: 236, h: 130 },
  trigger: { type: "zone", name: "Nightlife District", hitbox: { ox: -116, oy: -85, w: 290, h: 186 } },
};

// ── Airbnb ─────────────────────────────────────────────────────────────────
// Cream colonial house with terracotta roof and a pool — zone photo trigger

const airbnb: Entity = {
  id: "airbnb-pr", x: 1700 + MAIN_DX, y: 2560 + MAIN_DY, layer: 3,
  shapes: [
    // Shadow
    { type: "rect", x: -34, y: -24, w: 70, h: 66, color: "rgba(0,0,0,0.20)", radius: 4 },
    // Main building
    { type: "rect", x: -32, y: -28, w: 64, h: 60, color: "#ffecb3", radius: 4 },
    // Terracotta roof band
    { type: "rect", x: -35, y: -35, w: 70, h:  9, color: "#e64a19", radius: 2 },
    // Door
    { type: "rect", x:  -6, y:  14, w: 12, h: 18, color: "#5d4037" },
    // Windows (4)
    { type: "rect", x: -26, y: -16, w: 14, h: 12, color: "rgba(180,220,255,0.65)", radius: 1 },
    { type: "rect", x:  12, y: -16, w: 14, h: 12, color: "rgba(180,220,255,0.65)", radius: 1 },
    { type: "rect", x: -26, y:   2, w: 14, h: 12, color: "rgba(180,220,255,0.65)", radius: 1 },
    { type: "rect", x:  12, y:   2, w: 14, h: 12, color: "rgba(180,220,255,0.65)", radius: 1 },
    // Pool
    { type: "rect", x:  40, y: -14, w: 30, h: 26, color: "#00bcd4", radius: 5, alpha: 0.88 },
    { type: "rect", x:  42, y: -12, w: 26, h: 22, color: "#4dd0e1", radius: 4, alpha: 0.92 },
    { type: "line", x1:  43, y1: -10, x2:  64, y2:  -4, color: "rgba(255,255,255,0.5)", width: 1 },
    { type: "line", x1:  43, y1:  -4, x2:  64, y2: -10, color: "rgba(255,255,255,0.3)", width: 1 },
  ],
  label: { text: "Airbnb 🏖", color: "#fff", font: "bold 13px sans-serif", offsetY: 46, shadow: { color: "rgba(0,0,0,0.85)", blur: 4 } },
  solid: true,
  hitbox:  { ox: -36, oy: -38, w: 106, h: 90 },
  trigger: { type: "zone", name: "Airbnb", hitbox: { ox: -72, oy: -62, w: 178, h: 144 } },
};

// ── SJU Airport ────────────────────────────────────────────────────────────

const sjuAirport: Entity = {
  id: "sju-airport", x: 2720 + MAIN_DX, y: 2770 + MAIN_DY, layer: 3,
  shapes: [
    // Runway markings (behind terminal, layer order handled by shapes array)
    { type: "rect", x: -115, y: 15, w: 230, h: 48, color: "#424242", radius: 2 },
    { type: "line", x1: -105, y1: 39, x2:  105, y2: 39, color: "#ffca28", width: 1, dash: [18, 12] },
    // Terminal building
    { type: "rect", x: -92, y: -32, w: 184, h:  6, color: "rgba(0,0,0,0.2)", radius: 5 },
    { type: "rect", x: -90, y: -34, w: 180, h: 62, color: "#546e7a", radius: 5 },
    // Control tower
    { type: "rect", x:  -9, y: -58, w:  18, h: 26, color: "#455a64" },
    { type: "rect", x: -12, y: -62, w:  24, h:  8, color: "#37474f", radius: 2 },
    // Gate wings
    { type: "rect", x: -72, y: -40, w: 54,  h:  9, color: "#78909c" },
    { type: "rect", x:  18, y: -40, w: 54,  h:  9, color: "#78909c" },
    // Windows along facade
    { type: "rect", x: -76, y: -20, w: 12, h: 10, color: "rgba(200,230,255,0.5)", radius: 1 },
    { type: "rect", x: -56, y: -20, w: 12, h: 10, color: "rgba(200,230,255,0.5)", radius: 1 },
    { type: "rect", x: -36, y: -20, w: 12, h: 10, color: "rgba(200,230,255,0.5)", radius: 1 },
    { type: "rect", x:  24, y: -20, w: 12, h: 10, color: "rgba(200,230,255,0.5)", radius: 1 },
    { type: "rect", x:  44, y: -20, w: 12, h: 10, color: "rgba(200,230,255,0.5)", radius: 1 },
    { type: "rect", x:  64, y: -20, w: 12, h: 10, color: "rgba(200,230,255,0.5)", radius: 1 },
  ],
  label: { text: "SJU Airport", color: "#fff", font: "bold 14px sans-serif", offsetY: 56, shadow: { color: "rgba(0,0,0,0.85)", blur: 3 } },
  solid: false,
};

const sjuTrigger: Entity = {
  id: "sju-trigger", x: 2720 + MAIN_DX, y: 2838 + MAIN_DY, layer: 5,
  shapes: [],
  trigger: { type: "airport", name: "SJU Airport", destination: "vt-island", hitbox: { ox: -80, oy: -35, w: 160, h: 70 } },
};

// ── Restaurant Row — end of rd-airport spur ────────────────────────────────
// Five vibrant Caribbean restaurants; entity origin sits exactly at road end.
// Layout: 3 buildings (row A, y=-52→0) + patio gap + 2 buildings (row B, y=10→62)
// Footprints (entity-relative, no overlap):
//   A1 x[-90,-42]  A2 x[-32,+16]  A3 x[+26,+74]
//   B1 x[-61,-13]  B2 x[+3,+51]

const restaurantRow: Entity = {
  id: "restaurant-row", x: 2420 + MAIN_DX, y: 2550 + MAIN_DY, layer: 3,
  shapes: [
    // ── Row A ─────────────────────────────────────────────────────────────
    // A1: "La Paloma" — hot pink
    { type: "rect", x: -86, y: -48, w: 48, h: 52, color: "rgba(0,0,0,0.20)", radius: 3 },
    { type: "rect", x: -90, y: -52, w: 48, h: 52, color: "#e91e63", radius: 3 },
    { type: "rect", x: -90, y: -62, w: 48, h: 13, color: "#880e4f", radius: 2 },
    { type: "rect", x: -82, y: -40, w: 13, h: 11, color: "rgba(255,255,255,0.60)", radius: 1 },
    { type: "rect", x: -63, y: -40, w: 13, h: 11, color: "rgba(255,255,255,0.60)", radius: 1 },
    { type: "rect", x: -71, y: -20, w: 12, h: 20, color: "#560027" },
    { type: "text", x: -66, y: -58, text: "La Paloma", color: "#fce4ec", font: "bold 7px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    // A2: "El Mar" — cyan/teal
    { type: "rect", x: -28, y: -48, w: 48, h: 52, color: "rgba(0,0,0,0.20)", radius: 3 },
    { type: "rect", x: -32, y: -52, w: 48, h: 52, color: "#00bcd4", radius: 3 },
    { type: "rect", x: -32, y: -62, w: 48, h: 13, color: "#00838f", radius: 2 },
    { type: "rect", x: -24, y: -40, w: 13, h: 11, color: "rgba(255,255,255,0.60)", radius: 1 },
    { type: "rect", x:  -5, y: -40, w: 13, h: 11, color: "rgba(255,255,255,0.60)", radius: 1 },
    { type: "rect", x: -13, y: -20, w: 12, h: 20, color: "#006064" },
    { type: "text", x:  -8, y: -58, text: "El Mar", color: "#e0f7fa", font: "bold 7px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    // A3: "Pinchos" — lime green
    { type: "rect", x:  30, y: -48, w: 48, h: 52, color: "rgba(0,0,0,0.20)", radius: 3 },
    { type: "rect", x:  26, y: -52, w: 48, h: 52, color: "#8bc34a", radius: 3 },
    { type: "rect", x:  26, y: -62, w: 48, h: 13, color: "#33691e", radius: 2 },
    { type: "rect", x:  34, y: -40, w: 13, h: 11, color: "rgba(255,255,255,0.60)", radius: 1 },
    { type: "rect", x:  53, y: -40, w: 13, h: 11, color: "rgba(255,255,255,0.60)", radius: 1 },
    { type: "rect", x:  45, y: -20, w: 12, h: 20, color: "#1b5e20" },
    { type: "text", x:  50, y: -58, text: "Pinchos", color: "#f1f8e9", font: "bold 7px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    // ── Patio / sidewalk between rows ────────────────────────────────────
    { type: "rect", x: -92, y:  -2, w: 188, h: 14, color: "#d7ccc8", radius: 2 },
    { type: "circle", x: -50, y:  5, r: 5, color: "#795548" },
    { type: "circle", x:  0,  y:  5, r: 5, color: "#795548" },
    { type: "circle", x:  50, y:  5, r: 5, color: "#795548" },
    // ── Row B ─────────────────────────────────────────────────────────────
    // B1: "Mofongo" — deep orange
    { type: "rect", x: -57, y:  14, w: 48, h: 52, color: "rgba(0,0,0,0.20)", radius: 3 },
    { type: "rect", x: -61, y:  10, w: 48, h: 52, color: "#ff6f00", radius: 3 },
    { type: "rect", x: -61, y:   0, w: 48, h: 13, color: "#bf360c", radius: 2 },
    { type: "rect", x: -53, y:  22, w: 13, h: 11, color: "rgba(255,255,255,0.60)", radius: 1 },
    { type: "rect", x: -34, y:  22, w: 13, h: 11, color: "rgba(255,255,255,0.60)", radius: 1 },
    { type: "rect", x: -43, y:  42, w: 12, h: 20, color: "#7f0000" },
    { type: "text", x: -37, y:   6, text: "Mofongo", color: "#fff8e1", font: "bold 7px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    // B2: "La Isla" — vivid purple
    { type: "rect", x:   7, y:  14, w: 48, h: 52, color: "rgba(0,0,0,0.20)", radius: 3 },
    { type: "rect", x:   3, y:  10, w: 48, h: 52, color: "#ab47bc", radius: 3 },
    { type: "rect", x:   3, y:   0, w: 48, h: 13, color: "#4a148c", radius: 2 },
    { type: "rect", x:  11, y:  22, w: 13, h: 11, color: "rgba(255,255,255,0.60)", radius: 1 },
    { type: "rect", x:  30, y:  22, w: 13, h: 11, color: "rgba(255,255,255,0.60)", radius: 1 },
    { type: "rect", x:  21, y:  42, w: 12, h: 20, color: "#1a0033" },
    { type: "text", x:  27, y:   6, text: "La Isla", color: "#f3e5f5", font: "bold 7px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
  ],
  label: { text: "Restaurants", color: "#fff", font: "bold 14px sans-serif", offsetY: 84, shadow: { color: "rgba(0,0,0,0.9)", blur: 5 } },
  solid: true,
  hitbox:  { ox: -92, oy: -64, w: 188, h: 136 },
  trigger: { type: "zone", name: "Restaurant Row", hitbox: { ox: -108, oy: -80, w: 216, h: 168 } },
};

// ── Zipline Forest ─────────────────────────────────────────────────────────
// Western mountain forest with a wire + platforms — zone trigger

const ziplineForest: Entity = {
  id: "zipline-forest", x: 1820 + MAIN_DX, y: 2140 + MAIN_DY, layer: 2,
  shapes: [
    // Mountain behind the zipline (drawn first so it sits behind everything)
    { type: "triangle", x1: -130, y1:  38, x2: -48, y2: -110, x3:  34, y3:  38, color: "#37474f" },
    { type: "triangle", x1:  -88, y1:  38, x2: -14, y2:  -82, x3:  62, y3:  38, color: "#455a64" },
    { type: "triangle", x1:  -52, y1:  38, x2:   0, y2:  -56, x3:  52, y3:  38, color: "#546e7a" },
    // Snow cap
    { type: "ellipse", x: -12, y: -88, rx: 22, ry: 12, color: "rgba(255,255,255,0.80)" },
    { type: "ellipse", x:   2, y: -70, rx: 16, ry:  8, color: "rgba(255,255,255,0.55)" },
    // Forest floor
    { type: "ellipse", x: 0,   y: 12, rx:  92, ry: 56, color: "#1b5e20" },
    { type: "ellipse", x: -30, y:  2, rx:  56, ry: 42, color: "#2e7d32" },
    { type: "ellipse", x:  32, y: -4, rx:  66, ry: 50, color: "#388e3c" },
    // Individual treetop canopies
    { type: "circle", x: -62, y: -10, r: 23, color: "#2e7d32" },
    { type: "circle", x:  52, y: -16, r: 28, color: "#388e3c" },
    { type: "circle", x:  10, y: -26, r: 20, color: "#43a047" },
    // Zipline cable
    { type: "line", x1: -76, y1: -28, x2: 82, y2: 36, color: "rgba(210,210,210,0.85)", width: 2 },
    // High platform (start)
    { type: "rect", x: -84, y: -38, w: 16, h: 18, color: "#5d4037", radius: 2 },
    { type: "rect", x: -82, y: -44, w: 12, h:  8, color: "#4e342e", radius: 1 },
    // Low platform (end)
    { type: "rect", x:  76, y: 28, w: 16, h: 18, color: "#5d4037", radius: 2 },
    { type: "rect", x:  78, y: 24, w: 12, h:  6, color: "#4e342e", radius: 1 },
  ],
  label: { text: "Zipline & Mountain", color: "#a5d6a7", font: "bold 13px sans-serif", offsetY: 66, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
  solid: false,
  trigger: { type: "zone", name: "Zipline & Mountain", hitbox: { ox: -140, oy: -120, w: 280, h: 196 } },
};

// ── Ferry docks on main island ─────────────────────────────────────────────

const mainToVieques = ferryDock("dock-main-v", 3150, 2880, "Vieques",      4530, 3185);
const mainToCulebra = ferryDock("dock-main-c", 2860, 2340, "Culebra",      4405, 1900);

// ═══════════════════════════════════════════════════════════════════════════
// VIEQUES
// ═══════════════════════════════════════════════════════════════════════════

// Sun Bay Beach — wide white sand + turquoise water, zone photo trigger
const sunBay: Entity = {
  id: "sun-bay", x: 3045 + V_DX, y: 2780 + V_DY, layer: 2,
  shapes: [
    // Sand crescent
    { type: "ellipse", x:  0, y: 14, rx: 68, ry: 34, color: "#fffde7" },
    { type: "ellipse", x: -8, y:  8, rx: 52, ry: 26, color: "#fff9c4" },
    // Turquoise water layers
    { type: "ellipse", x:  0, y:  0, rx: 54, ry: 22, color: "#00acc1", alpha: 0.72 },
    { type: "ellipse", x:  0, y: -5, rx: 38, ry: 14, color: "#4dd0e1", alpha: 0.65 },
    { type: "ellipse", x:  0, y: -8, rx: 20, ry:  7, color: "#80deea", alpha: 0.55 },
    // Beach umbrellas
    { type: "triangle", x1: -22, y1: 10, x2: -10, y2: -12, x3:   2, y3: 10, color: "#ff5722" },
    { type: "line",     x1: -10, y1: -12, x2: -10, y2: 10,  color: "#795548", width: 2 },
    { type: "triangle", x1:  14, y1: 10, x2:  26, y2: -10, x3:  38, y3: 10, color: "#7b1fa2" },
    { type: "line",     x1:  26, y1: -10, x2:  26, y2: 10,  color: "#795548", width: 2 },
  ],
  label: { text: "Sun Bay 🏖", color: "#fff", font: "bold 13px sans-serif", offsetY: 48, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
  solid: false,
  trigger: { type: "zone", name: "Sun Bay Beach", hitbox: { ox: -84, oy: -52, w: 168, h: 112 } },
};

// Mosquito Bay — bioluminescent bay
const mosquitoBay: Entity = {
  id: "mosquito-bay", x: 3560 + V_DX, y: 2750 + V_DY, layer: 2,
  shapes: [
    { type: "ellipse", x: 0, y:  0, rx: 52, ry: 36, color: "#0d47a1" },
    { type: "ellipse", x: 0, y:  0, rx: 42, ry: 28, color: "#00bcd4", alpha: 0.55 },
    { type: "ellipse", x: 0, y:  0, rx: 26, ry: 18, color: "#4dd0e1", alpha: 0.65 },
    { type: "ellipse", x: 0, y:  0, rx: 13, ry:  8, color: "#80deea", alpha: 0.82 },
    { type: "circle",  x: -16, y: -7, r: 2, color: "#e0f7fa", alpha: 0.9 },
    { type: "circle",  x:  11, y:  5, r: 2, color: "#e0f7fa", alpha: 0.9 },
    { type: "circle",  x:  -3, y: 11, r: 2, color: "#e0f7fa", alpha: 0.9 },
    { type: "circle",  x:  18, y: -9, r: 1.5, color: "#e0f7fa", alpha: 0.8 },
  ],
  label: { text: "Mosquito Bay ✨", color: "#80deea", font: "bold 12px sans-serif", offsetY: 46, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
  solid: false,
  trigger: { type: "zone", name: "Mosquito Bay", hitbox: { ox: -70, oy: -56, w: 140, h: 112 } },
};

const viequesToMain = ferryDock("dock-vieques", 4530, 3185, "Puerto Rico", 3150, 2880);

// Vieques vehicles — golf carts + jeeps scattered around the island
const viequesVehicles: Entity[] = [
  golfCart("gc-v1", 3030 + V_DX, 2640 + V_DY, "#90a4ae"),
  golfCart("gc-v2", 3240 + V_DX, 2870 + V_DY, "#a5d6a7"),
  jeep("jeep-v1",   3170 + V_DX, 2635 + V_DY, "#d32f2f"),
  jeep("jeep-v2",   3470 + V_DX, 2810 + V_DY, "#1565c0"),
];

// ═══════════════════════════════════════════════════════════════════════════
// CULEBRA
// ═══════════════════════════════════════════════════════════════════════════

// Flamenco Beach — iconic wide white-sand crescent with turquoise water
const flamencoBeach: Entity = {
  id: "flamenco-beach", x: 3040 + C_DX, y: 1970 + C_DY, layer: 2,
  shapes: [
    // Sand crescent (wide)
    { type: "ellipse", x:  0, y: 16, rx: 76, ry: 34, color: "#fffde7" },
    { type: "ellipse", x: -6, y:  8, rx: 60, ry: 24, color: "#fff9c4" },
    // Turquoise water layers
    { type: "ellipse", x:  0, y:  0, rx: 62, ry: 22, color: "#00acc1", alpha: 0.74 },
    { type: "ellipse", x:  0, y: -5, rx: 44, ry: 14, color: "#4dd0e1", alpha: 0.65 },
    { type: "ellipse", x:  0, y: -9, rx: 24, ry:  7, color: "#80deea", alpha: 0.55 },
    // Umbrellas
    { type: "triangle", x1: -28, y1: 10, x2: -14, y2: -14, x3:   0, y3: 10, color: "#e91e63" },
    { type: "line",     x1: -14, y1: -14, x2: -14, y2: 12,  color: "#795548", width: 2 },
    { type: "triangle", x1:  10, y1: 10, x2:  24, y2: -12, x3:  38, y3: 10, color: "#ff9800" },
    { type: "line",     x1:  24, y1: -12, x2:  24, y2: 12,  color: "#795548", width: 2 },
  ],
  label: { text: "Flamenco Beach 🏖", color: "#fff", font: "bold 13px sans-serif", offsetY: 50, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
  solid: false,
  trigger: { type: "zone", name: "Flamenco Beach", hitbox: { ox: -92, oy: -54, w: 184, h: 116 } },
};

const culebraToMain = ferryDock("dock-culebra", 4405, 1900, "Puerto Rico", 2860, 2340);

// Culebra vehicles — golf carts + jeeps
const culebraVehicles: Entity[] = [
  golfCart("gc-c1", 2930 + C_DX, 1890 + C_DY, "#ffcc80"),
  golfCart("gc-c2", 3190 + C_DX, 2010 + C_DY, "#ce93d8"),
  jeep("jeep-c1",   3040 + C_DX, 1870 + C_DY, "#388e3c"),
  jeep("jeep-c2",   3140 + C_DX, 2060 + C_DY, "#f57c00"),
];

// ═══════════════════════════════════════════════════════════════════════════
// MAP EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const puertoRicoMap: MapData = {
  id: "puerto-rico", name: "Puerto Rico",
  worldWidth: W, worldHeight: W,
  spawnX: 2200, spawnY: 2820,
  spawnRotation: -Math.PI / 2,
  bgColor: "#0b7dab",

  boundary: {
    type: "multi-ellipse",
    ellipses: [
      { cx: MX,  cy: MY,  rx: 1220, ry: 760 },
      { cx: VX,  cy: VY,  rx: 610, ry: 320 },
      { cx: CUX, cy: CUY, rx: 430, ry: 255 },
    ],
  },

  entities: [
    ocean, shallows, terrain,
    trees,
    // Roads
    ...roads, viequesRoad,
    // Main island landmarks
    oldSanJuan,
    nightlifeDistrict,
    airbnb,
    sjuAirport, sjuTrigger,
    restaurantRow,
    ziplineForest,
    mainToVieques, mainToCulebra,
    // Vieques
    sunBay, mosquitoBay,
    viequesToMain,
    ...viequesVehicles,
    // Culebra
    flamencoBeach,
    culebraToMain,
    ...culebraVehicles,
  ],
  items: [],
  npcs: [],
  artifacts: [
    {
      id: "beer",
      name: "Beer",
      mapCoordinates: { x: 2460, y: 2680 },
      requiredPlayer: "Arav",
      stageRequired: 5,
      icon: "🍺",
      description: "A cold beer. Arav needs this.",
      hitbox: { w: 64, h: 64 },
    },
  ],
};
