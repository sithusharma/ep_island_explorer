import type { Entity, MapData, Shape } from "../types";

const W = 2200;
const CX = W / 2;
const CY = W / 2;

function palm(x: number, y: number, scale = 1): Shape[] {
  return [
    { type: "rect", x: x - 3 * scale, y: y - 16 * scale, w: 6 * scale, h: 24 * scale, color: "#7b5e3b", radius: 2 },
    { type: "circle", x, y: y - 18 * scale, r: 15 * scale, color: "#2e7d32" },
    { type: "circle", x: x - 10 * scale, y: y - 16 * scale, r: 10 * scale, color: "#43a047" },
    { type: "circle", x: x + 10 * scale, y: y - 16 * scale, r: 10 * scale, color: "#43a047" },
  ];
}

const treeShapes: Shape[] = [
  ...palm(410, 780, 1),
  ...palm(560, 620, 1.1),
  ...palm(760, 500, 0.95),
  ...palm(1560, 520, 1.1),
  ...palm(1760, 690, 1),
  ...palm(1870, 980, 0.95),
  ...palm(1800, 1520, 1.1),
  ...palm(1560, 1740, 1),
  ...palm(760, 1760, 1),
  ...palm(520, 1560, 1.1),
  ...palm(360, 1220, 0.95),
  ...palm(980, 1560, 1),
  ...palm(1320, 1580, 1),
];

const trees: Entity = { id: "trees", x: 0, y: 0, layer: 4, shapes: treeShapes };

