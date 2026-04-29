// ---------------------------------------------------------------------------
// Richmond, VA — Compact brick-and-mortar city with The Fancy Building
// ---------------------------------------------------------------------------

import type { Entity, MapData, Shape } from "../types";

const W  = 1600;
const CX = W / 2;   // 800
const CY = W / 2;   // 800

// ── Utilities ─────────────────────────────────────────────────────────────

function dk(hex: string, n = 30): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - n);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - n);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - n);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Small brick downtown building with door, windows, and zone trigger */
function brickBldg(
  id: string, x: number, y: number,
  w: number, h: number,
  color: string, name: string,
): Entity {
  const roof = dk(color, 30);
  const door = dk(color, 55);
  const shapes: Shape[] = [
    { type: "rect", x: -(w / 2) + 3, y: -(h / 2) + 3, w, h, color: "rgba(0,0,0,0.20)", radius: 2 },
    { type: "rect", x: -(w / 2),     y: -(h / 2),     w, h, color, radius: 2 },
    { type: "rect", x: -(w / 2) - 2, y: -(h / 2) - 6, w: w + 4, h: 7,  color: roof, radius: 2 },
    { type: "rect", x: -6, y: h / 2 - 16, w: 12, h: 16, color: door },
  ];
  const wc = Math.max(1, Math.floor((w - 18) / 18));
  const wr = Math.max(1, Math.floor((h - 28) / 18));
  for (let r = 0; r < wr; r++) {
    for (let c = 0; c < wc; c++) {
      shapes.push({
        type: "rect",
        x: -(w / 2) + 9 + c * 18, y: -(h / 2) + 12 + r * 18,
        w: 10, h: 12, color: "rgba(255,255,255,0.15)", radius: 1,
      });
    }
  }
  return {
    id, x, y, layer: 3, shapes,
    label: { text: name, color: "#fff", font: "bold 12px sans-serif", offsetY: h / 2 + 14, shadow: { color: "rgba(0,0,0,0.85)", blur: 3 } },
    solid: true,
    hitbox:  { ox: -(w / 2) - 3, oy: -(h / 2) - 8, w: w + 6,  h: h + 14 },
    trigger: { type: "zone", name, hitbox: { ox: -(w / 2) - 35, oy: -(h / 2) - 35, w: w + 70, h: h + 70 } },
  };
}

