import type { Entity, MapData } from "../types";
const W = 2500, CX = W / 2, CY = W / 2;

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
  const shapes = [
    { type: "rect", x: -(w / 2) + 4, y: -(h / 2) + 4, w, h, color: "rgba(0,0,0,0.18)", radius: 4 },
    { type: "rect", x: -(w / 2), y: -(h / 2), w, h, color, radius: 4 },
    { type: "rect", x: -(w / 2) - 2, y: -(h / 2) - 8, w: w + 4, h: 10, color: "rgba(0,0,0,0.22)", radius: 2 },
  ] as Entity["shapes"];

  const cols = Math.max(1, Math.floor((w - 20) / 18));
  const rows = Math.max(1, Math.floor((h - 28) / 22));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      shapes.push({
        type: "rect",
        x: -(w / 2) + 9 + c * 18,
        y: -(h / 2) + 14 + r * 22,
        w: 9,
        h: 12,
        color: "rgba(210,235,255,0.38)",
        radius: 1,
      });
    }
  }

  return {
    id, x, y, layer: 3,
    shapes,
    label: label ? { text: label, color: "#fff", font: "bold 13px sans-serif", offsetY: h / 2 + 16, shadow: { color: "#000", blur: 4 } } : undefined,
    solid: true,
    hitbox: { ox: -(w / 2), oy: -(h / 2), w, h },
  };
}

