"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabase";

const INITIAL_IMAGE_BATCH = 16;
const IMAGE_BATCH_SIZE = 16;
const galleryCache = new Map<string, GalleryImage[]>();

interface Props {
  locationId: string;
  mapId?: string;
  onClose: () => void;
  onImageSelect?: (imageName: string, subfolder?: string) => void;
}

interface GalleryImage {
  name: string;
  url: string;
  thumbUrl?: string;
}

interface FolderConfig {
  foldersToSearch?: string[];
  folderOptions?: { id: string; label: string }[];
}

function resolveFolders(mapId: string, locationId: string, subfolder: string | null): FolderConfig {
  const loc = locationId.toLowerCase();

  if (mapId === "uva") {
    if (!subfolder) {
      return { folderOptions: [{id: "Y2", label: "Year 2"}, {id: "Y3", label: "Year 3"}, {id: "Y4", label: "Year 4"}] };
    }
    return { foldersToSearch: [`UVA/${subfolder}`] };
  }
  
  if (mapId === "nyc") {
    if (!subfolder) {
      return { folderOptions: [{id: "NYCY1", label: "Year 1"}, {id: "NYCY3", label: "Year 3"}] };
    }
    return { foldersToSearch: [subfolder] };
  }

  if (mapId === "vt-island") {
    if (loc === "edges-apt") {
      if (!subfolder) {
        return { folderOptions: [{id: "year-1", label: "Year 1"}, {id: "year-2", label: "Year 2"}, {id: "year-3", label: "Year 3"}, {id: "year-4", label: "Year 4"}] };
      }
      return { foldersToSearch: [`edges-apt/${subfolder}`] };
    }
    
    if (loc.includes("collegiate")) {
      if (!subfolder) {
        return { folderOptions: [{id: "Y1", label: "Year 1"}, {id: "Y2", label: "Year 2"}, {id: "Y3", label: "Year 3"}, {id: "Y4", label: "Year 4"}] };
      }
      return { foldersToSearch: [`Collegiate/${subfolder}`] };
    }

    if (loc.includes("cassell") || loc.includes("coliseum")) {
      return { foldersToSearch: ["CastleCollesium"] };
    }
    
    if (loc.includes("abc")) {
      return { foldersToSearch: ["ABC", "ABC store"] };
    }
    
    if (loc.includes("dorms")) {
      return { foldersToSearch: ["Campus"] };
    }
    
    if (loc.includes("cascades") || loc.includes("spot") || loc.includes("dragon")) {
      return { foldersToSearch: ["Nature"] };
    }

    if (loc.includes("hub")) {
      return { foldersToSearch: ["Hub"] };
    }

    if (loc.startsWith("garage-")) {
      const rawName = locationId
        .replace(/^garage-/i, "")
        .replace(/-spot$/i, "")
        .trim();
      const garageName = rawName
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
      return { foldersToSearch: [`Garages/individuals/${garageName}`] };
    }

    if (loc.includes("frat")) {
      return { foldersToSearch: ["Frats"] };
    }

    if (loc.includes("burg") || loc.includes("tots") || loc.includes("bennys") || loc.includes("hokie")) {
      return { foldersToSearch: ["VTDowntown"] };
    }

    return { foldersToSearch: [locationId] };
  }

  if (mapId === "orlando") {
    return { foldersToSearch: ["Miami/Orlando"] };
  }

  if (mapId === "cancun") {
    if (loc.includes("beach")) return { foldersToSearch: ["Cancun/Beach"] };
    if (loc.includes("club") || loc.includes("nightlife")) return { foldersToSearch: ["Cancun/Club"] };
    if (loc.includes("restaurant")) return { foldersToSearch: ["Cancun/Restraunt"] };
    if (loc.includes("riu")) return { foldersToSearch: ["Cancun/RIU"] };
    return { foldersToSearch: [`Cancun/${locationId}`] };
  }

  if (mapId === "miami") {
    if (loc.includes("airbnb")) return { foldersToSearch: ["Miami/AirBnb"] };
    if (loc.includes("yacht") || loc.includes("boat")) return { foldersToSearch: ["Miami/Boat"] };
    if (loc.includes("club")) return { foldersToSearch: ["Miami/Club"] };
    return { foldersToSearch: [`Miami/${locationId}`] };
  }

  if (mapId === "puerto-rico") {
    if (loc.includes("airbnb")) return { foldersToSearch: ["Puerto Rico/AirBnb"] };
    if (loc.includes("beach") || loc.includes("sun-bay") || loc.includes("mosquito")) return { foldersToSearch: ["Puerto Rico/Beach"] };
    if (loc.includes("club") || loc.includes("nightlife")) return { foldersToSearch: ["Puerto Rico/Club"] };
    if (loc.includes("juan")) return { foldersToSearch: ["Puerto Rico/Old San Juan"] };
    if (loc.includes("rainforest") || loc.includes("yunque")) return { foldersToSearch: ["Puerto Rico/Rainforest"] };
    if (loc.includes("zipline")) return { foldersToSearch: ["Puerto Rico/Zipline"] };
    return { foldersToSearch: [`Puerto Rico/${locationId}`] };
  }

  if (mapId === "tennessee") {
    return { foldersToSearch: ["Ten"] };
  }

  if (mapId === "nc") {
    if (loc.includes("unc") || loc.includes("dean-dome") || loc.includes("franklin")) return { foldersToSearch: ["Chapel Hill"] };
    return { foldersToSearch: ["NCState"] };
  }

  // Fallback
  return { foldersToSearch: [locationId, "test"] };
}

