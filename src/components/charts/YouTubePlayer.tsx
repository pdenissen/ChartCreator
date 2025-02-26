"use client";

import { useEffect, useRef } from "react";

interface YouTubePlayerProps {
  videoId: string;
  onStateChange: (event: any) => void;
  onTimeUpdate: (time: number) => void;
}

export function YouTubePlayer({
  videoId,
  onStateChange,
  onTimeUpdate,
}: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    initYouTubeAPI();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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
        onStateChange: (event: any) => {
          onStateChange(event);
          handlePlayerStateChange(event);
        },
      },
    });
  };

  const handlePlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      // Start time tracking
      intervalRef.current = setInterval(() => {
        const currentTime = playerRef.current.getCurrentTime();
        onTimeUpdate(currentTime);
      }, 100);
    } else {
      // Stop time tracking
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  return (
    <div className="mb-4 relative w-full aspect-video max-w-3xl mx-auto">
      <div id="youtube-player" className="absolute inset-0"></div>
    </div>
  );
}
