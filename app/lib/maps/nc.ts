import type { MapData } from "../types";
const W = 2400, CX = W / 2, CY = W / 2;

export const ncMap: MapData = {
  id: "nc", name: "North Carolina", worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY + 100, spawnRotation: -Math.PI / 2,
  bgColor: "#0e4a7a",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 900, ry: 800 },
  entities: [
    { id: "ocean", x: 0, y: 0, layer: 0, shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0e4a7a" }] },
    { id: "island", x: 0, y: 0, layer: 0, shapes: [
      { type: "ellipse", x: CX, y: CY, rx: 910, ry: 810, color: "#e8d5a3" },
      { type: "ellipse", x: CX, y: CY, rx: 900, ry: 800, color: "#43a047" },
    ]},
    { id: "farm", x: CX, y: CY - 50, layer: 3, shapes: [
      { type: "rect", x: -35, y: -22, w: 70, h: 44, color: "#efebe9", radius: 2 },
      { type: "triangle", x1: -40, y1: -22, x2: 0, y2: -48, x3: 40, y3: -22, color: "#8d6e63" },
    ],
    label: { text: "NC Farmhouse", color: "#fff", font: "bold 13px sans-serif", offsetY: 36, shadow: { color: "rgba(0,0,0,0.6)", blur: 3 } },
    solid: true, hitbox: { ox: -42, oy: -50, w: 84, h: 72 },
    trigger: { type: "zone", name: "NC Farmhouse", hitbox: { ox: -60, oy: -65, w: 120, h: 110 } },
    },
    { id: "return", x: CX, y: CY + 450, layer: 5, shapes: [
      { type: "rect", x: -65, y: -18, w: 130, h: 36, color: "rgba(33,150,243,0.8)", radius: 8 },
      { type: "text", x: 0, y: 0, text: "← Back to VT", color: "#fff", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    trigger: { type: "highway", name: "Return to VT", destination: "vt-island", hitbox: { ox: -80, oy: -40, w: 160, h: 80 } },
    },
  ],
  items: [], npcs: [],
};
