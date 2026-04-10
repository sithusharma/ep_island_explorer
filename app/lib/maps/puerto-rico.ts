import type { MapData } from "../types";
const W = 2400, CX = W / 2, CY = W / 2;

export const puertoRicoMap: MapData = {
  id: "puerto-rico", name: "Puerto Rico", worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY, spawnRotation: -Math.PI / 2,
  bgColor: "#0b7dab",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 900, ry: 800 },
  entities: [
    { id: "ocean", x: 0, y: 0, layer: 0, shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0b7dab" }] },
    { id: "island", x: 0, y: 0, layer: 0, shapes: [
      { type: "ellipse", x: CX, y: CY, rx: 910, ry: 810, color: "#f7e4a8" },
      { type: "ellipse", x: CX, y: CY, rx: 900, ry: 800, color: "#43a047" },
    ]},
    { id: "sanjuan", x: CX - 100, y: CY + 100, layer: 3, shapes: [
      { type: "rect", x: -35, y: -30, w: 70, h: 60, color: "#f48fb1", radius: 3 },
      { type: "rect", x: 40, y: -30, w: 60, h: 60, color: "#81d4fa", radius: 3 },
    ],
    label: { text: "Old San Juan", color: "#fff", font: "bold 13px sans-serif", offsetY: 45, shadow: { color: "rgba(0,0,0,0.6)", blur: 3 } },
    solid: true, hitbox: { ox: -40, oy: -34, w: 145, h: 68 },
    trigger: { type: "zone", name: "Old San Juan", hitbox: { ox: -60, oy: -60, w: 185, h: 120 } },
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
