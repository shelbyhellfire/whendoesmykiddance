interface FilterControlsProps {
  selectedRoom: string;
  selectedAgeGroup: string;
  rooms: string[];
  ageGroups: string[];
  onRoomChange: (room: string) => void;
  onAgeChange: (age: string) => void;
}

export default function FilterControls({
  selectedRoom,
  selectedAgeGroup,
  rooms,
  ageGroups,
  onRoomChange,
  onAgeChange,
}: FilterControlsProps) {
  return (
    <div className="mb-4 flex flex-wrap items-start gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">Room</label>
        <select
          value={selectedRoom}
          onChange={(e) => onRoomChange(e.target.value)}
          className="px-3 py-1.5 text-sm bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-300 rounded-lg font-semibold text-pink-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 shadow-sm hover:shadow-md transition-all cursor-pointer min-w-[100px]"
        >
          {rooms.map((room) => (
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-700">Age Group</label>
        <select
          value={selectedAgeGroup}
          onChange={(e) => onAgeChange(e.target.value)}
          className="px-3 py-1.5 text-sm bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg font-semibold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm hover:shadow-md transition-all cursor-pointer min-w-[100px]"
        >
          {ageGroups.map((age) => (
            <option key={age} value={age}>
              {age}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
