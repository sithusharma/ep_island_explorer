// ---------------------------------------------------------------------------
// Tennessee Island — rustic mountain retreat with cabin, coaster & concert
// ---------------------------------------------------------------------------

import type { Entity, MapData, Shape } from "../types";

const W  = 2000;
const CX = W / 2;   // 1000
const CY = W / 2;   // 1000

// ── Utilities ─────────────────────────────────────────────────────────────

/** Winding scenic road */
function road(id: string, pts: number[]): Entity {
  return {
    id, x: 0, y: 0, layer: 2,
    shapes: [
      { type: "polyline", points: pts, color: "rgba(0,0,0,0.14)", width: 48, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#5d4e37",           width: 42, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#ffca28",           width: 2,  dash: [14, 10], cap: "butt", join: "round" },
    ],
  };
}

// ── Base terrain ──────────────────────────────────────────────────────────

const ocean: Entity = {
  id: "ocean", x: 0, y: 0, layer: 0,
  shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#1a3a5e" }],
};

const island: Entity = {
  id: "island", x: 0, y: 0, layer: 0,
  shapes: [
    { type: "ellipse", x: CX, y: CY, rx: 930, ry: 872, color: "#c5a87a" },   // Shore
    { type: "ellipse", x: CX, y: CY, rx: 918, ry: 860, color: "#4caf50" },   // Grass
    { type: "ellipse", x: CX, y: CY - 180, rx: 720, ry: 560, color: "#3d8b40", alpha: 0.4 }, // Dense northern forest
  ],
};

// ── Mountain range (north) ────────────────────────────────────────────────

const mountains: Entity[] = [
  // Main centre peak
  {
    id: "mtn-main", x: CX, y: 330, layer: 1,
    shapes: [
      { type: "triangle", x1: -180, y1:  90, x2: 0, y2: -200, x3: 180, y3:  90, color: "#546e7a" },
      { type: "triangle", x1: -165, y1:  90, x2: 0, y2: -185, x3: 165, y3:  90, color: "#607d8b" },
      // Snow cap
      { type: "triangle", x1: -48, y1: -130, x2: 0, y2: -200, x3: 48, y3: -130, color: "#eceff1" },
      { type: "triangle", x1: -28, y1: -150, x2: 0, y2: -200, x3: 28, y3: -150, color: "#ffffff" },
    ],
  },
  // Left peak
  {
    id: "mtn-left", x: 740, y: 390, layer: 1,
    shapes: [
      { type: "triangle", x1: -140, y1: 70, x2: 0, y2: -150, x3: 140, y3: 70, color: "#607d8b" },
      { type: "triangle", x1: -38, y1: -90, x2: 0, y2: -150, x3: 38, y3: -90, color: "#eceff1" },
    ],
  },
  // Right peak
  {
    id: "mtn-right", x: 1245, y: 410, layer: 1,
    shapes: [
      { type: "triangle", x1: -130, y1: 65, x2: 0, y2: -140, x3: 130, y3: 65, color: "#546e7a" },
      { type: "triangle", x1: -32, y1: -82, x2: 0, y2: -140, x3: 32, y3: -82, color: "#eceff1" },
    ],
  },
  // Forest foreground patches
  {
    id: "forest", x: 0, y: 0, layer: 1,
    shapes: [
      { type: "ellipse", x: 720, y: 580, rx: 70, ry: 45, color: "#2e7d32", alpha: 0.7 },
      { type: "ellipse", x: 840, y: 560, rx: 55, ry: 38, color: "#388e3c", alpha: 0.6 },
      { type: "ellipse", x: 1180, y: 570, rx: 65, ry: 42, color: "#2e7d32", alpha: 0.7 },
      { type: "ellipse", x: 1300, y: 590, rx: 50, ry: 35, color: "#388e3c", alpha: 0.6 },
      { type: "ellipse", x: 900, y: 530, rx: 40, ry: 30, color: "#1b5e20", alpha: 0.5 },
    ],
  },
];

// ── Roads ─────────────────────────────────────────────────────────────────

const roads: Entity[] = [
  road("main-ns",   [CX,  240, CX, 1760]),      // N–S spine
  road("main-ew",   [240, CY, 1760,  CY]),      // E–W cross
  road("scenic-w",  [700, CY, 460, 1100, 380, 1360]), // Scenic western loop
  road("concert-east", [1290, CY, 1515, 1018, 1710, 1030]), // Eastern concert spur
];

// ── Cabin ─────────────────────────────────────────────────────────────────
// Detailed wooden log cabin with roof, chimney, porch and smoke

const cabinShapes: Shape[] = [
  // Porch deck
  { type: "rect", x: -45, y: 28, w: 90, h: 18, color: "#4e342e", radius: 1 },
  // Log walls
  { type: "rect", x: -40, y: -32, w: 80, h: 68, color: "#6d4c41", radius: 2 },
  // Horizontal log-line texture
  { type: "line", x1: -40, y1: -16, x2: 40, y2: -16, color: "#4e342e", width: 2 },
  { type: "line", x1: -40, y1:   0, x2: 40, y2:   0, color: "#4e342e", width: 2 },
  { type: "line", x1: -40, y1:  16, x2: 40, y2:  16, color: "#4e342e", width: 2 },
  // Left window
  { type: "rect", x: -32, y: -22, w: 18, h: 14, color: "#80deea", radius: 1 },
  { type: "line", x1: -23, y1: -22, x2: -23, y2: -8, color: "#4e342e", width: 1 },
  // Right window
  { type: "rect", x: 14, y: -22, w: 18, h: 14, color: "#80deea", radius: 1 },
  { type: "line", x1: 23, y1: -22, x2: 23, y2: -8, color: "#4e342e", width: 1 },
  // Door
  { type: "rect", x: -9, y: 8, w: 18, h: 28, color: "#3e2723", radius: 1 },
  { type: "circle", x: 6, y: 22, r: 2, color: "#ffd54f" },    // Door knob
  // Roof
  { type: "triangle", x1: -48, y1: -32, x2: 0, y2: -68, x3: 48, y3: -32, color: "#3e2723" },
  { type: "triangle", x1: -44, y1: -32, x2: 0, y2: -63, x3: 44, y3: -32, color: "#4e342e" },
  // Chimney
  { type: "rect", x: 18, y: -82, w: 14, h: 26, color: "#616161", radius: 1 },
  { type: "rect", x: 16, y: -86, w: 18, h: 5,  color: "#757575", radius: 1 },
  // Smoke puffs
  { type: "ellipse", x: 25, y: -96, rx: 9,  ry: 7, color: "rgba(200,200,200,0.40)" },
  { type: "ellipse", x: 29, y: -110, rx: 7, ry: 6, color: "rgba(200,200,200,0.28)" },
  { type: "ellipse", x: 24, y: -122, rx: 5, ry: 4, color: "rgba(200,200,200,0.18)" },
  // Porch railing
  { type: "line", x1: -45, y1: 28, x2: -45, y2: 44, color: "#5d4037", width: 2 },
  { type: "line", x1:  45, y1: 28, x2:  45, y2: 44, color: "#5d4037", width: 2 },
  { type: "line", x1: -45, y1: 38, x2:  45, y2: 38, color: "#5d4037", width: 2 },
];

const cabin: Entity = {
  id: "cabin", x: 648, y: 938, layer: 3,
  shapes: cabinShapes,
  label: { text: "The Cabin", color: "#ffe0b2", font: "bold 13px sans-serif", offsetY: 64, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
  solid: true,
  hitbox:  { ox: -46, oy: -88, w: 92, h: 148 },
  trigger: { type: "zone", name: "The Cabin", hitbox: { ox: -70, oy: -105, w: 140, h: 195 } },
};

// ── Mountain Coaster ───────────────────────────────────────────────────────
// Winding silver track descending from the mountain peaks.
// Entity positioned at centre of the track extent (1000, 600).
// All shape coordinates are relative to that centre.
//
// Absolute path: (990,360)→(1110,455)→(920,555)→(1130,645)→(880,755)→(1005,835)
// Relative (entity at 1000,600):
//   (-10,-240) → (110,-145) → (-80,-45) → (130,45) → (-120,155) → (5,235)

const coasterPath = [-10, -240, 110, -145, -80, -45, 130, 45, -120, 155, 5, 235];
// Rail offsets: left rail -5px x, right rail +5px x per point
const railL = coasterPath.map((v, i) => (i % 2 === 0 ? v - 5 : v));
const railR = coasterPath.map((v, i) => (i % 2 === 0 ? v + 5 : v));

const mountainCoaster: Entity = {
  id: "mountain-coaster", x: 1000, y: 600, layer: 2,
  shapes: [
    // Track bed (wide, dark base)
    { type: "polyline", points: coasterPath, color: "#455a64", width: 12, cap: "round", join: "round" },
    // Left rail (silver)
    { type: "polyline", points: railL, color: "#b0bec5", width: 3, cap: "round", join: "round" },
    // Right rail (silver)
    { type: "polyline", points: railR, color: "#b0bec5", width: 3, cap: "round", join: "round" },
    // Support towers at each bend
    { type: "line", x1: 110, y1: -145, x2: 110, y2: -240, color: "#78909c", width: 3 },
    { type: "line", x1: -80, y1:  -45, x2: -80, y2: -145, color: "#78909c", width: 3 },
    { type: "line", x1: 130, y1:   45, x2: 130, y2:  -45, color: "#78909c", width: 3 },
    { type: "line", x1: -120, y1: 155, x2: -120, y2:  45, color: "#78909c", width: 3 },
    // Top station (loading platform)
    { type: "rect", x: -22, y: -250, w: 24, h: 16, color: "#546e7a", radius: 2 },
    // Bottom station
    { type: "rect", x: -8,  y:  232, w: 26, h: 16, color: "#546e7a", radius: 2 },
  ],
  label: { text: "Mountain Coaster", color: "#cfd8dc", font: "bold 12px sans-serif", offsetY: 254, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
  trigger: { type: "zone", name: "Mountain Coaster", hitbox: { ox: -150, oy: -265, w: 300, h: 530 } },
};

// ── Dollywood ─────────────────────────────────────────────────────────────
// Bright theme-park cluster with rides, booths, coaster loop, and midway.

const dollywood: Entity = {
  id: "dollywood", x: 1328, y: 1230, layer: 3,
  shapes: [
    // Midway paving
    { type: "ellipse", x: 0, y: 16, rx: 150, ry: 100, color: "rgba(255,224,130,0.42)" },
    { type: "ellipse", x: 4, y: 20, rx: 128, ry: 78, color: "rgba(255,245,157,0.35)" },
    // Colorful ticket gate
    { type: "rect", x: -72, y: 45, w: 144, h: 34, color: "#7b1fa2", radius: 4 },
    { type: "rect", x: -62, y: 30, w: 124, h: 20, color: "#fdd835", radius: 3 },
    { type: "text", x: 0, y: 40, text: "DOLLYWOOD", color: "#4a148c",
      font: "bold 11px sans-serif",
      align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    // Ferris wheel
    { type: "circle", x: -82, y: -34, r: 42, color: "rgba(255,255,255,0.12)", stroke: "#ef5350", lineWidth: 5 },
    { type: "line", x1: -82, y1: -76, x2: -82, y2: 8, color: "#ffeb3b", width: 3 },
    { type: "line", x1: -124, y1: -34, x2: -40, y2: -34, color: "#29b6f6", width: 3 },
    { type: "line", x1: -112, y1: -64, x2: -52, y2: -4, color: "#ab47bc", width: 3 },
    { type: "line", x1: -52, y1: -64, x2: -112, y2: -4, color: "#66bb6a", width: 3 },
    { type: "circle", x: -82, y: -34, r: 8, color: "#fff176" },
    // Roller coaster squiggle
    { type: "polyline", points: [4, -70, 32, -100, 64, -50, 96, -86, 130, -36], color: "#1565c0", width: 12, cap: "round", join: "round" },
    { type: "polyline", points: [4, -70, 32, -100, 64, -50, 96, -86, 130, -36], color: "#90caf9", width: 4, cap: "round", join: "round" },
    { type: "line", x1: 32, y1: -100, x2: 32, y2: -30, color: "#6d4c41", width: 3 },
    { type: "line", x1: 96, y1: -86, x2: 96, y2: -22, color: "#6d4c41", width: 3 },
    // Small ride tents and food booths
    { type: "triangle", x1: 36, y1: 8, x2: 68, y2: -32, x3: 100, y3: 8, color: "#ff7043" },
    { type: "rect", x: 42, y: 8, w: 52, h: 42, color: "#ffcc80", radius: 2 },
    { type: "triangle", x1: -28, y1: 8, x2: 0, y2: -28, x3: 28, y3: 8, color: "#26c6da" },
    { type: "rect", x: -24, y: 8, w: 48, h: 38, color: "#80deea", radius: 2 },
    { type: "circle", x: 112, y: 28, r: 22, color: "#ec407a" },
    { type: "circle", x: 112, y: 28, r: 11, color: "#fff176" },
  ],
  label: { text: "Dollywood", color: "#fff176", font: "bold 14px sans-serif", offsetY: 116, shadow: { color: "rgba(0,0,0,0.9)", blur: 4 } },
  solid: true,
  hitbox: { ox: -128, oy: -106, w: 272, h: 196 },
  trigger: { type: "zone", name: "Dollywood", hitbox: { ox: -170, oy: -128, w: 340, h: 256 } },
};

// ── Concert Stadium ────────────────────────────────────────────────────────
// Open-air amphitheatre with stage, lights, speaker towers and crowd pit.

const concertStadium: Entity = {
  id: "concert-stadium", x: 1720, y: 1030, layer: 3,
  shapes: [
    // Outer structure shadow
    { type: "rect", x: -148, y: -98, w: 296, h: 196, color: "rgba(0,0,0,0.25)", radius: 14 },
    // Outer stadium walls
    { type: "rect", x: -145, y: -95, w: 290, h: 190, color: "#37474f", radius: 14 },
    // Seating bowl
    { type: "ellipse", x: 0, y: 12, rx: 118, ry: 72, color: "#455a64" },
    // Inner crowd pit / floor
    { type: "ellipse", x: 0, y: 14, rx: 94, ry: 56, color: "#2e7d32" },
    // Stage platform (back / north wall)
    { type: "rect", x: -55, y: -60, w: 110, h: 34, color: "#0d0d1a", radius: 3 },
    // Stage LED strip
    { type: "rect", x: -55, y: -62, w: 110, h: 5,  color: "#ff6f00", radius: 2 },
    // Stage lights
    { type: "circle", x: -38, y: -56, r: 7, color: "#ffd600" },
    { type: "circle", x:   0, y: -58, r: 9, color: "#fffde7" },
    { type: "circle", x:  38, y: -56, r: 7, color: "#ffd600" },
    // Speaker towers (left & right)
    { type: "rect", x: -136, y: -52, w: 14, h: 34, color: "#1a1a1a", radius: 2 },
    { type: "rect", x:  122, y: -52, w: 14, h: 34, color: "#1a1a1a", radius: 2 },
    // Speaker grilles
    { type: "rect", x: -134, y: -50, w: 10, h: 28, color: "#212121", radius: 1 },
    { type: "rect", x:  124, y: -50, w: 10, h: 28, color: "#212121", radius: 1 },
  ],
  label: { text: "Concert Stadium", color: "#fff", font: "bold 14px sans-serif", offsetY: 110, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
  solid: true,
  hitbox:  { ox: -148, oy: -98, w: 296, h: 196 },
  trigger: { type: "zone", name: "Concert Stadium", hitbox: { ox: -175, oy: -125, w: 350, h: 250 } },
};

// ── Return trigger ─────────────────────────────────────────────────────────

const returnTrigger: Entity = {
  id: "return", x: CX, y: CY + 640, layer: 5,
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

export const tennesseeMap: MapData = {
  id: "tennessee", name: "Tennessee",
  worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY + 180,
  spawnRotation: -Math.PI / 2,
  bgColor: "#1a3a5e",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 915, ry: 855 },
  entities: [
    ocean, island,
    ...mountains,
    ...roads,
    cabin,
    mountainCoaster,
    dollywood,
    concertStadium,
    returnTrigger,
  ],
  items: [], npcs: [],
};
