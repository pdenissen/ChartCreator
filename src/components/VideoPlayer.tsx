import { useEffect, useRef, useState } from "react";
import type { YouTubeEvent, YouTubePlayer as YTPlayer } from "@/types/youtube";
import { YouTubePlayerState } from "@/types/youtube";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  SkipForward,
  SkipBack,
} from "lucide-react";
import clsx from "clsx";

// Format time as MM:SS
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

interface VideoPlayerProps {
  videoId: string;
  height?: number;
  width?: number;
  controls?: boolean;
  className?: string;
  children?: React.ReactNode;
  bars?: { time: number }[];
}

export function VideoPlayer({
  videoId,
  height = 360,
  width = 640,
  controls = false,
  className = "",
  children,
  bars = [],
}: VideoPlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [player, setPlayer] = useState<YTPlayer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

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
        controls: 0, // Always disable native controls
        showinfo: 0,
        fs: 0,
      },
      events: {
        onReady: (event: YT.PlayerEvent) => {
          setPlayer(event.target);
          setDuration(event.target.getDuration());
          handlePlayerStateChange(event as YouTubeEvent);
        },
        onStateChange: (event: YT.PlayerEvent) => {
          handlePlayerStateChange(event as YouTubeEvent);
          setIsPlaying(
            (event as YouTubeEvent).data === YouTubePlayerState.PLAYING
          );
        },
      },
    });
  };

  const handlePlayerStateChange = (event: YouTubeEvent) => {
    if (event.data === YouTubePlayerState.PLAYING) {
      intervalRef.current = setInterval(() => {
        const current = playerRef.current?.getCurrentTime();
        if (current !== undefined) {
          setCurrentTime(current);
        }
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!player) return;
    player.setVolume(value);
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (!player) return;
    if (isMuted) {
      player.unMute();
      player.setVolume(volume || 100);
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!player || !duration) return;
    const value = Number(e.target.value);
    player.seekTo(value, true);
    setCurrentTime(value);
  };

  const skipForward = () => {
    if (!player || !duration) return;
    const newTime = Math.min(currentTime + 10, duration);
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    if (!player) return;
    const newTime = Math.max(currentTime - 10, 0);
    player.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  return (
    <div className="max-w-3xl mr-auto mb-16">
      <div
        className={clsx(
          "relative w-full aspect-video max-w-3xl rounded-t-xl overflow-hidden shadow-lg bg-background/80 mx-auto",
          className
        )}
      >
        <div id="youtube-player" className="absolute inset-0 w-full h-full" />
        {children}
      </div>
      <div className="max-w-3xl mx-auto -mt-2 z-10 relative">
        <div className="bg-gray-900/90 rounded-b-xl shadow-lg p-4">
          {/* Progress bar with markers */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white text-xs font-medium w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="relative flex-1">
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 rounded-lg appearance-none bg-gray-600 relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
              {/* Bars/markers */}
              {bars && bars.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {bars.map((bar, index) => (
                    <div
                      key={index}
                      className="absolute top-0 w-[2px] h-full bg-primary/70"
                      style={{
                        left: `${(bar.time / duration) * 100}%`,
                        transform: "translateX(-50%)",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <span className="text-white text-xs font-medium w-10 text-left">
              {formatTime(duration)}
            </span>
          </div>
          {/* Controls row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={skipBackward}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                onClick={togglePlay}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <Button
                onClick={skipForward}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : volume > 50 ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <Volume1 className="h-5 w-5" />
                )}
              </Button>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 rounded-lg appearance-none bg-gray-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
