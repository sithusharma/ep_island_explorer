// ---------------------------------------------------------------------------
// Richmond, VA — Expanded downtown island with a clear street wall
// ---------------------------------------------------------------------------

import type { Entity, MapData, Shape } from "../types";

const W  = 2200;
const CX = W / 2;
const CY = W / 2;

function dk(hex: string, n = 30): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - n);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - n);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - n);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function brickBldg(
  id: string, x: number, y: number,
  w: number, h: number,
  color: string, name: string,
): Entity {
  const roof = dk(color, 30);
  const door = dk(color, 55);
  const shapes: Shape[] = [
    { type: "rect", x: -(w / 2) + 3, y: -(h / 2) + 3, w, h, color: "rgba(0,0,0,0.20)", radius: 2 },
    { type: "rect", x: -(w / 2), y: -(h / 2), w, h, color, radius: 2 },
    { type: "rect", x: -(w / 2) - 2, y: -(h / 2) - 6, w: w + 4, h: 7, color: roof, radius: 2 },
    { type: "rect", x: -6, y: h / 2 - 16, w: 12, h: 16, color: door },
  ];
  const wc = Math.max(1, Math.floor((w - 18) / 18));
  const wr = Math.max(1, Math.floor((h - 28) / 18));
  for (let row = 0; row < wr; row++) {
    for (let col = 0; col < wc; col++) {
      shapes.push({
        type: "rect",
        x: -(w / 2) + 9 + col * 18, y: -(h / 2) + 12 + row * 18,
        w: 10, h: 12, color: "rgba(255,255,255,0.15)", radius: 1,
      });
    }
  }
  return {
    id, x, y, layer: 3, shapes,
    label: { text: name, color: "#fff", font: "bold 12px sans-serif", offsetY: h / 2 + 14, shadow: { color: "rgba(0,0,0,0.85)", blur: 3 } },
    solid: true,
    hitbox: { ox: -(w / 2) - 3, oy: -(h / 2) - 8, w: w + 6, h: h + 14 },
    trigger: { type: "zone", name, hitbox: { ox: -(w / 2) - 35, oy: -(h / 2) - 35, w: w + 70, h: h + 70 } },
  };
}

function officeBldg(
  id: string, x: number, y: number,
  w: number, h: number,
  color: string, name: string,
): Entity {
  const roof = dk(color, 28);
  const shapes: Shape[] = [
    { type: "rect", x: -(w / 2) + 4, y: -(h / 2) + 4, w, h, color: "rgba(0,0,0,0.16)", radius: 3 },
    { type: "rect", x: -(w / 2), y: -(h / 2), w, h, color, radius: 3 },
    { type: "rect", x: -(w / 2) - 3, y: -(h / 2) - 8, w: w + 6, h: 10, color: roof, radius: 2 },
  ];
  const cols = Math.max(2, Math.floor((w - 20) / 18));
  const rows = Math.max(2, Math.floor((h - 28) / 20));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      shapes.push({
        type: "rect",
        x: -(w / 2) + 10 + col * 18, y: -(h / 2) + 12 + row * 20,
        w: 10, h: 12, color: "rgba(200,230,255,0.35)", radius: 1,
      });
    }
  }
  return {
    id, x, y, layer: 3, shapes,
    label: { text: name, color: "#fff", font: "bold 12px sans-serif", offsetY: h / 2 + 14, shadow: { color: "rgba(0,0,0,0.85)", blur: 3 } },
    solid: true,
    hitbox: { ox: -(w / 2) - 4, oy: -(h / 2) - 9, w: w + 8, h: h + 16 },
    trigger: { type: "zone", name, hitbox: { ox: -(w / 2) - 34, oy: -(h / 2) - 34, w: w + 68, h: h + 68 } },
  };
}

function bgBldg(
  id: string, x: number, y: number,
  w: number, h: number,
  color: string,
): Entity {
  const roof = dk(color, 25);
  const shapes: Shape[] = [
    { type: "rect", x: -(w / 2) + 3, y: -(h / 2) + 3, w, h, color: "rgba(0,0,0,0.15)", radius: 2 },
    { type: "rect", x: -(w / 2), y: -(h / 2), w, h, color, radius: 2 },
    { type: "rect", x: -(w / 2) - 2, y: -(h / 2) - 5, w: w + 4, h: 6, color: roof, radius: 1 },
  ];
  const cols = Math.max(1, Math.floor((w - 14) / 14));
  const rows = Math.max(1, Math.floor((h - 20) / 16));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      shapes.push({
        type: "rect",
        x: -(w / 2) + 7 + col * 14, y: -(h / 2) + 10 + row * 16,
        w: 8, h: 10, color: "rgba(200,220,255,0.20)", radius: 1,
      });
    }
  }
  return {
    id, x, y, layer: 3, shapes,
    solid: true,
    hitbox: { ox: -(w / 2) - 2, oy: -(h / 2) - 6, w: w + 4, h: h + 10 },
  };
}

