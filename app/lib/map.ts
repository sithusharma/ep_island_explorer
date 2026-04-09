// ---------------------------------------------------------------------------
// Island map: geometry, zones, roads, landmarks, Easter eggs, drawing
// ---------------------------------------------------------------------------

/** The full world is a square of this size (in world-pixels). */
export const WORLD_SIZE = 4000;

/** Centre of the island (and the world). */
export const ISLAND_CX = WORLD_SIZE / 2;
export const ISLAND_CY = WORLD_SIZE / 2;

/** The island is an ellipse – semi-axes. */
export const ISLAND_RX = 1600;
export const ISLAND_RY = 1400;

// ── Location coordinates ───────────────────────────────────────────────────
// Every named place is positioned relative to the island centre.

export const LOC = {
  blacksburg: { x: ISLAND_CX, y: ISLAND_CY },
  miami: { x: ISLAND_CX + 200, y: ISLAND_CY + 1150 },
  cancun: { x: ISLAND_CX - 1050, y: ISLAND_CY + 950 },
  puertoRico: { x: ISLAND_CX + 1100, y: ISLAND_CY + 900 },
  tennessee: { x: ISLAND_CX - 750, y: ISLAND_CY - 750 },
  nyc: { x: ISLAND_CX + 850, y: ISLAND_CY - 700 },
  alcoholStore: { x: ISLAND_CX + 350, y: ISLAND_CY + 350 },
} as const;

// ── Discovery Zones ────────────────────────────────────────────────────────

export interface Zone {
  id: string;
  name: string;
  /** Centre of the rectangular hit-box (world coords). */
  x: number;
  y: number;
  /** Half-widths of the hit-box. */
  hw: number;
  hh: number;
  /** Colour used for the subtle ground marker. */
  color: string;
}

export const ZONES: Zone[] = [
  {
    id: "blacksburg",
    name: "Blacksburg, VA (VT)",
    x: LOC.blacksburg.x,
    y: LOC.blacksburg.y,
    hw: 160,
    hh: 140,
    color: "#8e3a0f",
  },
  {
    id: "miami",
    name: "Miami",
    x: LOC.miami.x,
    y: LOC.miami.y,
    hw: 180,
    hh: 100,
    color: "#f5d491",
  },
  {
    id: "cancun",
    name: "Cancún",
    x: LOC.cancun.x,
    y: LOC.cancun.y,
    hw: 170,
    hh: 100,
    color: "#f5d491",
  },
  {
    id: "puerto-rico",
    name: "Puerto Rico",
    x: LOC.puertoRico.x,
    y: LOC.puertoRico.y,
    hw: 170,
    hh: 100,
    color: "#f5d491",
  },
  {
    id: "tennessee",
    name: "Tennessee",
    x: LOC.tennessee.x,
    y: LOC.tennessee.y,
    hw: 200,
    hh: 180,
    color: "#8a7b6b",
  },
  {
    id: "nyc",
    name: "NYC",
    x: LOC.nyc.x,
    y: LOC.nyc.y,
    hw: 180,
    hh: 160,
    color: "#9e9e9e",
  },
  {
    id: "alcohol-store",
    name: "Alcohol Store",
    x: LOC.alcoholStore.x,
    y: LOC.alcoholStore.y,
    hw: 70,
    hh: 60,
    color: "#7b1fa2",
  },
];

// ── Road network ───────────────────────────────────────────────────────────
// Each road is an array of {x,y} waypoints from Blacksburg to a destination.
// Roads curve slightly so they look hand-placed rather than laser-straight.

interface Road {
  points: { x: number; y: number }[];
}

