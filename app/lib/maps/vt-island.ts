// ---------------------------------------------------------------------------
// VT Island (The Spawn Map) — Geographic highway hubs, boundary-safe entities,
// buildings set back from road edges
// ---------------------------------------------------------------------------

import type { Entity, MapData, Shape } from "../types";

const W   = 3600;
const CX  = 1800;
const CY  = 1800;
const IRX = 1600; // Island ellipse X radius (sand)
const IRY = 1500; // Island ellipse Y radius (sand)
const SHOW_FRIEND_GARAGES = true;

// ── Utilities ─────────────────────────────────────────────────────────────

function darker(hex: string, n = 30): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - n);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - n);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - n);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function highwayTheme(dest: string, label: string) {
  const key = `${dest} ${label}`.toLowerCase();
  if (key.includes("vt")) return { icon: "🏰", face: "#7c3aed", accent: "#c4b5fd", glow: "rgba(196,181,253,0.34)" };
  if (key.includes("nyc")) return { icon: "🗽", face: "#0f766e", accent: "#99f6e4", glow: "rgba(153,246,228,0.3)" };
  if (key.includes("miami") || key.includes("cancun")) return { icon: "🌴", face: "#0f766e", accent: "#86efac", glow: "rgba(134,239,172,0.28)" };
  if (key.includes("dc")) return { icon: "🏛️", face: "#1d4ed8", accent: "#bfdbfe", glow: "rgba(191,219,254,0.34)" };
  return { icon: "🛣️", face: "#1e3a8a", accent: "#93c5fd", glow: "rgba(147,197,253,0.32)" };
}

// ── Entity factories ───────────────────────────────────────────────────────

/** Standard campus / downtown building */
function bldg(
  id: string, x: number, y: number,
  w: number, h: number,
  color: string, name: string,
): Entity {
  const roof = darker(color, 35);
  const door = darker(color, 55);
  const shapes: Shape[] = [
    { type: "rect", x: -w / 2 + 3, y: -h / 2 + 3, w, h, color: "rgba(0,0,0,0.15)", radius: 3 },
    { type: "rect", x: -w / 2,     y: -h / 2,     w, h, color, radius: 3 },
    { type: "rect", x: -w / 2 - 3, y: -h / 2 - 6, w: w + 6, h: 8, color: roof, radius: 2 },
    { type: "rect", x: -7,         y: h / 2 - 18,  w: 14, h: 18, color: door },
  ];
  const wc = Math.max(1, Math.floor((w - 24) / 22));
  const wr = Math.max(1, Math.floor((h - 34) / 20));
  for (let r = 0; r < wr; r++) {
    for (let c = 0; c < wc; c++) {
      shapes.push({
        type: "rect",
        x: -w / 2 + 12 + c * 22, y: -h / 2 + 14 + r * 20,
        w: 10, h: 10, color: "rgba(255,255,255,0.22)",
      });
    }
  }
  return {
    id, x, y, layer: 3, shapes,
    label: {
      text: name, color: "#fff", font: "bold 13px sans-serif",
      offsetY: h / 2 + 16,
      shadow: { color: "rgba(0,0,0,0.9)", blur: 4 },
    },
    solid: true,
    hitbox:  { ox: -w / 2 - 4,  oy: -h / 2 - 8,  w: w + 8,  h: h + 14 },
    trigger: { type: "zone", name, hitbox: { ox: -w / 2 - 40, oy: -h / 2 - 40, w: w + 80, h: h + 80 } },
  };
}

/** Road polyline — shadow + asphalt + dashed centre line */
function road(id: string, pts: number[]): Entity {
  const shadow = pts.map((v, i) => v + (i % 2 === 0 ? 2 : 2));
  return {
    id, x: 0, y: 0, layer: 2,
    shapes: [
      { type: "polyline", points: shadow, color: "rgba(0,0,0,0.10)", width: 48, cap: "round", join: "round" },
      { type: "polyline", points: pts,    color: "#616161",            width: 42, cap: "round", join: "round" },
      { type: "polyline", points: pts,    color: "#ffeb3b",            width: 2,  dash: [16, 12], cap: "butt",  join: "round" },
    ],
  };
}

