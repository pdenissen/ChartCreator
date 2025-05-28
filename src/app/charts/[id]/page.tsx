"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { BarsList } from "@/components/charts/BarsList";
import { ChartActions } from "@/components/charts/ChartActions";
import type { Chart, Bar } from "@/types/chart";
import type { YouTubeEvent } from "@/types/youtube";
import { VideoControls } from "@/components/VideoControls";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";

export default function ChartDetail() {
  const params = useParams();
  const router = useRouter();
  const [chart, setChart] = useState<Chart | null>(null);
  const [bars, setBars] = useState<Bar[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [duration, setDuration] = useState(0);
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    isOpen: boolean;
  }>({ title: "", message: "", isOpen: false });

  useEffect(() => {
    fetchChart();
  }, []);

  const handlePlayerReady = (player: YT.Player) => {
    setPlayer(player);
    setDuration(player.getDuration());
  };

  const onPlayerStateChange = (event: YouTubeEvent) => {
    // Update playing state if needed
  };

  const onTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  async function fetchChart() {
    const { data, error } = await supabase
      .from("charts")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching chart:", error);
    } else {
      setChart(data);
      const { data: barsData, error: barsError } = await supabase
        .from("bars")
        .select("*")
        .eq("chart_id", data.id)
        .order("start_time", { ascending: true });
      if (barsError) {
        console.error("Error fetching bars:", barsError);
        setBars([]);
      } else {
        setBars(barsData || []);
      }
    }
  }

  async function deleteChart() {
    if (confirm("Are you sure you want to delete this chart?")) {
      const { error } = await supabase
        .from("charts")
        .delete()
        .eq("id", params.id);

      if (error) {
        console.error("Error deleting chart:", error);
        setModal({
          title: "Error",
          message: "Failed to delete chart. Please try again.",
          isOpen: true,
        });
      } else {
        setModal({
          title: "Success",
          message: "Chart deleted successfully!",
          isOpen: true,
        });
        router.push("/charts");
      }
    }
  }

  function BarsSection({
    bars,
    chartId,
    currentTime,
  }: {
    bars: Bar[];
    chartId: string | number;
    currentTime: number;
  }) {
    if (bars.length > 0) {
      return (
        <>
          <h1 className="text-2xl font-semibold">Bars</h1>
          <BarsList bars={bars} currentTime={currentTime} />
        </>
      );
    }
    return (
      <div className="flex flex-col items-start justify-center py-8">
        <Link href={`/charts/${chartId}/edit`}>
          <button
            className="px-6 py-2 rounded font-semibold transition-colors bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            aria-label="Add Bars to this chart"
          >
            Add Bars
          </button>
        </Link>
      </div>
    );
  }

  if (!chart) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Modal
        title={modal.title}
        message={modal.message}
        isOpen={modal.isOpen}
        onClose={() => setModal((m) => ({ ...m, isOpen: false }))}
      />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4">{chart.song_title}</h1>
        <ChartActions
          chartId={chart.id}
          onDelete={deleteChart}
          onPlay={() => {}}
          onPause={() => {}}
          onReset={() => {}}
          isPlaying={false}
          canEdit={true}
        />
      </div>
      <div className="max-w-3xl mb-16">
        <YouTubePlayer
          videoId={chart.video_id}
          onStateChange={onPlayerStateChange}
          onTimeUpdate={onTimeUpdate}
          onPlayerReady={handlePlayerReady}
        />
        <VideoControls
          player={player}
          currentTime={currentTime}
          duration={duration}
          bars={bars}
        />
      </div>
      <BarsSection bars={bars} chartId={chart.id} currentTime={currentTime} />
    </div>
  );
}
