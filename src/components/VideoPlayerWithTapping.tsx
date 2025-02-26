"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import type YT from "youtube-player";

interface Bar {
  time: number;
  label: string;
}

interface ChartData {
  id?: number;
  song_title: string;
  video_id: string;
  bars: Bar[];
  user_id?: string;
}

export function VideoPlayerWithTapping({
  videoId,
  existingChart = null,
}: {
  videoId: string;
  existingChart?: ChartData | null;
}) {
  const [bars, setBars] = useState<Bar[]>(existingChart?.bars || []);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLabel, setCurrentLabel] = useState("");
  const [songTitle, setSongTitle] = useState(existingChart?.song_title || "");
  const [isSaving, setIsSaving] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadYouTubePlayer = () => {
      if (window.YT && window.YT.Player && playerContainerRef.current) {
        playerRef.current = new window.YT.Player(playerContainerRef.current, {
          height: "360",
          width: "640",
          videoId: videoId,
          events: {
            onStateChange: onPlayerStateChange,
          },
        });
      } else {
        setTimeout(loadYouTubePlayer, 100);
      }
    };

    loadYouTubePlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
  };

  const handleTap = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      setBars((prev) => [
        ...prev,
        {
          time: currentTime,
          label: currentLabel || `Bar ${prev.length + 1}`,
        },
      ]);
      setCurrentLabel("");
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleLabelChange = (index: number, newLabel: string) => {
    setBars((prev) =>
      prev.map((bar, i) => (i === index ? { ...bar, label: newLabel } : bar))
    );
  };

  const handleSave = async () => {
    if (!songTitle.trim()) {
      alert("Please enter a song title before saving.");
      return;
    }

    setIsSaving(true);
    console.log("Attempting to save chart...");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error("Failed to get user information");
      }

      if (!user) {
        throw new Error("You must be logged in to save a chart.");
      }

      const chartData: ChartData = {
        song_title: songTitle.trim(),
        video_id: videoId,
        bars: bars,
        user_id: user.id,
      };

      console.log("Chart data:", chartData);

      let result;
      if (existingChart?.id) {
        result = await supabase
          .from("drum_charts")
          .update(chartData)
          .eq("id", existingChart.id)
          .eq("user_id", user.id);
      } else {
        result = await supabase.from("drum_charts").insert([chartData]);
      }

      if (result.error) {
        throw result.error;
      }

      console.log("Save result:", result);
      alert("Chart saved successfully!");
    } catch (error) {
      console.error("Error saving chart:", error);
      alert(`Failed to save chart: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div ref={playerContainerRef} />
      <Input
        type="text"
        placeholder="Enter song title"
        value={songTitle}
        onChange={(e) => setSongTitle(e.target.value)}
        className="mb-2"
      />
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Enter section label (e.g., Intro, Verse)"
          value={currentLabel}
          onChange={(e) => setCurrentLabel(e.target.value)}
        />
        <Button onClick={handleTap} disabled={!isPlaying}>
          Tap Bar
        </Button>
      </div>
      <div className="space-y-2">
        {bars.map((bar, index) => (
          <div
            key={index}
            className="flex justify-between items-center border p-2"
          >
            <Input
              type="text"
              value={bar.label}
              onChange={(e) => handleLabelChange(index, e.target.value)}
              className="w-1/2"
            />
            <span>{formatTime(bar.time)}</span>
          </div>
        ))}
      </div>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Chart"}
      </Button>
    </div>
  );
}
