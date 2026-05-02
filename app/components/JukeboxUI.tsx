"use client";

import { useState, useRef } from "react";
import YouTube, { type YouTubePlayer } from "react-youtube";

interface Props {
  onClose: () => void;
}

const SONGS = [
  { id: "UhbixyxgsiU", title: "I Just Wanna Rock", artist: "Lil Uzi Vert" },
  { id: "2kjolTLZ_Mg", title: "São Paulo",          artist: "Kaytranada" },
  { id: "HMqgVXSvwGo", title: "Fireball",           artist: "Pitbull" },
  { id: "GxldQ9eX2wo", title: "Until I Found You",  artist: "Stephen Sanchez" },
];

export default function JukeboxUI({ onClose }: Props) {
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const [isPlaying,  setIsPlaying]  = useState(false);
  const [volume,     setVolume]     = useState(70);
  const [ready,      setReady]      = useState(false);
  const playerRef = useRef<YouTubePlayer | null>(null);

  const loadSong = (idx: number) => {
    if (currentIdx === idx) {
      if (isPlaying) {
        playerRef.current?.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current?.playVideo();
        setIsPlaying(true);
      }
      return;
    }
    setReady(false);
    setCurrentIdx(idx);
    setIsPlaying(true);
  };

  const onPlayerReady = (e: { target: YouTubePlayer }) => {
    playerRef.current = e.target;
    playerRef.current.setVolume(volume);
    setReady(true);
    if (isPlaying) e.target.playVideo();
  };

  const onVolumeChange = (v: number) => {
    setVolume(v);
    playerRef.current?.setVolume(v);
  };

  const currentSong = currentIdx !== null ? SONGS[currentIdx] : null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">

      {/* Hidden YouTube players — one per song, only the active one is mounted */}
      {currentIdx !== null && (
        <div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}>
          <YouTube
            key={SONGS[currentIdx].id}
            videoId={SONGS[currentIdx].id}
            opts={{ playerVars: { autoplay: 1, controls: 0 } }}
            onReady={onPlayerReady}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnd={() => setIsPlaying(false)}
          />
        </div>
      )}

      {/* UI */}
      <div className="relative w-full max-w-sm rounded-2xl border border-purple-500/30 bg-neutral-950/95 px-6 py-7 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-white transition text-lg"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">♫</span>
          <h2 className="text-lg font-black text-white tracking-wide">Jukebox</h2>
        </div>

        {/* Song list */}
        <ul className="space-y-2 mb-6">
          {SONGS.map((song, idx) => {
            const active = currentIdx === idx;
            return (
              <li key={song.id}>
                <button
                  type="button"
                  onClick={() => loadSong(idx)}
                  className={[
                    "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition",
                    active
                      ? "bg-purple-600/30 border border-purple-400/40"
                      : "bg-white/5 border border-white/5 hover:bg-white/10",
                  ].join(" ")}
                >
                  <span className="text-xl w-7 shrink-0 text-center select-none">
                    {active && isPlaying ? "▐▌" : "▶"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{song.title}</p>
                    <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Now playing */}
        {currentSong && (
          <div className="mb-5 rounded-xl bg-purple-950/40 border border-purple-400/20 px-4 py-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-purple-400 mb-0.5">
              {isPlaying ? "Now Playing" : "Paused"}
            </p>
            <p className="text-sm font-bold text-white truncate">{currentSong.title}</p>
            {!ready && <p className="text-xs text-gray-500 mt-1">Loading…</p>}
          </div>
        )}

        {/* Volume */}
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm">🔈</span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="flex-1 accent-purple-500"
          />
          <span className="text-gray-500 text-sm">🔊</span>
        </div>
      </div>
    </div>
  );
}
