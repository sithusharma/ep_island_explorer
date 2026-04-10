// ---------------------------------------------------------------------------
// VT Island — the spawn map. Virginia Tech campus with all landmarks.
// ---------------------------------------------------------------------------

import type { Entity, MapData, Shape } from "../types";

const W = 4000;
const CX = W / 2; // 2000
const CY = W / 2;
const IRX = 1600;
const IRY = 1400;

// ── Utility ───────────────────────────────────────────────────────────────

function darker(hex: string, n = 30): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - n);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - n);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - n);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ── Factory: building (solid + zone trigger) ──────────────────────────────

function bldg(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  name: string
): Entity {
  const roof = darker(color, 35);
  const door = darker(color, 55);
  const shapes: Shape[] = [
    { type: "rect", x: -w / 2 + 3, y: -h / 2 + 3, w, h, color: "rgba(0,0,0,0.12)", radius: 3 },
    { type: "rect", x: -w / 2, y: -h / 2, w, h, color, radius: 3 },
    { type: "rect", x: -w / 2 - 3, y: -h / 2 - 6, w: w + 6, h: 8, color: roof, radius: 2 },
    { type: "rect", x: -7, y: h / 2 - 18, w: 14, h: 18, color: door },
  ];
  // Windows
  const wc = Math.max(1, Math.floor((w - 24) / 22));
  const wr = Math.max(1, Math.floor((h - 34) / 20));
  for (let r = 0; r < wr; r++) {
    for (let c = 0; c < wc; c++) {
      shapes.push({
        type: "rect",
        x: -w / 2 + 12 + c * 22,
        y: -h / 2 + 14 + r * 20,
        w: 10,
        h: 10,
        color: "rgba(255,255,255,0.22)",
      });
    }
  }
  return {
    id, x, y, layer: 3, shapes,
    label: { text: name, color: "#fff", font: "bold 13px sans-serif", offsetY: h / 2 + 14, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
    solid: true,
    hitbox: { ox: -w / 2 - 4, oy: -h / 2 - 8, w: w + 8, h: h + 14 },
    trigger: { type: "zone", name, hitbox: { ox: -w / 2 - 40, oy: -h / 2 - 40, w: w + 80, h: h + 80 } },
  };
}

// ── Factory: road ─────────────────────────────────────────────────────────

function road(id: string, pts: number[]): Entity {
  const shadow = pts.map((v, i) => (i % 2 === 0 ? v + 2 : v + 2));
  return {
    id, x: 0, y: 0, layer: 2,
    shapes: [
      { type: "polyline", points: shadow, color: "rgba(0,0,0,0.1)", width: 48, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#616161", width: 42, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#ffeb3b", width: 2, dash: [16, 12], cap: "butt", join: "round" },
    ],
  };
}

// ── Factory: tree ─────────────────────────────────────────────────────────

function tree(id: string, x: number, y: number, r = 20): Entity {
  return {
    id, x, y, layer: 4,
    shapes: [
      { type: "ellipse", x: 3, y: r - 4, rx: r * 0.7, ry: r * 0.3, color: "rgba(0,0,0,0.08)" },
      { type: "rect", x: -3, y: -3, w: 6, h: 12, color: "#5d4037" },
      { type: "circle", x: 0, y: -7, r, color: "#2e7d32" },
      { type: "circle", x: -r * 0.2, y: -7 - r * 0.2, r: r * 0.4, color: "rgba(129,199,132,0.35)" },
    ],
  };
}

// ── Factory: highway trigger ──────────────────────────────────────────────

function hwy(id: string, x: number, y: number, dest: string, label: string): Entity {
  return {
    id, x, y, layer: 5,
    shapes: [
      { type: "rect", x: -44, y: -16, w: 88, h: 28, color: "rgba(33,150,243,0.8)", radius: 6 },
      { type: "text", x: 0, y: 0, text: `→ ${label}`, color: "#fff", font: "bold 11px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    trigger: { type: "highway", name: label, destination: dest, hitbox: { ox: -65, oy: -50, w: 130, h: 100 } },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ENTITIES
// ═══════════════════════════════════════════════════════════════════════════

// ── L0: Ocean + Island ────────────────────────────────────────────────────

const ocean: Entity = {
  id: "ocean", x: 0, y: 0, layer: 0,
  shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0e4a7a" }],
};

const island: Entity = {
  id: "island", x: 0, y: 0, layer: 0,
  shapes: [
    { type: "ellipse", x: CX, y: CY, rx: IRX + 15, ry: IRY + 15, color: "#e8d5a3" },
    { type: "ellipse", x: CX, y: CY, rx: IRX, ry: IRY, color: "#4caf50" },
    { type: "ellipse", x: CX - 100, y: CY - 100, rx: IRX - 200, ry: IRY - 200, color: "#5cb860", alpha: 0.45 },
  ],
};

// ── L1: Drillfield ────────────────────────────────────────────────────────

const drillfield: Entity = {
  id: "drillfield", x: CX, y: CY - 50, layer: 1,
  shapes: [
    { type: "ellipse", x: 0, y: 0, rx: 290, ry: 190, color: "#8d6e63", stroke: "#795548", lineWidth: 6 },
    { type: "ellipse", x: 0, y: 0, rx: 270, ry: 175, color: "#66bb6a" },
    { type: "ellipse", x: 0, y: 0, rx: 200, ry: 120, color: "rgba(56,142,60,0.3)" },
  ],
  label: { text: "The Drillfield", color: "#fff", font: "bold 16px sans-serif", offsetY: 200, shadow: { color: "rgba(0,0,0,0.6)", blur: 3 } },
};

const vtLogo: Entity = {
  id: "vt-logo", x: CX, y: CY - 50, layer: 4,
  shapes: [
    { type: "circle", x: 0, y: 0, r: 28, color: "#630031" },
    { type: "text", x: 0, y: 0, text: "VT", color: "#ff6600", font: "bold 22px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
  ],
};

// ── L2: Roads ─────────────────────────────────────────────────────────────

const roads: Entity[] = [
  road("rd-ns",       [CX, 650, CX, 1200, CX, 1800, CX, 2200, CX, 2500, CX, 3200]),
  road("rd-ew",       [600, 1800, 1500, 1800, CX, 1800, 2500, 1800, 3300, 1800]),
  road("rd-downtown", [1400, 2500, 1700, 2500, CX, 2500, 2300, 2500, 2550, 2500]),
  road("rd-w-conn",   [1350, 1800, 1350, 2100, 1350, 2500]),
  road("rd-e-conn",   [2700, 1650, 2700, 1800, 2700, 2100]),
  road("rd-hwy-nyc",  [CX + 200, 1200, 2500, 1000, 2900, 800]),
  road("rd-hwy-tenn", [1500, 2700, 1200, 2850, 950, 3000]),
  road("rd-hwy-nc",   [2500, 2700, 2800, 2850, 3100, 3000]),
  road("rd-hwy-dc",   [CX, 650, CX, 500]),
  road("rd-hwy-uva",  [600, 1800, 450, 1800]),
];

// ── L3: Buildings (ALL VT Landmarks) ──────────────────────────────────────

const buildings: Entity[] = [
  // ── Campus / Academic ───────────────────────────────────────────────
  bldg("lane-stadium",     1750, 1450, 160, 100, "#861F41", "Lane Stadium"),
  bldg("the-hub",          2250, 1500, 130, 85, "#78909c", "The Hub"),
  bldg("dorms",            2100, 1350, 100, 70, "#8d6e63", "Dorms"),
  bldg("the-park",         CX, 1300, 100, 65, "#2e7d32", "The Park"),

  // ── Apartments ──────────────────────────────────────────────────────
  bldg("edges-apt",        2850, 1800, 110, 75, "#c8a882", "Edge's Apartment"),
  bldg("collegiate-apt",   2850, 2000, 110, 75, "#b8956a", "Collegiate Apartment"),

  // ── West Side ───────────────────────────────────────────────────────
  bldg("wild-side",        1200, 2050, 85, 58, "#2e7d32", "Wild Side Weed Shop"),
  bldg("alcohol-store",    1450, 2060, 85, 58, "#6a1b9a", "Alcohol Store"),

  // ── Downtown ────────────────────────────────────────────────────────
  bldg("bww",              1550, 2350, 95, 60, "#f9a825", "Buffalo Wild Wings"),
  bldg("tots",             1780, 2350, 70, 55, "#37474f", "TOTS"),
  bldg("hokie-house",      CX, 2330, 80, 58, "#861F41", "Hokie House"),
  bldg("the-burg",         2210, 2350, 85, 55, "#795548", "The Burg"),
  bldg("bennys",           2420, 2350, 75, 55, "#c62828", "Benny's Pizza"),
];

// ── L3: Airport ───────────────────────────────────────────────────────────

const airportTerminal: Entity = {
  id: "airport-terminal", x: CX, y: 3050, layer: 3,
  shapes: [
    { type: "rect", x: -93, y: -33, w: 186, h: 66, color: "rgba(0,0,0,0.12)", radius: 4 },
    { type: "rect", x: -90, y: -30, w: 180, h: 60, color: "#546e7a", radius: 4 },
    { type: "rect", x: -93, y: -36, w: 186, h: 10, color: "#37474f", radius: 3 },
    { type: "rect", x: -8, y: -60, w: 16, h: 30, color: "#455a64" },
    { type: "rect", x: -14, y: -66, w: 28, h: 10, color: "#90caf9", radius: 2 },
    { type: "rect", x: -70, y: -20, w: 14, h: 14, color: "rgba(144,202,249,0.5)" },
    { type: "rect", x: -45, y: -20, w: 14, h: 14, color: "rgba(144,202,249,0.5)" },
    { type: "rect", x: -20, y: -20, w: 14, h: 14, color: "rgba(144,202,249,0.5)" },
    { type: "rect", x: 10, y: -20, w: 14, h: 14, color: "rgba(144,202,249,0.5)" },
    { type: "rect", x: 35, y: -20, w: 14, h: 14, color: "rgba(144,202,249,0.5)" },
    { type: "rect", x: 60, y: -20, w: 14, h: 14, color: "rgba(144,202,249,0.5)" },
    { type: "rect", x: -12, y: 10, w: 24, h: 20, color: "#b0bec5" },
  ],
  label: { text: "Airport", color: "#fff", font: "bold 16px sans-serif", offsetY: 48, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
  solid: true,
  hitbox: { ox: -94, oy: -68, w: 188, h: 98 },
};

const airportRunway: Entity = {
  id: "airport-runway", x: 0, y: 0, layer: 2,
  shapes: [
    { type: "rect", x: CX - 200, y: 3130, w: 400, h: 50, color: "#37474f" },
    { type: "line", x1: CX - 180, y1: 3155, x2: CX + 180, y2: 3155, color: "#fff", width: 2, dash: [20, 16], cap: "butt" },
    { type: "rect", x: CX - 190, y: 3135, w: 4, h: 40, color: "#fff" },
    { type: "rect", x: CX - 180, y: 3135, w: 4, h: 40, color: "#fff" },
    { type: "rect", x: CX + 176, y: 3135, w: 4, h: 40, color: "#fff" },
    { type: "rect", x: CX + 186, y: 3135, w: 4, h: 40, color: "#fff" },
  ],
};

const airportTrigger: Entity = {
  id: "airport-trigger", x: CX, y: 3155, layer: 5,
  shapes: [
    { type: "rect", x: -100, y: -20, w: 200, h: 40, color: "rgba(255,152,0,0.12)", radius: 4 },
  ],
  trigger: { type: "airport", name: "Airport", hitbox: { ox: -180, oy: -35, w: 360, h: 70 } },
};

// ── L3: Jukebox ───────────────────────────────────────────────────────────

const jukebox: Entity = {
  id: "jukebox", x: CX, y: 2750, layer: 3,
  shapes: [
    { type: "rect", x: -17, y: -15, w: 34, h: 34, color: "rgba(0,0,0,0.15)", radius: 4 },
    { type: "rect", x: -14, y: -18, w: 28, h: 36, color: "#4a148c", radius: 4 },
    { type: "rect", x: -12, y: -24, w: 24, h: 8, color: "#7b1fa2", radius: 4 },
    { type: "rect", x: -8, y: -14, w: 16, h: 10, color: "#ce93d8", radius: 2 },
    { type: "rect", x: -10, y: 0, w: 20, h: 3, color: "#e040fb" },
    { type: "rect", x: -10, y: 5, w: 20, h: 3, color: "#ff4081" },
    { type: "rect", x: -10, y: 10, w: 20, h: 3, color: "#ff6e40" },
    { type: "circle", x: 0, y: -10, r: 22, color: "rgba(224,64,251,0.08)" },
    { type: "text", x: 0, y: -30, text: "♫", color: "#e040fb", font: "14px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
  ],
  label: { text: "Jukebox", color: "#e040fb", font: "bold 12px sans-serif", offsetY: 26, shadow: { color: "rgba(0,0,0,0.7)", blur: 3 } },
  solid: true,
  hitbox: { ox: -16, oy: -26, w: 32, h: 44 },
  trigger: { type: "jukebox", name: "Jukebox", hitbox: { ox: -50, oy: -50, w: 100, h: 100 } },
};

// ── L4: Trees ─────────────────────────────────────────────────────────────

const trees: Entity[] = [
  tree("t1", 1450, 1350, 22), tree("t2", 1850, 1400, 18), tree("t3", 2350, 1350, 20),
  tree("t4", CX - 400, CY - 150, 24), tree("t5", CX + 400, CY - 150, 22),
  tree("t6", CX - 350, CY + 100, 20), tree("t7", CX + 350, CY + 100, 18),
  tree("t8", 3000, 1700, 20), tree("t9", 3050, 2000, 22),
  tree("t10", 1700, 2700, 18), tree("t11", 2300, 2700, 20),
  tree("t12", 1800, 2850, 16), tree("t13", 2200, 2850, 18),
  tree("t14", 1000, 1600, 22), tree("t15", 950, 2300, 20), tree("t16", 1100, 2600, 18),
  tree("t17", 1800, 1000, 20), tree("t18", 2200, 950, 18),
];

// ── L5: Highway triggers ──────────────────────────────────────────────────

const highways: Entity[] = [
  hwy("hwy-dc",   CX, 500,  "dc",        "DC"),
  hwy("hwy-nyc",  2900, 800, "nyc",       "NYC"),
  hwy("hwy-uva",  450, 1800, "uva",       "UVA"),
  hwy("hwy-tenn", 950, 3000, "tennessee",  "Tennessee"),
  hwy("hwy-nc",   3100, 3000, "nc",        "NC"),
];

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const vtIsland: MapData = {
  id: "vt-island",
  name: "VT Island",
  worldWidth: W,
  worldHeight: W,
  spawnX: CX,
  spawnY: CY + 50,
  spawnRotation: -Math.PI / 2,
  bgColor: "#0e4a7a",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: IRX, ry: IRY },
  entities: [
    ocean, island,
    drillfield,
    ...roads, airportRunway,
    ...buildings, airportTerminal, jukebox,
    vtLogo, ...trees,
    ...highways, airportTrigger,
  ],
  items: [],
  npcs: [
    {
      id: "milo",
      name: "Milo",
      spawnX: CX + 80,
      spawnY: CY - 100,
      speed: 40,
      wanderRadius: 280,
      bodyColor: "#212121",
      accentColor: "#fafafa",
    },
  ],
};
