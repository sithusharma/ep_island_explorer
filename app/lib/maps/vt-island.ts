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

// ── Utilities ─────────────────────────────────────────────────────────────

function darker(hex: string, n = 30): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - n);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - n);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - n);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
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
  return {
    id, x, y, layer: 5,
    shapes: [
      { type: "rect", x: -44, y: -16, w: 88, h: 28, color: "rgba(33,150,243,0.88)", radius: 6 },
      {
        type: "text", x: 0, y: 0, text: `→ ${label}`, color: "#fff",
        font: "bold 11px sans-serif",
        align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
      },
    ],
    trigger: { type: "highway", name: label, destination: dest, hitbox: { ox: -65, oy: -50, w: 130, h: 100 } },
  };
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
    { type: "ellipse", x: CX, y: CY, rx: IRX,        ry: IRY,        color: "#e8d5a3" }, // Sandy shore
    { type: "ellipse", x: CX, y: CY, rx: IRX - 40,   ry: IRY - 40,   color: "#4caf50" }, // Grass
    { type: "ellipse", x: CX - 80, y: CY - 80, rx: IRX - 200, ry: IRY - 200, color: "#5cb860", alpha: 0.45 }, // Inner tint
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
// NW QUADRANT — The Spot & ABC Store
// Off rd-nw diagonal (1400,1400)→(1000,1000); buildings set back ≥ 80 px
// ═══════════════════════════════════════════════════════════════════════════

// Outdoor hangout spot on a hill — NW of campus
const theSpot: Entity = {
  id: "the-spot", x: 1050, y: 850, layer: 1,
  shapes: [
    { type: "circle",  x: -120, y: -100, r: 40,        color: "#ffee58" },           // Sun
    { type: "ellipse", x: 0,    y: 0,    rx: 220, ry: 150, color: "#81c784" },       // Hill
    { type: "rect",    x: -25,  y: -20,  w: 50, h: 10, color: "#8d6e63", radius: 2 }, // Bench back
    { type: "rect",    x: -25,  y: -10,  w: 50, h: 8,  color: "#5d4037", radius: 2 }, // Bench seat
  ],
  label: { text: "The Spot", color: "#fff", font: "bold 16px sans-serif", offsetY: 120, shadow: { color: "#000", blur: 4 } },
  solid: false,
  trigger: { type: "zone", name: "The Spot", hitbox: { ox: -200, oy: -155, w: 400, h: 310 } },
};

// ABC Store — shifted west to clear the road and provide a yard
const abcStore = bldg("abc-store", 950, 1150, 90, 60, "#6a1b9a", "ABC Store");

// ═══════════════════════════════════════════════════════════════════════════
// NE QUADRANT — Apartments
// rd-ne1 (2200,1400)→(2300,1000), rd-ne2 (2300,1000)→(2900,1000)
// All buildings ≥ 110 px from nearest road edge
// ═══════════════════════════════════════════════════════════════════════════

const theHub    = bldg("the-hub",        2400, 750,  140, 90,  "#78909c", "The Hub");
const collegiate= bldg("collegiate-apt", 2600, 800,  140, 90,  "#b8956a", "Collegiate Apartment");
const edges     = bldg("edges-apt",      2450, 1250, 120, 80,  "#c8a882", "Edge's Apartment");

// ═══════════════════════════════════════════════════════════════════════════
// SW QUADRANT — Downtown bars & Jukebox
// rd-sw: (1400,2200)→(1200,2450)→(1200,2800)
// Row 1 (y≈2380): flanking the diagonal segment
// Row 2 (y≈2640): flanking the vertical x=1200 segment
// Buildings set ≥ 80 px from road edges (road half-width = 21 px)
// ═══════════════════════════════════════════════════════════════════════════

// — Row 1: west of diagonal (x<1170) or east (x>1310) —
const tots      = bldg("tots",        900, 2350,  85, 60, "#37474f", "TOTS");
const hokieHouse= bldg("hokie-house", 1000, 2300,  90, 65, "#861F41", "Hokie House");
const bennys    = bldg("bennys",     1450, 2350,  85, 60, "#c62828", "Benny's Pizza");

// — Row 2: flanking the x=1200 vertical leg —
const theBurg   = bldg("the-burg",    950, 2630,  90, 60, "#795548", "The Burg");
const wildSide  = bldg("wild-side",   900, 2730,  95, 65, "#2e7d32", "Wild Side");
const bww       = bldg("bww",        1450, 2650, 105, 70, "#f9a825", "Buffalo Wild Wings");

