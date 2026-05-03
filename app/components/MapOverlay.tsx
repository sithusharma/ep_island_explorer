"use client";

interface Props {
  currentMapId: string;
  onClose: () => void;
}

// Island node definitions — positions tuned for a hub-spoke layout
const NODES = [
  // Hub
  { id: "vt-island",   label: "VT Island",   cx: 320, cy: 195, rx: 46, ry: 32, fill: "#4c1d95", stroke: "#a78bfa" },
  // Highway exits
  { id: "dc",          label: "DC",           cx: 152, cy:  72, rx: 30, ry: 20, fill: "#1e3a5f", stroke: "#60a5fa" },
  { id: "nyc",         label: "NYC",          cx: 488, cy:  72, rx: 30, ry: 20, fill: "#1e3a5f", stroke: "#60a5fa" },
  { id: "tennessee",   label: "Tennessee",    cx:  68, cy: 200, rx: 34, ry: 20, fill: "#1e3a5f", stroke: "#60a5fa" },
  { id: "richmond",    label: "Richmond",     cx: 540, cy: 148, rx: 34, ry: 20, fill: "#1e3a5f", stroke: "#60a5fa" },
  { id: "uva",         label: "UVA",          cx: 540, cy: 212, rx: 28, ry: 18, fill: "#1e3a5f", stroke: "#60a5fa" },
  { id: "nc",          label: "NC",           cx: 360, cy: 320, rx: 28, ry: 18, fill: "#1e3a5f", stroke: "#60a5fa" },
  // Airport destinations
  { id: "miami",       label: "Miami",        cx: 200, cy: 368, rx: 30, ry: 20, fill: "#064e3b", stroke: "#34d399" },
  { id: "puerto-rico", label: "Puerto Rico",  cx: 490, cy: 368, rx: 36, ry: 20, fill: "#064e3b", stroke: "#34d399" },
  { id: "cancun",      label: "Cancún",       cx:  92, cy: 360, rx: 30, ry: 20, fill: "#713f12", stroke: "#fbbf24" },
  // Miami → Orlando
  { id: "orlando",     label: "Orlando",      cx: 200, cy: 304, rx: 30, ry: 18, fill: "#064e3b", stroke: "#34d399" },
];

// Connection lines: [from, to, type]
const EDGES: [string, string, "highway" | "airport"][] = [
  ["vt-island", "dc",          "highway"],
  ["vt-island", "nyc",         "highway"],
  ["vt-island", "tennessee",   "highway"],
  ["vt-island", "richmond",    "highway"],
  ["vt-island", "uva",         "highway"],
  ["vt-island", "nc",          "highway"],
  ["vt-island", "miami",       "airport"],
  ["vt-island", "puerto-rico", "airport"],
  ["vt-island", "cancun",      "airport"],
  ["miami",     "orlando",     "highway"],
];

function node(id: string) {
  return NODES.find((n) => n.id === id)!;
}

export default function MapOverlay({ currentMapId, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative rounded-3xl border border-white/10 bg-neutral-950/97 px-5 py-5 shadow-2xl"
        style={{ width: 700, maxWidth: "96vw" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-white tracking-widest uppercase">World Map</h2>
          <button type="button" onClick={onClose}
            className="text-gray-500 hover:text-white transition text-lg leading-none">✕</button>
        </div>

        {/* Diagram */}
        <svg viewBox="0 0 640 400" className="w-full" style={{ display: "block" }}>
          {/* Background */}
          <rect width="640" height="400" fill="#0a0a0f" rx="16" />

          {/* Edges */}
          {EDGES.map(([a, b, type]) => {
            const na = node(a);
            const nb = node(b);
            const isAir = type === "airport";
            return (
              <line
                key={`${a}-${b}`}
                x1={na.cx} y1={na.cy}
                x2={nb.cx} y2={nb.cy}
                stroke={isAir ? "#34d39966" : "#60a5fa44"}
                strokeWidth={isAir ? 1.5 : 1.5}
                strokeDasharray={isAir ? "6 4" : "none"}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map((n) => {
            const isCurrent = n.id === currentMapId;
            return (
              <g key={n.id}>
                {/* Glow ring for current location */}
                {isCurrent && (
                  <ellipse
                    cx={n.cx} cy={n.cy}
                    rx={n.rx + 8} ry={n.ry + 8}
                    fill="none"
                    stroke={n.stroke}
                    strokeWidth="1.5"
                    opacity="0.5"
                  />
                )}
                {/* Island ellipse */}
                <ellipse
                  cx={n.cx} cy={n.cy}
                  rx={n.rx} ry={n.ry}
                  fill={isCurrent ? n.stroke + "44" : n.fill}
                  stroke={n.stroke}
                  strokeWidth={isCurrent ? 2 : 1.2}
                />
                {/* Label */}
                <text
                  x={n.cx} y={n.cy + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={n.id === "vt-island" ? 12 : 10}
                  fontWeight="700"
                  fill={isCurrent ? "#fff" : n.stroke}
                  style={{ fontFamily: "sans-serif" }}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-3 flex gap-5 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t border-blue-400/50" />
            Highway
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t border-dashed border-emerald-400/50" />
            ✈ Airport
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-2 rounded-sm border border-violet-400/70" />
            You are here
          </span>
        </div>
      </div>
    </div>
  );
}
