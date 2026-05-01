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
  type: "zone" | "airport" | "jukebox" | "highway" | "ferry" | "graveyard";
  name: string;
  destination?: string;
  /** Ferry: world-space coordinates the car teleports to on the same map */
  destX?: number;
  destY?: number;
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
  clipToBoundary?: boolean;
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
  /** Optional sprite path under /public (ex: "/images/milo.png") */
  spriteSrc?: string;
  bodyColor: string;
  accentColor: string;
}

export interface MapItem {
  id: string;
  type: string;
  x: number;
  y: number;
}

export type Boundary =
  | { type: "ellipse";       cx: number; cy: number; rx: number; ry: number }
  | { type: "multi-ellipse"; ellipses: Array<{ cx: number; cy: number; rx: number; ry: number }> };

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
  spriteSrc?: string;
  bodyColor: string;
  accentColor: string;
  state: "walking" | "idle";
  idleTimer: number;
  homeX: number;
  homeY: number;
}

// ── Multiplayer peer (used by renderer) ──────────────────────────────────────

export interface PeerState {
  id: string;
  username: string;
  /** Interpolated render position (maintained by useMultiplayer) */
  renderX: number;
  renderY: number;
  renderRotation: number;
}

export interface ActiveTrigger {
  type: "zone" | "airport" | "highway" | "jukebox" | "ferry" | "graveyard";
  name: string;
  entityId: string;
  destination?: string;
  screenX?: number;
  screenY?: number;
}
