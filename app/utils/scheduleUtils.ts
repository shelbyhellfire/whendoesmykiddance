import { DanceEntry } from "../types/dance";

/**
 * Deduplicates dance entries and combines dancer names for team routines
 */
export function deduplicateEntries(entries: DanceEntry[]): DanceEntry[] {
  return entries.reduce((acc, current) => {
    const key = `${current.routineNumber}-${current.day}-${current.time}-${current.room}`;
    const existing = acc.find(
      (item) =>
        `${item.routineNumber}-${item.day}-${item.time}-${item.room}` === key,
    );
    if (existing) {
      // Combine dancer names
      if (
        current.dancerName &&
        !existing.dancerName.includes(current.dancerName)
      ) {
        existing.dancerName = `${existing.dancerName}, ${current.dancerName}`;
      }
    } else {
      acc.push({ ...current });
    }
    return acc;
  }, [] as DanceEntry[]);
}

/**
 * Sorts dance entries by day and time
 */
export function sortEntriesByDayAndTime(
  entries: DanceEntry[],
  dayOrder: string[],
  parseTime: (time: string) => number,
): DanceEntry[] {
  return [...entries].sort((a, b) => {
    const dayIndexA = dayOrder.indexOf(a.day);
    const dayIndexB = dayOrder.indexOf(b.day);
    if (dayIndexA !== dayIndexB) {
      return dayIndexA - dayIndexB;
    }
    return parseTime(a.time) - parseTime(b.time);
  });
}

/**
 * Gets unique values from an array and sorts them
 */
export function getUniqueValues(entries: DanceEntry[], key: keyof DanceEntry): string[] {
  return Array.from(
    new Set(entries.map((entry) => entry[key]).filter(Boolean) as string[]),
  ).sort();
}