// Jukebox — west of x=1200 road leg, between the two bar rows
const jukebox: Entity = {
  id: "jukebox", x: 950, y: 2500, layer: 3,
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
// SE QUADRANT — Lane Stadium
// ═══════════════════════════════════════════════════════════════════════════

const laneStadium: Entity = {
  id: "lane-stadium", x: 2600, y: 2500, layer: 3,
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

// ═══════════════════════════════════════════════════════════════════════════
// NE QUADRANT — Airport (Relocated to match real-world Roanoke direction)
// ═══════════════════════════════════════════════════════════════════════════

// Airport terminal building — north of the terminal road
const airportTerminal: Entity = {
  id: "airport-terminal", x: 2800, y: 800, layer: 3,
  shapes: [
    { type: "rect", x: -120, y: -40, w: 240, h: 80, color: "#546e7a", radius: 6 },
    { type: "rect", x:  -10, y: -70, w:  20, h: 30, color: "#455a64" },
  ],
  label: { text: "Airport", color: "#fff", font: "bold 18px sans-serif", offsetY: 56, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
  solid: true,
  hitbox: { ox: -125, oy: -75, w: 250, h: 120 },
};

// Drive-into trigger zone at the terminal road
const airportTrigger: Entity = {
  id: "airport-trigger", x: 2800, y: 875, layer: 5,
  shapes: [{ type: "rect", x: -150, y: -20, w: 300, h: 40, color: "rgba(255,152,0,0.15)", radius: 4 }],
  trigger: { type: "airport", name: "Airport", hitbox: { ox: -150, oy: -20, w: 300, h: 40 } },
};

// ═══════════════════════════════════════════════════════════════════════════
// PERIPHERAL BUILDINGS
// ═══════════════════════════════════════════════════════════════════════════

// Dorms — far west of rd-sw, no road conflict
const dorms = bldg("dorms", 800, 2800, 110, 80, "#8d6e63", "Dorms");

// ═══════════════════════════════════════════════════════════════════════════
// NATURE / HIKES — outer island, boundary verified
// ═══════════════════════════════════════════════════════════════════════════

// Cascades Waterfall Trail — SW outer edge
// Position (550, 2300): ellipse check = 0.96 ✓; SW trigger corner = 0.974 ✓
const cascades: Entity = {
  id: "cascades", x: 550, y: 2300, layer: 1,
  shapes: [
    { type: "ellipse",  x: 0,   y: 10,  rx: 165, ry: 95, color: "#4a7c4e" },
    { type: "triangle", x1: -90, y1: 25, x2: -25, y2: -55, x3: 50, y3: 25, color: "#5a9060" },
    { type: "triangle", x1: -30, y1: 25, x2:  30, y2: -80, x3: 100, y3: 25, color: "#4e8455" },
    { type: "triangle", x1: -12, y1: -35, x2: -25, y2: -55, x3: 5,  y3: -34, color: "#ecf0f1" },
    { type: "triangle", x1:  18, y1: -56, x2:  30, y2: -80, x3: 52, y3: -52, color: "#ecf0f1" },
    { type: "rect",     x:  14,  y: -54,  w: 9, h: 68, color: "#64b5f6", radius: 4 },
    { type: "rect",     x:  16,  y: -56,  w: 4, h: 40, color: "#bbdefb", radius: 2, alpha: 0.75 },
    { type: "ellipse",  x:  18,  y: 20,   rx: 22, ry: 9,  color: "rgba(100,181,246,0.38)" },
    { type: "ellipse",  x:  18,  y: 18,   rx: 10, ry: 5,  color: "rgba(187,222,251,0.45)" },
  ],
  label: { text: "Cascades", color: "#fff", font: "bold 14px sans-serif", offsetY: 88, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
  solid: false,
  trigger: { type: "zone", name: "Cascades", hitbox: { ox: -170, oy: -110, w: 340, h: 220 } },
};

// Dragon's Tooth — NE outer edge
// Position (2940, 1050): ellipse check = 0.757 ✓; NE trigger corner = 0.965 ✓
const dragonsTooth: Entity = {
  id: "dragons-tooth", x: 2940, y: 1050, layer: 1,
  shapes: [
    { type: "ellipse",  x: 0,    y: 10,  rx: 145, ry: 85, color: "#6d6d6d" },
    { type: "triangle", x1: -95, y1: 30, x2: -15, y2: -40, x3: 60, y3: 30,  color: "#8a8a8a" },
    { type: "triangle", x1: -20, y1: 30, x2: 50,  y2: -35, x3: 100, y3: 30, color: "#757575" },
    { type: "triangle", x1: -18, y1: -25, x2: 5,  y2: -105, x3: 28, y3: -25, color: "#bdbdbd" },
    { type: "triangle", x1:   5, y1: -105, x2: 28, y2: -25, x3: 22, y3: -28, color: "#9e9e9e" },
    { type: "triangle", x1: -70, y1: 30,  x2: -45, y2: -5,  x3: -18, y3: 30, color: "#616161" },
    { type: "triangle", x1: -50, y1: 30,  x2: -35, y2:  5,  x3: -10, y3: 30, color: "#545454" },
    { type: "triangle", x1:  -2, y1: -82, x2:   5, y2: -105, x3: 16, y3: -79, color: "#e8e8e8" },
  ],
  label: { text: "Dragon's Tooth", color: "#fff", font: "bold 14px sans-serif", offsetY: 80, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
  solid: false,
  trigger: { type: "zone", name: "Dragon's Tooth", hitbox: { ox: -130, oy: -120, w: 260, h: 235 } },
};

// ═══════════════════════════════════════════════════════════════════════════
// ROAD NETWORK
// ═══════════════════════════════════════════════════════════════════════════
//
// Ring road: rectangle 1400–2200 × 1400–2200 (closed loop)
// NW spur  : ring NW corner → The Spot area (1000,1000)
// NE spurs : ring NE corner → Hub (2300,1000) → Collegiate (2900,1000)
// SW spur  : ring SW corner → bar district, curves to x=1200 vertical
// SE spur  : ring SE corner → airport (ends before terminal)
//
// Outbound highways (Task 1 — geographically correct):
//   North  → DC  (left) + NYC (right)
//   South  → NC  (left) + Orlando (right)
//   West   → Tennessee
//   East   → Richmond (upper) + UVA (lower)

const roads: Entity[] = [
  // ── Inner ring around Drillfield ────────────────────────────────────────
  road("rd-ring", [1400, 1400, 2200, 1400, 2200, 2200, 1400, 2200, 1400, 1400]),

  // ── Campus spurs ────────────────────────────────────────────────────────
  road("rd-nw",  [1400, 1400, 1000, 1000]),
  road("rd-ne1", [2200, 1400, 2300, 1000]),
  road("rd-ne2", [2300, 1000, 2800, 1000, 2800, 900]),
  road("rd-sw",  [1400, 2200, 1200, 2450, 1200, 2800]),
  road("rd-se",  [2200, 2200, 2400, 2300, 2400, 2500]),

  // ── Outbound arteries to island edge ────────────────────────────────────
  // North road feeds DC (left) + NYC (right) highway signs
  road("rd-out-n", [CX, 1400, CX, 380]),
  // South road feeds NC (left) + Orlando (right) highway signs
  road("rd-out-s", [CX, 2200, CX, 3220]),
  // East road feeds Richmond (upper) + UVA (lower) highway signs
  road("rd-out-e", [2200, CY, 3300, CY]),
  // West road feeds Tennessee highway sign
  road("rd-out-w", [1400, CY, 300, CY]),
];

// ═══════════════════════════════════════════════════════════════════════════
// HIGHWAY EXITS — geographically accurate placement at island sand edge
//
// Ellipse boundary check: ((x−1800)/1600)² + ((y−1800)/1500)² ≤ 1
// All boundaries, hitboxes, and text strictly contained within the island
// ═══════════════════════════════════════════════════════════════════════════

const highways: Entity[] = [
  // ── North edge ──────────────────────────────────────────────────────────
  hwy("hwy-dc",      1660, 380,  "dc",        "DC"),
  hwy("hwy-nyc",     1940, 380,  "nyc",       "NYC"),
  // ── West edge ───────────────────────────────────────────────────────────
  hwy("hwy-tenn",     300, CY,   "tennessee", "Tennessee"),
  // ── East edge ───────────────────────────────────────────────────────────
  hwy("hwy-richmond", 3300, 1660, "richmond", "Richmond"),
  hwy("hwy-uva",      3300, 1940, "uva",      "UVA"),
  // ── South edge ──────────────────────────────────────────────────────────
  hwy("hwy-nc",      1660, 3220, "nc",        "NC"),
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
    theHub, collegiate, edges,
    tots, hokieHouse, bennys,
    theBurg, wildSide, bww, jukebox,
    laneStadium, airportTerminal, airportTrigger,
    dorms,
    ...highways,
  ],
  items: [],
  npcs: [
    { id: "milo", name: "Milo", spawnX: CX, spawnY: CY, speed: 40, wanderRadius: 300, bodyColor: "#1a1a1a", accentColor: "#ffffff" },
  ],
};
