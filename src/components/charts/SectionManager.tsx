import { useState } from "react";
import { Bar } from "@/types/chart";
import { v4 as uuidv4 } from "uuid";

interface Section {
  id: string;
  name: string;
  startBarIndex: number;
  endBarIndex?: number;
}

interface SectionManagerProps {
  bars: Bar[];
}

export function SectionManager({ bars }: SectionManagerProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);

  const handleAddSection = () => {
    let newSections = [...sections];
    if (currentSection) {
      // Close the current section
      const lastIndex = bars.length - 1;
      const prevSectionIndex = newSections.findIndex(
        (s) => s.id === currentSection.id
      );
      if (prevSectionIndex !== -1) {
        newSections[prevSectionIndex] = {
          ...currentSection,
          endBarIndex: bars.length,
        };
      }
    }
    // Start a new section
    const sectionNumber = newSections.length + 1;
    const newSection: Section = {
      id: uuidv4(),
      name: `Section ${sectionNumber}`,
      startBarIndex: bars.length,
    };
    setSections([...newSections, newSection]);
    setCurrentSection(newSection);
  };

  // Group bars by section
  const groupedBars = () => {
    const groups: { section: Section; bars: Bar[] }[] = [];
    sections.forEach((section, i) => {
      const end = section.endBarIndex ?? bars.length;
      groups.push({
        section,
        bars: bars.slice(section.startBarIndex, end),
      });
    });
    return groups;
  };

  return (
    <div className="space-y-6">
      <button
        onClick={handleAddSection}
        className="px-6 py-2 rounded font-semibold transition-colors bg-primary text-background hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
      >
        Add Section
      </button>
      {groupedBars().map(({ section, bars }) => (
        <div
          key={section.id}
          className="border-2 border-primary/30 rounded-xl p-4 mb-4 bg-background"
        >
          <div className="font-bold text-lg mb-2 text-primary">
            {section.name}
          </div>
          <div className="space-y-2">
            {bars.map((bar, idx) => (
              <div
                key={bar.id ?? idx}
                className="flex justify-between items-center border p-2 rounded"
              >
                <span>{bar.label}</span>
                <span>
                  {isFinite(bar.time)
                    ? `${Math.floor(bar.time / 60)}:${String(
                        Math.floor(bar.time % 60)
                      ).padStart(2, "0")}`
                    : "--:--"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
