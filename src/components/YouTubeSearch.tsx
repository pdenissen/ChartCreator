"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface YouTubeSearchProps {
  onVideoSelect: (videoId: string) => void;
}

export function YouTubeSearch({ onVideoSelect }: YouTubeSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

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

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Search for a YouTube video"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={searchYouTube}>Search</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((video) => (
          <div key={video.id.videoId} className="border rounded p-2">
            <img
              src={video.snippet.thumbnails.medium.url || "/placeholder.svg"}
              alt={video.snippet.title}
              className="w-full"
            />
            <h3 className="mt-2 font-bold">{video.snippet.title}</h3>
            <Button
              onClick={() => onVideoSelect(video.id.videoId)}
              className="mt-2"
            >
              Select
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
