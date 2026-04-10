import type { MapData } from "../types";
const W = 2400, CX = W / 2, CY = W / 2;

export const uvaMap: MapData = {
  id: "uva", name: "UVA", worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY + 200, spawnRotation: -Math.PI / 2,
  bgColor: "#0e4a7a",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 900, ry: 800 },
  entities: [
    { id: "ocean", x: 0, y: 0, layer: 0, shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0e4a7a" }] },
    { id: "island", x: 0, y: 0, layer: 0, shapes: [
      { type: "ellipse", x: CX, y: CY, rx: 910, ry: 810, color: "#e8d5a3" },
      { type: "ellipse", x: CX, y: CY, rx: 900, ry: 800, color: "#4caf50" },
    ]},
    { id: "rotunda", x: CX, y: CY - 100, layer: 3, shapes: [
      { type: "rect", x: -50, y: -20, w: 100, h: 55, color: "#e65100", radius: 3 },
      { type: "circle", x: 0, y: -20, r: 40, color: "#f57c00" },
      { type: "circle", x: 0, y: -20, r: 30, color: "#e65100" },
    ],
    label: { text: "The Rotunda", color: "#fff", font: "bold 14px sans-serif", offsetY: 50, shadow: { color: "rgba(0,0,0,0.6)", blur: 3 } },
    solid: true, hitbox: { ox: -54, oy: -62, w: 108, h: 96 },
    trigger: { type: "zone", name: "The Rotunda (rival territory...)", hitbox: { ox: -75, oy: -80, w: 150, h: 130 } },
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
