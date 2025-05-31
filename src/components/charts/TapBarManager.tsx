import { Bar } from "@/types/chart";
import { Button } from "@/components/ui/button";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/outline";

interface TapBarManagerProps {
  bars: Bar[];
  onAddBar: (bar: Bar) => void;
  onRemoveBar: (id: number | string) => void;
  onLabelChange: (id: number | string, newLabel: string) => void;
  onDeleteAllBars: () => void;
  currentTime: number;
  isPlaying: boolean;
}

export function TapBarManager({
  bars,
  onAddBar,
  onRemoveBar,
  onLabelChange,
  onDeleteAllBars,
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
    onAddBar(newBar);
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
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button onClick={handleTap} disabled={!isPlaying}>
            Tap Bar
          </Button>
        </div>
        <Button
          onClick={onDeleteAllBars}
          variant="destructive"
          className="flex items-center gap-1"
          disabled={bars.length === 0}
        >
          <TrashIcon className="h-5 w-5" />
          Delete all bars
        </Button>
      </div>
      <div className="space-y-2">
        {sortedBars.map((bar, index) => (
          <div
            key={bar.id ?? index}
            className="flex justify-between items-center border p-2 rounded"
          >
            <span>{bar.label}</span>
            <div className="flex items-center gap-2">
              <span>{formatTime(bar.time)}</span>
              <button
                type="button"
                aria-label="Remove bar"
                onClick={() => onRemoveBar(bar.id)}
                className="ml-2 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
