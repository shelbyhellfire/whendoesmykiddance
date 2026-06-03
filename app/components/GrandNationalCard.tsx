interface GrandNationalCardProps {
  description: string;
  day: string;
  time: string;
  room: string;
}

export default function GrandNationalCard({
  description,
  day,
  time,
  room,
}: GrandNationalCardProps) {
  // Normalize day display
  const dayDisplay =
    day === "Sun"
      ? "Sunday"
      : day === "Sat"
        ? "Saturday"
        : day === "Fri"
          ? "Friday"
          : day === "Thu"
            ? "Thursday"
            : day === "Wed"
              ? "Wednesday"
              : day === "Tue"
                ? "Tuesday"
                : day;

  return (
    <div className="border-2 border-amber-400 rounded-lg overflow-hidden shadow-md bg-gradient-to-r from-amber-50 to-yellow-50">
      <div className="px-4 py-4 md:px-6 md:py-5">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🏆</span>
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2">
              {description}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm md:text-base">
              <span className="font-semibold text-gray-700">{dayDisplay}</span>
              <span className="font-semibold text-gray-700">{time}</span>
              <span className="font-semibold text-gray-700">Room {room}</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mt-2">
              Participants determined from previous days&apos; performances
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
