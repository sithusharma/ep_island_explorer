// ---------------------------------------------------------------------------
// NYC — Dense city-block grid with Year 1 & Year 3 memory zones
// ---------------------------------------------------------------------------

import type { Entity, MapData, Shape } from "../types";

const W  = 2000;
const CX = W / 2;   // 1000
const CY = W / 2;   // 1000

// ── Utilities ─────────────────────────────────────────────────────────────

function dk(hex: string, n = 25): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - n);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - n);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - n);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** NYC-style skyscraper block with window grid and setback tiers */
function tower(
  id: string, x: number, y: number,
  w: number, h: number,
  color: string,
  name?: string,
): Entity {
  const cap = dk(color, 22);
  const shapes: Shape[] = [
    // Drop shadow
    { type: "rect", x: -(w / 2) + 3, y: -(h / 2) + 3, w, h, color: "rgba(0,0,0,0.22)", radius: 1 },
    // Body
    { type: "rect", x: -(w / 2), y: -(h / 2), w, h, color, radius: 1 },
    // Roof cap
    { type: "rect", x: -(w / 2) - 2, y: -(h / 2) - 6, w: w + 4, h: 8, color: cap, radius: 1 },
    // Setback tier (gives the classic NYC stepped-back silhouette)
    { type: "rect", x: -(w / 2) + 5, y: -(h / 2) - 13, w: w - 10, h: 8, color: dk(color, 10), radius: 1 },
  ];
  // Window grid
  const cols = Math.max(1, Math.floor((w - 12) / 14));
  const rows = Math.max(1, Math.floor((h - 14) / 16));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      shapes.push({
        type: "rect",
        x: -(w / 2) + 6 + c * 14,
        y: -(h / 2) + 7 + r * 16,
        w: 8, h: 10,
        color: "rgba(160,210,255,0.22)", radius: 1,
      });
    }
  }
  const e: Entity = {
    id, x, y, layer: 3, shapes,
    solid: true,
    hitbox: { ox: -(w / 2) - 2, oy: -(h / 2) - 15, w: w + 4, h: h + 20 },
  };
  if (name) {
    e.label = {
      text: name, color: "#b0bec5", font: "bold 11px sans-serif",
      offsetY: h / 2 + 14,
      shadow: { color: "rgba(0,0,0,0.8)", blur: 3 },
    };
  }
  return e;
}