export const ROADS: Road[] = [
  // Blacksburg → Miami (south)
  {
    points: [
      LOC.blacksburg,
      { x: ISLAND_CX + 50, y: ISLAND_CY + 300 },
      { x: ISLAND_CX + 120, y: ISLAND_CY + 650 },
      { x: ISLAND_CX + 180, y: ISLAND_CY + 950 },
      LOC.miami,
    ],
  },
  // Blacksburg → Cancún (south-west)
  {
    points: [
      LOC.blacksburg,
      { x: ISLAND_CX - 200, y: ISLAND_CY + 200 },
      { x: ISLAND_CX - 500, y: ISLAND_CY + 500 },
      { x: ISLAND_CX - 800, y: ISLAND_CY + 750 },
      LOC.cancun,
    ],
  },
  // Blacksburg → Puerto Rico (south-east)
  {
    points: [
      LOC.blacksburg,
      { x: ISLAND_CX + 300, y: ISLAND_CY + 200 },
      { x: ISLAND_CX + 650, y: ISLAND_CY + 500 },
      { x: ISLAND_CX + 900, y: ISLAND_CY + 750 },
      LOC.puertoRico,
    ],
  },
  // Blacksburg → Tennessee (north-west)
  {
    points: [
      LOC.blacksburg,
      { x: ISLAND_CX - 200, y: ISLAND_CY - 200 },
      { x: ISLAND_CX - 450, y: ISLAND_CY - 450 },
      LOC.tennessee,
    ],
  },
  // Blacksburg → NYC (north-east)
  {
    points: [
      LOC.blacksburg,
      { x: ISLAND_CX + 200, y: ISLAND_CY - 200 },
      { x: ISLAND_CX + 500, y: ISLAND_CY - 450 },
      LOC.nyc,
    ],
  },
  // Blacksburg → Alcohol Store (short spur)
  {
    points: [
      LOC.blacksburg,
      { x: ISLAND_CX + 180, y: ISLAND_CY + 180 },
      LOC.alcoholStore,
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

/** Is a world-coordinate point inside the island ellipse? */
export function isOnIsland(wx: number, wy: number): boolean {
  const dx = (wx - ISLAND_CX) / ISLAND_RX;
  const dy = (wy - ISLAND_CY) / ISLAND_RY;
  return dx * dx + dy * dy <= 1;
}

/** Is a world-coordinate point inside a zone's hit-box? */
export function isInZone(wx: number, wy: number, z: Zone): boolean {
  return (
    wx >= z.x - z.hw &&
    wx <= z.x + z.hw &&
    wy >= z.y - z.hh &&
    wy <= z.y + z.hh
  );
}

// ── Drawing functions ──────────────────────────────────────────────────────

function drawOcean(ctx: CanvasRenderingContext2D) {
  // Deep ocean
  ctx.fillStyle = "#0e4a7a";
  ctx.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);

  // Lighter water ring near island
  const grad = ctx.createRadialGradient(
    ISLAND_CX, ISLAND_CY, 800,
    ISLAND_CX, ISLAND_CY, 2000
  );
  grad.addColorStop(0, "#1a7fbb");
  grad.addColorStop(1, "#0e4a7a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WORLD_SIZE, WORLD_SIZE);

  // Gentle wave lines
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    const y = 200 + i * 200;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < WORLD_SIZE; x += 60) {
      ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 12);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawIsland(ctx: CanvasRenderingContext2D) {
  // Sandy shore ring (drawn first, slightly larger)
  ctx.fillStyle = "#e8d5a3";
  ctx.beginPath();
  ctx.ellipse(ISLAND_CX, ISLAND_CY, ISLAND_RX + 15, ISLAND_RY + 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main island body
  const grad = ctx.createRadialGradient(
    ISLAND_CX - 200, ISLAND_CY - 200, 100,
    ISLAND_CX, ISLAND_CY, ISLAND_RX
  );
  grad.addColorStop(0, "#5cb860");
  grad.addColorStop(0.7, "#4caf50");
  grad.addColorStop(1, "#3d8b40");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(ISLAND_CX, ISLAND_CY, ISLAND_RX, ISLAND_RY, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawRoads(ctx: CanvasRenderingContext2D) {
  for (const road of ROADS) {
    const pts = road.points;
    if (pts.length < 2) continue;

    // Road shadow
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 42;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0].x + 2, pts[0].y + 2);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x + 2, pts[i].y + 2);
    }
    ctx.stroke();
    ctx.restore();

    // Road body
    ctx.strokeStyle = "#78909c";
    ctx.lineWidth = 36;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();

    // Centre dashed line
    ctx.save();
    ctx.strokeStyle = "#ffeb3b";
    ctx.lineWidth = 2;
    ctx.setLineDash([18, 14]);
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}

// ── Beaches ────────────────────────────────────────────────────────────────

function drawBeach(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  label: string
) {
  // Sand
  ctx.fillStyle = "#f7e4a8";
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wet sand rim
  ctx.strokeStyle = "#d4b96a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx - 4, ry - 4, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Umbrella 1
  drawUmbrella(ctx, cx - 40, cy - 15, "#e53935");
  // Umbrella 2
  drawUmbrella(ctx, cx + 35, cy + 10, "#1e88e5");

  // Palm tree
  drawPalmTree(ctx, cx + rx * 0.5, cy - ry * 0.3);

  // Label
  ctx.save();
  ctx.fillStyle = "#5d4037";
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, cx, cy + ry + 28);
  ctx.restore();
}

function drawUmbrella(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  // Pole
  ctx.strokeStyle = "#5d4037";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + 14);
  ctx.lineTo(x, y - 6);
  ctx.stroke();
  // Canopy
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - 6, 14, Math.PI, 0);
  ctx.fill();
}

function drawPalmTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Trunk
  ctx.strokeStyle = "#795548";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x, y + 30);
  ctx.quadraticCurveTo(x - 8, y + 10, x + 2, y - 10);
  ctx.stroke();

  // Fronds
  const frondColor = "#2e7d32";
  for (const angle of [-0.8, -0.3, 0.2, 0.7, 1.2]) {
    ctx.save();
    ctx.translate(x + 2, y - 10);
    ctx.rotate(angle);
    ctx.fillStyle = frondColor;
    ctx.beginPath();
    ctx.ellipse(20, 0, 24, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Tennessee Mountains ────────────────────────────────────────────────────

function drawMountains(ctx: CanvasRenderingContext2D) {
  const mx = LOC.tennessee.x;
  const my = LOC.tennessee.y;

  // Back range (lighter, farther)
  ctx.fillStyle = "#8d9da6";
  const backPeaks = [
    { cx: mx - 120, top: my - 200, base: my + 80, half: 110 },
    { cx: mx + 100, top: my - 170, base: my + 80, half: 100 },
  ];
  for (const p of backPeaks) {
    ctx.beginPath();
    ctx.moveTo(p.cx, p.top);
    ctx.lineTo(p.cx - p.half, p.base);
    ctx.lineTo(p.cx + p.half, p.base);
    ctx.closePath();
    ctx.fill();
  }

  // Front range (darker, closer)
  ctx.fillStyle = "#6d7f88";
  const frontPeaks = [
    { cx: mx, top: my - 260, base: my + 100, half: 140 },
    { cx: mx - 180, top: my - 140, base: my + 100, half: 100 },
    { cx: mx + 200, top: my - 120, base: my + 100, half: 90 },
  ];
  for (const p of frontPeaks) {
    ctx.beginPath();
    ctx.moveTo(p.cx, p.top);
    ctx.lineTo(p.cx - p.half, p.base);
    ctx.lineTo(p.cx + p.half, p.base);
    ctx.closePath();
    ctx.fill();
  }

  // Snow caps on the tallest peaks
  ctx.fillStyle = "#eceff1";
  // Main peak
  ctx.beginPath();
  ctx.moveTo(mx, my - 260);
  ctx.lineTo(mx - 40, my - 190);
  ctx.lineTo(mx + 40, my - 190);
  ctx.closePath();
  ctx.fill();
  // Back-left peak
  ctx.beginPath();
  ctx.moveTo(mx - 120, my - 200);
  ctx.lineTo(mx - 150, my - 150);
  ctx.lineTo(mx - 90, my - 150);
  ctx.closePath();
  ctx.fill();

  // Earthy base
  ctx.fillStyle = "#6d4c3d";
  ctx.fillRect(mx - 220, my + 60, 440, 50);

  // Label
  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 4;
  ctx.fillText("Tennessee", mx, my + 140);
  ctx.restore();
}

// ── NYC Skyline ────────────────────────────────────────────────────────────

function drawNYC(ctx: CanvasRenderingContext2D) {
  const nx = LOC.nyc.x;
  const ny = LOC.nyc.y;

  // Concrete ground slab
  ctx.fillStyle = "#bdbdbd";
  ctx.fillRect(nx - 180, ny + 40, 360, 60);

  // Buildings – array of [xOffset, width, height, color]
  const buildings: [number, number, number, string][] = [
    [-140, 45, 180, "#616161"],
    [-85, 55, 240, "#757575"],
    [-20, 40, 140, "#9e9e9e"],
    [30, 60, 280, "#546e7a"],  // tallest – "Empire State"
    [100, 50, 200, "#78909c"],
    [155, 40, 150, "#607d8b"],
  ];

  for (const [xo, w, h, col] of buildings) {
    // Building body
    ctx.fillStyle = col;
    ctx.fillRect(nx + xo - w / 2, ny + 40 - h, w, h);

    // Window grid
    ctx.fillStyle = "rgba(255,235,59,0.5)";
    const winW = 6;
    const winH = 8;
    const cols = Math.floor((w - 8) / 12);
    const rows = Math.floor((h - 16) / 16);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillRect(
          nx + xo - w / 2 + 6 + c * 12,
          ny + 40 - h + 10 + r * 16,
          winW,
          winH
        );
      }
    }

    // Roof accent
    ctx.fillStyle = "#424242";
    ctx.fillRect(nx + xo - w / 2, ny + 40 - h, w, 4);
  }

  // Spire on the tallest building
  ctx.strokeStyle = "#37474f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(nx + 30, ny + 40 - 280);
  ctx.lineTo(nx + 30, ny + 40 - 320);
  ctx.stroke();

  // Label
  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 4;
  ctx.fillText("NYC", nx, ny + 125);
  ctx.restore();
}

