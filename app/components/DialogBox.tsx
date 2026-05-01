"use client";

interface DialogBoxProps {
  title: string;
  message: string;
  onClose: () => void;
}

export default function DialogBox({ title, message, onClose }: DialogBoxProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-2xl rounded-3xl border border-white/10 bg-neutral-950/92 px-5 py-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
              {title}
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-100">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
