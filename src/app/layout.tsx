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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class">
          <Navbar />
          <YouTubeApiLoader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
