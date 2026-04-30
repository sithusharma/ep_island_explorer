"use client";

import { useState, useRef, useEffect } from "react";

interface JukeboxUIProps {
  onClose: () => void;
}

// Placeholder songs – replace with real URLs as needed
const songs = [
  {
    id: "song1",
    title: "Chill Beats",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "song2",
    title: "Ambient Loop",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "song3",
    title: "Upbeat Groove",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

export default function JukeboxUI({ onClose }: JukeboxUIProps) {
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.5);

  // Auto‑play selected song
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (currentSong) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentSong, volume]);

  const handlePlayPause = (songId: string) => {
    setCurrentSong((prev) => (prev === songId ? null : songId));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-30">
      <div className="relative w-full max-w-md rounded-xl border border-gray-600 bg-gray-900/90 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition"
        >
          ✕
        </button>
        <h2 className="mb-4 text-center text-xl font-bold text-white">Jukebox</h2>
        <ul className="space-y-3">
          {songs.map((song) => (
            <li
              key={song.id}
              className="flex items-center justify-between rounded bg-gray-800 px-3 py-2 text-gray-200"
            >
              <span className="flex-1 truncate mr-2">{song.title}</span>
              <button
                onClick={() => handlePlayPause(song.id)}
                className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 transition"
              >
                {currentSong === song.id ? "Pause" : "Play"}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between">
          <label className="text-sm text-gray-400">Volume</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32"
          />
        </div>
        {/* Hidden audio element – one per component */}
        <audio
          ref={audioRef}
          src={songs.find((s) => s.id === currentSong)?.url ?? undefined}
        />
      </div>
    </div>
  );
}