export default function MemoryGallery({ locationId, mapId = "vt-island", onClose, onImageSelect }: Props) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [subfolder, setSubfolder] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_IMAGE_BATCH);

  const config = resolveFolders(mapId, locationId, subfolder);
  const showFolderSelection = !!config.folderOptions;
  const cacheKey = `${mapId}::${locationId}::${subfolder ?? "root"}::${(config.foldersToSearch ?? []).join("|")}`;
  const visibleImages = images.slice(0, visibleCount);
  const hasMoreImages = visibleCount < images.length;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxUrl !== null) {
          setLightboxUrl(null);
          return;
        }
        if (subfolder !== null) {
          setSubfolder(null);
          return;
        }
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxUrl, onClose, subfolder]);

  useEffect(() => {
    setVisibleCount(INITIAL_IMAGE_BATCH);
    setLightboxUrl(null);
  }, [cacheKey]);

  useEffect(() => {
    if (showFolderSelection) return;

    const fetchImages = async () => {
      try {
        const cachedImages = galleryCache.get(cacheKey);
        if (cachedImages) {
          setImages(cachedImages);
          setLoading(false);
          return;
        }

        setLoading(true);
        const folderCandidates = config.foldersToSearch ?? ["test"];
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
          const validFiles = data.filter((file) => {
            const name = file.name.toLowerCase();
            return name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png");
          });

          const mappedUrls = validFiles.map((file) => {
            const assetPath = `${resolvedFolder}/${file.name}`;
            const { data: publicUrlData } = supabase.storage
              .from("EP_Photos")
              .getPublicUrl(assetPath);
            const { data: thumbUrlData } = supabase.storage
              .from("EP_Photos")
              .getPublicUrl(assetPath, {
                transform: {
                  width: 420,
                  height: 280,
                  resize: "cover",
                  quality: 60,
                },
              });
            return {
              name: file.name,
              url: publicUrlData.publicUrl,
              thumbUrl: thumbUrlData.publicUrl,
            };
          });

          galleryCache.set(cacheKey, mappedUrls);
          setImages(mappedUrls);
        } else {
          galleryCache.set(cacheKey, []);
          setImages([]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [cacheKey, config.foldersToSearch, showFolderSelection]);

  let title = locationId.replace(/-/g, " ");
  if (subfolder) title += ` - ${subfolder}`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 bg-gradient-to-b from-black/80 to-transparent">
        <h1 className="text-3xl font-bold text-white capitalize tracking-wide">
          {title}
        </h1>
        <div className="flex space-x-4">
          {subfolder && (
            <button
              onClick={() => setSubfolder(null)}
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              Back to Folders
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-xl border border-white/20 bg-white/10 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
          >
            ESC to Close
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 px-8 pb-12">
        {showFolderSelection ? (
          <div className="flex flex-col items-center justify-center pt-20 space-y-8">
            <h2 className="text-2xl text-white font-medium mb-4">Select a Folder</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {config.folderOptions!.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSubfolder(opt.id)}
                  className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all"
                >
                  <span className="text-5xl mb-4 group-hover:animate-bounce">📁</span>
                  <span className="text-lg font-bold text-white tracking-widest">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
          </div>
        ) : images.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {visibleImages.map((image, i) => (
              <div
                key={`${image.name}-${i}`}
                onClick={() => {
                  onImageSelect?.(image.name, subfolder ?? undefined);
                  setLightboxUrl(image.url);
                }}
                className="group relative aspect-video overflow-hidden rounded-2xl bg-white/5 border border-white/10 cursor-pointer"
              >
                <img
                  src={image.thumbUrl || image.url}
                  alt={`Memory ${i}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.src !== image.url) {
                      img.src = image.url;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
              </div>
            ))}
            </div>

            {hasMoreImages && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => Math.min(count + IMAGE_BATCH_SIZE, images.length))}
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Load more photos ({images.length - visibleCount} left)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-32 opacity-50">
            <span className="text-6xl mb-4">📭</span>
            <p className="text-xl text-white font-medium">No memories found here yet</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-8"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="Enlarged memory"
            className="max-h-full max-w-full object-contain rounded-lg"
            loading="eager"
            decoding="async"
          />
        </div>
      )}
    </div>
  );
}
