"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabase";

interface Props {
  locationId: string;
  onClose: () => void;
  onImageSelect?: (imageName: string) => void;
}

interface GalleryImage {
  name: string;
  url: string;
}

export default function MemoryGallery({ locationId, onClose, onImageSelect }: Props) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxUrl !== null) {
          setLightboxUrl(null);
          return;
        }
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxUrl, onClose]);

  useEffect(() => {
    // Fetch images
    const fetchImages = async () => {
      try {
        setLoading(true);
        const folderCandidates = [locationId, "test"];
        let data: { name: string }[] | null = null;
        let resolvedFolder = "test";

        for (const folder of folderCandidates) {
          const { data: listed, error } = await supabase.storage.from("EP_Photos").list(folder);
          if (error) continue;
          if (listed && listed.length > 0) {
            data = listed;
            resolvedFolder = folder;
            break;
          }
        }

        if (data) {
          // Filter for .jpg or .jpeg (case insensitive)
          const validFiles = data.filter((file) => {
            const name = file.name.toLowerCase();
            return name.endsWith(".jpg") || name.endsWith(".jpeg");
          });

          // Get public URLs
          const mappedUrls = validFiles.map((file) => {
            const { data: publicUrlData } = supabase.storage
              .from("EP_Photos")
              .getPublicUrl(`${resolvedFolder}/${file.name}`);
            return { name: file.name, url: publicUrlData.publicUrl };
          });

          setImages(mappedUrls);
        } else {
          setImages([]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [locationId]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 bg-gradient-to-b from-black/80 to-transparent">
        <h1 className="text-3xl font-bold text-white capitalize tracking-wide">
          {locationId.replace(/-/g, " ")}
        </h1>
        <button
          onClick={onClose}
          className="rounded-xl border border-white/20 bg-white/10 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
        >
          ESC to Close
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 px-8 pb-12">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {images.map((image, i) => (
              <div
                key={i}
                onClick={() => {
                  onImageSelect?.(image.name);
                  setLightboxUrl(image.url);
                }}
                className="group relative aspect-video overflow-hidden rounded-2xl bg-white/5 border border-white/10 cursor-pointer"
              >
                <img
                  src={image.url}
                  alt={`Memory ${i}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
                {/* Expand hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    View
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-white/50">
            <p>No photos found in the test folder.</p>
          </div>
        )}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────── */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          {/* Prevent click-through on the image itself */}
          <img
            src={lightboxUrl}
            alt="Full-size memory"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />

          {/* Close button */}
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-white/25 hover:scale-110 active:scale-95"
            aria-label="Close lightbox"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
