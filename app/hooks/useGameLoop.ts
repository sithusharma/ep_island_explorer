"use client";

import { useEffect, useRef } from "react";

/**
 * Fires `onTick(deltaSeconds)` at ~60 fps using requestAnimationFrame.
 * Automatically starts on mount and stops on unmount.
 */
export function useGameLoop(onTick: (dt: number) => void) {
  const callbackRef = useRef(onTick);
  callbackRef.current = onTick;

  useEffect(() => {
    let rafId: number;
    let lastTime = 0;

    const loop = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.05); // cap at 50 ms
      lastTime = time;
      callbackRef.current(dt);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);
}
