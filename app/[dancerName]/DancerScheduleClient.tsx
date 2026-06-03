"use client";

import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import AwardSeparator from "../components/AwardSeparator";
import CopyLinkButton from "../components/CopyLinkButton";
import DanceAccordion from "../components/DanceAccordion";
import DayTabs from "../components/DayTabs";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import { useAwards } from "../hooks/useAwards";
import { DanceEntry } from "../types/dance";

interface DancerScheduleClientProps {
  dancerName: string;
}

export default function DancerScheduleClient({
  dancerName,
}: DancerScheduleClientProps) {
  const [danceData, setDanceData] = useState<DanceEntry[]>([]);
  const [filteredResults, setFilteredResults] = useState<DanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string>("All");
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);
  const { findNextAward, isAwardBetween, parseTime } = useAwards();

  const days = ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Load CSV data
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

  // Filter results when dancer name or data changes
  useEffect(() => {
    if (!dancerName || danceData.length === 0) return;

    const searchName = dancerName.toLowerCase();
    const results = danceData.filter((entry) => {
      const dancerNames = entry.dancerName?.toLowerCase() || "";
      return dancerNames.includes(searchName);
    });

    // Deduplicate routines
    const uniqueResults = results.reduce((acc, current) => {
      const key = `${current.routineNumber}-${current.day}-${current.time}-${current.room}`;
      const existing = acc.find(
        (item) =>
          `${item.routineNumber}-${item.day}-${item.time}-${item.room}` === key,
      );
      if (!existing) {
        acc.push({ ...current });
      }
      return acc;
    }, [] as DanceEntry[]);

    setFilteredResults(uniqueResults);
  }, [dancerName, danceData]);

  // Group results by day
  const resultsByDay = days.reduce(
    (acc, day) => {
      acc[day] = filteredResults.filter((entry) => entry.day === day);
      return acc;
    },
    {} as Record<string, DanceEntry[]>,
  );

  const displayEntries =
    activeDay === "All" ? filteredResults : resultsByDay[activeDay] || [];

  // Calculate counts for tabs
  const dayCounts = days.reduce(
    (acc, day) => {
      acc[day] = resultsByDay[day]?.length || 0;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (loading) return <LoadingState message="Loading schedule..." />;

  if (error) return <ErrorState message={error} />;

  // Show not found message if no results
  if (!loading && danceData.length > 0 && filteredResults.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 md:p-8">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="Dancer Not Found"
            leftLink={{
              href: "/search",
              label: "Back to Search",
              icon: "back",
            }}
          >
            <p className="text-gray-600 mb-6">
              We couldn't find any dances for {dancerName}. Please check the
              name and try again.
            </p>
          </PageHeader>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 md:p-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title={`${dancerName}'s Schedule`}
          leftLink={{ href: "/search", label: "Back to Search", icon: "back" }}
          rightLink={{
            href: "/schedule",
            label: "Browse Full Schedule",
            icon: "forward",
          }}
        >
          {/* Buttons Row - Live Stream and Copy Link */}
          <div className="flex items-center gap-2 mb-6">
            <a
              href="https://starzdancecomp.com/TopShot/livestream/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 border-2 border-red-600 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Live Stream
            </a>
            <CopyLinkButton variant="compact" />
          </div>

          {/* Day Tabs */}
          <DayTabs
            days={["All", ...days]}
            activeDay={activeDay}
            onDayChange={setActiveDay}
            counts={dayCounts}
            totalCount={filteredResults.length}
          />

          {/* Divider */}
          <div className="my-6 border-t border-gray-200"></div>

          {/* Dance List */}
          <div className="space-y-3">
            {displayEntries.length > 0 ? (
              displayEntries
                .sort((a, b) => {
                  const dayIndexA = days.indexOf(a.day);
                  const dayIndexB = days.indexOf(b.day);
                  if (dayIndexA !== dayIndexB) {
                    return dayIndexA - dayIndexB;
                  }
                  return parseTime(a.time) - parseTime(b.time);
                })
                .map((entry, index, sortedEntries) => {
                  const uniqueKey = `${entry.routineNumber}-${entry.day}-${entry.time}`;
                  const isExpanded = expandedIndex === uniqueKey;
                  const nextAward = findNextAward(
                    entry.day,
                    entry.time,
                    entry.room,
                  );

                  const nextEntry = sortedEntries[index + 1];
                  const awardBetween = nextEntry
                    ? isAwardBetween(
                        entry.day,
                        entry.room,
                        entry.time,
                        nextEntry.time,
                      )
                    : null;

                  const isLastDance =
                    !nextEntry ||
                    nextEntry.day !== entry.day ||
                    nextEntry.room !== entry.room;
                  const awardAfterLast = isLastDance ? nextAward : null;

                  return (
                    <React.Fragment key={uniqueKey}>
                      <DanceAccordion
                        entry={entry}
                        isExpanded={isExpanded}
                        onToggle={() =>
                          setExpandedIndex(isExpanded ? null : uniqueKey)
                        }
                        showDay={activeDay === "All"}
                        nextAward={nextAward}
                      />

                      {/* Award Separator */}
                      {awardBetween && (
                        <AwardSeparator
                          time={awardBetween.time}
                          room={awardBetween.room}
                        />
                      )}

                      {/* Award after last dance */}
                      {awardAfterLast && !awardBetween && (
                        <AwardSeparator
                          time={awardAfterLast.time}
                          room={awardAfterLast.room}
                        />
                      )}
                    </React.Fragment>
                  );
                })
            ) : (
              <p className="text-gray-600">No dances found.</p>
            )}
          </div>
        </PageHeader>
      </div>
    </div>
  );
}
