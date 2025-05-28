"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { YouTubeSearch } from "@/components/YouTubeSearch";
import { VideoPlayerWithTapping } from "@/components/VideoPlayerWithTapping";
import { Button } from "@/components/ui/button";
import * as Label from "@radix-ui/react-label";
import type { Session } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      <h1 className="z-10 text-5xl md:text-7xl font-extrabold text-primary text-center mb-12 drop-shadow-lg">
        Drum Chart Creator
      </h1>
      <section className="z-10 flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
        <Label.Root htmlFor="youtube-search" className="sr-only">
          Search for a YouTube video
        </Label.Root>
        <div className="flex w-full justify-center">
          <YouTubeSearch
            onVideoSelect={handleVideoSelect}
            inputClassName="text-base md:text-lg px-8 py-6 rounded-l-lg flex-1 border-2 border-primary focus:border-primary focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-base md:placeholder:text-lg placeholder:text-secondary shadow-xl"
            buttonClassName="text-2xl md:text-3xl px-8 py-6 rounded-r-lg bg-primary text-background hover:bg-primary/90 transition-colors shadow-xl"
            large
          />
        </div>
      </section>
      {selectedVideoId && (
        <div className="z-10 mt-12 flex flex-col items-center justify-center w-full max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            Selected Video
          </h2>
          <VideoPlayerWithTapping videoId={selectedVideoId} />
          <Button onClick={() => router.push("/charts")} className="mt-6">
            View My Charts
          </Button>
        </div>
      )}
    </main>
  );
}
