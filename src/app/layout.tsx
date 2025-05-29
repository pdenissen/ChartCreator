import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { YouTubeApiLoader } from "@/components/YouTubeApiLoader";
import type React from "react"; // Added import for React
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Drum Chart Creator",
  description: "Create and manage drum charts for your favorite songs",
};

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={
          inter.className + " bg-black min-h-screen relative overflow-x-hidden"
        }
      >
        <ThemeProvider attribute="class">
          <div className="fixed inset-0 -z-10">
            <AnimatedBackground />
            <div className="absolute inset-0 bg-black/80 z-0 pointer-events-none" />
            <FloatingMusicNotes />
          </div>
          <Navbar />
          <YouTubeApiLoader />
          <div className="relative z-20 flex flex-col min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
