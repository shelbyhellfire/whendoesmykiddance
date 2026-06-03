"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Papa from "papaparse";
import React, { Suspense, useEffect, useState } from "react";
import AwardSeparator from "../components/AwardSeparator";
import CompareAccordion from "../components/CompareAccordion";
import CopyLinkButton from "../components/CopyLinkButton";
import DancerLegend from "../components/DancerLegend";
import DayTabs from "../components/DayTabs";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import { useAwards } from "../hooks/useAwards";
import { DanceEntry } from "../types/dance";

function ComparePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [dancers, setDancers] = useState<string[]>([]);
  const [danceData, setDanceData] = useState<DanceEntry[]>([]);
  const [filteredResults, setFilteredResults] = useState<DanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string>("All");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { findNextAward, isAwardBetween, parseTime } = useAwards();

  // Color palette for different dancers
  const dancerColors = [
    {
      bg: "bg-cyan-600",
      bgColor: "#0891b2",
      hover: "hover:bg-cyan-700",
      border: "border-cyan-300",
      light: "bg-cyan-50",
    },
    {
      bg: "bg-rose-400",
      bgColor: "#fb7185",
      hover: "hover:bg-rose-500",
      border: "border-rose-300",
      light: "bg-rose-50",
    },
    {
      bg: "bg-orange-500",
      bgColor: "#f97316",
      hover: "hover:bg-orange-600",
      border: "border-orange-300",
      light: "bg-orange-50",
    },
    {
      bg: "bg-violet-600",
      bgColor: "#7c3aed",
      hover: "hover:bg-violet-700",
      border: "border-violet-300",
      light: "bg-violet-50",
    },
    {
      bg: "bg-emerald-600",
      bgColor: "#059669",
      hover: "hover:bg-emerald-700",
      border: "border-emerald-300",
      light: "bg-emerald-50",
    },
  ];

  const days = ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Load dancers from URL
  useEffect(() => {
    const dancerParams = searchParams.getAll("dancer");
    if (dancerParams.length === 0) {
      // Redirect back to search if no dancers
      router.push("/search");
      return;
    }
    setDancers(dancerParams);
  }, [searchParams, router]);

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

  // Filter results when dancers or data changes
  useEffect(() => {
    if (dancers.length === 0 || danceData.length === 0) return;

    const searchNames = dancers
      .map((name) => name.trim().toLowerCase())
      .filter((name) => name.length > 0);

    const results = danceData.filter((entry) => {
      const dancerNames = entry.dancerName?.toLowerCase() || "";
      return searchNames.some((searchName) => dancerNames.includes(searchName));
    });

    // Deduplicate routines and merge dancer names
    const uniqueResults = results.reduce((acc, current) => {
      const key = `${current.routineNumber}-${current.day}-${current.time}-${current.room}`;
      const existing = acc.find(
        (item) =>
          `${item.routineNumber}-${item.day}-${item.time}-${item.room}` === key,
      );
      if (existing) {
        // Merge dancer names if not already included
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

    setFilteredResults(uniqueResults);
  }, [dancers, danceData]);

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

  // Get which searched dancers are in a routine
  const getMatchingDancers = (entry: DanceEntry) => {
    const searchNames = dancers
      .map((name) => name.trim().toLowerCase())
      .filter((name) => name.length > 0);

    const dancerNames = entry.dancerName?.toLowerCase() || "";
    const matchingIndices = searchNames
      .map((name, index) => (dancerNames.includes(name) ? index : -1))
      .filter((index) => index !== -1);

    return matchingIndices.map((i) => ({ name: dancers[i], index: i }));
  };

  // Determine which color/gradient to use for an entry
  const getEntryColor = (entry: DanceEntry) => {
    const matching = getMatchingDancers(entry);

    if (matching.length > 1) {
      // Create a gradient using the individual dancer colors
      const color1 = dancerColors[matching[0].index % dancerColors.length];
      const color2 = dancerColors[matching[1].index % dancerColors.length];

      return {
        bg: "",
        bgColor: `linear-gradient(to right, ${color1.bgColor}, ${color2.bgColor})`,
        hover: "",
        border: color1.border,
        light: color1.light,
        isGradient: true,
      };
    } else if (matching.length === 1) {
      return {
        ...dancerColors[matching[0].index % dancerColors.length],
        isGradient: false,
      };
    }
    return {
      ...dancerColors[0],
      isGradient: false,
    };
  };

  if (loading) return <LoadingState message="Loading schedule..." />;
  if (error) return <ErrorState message={error} />;

  // Generate dynamic title
  const getPageTitle = () => {
    if (dancers.length === 2) {
      return `${dancers[0]} & ${dancers[1]}'s Schedule`;
    } else if (dancers.length > 2) {
      return `${dancers.slice(0, -1).join(", ")} & ${dancers[dancers.length - 1]}'s Schedule`;
    }
    return "Combined Schedule";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 md:p-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title={getPageTitle()}
          leftLink={{ href: "/search", label: "Back to Search", icon: "back" }}
          rightLink={{
            href: "/schedule",
            label: "Browse Full Schedule",
            icon: "forward",
          }}
        >
          {/* Buttons Row - Copy Link */}
          <div className="flex items-center gap-2">
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
            <CopyLinkButton
              variant="compact"
              className="md:absolute md:top-4 md:right-8"
            />
          </div>
        </PageHeader>

        {/* Schedule */}
        <div className="bg-white md:rounded-lg shadow-xl px-2 py-4 md:p-8">
          {/* Dancer Legend */}
          <DancerLegend dancers={dancers} dancerColors={dancerColors} />

          {/* Day Tabs */}
          <DayTabs
            days={["All", ...days]}
            activeDay={activeDay}
            onDayChange={setActiveDay}
            counts={Object.fromEntries(
              Object.entries(resultsByDay).map(([day, entries]) => [
                day,
                entries.length,
              ]),
            )}
            totalCount={filteredResults.length}
          />

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
                  const isExpanded = expandedIndex === index;
                  const color = getEntryColor(entry);
                  const nextAward = findNextAward(
                    entry.day,
                    entry.time,
                    entry.room,
                  );
                  const matchingDancers = getMatchingDancers(entry);

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
                    <React.Fragment key={index}>
                      <CompareAccordion
                        entry={entry}
                        isExpanded={isExpanded}
                        onToggle={() =>
                          setExpandedIndex(isExpanded ? null : index)
                        }
                        showDay={activeDay === "All"}
                        nextAward={nextAward}
                        color={color}
                        matchingDancers={matchingDancers}
                        dancerColors={dancerColors}
                      />

                      {awardBetween && (
                        <AwardSeparator
                          time={awardBetween.time}
                          room={awardBetween.room}
                        />
                      )}

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
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ComparePageContent />
    </Suspense>
  );
}
