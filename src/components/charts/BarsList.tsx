"use client";

import { useEffect, useRef } from "react";
import { Bar } from "@/types/chart";

interface BarsListProps {
  bars: Bar[];
  currentTime: number;
}

export function BarsList({ bars, currentTime }: BarsListProps) {
  const barsContainerRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isCurrentBar = (bar: Bar, index: number) => {
    const nextBar = bars[index + 1];
    const isLastBar = index === bars.length - 1;

    if (isLastBar) {
      return bar.time <= currentTime;
    }

    return bar.time <= currentTime && nextBar.time > currentTime;
  };

  useEffect(() => {
    if (currentTime) {
      const currentBarIndex = bars.findIndex((bar, index) =>
        isCurrentBar(bar, index)
      );

      if (
        currentBarIndex !== -1 &&
        barsContainerRef.current &&
        barRefs.current[currentBarIndex]
      ) {
        const container = barsContainerRef.current;
        const bar = barRefs.current[currentBarIndex];

        const containerRect = container.getBoundingClientRect();
        const barRect = bar.getBoundingClientRect();

        if (
          barRect.top < containerRect.top ||
          barRect.bottom > containerRect.bottom
        ) {
          bar.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }
  }, [currentTime, bars]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={barsContainerRef}
      className="space-y-2 max-h-[300px] overflow-y-auto pr-2 border p-4 rounded"
    >
      {bars.map((bar, index) => (
        <div
          key={index}
          ref={(el) => {
            barRefs.current[index] = el;
          }}
          className={`flex justify-between items-center border p-2 rounded transition-colors ${
            isCurrentBar(bar, index) ? "bg-accent border-[#ff6b35]" : ""
          }`}
        >
          <span>{bar.label}</span>
          <span>{formatTime(bar.time)}</span>
        </div>
      ))}
    </div>
  );
}
