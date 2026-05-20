"use client";

import Link from "next/link";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import { useAwards } from "../hooks/useAwards";
import { DanceEntry } from "../types/dance";

export default function SearchPage() {
  const [dancers, setDancers] = useState<string[]>([""]);
  const [danceData, setDanceData] = useState<DanceEntry[]>([]);
  const [filteredResults, setFilteredResults] = useState<DanceEntry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string>("All");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { findNextAward, awards, isAwardBetween, parseTime } = useAwards();

  // Color palette for different dancers - more sophisticated tones
  const dancerColors = [
    {
      bg: "bg-cyan-600",
      hover: "hover:bg-cyan-700",
      border: "border-cyan-300",
      light: "bg-cyan-50",
    },
    {
      bg: "bg-rose-400",
      hover: "hover:bg-rose-500",
      border: "border-rose-300",
      light: "bg-rose-50",
    },
    {
      bg: "bg-orange-500",
      hover: "hover:bg-orange-600",
      border: "border-orange-300",
      light: "bg-orange-50",
    },
    {
      bg: "bg-violet-600",
      hover: "hover:bg-violet-700",
      border: "border-violet-300",
      light: "bg-violet-50",
    },
    {
      bg: "bg-emerald-600",
      hover: "hover:bg-emerald-700",
      border: "border-emerald-300",
      light: "bg-emerald-50",
    },
  ];

  // Multiple dancers color (when routine has multiple searched dancers)
  const multipleColor = {
    bg: "bg-fuchsia-600",
    hover: "hover:bg-fuchsia-700",
    border: "border-fuchsia-300",
    light: "bg-fuchsia-50",
  };

  const days = ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Group results by day
  const resultsByDay = days.reduce(
    (acc, day) => {
      acc[day] = filteredResults.filter((entry) => entry.day === day);
      return acc;
    },
    {} as Record<string, DanceEntry[]>,
  );

  // Get the entries to display based on active tab
  const displayEntries =
    activeDay === "All" ? filteredResults : resultsByDay[activeDay] || [];

  useEffect(() => {
    // Load CSV from public folder
    fetch("/schedule.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const entries = results.data as DanceEntry[];
            console.log("Loaded entries:", entries.length);
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

  const handleSearch = () => {
    // Get non-empty dancer names
    const searchNames = dancers
      .map((name) => name.trim().toLowerCase())
      .filter((name) => name.length > 0);

    if (searchNames.length === 0) {
      return;
    }

    // Filter entries that match any of the search names
    const results = danceData.filter((entry) => {
      const dancerNames = entry.dancerName?.toLowerCase() || "";
      return searchNames.some((searchName) => dancerNames.includes(searchName));
    });

    setFilteredResults(results);
    setHasSearched(true);
  };

  const addDancerField = () => {
    setDancers([...dancers, ""]);
  };

  const removeDancerField = (index: number) => {
    if (dancers.length > 1) {
      const newDancers = dancers.filter((_, i) => i !== index);
      setDancers(newDancers);
    }
  };

  const updateDancer = (index: number, value: string) => {
    const newDancers = [...dancers];
    newDancers[index] = value;
    setDancers(newDancers);
  };

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

  // Determine which color to use for an entry
  const getEntryColor = (entry: DanceEntry) => {
    const matching = getMatchingDancers(entry);

    if (matching.length > 1) {
      return multipleColor;
    } else if (matching.length === 1) {
      return dancerColors[matching[0].index % dancerColors.length];
    }
    return dancerColors[0];
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-4 md:p-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            When Does My Kid Dance?
          </h1>
          <p className="text-gray-600 mb-6">
            Search for your dancers' schedules - each dancer will be
            color-coded!
          </p>

          <div className="space-y-3">
            {dancers.map((dancer, index) => (
              <div key={index} className="flex gap-2 items-center">
                <div
                  className={`w-4 h-4 rounded-full ${dancerColors[index % dancerColors.length].bg} flex-shrink-0`}
                ></div>
                <input
                  type="text"
                  value={dancer}
                  onChange={(e) => updateDancer(index, e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  placeholder={
                    dancers.length === 1
                      ? "Enter dancer's name..."
                      : `Dancer ${index + 1}'s name...`
                  }
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                />
                {dancers.length > 1 && (
                  <button
                    onClick={() => removeDancerField(index)}
                    className="text-red-500 hover:text-red-700 px-3 py-2"
                    aria-label="Remove dancer"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <div className="flex gap-2">
              {dancers.length < 5 && (
                <button
                  onClick={addDancerField}
                  className="text-purple-600 hover:text-purple-700 hover:underline font-medium px-2 py-2 transition duration-200"
                >
                  + Add Another Dancer
                </button>
              )}
              <button
                onClick={handleSearch}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 ml-auto"
              >
                Search All
              </button>
            </div>
          </div>

          {loading && (
            <div className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
              Loading schedule...
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {!loading && !error && danceData.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              No schedule data available.
            </div>
          )}
        </div>

        {hasSearched && (
          <div className="bg-white rounded-lg shadow-xl px-2 py-4 md:p-8">
            <div className="mb-4">
              <div className="flex flex-wrap gap-3">
                {dancers
                  .filter((name) => name.trim())
                  .map((name, index) => (
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
            </div>

            {filteredResults.length === 0 ? (
              <p className="text-gray-600">No dancers found with that name.</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-6">
                  Found {filteredResults.length} dance
                  {filteredResults.length !== 1 ? "s" : ""}
                </p>

                {/* Day Tabs */}
                <div className="flex border-b border-gray-300 mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                  {/* All Tab */}
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
                  {/* Individual Day Tabs */}
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

                {/* Active Day Content */}
                <div className="space-y-3">
                  {displayEntries.length > 0 ? (
                    displayEntries
                      .sort((a, b) => parseTime(a.time) - parseTime(b.time))
                      .map((entry, index, sortedEntries) => {
                        const isExpanded = expandedIndex === index;
                        const color = getEntryColor(entry);
                        const nextAward = findNextAward(
                          entry.day,
                          entry.time,
                          entry.room,
                        );
                        const matchingDancers = getMatchingDancers(entry);
                        const showDancerIndicator =
                          dancers.filter((d) => d.trim()).length > 1;

                        // Check if there's an award between this dance and the next
                        const nextEntry = sortedEntries[index + 1];
                        const awardBetween = nextEntry
                          ? isAwardBetween(
                              entry.day,
                              entry.room,
                              entry.time,
                              nextEntry.time,
                            )
                          : null;

                        // Check if this is the last dance and there's an award after it
                        const isLastDance =
                          !nextEntry ||
                          nextEntry.day !== entry.day ||
                          nextEntry.room !== entry.room;
                        const awardAfterLast = isLastDance ? nextAward : null;

                        return (
                          <React.Fragment key={index}>
                            <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                              {/* Accordion Header - Always Visible */}
                              <button
                                onClick={() =>
                                  setExpandedIndex(isExpanded ? null : index)
                                }
                                className={`w-full ${color.bg} ${color.hover} text-white px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 transition-colors`}
                              >
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
                              </button>

                              {/* Accordion Content - Collapsed by Default */}
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
                                    {entry.level && (
                                      <div className="text-center">
                                        <div className="text-xs text-gray-500 mb-1">
                                          Level
                                        </div>
                                        <div className="text-base font-semibold text-gray-900">
                                          {entry.level}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Combined Dancer Indicator and Award Time */}
                                  {(showDancerIndicator &&
                                    matchingDancers.length > 0) ||
                                  nextAward ? (
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                      {/* Award Time */}
                                      {nextAward && (
                                        <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-lg">
                                          <div className="flex items-center gap-2">
                                            <span className="text-2xl">🏆</span>
                                            <span className="text-base font-semibold text-amber-800">
                                              {nextAward.time} in{" "}
                                              {nextAward.room}
                                            </span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Dancer indicator for multi-dancer searches */}
                                      {showDancerIndicator &&
                                        matchingDancers.length > 0 && (
                                          <div className="flex flex-wrap gap-2 ml-auto">
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
                                  ) : null}
                                </div>
                              )}
                            </div>

                            {/* Award Separator */}
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

                            {/* Award after last dance */}
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
                    <p className="text-gray-600">
                      {activeDay === "All"
                        ? "No dances found."
                        : `No dances scheduled for ${activeDay}.`}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-white hover:text-purple-200 underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
