import type { MapData } from "../types";
const W = 2400, CX = W / 2, CY = W / 2;

export const cancunMap: MapData = {
  id: "cancun", name: "Cancún", worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY, spawnRotation: -Math.PI / 2,
  bgColor: "#00838f",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 900, ry: 800 },
  entities: [
    { id: "ocean", x: 0, y: 0, layer: 0, shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#00838f" }] },
    { id: "island", x: 0, y: 0, layer: 0, shapes: [
      { type: "ellipse", x: CX, y: CY, rx: 910, ry: 810, color: "#fff9c4" },
      { type: "ellipse", x: CX, y: CY, rx: 900, ry: 800, color: "#66bb6a" },
    ]},
    { id: "resort", x: CX + 150, y: CY + 50, layer: 3, shapes: [
      { type: "rect", x: -50, y: -35, w: 100, h: 70, color: "#fff3e0", radius: 4 },
      { type: "rect", x: -54, y: -40, w: 108, h: 8, color: "#ff8f00", radius: 3 },
    ],
    label: { text: "Resort Maya", color: "#fff", font: "bold 13px sans-serif", offsetY: 50, shadow: { color: "rgba(0,0,0,0.6)", blur: 3 } },
    solid: true, hitbox: { ox: -56, oy: -44, w: 112, h: 88 },
    trigger: { type: "zone", name: "Resort Maya", hitbox: { ox: -80, oy: -65, w: 160, h: 130 } },
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
