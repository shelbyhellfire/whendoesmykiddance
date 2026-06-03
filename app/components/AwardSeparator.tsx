interface AwardSeparatorProps {
  time: string;
  room: string;
}

export default function AwardSeparator({ time, room }: AwardSeparatorProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 h-px bg-gray-400"></div>
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 border-2 border-amber-400 rounded-lg">
        <span className="text-xl">🏆</span>
        <span className="text-sm font-bold text-amber-900">
          Awards at {time} in {room}
        </span>
      </div>
      <div className="flex-1 h-px bg-gray-400"></div>
    </div>
  );
}