/** Warm brick road with amber centre line */
function road(id: string, pts: number[]): Entity {
  return {
    id, x: 0, y: 0, layer: 2,
    shapes: [
      { type: "polyline", points: pts, color: "rgba(0,0,0,0.12)", width: 48, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#5d4e37",           width: 42, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#ffca28",           width: 2,  dash: [14, 10], cap: "butt", join: "round" },
    ],
  };
}

// ── Base terrain ──────────────────────────────────────────────────────────

const river: Entity = {
  id: "river", x: 0, y: 0, layer: 0,
  shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#1c3a5e" }],
};

const island: Entity = {
  id: "island", x: 0, y: 0, layer: 0,
  shapes: [
    // Sandy shore ring
    { type: "ellipse", x: CX, y: CY, rx: 592, ry: 552, color: "#d7a97b" },
    // Warm brick-dust base
    { type: "ellipse", x: CX, y: CY, rx: 580, ry: 540, color: "#c4a882" },
    // Downtown core tint
    { type: "ellipse", x: CX, y: CY, rx: 375, ry: 350, color: "#b89870", alpha: 0.40 },
  ],
};

// ── Roads ─────────────────────────────────────────────────────────────────

const roads: Entity[] = [
  road("main-st",  [250,  850, 1350,  850]),   // E–W spine
  road("broad-st", [800,  310,  800, 1290]),   // N–S axis
  road("side-w",   [500,  700,  500, 1000]),   // West side street
  road("side-e",   [1100, 700, 1100, 1000]),   // East side street
];

// ── The Fancy Building ─────────────────────────────────────────────────────
// Tall ivory art-deco tower with gold cornice, arched windows, and a spire.
// Its cream/gold palette stands out sharply from the surrounding brick.

const fancyShapes: Shape[] = [
  // Drop shadow
  { type: "rect", x: -33, y: -93, w: 66, h: 186, color: "rgba(0,0,0,0.30)", radius: 3 },
  // Main body — pale ivory
  { type: "rect", x: -30, y: -90, w: 60, h: 180, color: "#fffde7", radius: 3 },
  // Gold cornice band (top of body)
  { type: "rect", x: -34, y: -97, w: 68, h: 10, color: "#f9a825", radius: 2 },
  // Mid-height gold decorative band
  { type: "rect", x: -32, y: -18, w: 64, h: 6, color: "#f9a825" },
  // Spire plinth
  { type: "rect", x: -6, y: -110, w: 12, h: 22, color: "#f9a825", radius: 1 },
  // Spire
  { type: "triangle", x1: -7, y1: -110, x2: 0, y2: -138, x3: 7, y3: -110, color: "#ffd54f" },
  // Spire finial ball
  { type: "circle", x: 0, y: -139, r: 3.5, color: "#ffca28" },
  // Grand entrance arch
  { type: "rect", x: -10, y: 80, w: 20, h: 22, color: "#f9a825", radius: 2 },
];
// Arched windows — 2 columns × 7 rows
for (let row = 0; row < 7; row++) {
  const wy = -78 + row * 22;
  for (const wx of [-18, 6]) {
    fancyShapes.push({
      type: "rect", x: wx, y: wy, w: 12, h: 16,
      color: "#b3e5fc", radius: 4,
    });
  }
}

const fancyBuilding: Entity = {
  id: "fancy-building", x: CX, y: 635, layer: 3,
  shapes: fancyShapes,
  label: {
    text: "The Fancy Building", color: "#ffd54f",
    font: "bold 13px sans-serif", offsetY: 108,
    shadow: { color: "rgba(0,0,0,0.9)", blur: 4 },
  },
  solid: true,
  hitbox:  { ox: -34, oy: -142, w: 68, h: 244 },
  trigger: { type: "zone", name: "The Fancy Building", hitbox: { ox: -60, oy: -155, w: 120, h: 285 } },
};

// ── Downtown strip ─────────────────────────────────────────────────────────
// Six brick buildings along Main Street, each with its own zone trigger

const downtown: Entity[] = [
  brickBldg("carytown",     500, 822,  96, 56, "#a07040", "Carytown"),
  brickBldg("kuba-kuba",    610, 820,  72, 55, "#b74e32", "Kuba Kuba"),
  brickBldg("village-cafe", 700, 816,  68, 50, "#c4855a", "Village Café"),
  brickBldg("brenner-pass", 810, 820,  80, 58, "#8d5c3e", "Brenner Pass"),
  brickBldg("the-jasper",   908, 816,  74, 52, "#4e3b2e", "The Jasper"),
  brickBldg("buz-and-neds", 1012, 822, 88, 56, "#7a3b1e", "Buz and Ned's"),
];

// ── James River Park (south edge, small green space) ──────────────────────

const riverPark: Entity = {
  id: "river-park", x: CX, y: 1138, layer: 1,
  shapes: [
    { type: "ellipse", x:   0, y:  0, rx: 120, ry: 62, color: "#3b7a3e" },
    { type: "ellipse", x: -38, y: -8, rx: 34,  ry: 22, color: "#2e7d32" },
    { type: "ellipse", x:  48, y:  5, rx: 26,  ry: 16, color: "#43a047" },
    { type: "circle",  x: -58, y: -5, r: 9,             color: "#1b5e20" },
    { type: "circle",  x:  60, y: -7, r: 7,             color: "#2e7d32" },
    { type: "circle",  x:   8, y: 14, r: 11,            color: "#33691e" },
  ],
  label: { text: "James River Park", color: "#a5d6a7", font: "bold 11px sans-serif", offsetY: 70, shadow: { color: "rgba(0,0,0,0.7)", blur: 3 } },
};

// ── Return trigger (north end of Broad St) ────────────────────────────────

const returnTrigger: Entity = {
  id: "return", x: CX, y: CY - 430, layer: 5,
  shapes: [
    { type: "rect", x: -70, y: -18, w: 140, h: 36, color: "rgba(33,150,243,0.88)", radius: 8 },
    { type: "text", x: 0, y: 0, text: "← Back to VT", color: "#fff",
      font: "bold 12px sans-serif",
      align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
  ],
  trigger: { type: "highway", name: "Return to VT", destination: "vt-island", hitbox: { ox: -90, oy: -45, w: 180, h: 90 } },
};

// ── Map export ────────────────────────────────────────────────────────────

export const richmondMap: MapData = {
  id: "richmond", name: "Richmond, VA",
  worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY + 100,
  spawnRotation: -Math.PI / 2,
  bgColor: "#1c3a5e",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 580, ry: 540 },
  entities: [
    river, island, riverPark,
    ...roads,
    fancyBuilding,
    ...downtown,
    returnTrigger,
  ],
  items: [], npcs: [],
};
