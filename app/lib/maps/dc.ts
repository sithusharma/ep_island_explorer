import type { Entity, MapData, Shape } from "../types";

const W = 3600;
const CX = 1900;
const CY = W / 2;

const ASPHALT = "#4d4b45";
const ROAD_SHADOW = "rgba(0,0,0,0.14)";

function road(id: string, pts: number[], width = 44): Entity {
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
  const shapes: Shape[] = [
    { type: "rect", x: -(w / 2) + 4, y: -(h / 2) + 4, w, h, color: "rgba(0,0,0,0.22)", radius: 2 },
    { type: "rect", x: -(w / 2), y: -(h / 2), w, h, color, radius: 2 },
    { type: "rect", x: -(w / 2) - 2, y: -(h / 2) - 6, w: w + 4, h: 7, color: "rgba(0,0,0,0.22)", radius: 1 },
    { type: "rect", x: -7, y: h / 2 - 16, w: 14, h: 16, color: "rgba(25,25,25,0.45)", radius: 1 },
  ];

  const cols = Math.max(1, Math.floor((w - 18) / 18));
  const rows = Math.max(1, Math.floor((h - 30) / 20));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      shapes.push({
        type: "rect",
        x: -(w / 2) + 9 + c * 18,
        y: -(h / 2) + 12 + r * 20,
        w: 10,
        h: 12,
        color: "rgba(210,235,255,0.38)",
        radius: 1,
      });
    }
  }

  return {
    id, x, y, layer: 3, shapes,
    label: label ? { text: label, color: "#fff", font: "bold 12px sans-serif", offsetY: h / 2 + 16, shadow: { color: "rgba(0,0,0,0.82)", blur: 3 } } : undefined,
    solid: true,
    hitbox: { ox: -(w / 2) - 3, oy: -(h / 2) - 8, w: w + 6, h: h + 14 },
    trigger: trigger && label ? { type: "zone", name: label, hitbox: { ox: -(w / 2) - 34, oy: -(h / 2) - 34, w: w + 68, h: h + 68 } } : undefined,
  };
}

function monument(id: string, x: number, y: number, label: string, shapes: Shape[]): Entity {
  return {
    id, x, y, layer: 3, shapes,
    label: { text: label, color: "#f7f1df", font: "bold 11px sans-serif", offsetY: 46, shadow: { color: "rgba(0,0,0,0.8)", blur: 3 } },
    solid: true,
    hitbox: { ox: -38, oy: -38, w: 76, h: 76 },
  };
}

