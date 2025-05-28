"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { supabase } from "@/lib/supabase";

interface YouTubeSearchProps {
  onVideoSelect: (videoId: string) => void;
}

export function YouTubeSearch({ onVideoSelect }: YouTubeSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [chartTitle, setChartTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const searchYouTube = async () => {
    try {
      const response = await fetch(
        `/api/youtube-search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setResults(data.items);
    } catch (error) {
      console.error("Error searching YouTube:", error);
    }
  };

  const handleSelect = (video: any) => {
    setSelectedVideo(video);
    setChartTitle(video.snippet.title);
    setModalOpen(true);
    setError("");
  };

  const handleSave = async () => {
    if (!chartTitle.trim() || !selectedVideo) return;
    setSaving(true);
    setError("");
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("You must be logged in to save a chart.");
      const { data, error } = await supabase
        .from("charts")
        .insert([
          {
            title: chartTitle.trim(),
            video_id: selectedVideo.id.videoId,
            user_id: user.id,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      if (!data || !data.id) throw new Error("Failed to create chart.");
      setModalOpen(false);
      router.push(`/charts/${data.id}/edit`);
    } catch (err: any) {
      setError(err.message || "Failed to save chart.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Modal
        title="Create Chart"
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <div className="mb-4">
          <label htmlFor="chart-title" className="block mb-2 font-medium">
            Chart Title
          </label>
          <input
            id="chart-title"
            type="text"
            value={chartTitle}
            onChange={(e) => setChartTitle(e.target.value)}
            className="w-full border rounded px-3 py-2 text-base"
            placeholder="Enter chart title"
            aria-label="Chart title"
            autoFocus
            disabled={saving}
          />
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-200 text-gray-900 hover:bg-gray-300"
            onClick={() => setModalOpen(false)}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-black text-white hover:bg-gray-900 disabled:opacity-50"
            onClick={handleSave}
            disabled={!chartTitle.trim() || saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </Modal>
      <form
        className="flex space-x-2"
        onSubmit={(e) => {
          e.preventDefault();
          searchYouTube();
        }}
      >
        <Input
          type="text"
          placeholder="Search for a YouTube video"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit">Search</Button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((video) => (
          <div key={video.id.videoId} className="border rounded p-2">
            <img
              src={video.snippet.thumbnails.medium.url || "/placeholder.svg"}
              alt={video.snippet.title}
              className="w-full"
            />
            <h3 className="mt-2 font-bold">{video.snippet.title}</h3>
            <Button onClick={() => handleSelect(video)} className="mt-2">
              Select
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
