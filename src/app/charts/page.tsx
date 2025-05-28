"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface DrumChart {
  id: number;
  title: string;
  video_id: string;
}

export default function ChartsList() {
  const [charts, setCharts] = useState<DrumChart[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    isOpen: boolean;
  }>({ title: "", message: "", isOpen: false });

  useEffect(() => {
    fetchCharts();
  }, []);

  async function fetchCharts() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.push("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("charts")
        .select("id, title, video_id")
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setCharts(data || []);
    } catch (error) {
      console.error("Error fetching charts:", error);
      setModal({
        title: "Error",
        message: "Failed to fetch charts. Please try again.",
        isOpen: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteChart(id: number) {
    if (confirm("Are you sure you want to delete this chart?")) {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          router.push("/auth");
          return;
        }

        const { error } = await supabase
          .from("charts")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        setCharts(charts.filter((chart) => chart.id !== id));
        setModal({
          title: "Success",
          message: "Chart deleted successfully!",
          isOpen: true,
        });
      } catch (error) {
        console.error("Error deleting chart:", error);
        setModal({
          title: "Error",
          message: "Failed to delete chart. Please try again.",
          isOpen: true,
        });
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Modal
        title={modal.title}
        message={modal.message}
        isOpen={modal.isOpen}
        onClose={() => setModal((m) => ({ ...m, isOpen: false }))}
      />
      <h1 className="text-2xl font-bold mb-4">My Drum Charts</h1>
      <Link href="/">
        <Button className="mb-4">Create New Chart</Button>
      </Link>
      {charts.length === 0 ? (
        <p>You haven't created any charts yet.</p>
      ) : (
        <ul className="space-y-2">
          {charts.map((chart) => (
            <li
              key={chart.id}
              className="border p-2 rounded flex justify-between items-center"
            >
              <Link href={`/charts/${chart.id}`}>{chart.title}</Link>
              <Button
                variant="destructive"
                onClick={() => deleteChart(chart.id)}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
