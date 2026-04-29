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
    { id: "south-beach", x: CX + 750, y: CY, layer: 1, shapes: [
      { type: "ellipse", x: 0, y: 0, rx: 350, ry: 900, color: "#f7e4a8" }, // sand
      { type: "rect", x: -50, y: -200, w: 20, h: 20, color: "#e91e63", radius: 2 }, // umbrella
      { type: "rect", x: -20, y: 150, w: 20, h: 20, color: "#00bcd4", radius: 2 }, // umbrella
      { type: "rect", x: -80, y: 400, w: 20, h: 20, color: "#ffeb3b", radius: 2 }, // umbrella
    ],
    label: { text: "South Beach", color: "#e91e63", font: "bold 20px sans-serif", offsetY: 0, shadow: { color: "rgba(255,255,255,0.8)", blur: 4 } },
    },

    // Yacht entity floating in the ocean next to the beach
    { id: "yacht", x: CX + 1200, y: CY, layer: 1, shapes: [
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
    solid: true, hitbox: { ox: -40, oy: -110, w: 80, h: 200 }
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

    // Distinct cluster of buildings representing "Clubs"
    { id: "clubs", x: CX + 200, y: CY + 200, layer: 3, shapes: [
      // Pavement area
      { type: "rect", x: -100, y: -80, w: 200, h: 160, color: "#37474f", radius: 10 },
      // Club 1
      { type: "rect", x: -80, y: -60, w: 70, h: 50, color: "#1a237e", radius: 4 },
      { type: "text", x: -45, y: -35, text: "LIV", color: "#e91e63", font: "bold 14px sans-serif", align: "center", baseline: "middle" as CanvasTextBaseline },
      // Club 2
      { type: "rect", x: 10, y: -60, w: 70, h: 50, color: "#000", radius: 4, stroke: "#00e5ff" },
      { type: "text", x: 45, y: -35, text: "STORY", color: "#00e5ff", font: "bold 14px sans-serif", align: "center", baseline: "middle" as CanvasTextBaseline },
      // Club 3
      { type: "rect", x: -35, y: 10, w: 70, h: 50, color: "#4a148c", radius: 4 },
      { type: "text", x: 0, y: 35, text: "E11EVEN", color: "#ffeb3b", font: "bold 12px sans-serif", align: "center", baseline: "middle" as CanvasTextBaseline },
    ],
    label: { text: "Nightclubs", color: "#fff", font: "bold 18px sans-serif", offsetY: 90, shadow: { color: "#000", blur: 4 } },
    solid: true, hitbox: { ox: -100, oy: -80, w: 200, h: 160 },
    trigger: { type: "zone", name: "Nightclubs", hitbox: { ox: -120, oy: -100, w: 240, h: 200 } }
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

    // Roads
    road("rd-main", [CX, CY - 1000, CX, CY + 300, CX + 400, CY + 300]),
    road("rd-clubs", [CX, CY + 200, CX + 100, CY + 200]),
    road("rd-airbnb", [CX, CY - 250, CX - 200, CY - 250]),
    road("rd-south", [CX, CY + 300, CX, CY + 900]),

    // Highway to Orlando
    { id: "hwy-orlando", x: CX, y: CY - 950, layer: 5, shapes: [
      { type: "rect", x: -65, y: -18, w: 130, h: 36, color: "rgba(33,150,243,0.88)", radius: 8 },
      { type: "text", x: 0, y: 0, text: "↑ Orlando", color: "#fff", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    trigger: { type: "highway", name: "Orlando", destination: "orlando", hitbox: { ox: -80, oy: -40, w: 160, h: 80 } },
    },

    // Return Highway to VT
    { id: "hwy-vt", x: CX, y: CY + 850, layer: 5, shapes: [
      { type: "rect", x: -65, y: -18, w: 130, h: 36, color: "rgba(255,152,0,0.8)", radius: 8 },
      { type: "text", x: 0, y: 0, text: "✈ Return to VT", color: "#fff", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    trigger: { type: "highway", name: "Return to VT", destination: "vt-island", hitbox: { ox: -80, oy: -40, w: 160, h: 80 } },
    },
  ],
  items: [], npcs: [],
};