/** Highway sign trigger at island edge */
function hwy(id: string, x: number, y: number, dest: string, label: string): Entity {
  const theme = highwayTheme(dest, label);
  return {
    id, x, y, layer: 5,
    shapes: [
      { type: "rect", x: -4, y: -10, w: 8, h: 50, color: "#4b5563", radius: 4 },
      { type: "rect", x: -52, y: -34, w: 104, h: 42, color: "rgba(15,23,42,0.28)", radius: 12 },
      { type: "rect", x: -48, y: -38, w: 96, h: 38, color: theme.face, radius: 12, stroke: theme.accent, lineWidth: 2 },
      { type: "circle", x: -26, y: -19, r: 11, color: "rgba(255,255,255,0.12)" },
      {
        type: "text", x: -26, y: -19, text: theme.icon, color: "#fff",
        font: "16px sans-serif",
        align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
        shadow: { color: theme.glow, blur: 8 },
      },
      {
        type: "text", x: 8, y: -19, text: label.toUpperCase(), color: "#fff",
        font: "bold 11px sans-serif",
        align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
        shadow: { color: theme.glow, blur: 6 },
      },
      { type: "line", x1: 10, y1: -6, x2: 28, y2: -6, color: theme.accent, width: 2 },
      { type: "line", x1: 28, y1: -6, x2: 22, y2: -10, color: theme.accent, width: 2 },
      { type: "line", x1: 28, y1: -6, x2: 22, y2: -2, color: theme.accent, width: 2 },
    ],
    trigger: { type: "highway", name: label, destination: dest, hitbox: { ox: -72, oy: -56, w: 144, h: 120 } },
  };
}

function garageEntities(id: string, x: number, y: number, name: string, color: string): Entity[] {
  return [{
    id: `${id}-spot`,
    x,
    y,
    layer: 3,
    shapes: [
      { type: "rect", x: -34, y: -38, w: 68, h: 80, color: "rgba(0,0,0,0.10)", radius: 7 },
      { type: "rect", x: -32, y: -36, w: 64, h: 76, color: "#6f9f61", radius: 7 },
      { type: "rect", x: -28, y: -32, w: 56, h: 68, color: "#d7dde3", radius: 4, stroke: "#f8fafc", lineWidth: 2 },
      { type: "rect", x: -24, y: -28, w: 48, h: 8, color: color, radius: 2 },
      { type: "line", x1: -28, y1: -24, x2: -28, y2: 30, color: "#fff8e1", width: 3 },
      { type: "line", x1: 28, y1: -24, x2: 28, y2: 30, color: "#fff8e1", width: 3 },
      { type: "line", x1: -18, y1: -16, x2: 18, y2: -16, color: "rgba(255,255,255,0.85)", width: 2 },
      { type: "line", x1: -18, y1: 20, x2: 18, y2: 20, color: "rgba(255,255,255,0.28)", width: 1.5 },
      {
        type: "text", x: 0, y: 4, text: name.slice(0, 3), color: "#0f172a",
        font: "bold 9px sans-serif",
        align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
      },
    ],
    label: {
      text: `${name}'s Parking Spot`, color: "#fff", font: "bold 11px sans-serif",
      offsetY: 48, shadow: { color: "rgba(0,0,0,0.9)", blur: 4 },
    },
    solid: false,
    trigger: {
      type: "zone",
      name: `${name}'s Parking Spot`,
      hitbox: { ox: -32, oy: -36, w: 64, h: 76 },
    },
  }];
}

// ═══════════════════════════════════════════════════════════════════════════
// BASE TERRAIN
// ═══════════════════════════════════════════════════════════════════════════

const ocean: Entity = {
  id: "ocean", x: 0, y: 0, layer: 0,
  shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0e4a7a" }],
};

