"use client";

import Link from "next/link";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { useAwards } from "../hooks/useAwards";
import { DanceEntry } from "../types/dance";

type ViewMode = "day" | "room" | "ageGroup";

export default function SchedulePage() {
  const [danceData, setDanceData] = useState<DanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);
  const { findNextAward } = useAwards();

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
  const days = [
    "All",
    ...uniqueDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)),
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
  }, []);

  // Filter data based on selected filters
  const filteredData = danceData.filter((entry) => {
    const matchesDay = selectedDay === "All" || entry.day === selectedDay;
    const matchesRoom = selectedRoom === "All" || entry.room === selectedRoom;
    const matchesAgeGroup =
      selectedAgeGroup === "All" || entry.ageGroup === selectedAgeGroup;
    return matchesDay && matchesRoom && matchesAgeGroup;
  });

  // Remove duplicates based on routine number, day, and time
  const uniqueFilteredData = filteredData.reduce((acc, current) => {
    const key = `${current.routineNumber}-${current.day}-${current.time}-${current.room}`;
    const exists = acc.find(
      (item) =>
        `${item.routineNumber}-${item.day}-${item.time}-${item.room}` === key,
    );
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, [] as DanceEntry[]);

  const handleClearFilters = () => {
    setSelectedDay("All");
    setSelectedRoom("All");
    setSelectedAgeGroup("All");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-4 md:p-8 mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
            Browse Full Schedule
          </h1>
          <p className="text-gray-600 mb-6">
            Filter dances by day, room, and age group
          </p>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room
              </label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
              >
                {rooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Group
              </label>
              <select
                value={selectedAgeGroup}
                onChange={(e) => setSelectedAgeGroup(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
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
              className="text-purple-600 hover:text-purple-700 hover:underline font-medium mb-4"
            >
              Clear all filters
            </button>
          )}

          {!loading && !error && (
            <p className="text-gray-600 mb-4">
              Showing {uniqueFilteredData.length} dance
              {uniqueFilteredData.length !== 1 ? "s" : ""}
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
              {uniqueFilteredData.length > 0 ? (
                uniqueFilteredData.map((entry, index) => {
                  const uniqueKey = `${entry.routineNumber}-${entry.day}-${entry.time}`;
                  const isExpanded = expandedIndex === uniqueKey;
                  const dancerCount = entry.dancerName?.split(",").length || 1;
                  const isGroupRoutine = dancerCount > 10;
                  const nextAward = findNextAward(
                    entry.day,
                    entry.time,
                    entry.room,
                  );

                  return (
                    <div
                      key={uniqueKey}
                      className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() =>
                          setExpandedIndex(isExpanded ? null : uniqueKey)
                        }
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 transition-colors"
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
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">
                                Day
                              </div>
                              <div className="text-base font-semibold text-gray-900">
                                {entry.day}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">
                                Time
                              </div>
                              <div className="text-base font-semibold text-gray-900">
                                {entry.time}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">
                                Room
                              </div>
                              <div className="text-base font-semibold text-gray-900">
                                {entry.room}
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
                            {entry.studio && (
                              <div className="text-center">
                                <div className="text-xs text-gray-500 mb-1">
                                  Studio
                                </div>
                                <div className="text-base font-semibold text-gray-900">
                                  {entry.studio}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Award Time */}
                          {nextAward && (
                            <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-2xl">🏆</span>
                                <span className="text-sm font-bold text-amber-900">
                                  Awards Ceremony
                                </span>
                              </div>
                              <div className="text-base font-semibold text-amber-800">
                                {nextAward.time} in {nextAward.room}
                              </div>
                            </div>
                          )}

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
                  );
                })
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No dances match the selected filters.
                </p>
              )}
            </div>
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
