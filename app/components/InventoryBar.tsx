"use client";

import { useState } from "react";

export interface InventoryItem {
  name: string;
  icon: string;
  description: string;
  enlargedIcon?: string;
  owner?: string;
  isOwnedByCurrentUser?: boolean;
}

interface InventoryBarProps {
  items: InventoryItem[];
  slots?: number;
}

function isImageIcon(icon: string) {
  return icon.startsWith("/") || icon.startsWith("http://") || icon.startsWith("https://") || icon.startsWith("data:");
}

export default function InventoryBar({ items, slots = 10 }: InventoryBarProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const totalSlots = Math.max(5, Math.min(10, slots));
  const visibleItems = items.slice(0, totalSlots);
  const slotItems = Array.from({ length: totalSlots }, (_, index) => visibleItems[index] ?? null);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center px-4">
      <div className="pointer-events-auto flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="rounded-full border border-white/10 bg-neutral-900/80 px-3 py-1.5 text-xs font-semibold text-neutral-200 shadow-lg backdrop-blur-md transition hover:bg-neutral-800/90"
        >
          {collapsed ? "Open Inventory" : "Hide Inventory"}
        </button>

        {!collapsed && (
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-neutral-900/80 px-3 py-3 shadow-2xl backdrop-blur-md">
            {slotItems.map((item, index) => (
              <div key={`${item?.name ?? "empty"}-${index}`} className="group relative">
                <button
                  type="button"
                  onClick={() => item && setSelectedItem(item)}
                  className={[
                    "flex h-14 w-14 items-center justify-center rounded-xl border transition-colors",
                    item
                      ? item.isOwnedByCurrentUser
                        ? "border-amber-300/70 bg-amber-950/45 text-2xl shadow-inner shadow-black/30 ring-1 ring-amber-200/35"
                        : "border-white/10 bg-neutral-800/90 text-2xl shadow-inner shadow-black/30"
                      : "border border-dashed border-white/15 bg-neutral-950/40",
                  ].join(" ")}
                  disabled={!item}
                >
                  {item ? (
                    isImageIcon(item.icon) ? (
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="h-9 w-9 rounded object-contain"
                      />
                    ) : (
                      <span aria-hidden="true" className="select-none leading-none">
                        {item.icon}
                      </span>
                    )
                  ) : (
                    <span aria-hidden="true" className="text-lg text-white/15">
                      +
                    </span>
                  )}
                </button>

                {item && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden w-max max-w-44 -translate-x-1/2 rounded-lg border border-white/10 bg-neutral-950/95 px-2.5 py-1.5 text-center text-xs text-white shadow-xl group-hover:block">
                    <div className="font-semibold text-white">{item.name}</div>
                    {item.owner && (
                      <div className="mt-0.5 text-[10px] text-neutral-400">
                        {item.isOwnedByCurrentUser ? "Yours" : `${item.owner}'s item`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <div
          className="pointer-events-auto fixed inset-0 z-30 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-white/10 bg-neutral-900/95 p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-3xl border border-white/10 bg-neutral-800/90 text-7xl shadow-inner shadow-black/30">
              {isImageIcon(selectedItem.enlargedIcon ?? selectedItem.icon) ? (
                <img
                  src={selectedItem.enlargedIcon ?? selectedItem.icon}
                  alt={selectedItem.name}
                  className="h-24 w-24 rounded-xl object-contain"
                />
              ) : (
                <span aria-hidden="true" className="leading-none">
                  {selectedItem.enlargedIcon ?? selectedItem.icon}
                </span>
              )}
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">{selectedItem.name}</h3>
            {selectedItem.owner && (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                {selectedItem.isOwnedByCurrentUser ? "Assigned to you" : `Assigned to ${selectedItem.owner}`}
              </p>
            )}
            <p className="mt-2 text-sm text-neutral-300">{selectedItem.description}</p>
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="mt-5 rounded-full border border-white/10 bg-neutral-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
