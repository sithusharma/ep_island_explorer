// ---------------------------------------------------------------------------
// NC Island — NC State (north) vs. UNC Chapel Hill (south) rivalry map
// ---------------------------------------------------------------------------

import type { Entity, MapData, Shape } from "../types";

const W  = 3000;
const CX = W / 2;   // 1500
const CY = W / 2;   // 1500

// ── Utilities ─────────────────────────────────────────────────────────────

function dk(hex: string, n = 30): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - n);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - n);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - n);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Standard campus building with windows and zone trigger */
function campusBldg(
  id: string, x: number, y: number,
  w: number, h: number,
  color: string, name: string,
  labelColor = "#fff",
): Entity {
  const roof = dk(color, 28);
  const shapes: Shape[] = [
    { type: "rect", x: -(w / 2) + 3, y: -(h / 2) + 3, w, h, color: "rgba(0,0,0,0.20)", radius: 3 },
    { type: "rect", x: -(w / 2),     y: -(h / 2),     w, h, color, radius: 3 },
    { type: "rect", x: -(w / 2) - 2, y: -(h / 2) - 6, w: w + 4, h: 8, color: roof, radius: 2 },
    { type: "rect", x: -6, y: h / 2 - 16, w: 12, h: 16, color: dk(color, 50) },
  ];
  const cols = Math.max(1, Math.floor((w - 18) / 18));
  const rows = Math.max(1, Math.floor((h - 28) / 18));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      shapes.push({
        type: "rect",
        x: -(w / 2) + 9 + c * 18, y: -(h / 2) + 12 + r * 18,
        w: 10, h: 12, color: "rgba(255,255,255,0.18)", radius: 1,
      });
    }
  }
  return {
    id, x, y, layer: 3, shapes,
    label: { text: name, color: labelColor, font: "bold 12px sans-serif", offsetY: h / 2 + 14, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
    solid: true,
    hitbox:  { ox: -(w / 2) - 3, oy: -(h / 2) - 8, w: w + 6,  h: h + 14 },
    trigger: { type: "zone", name, hitbox: { ox: -(w / 2) - 40, oy: -(h / 2) - 40, w: w + 80, h: h + 80 } },
  };
}

