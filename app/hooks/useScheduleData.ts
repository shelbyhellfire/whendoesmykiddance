import { useEffect, useState } from "react";
import Papa from "papaparse";
import { DanceEntry } from "../types/dance";

export function useScheduleData() {
  const [danceData, setDanceData] = useState<DanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/schedule.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const entries = results.data as DanceEntry[];
            setDanceData(entries);
            setLoading(false);
          },
          error: (err: unknown) => {
            setError("Error loading schedule data");
            setLoading(false);
            console.error("Parse error:", err);
          },
        });
      })
      .catch((err) => {
        setError("Error loading schedule file");
        setLoading(false);
        console.error("Fetch error:", err);
      });
  }, []);

  return { danceData, loading, error };
}
