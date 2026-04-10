import type { MapData } from "../types";
const W = 2400, CX = W / 2, CY = W / 2;

export const miamiMap: MapData = {
  id: "miami", name: "Miami", worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY, spawnRotation: -Math.PI / 2,
  bgColor: "#0b7dab",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 900, ry: 800 },
  entities: [
    { id: "ocean", x: 0, y: 0, layer: 0, shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0b7dab" }] },
    { id: "island", x: 0, y: 0, layer: 0, shapes: [
      { type: "ellipse", x: CX, y: CY, rx: 910, ry: 810, color: "#f7e4a8" },
      { type: "ellipse", x: CX, y: CY, rx: 900, ry: 800, color: "#66bb6a" },
    ]},
    { id: "beach", x: CX, y: CY + 550, layer: 1, shapes: [
      { type: "ellipse", x: 0, y: 0, rx: 250, ry: 100, color: "#f7e4a8" },
    ]},
    { id: "hotel", x: CX + 200, y: CY - 100, layer: 3, shapes: [
      { type: "rect", x: -40, y: -60, w: 80, h: 120, color: "#e0f7fa", radius: 4 },
      { type: "rect", x: -44, y: -66, w: 88, h: 10, color: "#00acc1", radius: 3 },
    ],
    label: { text: "Oceanview Hotel", color: "#fff", font: "bold 13px sans-serif", offsetY: 75, shadow: { color: "rgba(0,0,0,0.6)", blur: 3 } },
    solid: true, hitbox: { ox: -46, oy: -68, w: 92, h: 138 },
    trigger: { type: "zone", name: "Oceanview Hotel", hitbox: { ox: -70, oy: -90, w: 140, h: 180 } },
    },
    { id: "return", x: CX, y: CY - 420, layer: 5, shapes: [
      { type: "rect", x: -65, y: -18, w: 130, h: 36, color: "rgba(255,152,0,0.8)", radius: 8 },
      { type: "text", x: 0, y: 0, text: "✈ Back to VT", color: "#fff", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    trigger: { type: "highway", name: "Return to VT", destination: "vt-island", hitbox: { ox: -80, oy: -40, w: 160, h: 80 } },
    },
  ],
  items: [], npcs: [],
};
