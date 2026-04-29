import type { Entity, MapData, Shape } from "../types";
const W = 3200, CX = W / 2, CY = W / 2;

function treeShape(x: number, y: number, r: number): Shape[] {
  return [
    { type: "circle", x, y, r: r + 2, color: "rgba(0,0,0,0.2)" },
    { type: "circle", x, y, r, color: "#2e7d32" },
    { type: "circle", x: x - r/4, y: y - r/4, r: r/1.5, color: "#4caf50" },
  ];
}

function generateTrees(): Entity {
  const shapes: Shape[] = [];
  // Main Island
  for (let i = 0; i < 150; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 500;
    const x = CX + Math.cos(angle) * radius;
    const y = CY + Math.sin(angle) * radius;
    shapes.push(...treeShape(x, y, 10 + Math.random() * 8));
  }
  // Vieques
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 200;
    const x = CX + 700 + Math.cos(angle) * radius;
    const y = CY + 300 + Math.sin(angle) * radius;
    shapes.push(...treeShape(x, y, 10 + Math.random() * 8));
  }
  // Culebra
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 100;
    const x = CX + 500 + Math.cos(angle) * radius;
    const y = CY - 400 + Math.sin(angle) * radius;
    shapes.push(...treeShape(x, y, 10 + Math.random() * 8));
  }
  return { id: "trees", x: 0, y: 0, layer: 4, shapes, solid: false };
}

function generateOldSanJuan(): Shape[] {
  const shapes: Shape[] = [];
  shapes.push({ type: "rect", x: -200, y: -150, w: 400, h: 300, color: "#9e9e9e", radius: 5 });
  
  const colors = ["#f48fb1", "#81d4fa", "#ffe082", "#a5d6a7", "#ce93d8", "#ffab91"];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      if (r === 1 && (c === 2 || c === 3)) continue; // Plaza area
      const bx = -180 + c * 75;
      const by = -130 + r * 70;
      const color = colors[(r * 5 + c) % colors.length];
      
      shapes.push({ type: "rect", x: bx, y: by, w: 65, h: 50, color, radius: 2 });
      shapes.push({ type: "rect", x: bx + 5, y: by - 5, w: 55, h: 10, color: "#d7ccc8", radius: 1 });
      shapes.push({ type: "rect", x: bx + 10, y: by + 10, w: 10, h: 15, color: "#fff" });
      shapes.push({ type: "rect", x: bx + 45, y: by + 10, w: 10, h: 15, color: "#fff" });
      shapes.push({ type: "rect", x: bx + 25, y: by + 25, w: 15, h: 25, color: "#5d4037" });
    }
  }
  // Plaza fountain
  shapes.push({ type: "circle", x: -180 + 2 * 75 + 32, y: -130 + 1 * 70 + 25, r: 25, color: "#cfd8dc" });
  shapes.push({ type: "circle", x: -180 + 2 * 75 + 32, y: -130 + 1 * 70 + 25, r: 18, color: "#29b6f6" });
  return shapes;
}

function generateVehicles(): Entity {
  const shapes: Shape[] = [];
  
  const addJeep = (x: number, y: number, color: string) => {
    shapes.push({ type: "rect", x: x - 2, y: y + 2, w: 20, h: 30, color: "rgba(0,0,0,0.3)", radius: 3 });
    shapes.push({ type: "rect", x, y, w: 20, h: 30, color, radius: 3 });
    shapes.push({ type: "rect", x: x + 2, y: y + 5, w: 16, h: 10, color: "#263238" });
    shapes.push({ type: "rect", x: x - 2, y: y + 5, w: 4, h: 8, color: "#000" });
    shapes.push({ type: "rect", x: x + 18, y: y + 5, w: 4, h: 8, color: "#000" });
    shapes.push({ type: "rect", x: x - 2, y: y + 20, w: 4, h: 8, color: "#000" });
    shapes.push({ type: "rect", x: x + 18, y: y + 20, w: 4, h: 8, color: "#000" });
  };

  const addGolfCart = (x: number, y: number) => {
    shapes.push({ type: "rect", x: x - 1, y: y + 1, w: 14, h: 20, color: "rgba(0,0,0,0.3)", radius: 2 });
    shapes.push({ type: "rect", x, y, w: 14, h: 20, color: "#90a4ae", radius: 2 });
    shapes.push({ type: "rect", x: x + 1, y: y + 2, w: 12, h: 16, color: "#fff", radius: 2 });
  };

  // Near Airbnb
  addJeep(CX - 150, CY + 250, "#d32f2f");
  addJeep(CX - 120, CY + 250, "#388e3c");
  addGolfCart(CX - 90, CY + 250);

  // Near Old San Juan
  addGolfCart(CX - 250, CY - 200);
  addGolfCart(CX - 220, CY - 200);
  addJeep(CX - 190, CY - 200, "#1976d2");
  addJeep(CX - 160, CY - 200, "#fbc02d");

  // Vieques
  addJeep(CX + 600, CY + 250, "#7b1fa2");
  addGolfCart(CX + 630, CY + 250);

  return { id: "vehicles", x: 0, y: 0, layer: 3, shapes, solid: false };
}

