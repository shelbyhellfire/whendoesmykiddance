interface DancerLegendProps {
  dancers: string[];
  dancerColors: Array<{
    bg: string;
    bgColor: string;
    hover: string;
    border: string;
    light: string;
  }>;
}

export default function DancerLegend({
  dancers,
  dancerColors,
}: DancerLegendProps) {
  const validDancers = dancers.filter((name) => name.trim().length > 0);

  if (validDancers.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 px-2">
      {validDancers.map((name, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
        >
          <div
            className={`w-3 h-3 rounded-full ${dancerColors[index % dancerColors.length].bg}`}
          ></div>
          <span className="text-sm font-semibold text-gray-700">{name}</span>
        </div>
      ))}
    </div>
  );
}
