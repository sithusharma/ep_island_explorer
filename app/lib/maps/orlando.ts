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

    // Universal Studios roller coaster landmark
    { id: "universal", x: CX - 150, y: CY - 100, layer: 3, shapes: [
      { type: "line", x1: -200, y1: 118, x2: -200, y2: 4, color: "#546e7a", width: 8 },
      { type: "line", x1: -132, y1: 118, x2: -132, y2: -56, color: "#546e7a", width: 8 },
      { type: "line", x1: -48, y1: 118, x2: -48, y2: -114, color: "#546e7a", width: 8 },
      { type: "line", x1: 52, y1: 118, x2: 52, y2: -86, color: "#546e7a", width: 8 },
      { type: "line", x1: 146, y1: 118, x2: 146, y2: -26, color: "#546e7a", width: 8 },
      { type: "line", x1: 226, y1: 118, x2: 226, y2: 34, color: "#546e7a", width: 8 },
      { type: "line", x1: -216, y1: 118, x2: 242, y2: 118, color: "#455a64", width: 8 },
      { type: "polyline", points: [-212, 20, -170, -6, -132, -42, -94, -82, -48, -110, 0, -72, 52, -26, 108, 8, 146, -6, 186, 18, 226, 48], color: "#ff7043", width: 10, join: "round", cap: "round" },
      { type: "polyline", points: [-212, 30, -172, 4, -132, -30, -92, -66, -48, -96, 0, -58, 52, -12, 108, 18, 146, 6, 186, 28, 226, 58], color: "#ffe082", width: 4, join: "round", cap: "round" },
      { type: "polyline", points: [-128, -34, -104, 18, -76, 60, -44, 88, -10, 102], color: "#29b6f6", width: 8, join: "round", cap: "round" },
      { type: "polyline", points: [76, 0, 106, 38, 142, 78, 184, 102], color: "#ab47bc", width: 8, join: "round", cap: "round" },
      { type: "rect", x: -162, y: 126, w: 304, h: 24, color: "#8d6e63", radius: 6 },
      { type: "rect", x: -128, y: 92, w: 34, h: 18, color: "#ef5350", radius: 5 },
      { type: "rect", x: -4, y: 56, w: 34, h: 18, color: "#66bb6a", radius: 5 },
      { type: "rect", x: 136, y: 68, w: 34, h: 18, color: "#42a5f5", radius: 5 },
      { type: "text", x: -10, y: 138, text: "ROLLER COASTER", color: "#fff", font: "900 17px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline }
    ],
    label: { text: "Universal Studios", color: "#fff", font: "bold 20px sans-serif", offsetY: 188, shadow: { color: "#000", blur: 5 } },
    solid: true, hitbox: { ox: -216, oy: -122, w: 458, h: 272 },
    trigger: { type: "zone", name: "Universal Studios", hitbox: { ox: -246, oy: -154, w: 518, h: 336 } },
    },

    // Small hotel
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

    // Highway to Miami
    { id: "hwy-miami", x: CX, y: CY + 600, layer: 5, shapes: [
      { type: "rect", x: -4, y: -10, w: 8, h: 50, color: "#4b5563", radius: 4 },
      { type: "rect", x: -52, y: -34, w: 104, h: 42, color: "rgba(15,23,42,0.28)", radius: 12 },
      { type: "rect", x: -48, y: -38, w: 96, h: 38, color: "#0f766e", radius: 12, stroke: "#86efac", lineWidth: 2 },
      { type: "circle", x: -26, y: -19, r: 11, color: "rgba(255,255,255,0.12)" },
      { type: "text", x: -26, y: -19, text: "🌴", color: "#fff", font: "16px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline, shadow: { color: "rgba(134,239,172,0.28)", blur: 8 } },
      { type: "text", x: 8, y: -19, text: "MIAMI", color: "#fff", font: "bold 11px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline, shadow: { color: "rgba(134,239,172,0.28)", blur: 6 } },
      { type: "line", x1: 10, y1: -6, x2: 28, y2: -6, color: "#86efac", width: 2 },
      { type: "line", x1: 28, y1: -6, x2: 22, y2: -10, color: "#86efac", width: 2 },
      { type: "line", x1: 28, y1: -6, x2: 22, y2: -2, color: "#86efac", width: 2 },
    ],
    trigger: { type: "highway", name: "Miami", destination: "miami", hitbox: { ox: -72, oy: -56, w: 144, h: 120 } },
    },
  ],
  artifacts: [
    {
      id: "lord-floof",
      name: "Lord Floof",
      mapCoordinates: { x: CX - 150, y: CY + 140 },
      requiredPlayer: "Sarah",
      stageRequired: 2,
      icon: "🦄",
      description: "Lord Floof — a stuffed unicorn plush from Despicable Me. Only Sarah can claim it.",
      hitbox: { w: 64, h: 64 },
      unlockToken: "SARAH_TOKEN",
      advanceStageTo: 3,
    },
  ],
  items: [], npcs: [],
};
