"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useCarPhysics } from "@/app/hooks/useCarPhysics";
import { useGameLoop } from "@/app/hooks/useGameLoop";
import {
  drawWorld,
  ZONES,
  ROADS,
  isInZone,
  ISLAND_CX,
  ISLAND_CY,
  ISLAND_RX,
  ISLAND_RY,
  WORLD_SIZE,
  type Zone,
} from "@/app/lib/map";
import ZoneModal from "./ZoneModal";

// ── Car drawing constants ──────────────────────────────────────────────────

const CAR_LENGTH = 38;
const CAR_WIDTH = 22;

// ── Minimap constants ──────────────────────────────────────────────────────

const MINIMAP_SIZE = 170;
const MINIMAP_MARGIN = 14;

// ── Component ──────────────────────────────────────────────────────────────

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { car, keys, update } = useCarPhysics();
  const [activeZone, setActiveZone] = useState<Zone | null>(null);
  const activeZoneRef = useRef<Zone | null>(null);

  // Keep ref in sync so we can read it inside the keydown handler
  activeZoneRef.current = activeZone;

  // ── Enter-key handler (opens blank tab when in a zone) ────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && activeZoneRef.current) {
        window.open("", "_blank");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Viewport size ref (avoids re-renders)
  const viewportRef = useRef({ w: 0, h: 0 });

  // Resize handler
  const syncSize = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    cvs.width = w * dpr;
    cvs.height = h * dpr;
    cvs.style.width = `${w}px`;
    cvs.style.height = `${h}px`;
    viewportRef.current = { w, h };
  }, []);

  // Callback ref to attach canvas + resize listener
  const canvasCallbackRef = useCallback(
    (node: HTMLCanvasElement | null) => {
      (canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current =
        node;
      if (node) {
        syncSize();
        window.addEventListener("resize", syncSize);
      }
    },
    [syncSize]
  );

  // ── Game loop tick ─────────────────────────────────────────────────────

  useGameLoop((dt) => {
    update(dt);

    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { w: vw, h: vh } = viewportRef.current;
    const c = car.current;

    // ── Camera (centred on car) ────────────────────────────────────────
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.scale(dpr, dpr);

    const camX = c.x - vw / 2;
    const camY = c.y - vh / 2;
    ctx.translate(-camX, -camY);

    // ── Draw world ─────────────────────────────────────────────────────
    drawWorld(ctx);

    // ── Draw car ───────────────────────────────────────────────────────
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rotation);

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(2, 3, CAR_LENGTH / 2 + 2, CAR_WIDTH / 2 + 1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = "#e53935";
    const bx = -CAR_LENGTH / 2;
    const by = -CAR_WIDTH / 2;
    const br = 5;
    ctx.beginPath();
    ctx.moveTo(bx + br, by);
    ctx.lineTo(bx + CAR_LENGTH - br, by);
    ctx.quadraticCurveTo(bx + CAR_LENGTH, by, bx + CAR_LENGTH, by + br);
    ctx.lineTo(bx + CAR_LENGTH, by + CAR_WIDTH - br);
    ctx.quadraticCurveTo(bx + CAR_LENGTH, by + CAR_WIDTH, bx + CAR_LENGTH - br, by + CAR_WIDTH);
    ctx.lineTo(bx + br, by + CAR_WIDTH);
    ctx.quadraticCurveTo(bx, by + CAR_WIDTH, bx, by + CAR_WIDTH - br);
    ctx.lineTo(bx, by + br);
    ctx.quadraticCurveTo(bx, by, bx + br, by);
    ctx.closePath();
    ctx.fill();

    // Windshield
    ctx.fillStyle = "#90caf9";
    ctx.fillRect(CAR_LENGTH / 2 - 11, -CAR_WIDTH / 2 + 3, 9, CAR_WIDTH - 6);

    // Rear accent
    ctx.fillStyle = "#b71c1c";
    ctx.fillRect(-CAR_LENGTH / 2, -CAR_WIDTH / 2 + 2, 6, CAR_WIDTH - 4);

    // Headlights
    ctx.fillStyle = "#fff9c4";
    ctx.fillRect(CAR_LENGTH / 2 - 3, -CAR_WIDTH / 2 + 2, 3, 5);
    ctx.fillRect(CAR_LENGTH / 2 - 3, CAR_WIDTH / 2 - 7, 3, 5);

    ctx.restore();

    // ── Minimap ────────────────────────────────────────────────────────
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const mmX = vw - MINIMAP_SIZE - MINIMAP_MARGIN;
    const mmY = MINIMAP_MARGIN;
    const mmScale = MINIMAP_SIZE / WORLD_SIZE;

    ctx.save();
    ctx.globalAlpha = 0.88;

    // Minimap bg
    ctx.fillStyle = "#0e4a7a";
    ctx.fillRect(mmX, mmY, MINIMAP_SIZE, MINIMAP_SIZE);

    // Minimap island
    ctx.fillStyle = "#4caf50";
    ctx.beginPath();
    ctx.ellipse(
      mmX + ISLAND_CX * mmScale,
      mmY + ISLAND_CY * mmScale,
      ISLAND_RX * mmScale,
      ISLAND_RY * mmScale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Minimap roads
    ctx.strokeStyle = "#78909c";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    for (const road of ROADS) {
      const pts = road.points;
      if (pts.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(mmX + pts[0].x * mmScale, mmY + pts[0].y * mmScale);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(mmX + pts[i].x * mmScale, mmY + pts[i].y * mmScale);
      }
      ctx.stroke();
    }

    // Zone dots with labels
    ctx.font = "bold 7px sans-serif";
    ctx.textAlign = "center";
    for (const z of ZONES) {
      ctx.fillStyle = z.color;
      ctx.beginPath();
      ctx.arc(mmX + z.x * mmScale, mmY + z.y * mmScale, 3.5, 0, Math.PI * 2);
      ctx.fill();
      // Tiny label
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(z.name, mmX + z.x * mmScale, mmY + z.y * mmScale - 6);
    }

    // Car dot
    ctx.fillStyle = "#e53935";
    ctx.beginPath();
    ctx.arc(mmX + c.x * mmScale, mmY + c.y * mmScale, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Border
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(mmX, mmY, MINIMAP_SIZE, MINIMAP_SIZE);

    ctx.restore();

    // ── Speedometer (bottom-right) ─────────────────────────────────────
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    const speed = Math.abs(c.speed);
    const speedPct = speed / 380;
    const barW = 100;
    const barH = 6;
    const barX = vw - barW - 20;
    const barY = vh - 30;

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(barX - 4, barY - 16, barW + 8, 28);

    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(barX, barY, barW, barH);

    ctx.fillStyle = speedPct > 0.8 ? "#ef5350" : speedPct > 0.5 ? "#ffb74d" : "#66bb6a";
    ctx.fillRect(barX, barY, barW * speedPct, barH);

    ctx.fillStyle = "#ccc";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${Math.round(speed)} px/s`, barX, barY - 4);

    // ── Zone detection ─────────────────────────────────────────────────
    let found: Zone | null = null;
    for (const z of ZONES) {
      if (isInZone(c.x, c.y, z)) {
        found = z;
        break;
      }
    }
    setActiveZone((prev) => {
      if (prev?.id === found?.id) return prev;
      return found;
    });
  });

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <canvas ref={canvasCallbackRef} className="block" />

      {/* Controls hint */}
      <div className="absolute left-4 bottom-4 rounded-lg bg-black/60 px-4 py-2 text-xs text-gray-400 backdrop-blur-sm">
        <span className="font-semibold text-gray-200">WASD</span> or{" "}
        <span className="font-semibold text-gray-200">Arrow Keys</span> to
        drive
      </div>

      {/* Zone popup */}
      <ZoneModal zone={activeZone} />
    </div>
  );
}
