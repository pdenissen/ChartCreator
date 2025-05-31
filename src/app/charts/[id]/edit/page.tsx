"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Modal } from "@/components/ui/modal";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionManager } from "@/components/charts/SectionManager";
import { TapBarManager } from "@/components/charts/TapBarManager";

interface ChartData {
  id: number;
  title: string;
  video_id: string;
  bars: { time: number; label: string }[];
}

export default function EditChart() {
  const params = useParams();
  const router = useRouter();
  const [chart, setChart] = useState<ChartData | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    isOpen: boolean;
  }>({ title: "", message: "", isOpen: false });
  const [bars, setBars] = useState<
    { id: number; chart_id: number; time: number; label: string }[]
  >([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchChart();
  }, []);

  useEffect(() => {
    if (chart) {
      setBars(
        chart.bars.map((bar, idx) => ({
          id:
            typeof (bar as any)?.id === "number"
              ? (bar as any).id
              : Number((bar as any)?.id) || Date.now() + idx,
          chart_id:
            typeof (bar as any)?.chart_id === "number"
              ? (bar as any).chart_id
              : Number((bar as any)?.chart_id) || chart.id,
          time: bar.time,
          label: bar.label,
        }))
      );
    }
  }, [chart]);

  async function fetchChart() {
    const chartId = Array.isArray(params.id) ? params.id[0] : params.id;

    if (!chartId || typeof chartId !== "string") {
      setModal({
        title: "Error",
        message: `Invalid chart ID: ${String(chartId)}`,
        isOpen: true,
      });
      return;
    }

    // Fetch the chart
    const { data: chartData, error: chartError } = await supabase
      .from("charts")
      .select("*")
      .eq("id", chartId)
      .single();

    if (chartError) {
      setModal({
        title: "Error",
        message: `Error fetching chart with ID ${chartId}: ${chartError.message}`,
        isOpen: true,
      });
      return;
    }

    // Fetch the bars for this chart
    const { data: barsData, error: barsError } = await supabase
      .from("bars")
      .select("id, chart_id, start_time, label")
      .eq("chart_id", chartId)
      .order("start_time", { ascending: true });

    if (barsError) {
      setModal({
        title: "Error",
        message: `Error fetching bars: ${barsError.message}`,
        isOpen: true,
      });
      return;
    }

    // Normalize bars to match expected structure
    const bars = (barsData || []).map((bar) => ({
      id: bar.id,
      chart_id: bar.chart_id,
      time: typeof bar.start_time === "number" ? bar.start_time : 0,
      label: bar.label || "",
    }));

    setChart({
      ...chartData,
      bars,
    });
    setNewTitle(chartData.title);
  }

  async function handleSaveTitle() {
    if (!newTitle.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("charts")
      .update({ title: newTitle.trim() })
      .eq("id", chart?.id)
      .select();
    setSaving(false);
    if (error) {
      setModal({
        title: "Error",
        message: "Failed to update title.",
        isOpen: true,
      });
    } else if (!data || data.length === 0) {
      setModal({
        title: "Error",
        message: "No chart was updated. Please try again.",
        isOpen: true,
      });
    } else {
      setChart((prev) => (prev ? { ...prev, title: newTitle.trim() } : prev));
      setEditModalOpen(false);
    }
  }

  // Add Bar (CREATE)
  async function handleAddBar(newBar: {
    id: number;
    chart_id: number;
    time: number;
    label: string;
  }) {
    if (!chart) return;
    const { data, error } = await supabase
      .from("bars")
      .insert([
        {
          chart_id: chart.id,
          start_time: newBar.time,
          label: newBar.label,
          duration: 0,
        },
      ])
      .select()
      .single();
    if (error) {
      setModal({ title: "Error", message: error.message, isOpen: true });
      return;
    }
    setBars((prev) => [...prev, { ...data, time: data.start_time }]);
  }

  // Remove Bar (DELETE)
  async function handleRemoveBar(id: number | string) {
    // If id is not a valid UUID (i.e., it's a temp number), just remove from local state
    const isUUID = typeof id === "string" && /^[0-9a-fA-F-]{36}$/.test(id);
    if (!isUUID) {
      setBars((prev) => prev.filter((bar) => String(bar.id) !== String(id)));
      return;
    }
    const { error } = await supabase.from("bars").delete().eq("id", id);
    if (error) {
      setModal({ title: "Error", message: error.message, isOpen: true });
      return;
    }
    setBars((prev) => prev.filter((bar) => String(bar.id) !== String(id)));
  }

  // Edit Bar Label (UPDATE)
  async function handleLabelChange(id: number, newLabel: string) {
    const { error } = await supabase
      .from("bars")
      .update({ label: newLabel })
      .eq("id", id);
    if (error) {
      setModal({ title: "Error", message: error.message, isOpen: true });
      return;
    }
    setBars((prev) =>
      prev.map((bar) => (bar.id === id ? { ...bar, label: newLabel } : bar))
    );
  }

  // Delete All Bars
  async function handleDeleteAllBars() {
    if (!chart) return;
    const { error } = await supabase
      .from("bars")
      .delete()
      .eq("chart_id", chart.id);
    if (error) {
      setModal({ title: "Error", message: error.message, isOpen: true });
      return;
    }
    setBars([]);
  }

  if (!chart) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Modal
        title="Edit Chart Title"
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        buttonLabel="Save"
        onAction={handleSaveTitle}
      >
        <div className="mb-4">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full border rounded px-3 py-2 text-base"
            placeholder="Enter chart title"
            aria-label="Chart title"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 text-gray-900 hover:bg-gray-300"
            onClick={() => setEditModalOpen(false)}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-black text-white hover:bg-gray-900 disabled:opacity-50"
            onClick={handleSaveTitle}
            disabled={!newTitle.trim() || saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </Modal>
      <Modal
        title={modal.title}
        message={modal.message}
        isOpen={modal.isOpen}
        onClose={() => setModal((m) => ({ ...m, isOpen: false }))}
      />
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        Edit Chart: {chart.title}
        <button
          type="button"
          aria-label="Edit chart title"
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={() => setEditModalOpen(true)}
        >
          <Pencil className="w-5 h-5" />
        </button>
      </h1>
      <VideoPlayer
        videoId={chart.video_id}
        onTimeUpdate={setCurrentTime}
        onPlayStateChange={setIsPlaying}
      />
      <TapBarManager
        bars={bars}
        onAddBar={handleAddBar}
        onRemoveBar={handleRemoveBar}
        onLabelChange={handleLabelChange}
        onDeleteAllBars={handleDeleteAllBars}
        currentTime={currentTime}
        isPlaying={isPlaying}
      />
      <SectionManager bars={bars} />
    </div>
  );
}
