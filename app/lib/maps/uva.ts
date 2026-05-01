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

/** Non-clickable apartment block with balconies */
function apartment(id: string, x: number, y: number, w: number, h: number, color: string, label?: string): Entity {
  const shapes: Shape[] = [
    { type: "rect", x: -(w / 2) + 4, y: -(h / 2) + 5, w, h, color: "rgba(0,0,0,0.24)", radius: 3 },
    { type: "rect", x: -(w / 2), y: -(h / 2), w, h, color, radius: 3 },
    { type: "rect", x: -(w / 2) - 2, y: -(h / 2) - 7, w: w + 4, h: 8, color: dk(color, 34), radius: 2 },
    { type: "rect", x: -8, y: h / 2 - 18, w: 16, h: 18, color: dk(color, 58), radius: 1 },
  ];
  const cols = Math.max(1, Math.floor((w - 16) / 20));
  const rows = Math.max(1, Math.floor((h - 34) / 22));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = -(w / 2) + 10 + c * 20;
      const wy = -(h / 2) + 12 + r * 22;
      shapes.push({ type: "rect", x: wx, y: wy, w: 11, h: 11, color: "rgba(210,235,255,0.42)", radius: 1 });
      shapes.push({ type: "rect", x: wx - 2, y: wy + 12, w: 15, h: 3, color: "rgba(255,255,255,0.42)", radius: 1 });
    }
  }

  return {
    id, x, y, layer: 3, shapes,
    label: label ? { text: label, color: "#fff", font: "bold 11px sans-serif", offsetY: h / 2 + 14, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } } : undefined,
    solid: true,
    hitbox: { ox: -(w / 2) - 3, oy: -(h / 2) - 8, w: w + 6, h: h + 14 },
  };
}

