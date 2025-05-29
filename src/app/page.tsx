"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { YouTubeSearch } from "@/components/YouTubeSearch";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import * as Label from "@radix-ui/react-label";
import type { Session } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Animated SVG background component
function AnimatedBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full z-0 animate-pulse"
      style={{ filter: "blur(40px)" }}
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient
          id="bg1"
          cx="50%"
          cy="50%"
          r="80%"
          fx="50%"
          fy="50%"
          gradientTransform="rotate(20)"
        >
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
        </radialGradient>
        <radialGradient id="bg2" cx="80%" cy="20%" r="60%" fx="80%" fy="20%">
          <stop offset="0%" stopColor="#f472b6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.7" />
        </radialGradient>
      </defs>
      <circle cx="800" cy="400" r="600" fill="url(#bg1)" />
      <circle cx="400" cy="700" r="400" fill="url(#bg2)" />
    </svg>
  );
}

// Floating music notes SVG
function FloatingMusicNotes() {
  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 w-full h-full z-10"
      width="100%"
      height="100%"
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="animate-float-slow">
        <text x="10%" y="20%" fontSize="48" fill="#f472b6" opacity="0.15">
          &#9835;
        </text>
        <text x="80%" y="30%" fontSize="36" fill="#6366f1" opacity="0.12">
          &#119070;
        </text>
        <text x="60%" y="80%" fontSize="40" fill="#fbbf24" opacity="0.10">
          &#9833;
        </text>
        <text x="30%" y="60%" fontSize="32" fill="#38bdf8" opacity="0.13">
          &#119070;
        </text>
        <text x="70%" y="50%" fontSize="44" fill="#f472b6" opacity="0.10">
          &#9839;
        </text>
      </g>
    </svg>
  );
}

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
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden">
      <AnimatedBackground />
      <div className="absolute inset-0 bg-black/80 z-0 pointer-events-none" />
      <FloatingMusicNotes />
      <header className="w-full flex flex-col items-center justify-center pt-16 pb-8 z-20">
        <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-fuchsia-500 to-secondary animate-gradient-x text-center drop-shadow-2xl animate-fade-in">
          Drum Chart Creator
        </h1>
        <div className="h-2 w-40 md:w-64 mx-auto bg-gradient-to-r from-primary via-fuchsia-500 to-secondary rounded-full animate-gradient-x my-6" />
        <p className="text-xl md:text-2xl text-gray-300 text-center animate-fade-in-up max-w-2xl mx-auto">
          Create, visualize, and share drum charts with style.
        </p>
      </header>
      <section className="z-20 flex flex-col items-center justify-center w-full max-w-4xl mx-auto mt-2">
        <Label.Root htmlFor="youtube-search" className="sr-only">
          Search for a YouTube video
        </Label.Root>
        <div className="flex w-full justify-center">
          <div className="w-full border-2 border-transparent backdrop-blur-md rounded-2xl shadow-2xl p-2 transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01]">
            <YouTubeSearch
              onVideoSelect={handleVideoSelect}
              inputClassName="text-base md:text-lg px-8 py-6 rounded-l-lg flex-1 border-2 border-primary focus:border-primary focus:ring-2 focus:ring-primary text-foreground placeholder:text-base md:placeholder:text-lg placeholder:text-secondary shadow-xl"
              buttonClassName="text-2xl md:text-3xl px-8 py-6 rounded-r-lg bg-primary text-background hover:bg-primary/90 transition-colors shadow-xl"
              large
            />
          </div>
        </div>
      </section>
      {selectedVideoId && (
        <div className="z-20 mt-16 flex flex-col items-center justify-center w-full max-w-5xl mx-auto animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-fuchsia-500 to-secondary animate-gradient-x text-center mb-4">
            Selected Video
          </h2>
          <div className="h-1 w-24 mx-auto bg-gradient-to-r from-primary via-fuchsia-500 to-secondary rounded-full animate-gradient-x mb-6" />
          <div className="rounded-2xl shadow-2xl border-2 border-gradient bg-black/70 p-4 animate-fade-in-up">
            <VideoPlayer videoId={selectedVideoId} />
          </div>
          <Button
            onClick={() => router.push("/charts")}
            className="mt-8 animate-bounce bg-gradient-to-r from-primary via-fuchsia-500 to-secondary text-white shadow-xl px-10 py-5 text-xl rounded-2xl border-2 border-gradient"
          >
            View My Charts
          </Button>
        </div>
      )}
      {/* Animations and gradient border utility */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 6s ease-in-out infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .animate-fade-in {
          animation: fade-in 1.2s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .animate-fade-in-up {
          animation: fade-in 1.2s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .border-gradient {
          border-image: linear-gradient(
              90deg,
              var(--tw-gradient-stops, #6366f1, #d946ef, #fbbf24)
            )
            1;
        }
      `}</style>
    </main>
  );
}