/** 2-lane city avenue / street */
function ave(id: string, pts: number[]): Entity {
  return {
    id, x: 0, y: 0, layer: 2,
    shapes: [
      { type: "polyline", points: pts, color: "rgba(0,0,0,0.18)", width: 50, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#455a64",           width: 44, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#ffeb3b",           width: 2,  dash: [10, 10], cap: "butt",  join: "round" },
    ],
  };
}

// ── Base terrain ──────────────────────────────────────────────────────────

const ocean: Entity = {
  id: "ocean", x: 0, y: 0, layer: 0,
  shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#1a237e" }],
};

const island: Entity = {
  id: "island", x: 0, y: 0, layer: 0,
  shapes: [
    // Shore ring — light concrete
    { type: "ellipse", x: CX, y: CY, rx: 852, ry: 812, color: "#90a4ae" },
    // Main city slab — medium concrete
    { type: "ellipse", x: CX, y: CY, rx: 840, ry: 800, color: "#607d8b" },
    // Dense urban core (slightly darker centre)
    { type: "ellipse", x: CX, y: CY, rx: 580, ry: 560, color: "#546e7a", alpha: 0.35 },
  ],
};

// ── 3×3 Road grid ─────────────────────────────────────────────────────────
// Avenues (N–S) at x = 800, 1000, 1200
// Streets  (E–W) at y = 700, 1000, 1300

const roads: Entity[] = [
  ave("ave-a", [800,  310, 800,  1690]),
  ave("ave-b", [1000, 210, 1000, 1790]),
  ave("ave-c", [1200, 310, 1200, 1690]),
  ave("st-1",  [360,  700, 1640,  700]),
  ave("st-2",  [210, 1000, 1790, 1000]),
  ave("st-3",  [360, 1300, 1640, 1300]),
];

// ── Central Park (tiny green respite between the grids) ───────────────────

const centralPark: Entity = {
  id: "central-park", x: CX, y: 920, layer: 1,
  shapes: [
    { type: "rect",    x: -78, y: -48, w: 156, h: 96, color: "#2e7d32", radius: 6 },
    { type: "ellipse", x: -22, y:  -8, rx: 28, ry: 18, color: "#388e3c" },
    { type: "ellipse", x:  32, y:   5, rx: 20, ry: 13, color: "#43a047" },
    { type: "circle",  x: -42, y: -10, r: 8,            color: "#1b5e20" },
    { type: "circle",  x:  50, y:  -5, r: 7,            color: "#2e7d32" },
    { type: "circle",  x:  12, y:  12, r: 10,           color: "#33691e" },
  ],
  label: { text: "The Park", color: "#a5d6a7", font: "bold 11px sans-serif", offsetY: 56, shadow: { color: "rgba(0,0,0,0.7)", blur: 3 } },
};

// ── NYC Year 1 — NW block  (block centre ≈ 692, 548) ─────────────────────
// Brownstone-meets-modern cluster, warmer grey tones

const y1Bldgs: Entity[] = [
  tower("y1-a", 625, 565, 55, 175, "#546e7a"),
  tower("y1-b", 703, 578, 50, 145, "#607d8b"),
  tower("y1-c", 768, 538, 38, 108, "#78909c"),
  tower("y1-d", 637, 472, 48,  80, "#455a64"),
  tower("y1-e", 743, 486, 42, 118, "#37474f"),
];

const year1Zone: Entity = {
  id: "nyc-year1", x: 692, y: 548, layer: 3,
  shapes: [
    // Faint zone glow on the concrete
    { type: "rect", x: -128, y: -158, w: 256, h: 316, color: "rgba(100,181,246,0.05)", radius: 6 },
    // Street-level nameplate
    { type: "rect", x: -60, y: 162, w: 120, h: 30, color: "rgba(13,71,161,0.85)", radius: 5 },
    { type: "text", x: 0, y: 177, text: "NYC — Year 1", color: "#90caf9",
      font: "bold 11px sans-serif",
      align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
      shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
  ],
  trigger: { type: "zone", name: "NYC Year 1", hitbox: { ox: -138, oy: -168, w: 276, h: 336 } },
};

// ── NYC Year 3 — SE block  (block centre ≈ 1328, 1438) ───────────────────
// Taller, more polished glass towers; darker palette

const y3Bldgs: Entity[] = [
  tower("y3-a",     1250, 1418, 58, 230, "#4a6572"),
  tower("y3-b",     1335, 1438, 70, 215, "#37474f"),
  tower("y3-c",     1420, 1400, 42, 165, "#546e7a"),
  tower("y3-d",     1262, 1512, 46, 125, "#263238"),
  tower("y3-e",     1393, 1498, 52, 188, "#455a64"),
  // Distinctive glass tower (cobalt blue)
  tower("y3-glass", 1318, 1418, 50, 260, "#1565c0"),
];

const year3Zone: Entity = {
  id: "nyc-year3", x: 1328, y: 1438, layer: 3,
  shapes: [
    { type: "rect", x: -135, y: -165, w: 270, h: 335, color: "rgba(100,181,246,0.05)", radius: 6 },
    { type: "rect", x: -60, y: 174, w: 120, h: 30, color: "rgba(13,71,161,0.85)", radius: 5 },
    { type: "text", x: 0, y: 189, text: "NYC — Year 3", color: "#90caf9",
      font: "bold 11px sans-serif",
      align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
      shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
  ],
  trigger: { type: "zone", name: "NYC Year 3", hitbox: { ox: -145, oy: -175, w: 290, h: 355 } },
};

// ── Filler buildings — give the whole island a lived-in density ────────────

const fillers: Entity[] = [
  // NE block
  tower("fill-ne1", 1282,  548, 50, 145, "#546e7a"),
  tower("fill-ne2", 1358,  520, 40, 105, "#607d8b"),
  tower("fill-ne3", 1422,  562, 55, 165, "#455a64"),
  // SW block
  tower("fill-sw1",  622, 1385, 60, 135, "#546e7a"),
  tower("fill-sw2",  710, 1355, 46, 162, "#607d8b"),
  tower("fill-sw3",  774, 1408, 52, 112, "#37474f"),
  // Central scatter (between the grid intersections)
  tower("fill-c1",   852,  838, 40,  90, "#607d8b"),
  tower("fill-c2",  1152,  832, 45, 112, "#546e7a"),
  tower("fill-c3",   840, 1155, 50, 102, "#455a64"),
  tower("fill-c4",  1158, 1162, 40, 128, "#37474f"),
];

// ── Return trigger ─────────────────────────────────────────────────────────

const returnTrigger: Entity = {
  id: "return", x: CX, y: CY + 670, layer: 5,
  shapes: [
    { type: "rect", x: -4, y: -10, w: 8, h: 50, color: "#4b5563", radius: 4 },
    { type: "rect", x: -52, y: -34, w: 104, h: 42, color: "rgba(15,23,42,0.28)", radius: 12 },
    { type: "rect", x: -48, y: -38, w: 96, h: 38, color: "#7c3aed", radius: 12, stroke: "#c4b5fd", lineWidth: 2 },
    { type: "circle", x: -26, y: -19, r: 11, color: "rgba(255,255,255,0.12)" },
    { type: "text", x: -26, y: -19, text: "🏰", color: "#fff",
      font: "16px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
      shadow: { color: "rgba(196,181,253,0.34)", blur: 8 } },
    { type: "text", x: 8, y: -19, text: "BACK TO VT", color: "#fff",
      font: "bold 11px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
      shadow: { color: "rgba(196,181,253,0.34)", blur: 6 } },
    { type: "line", x1: 10, y1: -6, x2: 28, y2: -6, color: "#c4b5fd", width: 2 },
    { type: "line", x1: 28, y1: -6, x2: 22, y2: -10, color: "#c4b5fd", width: 2 },
    { type: "line", x1: 28, y1: -6, x2: 22, y2: -2, color: "#c4b5fd", width: 2 },
  ],
  trigger: { type: "highway", name: "Return to VT", destination: "vt-island", hitbox: { ox: -72, oy: -56, w: 144, h: 120 } },
};

// ── Map export ────────────────────────────────────────────────────────────

export const nycMap: MapData = {
  id: "nyc", name: "NYC",
  worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY + 220,
  spawnRotation: -Math.PI / 2,
  bgColor: "#1a237e",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 840, ry: 800 },
  entities: [
    ocean, island, centralPark,
    ...roads,
    ...y1Bldgs, year1Zone,
    ...y3Bldgs, year3Zone,
    ...fillers,
    returnTrigger,
  ],
  items: [], npcs: [],
};
