import type { Entity, MapData, Shape } from "../types";

const W = 2100;
const CX = W / 2;
const CY = W / 2;

function road(id: string, pts: number[], width = 38): Entity {
  return {
    id, x: 0, y: 0, layer: 2,
    shapes: [
      { type: "polyline", points: pts, color: "rgba(0,0,0,0.12)", width: width + 6, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#5d4e37", width, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#ffca28", width: 2, dash: [14, 10], cap: "butt", join: "round" },
    ],
  };
}

function palm(x: number, y: number, scale = 1): Shape[] {
  return [
    { type: "rect", x: x - 3 * scale, y: y - 16 * scale, w: 6 * scale, h: 24 * scale, color: "#7b5e3b", radius: 2 },
    { type: "circle", x, y: y - 18 * scale, r: 15 * scale, color: "#2e7d32" },
    { type: "circle", x: x - 10 * scale, y: y - 16 * scale, r: 10 * scale, color: "#43a047" },
    { type: "circle", x: x + 10 * scale, y: y - 16 * scale, r: 10 * scale, color: "#43a047" },
  ];
}

const treeShapes: Shape[] = [
  ...palm(330, 840, 1),
  ...palm(470, 640, 1.05),
  ...palm(680, 470, 0.95),
  ...palm(1180, 430, 1),
  ...palm(1480, 620, 1.05),
  ...palm(1530, 980, 0.95),
  ...palm(1450, 1340, 1),
  ...palm(1180, 1530, 1),
  ...palm(780, 1510, 1),
  ...palm(470, 1360, 1.05),
  ...palm(300, 1110, 0.95),
];

const trees: Entity = { id: "trees", x: 0, y: 0, layer: 4, shapes: treeShapes };

export const cancunMap: MapData = {
  id: "cancun", name: "Cancún", worldWidth: W, worldHeight: W,
  spawnX: CX - 650, spawnY: CY + 40, spawnRotation: 0,
  bgColor: "#00838f",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 820, ry: 660 },
  entities: [
    { id: "ocean", x: 0, y: 0, layer: 0, shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#00838f" }] },
    { id: "island", x: 0, y: 0, layer: 0, shapes: [
      { type: "ellipse", x: CX, y: CY, rx: 830, ry: 670, color: "#fff9c4" },
      { type: "ellipse", x: CX, y: CY, rx: 820, ry: 660, color: "#66bb6a" },
    ]},
    { id: "beach-zone", x: 0, y: 0, layer: 1, shapes: [
      { type: "rect", x: CX + 410, y: CY - 650, w: 420, h: 1300, color: "#fff9c4" },
      { type: "line", x1: CX + 410, y1: CY - 520, x2: CX + 410, y2: CY + 520, color: "rgba(255,255,255,0.28)", width: 5 },
      { type: "rect", x: CX + 555, y: CY - 290, w: 26, h: 10, color: "#ffffff", radius: 3 },
      { type: "rect", x: CX + 560, y: CY - 308, w: 18, h: 18, color: "#ff7043", radius: 3 },
      { type: "rect", x: CX + 620, y: CY + 120, w: 28, h: 10, color: "#ffffff", radius: 3 },
      { type: "rect", x: CX + 625, y: CY + 102, w: 18, h: 18, color: "#42a5f5", radius: 3 },
    ]},

    road("rd-main", [CX - 680, CY + 40, CX + 520, CY + 40]),
    road("rd-nightlife", [CX - 80, CY + 40, CX - 80, CY + 220]),
    road("rd-restaurant", [CX - 260, CY + 40, CX - 260, CY - 160]),
    road("rd-strip-club", [CX + 170, CY + 40, CX + 170, CY + 390]),
    road("rd-airport", [CX - 500, CY + 40, CX - 500, CY + 300]),
    road("rd-riu", [CX + 170, CY + 40, CX + 170, CY - 130]),

    { id: "cancun-label", x: CX - 120, y: CY - 30, layer: 4, shapes: [
      { type: "text", x: 0, y: 0, text: "Cancun Hotel Zone", color: "#fff", font: "bold 15px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
    ]},

    { id: "nightlife-street", x: CX - 80, y: CY + 250, layer: 3, shapes: [
      { type: "rect", x: -150, y: -56, w: 300, h: 112, color: "#212121", radius: 8 },
      { type: "rect", x: -132, y: -42, w: 72, h: 48, color: "#ff1744", radius: 4 },
      { type: "text", x: -96, y: -18, text: "COCO", color: "#fff", font: "bold 11px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
      { type: "rect", x: -44, y: -42, w: 72, h: 48, color: "#6200ea", radius: 4 },
      { type: "text", x: -8, y: -18, text: "MANDALA", color: "#1de9b6", font: "bold 9px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
      { type: "rect", x: 44, y: -42, w: 72, h: 48, color: "#000", stroke: "#ffff00", lineWidth: 3, radius: 4 },
      { type: "text", x: 80, y: -18, text: "CITY", color: "#ffff00", font: "bold 11px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
      { type: "rect", x: -112, y: 18, w: 224, h: 24, color: "#111827", radius: 4 },
      { type: "text", x: 0, y: 30, text: "NIGHTLIFE", color: "#ff80ab", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    label: { text: "Nightlife", color: "#fff", font: "bold 16px sans-serif", offsetY: 74, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
    solid: true, hitbox: { ox: -150, oy: -56, w: 300, h: 112 },
    trigger: { type: "zone", name: "Nightlife Street", hitbox: { ox: -182, oy: -88, w: 364, h: 176 } },
    },

    { id: "restaurant", x: CX - 260, y: CY - 210, layer: 3, shapes: [
      { type: "rect", x: -64, y: -54, w: 128, h: 108, color: "#795548", radius: 5 },
      { type: "rect", x: -42, y: -42, w: 84, h: 62, color: "#ff7043", radius: 3 },
      { type: "rect", x: -48, y: -48, w: 96, h: 10, color: "#d84315", radius: 2 },
      { type: "circle", x: -32, y: 30, r: 10, color: "#fff" },
      { type: "circle", x: 0, y: 30, r: 10, color: "#fff" },
      { type: "circle", x: 32, y: 30, r: 10, color: "#fff" },
    ],
    label: { text: "Nice Restaurant", color: "#fff", font: "bold 15px sans-serif", offsetY: 66, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
    solid: true, hitbox: { ox: -64, oy: -54, w: 128, h: 108 },
    trigger: { type: "zone", name: "Nice Restaurant", hitbox: { ox: -90, oy: -80, w: 180, h: 160 } },
    },

    { id: "strip-club", x: CX + 170, y: CY + 430, layer: 3, shapes: [
      { type: "rect", x: -70, y: -56, w: 140, h: 112, color: "#2a1538", radius: 8 },
      { type: "rect", x: -62, y: -62, w: 124, h: 12, color: "#e91e63", radius: 4 },
      { type: "rect", x: -52, y: -38, w: 104, h: 18, color: "#4a148c", radius: 4 },
      { type: "text", x: 0, y: -28, text: "VELVET", color: "#ffd1e8", font: "bold 13px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
      { type: "rect", x: -44, y: -6, w: 24, h: 20, color: "rgba(255,105,180,0.32)", radius: 2 },
      { type: "rect", x: -10, y: -6, w: 24, h: 20, color: "rgba(255,180,0,0.26)", radius: 2 },
      { type: "rect", x: 24, y: -6, w: 24, h: 20, color: "rgba(120,80,255,0.32)", radius: 2 },
      { type: "rect", x: -12, y: 18, w: 24, h: 38, color: "#111827", radius: 2 },
    ],
    label: { text: "Strip Club", color: "#fff", font: "bold 15px sans-serif", offsetY: 70, shadow: { color: "rgba(0,0,0,0.85)", blur: 4 } },
    solid: true, hitbox: { ox: -70, oy: -62, w: 140, h: 118 },
    trigger: { type: "zone", name: "Strip Club", hitbox: { ox: -96, oy: -88, w: 192, h: 176 } },
    },

    { id: "riu", x: CX + 240, y: CY - 140, layer: 3, shapes: [
      { type: "rect", x: -118, y: -86, w: 236, h: 172, color: "#eeeeee", radius: 8 },
      { type: "rect", x: -96, y: -60, w: 192, h: 50, color: "#fff3e0", radius: 4 },
      { type: "rect", x: -106, y: 0, w: 40, h: 74, color: "#ffe0b2", radius: 4 },
      { type: "rect", x: 66, y: 0, w: 40, h: 74, color: "#ffe0b2", radius: 4 },
      { type: "rect", x: -46, y: 18, w: 92, h: 44, color: "#00b0ff", radius: 6 },
      { type: "text", x: 0, y: -34, text: "RIU", color: "#1565c0", font: "bold 24px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    label: { text: "RIU", color: "#fff", font: "bold 20px sans-serif", offsetY: 98, shadow: { color: "rgba(0,0,0,0.8)", blur: 5 } },
    solid: true, hitbox: { ox: -118, oy: -86, w: 236, h: 172 },
    trigger: { type: "zone", name: "RIU", hitbox: { ox: -150, oy: -116, w: 300, h: 236 } },
    },

    { id: "east-beach", x: CX + 665, y: CY - 10, layer: 1, shapes: [
      { type: "ellipse", x: 0, y: 0, rx: 82, ry: 340, color: "#fff9c4" },
      { type: "ellipse", x: -18, y: -220, rx: 54, ry: 140, color: "#fff9c4" },
      { type: "ellipse", x: -18, y: 220, rx: 54, ry: 140, color: "#fff9c4" },
    ],
    label: { text: "Beach", color: "#ff9800", font: "bold 18px sans-serif", offsetY: 0, shadow: { color: "rgba(255,255,255,0.8)", blur: 4 } },
    trigger: { type: "zone", name: "Cancun Beach", hitbox: { ox: -82, oy: -340, w: 164, h: 680 } },
    },

    { id: "beach-palms", x: 0, y: 0, layer: 4, shapes: [
      ...palm(CX + 500, CY - 180, 0.95),
      ...palm(CX + 540, CY + 10, 1),
      ...palm(CX + 505, CY + 220, 0.95),
    ]},

    { id: "airport", x: CX - 500, y: CY + 340, layer: 3, shapes: [
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
  artifacts: [
    {
      id: "wheelchair",
      name: "Wheelchair",
      mapCoordinates: { x: CX + 560, y: CY + 160 },
      requiredPlayer: "Jake",
      stageRequired: 1,
      icon: "♿",
      description: "Jake's wheelchair — bring it to the RIU Resort.",
      hitbox: { w: 54, h: 54 },
    },
  ],
  items: [],
  npcs: [],
};