function destinationSign(id: string, x: number, y: number, label: string, icon: string, destination: string): Entity {
  return {
    id, x, y, layer: 5,
    shapes: [
      { type: "rect", x: -4, y: -10, w: 8, h: 50, color: "#4b5563", radius: 4 },
      { type: "rect", x: -52, y: -34, w: 104, h: 42, color: "rgba(15,23,42,0.28)", radius: 12 },
      { type: "rect", x: -48, y: -38, w: 96, h: 38, color: "#1d4ed8", radius: 12, stroke: "#93c5fd", lineWidth: 2 },
      { type: "circle", x: -26, y: -19, r: 11, color: "rgba(255,255,255,0.12)" },
      { type: "text", x: -26, y: -19, text: icon, color: "#fff", font: "16px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline, shadow: { color: "rgba(147,197,253,0.7)", blur: 8 } },
      { type: "text", x: 8, y: -19, text: label.toUpperCase(), color: "#fff", font: "bold 11px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline, shadow: { color: "rgba(147,197,253,0.7)", blur: 6 } },
      { type: "line", x1: 10, y1: -6, x2: 28, y2: -6, color: "#93c5fd", width: 2 },
      { type: "line", x1: 28, y1: -6, x2: 22, y2: -10, color: "#93c5fd", width: 2 },
      { type: "line", x1: 28, y1: -6, x2: 22, y2: -2, color: "#93c5fd", width: 2 },
    ],
    trigger: { type: "highway", name: label, destination, hitbox: { ox: -72, oy: -56, w: 144, h: 120 } },
  };
}

export const miamiMap: MapData = {
  id: "miami", name: "Miami", worldWidth: W, worldHeight: W,
  spawnX: CX, spawnY: CY, spawnRotation: -Math.PI / 2,
  bgColor: "#0b7dab",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 980, ry: 980 },
  entities: [
    { id: "ocean", x: 0, y: 0, layer: 0, shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0b7dab" }] },
    { id: "island", x: 0, y: 0, layer: 0, shapes: [
      { type: "ellipse", x: CX, y: CY, rx: 990, ry: 990, color: "#f7e4a8" },
      { type: "ellipse", x: CX, y: CY, rx: 980, ry: 980, color: "#66bb6a" },
    ]},
    
    // Filled beach band along the east shoreline
    { id: "south-beach", x: 0, y: 0, layer: 1, shapes: [
      { type: "rect", x: CX + 540, y: CY - 690, w: 410, h: 1380, color: "#f7e4a8" },
      { type: "line", x1: CX + 540, y1: CY - 560, x2: CX + 540, y2: CY + 560, color: "rgba(255,255,255,0.28)", width: 5 },
      { type: "rect", x: CX + 700, y: CY - 200, w: 20, h: 20, color: "#e91e63", radius: 2 },
      { type: "rect", x: CX + 730, y: CY + 150, w: 20, h: 20, color: "#00bcd4", radius: 2 },
      { type: "rect", x: CX + 670, y: CY + 400, w: 20, h: 20, color: "#ffeb3b", radius: 2 },
    ],
    label: { text: "South Beach", color: "#e91e63", font: "bold 20px sans-serif", offsetY: 0, shadow: { color: "rgba(255,255,255,0.8)", blur: 4 } },
    trigger: { type: "zone", name: "South Beach", hitbox: { ox: CX + 560, oy: CY - 520, w: 240, h: 1040 } },
    },

    // Yacht entity floating just off the beach edge
    { id: "yacht", x: CX + 1035, y: CY + 10, layer: 4, clipToBoundary: false, shapes: [
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
    trigger: { type: "zone", name: "Luxury Yacht", hitbox: { ox: -495, oy: -150, w: 555, h: 300 } }
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
    trigger: { type: "zone", name: "Airbnb", hitbox: { ox: -86, oy: -74, w: 212, h: 132 } }
    },

    // Mainland district west of the main street
    { id: "mainland-miami-label", x: CX - 470, y: CY - 520, layer: 4, shapes: [
      { type: "text", x: 0, y: 0, text: "Mainland Miami", color: "#fff", font: "bold 15px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline, shadow: { color: "#000", blur: 4 } },
    ]},
    tower("mainland-miami-1", CX - 470, CY - 430, 82, 200, "#90a4ae"),
    tower("mainland-miami-2", CX - 620, CY - 360, 74, 158, "#78909c"),
    tower("mainland-miami-3", CX - 470, CY - 190, 74, 156, "#8d9ea6"),
    tower("mainland-miami-4", CX - 620, CY - 130, 78, 138, "#607d8b"),
    tower("mainland-miami-5", CX - 470, CY + 50, 86, 168, "#78909c"),
    tower("mainland-miami-6", CX - 620, CY + 90, 74, 138, "#b0bec5"),
    tower("mainland-miami-7", CX - 470, CY + 260, 82, 156, "#90a4ae"),
    tower("mainland-miami-8", CX - 620, CY + 315, 72, 132, "#78909c"),

    // Linear nightlife strip running parallel to the main road
    { id: "clubs", x: CX + 220, y: CY + 70, layer: 3, shapes: [
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
    { id: "hotel", x: CX - 150, y: CY + 100, layer: 3, shapes: [
      { type: "rect", x: -40, y: -60, w: 80, h: 120, color: "#e0f7fa", radius: 4 },
      { type: "rect", x: -44, y: -66, w: 88, h: 10, color: "#00acc1", radius: 3 },
      { type: "rect", x: -24, y: -34, w: 14, h: 16, color: "rgba(210,235,255,0.42)", radius: 1 },
      { type: "rect", x: 10, y: -34, w: 14, h: 16, color: "rgba(210,235,255,0.42)", radius: 1 },
      { type: "rect", x: -24, y: -2, w: 14, h: 16, color: "rgba(210,235,255,0.42)", radius: 1 },
      { type: "rect", x: 10, y: -2, w: 14, h: 16, color: "rgba(210,235,255,0.42)", radius: 1 },
      { type: "rect", x: -6, y: 30, w: 12, h: 18, color: "#5d4037", radius: 1 },
    ],
    solid: true, hitbox: { ox: -46, oy: -68, w: 92, h: 138 },
    trigger: { type: "zone", name: "Oceanview Hotel", hitbox: { ox: -70, oy: -90, w: 140, h: 180 } },
    },

    // Airport terminal
    { id: "miami-airport", x: CX - 360, y: CY + 630, layer: 3, shapes: [
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
    road("rd-main", [CX, CY - 820, CX, CY + 820]),
    road("rd-clubs", [CX, CY + 70, CX + 160, CY + 70]),
    road("rd-airbnb", [CX, CY - 250, CX - 200, CY - 250]),
    road("rd-mainland-north", [CX, CY - 360, CX - 380, CY - 360]),
    road("rd-mainland-mid", [CX, CY - 90, CX - 380, CY - 90]),
    road("rd-mainland-south", [CX, CY + 170, CX - 380, CY + 170]),
    road("rd-mainland-lower", [CX, CY + 410, CX - 380, CY + 410]),
    road("rd-airport", [CX, CY + 560, CX - 280, CY + 560]),
    { id: "fake-id-marker", x: CX + 170, y: CY - 240, layer: 2, shapes: [
      { type: "circle", x: 0, y: 0, r: 44, color: "rgba(255,255,255,0.16)" },
      { type: "circle", x: 0, y: 0, r: 34, color: "rgba(30,136,229,0.24)", stroke: "rgba(255,255,255,0.65)", lineWidth: 3 },
      { type: "text", x: 0, y: 1, text: "🪪", color: "#fff", font: "bold 28px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    label: { text: "Fake ID", color: "#ffffff", font: "bold 14px sans-serif", offsetY: 54, shadow: { color: "#000", blur: 4 } },
    solid: false,
    },
    { id: "beach-props", x: 0, y: 0, layer: 2, shapes: [
      { type: "rect", x: CX + 540, y: CY - 280, w: 26, h: 10, color: "#ffffff", radius: 3 },
      { type: "rect", x: CX + 544, y: CY - 296, w: 18, h: 18, color: "#ff7043", radius: 3 },
      { type: "rect", x: CX + 610, y: CY + 20, w: 26, h: 10, color: "#ffffff", radius: 3 },
      { type: "rect", x: CX + 614, y: CY + 4, w: 18, h: 18, color: "#42a5f5", radius: 3 },
      { type: "rect", x: CX + 560, y: CY + 300, w: 28, h: 10, color: "#ffffff", radius: 3 },
      { type: "rect", x: CX + 566, y: CY + 284, w: 18, h: 18, color: "#ffca28", radius: 3 },
    ]},

    // Highway to Orlando
    destinationSign("hwy-orlando", CX, CY - 840, "Orlando", "🎢", "orlando"),
  ],
  artifacts: [
    {
      id: "fake-id",
      name: "Fake ID",
      mapCoordinates: { x: CX + 170, y: CY - 240 },
      requiredPlayer: "all",
      stageRequired: 0,
      icon: "🪪",
      description: "A suspiciously convincing ID card. Now you can get into the ABC Store!",
      hitbox: { w: 120, h: 120 },
      advanceStageTo: 1,
    }
  ],
  items: [],
  npcs: [],
};
