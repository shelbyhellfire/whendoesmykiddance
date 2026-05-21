"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Papa from "papaparse";
import React, { Suspense, useEffect, useState } from "react";
import { useAwards } from "../hooks/useAwards";
import { DanceEntry } from "../types/dance";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [dancers, setDancers] = useState<string[]>([""]);
  const [danceData, setDanceData] = useState<DanceEntry[]>([]);
  const [filteredResults, setFilteredResults] = useState<DanceEntry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string>("All");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [uniqueDancerNames, setUniqueDancerNames] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const { findNextAward, awards, isAwardBetween, parseTime } = useAwards();

  // Color palette for different dancers - with actual hex colors for gradients
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
            console.log("Loaded entries:", entries.length);
            setDanceData(entries);

            // Extract unique dancer names
            const dancerNamesSet = new Set<string>();
            entries.forEach((entry) => {
              if (entry.dancerName) {
                // Split by comma for team routines
                const names = entry.dancerName.split(",");
                names.forEach((name) => {
                  const trimmedName = name.trim();
                  if (trimmedName) {
                    dancerNamesSet.add(trimmedName);
                  }
                });
              }
            });

            // Convert to sorted array
            const sortedNames = Array.from(dancerNamesSet).sort();
            setUniqueDancerNames(sortedNames);

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

  // Load dancers from URL parameters on initial load
  useEffect(() => {
    const dancerParams = searchParams.getAll("dancer");
    if (dancerParams.length > 0) {
      setDancers(dancerParams);
      // Trigger search once data is loaded
      if (danceData.length > 0) {
        performSearch(dancerParams);
      }
    }
  }, [searchParams, danceData]);

  // Perform the actual search logic (extracted for reuse)
  const performSearch = (searchDancers: string[]) => {
    const searchNames = searchDancers
      .map((name) => name.trim().toLowerCase())
      .filter((name) => name.length > 0);

    if (searchNames.length === 0) {
      return;
    }

    const results = danceData.filter((entry) => {
      const dancerNames = entry.dancerName?.toLowerCase() || "";
      return searchNames.some((searchName) => dancerNames.includes(searchName));
    });

    const uniqueResults = results.reduce((acc, current) => {
      const key = `${current.routineNumber}-${current.day}-${current.time}-${current.room}`;
      const existing = acc.find(
        (item) =>
          `${item.routineNumber}-${item.day}-${item.time}-${item.room}` === key,
      );
      if (existing) {
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
    setHasSearched(true);
  };

  const handleSearch = () => {
    // Update URL with dancer parameters
    const validDancers = dancers.filter((name) => name.trim().length > 0);
    if (validDancers.length === 0) return;

    // Build URL parameters
    const params = new URLSearchParams();
    validDancers.forEach((dancer) => {
      params.append("dancer", dancer.trim());
    });

    // Single dancer - go to their individual page
    if (validDancers.length === 1) {
      const dancerSlug = validDancers[0]
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
      router.push(`/${dancerSlug}`);
      return;
    }

    // Multiple dancers - go to compare page
    router.push(`/compare?${params.toString()}`);
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

    // Filter suggestions based on input
    if (value.trim().length > 0) {
      const filtered = uniqueDancerNames.filter((name) =>
        name.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(index);
    } else {
      setShowSuggestions(null);
      setFilteredSuggestions([]);
    }
  };

  const selectSuggestion = (index: number, name: string) => {
    const newDancers = [...dancers];
    newDancers[index] = name;
    setDancers(newDancers);
    setShowSuggestions(null);
    setFilteredSuggestions([]);
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

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-4 md:p-8 mb-6">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/"
              className="text-sm text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
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
              Home
            </Link>
            <Link
              href="/schedule"
              className="text-sm text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
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

          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
            Search for Dancers
          </h1>
          <p className="text-gray-600 mb-6">
            View schedules with shareable links. Add multiple dancers to compare
            schedules side-by-side with color-coding!
          </p>

          <div className="space-y-3">
            {dancers.map((dancer, index) => (
              <div key={index} className="flex gap-2 items-center relative">
                <div
                  className={`w-4 h-4 rounded-full ${dancerColors[index % dancerColors.length].bg} flex-shrink-0`}
                ></div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={dancer}
                    onChange={(e) => updateDancer(index, e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => {
                      if (dancer.trim().length > 0) {
                        const filtered = uniqueDancerNames.filter((name) =>
                          name.toLowerCase().includes(dancer.toLowerCase()),
                        );
                        setFilteredSuggestions(filtered);
                        setShowSuggestions(index);
                      }
                    }}
                    onBlur={() => {
                      // Delay to allow click on suggestion
                      setTimeout(() => setShowSuggestions(null), 200);
                    }}
                    placeholder={
                      dancers.length === 1
                        ? "Enter dancer's name..."
                        : `Dancer ${index + 1}'s name...`
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                  />
                  {/* Custom Autocomplete Dropdown */}
                  {showSuggestions === index &&
                    filteredSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredSuggestions.slice(0, 10).map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => selectSuggestion(index, name)}
                            className="w-full text-left px-4 py-2 hover:bg-purple-100 transition-colors text-gray-800"
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
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
                  className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-medium text-xs md:text-base py-2 px-4 md:py-3 md:px-6 rounded-lg transition duration-200 whitespace-nowrap"
                >
                  + Add Another Dancer
                </button>
              )}
              <button
                onClick={handleSearch}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm md:text-base py-2 px-4 md:py-3 md:px-8 rounded-lg transition duration-200 ml-auto whitespace-nowrap"
              >
                View Schedule
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
            {/* Header with dancers and copy button */}
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap gap-3 items-center">
                {dancers
                  .filter((name) => name.trim())
                  .map((name, index) => (
                    <React.Fragment key={index}>
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                        <div
                          className={`w-3 h-3 rounded-full ${dancerColors[index % dancerColors.length].bg}`}
                        ></div>
                        <span className="text-sm font-semibold text-gray-700">
                          {name}
                        </span>
                      </div>
                      <Link
                        href={`/${name.trim().toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-xs text-purple-600 hover:text-purple-800 hover:underline font-medium"
                      >
                        View Schedule →
                      </Link>
                    </React.Fragment>
                  ))}
              </div>

              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-purple-600 text-white hover:bg-purple-700"
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
                      .sort((a, b) => {
                        // Sort by day first, then by time
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
                                className={`w-full text-white px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 transition-colors ${
                                  color.isGradient
                                    ? ""
                                    : `${color.bg} ${color.hover}`
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
                                  {showDancerIndicator &&
                                    matchingDancers.length > 1 && (
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

                              {/* Accordion Content - Collapsed by Default */}
                              {isExpanded && (
                                <div className="p-6 bg-white">
                                  <div className="flex flex-wrap gap-4">
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
                                    {nextAward && (
                                      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-2 border-amber-300 rounded-lg ml-auto">
                                        <div>
                                          <div className="text-xs text-amber-700">
                                            Awards
                                          </div>
                                          <div className="text-sm font-bold text-amber-900">
                                            {nextAward.time} in {nextAward.room}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Dancer indicator for multi-dancer searches */}
                                  {showDancerIndicator &&
                                    matchingDancers.length > 0 && (
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
      </div>
    </div>
  );
}

export default function SearchPage() {
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
      <SearchPageContent />
    </Suspense>
  );
}
