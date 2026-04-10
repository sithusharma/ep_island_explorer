"use client";

interface Props {
  name: string;
}

export default function ZoneOverlay({ name }: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-6 z-20">
      <div
        className="pointer-events-auto rounded-2xl border border-white/10
                    bg-black/80 px-8 py-4 text-center shadow-2xl backdrop-blur-md
                    max-w-lg w-[92%] transition-all duration-300"
      >
        <p className="text-lg font-bold text-white">
          Welcome to{" "}
          <span className="text-amber-400">{name}</span>.
        </p>
      </div>
    </div>
  );
}