function corpBldg(
  id: string, x: number, y: number,
  w: number, h: number,
  bodyColor: string, accentColor: string, name: string,
  signText: string,
): Entity {
  const roof = dk(bodyColor, 30);
  const shapes: Shape[] = [
    { type: "rect", x: -(w / 2) + 4, y: -(h / 2) + 4, w, h, color: "rgba(0,0,0,0.22)", radius: 4 },
    { type: "rect", x: -(w / 2), y: -(h / 2), w, h, color: bodyColor, radius: 4 },
    { type: "rect", x: -(w / 2) - 3, y: -(h / 2) - 10, w: w + 6, h: 12, color: roof, radius: 3 },
    // sign band
    { type: "rect", x: -(w / 2), y: h / 2 - 22, w, h: 22, color: accentColor, radius: 2 },
    { type: "text", x: 0, y: h / 2 - 11, text: signText, color: "#fff",
      font: "bold 9px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
  ];
  const cols = Math.max(2, Math.floor((w - 20) / 18));
  const rows = Math.max(2, Math.floor((h - 38) / 20));
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      shapes.push({
        type: "rect",
        x: -(w / 2) + 10 + col * 18, y: -(h / 2) + 12 + row * 20,
        w: 10, h: 12, color: "rgba(200,230,255,0.30)", radius: 1,
      });
    }
  }
  return {
    id, x, y, layer: 3, shapes,
    label: { text: name, color: "#fff", font: "bold 12px sans-serif", offsetY: h / 2 + 14, shadow: { color: "rgba(0,0,0,0.9)", blur: 3 } },
    solid: true,
    hitbox: { ox: -(w / 2) - 4, oy: -(h / 2) - 12, w: w + 8, h: h + 18 },
  };
}

