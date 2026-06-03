import React from "react";
import { DanceEntry } from "../types/dance";

interface CompareAccordionProps {
  entry: DanceEntry;
  isExpanded: boolean;
  onToggle: () => void;
  showDay?: boolean;
  nextAward?: { time: string; room: string } | null;
  color: {
    bg: string;
    bgColor: string;
    hover: string;
    border: string;
    light: string;
    isGradient: boolean;
  };
  matchingDancers: Array<{ name: string; index: number }>;
  dancerColors: Array<{
    bg: string;
    bgColor: string;
    hover: string;
    border: string;
    light: string;
  }>;
}

export default function CompareAccordion({
  entry,
  isExpanded,
  onToggle,
  showDay = false,
  nextAward,
  color,
  matchingDancers,
  dancerColors,
}: CompareAccordionProps) {
  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className={`w-full text-white px-2 py-3 md:px-6 md:py-4 flex flex-wrap items-center gap-2 md:gap-3 transition-colors relative ${
          color.isGradient ? "" : `${color.bg} ${color.hover}`
        }`}
        style={color.isGradient ? { background: color.bgColor } : {}}
      >
        <h3 className="flex-shrink-0 text-base md:text-lg font-bold text-left whitespace-nowrap pr-8">
          <span className="opacity-75 mr-1">#{entry.routineNumber}</span>
          {entry.routineName || "Untitled Routine"}
        </h3>
        <svg
          className={`w-5 h-5 absolute top-3 right-2 md:top-4 md:right-6 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <div className="flex flex-col items-end gap-0 ml-auto pr-6">
          {showDay && (
            <span className="text-xs md:text-sm font-semibold leading-tight">
              {entry.day}
            </span>
          )}
          <span className="text-xs md:text-sm font-semibold leading-tight">
            {entry.time}
          </span>
        </div>
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="p-4 md:p-6 bg-white">
          <div className="flex flex-nowrap gap-2 md:gap-4 items-center overflow-x-auto">
            <div className="text-center flex-shrink-0">
              <div className="text-[10px] md:text-xs text-gray-500 mb-1">
                Room
              </div>
              <div className="text-xs md:text-base font-semibold text-gray-900">
                {entry.room}
              </div>
            </div>
            {entry.category && (
              <div className="text-center flex-shrink-0">
                <div className="text-[10px] md:text-xs text-gray-500 mb-1">
                  Category
                </div>
                <div className="text-xs md:text-base font-semibold text-gray-900">
                  {entry.category}
                </div>
              </div>
            )}
            {entry.ageGroup && (
              <div className="text-center flex-shrink-0">
                <div className="text-[10px] md:text-xs text-gray-500 mb-1">
                  Age Group
                </div>
                <div className="text-xs md:text-base font-semibold text-gray-900">
                  {entry.ageGroup}
                </div>
              </div>
            )}
            {entry.level && (
              <div className="text-center flex-shrink-0">
                <div className="text-[10px] md:text-xs text-gray-500 mb-1">
                  Level
                </div>
                <div className="text-xs md:text-base font-semibold text-gray-900">
                  {entry.level}
                </div>
              </div>
            )}
            {nextAward && (
              <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 bg-amber-50 border border-amber-300 md:border-2 rounded-lg ml-auto flex-shrink-0">
                <div>
                  <div className="text-[10px] md:text-xs text-amber-700">
                    Awards
                  </div>
                  <div className="text-xs md:text-sm font-bold text-amber-900 whitespace-nowrap">
                    {nextAward.time}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Matching Dancers */}
          {matchingDancers.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex flex-wrap gap-1.5">
                {matchingDancers.map((dancer) => (
                  <div
                    key={dancer.index}
                    className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-full"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${dancerColors[dancer.index % dancerColors.length].bg}`}
                    ></div>
                    <span className="text-xs font-semibold text-gray-700">
                      {dancer.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
