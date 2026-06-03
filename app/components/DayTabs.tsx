interface DayTabsProps {
  days: string[];
  activeDay: string;
  onDayChange: (day: string) => void;
  counts?: Record<string, number>;
  totalCount?: number;
}

export default function DayTabs({
  days,
  activeDay,
  onDayChange,
  counts,
  totalCount,
}: DayTabsProps) {
  return (
    <div className="flex border-b border-gray-300 mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
      {days.map((day) => {
        const count = day === "All" ? totalCount : counts?.[day];
        
        // Hide tabs with 0 count (except "All")
        if (day !== "All" && count === 0) return null;

        return (
          <button
            key={day}
            onClick={() => onDayChange(day)}
            className={`px-3 md:px-6 py-3 text-sm md:text-base font-semibold transition-all whitespace-nowrap ${
              activeDay === day
                ? "bg-purple-600 text-white rounded-t-lg border-b-2 border-purple-600 -mb-[1px]"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            {day}
            {count !== undefined && ` (${count})`}
          </button>
        );
      })}
    </div>
  );
}
