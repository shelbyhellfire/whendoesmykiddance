"use client";

import Link from "next/link";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import { useAwards } from "../hooks/useAwards";
import { DanceEntry } from "../types/dance";

interface PageProps {
  params: Promise<{ dancerName: string }>;
}

export default function DancerSchedulePage({ params }: PageProps) {
  const [dancerName, setDancerName] = useState<string>("");
  const [danceData, setDanceData] = useState<DanceEntry[]>([]);
  const [filteredResults, setFilteredResults] = useState<DanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string>("All");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const { findNextAward, isAwardBetween, parseTime } = useAwards();

  const days = ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Unwrap params and load data
  useEffect(() => {
    params.then((resolvedParams) => {
      // Convert URL slug to proper name: "lotus-maciver" → "Lotus Maciver"
      const slugName = resolvedParams.dancerName;
      const properName = slugName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      setDancerName(properName);
    });
  }, [params]);

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

  // Show not found message if no results
  if (!loading && danceData.length > 0 && filteredResults.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Dancer Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                We couldn't find any dances for {dancerName}. Please check the
                name and try again.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
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
            </div>
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
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/search"
              className="text-sm text-cyan-600 hover:text-cyan-800 hover:underline flex items-center gap-1"
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
              className="text-sm text-cyan-600 hover:text-cyan-800 hover:underline flex items-center gap-1"
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

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-2">
                {dancerName}'s Schedule
              </h1>
              <p className="text-gray-600">
                {filteredResults.length} dance
                {filteredResults.length !== 1 ? "s" : ""}
              </p>
            </div>

            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap shrink-0 ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-cyan-600 text-white hover:bg-cyan-700"
              }`}
            >
              {copied ? (
                <>
                  <svg
                    className="w-5 h-5"
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
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
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
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-lg shadow-xl px-2 py-4 md:p-8">
          {/* Day Tabs */}
          <div className="flex border-b border-gray-300 mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <button
              onClick={() => setActiveDay("All")}
              className={`px-3 md:px-6 py-3 text-sm md:text-base font-semibold transition-all whitespace-nowrap ${
                activeDay === "All"
                  ? "bg-cyan-600 text-white rounded-t-lg border-b-2 border-cyan-600 -mb-[1px]"
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
                      ? "bg-cyan-600 text-white rounded-t-lg border-b-2 border-cyan-600 -mb-[1px]"
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
                    <React.Fragment key={index}>
                      <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                        <button
                          onClick={() =>
                            setExpandedIndex(isExpanded ? null : index)
                          }
                          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 md:px-6 md:py-4 transition-colors"
                        >
                          <div className="flex flex-col gap-3">
                            {/* First row: Title and basic info */}
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
                              <div className="flex items-center justify-between w-full md:flex-1">
                                <h3 className="text-base md:text-lg font-bold text-left">
                                  {entry.routineName || "Untitled Routine"}
                                </h3>
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
                            </div>
                            {/* Second row: Other dancers in this routine (if any) */}
                            {entry.dancerName &&
                              entry.dancerName.toLowerCase().includes(",") && (
                                <div className="flex items-start gap-2 text-left">
                                  <span className="text-xs font-semibold opacity-75">
                                    With:
                                  </span>
                                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
                                    {entry.dancerName
                                      .split(",")
                                      .map((name) => name.trim())
                                      .filter(
                                        (name) =>
                                          name.toLowerCase() !==
                                          dancerName.toLowerCase(),
                                      )
                                      .map((name, idx, arr) => (
                                        <span key={idx} className="font-medium">
                                          {name}
                                          {idx < arr.length - 1 ? "," : ""}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-6 bg-white">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center">
                                <div className="text-xs text-gray-500 mb-1">
                                  Routine #
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                  {entry.routineNumber}
                                </div>
                              </div>
                              {entry.category && (
                                <div className="text-center">
                                  <div className="text-xs text-gray-500 mb-1">
                                    Category
                                  </div>
                                  <div className="text-base font-semibold text-gray-900">
                                    {entry.category}
                                  </div>
                                </div>
                              )}
                              {entry.ageGroup && (
                                <div className="text-center">
                                  <div className="text-xs text-gray-500 mb-1">
                                    Age Group
                                  </div>
                                  <div className="text-base font-semibold text-gray-900">
                                    {entry.ageGroup}
                                  </div>
                                </div>
                              )}
                            </div>

                            {nextAward && (
                              <div className="mt-4">
                                <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">🏆</span>
                                    <span className="text-base font-semibold text-amber-800">
                                      {nextAward.time} in {nextAward.room}
                                    </span>
                                  </div>
                                </div>
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
