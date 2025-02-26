"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Bar {
  time: number;
  label: string;
}

interface DrumChart {
  id: number;
  song_title: string;
  video_id: string;
  bars: Bar[];
}

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
  const playerRef = useRef<any>(null);
  const barsContainerRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    fetchChart();
  }, []);

  useEffect(() => {
    if (chart) {
      initYouTubeAPI();
    }
  }, [chart]);

  useEffect(() => {
    if (chart && currentTime) {
      const currentBarIndex = chart.bars.findIndex((bar, index) => {
        const nextBar = chart.bars[index + 1];
        return (
          bar.time <= currentTime && (!nextBar || nextBar.time > currentTime)
        );
      });

      if (
        currentBarIndex !== -1 &&
        barsContainerRef.current &&
        barRefs.current[currentBarIndex]
      ) {
        const container = barsContainerRef.current;
        const bar = barRefs.current[currentBarIndex];

        const containerRect = container.getBoundingClientRect();
        const barRect = bar.getBoundingClientRect();

        // Calculate if the current bar is not fully visible
        if (
          barRect.top < containerRect.top ||
          barRect.bottom > containerRect.bottom
        ) {
          bar.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }
  }, [currentTime, chart]);

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
    if (chart?.video_id) {
      playerRef.current = new window.YT.Player("youtube-player", {
        videoId: chart.video_id,
        height: "360",
        width: "640",
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onStateChange: onPlayerStateChange,
        },
      });
    }
  };

  const onPlayerStateChange = (event: any) => {
    // Start tracking time when video is playing
    if (event.data === window.YT.PlayerState.PLAYING) {
      startTimeTracking();
    } else {
      stopTimeTracking();
    }
  };

  let timeTrackingInterval: NodeJS.Timeout;

  const startTimeTracking = () => {
    timeTrackingInterval = setInterval(() => {
      if (playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 100);
  };

  const stopTimeTracking = () => {
    clearInterval(timeTrackingInterval);
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      if (timeTrackingInterval) {
        clearInterval(timeTrackingInterval);
      }
    };
  }, []);

  if (!chart) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{chart.song_title}</h1>
      <div className="mb-4 relative w-full aspect-video max-w-3xl mx-auto">
        <div id="youtube-player" className="absolute inset-0"></div>
      </div>
      <h2 className="text-xl font-semibold mb-2">Bars</h2>
      <div
        ref={barsContainerRef}
        className="space-y-2 max-h-[300px] overflow-y-auto pr-2 border p-4 rounded"
      >
        {chart.bars.map((bar, index) => (
          <div
            key={index}
            ref={(el) => (barRefs.current[index] = el)}
            className={`flex justify-between items-center border p-2 rounded transition-colors ${
              bar.time <= currentTime &&
              (!chart.bars[index + 1] ||
                chart.bars[index + 1].time > currentTime)
                ? "bg-accent border-[#ff6b35]"
                : ""
            }`}
          >
            <span>{bar.label}</span>
            <span>{formatTime(bar.time)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 space-x-2">
        <Link href="/charts">
          <Button>Back to Charts List</Button>
        </Link>
        <Link href={`/charts/${chart.id}/edit`}>
          <Button>Edit Chart</Button>
        </Link>
        <Button variant="destructive" onClick={deleteChart}>
          Delete Chart
        </Button>
      </div>
    </div>
  );
}
