import { Bar } from "@/types/chart";
import { Button } from "@/components/ui/button";

interface TapBarManagerProps {
  bars: Bar[];
  onChange: (bars: Bar[]) => void;
  currentTime: number;
  isPlaying: boolean;
}

export function TapBarManager({
  bars,
  onChange,
  currentTime,
  isPlaying,
}: TapBarManagerProps) {
  const handleTap = () => {
    const newBar: Bar = {
      id: Date.now(), // temp unique id
      chart_id: 0, // to be set by parent
      time: currentTime,
      label: `Bar ${bars.length + 1}`,
    };
    const updatedBars = [...bars, newBar];
    console.log("Adding bar:", newBar);
    console.log("Updated bars:", updatedBars);
    onChange(updatedBars);
  };

  const handleLabelChange = (index: number, newLabel: string) => {
    onChange(
      bars.map((bar, i) => (i === index ? { ...bar, label: newLabel } : bar))
    );
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return "--:--";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Sort bars by time and update labels
  const sortedBars = bars
    .slice()
    .sort((a, b) => a.time - b.time)
    .map((bar, idx) => ({
      ...bar,
      label: `Bar ${idx + 1}`,
    }));

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button onClick={handleTap} disabled={!isPlaying}>
          Tap Bar
        </Button>
      </div>
      <div className="space-y-2">
        {sortedBars.map((bar, index) => (
          <div
            key={bar.id ?? index}
            className="flex justify-between items-center border p-2 rounded"
          >
            <span>{bar.label}</span>
            <span>{formatTime(bar.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
