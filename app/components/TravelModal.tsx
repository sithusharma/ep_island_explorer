"use client";

import { useState } from "react";

interface Destination {
  id: string;
  label: string;
}

interface Props {
  destinations: Destination[];
  onSelect: (destId: string) => void;
  onClose: () => void;
}

function getDestinationStyle(destId: string | null) {
  const normalized = destId?.toLowerCase() ?? "";
  
  if (normalized === "nyc") {
    return { icon: "🍎", desc: "Urban, Dark Mode", bgGradient: "from-slate-900 to-black", titleColor: "text-white", border: "border-slate-700" };
  }
  if (normalized === "nc") {
    return { icon: "🌲", desc: "Mountain Woods", bgGradient: "from-green-900 to-emerald-950", titleColor: "text-green-400", border: "border-green-700" };
  }
  if (normalized === "orlando") {
    return { icon: "🎢", desc: "Sunny Theme Park", bgGradient: "from-cyan-900 to-yellow-900", titleColor: "text-yellow-400", border: "border-yellow-400/50" };
  }
  if (normalized === "miami") {
    return { icon: "🌴", desc: "Vice City", bgGradient: "from-pink-900 to-orange-950", titleColor: "text-pink-400", border: "border-pink-500/50" };
  }
  if (normalized === "puerto-rico") {
    return { icon: "🏰", desc: "Tropical Getaway", bgGradient: "from-blue-900 to-teal-950", titleColor: "text-teal-400", border: "border-blue-500/50" };
  }
  if (normalized === "cancun") {
    return { icon: "🍹", desc: "Tropical Getaway", bgGradient: "from-blue-900 to-teal-950", titleColor: "text-teal-400", border: "border-blue-500/50" };
  }
  if (normalized === "tennessee") {
    return { icon: "🎸", desc: "Music City", bgGradient: "from-orange-900 to-amber-950", titleColor: "text-orange-400", border: "border-orange-500/50" };
  }
  if (normalized === "dc") {
    return { icon: "🏛️", desc: "Capital City", bgGradient: "from-red-950 to-blue-950", titleColor: "text-white", border: "border-blue-600/50" };
  }
  if (normalized === "richmond" || normalized === "uva") {
    return { icon: "🏛️", desc: "Historic Virginia", bgGradient: "from-red-900 to-orange-950", titleColor: "text-orange-300", border: "border-orange-700/50" };
  }
  
  return { icon: "✈️", desc: "Select Destination", bgGradient: "from-neutral-800 to-neutral-950", titleColor: "text-white", border: "border-neutral-700" };
}

export default function TravelModal({ destinations, onSelect, onClose }: Props) {
  const isHighway = destinations.length === 1;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-colors duration-500 bg-black/80 backdrop-blur-md`}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        className={`relative z-10 w-full max-w-5xl px-4 py-8 max-h-screen overflow-y-auto`}
      >
        <div className="flex flex-col items-center justify-center mb-10">
          <span className="text-6xl mb-4 drop-shadow-lg">✈️</span>
          <h2 className="text-4xl font-black tracking-tight text-white drop-shadow-md">
            {isHighway ? `Travel to ${destinations[0].label}?` : "Select Destination"}
          </h2>
          <p className="mt-2 text-sm font-medium uppercase tracking-widest text-neutral-400">
            Choose your next adventure
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {destinations.map((d) => {
            const style = getDestinationStyle(d.id);
            
            return (
              <div
                key={d.id}
                onClick={() => onSelect(d.id)}
                className="group relative flex flex-col items-center justify-center p-6 rounded-3xl bg-neutral-800 border border-neutral-700 hover:border-white/40 shadow-xl cursor-pointer transition-transform duration-300 hover:scale-105 overflow-hidden"
              >
                {/* Background glow effect on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${style.bgGradient}`} />
                
                <div className="relative z-10 flex flex-col items-center pointer-events-none">
                  <span className="text-6xl mb-4 filter drop-shadow-md transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110">
                    {style.icon}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-1 text-center">
                    {d.label}
                  </h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 group-hover:text-white/80 transition-colors">
                    {style.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={onClose}
            className="rounded-full border border-white/20 bg-neutral-900/50 px-8 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-white/10 hover:border-white/40 cursor-pointer"
          >
            Cancel Travel
          </button>
        </div>
      </div>
    </div>
  );
}