/** Non-clickable storefront for the downtown food/nightlife street */
function storefront(id: string, x: number, y: number, w: number, color: string, text: string): Entity {
  return {
    id, x, y, layer: 3,
    shapes: [
      { type: "rect", x: -(w / 2) + 3, y: -29, w, h: 58, color: "rgba(0,0,0,0.22)", radius: 2 },
      { type: "rect", x: -(w / 2), y: -32, w, h: 58, color, radius: 2 },
      { type: "rect", x: -(w / 2) - 2, y: -38, w: w + 4, h: 8, color: dk(color, 38), radius: 1 },
      { type: "rect", x: -(w / 2) + 8, y: -18, w: w - 16, h: 17, color: "rgba(255,255,255,0.18)", radius: 2 },
      { type: "rect", x: -8, y: 7, w: 16, h: 19, color: "rgba(0,0,0,0.38)", radius: 1 },
      { type: "text", x: 0, y: -9, text, color: "#fff", font: "bold 8px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    solid: true,
    hitbox: { ox: -(w / 2) - 3, oy: -40, w: w + 6, h: 68 },
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
    { type: "ellipse", x: CX, y: CY, rx: 812, ry: 772, color: "#d9c49a" },   // Sandy shore
    { type: "ellipse", x: CX, y: CY, rx: 800, ry: 760, color: "#5a8c5e" },   // Campus green
    { type: "ellipse", x: CX, y: CY, rx: 494, ry: 465, color: "#4e8052", alpha: 0.35 }, // Inner quad tint
  ],
};

// ── Roads ─────────────────────────────────────────────────────────────────

const roads: Entity[] = [
  road("main-ns",  [CX, 290, CX, 1510]),     // University Avenue (N–S)
  road("main-ew",  [320, CY, 1480, CY]),     // Rugby Road (E–W)
  road("lawn-w",   [855, 520, 855, 900]),    // West Range path
  road("lawn-e",   [945, 520, 945, 900]),    // East Range path
  road("downtown-st", [1145, 655, 1435, 655]), // Downtown food + nightlife
  road("apartment-loop", [412, 670, 520, 584, 650, 622, 706, 756]), // Apartment loop
  road("airbnb-lane", [900, 1350, 656, 1350]),                      // Spur to the AirBnB
];

// ── Carter Mountain ───────────────────────────────────────────────────────

const carterMountain: Entity = {
  id: "carter-mountain", x: 1290, y: 1248, layer: 1,
  shapes: [
    { type: "ellipse", x: 0, y: 18, rx: 238, ry: 152, color: "#2f6d3f" },
    { type: "ellipse", x: -36, y: -8, rx: 190, ry: 118, color: "#3d7d46" },
    { type: "ellipse", x: 54, y: -34, rx: 124, ry: 76, color: "#568d4a" },
    { type: "polyline", points: [-168, 28, -82, -46, 0, 18, 78, -72, 174, -18], color: "rgba(255,255,255,0.18)", width: 5, cap: "round", join: "round" },
    { type: "polyline", points: [-142, 74, -38, 34, 42, 66, 138, 18], color: "rgba(71,45,23,0.25)", width: 7, cap: "round", join: "round" },
  ],
  label: { text: "Carter Mountain", color: "#e8f5e9", font: "bold 13px sans-serif", offsetY: 156, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
};

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

// ── Apartments ────────────────────────────────────────────────────────────

const apartments: Entity[] = [
  apartment("apartment-west-1", 455, 650, 76, 88, "#8a5a44", "Apartments"),
  apartment("apartment-west-2", 552, 594, 70, 78, "#a4663d"),
  apartment("apartment-west-3", 634, 684, 82, 94, "#6f5b4b"),
  apartment("apartment-south-1", 572, 1198, 84, 88, "#8d6e63"),
  apartment("apartment-south-2", 674, 1208, 74, 80, "#795548"),
];

// ── Downtown Street ───────────────────────────────────────────────────────

const downtownStreet: Entity[] = [
  { id: "downtown-label", x: 1290, y: 596, layer: 4, shapes: [
    { type: "text", x: 0, y: 0, text: "Downtown", color: "#fff", font: "bold 13px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
  ]},
  storefront("corner-bites", 1168, 618, 70, "#b95532", "FOOD"),
  storefront("late-night", 1252, 612, 76, "#463366", "MUSIC"),
  storefront("pizza-row", 1340, 618, 72, "#ba6b2c", "PIZZA"),
  storefront("pub-lights", 1422, 614, 66, "#2f5e49", "PUB"),
  storefront("brunch-house", 1214, 704, 82, "#c48a4a", "CAFE"),
  storefront("dance-cellar", 1322, 710, 92, "#2f2c4d", "DANCE"),
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

// ── Scary Smelly Shitty AirBnB ────────────────────────────────────────────
// Focal point for Riya's token quest — large, dilapidated off-white house

const scaryAirbnb: Entity = {
  id: "scary-airbnb", x: 640, y: 1350, layer: 3,
  shapes: [
    { type: "rect", x: -58, y: -52, w: 120, h: 108, color: "rgba(0,0,0,0.28)", radius: 5 },
    // Main body — large, yellowed off-white
    { type: "rect", x: -55, y: -55, w: 114, h: 104, color: "#f0ead6", radius: 4 },
    // Dingy roof band
    { type: "rect", x: -57, y: -63, w: 118, h: 12,  color: "#b8a882", radius: 3 },
    // Attic window
    { type: "rect", x: -12, y: -56, w: 24, h: 16,   color: "rgba(80,100,110,0.30)", radius: 2 },
    // Peeling horizontal trim (stained)
    { type: "rect", x: -57, y: -10, w: 118, h: 4,   color: "#9e8e68", radius: 1 },
    { type: "rect", x: -57, y:  20, w: 118, h: 4,   color: "#9e8e68", radius: 1 },
    // Left windows — cloudy glass
    { type: "rect", x: -44, y: -36, w: 16, h: 18, color: "rgba(90,110,120,0.28)", radius: 1 },
    { type: "rect", x: -44, y:   2, w: 16, h: 18, color: "rgba(90,110,120,0.28)", radius: 1 },
    // Right windows
    { type: "rect", x:  28, y: -36, w: 16, h: 18, color: "rgba(90,110,120,0.28)", radius: 1 },
    { type: "rect", x:  28, y:   2, w: 16, h: 18, color: "rgba(90,110,120,0.28)", radius: 1 },
    // Off-centre front door — slightly crooked feel
    { type: "rect", x:  -9, y:  28, w: 22, h: 21, color: "#6b4c2a", radius: 1 },
    // Porch step
    { type: "rect", x: -16, y:  48, w: 36, h: 6,  color: "#cdbf9a", radius: 1 },
    // Overgrown bush — adds to neglected look
    { type: "circle", x: -50, y: 46, r: 10, color: "#3a6b3e" },
    { type: "circle", x:  50, y: 44, r:  8, color: "#2e5c32" },
  ],
  label: {
    text: "Scary Smelly Shitty AirBnB", color: "#ffcc80",
    font: "bold 11px sans-serif", offsetY: 70,
    shadow: { color: "rgba(0,0,0,0.95)", blur: 5 },
  },
  solid: true,
  hitbox:  { ox: -59, oy: -65, w: 118, h: 122 },
  trigger: { type: "zone", name: "Scary Smelly Shitty AirBnB", hitbox: { ox: -82, oy: -80, w: 164, h: 158 } },
};

// ── Return trigger ─────────────────────────────────────────────────────────

const returnTrigger: Entity = {
  id: "return", x: CX, y: CY + 462, layer: 5,
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

export const uvaMap: MapData = {
  id: "uva", name: "UVA",
  worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY + 180,
  spawnRotation: -Math.PI / 2,
  bgColor: "#0e4a7a",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 800, ry: 760 },
  entities: [
    ocean, island,
    carterMountain,
    ...roads,
    theLawn,
    rotunda,
    ...pavilions,
    ...apartments,
    ...downtownStreet,
    aldermanLibrary,
    jpjArena,
    scaryAirbnb,
    returnTrigger,
  ],
  items: [], npcs: [],
};
