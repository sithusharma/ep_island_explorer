import type { MapData } from "../types";
const W = 2800, CX = W / 2, CY = W / 2;

export const cancunMap: MapData = {
  id: "cancun", name: "Cancún", worldWidth: W, worldHeight: W,
  spawnX: CX - 200, spawnY: CY + 150, spawnRotation: -Math.PI / 2,
  bgColor: "#00838f",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 1100, ry: 1000 },
  entities: [
    { id: "ocean", x: 0, y: 0, layer: 0, shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#00838f" }] },
    { id: "island", x: 0, y: 0, layer: 0, shapes: [
      { type: "ellipse", x: CX, y: CY, rx: 1110, ry: 1010, color: "#fff9c4" },
      { type: "ellipse", x: CX, y: CY, rx: 1100, ry: 1000, color: "#66bb6a" },
    ]},

    // Large sweeping beach entities
    { id: "north-beach", x: CX, y: CY - 800, layer: 1, shapes: [
      { type: "ellipse", x: 0, y: 0, rx: 800, ry: 250, color: "#fff9c4" }, // Sand
      // Add a bunch of beach chairs / umbrellas
      { type: "rect", x: -200, y: -50, w: 20, h: 20, color: "#f44336", radius: 2 },
      { type: "rect", x: -100, y: -20, w: 20, h: 20, color: "#2196f3", radius: 2 },
      { type: "rect", x: 0, y: -80, w: 20, h: 20, color: "#4caf50", radius: 2 },
      { type: "rect", x: 150, y: -30, w: 20, h: 20, color: "#ff9800", radius: 2 },
      { type: "rect", x: 300, y: -60, w: 20, h: 20, color: "#9c27b0", radius: 2 },
    ],
    label: { text: "Playa Norte", color: "#f44336", font: "bold 20px sans-serif", offsetY: 0, shadow: { color: "rgba(255,255,255,0.8)", blur: 4 } },
    },
    
    { id: "east-beach", x: CX + 900, y: CY, layer: 1, shapes: [
      { type: "ellipse", x: 0, y: 0, rx: 250, ry: 800, color: "#fff9c4" }, // Sand
    ],
    label: { text: "Playa Este", color: "#ff9800", font: "bold 20px sans-serif", offsetY: 0, shadow: { color: "rgba(255,255,255,0.8)", blur: 4 } },
    },

    // Massive Resort Building Complex
    { id: "resort-complex", x: CX + 200, y: CY - 100, layer: 3, shapes: [
      // Base plaza
      { type: "rect", x: -200, y: -150, w: 400, h: 300, color: "#eeeeee", radius: 10 },
      // Main building
      { type: "rect", x: -150, y: -100, w: 300, h: 80, color: "#fff3e0", radius: 4 },
      // Wings
      { type: "rect", x: -180, y: -20, w: 60, h: 120, color: "#ffe0b2", radius: 4 },
      { type: "rect", x: 120, y: -20, w: 60, h: 120, color: "#ffe0b2", radius: 4 },
      // Grand Pool
      { type: "rect", x: -80, y: 20, w: 160, h: 80, color: "#00b0ff", radius: 8 },
      { type: "rect", x: -60, y: 30, w: 120, h: 60, color: "#40c4ff", radius: 4 },
      // Pool bar
      { type: "circle", x: 0, y: 60, r: 15, color: "#ffb300" },
    ],
    label: { text: "Grand Riviera Resort", color: "#fff", font: "bold 24px sans-serif", offsetY: 160, shadow: { color: "rgba(0,0,0,0.8)", blur: 5 } },
    solid: true, hitbox: { ox: -200, oy: -150, w: 400, h: 300 },
    trigger: { type: "zone", name: "Grand Riviera Resort", hitbox: { ox: -250, oy: -200, w: 500, h: 400 } },
    },

    // Clubs District
    { id: "clubs-cancun", x: CX - 400, y: CY + 300, layer: 3, shapes: [
      { type: "rect", x: -120, y: -100, w: 240, h: 200, color: "#212121", radius: 8 }, // Club zone paving
      // Coco Bongo
      { type: "rect", x: -100, y: -80, w: 80, h: 60, color: "#ff1744", radius: 5 },
      { type: "text", x: -60, y: -50, text: "COCO BONGO", color: "#fff", font: "bold 10px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
      // Mandala
      { type: "rect", x: 20, y: -80, w: 80, h: 60, color: "#6200ea", radius: 5 },
      { type: "text", x: 60, y: -50, text: "MANDALA", color: "#1de9b6", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
      // The City
      { type: "rect", x: -40, y: 20, w: 80, h: 60, color: "#000", stroke: "#ffff00", lineWidth: 3, radius: 5 },
      { type: "text", x: 0, y: 50, text: "THE CITY", color: "#ffff00", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    label: { text: "Hotel Zone Nightlife", color: "#fff", font: "bold 18px sans-serif", offsetY: 110, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
    solid: true, hitbox: { ox: -120, oy: -100, w: 240, h: 200 },
    trigger: { type: "zone", name: "Cancun Clubs", hitbox: { ox: -150, oy: -130, w: 300, h: 260 } },
    },

    // Nice Restaurant
    { id: "restaurant", x: CX - 300, y: CY - 300, layer: 3, shapes: [
      // Deck
      { type: "rect", x: -60, y: -50, w: 120, h: 100, color: "#795548", radius: 5 },
      // Main Building (distinct unique color: rose gold / coral)
      { type: "rect", x: -40, y: -40, w: 80, h: 60, color: "#ff7043", radius: 3 },
      { type: "rect", x: -45, y: -45, w: 90, h: 10, color: "#d84315", radius: 2 },
      // Tables
      { type: "circle", x: -30, y: 30, r: 10, color: "#fff" },
      { type: "circle", x: 0, y: 30, r: 10, color: "#fff" },
      { type: "circle", x: 30, y: 30, r: 10, color: "#fff" },
    ],
    label: { text: "Rosa Negra", color: "#fff", font: "bold 16px sans-serif", offsetY: 60, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
    solid: true, hitbox: { ox: -60, oy: -50, w: 120, h: 100 },
    trigger: { type: "zone", name: "Nice Restaurant", hitbox: { ox: -80, oy: -70, w: 160, h: 140 } },
    },

    { id: "return", x: CX, y: CY - 600, layer: 5, shapes: [
      { type: "rect", x: -65, y: -18, w: 130, h: 36, color: "rgba(255,152,0,0.8)", radius: 8 },
      { type: "text", x: 0, y: 0, text: "✈ Airport", color: "#fff", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    trigger: { type: "airport", name: "Cancun Airport", hitbox: { ox: -80, oy: -40, w: 160, h: 80 } },
    },
  ],
  items: [], npcs: [],
};
