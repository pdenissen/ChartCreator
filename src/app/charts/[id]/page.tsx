"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { YouTubePlayer } from "@/components/charts/YouTubePlayer";
import { BarsList } from "@/components/charts/BarsList";
import { ChartActions } from "@/components/charts/ChartActions";
import type { DrumChart } from "@/types/chart";
import type { YouTubeEvent } from "@/types/youtube";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function ChartDetail() {
  const params = useParams();
  const router = useRouter();
  const [chart, setChart] = useState<DrumChart | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    fetchChart();
  }, []);

  const onPlayerStateChange = (event: YouTubeEvent) => {
    // Optional: handle state changes if needed
  };

  const onTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  async function fetchChart() {
    const { data, error } = await supabase
      .from("drum_charts")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching chart:", error);
    } else {
      setChart(data);
    }
  }

  async function deleteChart() {
    if (confirm("Are you sure you want to delete this chart?")) {
      const { error } = await supabase
        .from("drum_charts")
        .delete()
        .eq("id", params.id);

      if (error) {
        console.error("Error deleting chart:", error);
        alert("Failed to delete chart. Please try again.");
      } else {
        alert("Chart deleted successfully!");
        router.push("/charts");
      }
    }
  }

  if (!chart) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{chart.song_title}</h1>
      <YouTubePlayer
        videoId={chart.video_id}
        onStateChange={onPlayerStateChange}
        onTimeUpdate={onTimeUpdate}
      />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Bars</h1>
        <ChartActions chartId={chart.id} onDelete={deleteChart} />
      </div>
      <BarsList bars={chart.bars} currentTime={currentTime} />
    </div>
  );
}
