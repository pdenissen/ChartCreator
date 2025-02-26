"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { VideoPlayerWithTapping } from "@/components/VideoPlayerWithTapping";

interface ChartData {
  id: number;
  song_title: string;
  video_id: string;
  bars: { time: number; label: string }[];
}

export default function EditChart() {
  const params = useParams();
  const router = useRouter();
  const [chart, setChart] = useState<ChartData | null>(null);

  useEffect(() => {
    fetchChart();
  }, []);

  async function fetchChart() {
    const { data, error } = await supabase
      .from("drum_charts")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching chart:", error);
      router.push("/charts");
    } else {
      setChart(data);
    }
  }

  if (!chart) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Edit Chart: {chart.song_title}
      </h1>
      <VideoPlayerWithTapping videoId={chart.video_id} existingChart={chart} />
    </div>
  );
}
