import type { Entity, MapData, Shape } from "../types";

const W = 3600;
const CX = 1800;
const CY = 1800;
const RX = 1450;
const RY = 1000;

const ASPHALT = "#5a5a5f";
const ROAD_SHADOW = "rgba(0,0,0,0.14)";

const Y_DT_N = 1440;
const Y_DT_M = 1800;
const Y_DT_S = 2160;
const X_DT_W = 1320;
const X_DT_E = 2280;
const Y_HERNDON = 2440;

function road(id: string, pts: number[], width = 40): Entity {
  return {
    id, x: 0, y: 0, layer: 2,
    shapes: [
      { type: "polyline", points: pts, color: ROAD_SHADOW, width: width + 8, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: ASPHALT, width, cap: "round", join: "round" },
      { type: "polyline", points: pts, color: "#fbc02d", width: 2, dash: [14, 12], cap: "butt", join: "round" },
    ],
  };
}

function building(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  label?: string,
  trigger = false,
): Entity {
  const roof = "rgba(0,0,0,0.22)";
  const shapes: Shape[] = [
    { type: "rect", x: -(w / 2) + 4, y: -(h / 2) + 4, w, h, color: "rgba(0,0,0,0.16)", radius: 3 },
    { type: "rect", x: -(w / 2), y: -(h / 2), w, h, color, radius: 3 },
    { type: "rect", x: -(w / 2) - 2, y: -(h / 2) - 8, w: w + 4, h: 10, color: roof, radius: 2 },
    { type: "rect", x: -8, y: h / 2 - 18, w: 16, h: 18, color: "rgba(25,25,25,0.48)", radius: 1 },
  ];
  const cols = Math.max(1, Math.floor((w - 22) / 18));
  const rows = Math.max(1, Math.floor((h - 30) / 20));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      shapes.push({
        type: "rect",
        x: -(w / 2) + 10 + c * 18,
        y: -(h / 2) + 12 + r * 20,
        w: 10,
        h: 12,
        color: "rgba(214,235,255,0.35)",
        radius: 1,
      });
    }
  }
  return {
    id, x, y, layer: 3, shapes,
    label: label ? {
      text: label,
      color: "#111111",
      font: "bold 12px sans-serif",
      offsetY: h / 2 + 16,
      shadow: { color: "rgba(255,255,255,0.92)", blur: 3 },
    } : undefined,
    solid: true,
    hitbox: { ox: -(w / 2) - 4, oy: -(h / 2) - 10, w: w + 8, h: h + 16 },
    trigger: trigger && label ? {
      type: "zone",
      name: label,
      hitbox: { ox: -(w / 2) - 34, oy: -(h / 2) - 34, w: w + 68, h: h + 68 },
    } : undefined,
  };
}

const concertHall = building("concert-hall", 1530, 2010, 150, 110, "#66527f", "Concert Hall", true);
const genericNorthWest = building("district-office-1", 1530, 1620, 134, 96, "#a0a7ac");
const genericNorthEast = building("district-office-2", 2070, 1620, 136, 98, "#8e9aa1");
const capitolHill = building("capitol-hill", 2070, 2010, 156, 136, "#ccbba2", "Capitol Hill", true);

const sarthakApt = building("sarthaks-apt", 2890, 1980, 116, 144, "#8d6e63", "Sarthak's Apartment", true);

const aravsApt = building("aravs-apt", 860, 2280, 118, 102, "#795548", "Arav's Apartment", true);
const tacoBamba = building("taco-bamba", 1120, 2280, 132, 76, "#d84315", "Taco Bamba", true);

const cityFill: Entity[] = [
  building("fill-nw-1", 1160, 1520, 88, 96, "#a7afb4"),
  building("fill-nw-2", 1160, 1985, 94, 110, "#979ea5"),
  building("fill-ne-1", 2440, 1520, 86, 92, "#9ea7b0"),
  building("fill-ne-2", 2440, 1985, 92, 108, "#a6a39a"),
];

const washingtonMonument: Entity = {
  id: "monument", x: CX, y: CY, layer: 3,
  shapes: [
    { type: "rect", x: -14, y: -10, w: 28, h: 20, color: "#d8d8d8", radius: 1 },
    { type: "polygon", points: [-7, -10, 7, -10, 3, -118, -3, -118], color: "#efefef" },
    { type: "triangle", x1: -3, y1: -118, x2: 0, y2: -132, x3: 3, y3: -118, color: "#cfcfcf" },
  ],
  label: { text: "Washington Monument", color: "#3f3f46", font: "bold 12px sans-serif", offsetY: 26, shadow: { color: "rgba(255,255,255,0.8)", blur: 2 } },
  solid: true,
  hitbox: { ox: -16, oy: -132, w: 32, h: 152 },
};

