"use client";

export default function JukeboxOverlay() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-6 z-20">
      <div
        className="pointer-events-auto rounded-2xl border border-purple-500/30
                    bg-black/85 px-8 py-4 text-center shadow-2xl backdrop-blur-md
                    max-w-md w-[92%] transition-all duration-300"
      >
        <p className="text-lg font-bold text-white">
          <span className="mr-1 text-purple-400">♫</span>
          Jukebox
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Press{" "}
          <kbd className="mx-0.5 rounded border border-gray-600 bg-gray-800 px-1.5 py-0.5 font-mono text-xs text-gray-200">
            Enter
          </kbd>{" "}
          to open Jukebox
        </p>
      </div>
    </div>
  );
}
