import type { MapData } from "../types";
const W = 2600, CX = W / 2, CY = W / 2;

export const tennesseeMap: MapData = {
  id: "tennessee", name: "Tennessee", worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY + 200, spawnRotation: -Math.PI / 2,
  bgColor: "#0e4a7a",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 1000, ry: 900 },
  entities: [
    { id: "ocean", x: 0, y: 0, layer: 0, shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0e4a7a" }] },
    { id: "island", x: 0, y: 0, layer: 0, shapes: [
      { type: "ellipse", x: CX, y: CY, rx: 1010, ry: 910, color: "#e8d5a3" },
      { type: "ellipse", x: CX, y: CY, rx: 1000, ry: 900, color: "#4caf50" },
    ]},
    { id: "mtn1", x: CX, y: CY - 350, layer: 1, shapes: [
      { type: "triangle", x1: 0, y1: -220, x2: -160, y2: 80, x3: 160, y3: 80, color: "#6d7f88" },
      { type: "triangle", x1: 0, y1: -220, x2: -45, y2: -140, x3: 45, y3: -140, color: "#eceff1" },
    ]},
    { id: "mtn2", x: CX - 250, y: CY - 250, layer: 1, shapes: [
      { type: "triangle", x1: 0, y1: -160, x2: -120, y2: 60, x3: 120, y3: 60, color: "#8d9da6" },
    ]},
    { id: "cabin", x: CX - 100, y: CY + 100, layer: 3, shapes: [
      { type: "rect", x: -30, y: -20, w: 60, h: 40, color: "#6d4c41", radius: 2 },
      { type: "triangle", x1: -35, y1: -20, x2: 0, y2: -42, x3: 35, y3: -20, color: "#4e342e" },
    ],
    label: { text: "Mountain Cabin", color: "#fff", font: "bold 13px sans-serif", offsetY: 34, shadow: { color: "rgba(0,0,0,0.6)", blur: 3 } },
    solid: true, hitbox: { ox: -36, oy: -44, w: 72, h: 66 },
    trigger: { type: "zone", name: "Mountain Cabin", hitbox: { ox: -60, oy: -65, w: 120, h: 110 } },
    },
    { id: "return", x: CX, y: CY + 550, layer: 5, shapes: [
      { type: "rect", x: -65, y: -18, w: 130, h: 36, color: "rgba(33,150,243,0.8)", radius: 8 },
      { type: "text", x: 0, y: 0, text: "← Back to VT", color: "#fff", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    trigger: { type: "highway", name: "Return to VT", destination: "vt-island", hitbox: { ox: -80, oy: -40, w: 160, h: 80 } },
    },
  ],
  items: [], npcs: [],
};
