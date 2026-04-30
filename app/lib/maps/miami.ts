import type { Entity, MapData } from "../types";
const W = 2800, CX = W / 2, CY = W / 2;

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

function palm(x: number, y: number): Entity {
  return {
    id: `palm-${x}-${y}`, x, y, layer: 4,
    shapes: [
      { type: "rect", x: -3, y: -20, w: 6, h: 24, color: "#7b5e3b", radius: 2 },
      { type: "circle", x: 0, y: -22, r: 15, color: "#2e7d32" },
      { type: "circle", x: -10, y: -18, r: 10, color: "#43a047" },
      { type: "circle", x: 10, y: -18, r: 10, color: "#43a047" },
    ],
  };
}

function tower(id: string, x: number, y: number, w: number, h: number, color: string, label?: string): Entity {
  return {
    id, x, y, layer: 3,
    shapes: [
      { type: "rect", x: -(w / 2) + 4, y: -(h / 2) + 4, w, h, color: "rgba(0,0,0,0.18)", radius: 4 },
      { type: "rect", x: -(w / 2), y: -(h / 2), w, h, color, radius: 4 },
      { type: "rect", x: -(w / 2) - 2, y: -(h / 2) - 8, w: w + 4, h: 10, color: "rgba(0,0,0,0.22)", radius: 2 },
    ],
    label: label ? { text: label, color: "#fff", font: "bold 13px sans-serif", offsetY: h / 2 + 16, shadow: { color: "#000", blur: 4 } } : undefined,
    solid: true,
    hitbox: { ox: -(w / 2), oy: -(h / 2), w, h },
  };
}