export const cancunMap: MapData = {
  id: "cancun", name: "Cancún", worldWidth: W, worldHeight: W,
  spawnX: CX - 80, spawnY: CY + 220, spawnRotation: -Math.PI / 2,
  bgColor: "#00838f",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 860, ry: 780 },
  entities: [
    { id: "ocean", x: 0, y: 0, layer: 0, shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#00838f" }] },
    { id: "island", x: 0, y: 0, layer: 0, shapes: [
      { type: "ellipse", x: CX, y: CY, rx: 870, ry: 790, color: "#fff9c4" },
      { type: "ellipse", x: CX, y: CY, rx: 860, ry: 780, color: "#66bb6a" },
    ]},

    { id: "north-beach", x: CX, y: CY - 670, layer: 1, shapes: [
      { type: "ellipse", x: 0, y: 0, rx: 240, ry: 40, color: "#fff9c4" },
      { type: "ellipse", x: -220, y: 20, rx: 140, ry: 60, color: "#fff9c4" },
      { type: "ellipse", x: 220, y: 20, rx: 140, ry: 60, color: "#fff9c4" },
      { type: "rect", x: -170, y: -32, w: 16, h: 16, color: "#f44336", radius: 2 },
      { type: "rect", x: -60, y: -14, w: 16, h: 16, color: "#2196f3", radius: 2 },
      { type: "rect", x: 40, y: -56, w: 16, h: 16, color: "#4caf50", radius: 2 },
      { type: "rect", x: 160, y: -18, w: 16, h: 16, color: "#ff9800", radius: 2 },
    ],
    label: { text: "Playa Norte", color: "#f44336", font: "bold 20px sans-serif", offsetY: 0, shadow: { color: "rgba(255,255,255,0.8)", blur: 4 } },
    },

    { id: "east-beach", x: CX + 700, y: CY, layer: 1, shapes: [
      { type: "ellipse", x: 0, y: 0, rx: 75, ry: 430, color: "#fff9c4" },
      { type: "ellipse", x: -25, y: -250, rx: 55, ry: 180, color: "#fff9c4" },
      { type: "ellipse", x: -25, y: 250, rx: 55, ry: 180, color: "#fff9c4" },
    ],
    label: { text: "Playa Este", color: "#ff9800", font: "bold 20px sans-serif", offsetY: 0, shadow: { color: "rgba(255,255,255,0.8)", blur: 4 } },
    },

    { id: "riu", x: CX + 60, y: CY - 10, layer: 3, shapes: [
      { type: "rect", x: -150, y: -110, w: 300, h: 220, color: "#eeeeee", radius: 10 },
      { type: "rect", x: -116, y: -78, w: 232, h: 62, color: "#fff3e0", radius: 4 },
      { type: "rect", x: -136, y: -8, w: 52, h: 96, color: "#ffe0b2", radius: 4 },
      { type: "rect", x: 84, y: -8, w: 52, h: 96, color: "#ffe0b2", radius: 4 },
      { type: "rect", x: -64, y: 18, w: 128, h: 68, color: "#00b0ff", radius: 8 },
      { type: "rect", x: -44, y: 26, w: 88, h: 48, color: "#40c4ff", radius: 4 },
      { type: "circle", x: 0, y: 52, r: 14, color: "#ffb300" },
      { type: "text", x: 0, y: -54, text: "RIU", color: "#1565c0", font: "bold 28px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    label: { text: "RIU", color: "#fff", font: "bold 22px sans-serif", offsetY: 124, shadow: { color: "rgba(0,0,0,0.8)", blur: 5 } },
    solid: true, hitbox: { ox: -150, oy: -110, w: 300, h: 220 },
    trigger: { type: "zone", name: "RIU", hitbox: { ox: -190, oy: -150, w: 380, h: 300 } },
    },

    { id: "nightlife-street", x: CX - 300, y: CY + 210, layer: 3, shapes: [
      { type: "rect", x: -190, y: -76, w: 380, h: 152, color: "#212121", radius: 8 },
      { type: "rect", x: -170, y: -62, w: 84, h: 54, color: "#ff1744", radius: 5 },
      { type: "text", x: -128, y: -35, text: "COCO", color: "#fff", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
      { type: "rect", x: -66, y: -62, w: 84, h: 54, color: "#6200ea", radius: 5 },
      { type: "text", x: -24, y: -35, text: "MANDALA", color: "#1de9b6", font: "bold 10px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
      { type: "rect", x: 38, y: -62, w: 84, h: 54, color: "#000", stroke: "#ffff00", lineWidth: 3, radius: 5 },
      { type: "text", x: 80, y: -35, text: "CITY", color: "#ffff00", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
      { type: "rect", x: 142, y: -62, w: 34, h: 54, color: "#4a148c", radius: 5 },
      { type: "text", x: 159, y: -34, text: "LIV", color: "#ff80ab", font: "bold 10px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
      { type: "rect", x: -158, y: 18, w: 316, h: 36, color: "#111827", radius: 5 },
      { type: "text", x: 0, y: 36, text: "NIGHTLIFE STREET", color: "#ff80ab", font: "bold 13px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    label: { text: "Nightlife Street", color: "#fff", font: "bold 18px sans-serif", offsetY: 98, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
    solid: true, hitbox: { ox: -190, oy: -76, w: 380, h: 152 },
    trigger: { type: "zone", name: "Nightlife Street", hitbox: { ox: -220, oy: -108, w: 440, h: 216 } },
    },

    { id: "restaurant", x: CX - 180, y: CY - 210, layer: 3, shapes: [
      { type: "rect", x: -60, y: -50, w: 120, h: 100, color: "#795548", radius: 5 },
      { type: "rect", x: -40, y: -40, w: 80, h: 60, color: "#ff7043", radius: 3 },
      { type: "rect", x: -45, y: -45, w: 90, h: 10, color: "#d84315", radius: 2 },
      { type: "circle", x: -30, y: 30, r: 10, color: "#fff" },
      { type: "circle", x: 0, y: 30, r: 10, color: "#fff" },
      { type: "circle", x: 30, y: 30, r: 10, color: "#fff" },
    ],
    label: { text: "Nice Restaurant", color: "#fff", font: "bold 16px sans-serif", offsetY: 60, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
    solid: true, hitbox: { ox: -60, oy: -50, w: 120, h: 100 },
    trigger: { type: "zone", name: "Nice Restaurant", hitbox: { ox: -80, oy: -70, w: 160, h: 140 } },
    },

    { id: "strip-club", x: CX + 20, y: CY + 390, layer: 3, shapes: [
      { type: "rect", x: -68, y: -52, w: 136, h: 104, color: "#2a1538", radius: 8 },
      { type: "rect", x: -60, y: -58, w: 120, h: 12, color: "#e91e63", radius: 4 },
      { type: "rect", x: -50, y: -34, w: 100, h: 18, color: "#4a148c", radius: 4 },
      { type: "text", x: 0, y: -25, text: "VELVET", color: "#ffd1e8", font: "bold 13px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
      { type: "rect", x: -44, y: -8, w: 24, h: 20, color: "rgba(255,105,180,0.32)", radius: 2 },
      { type: "rect", x: -10, y: -8, w: 24, h: 20, color: "rgba(255,180,0,0.26)", radius: 2 },
      { type: "rect", x: 24, y: -8, w: 24, h: 20, color: "rgba(120,80,255,0.32)", radius: 2 },
      { type: "rect", x: -12, y: 18, w: 24, h: 34, color: "#111827", radius: 2 },
    ],
    label: { text: "Strip Club", color: "#fff", font: "bold 15px sans-serif", offsetY: 68, shadow: { color: "rgba(0,0,0,0.85)", blur: 4 } },
    solid: true, hitbox: { ox: -68, oy: -58, w: 136, h: 110 },
    trigger: { type: "zone", name: "Strip Club", hitbox: { ox: -94, oy: -82, w: 188, h: 164 } },
    },

    { id: "airport", x: CX - 390, y: CY + 540, layer: 3, shapes: [
      { type: "rect", x: -110, y: -34, w: 220, h: 68, color: "#607d8b", radius: 10 },
      { type: "rect", x: -96, y: -24, w: 192, h: 46, color: "#90a4ae", radius: 8 },
      { type: "rect", x: -84, y: -20, w: 168, h: 18, color: "rgba(220,240,255,0.45)", radius: 5 },
      { type: "rect", x: -20, y: -64, w: 40, h: 30, color: "#546e7a", radius: 4 },
      { type: "rect", x: -25, y: -72, w: 50, h: 10, color: "#37474f", radius: 3 },
      { type: "text", x: 0, y: -46, text: "✈", color: "#eef6ff", font: "bold 24px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
      { type: "line", x1: -58, y1: 34, x2: 58, y2: 34, color: "rgba(255,255,255,0.18)", width: 3 },
    ],
    label: { text: "Cancún Airport", color: "#fff", font: "bold 15px sans-serif", offsetY: 96, shadow: { color: "rgba(0,0,0,0.85)", blur: 4 } },
    solid: false,
    trigger: { type: "airport", name: "Cancun Airport", destination: "vt-island", hitbox: { ox: -140, oy: -24, w: 280, h: 108 } },
    },

    trees,
  ],
  items: [],
  npcs: [],
};
