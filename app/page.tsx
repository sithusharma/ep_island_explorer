"use client";

import dynamic from "next/dynamic";

// The game uses window / requestAnimationFrame – must be client-only.
const GameCanvas = dynamic(() => import("@/app/components/GameCanvas"), {
  ssr: false,
});

export default function Home() {
  return <GameCanvas />;
}
