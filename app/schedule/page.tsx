"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Papa from "papaparse";
import React, { Suspense, useEffect, useState } from "react";
import AwardSeparator from "../components/AwardSeparator";
import CopyLinkButton from "../components/CopyLinkButton";
import DanceAccordion from "../components/DanceAccordion";
import DayTabs from "../components/DayTabs";
import ErrorState from "../components/ErrorState";
import FilterControls from "../components/FilterControls";
import GrandNationalCard from "../components/GrandNationalCard";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import { useAwards } from "../hooks/useAwards";
import { DanceEntry } from "../types/dance";

interface GrandNational {
  room: string;
  day: string;
  time: string;
  description: string;
  level: string;
  type: string;
}

function SchedulePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [danceData, setDanceData] = useState<DanceEntry[]>([]);
  const [grandNationals, setGrandNationals] = useState<GrandNational[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);
  const { findNextAward, isAwardBetween, parseTime } = useAwards();

  // Filters
  const [selectedDay, setSelectedDay] = useState<string>(
    searchParams.get("day") || "All",
  );
  const [selectedRoom, setSelectedRoom] = useState<string>(
    searchParams.get("room") || "All",
  );
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>(
    searchParams.get("age") || "All",
  );

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
  const rooms: string[] = [
    "All",
    ...Array.from(
      new Set(
        danceData.map((d) => d.room).filter((r): r is string => Boolean(r)),
      ),
    ).sort(),
  ];
  const ageGroups: string[] = [
    "All",
    ...Array.from(
      new Set(
        danceData.map((d) => d.ageGroup).filter((a): a is string => Boolean(a)),
      ),
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
            const entries = results.data as unknown[];
            console.log("Total CSV rows:", entries.length);
            // Filter for Grand National entries
            const gns = entries
              .filter((row: unknown) => {
                // Check both first column and other columns for Grand National text
                const rowString = JSON.stringify(row);
                return rowString.includes("Grand National");
              })
              .map((row: unknown) => {
                const rowArray = row as string[];
                console.log("Raw Grand National row:", rowArray);

                // Handle two formats:
                // Format 1: Quoted string in first column with newlines
                // Format 2: Comma-separated values across columns

                let room = "";
                let day = "";
                let time = "";
                let description = "";

                if (rowArray[0] && rowArray[0].includes("Grand National")) {
                  // Format 1: All data in first column
                  const fullText = String(rowArray[0] || "")
                    .replace(/\n/g, " ")
                    .replace(/\s+/g, " ");
                  console.log("Format 1 - fullText:", fullText);

                  const parts = fullText.split(/\s+/);
                  room = parts[0].trim();
                  day = parts[1].trim();
                  const timeMatch = fullText.match(/\d{1,2}:\d{2}\s*[AP]M/);
                  time = timeMatch ? timeMatch[0] : "";
                  const descMatch = fullText.match(/--(.+?)--/);
                  description = descMatch
                    ? descMatch[1].trim()
                    : "Grand National";
                } else {
                  // Format 2: Data spread across columns
                  room = (rowArray[0] || "").trim();
                  day = (rowArray[4] || "").trim(); // Day is in column 5 (index 4)
                  time = (rowArray[8] || "").trim(); // Time is in column 9 (index 8)

                  // Find which column has the description
                  for (let i = 0; i < rowArray.length; i++) {
                    if (
                      rowArray[i] &&
                      String(rowArray[i]).includes("Grand National")
                    ) {
                      const descMatch = String(rowArray[i]).match(/--(.+?)--/);
                      description = descMatch
                        ? descMatch[1].trim()
                        : String(rowArray[i]);
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
    console.log(
      `Filtering GN: room='${gn.room}' day='${gn.day}' | selectedRoom='${selectedRoom}' selectedDay='${selectedDay}' | matchesRoom=${matchesRoom} matchesDay=${matchesDay}`,
    );
    return matchesDay && matchesRoom;
  });

  console.log(
    `Total GN: ${grandNationals.length}, Filtered GN: ${filteredGrandNationals.length}, Regular dances: ${uniqueFilteredData.length}`,
  );

  // Update URL when filters change
  const updateURL = (day: string, room: string, age: string) => {
    const params = new URLSearchParams();
    if (day !== "All") params.set("day", day);
    if (room !== "All") params.set("room", room);
    if (age !== "All") params.set("age", age);

    const queryString = params.toString();
    const newURL = queryString ? `/schedule?${queryString}` : "/schedule";
    router.push(newURL);
  };

  const handleDayChange = (day: string) => {
    setSelectedDay(day);
    updateURL(day, selectedRoom, selectedAgeGroup);
  };

  const handleRoomChange = (room: string) => {
    setSelectedRoom(room);
    updateURL(selectedDay, room, selectedAgeGroup);
  };

  const handleAgeChange = (age: string) => {
    setSelectedAgeGroup(age);
    updateURL(selectedDay, selectedRoom, age);
  };

  const handleClearFilters = () => {
    setSelectedDay("All");
    setSelectedRoom("All");
    setSelectedAgeGroup("All");
    router.push("/schedule");
  };

  const hasActiveFilters =
    selectedDay !== "All" ||
    selectedRoom !== "All" ||
    selectedAgeGroup !== "All";

  // Generate dynamic title based on filters
  const getPageTitle = () => {
    const parts = [];
    if (selectedDay !== "All") parts.push(selectedDay);
    if (selectedRoom !== "All") parts.push(selectedRoom);
    if (selectedAgeGroup !== "All") parts.push(selectedAgeGroup);

    if (parts.length === 0) return "Full Dance Schedule";
    return parts.join(" • ");
  };

  // Update document title when filters change
  useEffect(() => {
    const title = getPageTitle();
    document.title = `${title} | When Does My Kid Dance?`;

    // Update meta tags for sharing
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute(
      "content",
      `View ${uniqueFilteredData.length + filteredGrandNationals.length} dance routines${hasActiveFilters ? ` - ${title}` : " from the competition schedule"}`,
    );

    // Update OG tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", title);

    let ogDescription = document.querySelector(
      'meta[property="og:description"]',
    );
    if (!ogDescription) {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute(
      "content",
      `View ${uniqueFilteredData.length + filteredGrandNationals.length} dance routines${hasActiveFilters ? ` - ${title}` : " from the competition schedule"}`,
    );
  }, [
    selectedDay,
    selectedRoom,
    selectedAgeGroup,
    uniqueFilteredData.length,
    filteredGrandNationals.length,
    hasActiveFilters,
  ]);

  if (loading) return <LoadingState message="Loading schedule..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 md:p-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Browse Full Schedule"
          description="Filter dances by day, room, and age group"
          leftLink={{ href: "/", label: "Home", icon: "back" }}
          rightLink={{
            href: "/search",
            label: "Search for Dancers",
            icon: "forward",
          }}
        >
          {/* Copy Link Button - Only when filters active */}
          {hasActiveFilters && (
            <div className="mb-4">
              <CopyLinkButton variant="compact" />
            </div>
          )}

          {/* Day Tabs */}
          <DayTabs
            days={days}
            activeDay={selectedDay}
            onDayChange={handleDayChange}
          />

          {/* Filter Controls */}
          <FilterControls
            selectedRoom={selectedRoom}
            selectedAgeGroup={selectedAgeGroup}
            rooms={rooms}
            ageGroups={ageGroups}
            onRoomChange={handleRoomChange}
            onAgeChange={handleAgeChange}
          />
        </PageHeader>

        {/* Dance Schedule List */}
        <div className="bg-white rounded-lg shadow-xl px-2 py-4 md:p-8">
          <div className="space-y-3">
            {uniqueFilteredData.length > 0 || filteredGrandNationals.length > 0
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
                    const dancers = entry.dancerName
                      ? entry.dancerName.split(",").map((d) => d.trim())
                      : [];
                    const dancerCount = dancers.length;
                    const isGroupRoutine = dancerCount > 1; // Show all dancers if 2 or more

                    // Debug log
                    if (index < 3) {
                      console.log(`Routine ${entry.routineNumber}:`, {
                        dancerName: entry.dancerName,
                        dancers,
                        dancerCount,
                        isGroupRoutine,
                        isExpanded,
                      });
                    }
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
                          showDay={selectedDay === "All"}
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
              : null}

            {/* Grand Nationals */}
            {filteredGrandNationals.map((gn, index) => (
              <GrandNationalCard
                key={`gn-${index}`}
                description={gn.description}
                day={gn.day}
                time={gn.time}
                room={gn.room}
              />
            ))}

            {uniqueFilteredData.length === 0 &&
              filteredGrandNationals.length === 0 && (
                <p className="text-gray-600 text-center py-8">
                  No dances match the selected filters.
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<LoadingState message="Loading schedule..." />}>
      <SchedulePageContent />
    </Suspense>
  );
}