/** Road */
function road(id: string, pts: number[]): Entity {
  return {
    id, x: 0, y: 0, layer: 2,
    shapes: [
      { type: "polyline", points: pts, color: "rgba(0,0,0,0.14)", width: 48, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#616161",           width: 42, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#ffeb3b",           width: 2,  dash: [14, 10], cap: "butt", join: "round" },
    ],
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
    { type: "ellipse", x: CX, y: CY, rx: 1260, ry: 1120, color: "#e8d5a3" },
    { type: "ellipse", x: CX, y: CY, rx: 1245, ry: 1105, color: "#4caf50" },
    // Subtle NC State red tint on northern half
    { type: "ellipse", x: CX, y: CY - 640, rx: 1180, ry: 650, color: "rgba(180,0,0,0.08)" },
    // Subtle UNC Carolina blue tint on southern half
    { type: "ellipse", x: CX, y: CY + 640, rx: 1180, ry: 650, color: "rgba(75,156,211,0.09)" },
  ],
};

// ── Roads ─────────────────────────────────────────────────────────────────

const roads: Entity[] = [
  // Rivalry Road — the E–W divider between the two campuses
  road("rivalry-rd", [740, CY, 2260, CY]),
  // Main N–S avenue
  road("main-ave",   [CX, 720, CX, 2280]),
  // Short campus loop roads
  road("ncst-loop",  [1080, 960, 1080, 1320, 1420, 1320]),
  road("unc-loop",   [1580, 1680, 1940, 1680, 1940, 2020]),
];

// ── NC State Campus — north half ──────────────────────────────────────────
// Wolfpack red (#cc0000) palette

const ncStateBuildings: Entity[] = [
  campusBldg("ncst-coliseum", 1218, 1102, 122, 78, "#9a0000", "Reynolds Coliseum", "#ffcdd2"),
  campusBldg("ncst-union",    1365, 1078,  95, 60, "#b71c1c", "Talley Student Union", "#ffcdd2"),
  campusBldg("ncst-lib",      1234, 1208,  82, 56, "#c62828", "D.H. Hill Library", "#ffcdd2"),
];

const ncStateResidences: Entity[] = [
  // Keep Riya in the NC State area
  campusBldg("riyas-apartment", 986, 1110, 82, 86, "#8d3b3b", "Riya's Apartment", "#ffcdd2"),
];

// Zone marker — large glow + nameplate over the cluster
const ncStateZone: Entity = {
  id: "ncstate-zone", x: 1278, y: 1145, layer: 3,
  shapes: [
    { type: "rect", x: -175, y: -195, w: 350, h: 390, color: "rgba(180,0,0,0.05)", radius: 8 },
    { type: "rect", x: -58, y: 198, w: 116, h: 30, color: "rgba(140,0,0,0.90)", radius: 5 },
    { type: "text", x: 0, y: 213, text: "NC State", color: "#ff8a80",
      font: "bold 12px sans-serif",
      align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
      shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
  ],
  trigger: { type: "zone", name: "NC State", hitbox: { ox: -185, oy: -205, w: 370, h: 410 } },
};

// ── UNC Chapel Hill Campus — south half ────────────────────────────────────
// Carolina blue (#4b9cd3) palette

// Iconic circular Dean Dome arena
const deanDome: Entity = {
  id: "dean-dome", x: 1652, y: 1832, layer: 3,
  shapes: [
    { type: "ellipse", x: 4, y: 5, rx: 74, ry: 60, color: "rgba(0,0,0,0.22)" },
    { type: "ellipse", x: 0, y: 0, rx: 74, ry: 60, color: "#1565c0" },
    { type: "ellipse", x: 0, y: 0, rx: 58, ry: 46, color: "#4b9cd3" },
    { type: "ellipse", x: 0, y: 0, rx: 38, ry: 30, color: "#7ec8e3" },
    { type: "ellipse", x: 0, y: 0, rx: 22, ry: 17, color: "#b3e5fc" },
  ],
  label: { text: "Dean Dome", color: "#fff", font: "bold 12px sans-serif", offsetY: 70, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
  solid: true,
  hitbox:  { ox: -76, oy: -62, w: 152, h: 124 },
  trigger: { type: "zone", name: "Dean Dome", hitbox: { ox: -95, oy: -78, w: 190, h: 156 } },
};

const uncBuildings: Entity[] = [
  campusBldg("unc-wilson",  1782, 1735, 100, 65, "#1565c0", "Wilson Library", "#bbdefb"),
  campusBldg("unc-bell",    1665, 1685,  85, 55, "#1976d2", "Bell Tower Bldg", "#bbdefb"),
  campusBldg("unc-franklin",1798, 1858,  90, 60, "#1e88e5", "Franklin Street",  "#bbdefb"),
];

const uncZone: Entity = {
  id: "unc-zone", x: 1705, y: 1790, layer: 3,
  shapes: [
    { type: "rect", x: -175, y: -192, w: 350, h: 384, color: "rgba(75,156,211,0.06)", radius: 8 },
    { type: "rect", x: -72, y: 196, w: 144, h: 30, color: "rgba(21,101,192,0.92)", radius: 5 },
    { type: "text", x: 0, y: 211, text: "UNC Chapel Hill", color: "#90caf9",
      font: "bold 12px sans-serif",
      align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
      shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
  ],
  trigger: { type: "zone", name: "UNC Chapel Hill", hitbox: { ox: -185, oy: -202, w: 370, h: 404 } },
};

// ── Return trigger ─────────────────────────────────────────────────────────

const returnTrigger: Entity = {
  id: "return", x: CX, y: CY + 880, layer: 5,
  shapes: [
    { type: "rect", x: -70, y: -18, w: 140, h: 36, color: "rgba(33,150,243,0.88)", radius: 8 },
    { type: "text", x: 0, y: 0, text: "← Back to VT", color: "#fff",
      font: "bold 12px sans-serif",
      align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
  ],
  trigger: { type: "highway", name: "Return to VT", destination: "vt-island", hitbox: { ox: -90, oy: -45, w: 180, h: 90 } },
};

// ── Map export ────────────────────────────────────────────────────────────

export const ncMap: MapData = {
  id: "nc", name: "North Carolina",
  worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY + 100,
  spawnRotation: -Math.PI / 2,
  bgColor: "#0e4a7a",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 1245, ry: 1105 },
  entities: [
    ocean, island,
    ...roads,
    ...ncStateBuildings, ...ncStateResidences, ncStateZone,
    // Charlotte cluster (far corner)
    campusBldg("sithus-house",   CX + 760, CY + 620,  90, 70, "#7f2f2f", "Sithu's House", "#ffcdd2"),
    campusBldg("monicas-house",  CX + 880, CY + 700,  96, 74, "#a04444", "Monica's House", "#ffcdd2"),
    { id: "charlotte-label", x: CX + 820, y: CY + 560, layer: 4, shapes: [
      { type: "text", x: 0, y: 0, text: "Charlotte", color: "#fff", font: "bold 16px sans-serif",
        align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
        shadow: { color: "rgba(0,0,0,0.85)", blur: 4 } },
    ]},
    deanDome, ...uncBuildings, uncZone,
    returnTrigger,
  ],
  items: [], npcs: [],
};
