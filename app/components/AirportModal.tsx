"use client";

import { AIRPORT_DESTINATIONS } from "@/app/lib/maps/registry";

interface Props {
  onSelect: (destId: string) => void;
  onClose: () => void;
}

export default function AirportModal({ onSelect, onClose }: Props) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative rounded-2xl border border-white/10 bg-neutral-900/95 p-8 shadow-2xl backdrop-blur-lg max-w-sm w-[90%]">
        <h2 className="mb-1 text-center text-xl font-bold text-white">
          Where to fly?
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          Choose your destination
        </p>

        <div className="flex flex-col gap-3">
          {AIRPORT_DESTINATIONS.map((d) => (
            <button
              key={d.id}
              onClick={() => onSelect(d.id)}
              className="w-full rounded-xl border border-white/10 bg-white/5
                         px-5 py-3 text-left text-white font-medium
                         transition-all duration-200
                         hover:bg-amber-500/20 hover:border-amber-500/40
                         active:scale-[0.98]"
            >
              <span className="mr-2 text-amber-400">✈</span>
              {d.label}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl border border-white/5 bg-white/5
                     px-4 py-2 text-sm text-gray-400 transition-colors
                     hover:bg-white/10 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