export const dcMap: MapData = {
  id: "dc",
  name: "Washington DC",
  worldWidth: W,
  worldHeight: W,
  spawnX: CX,
  spawnY: CY + 400,
  spawnRotation: -Math.PI / 2,
  bgColor: "#0e4a7a",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: RX, ry: RY },
  entities: [
    {
      id: "ocean", x: 0, y: 0, layer: 0,
      shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0e4a7a" }],
    },
    {
      id: "island", x: 0, y: 0, layer: 0,
      shapes: [
        { type: "ellipse", x: CX, y: CY, rx: RX + 10, ry: RY + 10, color: "#d9d9d9" },
        { type: "ellipse", x: CX, y: CY, rx: RX, ry: RY, color: "#f5f5f5" },
        { type: "ellipse", x: CX, y: CY, rx: 980, ry: 700, color: "rgba(210,210,210,0.28)" },
      ],
    },
    {
      id: "downtown-plaza", x: 0, y: 0, layer: 1,
      shapes: [
        { type: "rect", x: 1460, y: 1515, w: 680, h: 570, color: "rgba(220,220,220,0.46)", radius: 8 },
        { type: "rect", x: 1570, y: 1768, w: 460, h: 64, color: "rgba(255,255,255,0.35)", radius: 6 },
      ],
    },

    road("dt-north", [1040, Y_DT_N, 2560, Y_DT_N]),
    road("dt-mid", [1040, Y_DT_M, 2560, Y_DT_M]),
    road("dt-south", [1040, Y_DT_S, 2560, Y_DT_S]),
    road("dt-west", [X_DT_W, 1320, X_DT_W, 2280]),
    road("dt-east", [X_DT_E, 1320, X_DT_E, 2280]),
    road("sarthak-spur", [X_DT_E, 1980, 2770, 1980], 36),
    road("herndon-st", [700, Y_HERNDON, 1260, Y_HERNDON], 36),

    {
      id: "dt-label", x: 1800, y: 1345, layer: 4,
      shapes: [{ type: "text", x: 0, y: 0, text: "Downtown DC", color: "#4b5563",
        font: "bold 14px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
        shadow: { color: "rgba(255,255,255,0.92)", blur: 3 } }],
    },

    washingtonMonument,
    genericNorthWest,
    genericNorthEast,
    concertHall,
    capitolHill,
    sarthakApt,
    ...cityFill,
    aravsApt,
    tacoBamba,

    {
      id: "return", x: CX, y: CY + 730, layer: 5,
      shapes: [
        { type: "rect", x: -4, y: -10, w: 8, h: 50, color: "#4b5563", radius: 4 },
        { type: "rect", x: -52, y: -34, w: 104, h: 42, color: "rgba(15,23,42,0.28)", radius: 12 },
        { type: "rect", x: -48, y: -38, w: 96, h: 38, color: "#7c3aed", radius: 12, stroke: "#c4b5fd", lineWidth: 2 },
        { type: "circle", x: -26, y: -19, r: 11, color: "rgba(255,255,255,0.12)" },
        { type: "text", x: -26, y: -19, text: "🏰", color: "#fff",
          font: "16px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
          shadow: { color: "rgba(196,181,253,0.34)", blur: 8 } },
        { type: "text", x: 8, y: -19, text: "BACK TO VT", color: "#fff",
          font: "bold 11px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline,
          shadow: { color: "rgba(196,181,253,0.34)", blur: 6 } },
        { type: "line", x1: 10, y1: -6, x2: 28, y2: -6, color: "#c4b5fd", width: 2 },
        { type: "line", x1: 28, y1: -6, x2: 22, y2: -10, color: "#c4b5fd", width: 2 },
        { type: "line", x1: 28, y1: -6, x2: 22, y2: -2, color: "#c4b5fd", width: 2 },
      ],
      trigger: { type: "highway", name: "Return to VT", destination: "vt-island", hitbox: { ox: -72, oy: -56, w: 144, h: 120 } },
    },
  ],
  items: [],
  npcs: [],
};
