"use client";

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
  
  if (normalized === "nc") {
    return { icon: "🌲", desc: "Mountain Woods", bgGradient: "from-green-900 to-emerald-950", titleColor: "text-green-400", border: "border-green-700" };
  }
  if (normalized === "miami") {
    return { icon: "🌴", desc: "Beachfront city", bgGradient: "from-pink-900 to-orange-950", titleColor: "text-pink-300", border: "border-pink-500/50" };
  }
  if (normalized === "puerto-rico") {
    return { icon: "🇵🇷", desc: "Island hopping", bgGradient: "from-blue-900 to-teal-950", titleColor: "text-teal-300", border: "border-blue-500/50" };
  }
  if (normalized === "cancun") {
    return { icon: "🍹", desc: "Resort strip", bgGradient: "from-cyan-900 to-teal-950", titleColor: "text-cyan-300", border: "border-cyan-500/50" };
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
          <span className="text-7xl mb-4 drop-shadow-lg">✈️</span>
          <h2 className="text-4xl font-black tracking-tight text-white drop-shadow-md">
            {isHighway ? `Travel to ${destinations[0].label}?` : "Select Destination"}
          </h2>
          <p className="mt-2 text-sm font-medium uppercase tracking-widest text-neutral-400">
            Choose your next adventure
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((d) => {
            const style = getDestinationStyle(d.id);
            
            return (
              <div
                key={d.id}
                onClick={() => onSelect(d.id)}
                className={`group relative flex min-h-56 flex-col items-center justify-center rounded-3xl border bg-neutral-800/95 p-7 shadow-xl cursor-pointer transition-transform duration-300 hover:scale-[1.03] overflow-hidden ${style.border}`}
              >
                {/* Background glow effect on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${style.bgGradient}`} />
                <div className="absolute inset-x-5 top-5 h-px bg-white/10" />
                
                <div className="relative z-10 flex flex-col items-center pointer-events-none">
                  <span className="text-7xl mb-5 filter drop-shadow-md transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110">
                    {style.icon}
                  </span>
                  <h3 className={`text-2xl font-black text-center ${style.titleColor}`}>
                    {d.label}
                  </h3>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-300 group-hover:text-white transition-colors">
                    {style.desc}
                  </p>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-white/65">
                    Press Enter on arrival
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
