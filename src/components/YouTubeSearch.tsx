"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { supabase } from "@/lib/supabase";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface YouTubeSearchProps {
  onVideoSelect: (videoId: string) => void;
  inputClassName?: string;
  buttonClassName?: string;
  large?: boolean;
}

export function YouTubeSearch({
  onVideoSelect,
  inputClassName = "",
  buttonClassName = "",
  large = false,
}: YouTubeSearchProps) {
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
        className={`flex space-x-2${large ? " w-full" : ""}`}
        onSubmit={(e) => {
          e.preventDefault();
          searchYouTube();
        }}
      >
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search for a YouTube video"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={inputClassName}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background hover:bg-secondary transition-colors text-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        <Button type="submit" className={buttonClassName}>
          Search
        </Button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {results.map((video) => (
          <div
            key={video.id.videoId}
            className="group rounded-2xl bg-card border border-primary/20 shadow-lg overflow-hidden flex flex-col transition-transform hover:scale-105 hover:shadow-2xl focus-within:scale-105 outline-none"
            tabIndex={0}
          >
            <div className="aspect-[16/10] w-full bg-background flex items-center justify-center overflow-hidden">
              <img
                src={video.snippet.thumbnails.medium.url || "/placeholder.svg"}
                alt={video.snippet.title}
                className="object-cover w-full h-full transition-transform group-hover:scale-105 rounded-t-2xl"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2">
                {video.snippet.title}
              </h3>
              <Button
                onClick={() => handleSelect(video)}
                className="mt-auto bg-primary text-background rounded-lg shadow hover:bg-primary/90 transition-colors"
              >
                Select
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