const decades: Entity = {
  id: "decades", x: CX + 260, y: CY - 340, layer: 4,
  shapes: [
    { type: "rect", x: -32, y: -106, w: 64, h: 212, color: "rgba(0,0,0,0.30)", radius: 3 },
    { type: "rect", x: -28, y: -112, w: 56, h: 220, color: "#252033", radius: 3 },
    { type: "rect", x: -31, y: -119, w: 62, h: 12, color: "#ec407a", radius: 2 },
    { type: "rect", x: -28, y: -28, w: 56, h: 8, color: "#7e57c2" },
    { type: "rect", x: -10, y: 86, w: 20, h: 22, color: "#111018", radius: 2 },
    { type: "text", x: 0, y: -96, text: "DECADES", color: "#fff176", font: "bold 9px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    { type: "rect", x: -18, y: -80, w: 10, h: 14, color: "#80deea", radius: 1 },
    { type: "rect", x: 8, y: -80, w: 10, h: 14, color: "#80deea", radius: 1 },
    { type: "rect", x: -18, y: -52, w: 10, h: 14, color: "#f48fb1", radius: 1 },
    { type: "rect", x: 8, y: -52, w: 10, h: 14, color: "#f48fb1", radius: 1 },
    { type: "rect", x: -18, y: -4, w: 10, h: 14, color: "#fff59d", radius: 1 },
    { type: "rect", x: 8, y: -4, w: 10, h: 14, color: "#fff59d", radius: 1 },
    { type: "rect", x: -18, y: 28, w: 10, h: 14, color: "#80deea", radius: 1 },
    { type: "rect", x: 8, y: 28, w: 10, h: 14, color: "#80deea", radius: 1 },
  ],
  label: { text: "Decades", color: "#fff176", font: "bold 13px sans-serif", offsetY: 125, shadow: { color: "rgba(0,0,0,0.9)", blur: 4 } },
  solid: true,
  hitbox: { ox: -34, oy: -122, w: 68, h: 232 },
  trigger: { type: "zone", name: "Decades", hitbox: { ox: -58, oy: -138, w: 116, h: 276 } },
};

const dcBuildings: Entity[] = [
  // Downtown core
  building("capitol-hill", CX + 150, CY + 180, 150, 88, "#c9b8a2", "Capitol Hill", true),
  building("concert-hall", CX - 240, CY + 10, 132, 76, "#5b3d6e", "Concert Hall", true),
  building("city-hall", CX, CY - 10, 118, 88, "#90a4ae"),
  building("museum-row", CX + 260, CY + 10, 122, 80, "#a1887f"),
  // Bar Street
  building("shenanigans", CX - 20, CY - 340, 104, 64, "#6d4c41", "Shenanigans", true),
  building("irish-bar", CX + 120, CY - 340, 90, 62, "#2e6b43", "Irish Bar", true),
  decades,
  // Downtown edge
  building("sarthaks-apartment", CX + 520, CY + 110, 110, 130, "#8d6e63", "Sarthak's Apartment", true),
  // Herndon (far corner cluster)
  building("aravs-apartment", 760, CY + 560, 110, 122, "#795548", "Arav's Apartment", true),
  building("taco-bamba", 970, CY + 560, 132, 72, "#d84315", "Taco Bamba", true),
];

const cityFill: Entity[] = [
  building("dc-row-1", CX - 610, CY - 90, 82, 98, "#9e9e9e"),
  building("dc-row-2", CX - 470, CY + 220, 74, 88, "#b0a28d"),
  building("dc-row-3", CX - 180, CY + 320, 78, 96, "#8fa3ad"),
  building("dc-row-4", CX + 430, CY + 320, 76, 90, "#a1887f"),
  building("dc-row-5", CX + 710, CY - 10, 76, 98, "#78909c"),
  building("dc-row-6", CX + 690, CY + 260, 82, 104, "#9e9d8c"),
  building("dc-row-7", CX - 720, CY + 220, 84, 96, "#8d8d8d"),
  monument("lincoln-like", CX - 760, CY + 40, "Memorial", [
    { type: "rect", x: -38, y: -22, w: 76, h: 44, color: "#e8e0d2", radius: 2 },
    { type: "rect", x: -44, y: -32, w: 88, h: 10, color: "#d0c4ae", radius: 1 },
    { type: "rect", x: -34, y: -22, w: 6, h: 44, color: "#faf7ef" },
    { type: "rect", x: -12, y: -22, w: 6, h: 44, color: "#faf7ef" },
    { type: "rect", x: 10, y: -22, w: 6, h: 44, color: "#faf7ef" },
    { type: "rect", x: 30, y: -22, w: 6, h: 44, color: "#faf7ef" },
  ]),
  monument("capitol-like", CX + 40, CY + 200, "Capitol", [
    { type: "rect", x: -46, y: -4, w: 92, h: 46, color: "#eee8dc", radius: 2 },
    { type: "ellipse", x: 0, y: -12, rx: 38, ry: 28, color: "#f7f1e6" },
    { type: "ellipse", x: 0, y: -26, rx: 28, ry: 20, color: "#e3dccf" },
    { type: "rect", x: -5, y: -50, w: 10, h: 28, color: "#eee8dc" },
    { type: "circle", x: 0, y: -54, r: 4, color: "#d6c7ad" },
  ]),
  monument("jefferson-like", CX - 20, CY + 520, "Monument", [
    { type: "ellipse", x: 0, y: 8, rx: 48, ry: 30, color: "#d6cab7" },
    { type: "ellipse", x: 0, y: -6, rx: 40, ry: 28, color: "#eee8dc" },
    { type: "rect", x: -34, y: -6, w: 68, h: 28, color: "#f7f1e6" },
    { type: "rect", x: -24, y: -6, w: 5, h: 30, color: "#fffaf2" },
    { type: "rect", x: -8, y: -6, w: 5, h: 30, color: "#fffaf2" },
    { type: "rect", x: 8, y: -6, w: 5, h: 30, color: "#fffaf2" },
    { type: "rect", x: 24, y: -6, w: 5, h: 30, color: "#fffaf2" },
  ]),
];

export const dcMap: MapData = {
  id: "dc", name: "Washington DC", worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY + 360, spawnRotation: -Math.PI / 2,
  bgColor: "#0e4a7a",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 1550, ry: 1080 },
  entities: [
    { id: "ocean", x: 0, y: 0, layer: 0, shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0e4a7a" }] },
    { id: "island", x: 0, y: 0, layer: 0, shapes: [
      { type: "ellipse", x: CX, y: CY, rx: 1560, ry: 1090, color: "#bdbdbd" },
      { type: "ellipse", x: CX, y: CY, rx: 1550, ry: 1080, color: "#82a96f" },
      { type: "ellipse", x: CX - 40, y: CY - 90, rx: 700, ry: 570, color: "#7fa06e", alpha: 0.35 },
      { type: "ellipse", x: 865, y: CY + 560, rx: 320, ry: 190, color: "#6f9a62", alpha: 0.65 },
    ]},
    { id: "mall", x: 0, y: 0, layer: 1, shapes: [
      { type: "rect", x: CX - 360, y: CY - 70, w: 720, h: 140, color: "#a5d6a7", radius: 8 },
      { type: "rect", x: CX - 320, y: CY - 10, w: 640, h: 20, color: "rgba(255,255,255,0.16)", radius: 4 },
    ]},
    road("downtown-main", [CX - 560, CY + 60, CX + 700, CY + 60], 46),
    road("downtown-north", [CX - 320, CY - 80, CX + 420, CY - 80], 40),
    road("downtown-south", [CX - 240, CY + 250, CX + 420, CY + 250], 38),
    road("downtown-cross", [CX + 60, CY - 170, CX + 60, CY + 520], 38),
    road("strip-road", [CX - 120, CY - 340, CX + 380, CY - 340], 34),
    road("herndon-road", [CX - 420, CY + 560, 620, CY + 560], 48),
    road("herndon-main", [860, CY + 420, 860, CY + 700], 36),
    { id: "downtown-label", x: CX + 20, y: CY - 205, layer: 4, shapes: [
      { type: "text", x: 0, y: 0, text: "Downtown", color: "#fff", font: "bold 15px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
    ]},
    { id: "strip-label", x: CX + 120, y: CY - 435, layer: 4, shapes: [
      { type: "text", x: 0, y: 0, text: "Bar Street", color: "#fff", font: "bold 14px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
    ]},
    { id: "herndon-label", x: 865, y: CY + 390, layer: 4, shapes: [
      { type: "text", x: 0, y: 0, text: "Herndon", color: "#fff", font: "bold 13px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
    ]},
    ...cityFill,
    { id: "monument", x: CX, y: CY, layer: 3, shapes: [
      { type: "rect", x: -12, y: -8, w: 24, h: 16, color: "#e0e0e0" },
      { type: "polygon", points: [-6, -8, 6, -8, 3, -120, -3, -120], color: "#eee" },
      { type: "triangle", x1: -3, y1: -120, x2: 0, y2: -135, x3: 3, y3: -120, color: "#bdbdbd" },
    ],
    label: { text: "Washington Monument", color: "#fff", font: "bold 13px sans-serif", offsetY: 22, shadow: { color: "rgba(0,0,0,0.6)", blur: 3 } },
    solid: true, hitbox: { ox: -14, oy: -137, w: 28, h: 153 },
    },
    ...dcBuildings,
    { id: "return", x: CX, y: CY + 710, layer: 5, shapes: [
      { type: "rect", x: -65, y: -18, w: 130, h: 36, color: "rgba(33,150,243,0.8)", radius: 8 },
      { type: "text", x: 0, y: 0, text: "Back to VT", color: "#fff", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    trigger: { type: "highway", name: "Return to VT", destination: "vt-island", hitbox: { ox: -80, oy: -40, w: 160, h: 80 } },
    },
  ],
  items: [], npcs: [],
};
