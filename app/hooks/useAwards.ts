import Papa from "papaparse";
import { useEffect, useState } from "react";
import { AwardEntry } from "../types/dance";

export function useAwards() {
  const [awards, setAwards] = useState<AwardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/awards-clean.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setAwards(results.data as AwardEntry[]);
            setLoading(false);
          },
          error: () => {
            setLoading(false);
          },
        });
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Convert time to comparable format (assumes 12-hour format)
  const parseTime = (timeStr: string) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  // Find next award ceremony after a given dance
  const findNextAward = (
    day: string,
    time: string,
    room: string,
  ): AwardEntry | null => {
    // Filter awards for same day and room
    const relevantAwards = awards.filter(
      (award) => award.day === day && award.room === room,
    );

    const danceTimeMinutes = parseTime(time);

    // Find the first award after the dance
    const nextAward = relevantAwards
      .map((award) => ({
        ...award,
        timeMinutes: parseTime(award.time),
      }))
      .filter((award) => award.timeMinutes > danceTimeMinutes)
      .sort((a, b) => a.timeMinutes - b.timeMinutes)[0];

    return nextAward || null;
  };

  // Check if there's an award between two dances
  const isAwardBetween = (
    day: string,
    room: string,
    time1: string,
    time2: string,
  ): AwardEntry | null => {
    const relevantAwards = awards.filter(
      (award) => award.day === day && award.room === room,
    );

    const time1Minutes = parseTime(time1);
    const time2Minutes = parseTime(time2);

    const awardBetween = relevantAwards
      .map((award) => ({
        ...award,
        timeMinutes: parseTime(award.time),
      }))
      .filter(
        (award) =>
          award.timeMinutes > time1Minutes && award.timeMinutes < time2Minutes,
      )
      .sort((a, b) => a.timeMinutes - b.timeMinutes)[0];

    return awardBetween || null;
  };

  return { awards, loading, findNextAward, isAwardBetween, parseTime };
}
