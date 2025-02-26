"use client";

import { useEffect, useRef } from "react";
import type { YouTubeEvent, YouTubePlayer as YTPlayer } from "@/types/youtube";
import YouTube from "react-youtube";

/**
 * @fileoverview YouTube player component that handles video playback and
 * synchronization with rhythm charts.
 * @package
 */

/**
 * YouTubePlayer component props interface.
 * @interface
 */
interface YouTubePlayerProps {
  /** YouTube video ID to play */
  videoId: string;
  /** Callback fired when player state changes */
  onStateChange: (event: YouTubeEvent) => void;
  /** Callback fired periodically with current playback time */
  onTimeUpdate: (time: number) => void;
  /** Callback fired when player is ready */
  onPlayerReady?: (player: YT.Player) => void;
  /** Height of the player (default: 360) */
  height?: number;
  /** Width of the player (default: 640) */
  width?: number;
}

/**
 * A React component that embeds and controls a YouTube video player.
 * Handles video playback and provides methods for controlling the video.
 *
 * @param {YouTubePlayerProps} props - The component props
 * @return {JSX.Element} The rendered component
 */
export function YouTubePlayer({
  videoId,
  onStateChange,
  onTimeUpdate,
  onPlayerReady,
  height = 360,
  width = 640,
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
    const element = document.getElementById("youtube-player");
    if (!element) return;

    playerRef.current = new window.YT.Player(element, {
      videoId,
      height,
      width,
      playerVars: {
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event: YT.PlayerEvent) => {
          if (onPlayerReady) onPlayerReady(event.target);
          handlePlayerStateChange(event as YouTubeEvent);
        },
        onStateChange: (event: YT.PlayerEvent) => {
          onStateChange(event as YouTubeEvent);
          handlePlayerStateChange(event as YouTubeEvent);
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
    <div className="mb-4 relative w-full aspect-[18/9] max-w-3xl">
      <div id="youtube-player" className="absolute inset-0">
        <YouTube
          videoId={videoId}
          onReady={handlePlayerStateChange}
          onStateChange={onStateChange}
          opts={{
            width: "100%",
            height: "100%",
            playerVars: {
              controls: 0, // Hide default controls
            },
          }}
        />
      </div>
    </div>
  );
}
