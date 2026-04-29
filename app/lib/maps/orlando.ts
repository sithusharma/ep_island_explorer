import type { Entity, MapData } from "../types";

const W = 1600;
const CX = W / 2;
const CY = W / 2;
const IRX = 650;
const IRY = 600;

function road(id: string, pts: number[]): Entity {
  const shadow = pts.map((v, i) => v + (i % 2 === 0 ? 2 : 2));
  return {
    id, x: 0, y: 0, layer: 2,
    shapes: [
      { type: "polyline", points: shadow, color: "rgba(0,0,0,0.10)", width: 48, cap: "round", join: "round" },
      { type: "polyline", points: pts,    color: "#616161",            width: 42, cap: "round", join: "round" },
      { type: "polyline", points: pts,    color: "#ffeb3b",            width: 2,  dash: [16, 12], cap: "butt",  join: "round" },
    ],
  };
}

export const orlandoMap: MapData = {
  id: "orlando", name: "Orlando",
  worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY + 450,
  spawnRotation: -Math.PI / 2,
  bgColor: "#0288d1",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: IRX, ry: IRY },
  entities: [
    { id: "ocean", x: 0, y: 0, layer: 0, shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0288d1" }] },
    { id: "island", x: 0, y: 0, layer: 0, shapes: [
      { type: "ellipse", x: CX, y: CY, rx: IRX + 20, ry: IRY + 20, color: "#e8d5a3" }, // Sand
      { type: "ellipse", x: CX, y: CY, rx: IRX, ry: IRY, color: "#7cb342" }, // Grass
    ]},
    
    // Roads
    road("rd-main", [CX, CY + 650, CX, CY - 550]),
    road("rd-hotel", [CX, CY + 50, CX + 300, CY + 50]),

    // Universal Studios (Massive, colorful)
    { id: "universal", x: CX - 150, y: CY - 100, layer: 3, shapes: [
      // Globe base
      { type: "rect", x: -100, y: 150, w: 200, h: 40, color: "#455a64", radius: 8 },
      // Globe
      { type: "circle", x: 0, y: 0, r: 150, color: "#03a9f4" },
      // Continents (abstract shapes)
      { type: "ellipse", x: -50, y: -30, rx: 40, ry: 60, color: "#8bc34a" },
      { type: "ellipse", x: 60, y: 20, rx: 50, ry: 40, color: "#8bc34a" },
      { type: "circle", x: 0, y: 80, r: 30, color: "#8bc34a" },
      // Studio Arch
      { type: "ellipse", x: 0, y: 0, rx: 180, ry: 170, color: "rgba(0,0,0,0)", stroke: "#ffeb3b", lineWidth: 15 },
      { type: "rect", x: -200, y: 90, w: 400, h: 30, color: "#e91e63", radius: 8 },
      { type: "text", x: 0, y: 102, text: "UNIVERSAL", color: "#fff", font: "900 24px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline }
    ],
    label: { text: "Universal Studios", color: "#fff", font: "bold 20px sans-serif", offsetY: 200, shadow: { color: "#000", blur: 5 } },
    solid: true, hitbox: { ox: -200, oy: -170, w: 400, h: 360 },
    trigger: { type: "zone", name: "Universal Studios", hitbox: { ox: -230, oy: -200, w: 460, h: 420 } },
    },

    // Small Hotel
    { id: "hotel", x: CX + 300, y: CY - 50, layer: 3, shapes: [
      { type: "rect", x: -50, y: -40, w: 100, h: 80, color: "rgba(0,0,0,0.2)", radius: 6 },
      { type: "rect", x: -46, y: -36, w: 92, h: 72, color: "#ff9800", radius: 6 },
      { type: "rect", x: -30, y: -20, w: 20, h: 20, color: "#fff" },
      { type: "rect", x: 10, y: -20, w: 20, h: 20, color: "#fff" },
      { type: "rect", x: -10, y: 16, w: 20, h: 20, color: "#5d4037" },
    ],
    label: { text: "Small Hotel", color: "#fff", font: "bold 16px sans-serif", offsetY: 55, shadow: { color: "#000", blur: 4 } },
    solid: true, hitbox: { ox: -55, oy: -45, w: 110, h: 90 },
    trigger: { type: "zone", name: "Small Hotel", hitbox: { ox: -80, oy: -70, w: 160, h: 140 } },
    },

    // Highway to Miami
    { id: "hwy-miami", x: CX, y: CY + 600, layer: 5, shapes: [
      { type: "rect", x: -65, y: -18, w: 130, h: 36, color: "rgba(33,150,243,0.88)", radius: 8 },
      { type: "text", x: 0, y: 0, text: "↓ Miami", color: "#fff", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    trigger: { type: "highway", name: "Miami", destination: "miami", hitbox: { ox: -80, oy: -40, w: 160, h: 80 } },
    },

    // Return Highway to VT
    { id: "hwy-vt", x: CX, y: CY - 500, layer: 5, shapes: [
      { type: "rect", x: -65, y: -18, w: 130, h: 36, color: "rgba(255,152,0,0.8)", radius: 8 },
      { type: "text", x: 0, y: 0, text: "✈ Return to VT", color: "#fff", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    trigger: { type: "highway", name: "Return to VT", destination: "vt-island", hitbox: { ox: -80, oy: -40, w: 160, h: 80 } },
    },
  ],
  items: [], npcs: [],
};