function road(id: string, pts: number[]): Entity {
  return {
    id, x: 0, y: 0, layer: 2,
    shapes: [
      { type: "polyline", points: pts, color: "rgba(0,0,0,0.12)", width: 48, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#5d4e37", width: 42, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#ffca28", width: 2, dash: [14, 10], cap: "butt", join: "round" },
    ],
  };
}

const river: Entity = {
  id: "river", x: 0, y: 0, layer: 0,
  shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#1c3a5e" }],
};

const island: Entity = {
  id: "island", x: 0, y: 0, layer: 0,
  shapes: [
    { type: "ellipse", x: CX, y: CY, rx: 860, ry: 780, color: "#d7a97b" },
    { type: "ellipse", x: CX, y: CY, rx: 840, ry: 760, color: "#c4a882" },
    { type: "ellipse", x: CX, y: CY, rx: 520, ry: 440, color: "#b89870", alpha: 0.40 },
  ],
};

const roads: Entity[] = [
  road("downtown-st", [360, 1120, 1840, 1120]),
  road("cross-ave", [1100, 500, 1100, 1710]),
  road("west-spur", [640, 1120, 640, 1490]),
  road("east-spur", [1560, 1120, 1560, 1490]),
  road("corp-st", [380, 960, 960, 960]),
  road("corp-spur", [640, 960, 640, 1120]),
];

const fancyShapes: Shape[] = [
  { type: "rect", x: -33, y: -93, w: 66, h: 186, color: "rgba(0,0,0,0.30)", radius: 3 },
  { type: "rect", x: -30, y: -90, w: 60, h: 180, color: "#fffde7", radius: 3 },
  { type: "rect", x: -34, y: -97, w: 68, h: 10, color: "#f9a825", radius: 2 },
  { type: "rect", x: -32, y: -18, w: 64, h: 6, color: "#f9a825" },
  { type: "rect", x: -6, y: -110, w: 12, h: 22, color: "#f9a825", radius: 1 },
  { type: "triangle", x1: -7, y1: -110, x2: 0, y2: -138, x3: 7, y3: -110, color: "#ffd54f" },
  { type: "circle", x: 0, y: -139, r: 3.5, color: "#ffca28" },
  { type: "rect", x: -10, y: 80, w: 20, h: 22, color: "#f9a825", radius: 2 },
];
for (let row = 0; row < 7; row++) {
  const wy = -78 + row * 22;
  for (const wx of [-18, 6]) {
    fancyShapes.push({ type: "rect", x: wx, y: wy, w: 12, h: 16, color: "#b3e5fc", radius: 4 });
  }
}

const fancyBuilding: Entity = {
  id: "fancy-building", x: CX, y: 825, layer: 3,
  shapes: fancyShapes,
  label: {
    text: "The Fancy Building", color: "#ffd54f",
    font: "bold 13px sans-serif", offsetY: 108,
    shadow: { color: "rgba(0,0,0,0.9)", blur: 4 },
  },
  solid: true,
  hitbox: { ox: -34, oy: -142, w: 68, h: 244 },
  trigger: { type: "zone", name: "The Fancy Building", hitbox: { ox: -60, oy: -155, w: 120, h: 285 } },
};

const downtown: Entity[] = [
  officeBldg("city-center", 560, 1025, 110, 88, "#8b6b4f", "City Center"),
  officeBldg("bank-tower", 720, 1018, 96, 96, "#76604a", "Bank Tower"),
  officeBldg("commerce-hall", 900, 1020, 112, 92, "#9b7b5b", "Commerce Hall"),
  officeBldg("canal-offices", 1270, 1018, 104, 90, "#6f5b4b", "Canal Offices"),
  officeBldg("brown-block", 1450, 1022, 96, 88, "#8c6548", "Brown Block"),
  officeBldg("river-exchange", 1625, 1018, 116, 96, "#7a553d", "River Exchange"),
  brickBldg("carytown", 560, 1218, 104, 60, "#a07040", "Carytown"),
  brickBldg("kuba-kuba", 720, 1220, 86, 58, "#b74e32", "Kuba Kuba"),
  brickBldg("village-cafe", 900, 1216, 84, 56, "#c4855a", "Village Café"),
  brickBldg("the-jasper", 1270, 1218, 88, 58, "#4e3b2e", "The Jasper"),
  brickBldg("brenner-pass", 1450, 1222, 98, 60, "#8d5c3e", "Brenner Pass"),
  brickBldg("buz-and-neds", 1625, 1218, 108, 60, "#7a3b1e", "Buz and Ned's"),
];

const corpRow: Entity[] = [
  corpBldg("carmax",          490,  900, 108, 82, "#1a1a2e", "#c62828", "CarMax",          "CarMax"),
  corpBldg("dominion-energy", 780,  900, 116, 86, "#0d1b3e", "#1565c0", "Dominion Energy", "Dominion Energy"),
];

const bgBuildings: Entity[] = [
  bgBldg("bg-west-1",  420,  900,  58, 48, "#4a3728"),
  bgBldg("bg-west-2",  880,  900,  52, 44, "#3b4a2e"),
  bgBldg("bg-mid-1",  1280, 1300,  64, 52, "#2e3a4a"),
  bgBldg("bg-mid-2",  1430, 1300,  54, 46, "#4a3a2e"),
  bgBldg("bg-mid-3",  1640, 1320,  60, 48, "#3a2e4a"),
  bgBldg("bg-south-1",  480, 1380,  56, 44, "#2e4a3a"),
  bgBldg("bg-south-2",  740, 1380,  66, 50, "#4a4a2e"),
];

const houses: Entity[] = [
  brickBldg("shrey-house", 1540, 1535, 92, 62, "#6d4c41", "Shrey's House"),
  brickBldg("sanjana-house", 1710, 1465, 96, 64, "#8d6e63", "Sanjana's House"),
];

const riverPark: Entity = {
  id: "river-park", x: CX, y: 1570, layer: 1,
  shapes: [
    { type: "ellipse", x: 0, y: 0, rx: 120, ry: 62, color: "#3b7a3e" },
    { type: "ellipse", x: -38, y: -8, rx: 34, ry: 22, color: "#2e7d32" },
    { type: "ellipse", x: 48, y: 5, rx: 26, ry: 16, color: "#43a047" },
    { type: "circle", x: -58, y: -5, r: 9, color: "#1b5e20" },
    { type: "circle", x: 60, y: -7, r: 7, color: "#2e7d32" },
    { type: "circle", x: 8, y: 14, r: 11, color: "#33691e" },
  ],
  label: { text: "James River Park", color: "#a5d6a7", font: "bold 11px sans-serif", offsetY: 70, shadow: { color: "rgba(0,0,0,0.7)", blur: 3 } },
};

const returnTrigger: Entity = {
  id: "return", x: CX, y: CY - 640, layer: 5,
  shapes: [
    { type: "rect", x: -70, y: -18, w: 140, h: 36, color: "rgba(33,150,243,0.88)", radius: 8 },
    { type: "text", x: 0, y: 0, text: "← Back to VT", color: "#fff",
      font: "bold 12px sans-serif",
      align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
  ],
  trigger: { type: "highway", name: "Return to VT", destination: "vt-island", hitbox: { ox: -90, oy: -45, w: 180, h: 90 } },
};

export const richmondMap: MapData = {
  id: "richmond", name: "Richmond, VA",
  worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY + 240,
  spawnRotation: -Math.PI / 2,
  bgColor: "#1c3a5e",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 840, ry: 760 },
  entities: [
    river, island, riverPark,
    ...roads,
    fancyBuilding,
    ...corpRow,
    ...bgBuildings,
    ...downtown,
    ...houses,
    returnTrigger,
  ],
  items: [], npcs: [],
};
