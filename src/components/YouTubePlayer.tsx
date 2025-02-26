"use client";

import { useEffect, useRef } from "react";
import type { YouTubeEvent, YouTubePlayer as YTPlayer } from "@/types/youtube";

interface YouTubePlayerProps {
  videoId: string;
  onStateChange?: (event: YouTubeEvent) => void;
  onTimeUpdate?: (time: number) => void;
  onPlayerReady?: (player: YTPlayer) => void;
}

export function YouTubePlayer({
  videoId,
  onStateChange,
  onTimeUpdate,
  onPlayerReady,
}: YouTubePlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initYouTubeAPI();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]); // Reinitialize when videoId changes

  const initYouTubeAPI = () => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }
  };

  const initPlayer = () => {
    playerRef.current = new window.YT.Player("youtube-player", {
      videoId,
      height: "360",
      width: "640",
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event: YouTubeEvent) => {
          if (onPlayerReady) {
            onPlayerReady(event.target);
          }
        },
        onStateChange: (event: YouTubeEvent) => {
          if (onStateChange) {
            onStateChange(event);
          }
          handlePlayerStateChange(event);
        },
      },
    });
  };

  const handlePlayerStateChange = (event: YouTubeEvent) => {
    if (onTimeUpdate) {
      if (event.data === window.YT.PlayerState.PLAYING) {
        // Start time tracking
        intervalRef.current = setInterval(() => {
          const currentTime = playerRef.current?.getCurrentTime();
          if (currentTime !== undefined) {
            onTimeUpdate(currentTime);
          }
        }, 100);
      } else {
        // Stop time tracking
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }
  };

  return (
    <div className="mb-4 relative w-full aspect-video max-w-3xl mx-auto">
      <div id="youtube-player" className="absolute inset-0"></div>
    </div>
  );
}
