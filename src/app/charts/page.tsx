"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface DrumChart {
  id: number;
  title: string;
  video_id: string;
}

export default function ChartsList() {
  const [charts, setCharts] = useState<DrumChart[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    isOpen: boolean;
  }>({ title: "", message: "", isOpen: false });
  const [durations, setDurations] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCharts();
  }, []);

  useEffect(() => {
    async function fetchDurations() {
      if (!charts.length) {
        console.log("No charts to fetch durations for.");
        return;
      }
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      if (!apiKey) {
        console.log("No API key found. Skipping YouTube API fetch.");
        return;
      }
      const ids = charts.map((c) => c.video_id).join(",");
      console.log("Fetching durations for video IDs:", ids);
      try {
        console.log("Starting YouTube API fetch...");
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${apiKey}`
        );
        const data = await res.json();
        console.log("YouTube API response:", data);
        const map: Record<string, string> = {};
        for (const item of data.items || []) {
          map[item.id] = parseISODuration(item.contentDetails.duration);
        }
        setDurations(map);
      } catch (e) {
        console.error("YouTube API fetch error:", e);
      }
    }
    fetchDurations();
  }, [charts]);

  function parseISODuration(iso: string): string {
    // e.g. PT4M13S, PT1H2M3S
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "Unknown";
    const [, h, m, s] = match;
    const hours = h ? String(h).padStart(2, "0") : "00";
    const mins = m ? String(m).padStart(2, "0") : "00";
    const secs = s ? String(s).padStart(2, "0") : "00";
    return h ? `${hours}:${mins}:${secs}` : `${mins}:${secs}`;
  }

  async function fetchCharts() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.push("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("charts")
        .select("id, title, video_id")
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setCharts(data || []);
    } catch (error) {
      console.error("Error fetching charts:", error);
      setModal({
        title: "Error",
        message: "Failed to fetch charts. Please try again.",
        isOpen: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteChart(id: number) {
    if (confirm("Are you sure you want to delete this chart?")) {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          router.push("/auth");
          return;
        }

        const { error } = await supabase
          .from("charts")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        setCharts(charts.filter((chart) => chart.id !== id));
        setModal({
          title: "Success",
          message: "Chart deleted successfully!",
          isOpen: true,
        });
      } catch (error) {
        console.error("Error deleting chart:", error);
        setModal({
          title: "Error",
          message: "Failed to delete chart. Please try again.",
          isOpen: true,
        });
      }
    }
  }

  if (loading) {
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
      <h1 className="text-2xl font-bold mb-4">My Drum Charts</h1>
      <Link href="/">
        <Button className="mb-4">Create New Chart</Button>
      </Link>
      {charts.length === 0 ? (
        <p>You haven't created any charts yet.</p>
      ) : (
        <ul className="space-y-2">
          {charts.map((chart) => (
            <li
              key={chart.id}
              className="border p-2 rounded flex justify-between items-center"
            >
              <div className="flex items-start gap-4">
                <img
                  src={`https://img.youtube.com/vi/${chart.video_id}/mqdefault.jpg`}
                  alt={chart.title}
                  className="w-40 h-24 object-cover rounded"
                />
                <div>
                  <Link href={`/charts/${chart.id}`}>{chart.title}</Link>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => deleteChart(chart.id)}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
