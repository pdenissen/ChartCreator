import { useEffect, useRef } from "react";
import type { YouTubeEvent, YouTubePlayer as YTPlayer } from "@/types/youtube";
import YouTube from "react-youtube";

interface VideoPlayerProps {
  videoId: string;
  onTimeUpdate?: (currentTime: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onPlayerReady?: (player: YT.Player) => void;
  height?: number;
  width?: number;
  controls?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function VideoPlayer({
  videoId,
  onTimeUpdate,
  onPlayStateChange,
  onPlayerReady,
  height = 360,
  width = 640,
  controls = false,
  className = "",
  children,
}: VideoPlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initYouTubeAPI();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [videoId]);

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
        controls: controls ? 1 : 0,
      },
      events: {
        onReady: (event: YT.PlayerEvent) => {
          if (onPlayerReady) onPlayerReady(event.target);
          handlePlayerStateChange(event as YouTubeEvent);
        },
        onStateChange: (event: YT.PlayerEvent) => {
          handlePlayerStateChange(event as YouTubeEvent);
        },
      },
    });
  };

  const handlePlayerStateChange = (event: YouTubeEvent) => {
    if (onPlayStateChange) onPlayStateChange(event.data === 1);
    if (onTimeUpdate) {
      if (event.data === 1) {
        intervalRef.current = setInterval(() => {
          const currentTime = playerRef.current?.getCurrentTime();
          if (currentTime !== undefined) {
            onTimeUpdate(currentTime);
          }
        }, 100);
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }
  };

  return (
    <div className={`relative w-full aspect-[18/9] max-w-3xl ${className}`}>
      <div id="youtube-player" className="absolute inset-0" />
      {children}
    </div>
  );
}