const island: Entity = {
  id: "island", x: 0, y: 0, layer: 0,
  shapes: [
    { type: "ellipse", x: CX, y: CY, rx: IRX,        ry: IRY,        color: "#e8d5a3" }, 
    { type: "ellipse", x: CX, y: CY, rx: IRX - 40,   ry: IRY - 40,   color: "#4caf50" }, 
    { type: "ellipse", x: CX - 52, y: CY - 48, rx: IRX - 260, ry: IRY - 240, color: "#5cb860", alpha: 0.42 }, 
  ],
};

// ── Drillfield (centre) ────────────────────────────────────────────────────

const drillfield: Entity = {
  id: "drillfield", x: CX, y: CY, layer: 1,
  shapes: [
    { type: "ellipse", x: 0, y: 0, rx: 320, ry: 220, color: "#8d6e63", stroke: "#795548", lineWidth: 8 },
    { type: "ellipse", x: 0, y: 0, rx: 300, ry: 200, color: "#66bb6a" },
  ],
  label: {
    text: "The Drillfield", color: "#fff", font: "bold 20px sans-serif",
    offsetY: 0, shadow: { color: "rgba(0,0,0,0.7)", blur: 4 },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// NW QUADRANT — Hikes, The Spot & ABC Store
// ═══════════════════════════════════════════════════════════════════════════

const theSpot: Entity = {
  id: "the-spot", x: 760, y: 1000, layer: 1,
  shapes: [
    { type: "circle",  x: -96, y: -76, r: 34,         color: "#ffee58" },
    { type: "ellipse", x: 0,   y: 0,   rx: 190, ry: 126, color: "#81c784" },
    { type: "rect",    x: -25,  y: -20,  w: 50, h: 10, color: "#8d6e63", radius: 2 },
    { type: "rect",    x: -25,  y: -10,  w: 50, h: 8,  color: "#5d4037", radius: 2 },
  ],
  label: { text: "The Spot", color: "#fff", font: "bold 16px sans-serif", offsetY: 102, shadow: { color: "#000", blur: 4 } },
  solid: false,
  trigger: { type: "zone", name: "The Spot", hitbox: { ox: -180, oy: -136, w: 360, h: 272 } },
};

const cascades: Entity = {
  id: "cascades", x: 880, y: 1290, layer: 1,
  shapes: [
    { type: "ellipse",  x: 0,   y: 10,  rx: 152, ry: 90, color: "#4a7c4e" },
    { type: "triangle", x1: -90, y1: 25, x2: -25, y2: -55, x3: 50, y3: 25, color: "#5a9060" },
    { type: "triangle", x1: -30, y1: 25, x2:  30, y2: -80, x3: 100, y3: 25, color: "#4e8455" },
    { type: "triangle", x1: -12, y1: -35, x2: -25, y2: -55, x3: 5,  y3: -34, color: "#ecf0f1" },
    { type: "triangle", x1:  18, y1: -56, x2:  30, y2: -80, x3: 52, y3: -52, color: "#ecf0f1" },
    { type: "rect",     x:  14,  y: -54,  w: 9, h: 68, color: "#64b5f6", radius: 4 },
    { type: "rect",     x:  16,  y: -56,  w: 4, h: 40, color: "#bbdefb", radius: 2, alpha: 0.75 },
    { type: "ellipse",  x:  18,  y: 20,   rx: 22, ry: 9,  color: "rgba(100,181,246,0.38)" },
  ],
  label: { text: "Cascades", color: "#fff", font: "bold 14px sans-serif", offsetY: 88, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
  solid: false,
  trigger: { type: "zone", name: "Cascades", hitbox: { ox: -160, oy: -110, w: 320, h: 220 } },
};

const dragonsTooth: Entity = {
  id: "dragons-tooth", x: 1120, y: 690, layer: 1,
  shapes: [
    { type: "ellipse",  x: 0,    y: 10,  rx: 138, ry: 82, color: "#6d6d6d" },
    { type: "triangle", x1: -95, y1: 30, x2: -15, y2: -40, x3: 60, y3: 30,  color: "#8a8a8a" },
    { type: "triangle", x1: -20, y1: 30, x2: 50,  y2: -35, x3: 100, y3: 30, color: "#757575" },
    { type: "triangle", x1: -18, y1: -25, x2: 5,  y2: -105, x3: 28, y3: -25, color: "#bdbdbd" },
    { type: "triangle", x1:   5, y1: -105, x2: 28, y2: -25, x3: 22, y3: -28, color: "#9e9e9e" },
    { type: "triangle", x1: -70, y1: 30,  x2: -45, y2: -5,  x3: -18, y3: 30, color: "#616161" },
  ],
  label: { text: "Dragon's Tooth", color: "#fff", font: "bold 14px sans-serif", offsetY: 80, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
  solid: false,
  trigger: { type: "zone", name: "Dragon's Tooth", hitbox: { ox: -128, oy: -118, w: 256, h: 230 } },
};

const abcStore = bldg("abc-store", 1200, 1450, 90, 60, "#6a1b9a", "ABC Store");

const graveyard: Entity = {
  id: "graveyard", x: 1450, y: 1100, layer: 2,
  shapes: [
    { type: "ellipse", x: 0, y: 0, rx: 72, ry: 52, color: "#2e7d32" },
    { type: "ellipse", x: 0, y: 0, rx: 62, ry: 43, color: "#388e3c" },
    { type: "rect", x: -72, y: -52, w: 144, h: 4,   color: "#5d4037" },
    { type: "rect", x: -72, y:  48, w: 144, h: 4,   color: "#5d4037" },
    { type: "rect", x: -72, y: -52, w:   4, h: 104, color: "#5d4037" },
    { type: "rect", x:  68, y: -52, w:   4, h: 104, color: "#5d4037" },
    { type: "rect", x: -44, y: -22, w: 22, h: 32, color: "#9e9e9e", radius: 5 },
    { type: "rect", x: -10, y: -26, w: 20, h: 32, color: "#bdbdbd", radius: 5 },
    { type: "rect", x:  22, y: -22, w: 22, h: 32, color: "#9e9e9e", radius: 5 },
  ],
  label: { text: "Graveyard", color: "#90a4ae", font: "bold 13px sans-serif", offsetY: 62, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
  solid: false,
  trigger: { type: "graveyard", name: "Graveyard", hitbox: { ox: -80, oy: -62, w: 160, h: 124 } },
};

// ═══════════════════════════════════════════════════════════════════════════
// NE QUADRANT — Apartments
// ═══════════════════════════════════════════════════════════════════════════

const edges      = bldg("edges-apt",      2450, 1150, 120, 80,  "#c8a882", "Edge's Apartment");
const alight     = bldg("alight",         2450, 750,  148, 92,  "#a1887f", "Alight");
const theHub     = bldg("the-hub",        2230, 760,  140, 90,  "#78909c", "The Hub");
const collegiate = bldg("collegiate-apt", 2700, 790,  140, 90,  "#b8956a", "Collegiate Apartment");

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLE WEST — Frat Row
// ═══════════════════════════════════════════════════════════════════════════

const fratRowShapes: Shape[] = [];
const fratHouses: Array<{ dx: number; color: string; name: string }> = [
  { dx: -145, color: "#7b1fa2", name: "ΦΔΘ" },
  { dx:  -45, color: "#1565c0", name: "ΣΧ"  },
  { dx:   55, color: "#2e7d32", name: "ΔΚΕ" },
  { dx:  155, color: "#e65100", name: "ΑΤΩ" },
];
for (const { dx, color, name } of fratHouses) {
  const roof = darker(color, 35);
  const door = darker(color, 60);
  fratRowShapes.push(
    { type: "rect", x: dx - 33, y: -20, w: 66, h: 52, color: "rgba(0,0,0,0.18)", radius: 2 },
    { type: "rect", x: dx - 32, y: -24, w: 64, h: 52, color, radius: 2 },
    { type: "rect", x: dx - 35, y: -31, w: 70, h: 9,  color: roof, radius: 1 },
    { type: "rect", x: dx - 8,  y:  14, w: 16, h: 14, color: door },
    { type: "text", x: dx, y: 38, text: name, color: "#fff",
      font: "bold 10px sans-serif",
      align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
  );
}

const fratRow: Entity = {
  id: "frat-row", x: 900, y: 1650, layer: 3,
  shapes: fratRowShapes,
  label: { text: "Frat Row", color: "#fff", font: "bold 14px sans-serif", offsetY: 60, shadow: { color: "rgba(0,0,0,0.9)", blur: 4 } },
  solid: true,
  hitbox:  { ox: -178, oy: -38, w: 356, h: 100 },
  trigger: { type: "zone", name: "Frat Row", hitbox: { ox: -200, oy: -60, w: 400, h: 150 } },
};

// ═══════════════════════════════════════════════════════════════════════════
// SOUTH — Dorms
// ═══════════════════════════════════════════════════════════════════════════

const dorms: Entity = {
  id: "dorms", x: 1800, y: 2110, layer: 3,
  shapes: [
    { type: "rect", x: -86, y: -38, w: 70, h: 54, color: "rgba(0,0,0,0.14)", radius: 3 },
    { type: "rect", x: -90, y: -42, w: 70, h: 54, color: "#8d6e63", radius: 3 },
    { type: "rect", x: -94, y: -48, w: 78, h: 8, color: "#6d4c41", radius: 2 },
    { type: "rect", x: -61, y: -2, w: 12, h: 14, color: "#5d4037" },

    { type: "rect", x: 20, y: -38, w: 70, h: 54, color: "rgba(0,0,0,0.14)", radius: 3 },
    { type: "rect", x: 16, y: -42, w: 70, h: 54, color: "#8d6e63", radius: 3 },
    { type: "rect", x: 12, y: -48, w: 78, h: 8, color: "#6d4c41", radius: 2 },
    { type: "rect", x: 45, y: -2, w: 12, h: 14, color: "#5d4037" },
  ],
  label: {
    text: "Dorms", color: "#fff", font: "bold 13px sans-serif",
    offsetY: 28, shadow: { color: "rgba(0,0,0,0.9)", blur: 4 },
  },
  solid: true,
  hitbox: { ox: -90, oy: -48, w: 180, h: 60 },
  trigger: { type: "zone", name: "Dorms", hitbox: { ox: -122, oy: -78, w: 244, h: 122 } },
};

// ═══════════════════════════════════════════════════════════════════════════
// SOUTHWEST — Friend Group Garages
// ═══════════════════════════════════════════════════════════════════════════

const friendGarageClusterBase: Entity[] = [];

const garageRoster = [
  { name: "Ani", color: "#ef6c57" },
  { name: "Shrey", color: "#7e57c2" },
  { name: "Riya", color: "#ec407a" },
  { name: "Monica", color: "#5c6bc0" },
  { name: "Sanjana", color: "#26a69a" },
  { name: "Jake", color: "#8d6e63" },
  { name: "Suraj", color: "#ffa726" },
  { name: "Arnav", color: "#42a5f5" },
  { name: "Sarah", color: "#ab47bc" },
  { name: "Sarthak", color: "#66bb6a" },
  { name: "Arav", color: "#ff7043" },
  { name: "Sithu", color: "#78909c" },
];

const friendGarages: Entity[] = SHOW_FRIEND_GARAGES
  ? [
      ...friendGarageClusterBase,
      ...garageRoster.flatMap((garage, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        return garageEntities(
          `garage-${garage.name.toLowerCase()}`,
          620 + col * 124,
          2060 + row * 104,
          garage.name,
          garage.color
        );
      }),
    ]
  : [];

// ═══════════════════════════════════════════════════════════════════════════
// SOUTHEAST — Downtown bars & Jukebox
// ═══════════════════════════════════════════════════════════════════════════

const tots       = bldg("tots",        2400, 1950,  85, 60, "#37474f", "TOTS");
const hokieHouse = bldg("hokie-house", 2550, 1950,  90, 65, "#861F41", "Hokie House");
const bennys     = bldg("bennys",      2700, 1950,  85, 60, "#c62828", "Benny's Pizza");

const theBurg    = bldg("the-burg",    2400, 2150,  90, 60, "#795548", "The Burg");
const wildSide   = bldg("wild-side",   2550, 2150,  95, 65, "#2e7d32", "Wild Side");
const bww        = bldg("bww",         2700, 2150, 105, 70, "#f9a825", "Buffalo Wild Wings");

const library: Entity = {
  id: "library", x: 2050, y: 2050, layer: 3,
  shapes: [
    { type: "rect", x: -63, y: -47, w: 130, h: 100, color: "rgba(0,0,0,0.18)", radius: 4 },
    { type: "rect", x: -60, y: -50, w: 124, h: 96,  color: "#37474f", radius: 4 },
    { type: "rect", x: -63, y: -58, w: 130, h: 11,  color: "#263238", radius: 3 },
    // Corinthian columns
    { type: "rect", x: -44, y: -50, w: 7, h: 96, color: "rgba(255,255,255,0.14)", radius: 1 },
    { type: "rect", x: -22, y: -50, w: 7, h: 96, color: "rgba(255,255,255,0.14)", radius: 1 },
    { type: "rect", x:   0, y: -50, w: 7, h: 96, color: "rgba(255,255,255,0.14)", radius: 1 },
    { type: "rect", x:  22, y: -50, w: 7, h: 96, color: "rgba(255,255,255,0.14)", radius: 1 },
    { type: "rect", x:  44, y: -50, w: 7, h: 96, color: "rgba(255,255,255,0.14)", radius: 1 },
    // Double front doors
    { type: "rect", x: -13, y:  12, w: 12, h: 34, color: "#1c2831", radius: 1 },
    { type: "rect", x:   1, y:  12, w: 12, h: 34, color: "#1c2831", radius: 1 },
    // Windows
    { type: "rect", x: -50, y: -32, w: 12, h: 16, color: "rgba(180,220,255,0.32)", radius: 1 },
    { type: "rect", x: -28, y: -32, w: 12, h: 16, color: "rgba(180,220,255,0.32)", radius: 1 },
    { type: "rect", x:  28, y: -32, w: 12, h: 16, color: "rgba(180,220,255,0.32)", radius: 1 },
    { type: "rect", x:  50, y: -32, w: 12, h: 16, color: "rgba(180,220,255,0.32)", radius: 1 },
  ],
  label: { text: "Library", color: "#fff", font: "bold 14px sans-serif", offsetY: 62, shadow: { color: "rgba(0,0,0,0.9)", blur: 4 } },
  solid: true,
  hitbox:  { ox: -64, oy: -60, w: 128, h: 112 },
  trigger: { type: "zone", name: "Library", hitbox: { ox: -90, oy: -80, w: 180, h: 160 } },
};

const jukebox: Entity = {
  id: "jukebox", x: 2870, y: 2050, layer: 3,
  shapes: [
    { type: "rect", x: -17, y: -15, w: 34, h: 34, color: "rgba(0,0,0,0.15)", radius: 4 },
    { type: "rect", x: -14, y: -18, w: 28, h: 36, color: "#4a148c", radius: 4 },
    { type: "rect", x: -12, y: -24, w: 24, h: 8,  color: "#7b1fa2", radius: 4 },
    {
      type: "text", x: 0, y: -30, text: "♫", color: "#e040fb",
      font: "16px sans-serif",
      align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
    },
  ],
  label: { text: "Jukebox", color: "#e040fb", font: "bold 14px sans-serif", offsetY: 28, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
  solid: true,
  hitbox:  { ox: -16, oy: -26, w: 32, h: 44 },
  trigger: { type: "jukebox", name: "Jukebox", hitbox: { ox: -50, oy: -50, w: 100, h: 100 } },
};

// ═══════════════════════════════════════════════════════════════════════════
// SE QUADRANT — Lane Stadium, Cassell Coliseum & Airport
// ═══════════════════════════════════════════════════════════════════════════

const laneStadium: Entity = {
  id: "lane-stadium", x: 2550, y: 2450, layer: 3,
  shapes: [
    { type: "rect",    x: -150, y: -100, w: 300, h: 200, color: "rgba(0,0,0,0.2)",  radius: 10 },
    { type: "rect",    x: -140, y: -90,  w: 280, h: 180, color: "#861F41",           radius: 10 },
    { type: "rect",    x: -110, y: -60,  w: 220, h: 120, color: "#b0bec5",           radius: 5  },
    { type: "rect",    x:  -90, y: -40,  w: 180, h: 80,  color: "#2e7d32"                       },
    { type: "line",    x1: 0,   y1: -40, x2: 0, y2: 40,  color: "#fff", width: 3                },
  ],
  label: { text: "Lane Stadium", color: "#fff", font: "bold 16px sans-serif", offsetY: 118, shadow: { color: "#000", blur: 4 } },
  solid: true,
  hitbox:  { ox: -150, oy: -100, w: 300, h: 200 },
  trigger: { type: "zone", name: "Lane Stadium", hitbox: { ox: -190, oy: -140, w: 380, h: 280 } },
};

const cassellColiseum: Entity = {
  id: "cassell-coliseum", x: 1860, y: 2600, layer: 3,
  shapes: [
    { type: "ellipse", x: 4,  y: 4,  rx: 118, ry: 88, color: "rgba(0,0,0,0.28)" },
    { type: "ellipse", x: 0,  y: 0,  rx: 118, ry: 88, color: "#861F41" },
    { type: "ellipse", x: 0,  y: 0,  rx:  96, ry: 70, color: "#5a1230" },
    { type: "ellipse", x: 0,  y: 0,  rx:  68, ry: 49, color: "#c8904a" },
    { type: "line",    x1: -56, y1: 0, x2: 56, y2: 0, color: "#fff",       width: 2 },
  ],
  label: { text: "Cassell Coliseum", color: "#fff", font: "bold 14px sans-serif", offsetY: 102, shadow: { color: "#000", blur: 5 } },
  solid: true,
  hitbox:  { ox: -118, oy: -88, w: 236, h: 176 },
  trigger: { type: "zone", name: "Cassell Coliseum", hitbox: { ox: -148, oy: -118, w: 296, h: 236 } },
};

const airportTerminal: Entity = {
  id: "airport-terminal", x: 1050, y: 2520, layer: 3,
  shapes: [
    { type: "rect", x: -146, y: -54, w: 292, h: 114, color: "rgba(0,0,0,0.16)", radius: 16 },
    { type: "rect", x: -138, y: -60, w: 276, h: 104, color: "#d8e1ea", radius: 18, stroke: "#78909c", lineWidth: 2 },
    { type: "rect", x: -118, y: -42, w: 236, h: 64, color: "#90a4ae", radius: 12 },
    { type: "rect", x: -108, y: -34, w: 216, h: 52, color: "#cfe8ff", radius: 10, alpha: 0.9 },
    { type: "rect", x: -66, y: 18, w: 132, h: 18, color: "#78909c", radius: 8 },
    { type: "rect", x: -22, y: -84, w: 44, h: 26, color: "#eceff1", radius: 10, stroke: "#607d8b", lineWidth: 2 },
    {
      type: "text", x: 0, y: -71, text: "✈️", color: "#1565c0",
      font: "bold 22px sans-serif",
      align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
      shadow: { color: "rgba(21,101,192,0.28)", blur: 10 },
    },
    {
      type: "text", x: -62, y: 6, text: "MIA", color: "#0f172a",
      font: "bold 10px sans-serif",
      align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
    },
    {
      type: "text", x: 0, y: 6, text: "SJU", color: "#0f172a",
      font: "bold 10px sans-serif",
      align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
    },
    {
      type: "text", x: 62, y: 6, text: "CUN", color: "#0f172a",
      font: "bold 10px sans-serif",
      align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
    },
  ],
  label: { text: "Airport", color: "#fff", font: "bold 18px sans-serif", offsetY: 56, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
  solid: false,
};

const airportTriggers: Entity[] = [
  { id: "airport-mia", x: 988, y: 2548, layer: 5, shapes: [], trigger: { type: "airport", name: "Miami", destination: "miami", hitbox: { ox: -36, oy: -26, w: 72, h: 52 } } },
  { id: "airport-sju", x: 1050, y: 2548, layer: 5, shapes: [], trigger: { type: "airport", name: "Puerto Rico", destination: "puerto-rico", hitbox: { ox: -36, oy: -26, w: 72, h: 52 } } },
  { id: "airport-cun", x: 1112, y: 2548, layer: 5, shapes: [], trigger: { type: "airport", name: "Cancun", destination: "cancun", hitbox: { ox: -36, oy: -26, w: 72, h: 52 } } },
];

// ═══════════════════════════════════════════════════════════════════════════
// ROAD NETWORK
// ═══════════════════════════════════════════════════════════════════════════

const roads: Entity[] = [
  // Ring Road around Drillfield
  road("rd-ring", [1350, 1350, 2250, 1350, 2250, 2250, 1350, 2250, 1350, 1350]),

  // Outbound Highways (Cleared to boundaries)
  road("rd-north", [1800, 1350, 1800, 380]),
  road("rd-south", [1600, 2250, 1600, 3220]),
  road("rd-east",  [2250, 1800, 3300, 1800]),
  road("rd-west",  [1350, 1800, 300, 1800]),

  // Internal Spurs
  road("rd-nw",    [1350, 1350, 1120, 1120, 980, 980, 960, 720]),
  road("rd-ne",    [2250, 1350, 2250, 950,  2900, 950]),
  road("rd-bars",  [2250, 2050, 2800, 2050]),
  road("rd-library", [2250, 2050, 2125, 2050]),
  road("rd-athletics", [2250, 2250, 2250, 2480, 2140, 2650]),
  road("rd-airport-sw", [1350, 2250, 1185, 2335, 1050, 2400]),
];

// ═══════════════════════════════════════════════════════════════════════════
// HIGHWAY EXITS
// ═══════════════════════════════════════════════════════════════════════════

const highways: Entity[] = [
  hwy("hwy-dc",       1700, 380,  "dc",        "DC"),
  hwy("hwy-nyc",      1900, 380,  "nyc",       "NYC"),
  hwy("hwy-tenn",      300, 1800, "tennessee", "Tennessee"),
  hwy("hwy-richmond", 3300, 1700, "richmond",  "Richmond"),
  hwy("hwy-uva",      3300, 1900, "uva",       "UVA"),
  hwy("hwy-nc",       1600, 3220, "nc",        "NC"),
];

// ═══════════════════════════════════════════════════════════════════════════
// MAP EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const vtIsland: MapData = {
  id: "vt-island", name: "VT Island",
  worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: 2000,
  spawnRotation: -Math.PI / 2,
  bgColor: "#0e4a7a",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: IRX, ry: IRY },
  entities: [
    ocean, island, drillfield,
    cascades, dragonsTooth,
    ...roads,
    theSpot, abcStore,
    theHub, alight, collegiate, edges,
    library,
    tots, hokieHouse, bennys,
    theBurg, wildSide, bww, jukebox,
    laneStadium, cassellColiseum, airportTerminal, ...airportTriggers,
    fratRow, graveyard,
    dorms,
    ...friendGarages,
    ...highways,
  ],
  items: [],
  npcs: [
    { id: "milo", name: "Milo", spawnX: CX, spawnY: CY - 95, speed: 0, wanderRadius: 0, spriteSrc: "/images/milo.png", spriteScale: 1.28, bodyColor: "#1a1a1a", accentColor: "#ffffff" },
  ],
};
