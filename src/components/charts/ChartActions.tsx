import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface ChartActionsProps {
  chartId: number;
  onDelete: () => void;
}

export function ChartActions({ chartId, onDelete }: ChartActionsProps) {
  return (
    <div className="space-x-4">
      <Link href={`/charts/${chartId}/edit`}>
        <Button variant="ghost" className="text-sm" size="sm">
          <Pencil className="h-4 w-4 mr-1" />
          Edit Chart
        </Button>
      </Link>
      <Button
        variant="ghost"
        onClick={onDelete}
        className="text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
        size="sm"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete Chart
      </Button>
    </div>
  );
}
