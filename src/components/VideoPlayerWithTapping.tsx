"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import type { YouTubeEvent, YouTubePlayer as YTPlayer } from "@/types/youtube";
import { Modal } from "@/components/ui/modal";

interface Bar {
  time: number;
  label: string;
}

interface ChartData {
  id?: number;
  title: string;
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
  const [title, setTitle] = useState(existingChart?.title || "");
  const [isSaving, setIsSaving] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    isOpen: boolean;
  }>({ title: "", message: "", isOpen: false });

  const onPlayerStateChange = (event: YouTubeEvent) => {
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
  };

  const onPlayerReady = (player: YTPlayer) => {
    playerRef.current = player;
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
    if (existingChart == null && !title.trim()) {
      setModal({
        title: "Missing Song Title",
        message: "Please enter a song title before saving.",
        isOpen: true,
      });
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

      let chartId;
      let chartResult;
      if (existingChart?.id) {
        // Update chart (no bars)
        chartResult = await supabase
          .from("charts")
          .update({
            title: title.trim(),
            video_id: videoId,
            user_id: user.id,
          })
          .eq("id", existingChart.id)
          .eq("user_id", user.id)
          .select();
        if (chartResult.data && Array.isArray(chartResult.data)) {
          chartResult.data = chartResult.data[0];
        }
        if (chartResult.error) throw chartResult.error;
        chartId = existingChart.id;
        // Delete old bars
        const { error: delError } = await supabase
          .from("bars")
          .delete()
          .eq("chart_id", chartId);
        if (delError) throw delError;
      } else {
        // Insert chart (no bars)
        chartResult = await supabase
          .from("charts")
          .insert([
            {
              title: title.trim(),
              video_id: videoId,
              user_id: user.id,
            },
          ])
          .select();
        let chartData = chartResult.data;
        if (Array.isArray(chartData)) {
          chartData = chartData[0];
        }
        if (chartResult.error) throw chartResult.error;
        if (!chartData || Array.isArray(chartData) || !("id" in chartData)) {
          throw new Error("Failed to get chart id after insert");
        }
        chartId = (chartData as { id: string }).id;
      }

      // Insert bars with chart_id
      const barsWithChartId = bars.map((bar) => ({
        start_time: bar.time,
        duration: 0, // You may want to update this if you have duration info
        taps: [], // You may want to update this if you have taps info
        chart_id: chartId,
      }));
      if (barsWithChartId.length > 0) {
        const { error: barsError } = await supabase
          .from("bars")
          .insert(barsWithChartId);
        if (barsError) throw barsError;
      }

      console.log("Save result:", chartResult);
      setModal({
        title: "Success",
        message: "Chart saved successfully!",
        isOpen: true,
      });
    } catch (error: any) {
      console.error("Error saving chart:", error);
      setModal({
        title: "Error",
        message: `Failed to save chart: ${error?.message || error}`,
        isOpen: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Modal
        title={modal.title}
        message={modal.message}
        isOpen={modal.isOpen}
        onClose={() => setModal((m) => ({ ...m, isOpen: false }))}
      />
      <YouTubePlayer
        videoId={videoId}
        onStateChange={onPlayerStateChange}
        onPlayerReady={onPlayerReady}
        onTimeUpdate={() => {}}
      />
      {existingChart == null && (
        <Input
          type="text"
          placeholder="Enter chart title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-2"
        />
      )}
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
