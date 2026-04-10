import type { MapData } from "../types";
const W = 2800, CX = W / 2, CY = W / 2;

export const nycMap: MapData = {
  id: "nyc", name: "NYC", worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY + 200, spawnRotation: -Math.PI / 2,
  bgColor: "#0e4a7a",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 1100, ry: 1000 },
  entities: [
    { id: "ocean", x: 0, y: 0, layer: 0, shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0e4a7a" }] },
    { id: "island", x: 0, y: 0, layer: 0, shapes: [
      { type: "ellipse", x: CX, y: CY, rx: 1110, ry: 1010, color: "#9e9e9e" },
      { type: "ellipse", x: CX, y: CY, rx: 1100, ry: 1000, color: "#78909c" },
    ]},
    { id: "rd", x: 0, y: 0, layer: 2, shapes: [
      { type: "polyline", points: [CX, CY - 700, CX, CY + 700], color: "#546e7a", width: 40, cap: "round", join: "round" },
      { type: "polyline", points: [CX - 700, CY, CX + 700, CY], color: "#546e7a", width: 40, cap: "round", join: "round" },
    ]},
    { id: "bldg1", x: CX - 200, y: CY - 200, layer: 3, shapes: [
      { type: "rect", x: -25, y: -100, w: 50, h: 200, color: "#616161", radius: 2 },
    ], label: { text: "Tower 1", color: "#bbb", font: "10px sans-serif", offsetY: 108, shadow: { color: "rgba(0,0,0,0.6)", blur: 2 } },
    solid: true, hitbox: { ox: -28, oy: -104, w: 56, h: 212 },
    },
    { id: "bldg2", x: CX + 200, y: CY - 150, layer: 3, shapes: [
      { type: "rect", x: -30, y: -130, w: 60, h: 260, color: "#546e7a", radius: 2 },
    ], label: { text: "Empire Bldg", color: "#bbb", font: "10px sans-serif", offsetY: 138, shadow: { color: "rgba(0,0,0,0.6)", blur: 2 } },
    solid: true, hitbox: { ox: -34, oy: -134, w: 68, h: 268 },
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
