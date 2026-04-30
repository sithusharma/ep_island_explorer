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
    road("rd-hotel", [CX, CY + 60, CX + 300, CY + 60]),
    road("rd-street", [CX - 260, CY + 220, CX + 260, CY + 220]),

    // Universal Studios roller coaster landmark
    { id: "universal", x: CX - 150, y: CY - 100, layer: 3, shapes: [
      { type: "line", x1: -170, y1: 122, x2: -170, y2: -18, color: "#455a64", width: 10 },
      { type: "line", x1: -40, y1: 132, x2: -40, y2: -88, color: "#455a64", width: 10 },
      { type: "line", x1: 110, y1: 132, x2: 110, y2: -38, color: "#455a64", width: 10 },
      { type: "line", x1: 210, y1: 122, x2: 210, y2: 12, color: "#455a64", width: 10 },
      { type: "ellipse", x: -105, y: 0, rx: 88, ry: 66, color: "rgba(0,0,0,0)", stroke: "#ff7043", lineWidth: 10 },
      { type: "ellipse", x: 35, y: -36, rx: 96, ry: 86, color: "rgba(0,0,0,0)", stroke: "#ffca28", lineWidth: 10 },
      { type: "ellipse", x: 158, y: 26, rx: 54, ry: 44, color: "rgba(0,0,0,0)", stroke: "#29b6f6", lineWidth: 9 },
      { type: "line", x1: -188, y1: 110, x2: 224, y2: 110, color: "#37474f", width: 8 },
      { type: "rect", x: -150, y: 126, w: 286, h: 28, color: "#8d6e63", radius: 6 },
      { type: "text", x: -8, y: 140, text: "ROLLER COASTER", color: "#fff", font: "900 18px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline }
    ],
    label: { text: "Universal Studios", color: "#fff", font: "bold 20px sans-serif", offsetY: 188, shadow: { color: "#000", blur: 5 } },
    solid: true, hitbox: { ox: -188, oy: -122, w: 412, h: 276 },
    trigger: { type: "zone", name: "Universal Studios", hitbox: { ox: -220, oy: -154, w: 472, h: 340 } },
    },

    // Street buildings
    { id: "hotel", x: CX + 300, y: CY - 40, layer: 3, shapes: [
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
    { id: "souvenir", x: CX - 210, y: CY + 125, layer: 3, shapes: [
      { type: "rect", x: -42, y: -34, w: 84, h: 68, color: "#26a69a", radius: 5 },
      { type: "rect", x: -46, y: -40, w: 92, h: 10, color: "#00796b", radius: 3 },
      { type: "text", x: 0, y: 2, text: "SHOP", color: "#fff", font: "bold 14px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    label: { text: "Souvenir Shop", color: "#fff", font: "bold 14px sans-serif", offsetY: 48, shadow: { color: "#000", blur: 4 } },
    solid: true, hitbox: { ox: -42, oy: -34, w: 84, h: 68 },
    },
    { id: "arcade", x: CX - 70, y: CY + 128, layer: 3, shapes: [
      { type: "rect", x: -44, y: -36, w: 88, h: 72, color: "#7e57c2", radius: 5 },
      { type: "rect", x: -48, y: -42, w: 96, h: 10, color: "#5e35b1", radius: 3 },
      { type: "text", x: 0, y: 2, text: "ARCADE", color: "#ffeb3b", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    label: { text: "Arcade", color: "#fff", font: "bold 14px sans-serif", offsetY: 52, shadow: { color: "#000", blur: 4 } },
    solid: true, hitbox: { ox: -44, oy: -36, w: 88, h: 72 },
    },
    { id: "diner", x: CX + 90, y: CY + 128, layer: 3, shapes: [
      { type: "rect", x: -44, y: -34, w: 88, h: 68, color: "#ef5350", radius: 5 },
      { type: "rect", x: -48, y: -40, w: 96, h: 10, color: "#c62828", radius: 3 },
      { type: "text", x: 0, y: 0, text: "DINER", color: "#fffde7", font: "bold 13px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    label: { text: "Diner", color: "#fff", font: "bold 14px sans-serif", offsetY: 50, shadow: { color: "#000", blur: 4 } },
    solid: true, hitbox: { ox: -44, oy: -34, w: 88, h: 68 },
    },
    { id: "sweets", x: CX + 235, y: CY + 125, layer: 3, shapes: [
      { type: "rect", x: -40, y: -34, w: 80, h: 68, color: "#ffb74d", radius: 5 },
      { type: "rect", x: -44, y: -40, w: 88, h: 10, color: "#fb8c00", radius: 3 },
      { type: "text", x: 0, y: 2, text: "TREATS", color: "#fff", font: "bold 11px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    label: { text: "Sweet Shop", color: "#fff", font: "bold 14px sans-serif", offsetY: 48, shadow: { color: "#000", blur: 4 } },
    solid: true, hitbox: { ox: -40, oy: -34, w: 80, h: 68 },
    },

    // Highway to Miami
    { id: "hwy-miami", x: CX, y: CY + 600, layer: 5, shapes: [
      { type: "rect", x: -82, y: -20, w: 164, h: 40, color: "rgba(38,50,56,0.92)", radius: 10 },
      { type: "rect", x: -72, y: -12, w: 144, h: 24, color: "rgba(255,255,255,0.08)", radius: 8 },
      { type: "text", x: 0, y: 0, text: "⬇ Miami", color: "#fff", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    trigger: { type: "highway", name: "Miami", destination: "miami", hitbox: { ox: -96, oy: -44, w: 192, h: 88 } },
    },
  ],
  items: [], npcs: [],
};
