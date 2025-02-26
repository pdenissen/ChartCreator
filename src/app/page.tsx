"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { YouTubeSearch } from "@/components/YouTubeSearch";
import { VideoPlayerWithTapping } from "@/components/VideoPlayerWithTapping";
import { Button } from "@/components/ui/button";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push("/auth");
    return null;
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Drum Chart Creator</h1>
      <YouTubeSearch onVideoSelect={handleVideoSelect} />
      {selectedVideoId && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Selected Video</h2>
          <VideoPlayerWithTapping videoId={selectedVideoId} />
        </div>
      )}
      <Button onClick={() => router.push("/charts")} className="mt-4">
        View My Charts
      </Button>
    </main>
  );
}
