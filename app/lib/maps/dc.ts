import type { MapData } from "../types";
const W = 2600, CX = W / 2, CY = W / 2;

export const dcMap: MapData = {
  id: "dc", name: "Washington DC", worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY + 300, spawnRotation: -Math.PI / 2,
  bgColor: "#0e4a7a",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 1050, ry: 950 },
  entities: [
    { id: "ocean", x: 0, y: 0, layer: 0, shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0e4a7a" }] },
    { id: "island", x: 0, y: 0, layer: 0, shapes: [
      { type: "ellipse", x: CX, y: CY, rx: 1060, ry: 960, color: "#bdbdbd" },
      { type: "ellipse", x: CX, y: CY, rx: 1050, ry: 950, color: "#81c784" },
    ]},
    { id: "mall", x: 0, y: 0, layer: 1, shapes: [
      { type: "rect", x: CX - 400, y: CY - 60, w: 800, h: 120, color: "#a5d6a7", radius: 8 },
    ]},
    { id: "monument", x: CX, y: CY, layer: 3, shapes: [
      { type: "rect", x: -12, y: -8, w: 24, h: 16, color: "#e0e0e0" },
      { type: "polygon", points: [-6, -8, 6, -8, 3, -120, -3, -120], color: "#eee" },
      { type: "triangle", x1: -3, y1: -120, x2: 0, y2: -135, x3: 3, y3: -120, color: "#bdbdbd" },
    ],
    label: { text: "Washington Monument", color: "#fff", font: "bold 13px sans-serif", offsetY: 22, shadow: { color: "rgba(0,0,0,0.6)", blur: 3 } },
    solid: true, hitbox: { ox: -14, oy: -137, w: 28, h: 153 },
    trigger: { type: "zone", name: "Washington Monument", hitbox: { ox: -50, oy: -150, w: 100, h: 180 } },
    },
    { id: "return", x: CX, y: CY + 600, layer: 5, shapes: [
      { type: "rect", x: -65, y: -18, w: 130, h: 36, color: "rgba(33,150,243,0.8)", radius: 8 },
      { type: "text", x: 0, y: 0, text: "← Back to VT", color: "#fff", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    trigger: { type: "highway", name: "Return to VT", destination: "vt-island", hitbox: { ox: -80, oy: -40, w: 160, h: 80 } },
    },
  ],
  items: [], npcs: [],
};
