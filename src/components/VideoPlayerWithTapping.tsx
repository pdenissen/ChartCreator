"use client";

import { useRef } from "react";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import type { YouTubeEvent, YouTubePlayer as YTPlayer } from "@/types/youtube";

interface VideoPlayerWithTappingProps {
  videoId: string;
  onTimeUpdate?: (currentTime: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export function VideoPlayerWithTapping({
  videoId,
  onTimeUpdate,
  onPlayStateChange,
}: VideoPlayerWithTappingProps) {
  const playerRef = useRef<YT.Player | null>(null);

  const handlePlayerStateChange = (event: YouTubeEvent) => {
    console.log("Player state:", event.data);
    if (onPlayStateChange) {
      onPlayStateChange(event.data === 1);
    }
  };

  const handlePlayerReady = (player: YTPlayer) => {
    playerRef.current = player;
  };

  const handleTimeUpdate = (time: number) => {
    if (onTimeUpdate) onTimeUpdate(time);
  };

  return (
    <div className="mb-4">
      <YouTubePlayer
        videoId={videoId}
        onStateChange={handlePlayerStateChange}
        onPlayerReady={handlePlayerReady}
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
}
