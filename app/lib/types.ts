// ---------------------------------------------------------------------------
// Core type definitions for the data-driven map engine
// ---------------------------------------------------------------------------

export interface Hitbox {
  ox: number;
  oy: number;
  w: number;
  h: number;
}

export interface Trigger {
  type: "zone" | "airport" | "jukebox" | "highway";
  name: string;
  destination?: string;
  hitbox: Hitbox;
}

export interface Shape {
  type:
    | "rect"
    | "circle"
    | "ellipse"
    | "triangle"
    | "polygon"
    | "polyline"
    | "line"
    | "text";
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  r?: number;
  rx?: number;
  ry?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  x3?: number;
  y3?: number;
  points?: number[];
  color?: string;
  alpha?: number;
  radius?: number; // for rounded rects
  stroke?: string;
  lineWidth?: number;
  width?: number;
  cap?: CanvasLineCap;
  join?: CanvasLineJoin;
  dash?: number[];
  text?: string;
  font?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  shadow?: { color: string; blur: number };
}

export interface Label {
  text: string;
  color: string;
  font: string;
  offsetY: number;
  shadow: { color: string; blur: number };
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  layer: number;
  shapes: Shape[];
  solid?: boolean;
  hitbox?: Hitbox;
  trigger?: Trigger;
  label?: Label;
}

export interface NpcDef {
  id: string;
  name: string;
  spawnX: number;
  spawnY: number;
  speed: number;
  wanderRadius: number;
  bodyColor: string;
  accentColor: string;
}

export interface MapItem {
  id: string;
  type: string;
  x: number;
  y: number;
}

export interface Boundary {
  type: "ellipse";
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export interface MapData {
  id: string;
  name: string;
  worldWidth: number;
  worldHeight: number;
  spawnX: number;
  spawnY: number;
  spawnRotation: number;
  bgColor: string;
  boundary: Boundary;
  entities: Entity[];
  items: MapItem[];
  npcs: NpcDef[];
}

// ── Runtime state ─────────────────────────────────────────────────────────

export interface CarState {
  x: number;
  y: number;
  rotation: number;
  speed: number;
}

export interface NpcState {
  id: string;
  name: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  wanderRadius: number;
  bodyColor: string;
  accentColor: string;
  state: "walking" | "idle";
  idleTimer: number;
  homeX: number;
  homeY: number;
}

export interface ActiveTrigger {
  type: "zone" | "airport" | "highway" | "jukebox";
  name: string;
  entityId: string;
  destination?: string;
}