// ── Blacksburg / VT ────────────────────────────────────────────────────────

function drawBlacksburg(ctx: CanvasRenderingContext2D) {
  const bx = LOC.blacksburg.x;
  const by = LOC.blacksburg.y;

  // Maroon campus ground
  ctx.fillStyle = "rgba(99,0,49,0.18)";
  ctx.beginPath();
  ctx.ellipse(bx, by, 150, 130, 0, 0, Math.PI * 2);
  ctx.fill();

  // Burruss Hall (main building)
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(bx - 40, by - 50, 80, 60);
  // Roof
  ctx.fillStyle = "#5d4037";
  ctx.beginPath();
  ctx.moveTo(bx - 50, by - 50);
  ctx.lineTo(bx, by - 85);
  ctx.lineTo(bx + 50, by - 50);
  ctx.closePath();
  ctx.fill();
  // Door
  ctx.fillStyle = "#4e342e";
  ctx.fillRect(bx - 8, by - 8, 16, 18);

  // Smaller flanking buildings
  ctx.fillStyle = "#a1887f";
  ctx.fillRect(bx - 100, by - 20, 40, 35);
  ctx.fillRect(bx + 60, by - 20, 40, 35);

  // VT logo circle
  ctx.fillStyle = "#630031";
  ctx.beginPath();
  ctx.arc(bx, by + 50, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff6600";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("VT", bx, by + 51);
  ctx.textBaseline = "alphabetic";

  // Label
  ctx.save();
  ctx.fillStyle = "#630031";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Blacksburg, VA", bx, by + 100);
  ctx.restore();
}

// ── Alcohol Store ──────────────────────────────────────────────────────────

function drawAlcoholStore(ctx: CanvasRenderingContext2D) {
  const sx = LOC.alcoholStore.x;
  const sy = LOC.alcoholStore.y;

  // Building
  ctx.fillStyle = "#6a1b9a";
  ctx.fillRect(sx - 50, sy - 40, 100, 70);

  // Roof
  ctx.fillStyle = "#4a148c";
  ctx.fillRect(sx - 55, sy - 46, 110, 10);

  // Door
  ctx.fillStyle = "#e1bee7";
  ctx.fillRect(sx - 10, sy + 2, 20, 28);

  // Window
  ctx.fillStyle = "#ce93d8";
  ctx.fillRect(sx + 20, sy - 28, 18, 18);
  ctx.fillRect(sx - 38, sy - 28, 18, 18);

  // Neon sign
  ctx.fillStyle = "#ff6f00";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🍺 LIQUOR", sx, sy - 52);

  // Label
  ctx.save();
  ctx.fillStyle = "#4a148c";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Alcohol Store", sx, sy + 55);
  ctx.restore();
}

// ── Easter Eggs ────────────────────────────────────────────────────────────

function drawRaspberries(ctx: CanvasRenderingContext2D) {
  // Hidden off the Cancún road, in a clearing
  const rx = ISLAND_CX - 400;
  const ry = ISLAND_CY + 150;

  // Leaf base
  ctx.fillStyle = "#388e3c";
  ctx.beginPath();
  ctx.ellipse(rx, ry + 6, 18, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Berry cluster
  const berries = [
    { dx: 0, dy: -6 },
    { dx: -7, dy: -2 },
    { dx: 7, dy: -2 },
    { dx: -4, dy: -12 },
    { dx: 4, dy: -12 },
    { dx: 0, dy: -17 },
    { dx: -10, dy: -9 },
    { dx: 10, dy: -9 },
  ];
  for (const b of berries) {
    ctx.fillStyle = "#c62828";
    ctx.beginPath();
    ctx.arc(rx + b.dx, ry + b.dy, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Tiny highlight
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(rx + b.dx - 1, ry + b.dy - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPumpkins(ctx: CanvasRenderingContext2D) {
  // Hidden off the NYC road, tucked between trees
  const px = ISLAND_CX + 600;
  const py = ISLAND_CY - 200;

  // Main pumpkin body
  ctx.fillStyle = "#e65100";
  ctx.beginPath();
  ctx.ellipse(px, py, 16, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ribs
  ctx.strokeStyle = "#bf360c";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(px, py, 8, 13, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(px, py - 13);
  ctx.lineTo(px, py + 13);
  ctx.stroke();

  // Stem
  ctx.fillStyle = "#33691e";
  ctx.fillRect(px - 2, py - 18, 4, 8);

  // Leaf on stem
  ctx.fillStyle = "#558b2f";
  ctx.beginPath();
  ctx.ellipse(px + 5, py - 16, 7, 3, 0.4, 0, Math.PI * 2);
  ctx.fill();
}

// ── Scattered trees ────────────────────────────────────────────────────────

function drawTrees(ctx: CanvasRenderingContext2D) {
  const trees = [
    // Forest between Blacksburg and Tennessee
    { x: ISLAND_CX - 350, y: ISLAND_CY - 300, r: 26 },
    { x: ISLAND_CX - 420, y: ISLAND_CY - 200, r: 22 },
    { x: ISLAND_CX - 280, y: ISLAND_CY - 380, r: 20 },
    { x: ISLAND_CX - 500, y: ISLAND_CY - 350, r: 24 },
    // East side scattered
    { x: ISLAND_CX + 550, y: ISLAND_CY - 100, r: 20 },
    { x: ISLAND_CX + 650, y: ISLAND_CY - 250, r: 18 },
    { x: ISLAND_CX + 480, y: ISLAND_CY + 100, r: 22 },
    // Between Cancún and Miami
    { x: ISLAND_CX - 400, y: ISLAND_CY + 700, r: 20 },
    { x: ISLAND_CX - 200, y: ISLAND_CY + 600, r: 18 },
    { x: ISLAND_CX + 50, y: ISLAND_CY + 750, r: 16 },
    // North scattered
    { x: ISLAND_CX + 200, y: ISLAND_CY - 550, r: 18 },
    { x: ISLAND_CX - 100, y: ISLAND_CY - 500, r: 20 },
    // Near Easter eggs (cover for hidden items)
    { x: ISLAND_CX - 380, y: ISLAND_CY + 120, r: 20 },
    { x: ISLAND_CX - 430, y: ISLAND_CY + 180, r: 18 },
    { x: ISLAND_CX + 580, y: ISLAND_CY - 170, r: 16 },
    { x: ISLAND_CX + 630, y: ISLAND_CY - 220, r: 18 },
  ];

  for (const t of trees) {
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.beginPath();
    ctx.ellipse(t.x + 4, t.y + t.r - 2, t.r * 0.7, t.r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Trunk
    ctx.fillStyle = "#5d4037";
    ctx.fillRect(t.x - 4, t.y - 4, 8, 14);
    // Canopy
    ctx.fillStyle = "#2e7d32";
    ctx.beginPath();
    ctx.arc(t.x, t.y - 8, t.r, 0, Math.PI * 2);
    ctx.fill();
    // Canopy highlight
    ctx.fillStyle = "rgba(129,199,132,0.4)";
    ctx.beginPath();
    ctx.arc(t.x - t.r * 0.25, t.y - 8 - t.r * 0.25, t.r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Zone ground markers (subtle) ───────────────────────────────────────────

function drawZoneMarkers(ctx: CanvasRenderingContext2D) {
  for (const z of ZONES) {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = z.color;

    // Rounded rectangle
    const x = z.x - z.hw;
    const y = z.y - z.hh;
    const w = z.hw * 2;
    const h = z.hh * 2;
    const r = 12;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

// ── Composite world draw ───────────────────────────────────────────────────

export function drawWorld(ctx: CanvasRenderingContext2D) {
  drawOcean(ctx);
  drawIsland(ctx);
  drawRoads(ctx);
  drawZoneMarkers(ctx);

  // Beaches
  drawBeach(ctx, LOC.miami.x, LOC.miami.y, 160, 80, "Miami");
  drawBeach(ctx, LOC.cancun.x, LOC.cancun.y, 150, 75, "Cancún");
  drawBeach(ctx, LOC.puertoRico.x, LOC.puertoRico.y, 155, 78, "Puerto Rico");

  drawMountains(ctx);
  drawNYC(ctx);
  drawBlacksburg(ctx);
  drawAlcoholStore(ctx);

  // Easter eggs (drawn before trees so some get partially hidden)
  drawRaspberries(ctx);
  drawPumpkins(ctx);

  drawTrees(ctx);
}
