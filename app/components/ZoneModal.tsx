"use client";

import type { Zone } from "@/app/lib/map";

interface Props {
  zone: Zone | null;
}

export default function ZoneModal({ zone }: Props) {
  if (!zone) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-6">
      <div
        className="pointer-events-auto animate-fade-in rounded-2xl border border-white/20
                    bg-black/75 px-8 py-4 text-center shadow-2xl backdrop-blur-lg
                    max-w-lg w-[92%]"
      >
        <p className="text-lg font-bold text-white">
          Welcome to{" "}
          <span className="text-amber-400">{zone.name}</span>.
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Press{" "}
          <kbd className="mx-0.5 rounded border border-gray-600 bg-gray-800 px-1.5 py-0.5 font-mono text-xs text-gray-200">
            Enter
          </kbd>{" "}
          to explore.
        </p>
      </div>
    </div>
  );
}