export const puertoRicoMap: MapData = {
  id: "puerto-rico", name: "Puerto Rico", worldWidth: W, worldHeight: W,
  spawnX: CX + 100, spawnY: CY + 250, spawnRotation: -Math.PI / 2,
  bgColor: "#0b7dab",
  boundary: { type: "ellipse", cx: CX, cy: CY, rx: 1200, ry: 1000 },
  entities: [
    { id: "ocean", x: 0, y: 0, layer: 0, shapes: [{ type: "rect", x: 0, y: 0, w: W, h: W, color: "#0b7dab" }] },
    { id: "terrain", x: 0, y: 0, layer: 0, shapes: [
      { type: "ellipse", x: CX, y: CY, rx: 610, ry: 410, color: "#f7e4a8" },
      { type: "ellipse", x: CX, y: CY, rx: 600, ry: 400, color: "#43a047" },
      { type: "ellipse", x: CX - 100, y: CY - 50, rx: 400, ry: 200, color: "#2e7d32" },
      
      { type: "ellipse", x: CX + 700, y: CY + 300, rx: 260, ry: 110, color: "#f7e4a8" },
      { type: "ellipse", x: CX + 700, y: CY + 300, rx: 250, ry: 100, color: "#43a047" },

      { type: "ellipse", x: CX + 500, y: CY - 400, rx: 160, ry: 110, color: "#f7e4a8" },
      { type: "ellipse", x: CX + 500, y: CY - 400, rx: 150, ry: 100, color: "#43a047" },
    ]},

    generateTrees(),
    generateVehicles(),

    // Old San Juan Cluster
    { id: "sanjuan", x: CX - 200, y: CY - 100, layer: 3, shapes: generateOldSanJuan(),
      label: { text: "Old San Juan", color: "#fff", font: "bold 20px sans-serif", offsetY: 180, shadow: { color: "rgba(0,0,0,0.8)", blur: 5 } },
      solid: true, hitbox: { ox: -200, oy: -150, w: 400, h: 300 },
      trigger: { type: "zone", name: "Old San Juan", hitbox: { ox: -250, oy: -200, w: 500, h: 400 } },
    },

    // Airbnb Building
    { id: "airbnb-pr", x: CX - 200, y: CY + 200, layer: 3, shapes: [
      { type: "rect", x: -40, y: -30, w: 80, h: 60, color: "#ffecb3", radius: 4 },
      { type: "rect", x: -45, y: -35, w: 90, h: 10, color: "#ff5722", radius: 2 }, // terracotta roof
      { type: "rect", x: 45, y: -10, w: 30, h: 20, color: "#00e5ff", radius: 4 }, // Pool
    ],
    label: { text: "Airbnb", color: "#fff", font: "bold 16px sans-serif", offsetY: 40, shadow: { color: "rgba(0,0,0,0.8)", blur: 4 } },
    solid: true, hitbox: { ox: -45, oy: -35, w: 90, h: 70 },
    trigger: { type: "zone", name: "Puerto Rico Airbnb", hitbox: { ox: -60, oy: -50, w: 140, h: 100 } }
    },

    { id: "airport-return", x: CX + 200, y: CY, layer: 5, shapes: [
      { type: "rect", x: -65, y: -18, w: 130, h: 36, color: "rgba(255,152,0,0.8)", radius: 8 },
      { type: "text", x: 0, y: 0, text: "✈ Airport", color: "#fff", font: "bold 12px sans-serif", align: "center" as CanvasTextAlign, baseline: "middle" as CanvasTextBaseline },
    ],
    trigger: { type: "airport", name: "SJU Airport", hitbox: { ox: -80, oy: -40, w: 160, h: 80 } },
    },
  ],
  items: [], npcs: [],
};
