"use client";
import { useEffect, useState } from "react";
import {
  PlayIcon,
  PauseIcon,
  BackwardIcon,
  ForwardIcon,
} from "@heroicons/react/24/solid";
import type { Bar } from "@/types/chart";

interface VideoControlsProps {
  player: YT.Player | null;
  currentTime: number;
  duration: number;
  bars?: Bar[];
}

export function VideoControls({
  player,
  currentTime,
  duration,
  bars = [],
}: VideoControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    if (!player) return;

    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const skip = (seconds: number) => {
    if (!player) return;
    const newTime = player.getCurrentTime() + seconds;
    player.seekTo(newTime, true);
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!player) return;
    const newTime = parseFloat(e.target.value);
    player.seekTo(newTime, true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    console.log("Bars:", bars);
    console.log("Duration:", duration);
  }, [bars, duration]);

  return (
    <div className="max-w-3xl mx-auto bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center gap-4">
        <button
          onClick={() => skip(-10)}
          className="p-2 hover:bg-gray-700 rounded-full"
        >
          <BackwardIcon className="w-6 h-6" />
        </button>

        <button
          onClick={togglePlayPause}
          className="p-2 hover:bg-gray-700 rounded-full"
        >
          {isPlaying ? (
            <PauseIcon className="w-6 h-6" />
          ) : (
            <PlayIcon className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={() => skip(10)}
          className="p-2 hover:bg-gray-700 rounded-full"
        >
          <ForwardIcon className="w-6 h-6" />
        </button>

        <div className="flex-1 flex items-center justify-between relative">
          <span className="text-sm">{formatTime(currentTime)}</span>
          <div className="flex-1 relative max-w-[calc(100%-100px)]">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleTimelineChange}
              className="w-full h-2 rounded-lg appearance-none bg-gray-600 relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
            <div className="absolute inset-0 pointer-events-none">
              {bars.map((bar, index) => (
                <div
                  key={index}
                  className="absolute top-0 w-[2px] h-[24px] bg-white/30"
                  style={{
                    left: `${(bar.time / duration) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                />
              ))}
            </div>
          </div>
          <span className="text-sm">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
