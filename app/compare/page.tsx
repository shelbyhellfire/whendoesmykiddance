"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Papa from "papaparse";
import React, { Suspense, useEffect, useState } from "react";
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
  const [copied, setCopied] = useState(false);
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-gray-600">Loading schedule...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-xl p-4 md:p-8 mb-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <Link
              href="/search"
              className="text-xs md:text-sm text-cyan-600 hover:text-cyan-800 hover:underline flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Search
            </Link>
            <Link
              href="/schedule"
              className="text-xs md:text-sm text-cyan-600 hover:text-cyan-800 hover:underline flex items-center gap-1"
            >
              Browse Full Schedule
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-3xl font-bold text-gray-800">
              {dancers.length === 2
                ? `${dancers[0]} & ${dancers[1]}'s Schedule`
                : dancers.length > 2
                  ? `${dancers.slice(0, -1).join(", ")} & ${dancers[dancers.length - 1]}'s Schedule`
                  : "Combined Schedule"}
            </h1>
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all whitespace-nowrap ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
              }`}
            >
              {copied ? (
                <>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
          </div>

          {/* Dancer badges */}
          <div className="flex flex-wrap gap-2 my-3">
            {dancers.map((name, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
              >
                <div
                  className={`w-3 h-3 rounded-full ${dancerColors[index % dancerColors.length].bg}`}
                ></div>
                <span className="text-sm font-semibold text-gray-700">
                  {name}
                </span>
              </div>
            ))}
          </div>

          {/* Live Stream Link */}
          <a
            href="https://starzdancecomp.com/TopShot/livestream/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-md"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Live Stream
          </a>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-lg shadow-xl px-2 py-4 md:p-8">
          {/* Dance Count */}
          <p className="text-gray-600 mb-4 px-2">
            {filteredResults.length} dance
            {filteredResults.length !== 1 ? "s" : ""}
          </p>

          {/* Day Tabs */}
          <div className="flex border-b border-gray-300 mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <button
              onClick={() => setActiveDay("All")}
              className={`px-3 md:px-6 py-3 text-sm md:text-base font-semibold transition-all whitespace-nowrap ${
                activeDay === "All"
                  ? "bg-purple-600 text-white rounded-t-lg border-b-2 border-purple-600 -mb-[1px]"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              All ({filteredResults.length})
            </button>
            {days.map((day) => {
              const count = resultsByDay[day]?.length || 0;
              if (count === 0) return null;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-3 md:px-6 py-3 text-sm md:text-base font-semibold transition-all whitespace-nowrap ${
                    activeDay === day
                      ? "bg-purple-600 text-white rounded-t-lg border-b-2 border-purple-600 -mb-[1px]"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {day} ({count})
                </button>
              );
            })}
          </div>

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
                      <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                        <button
                          onClick={() =>
                            setExpandedIndex(isExpanded ? null : index)
                          }
                          className={`w-full text-white px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 transition-colors ${
                            color.isGradient ? "" : `${color.bg} ${color.hover}`
                          }`}
                          style={
                            color.isGradient
                              ? { background: color.bgColor }
                              : {}
                          }
                        >
                          <div className="flex items-center justify-between w-full md:flex-1 gap-2">
                            <h3 className="text-base md:text-lg font-bold text-left">
                              <span className="opacity-75 mr-2">
                                #{entry.routineNumber}
                              </span>
                              {entry.routineName || "Untitled Routine"}
                            </h3>
                            {/* Show dancer badges in header when multiple searched dancers */}
                            {matchingDancers.length > 1 && (
                              <div className="hidden md:flex items-center gap-1">
                                {matchingDancers.map((dancer) => (
                                  <div
                                    key={dancer.index}
                                    className={`w-3 h-3 rounded-full ${dancerColors[dancer.index % dancerColors.length].bg}`}
                                    title={dancer.name}
                                  ></div>
                                ))}
                              </div>
                            )}
                            <svg
                              className={`w-5 h-5 md:hidden transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                          <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 w-full md:w-auto">
                            {activeDay === "All" && (
                              <span className="text-xs md:text-sm font-semibold">
                                {entry.day}
                              </span>
                            )}
                            <span className="text-xs md:text-sm font-semibold">
                              {entry.time}
                            </span>
                            <span className="text-xs md:text-sm font-semibold">
                              {entry.room}
                            </span>
                            <svg
                              className={`w-5 h-5 hidden md:block transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-4 md:p-6 bg-white">
                            <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-between md:justify-start">
                              {entry.category && (
                                <div className="text-center">
                                  <div className="text-[10px] md:text-xs text-gray-500 mb-1">
                                    Category
                                  </div>
                                  <div className="text-xs md:text-base font-semibold text-gray-900">
                                    {entry.category}
                                  </div>
                                </div>
                              )}
                              {entry.ageGroup && (
                                <div className="text-center">
                                  <div className="text-[10px] md:text-xs text-gray-500 mb-1">
                                    Age Group
                                  </div>
                                  <div className="text-xs md:text-base font-semibold text-gray-900">
                                    {entry.ageGroup}
                                  </div>
                                </div>
                              )}
                              {nextAward && (
                                <div className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-4 md:py-2 bg-amber-50 border border-amber-300 md:border-2 rounded-lg md:ml-auto">
                                  <span className="text-lg md:text-2xl">
                                    🏆
                                  </span>
                                  <div>
                                    <div className="text-[10px] md:text-xs text-amber-700">
                                      Awards
                                    </div>
                                    <div className="text-xs md:text-sm font-bold text-amber-900">
                                      <span className="block md:inline">
                                        {nextAward.time}
                                      </span>
                                      <span className="hidden md:inline">
                                        {" "}
                                        in{" "}
                                      </span>
                                      <span className="block md:inline">
                                        {nextAward.room}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Dancer indicator */}
                            {matchingDancers.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-4">
                                {matchingDancers.map((dancer) => (
                                  <div
                                    key={dancer.index}
                                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
                                  >
                                    <div
                                      className={`w-3 h-3 rounded-full ${dancerColors[dancer.index % dancerColors.length].bg}`}
                                    ></div>
                                    <span className="text-sm font-semibold text-gray-700">
                                      {dancer.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {awardBetween && (
                        <div className="flex items-center gap-3 py-3">
                          <div className="flex-1 h-px bg-gray-400"></div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 border-2 border-amber-400 rounded-lg">
                            <span className="text-xl">🏆</span>
                            <span className="text-sm font-bold text-amber-900">
                              Awards at {awardBetween.time} in{" "}
                              {awardBetween.room}
                            </span>
                          </div>
                          <div className="flex-1 h-px bg-gray-400"></div>
                        </div>
                      )}

                      {awardAfterLast && !awardBetween && (
                        <div className="flex items-center gap-3 py-3">
                          <div className="flex-1 h-px bg-gray-400"></div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 border-2 border-amber-400 rounded-lg">
                            <span className="text-xl">🏆</span>
                            <span className="text-sm font-bold text-amber-900">
                              Awards at {awardAfterLast.time} in{" "}
                              {awardAfterLast.room}
                            </span>
                          </div>
                          <div className="flex-1 h-px bg-gray-400"></div>
                        </div>
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
              <div className="text-gray-600">Loading...</div>
            </div>
          </div>
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
