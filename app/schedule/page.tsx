"use client";

import Link from "next/link";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import { useAwards } from "../hooks/useAwards";
import { DanceEntry } from "../types/dance";

type ViewMode = "day" | "room" | "ageGroup";

export default function SchedulePage() {
  const [danceData, setDanceData] = useState<DanceEntry[]>([]);
  const [grandNationals, setGrandNationals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);
  const { findNextAward, isAwardBetween, parseTime } = useAwards();

  // Filters
  const [selectedDay, setSelectedDay] = useState<string>("All");
  const [selectedRoom, setSelectedRoom] = useState<string>("All");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("All");

  // Extract unique values for filters
  const dayOrder = [
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
    "Monday",
  ];
  const uniqueDays = Array.from(
    new Set(danceData.map((d) => d.day).filter(Boolean)),
  );
  // Add Sunday manually for Grand Nationals
  const allDays = [...uniqueDays];
  if (!allDays.includes("Sunday")) {
    allDays.push("Sunday");
  }
  const days = [
    "All",
    ...allDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)),
  ];
  const rooms = [
    "All",
    ...Array.from(new Set(danceData.map((d) => d.room).filter(Boolean))).sort(),
  ];
  const ageGroups = [
    "All",
    ...Array.from(
      new Set(danceData.map((d) => d.ageGroup).filter(Boolean)),
    ).sort(),
  ];

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

    // Load Grand Nationals from awards.csv
    fetch("/awards.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
          complete: (results) => {
            const entries = results.data as any[];
            console.log("Total CSV rows:", entries.length);
            // Filter for Grand National entries
            const gns = entries
              .filter((row: any) => {
                // Check both first column and other columns for Grand National text
                const rowString = JSON.stringify(row);
                return rowString.includes("Grand National");
              })
              .map((row: any) => {
                console.log("Raw Grand National row:", row);

                // Handle two formats:
                // Format 1: Quoted string in first column with newlines
                // Format 2: Comma-separated values across columns

                let room = "";
                let day = "";
                let time = "";
                let description = "";

                if (row[0] && row[0].includes("Grand National")) {
                  // Format 1: All data in first column
                  const fullText = String(row[0] || "")
                    .replace(/\n/g, " ")
                    .replace(/\s+/g, " ");
                  console.log("Format 1 - fullText:", fullText);

                  const parts = fullText.split(/\s+/);
                  room = parts[0];
                  day = parts[1];
                  const timeMatch = fullText.match(/\d{1,2}:\d{2}\s*[AP]M/);
                  time = timeMatch ? timeMatch[0] : "";
                  const descMatch = fullText.match(/--(.+?)--/);
                  description = descMatch
                    ? descMatch[1].trim()
                    : "Grand National";
                } else {
                  // Format 2: Data spread across columns
                  room = row[0] || "";
                  day = row[4] || ""; // Day is in column 5 (index 4)
                  time = row[8] || ""; // Time is in column 9 (index 8)

                  // Find which column has the description
                  for (let i = 0; i < row.length; i++) {
                    if (row[i] && String(row[i]).includes("Grand National")) {
                      const descMatch = String(row[i]).match(/--(.+?)--/);
                      description = descMatch
                        ? descMatch[1].trim()
                        : String(row[i]);
                      break;
                    }
                  }
                }

                console.log("Parsed:", { room, day, time, description });

                // Extract level and type from description
                let level = "";
                let type = "";

                if (description.includes("Rising Starz")) {
                  level = "Rising Starz";
                } else if (description.includes("Starz Level")) {
                  level = "Starz Level";
                } else if (description.includes("Starz")) {
                  level = "Starz";
                }

                if (description.includes("Solo & D/T")) {
                  type = "Solo & D/T";
                } else if (description.includes("Groups")) {
                  type = "Groups";
                } else if (description.includes("Productions")) {
                  type = "Productions";
                } else if (description.includes("Standout Dancer")) {
                  type = "Standout Dancer";
                } else if (description.includes("Final Awards")) {
                  type = "Final Awards";
                } else if (description.includes("Awards")) {
                  type = "Awards";
                }

                const result = { room, day, time, description, level, type };
                console.log("Parsed Grand National:", result);
                return result;
              });
            console.log("Grand Nationals loaded:", gns);
            setGrandNationals(gns);
          },
          error: (err: unknown) => {
            console.error("Error loading Grand Nationals:", err);
          },
        });
      })
      .catch((err) => {
        console.error("Error loading awards file:", err);
      });
  }, []);

  // Filter data based on selected filters
  const filteredData = danceData.filter((entry) => {
    const matchesDay = selectedDay === "All" || entry.day === selectedDay;
    const matchesRoom = selectedRoom === "All" || entry.room === selectedRoom;
    const matchesAgeGroup =
      selectedAgeGroup === "All" || entry.ageGroup === selectedAgeGroup;
    return matchesDay && matchesRoom && matchesAgeGroup;
  });

  // Remove duplicates and aggregate dancers for team routines
  const uniqueFilteredData = filteredData.reduce((acc, current) => {
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

  // Filter Grand Nationals based on selected filters
  const filteredGrandNationals = grandNationals.filter((gn) => {
    const matchesDay =
      selectedDay === "All" ||
      gn.day === selectedDay ||
      (selectedDay === "Sunday" && gn.day === "Sun") ||
      (selectedDay === "Saturday" && gn.day === "Sat") ||
      (selectedDay === "Friday" && gn.day === "Fri") ||
      (selectedDay === "Thursday" && gn.day === "Thu") ||
      (selectedDay === "Wednesday" && gn.day === "Wed") ||
      (selectedDay === "Tuesday" && gn.day === "Tue");
    const matchesRoom = selectedRoom === "All" || gn.room === selectedRoom;
    return matchesDay && matchesRoom;
  });

  const handleClearFilters = () => {
    setSelectedDay("All");
    setSelectedRoom("All");
    setSelectedAgeGroup("All");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
              href="/search"
              className="text-sm text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
            >
              Search for Dancers
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
            Browse Full Schedule
          </h1>
          <p className="text-gray-600 mb-4">
            Filter dances by day, room, and age group
          </p>

          {/* Compact Filter Dropdowns */}
          <div className="mb-2 flex flex-nowrap items-center gap-3 overflow-x-auto">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-gray-600">
                Day
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="px-3 py-1.5 bg-purple-100 border border-purple-300 rounded-lg text-sm font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 w-[100px] flex-shrink-0"
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-gray-600">
                Room
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="px-3 py-1.5 bg-blue-100 border border-blue-300 rounded-lg text-sm font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-[100px] flex-shrink-0"
              >
                {rooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-gray-600">
                Age
              </label>
              <select
                value={selectedAgeGroup}
                onChange={(e) => setSelectedAgeGroup(e.target.value)}
                className="px-3 py-1.5 bg-green-100 border border-green-300 rounded-lg text-sm font-bold text-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 w-[100px] flex-shrink-0"
              >
                {ageGroups.map((age) => (
                  <option key={age} value={age}>
                    {age}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {(selectedDay !== "All" ||
            selectedRoom !== "All" ||
            selectedAgeGroup !== "All") && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-purple-600 hover:text-purple-700 hover:underline font-medium mb-4"
            >
              Clear filters
            </button>
          )}

          {!loading && !error && (
            <p className="text-gray-600 mb-4">
              Showing{" "}
              {uniqueFilteredData.length + filteredGrandNationals.length}{" "}
              {uniqueFilteredData.length + filteredGrandNationals.length === 1
                ? "event"
                : "events"}
            </p>
          )}

          {loading && (
            <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
              Loading schedule...
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6">
            <div className="space-y-3">
              {uniqueFilteredData.length > 0 ||
              filteredGrandNationals.length > 0
                ? uniqueFilteredData
                    .sort((a, b) => {
                      // Sort by day first, then by time
                      const dayIndexA = dayOrder.indexOf(a.day);
                      const dayIndexB = dayOrder.indexOf(b.day);
                      if (dayIndexA !== dayIndexB) {
                        return dayIndexA - dayIndexB;
                      }
                      return parseTime(a.time) - parseTime(b.time);
                    })
                    .map((entry, index, sortedEntries) => {
                      const uniqueKey = `${entry.routineNumber}-${entry.day}-${entry.time}`;
                      const isExpanded = expandedIndex === uniqueKey;
                      const dancerCount =
                        entry.dancerName?.split(",").length || 1;
                      const isGroupRoutine = dancerCount > 1; // Show all dancers if 2 or more
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
                          <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                            {/* Accordion Header */}
                            <button
                              onClick={() =>
                                setExpandedIndex(isExpanded ? null : uniqueKey)
                              }
                              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 transition-colors"
                            >
                              <div className="flex items-center justify-between w-full md:flex-1">
                                <h3 className="text-base md:text-lg font-bold text-left">
                                  <span className="opacity-75 mr-2">
                                    #{entry.routineNumber}
                                  </span>
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
                                <span className="text-xs md:text-sm font-semibold">
                                  {entry.day}
                                </span>
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

                            {/* Accordion Content */}
                            {isExpanded && (
                              <div className="p-4 md:p-6 bg-white">
                                <div className="flex flex-nowrap gap-2 md:gap-4 items-center overflow-x-auto">
                                  {entry.category && (
                                    <div className="text-center flex-shrink-0">
                                      <div className="text-[10px] md:text-xs text-gray-500 mb-1">
                                        Category
                                      </div>
                                      <div className="text-xs md:text-base font-semibold text-gray-900">
                                        {entry.category}
                                      </div>
                                    </div>
                                  )}
                                  {entry.ageGroup && (
                                    <div className="text-center flex-shrink-0">
                                      <div className="text-[10px] md:text-xs text-gray-500 mb-1">
                                        Age Group
                                      </div>
                                      <div className="text-xs md:text-base font-semibold text-gray-900">
                                        {entry.ageGroup}
                                      </div>
                                    </div>
                                  )}
                                  {entry.level && (
                                    <div className="text-center flex-shrink-0">
                                      <div className="text-[10px] md:text-xs text-gray-500 mb-1">
                                        Level
                                      </div>
                                      <div className="text-xs md:text-base font-semibold text-gray-900">
                                        {entry.level}
                                      </div>
                                    </div>
                                  )}
                                  {entry.studio && (
                                    <div className="text-center flex-shrink-0">
                                      <div className="text-[10px] md:text-xs text-gray-500 mb-1">
                                        Studio
                                      </div>
                                      <div className="text-xs md:text-base font-semibold text-gray-900">
                                        {entry.studio}
                                      </div>
                                    </div>
                                  )}
                                  {nextAward && (
                                    <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 bg-amber-50 border border-amber-300 md:border-2 rounded-lg ml-auto flex-shrink-0">
                                      <div>
                                        <div className="text-[10px] md:text-xs text-amber-700">
                                          Awards
                                        </div>
                                        <div className="text-xs md:text-sm font-bold text-amber-900 whitespace-nowrap">
                                          {nextAward.time}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Dancer Names */}
                                {isGroupRoutine ? (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="text-xs text-gray-500 mb-2">
                                      Dancers in this routine:
                                    </div>
                                    <div className="text-sm text-gray-700 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded">
                                      {entry.dancerName
                                        ?.split(",")
                                        .map((dancer, i) => (
                                          <span
                                            key={i}
                                            className="inline-block mr-2 mb-1"
                                          >
                                            {dancer.trim()}
                                            {i < dancerCount - 1 && ","}
                                          </span>
                                        ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                                    <span className="text-xs text-gray-500">
                                      Dancer:{" "}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">
                                      {entry.dancerName}
                                    </span>
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
                : null}

              {/* Grand Nationals */}
              {filteredGrandNationals.map((gn, index) => (
                <div
                  key={`gn-${index}`}
                  className="border-2 border-amber-400 rounded-lg overflow-hidden shadow-md bg-gradient-to-r from-amber-50 to-yellow-50"
                >
                  <div className="px-4 py-4 md:px-6 md:py-5">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">🏆</span>
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2">
                          {gn.description}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm md:text-base">
                          <span className="font-semibold text-gray-700">
                            Sunday
                          </span>
                          <span className="font-semibold text-gray-700">
                            {gn.time}
                          </span>
                          <span className="font-semibold text-gray-700">
                            Room {gn.room}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 mt-2">
                          Participants determined from previous days'
                          performances
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {uniqueFilteredData.length === 0 &&
                filteredGrandNationals.length === 0 && (
                  <p className="text-gray-600 text-center py-8">
                    No dances match the selected filters.
                  </p>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