export const miamiMap: MapData = {
  id: "miami", name: "Miami", worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY, spawnRotation: -Math.PI / 2,
  bgColor: "#0b7dab",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 1100, ry: 1100 },
  entities: [
    { id: "ocean", x: 0, y: 0, layer: 0, shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0b7dab" }] },
    { id: "island", x: 0, y: 0, layer: 0, shapes: [
      { type: "ellipse", x: CX, y: CY, rx: 1110, ry: 1110, color: "#f7e4a8" },
      { type: "ellipse", x: CX, y: CY, rx: 1100, ry: 1100, color: "#66bb6a" },
    ]},
    
    // Massive sand-colored Beach entity running along east side
    { id: "south-beach", x: CX + 700, y: CY, layer: 1, shapes: [
      { type: "ellipse", x: 0, y: 0, rx: 255, ry: 720, color: "#f7e4a8" },
      { type: "rect", x: -50, y: -200, w: 20, h: 20, color: "#e91e63", radius: 2 }, // umbrella
      { type: "rect", x: -20, y: 150, w: 20, h: 20, color: "#00bcd4", radius: 2 }, // umbrella
      { type: "rect", x: -80, y: 400, w: 20, h: 20, color: "#ffeb3b", radius: 2 }, // umbrella
    ],
    label: { text: "South Beach", color: "#e91e63", font: "bold 20px sans-serif", offsetY: 0, shadow: { color: "rgba(255,255,255,0.8)", blur: 4 } },
    },

    // Yacht entity floating just off the beach edge
    { id: "yacht", x: CX + 1005, y: CY + 10, layer: 3, shapes: [
      // Wake
      { type: "ellipse", x: 0, y: 40, rx: 30, ry: 80, color: "rgba(255,255,255,0.4)" },
      // Hull
      { type: "polygon", points: [0,-100, 30,-30, 30,80, -30,80, -30,-30], color: "#ffffff", stroke: "#eceff1" },
      // Deck
      { type: "rect", x: -20, y: -20, w: 40, h: 80, color: "#cfd8dc", radius: 5 },
      // Bridge
      { type: "rect", x: -15, y: -10, w: 30, h: 20, color: "#90caf9", radius: 3 },
      // Helipad
      { type: "circle", x: 0, y: 40, r: 15, color: "#78909c" },
      { type: "text", x: 0, y: 40, text: "H", color: "#fff", font: "bold 14px sans-serif", align: "center", baseline: "middle" as CanvasTextBaseline }
    ],
    label: { text: "Luxury Yacht", color: "#fff", font: "bold 16px sans-serif", offsetY: 100, shadow: { color: "#000", blur: 4 } },
    solid: false,
    trigger: { type: "zone", name: "Luxury Yacht", hitbox: { ox: -220, oy: -150, w: 280, h: 300 } }
    },

    // Airbnb building with bright blue pool shape
    { id: "airbnb", x: CX - 300, y: CY - 300, layer: 3, shapes: [
      // Pool (backyard)
      { type: "rect", x: 30, y: -30, w: 60, h: 40, color: "#00e5ff", radius: 5 },
      // Pool deck
      { type: "rect", x: 25, y: -35, w: 70, h: 50, color: "rgba(0,0,0,0)", stroke: "#cfd8dc", lineWidth: 4 },
      // House
      { type: "rect", x: -50, y: -40, w: 80, h: 60, color: "#fff", radius: 4, stroke: "#e0e0e0" },
      // Roof detail
      { type: "rect", x: -40, y: -30, w: 60, h: 40, color: "#eceff1", radius: 2 },
    ],
    label: { text: "Airbnb", color: "#fff", font: "bold 16px sans-serif", offsetY: 40, shadow: { color: "#000", blur: 4 } },
    solid: true, hitbox: { ox: -60, oy: -50, w: 160, h: 80 },
    trigger: { type: "zone", name: "Airbnb", hitbox: { ox: -70, oy: -60, w: 180, h: 100 } }
    },

    // Compact downtown district behind the Airbnb
    { id: "downtown-miami-label", x: CX - 700, y: CY - 545, layer: 4, shapes: [
      { type: "text", x: 0, y: 0, text: "Downtown Miami", color: "#fff", font: "bold 15px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline, shadow: { color: "#000", blur: 4 } },
    ]},
    tower("downtown-miami-1", CX - 780, CY - 430, 74, 180, "#78909c"),
    tower("downtown-miami-2", CX - 660, CY - 470, 84, 228, "#90a4ae"),
    tower("downtown-miami-3", CX - 545, CY - 420, 72, 168, "#607d8b"),
    tower("downtown-miami-4", CX - 790, CY - 165, 88, 148, "#8d9ea6"),
    tower("downtown-miami-5", CX - 655, CY - 140, 68, 132, "#b0bec5"),
    tower("downtown-miami-6", CX - 540, CY - 175, 82, 152, "#78909c"),

    // Linear nightlife strip running parallel to the main road
    { id: "clubs", x: CX + 260, y: CY + 70, layer: 3, shapes: [
      { type: "rect", x: -66, y: -180, w: 132, h: 360, color: "#2f3640", radius: 12 },
      { type: "rect", x: -48, y: -154, w: 96, h: 58, color: "#1a237e", radius: 5 },
      { type: "text", x: 0, y: -125, text: "LIV", color: "#e91e63", font: "bold 14px sans-serif", align: "center", baseline: "middle" as CanvasTextBaseline },
      { type: "rect", x: -48, y: -54, w: 96, h: 58, color: "#111827", stroke: "#00e5ff", lineWidth: 3, radius: 5 },
      { type: "text", x: 0, y: -25, text: "STORY", color: "#00e5ff", font: "bold 13px sans-serif", align: "center", baseline: "middle" as CanvasTextBaseline },
      { type: "rect", x: -48, y: 46, w: 96, h: 58, color: "#4a148c", radius: 5 },
      { type: "text", x: 0, y: 75, text: "E11EVEN", color: "#ffeb3b", font: "bold 12px sans-serif", align: "center", baseline: "middle" as CanvasTextBaseline },
      { type: "rect", x: -48, y: 146, w: 96, h: 24, color: "#5d4037", radius: 4 },
      { type: "text", x: 0, y: 158, text: "Nightlife Strip", color: "#ffd1e8", font: "bold 11px sans-serif", align: "center", baseline: "middle" as CanvasTextBaseline },
    ],
    label: { text: "Nightlife Strip", color: "#fff", font: "bold 18px sans-serif", offsetY: 204, shadow: { color: "#000", blur: 4 } },
    solid: true, hitbox: { ox: -66, oy: -180, w: 132, h: 360 },
    trigger: { type: "zone", name: "Nightclubs", hitbox: { ox: -94, oy: -208, w: 188, h: 420 } }
    },

    // Oceanview Hotel
    { id: "hotel", x: CX - 100, y: CY + 100, layer: 3, shapes: [
      { type: "rect", x: -40, y: -60, w: 80, h: 120, color: "#e0f7fa", radius: 4 },
      { type: "rect", x: -44, y: -66, w: 88, h: 10, color: "#00acc1", radius: 3 },
    ],
    label: { text: "Oceanview Hotel", color: "#fff", font: "bold 13px sans-serif", offsetY: 75, shadow: { color: "rgba(0,0,0,0.6)", blur: 3 } },
    solid: true, hitbox: { ox: -46, oy: -68, w: 92, h: 138 },
    trigger: { type: "zone", name: "Oceanview Hotel", hitbox: { ox: -70, oy: -90, w: 140, h: 180 } },
    },

    // West-side urban backdrop opposite the beach
    { id: "city-backdrop", x: 0, y: 0, layer: 1, shapes: [
      { type: "rect", x: 840, y: 350, w: 90, h: 220, color: "#78909c", radius: 3 },
      { type: "rect", x: 952, y: 300, w: 72, h: 270, color: "#90a4ae", radius: 3 },
      { type: "rect", x: 1040, y: 390, w: 84, h: 180, color: "#607d8b", radius: 3 },
      { type: "rect", x: 860, y: 610, w: 60, h: 12, color: "#546e7a" },
      { type: "rect", x: 972, y: 610, w: 48, h: 12, color: "#546e7a" },
      { type: "rect", x: 1060, y: 610, w: 56, h: 12, color: "#546e7a" },
    ]},

    // Airport terminal
    { id: "miami-airport", x: CX - 420, y: CY + 690, layer: 3, shapes: [
      { type: "rect", x: -92, y: -28, w: 184, h: 56, color: "#607d8b", radius: 8 },
      { type: "rect", x: -78, y: -18, w: 156, h: 32, color: "#90a4ae", radius: 6 },
      { type: "rect", x: -18, y: -56, w: 36, h: 28, color: "#546e7a", radius: 4 },
      { type: "rect", x: -24, y: -64, w: 48, h: 10, color: "#37474f", radius: 3 },
      { type: "text", x: 0, y: -40, text: "✈", color: "#eef6ff", font: "bold 20px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    label: { text: "Miami Airport", color: "#fff", font: "bold 14px sans-serif", offsetY: 72, shadow: { color: "#000", blur: 4 } },
    solid: false,
    trigger: { type: "airport", name: "Miami Airport", destination: "vt-island", hitbox: { ox: -120, oy: -30, w: 240, h: 90 } },
    },

    // Roads
    road("rd-main", [CX, CY - 1000, CX, CY + 300, CX + 400, CY + 300]),
    road("rd-clubs", [CX + 120, CY + 70, CX + 200, CY + 70]),
    road("rd-airbnb", [CX, CY - 250, CX - 200, CY - 250]),
    road("rd-downtown-entry", [CX - 200, CY - 250, CX - 470, CY - 250, CX - 470, CY - 350]),
    road("rd-downtown-west", [CX - 880, CY - 350, CX - 480, CY - 350]),
    road("rd-downtown-south", [CX - 850, CY - 70, CX - 490, CY - 70]),
    road("rd-downtown-link", [CX - 700, CY - 520, CX - 700, CY - 110]),
    road("rd-airport", [CX, CY + 620, CX - 320, CY + 620]),
    road("rd-south", [CX, CY + 300, CX, CY + 900]),

    // Decorative palms along the road corridor
    palm(CX - 110, CY - 860),
    palm(CX + 108, CY - 780),
    palm(CX - 112, CY - 670),
    palm(CX + 112, CY - 560),
    palm(CX - 110, CY - 450),
    palm(CX + 110, CY - 340),
    palm(CX - 110, CY - 220),
    palm(CX + 112, CY - 90),
    palm(CX - 108, CY + 40),
    palm(CX + 112, CY + 170),
    palm(CX - 110, CY + 300),
    palm(CX + 112, CY + 430),
    palm(CX - 108, CY + 560),
    palm(CX + 110, CY + 700),
    palm(CX - 110, CY + 840),
    palm(CX + 260, CY + 298),
    palm(CX + 362, CY + 302),
    palm(CX - 220, CY - 248),
    palm(CX - 120, CY - 250),
    palm(CX - 12, CY + 302),
    palm(CX + 520, CY - 540),
    palm(CX + 560, CY - 320),
    palm(CX + 600, CY - 80),
    palm(CX + 608, CY + 180),
    { id: "beach-props", x: CX + 690, y: CY + 40, layer: 2, shapes: [
      { type: "rect", x: -64, y: -320, w: 26, h: 10, color: "#ffffff", radius: 3 },
      { type: "rect", x: -60, y: -336, w: 18, h: 18, color: "#ff7043", radius: 3 },
      { type: "rect", x: 22, y: -160, w: 26, h: 10, color: "#ffffff", radius: 3 },
      { type: "rect", x: 26, y: -176, w: 18, h: 18, color: "#42a5f5", radius: 3 },
      { type: "rect", x: -42, y: 92, w: 30, h: 10, color: "#ffffff", radius: 3 },
      { type: "rect", x: -38, y: 76, w: 18, h: 18, color: "#ab47bc", radius: 3 },
      { type: "rect", x: 48, y: 280, w: 28, h: 10, color: "#ffffff", radius: 3 },
      { type: "rect", x: 54, y: 264, w: 18, h: 18, color: "#ffca28", radius: 3 },
    ]},

    // Highway to Orlando
    { id: "hwy-orlando", x: CX, y: CY - 950, layer: 5, shapes: [
      { type: "rect", x: -82, y: -20, w: 164, h: 40, color: "rgba(33,150,243,0.88)", radius: 10 },
      { type: "text", x: 0, y: 0, text: "🎢 Orlando", color: "#fff", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    trigger: { type: "highway", name: "Orlando", destination: "orlando", hitbox: { ox: -96, oy: -44, w: 192, h: 88 } },
    },
  ],
  items: [], npcs: [],
};
