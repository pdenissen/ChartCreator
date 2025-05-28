"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { VideoPlayerWithTapping } from "@/components/VideoPlayerWithTapping";
import { Modal } from "@/components/ui/modal";
import { Pencil } from "lucide-react";

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

  useEffect(() => {
    fetchChart();
  }, []);

  async function fetchChart() {
    console.log("params.id:", params.id);
    const chartId = Array.isArray(params.id) ? params.id[0] : params.id;
    console.log("chartId:", chartId);
    if (!chartId || typeof chartId !== "string") {
      setModal({
        title: "Error",
        message: `Invalid chart ID: ${String(chartId)}`,
        isOpen: true,
      });
      return;
    }
    const { data, error } = await supabase
      .from("charts")
      .select("*")
      .eq("id", chartId)
      .single();
    console.log("Supabase fetch result:", { data, error });
    if (error) {
      console.error("Error fetching chart:", error);
      setModal({
        title: "Error",
        message: `Error fetching chart with ID ${chartId}: ${error.message}`,
        isOpen: true,
      });
    } else if (!data) {
      setModal({
        title: "Not Found",
        message: `Chart not found for ID: ${chartId}`,
        isOpen: true,
      });
    } else {
      setChart(data);
      setNewTitle(data.title);
    }
  }

  async function handleSaveTitle() {
    if (!newTitle.trim()) return;
    setSaving(true);
    console.log("Updating chart with id:", chart?.id);
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
      <VideoPlayerWithTapping videoId={chart.video_id} existingChart={chart} />
    </div>
  );
}
