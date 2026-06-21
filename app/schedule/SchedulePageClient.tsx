"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import AwardSeparator from "../components/AwardSeparator";
import CopyLinkButton from "../components/CopyLinkButton";
import DanceAccordion from "../components/DanceAccordion";
import DayTabs from "../components/DayTabs";
import ErrorState from "../components/ErrorState";
import FilterControls from "../components/FilterControls";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import { useAwards } from "../hooks/useAwards";
import { DanceEntry } from "../types/dance";

export default function SchedulePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [danceData, setDanceData] = useState<DanceEntry[]>([]);
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

  // Helper function to normalize day names
  const normalizeDayName = (day: string): string => {
    const dayMap: { [key: string]: string } = {
      Sun: "Sunday",
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
      Sat: "Saturday",
    };
    return dayMap[day] || day;
  };
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
    // Load both schedule.csv and grand-nationals-schedule.csv
    Promise.all([
      fetch("/schedule.csv").then((response) => response.text()),
      fetch("/grand-nationals-schedule.csv").then((response) =>
        response.text(),
      ),
    ])
      .then(([scheduleText, grandNationalsText]) => {
        // Parse main schedule
        Papa.parse(scheduleText, {
          header: true,
          skipEmptyLines: true,
          complete: (scheduleResults) => {
            const scheduleEntries = scheduleResults.data as DanceEntry[];
            console.log("Loaded schedule entries:", scheduleEntries.length);

            // Parse grand nationals schedule
            Papa.parse(grandNationalsText, {
              header: true,
              skipEmptyLines: true,
              complete: (gnResults) => {
                const gnEntries = gnResults.data as DanceEntry[];
                console.log("Loaded Grand National entries:", gnEntries.length);

                // Combine both datasets
                const allEntries = [...scheduleEntries, ...gnEntries];
                console.log("Total combined entries:", allEntries.length);
                setDanceData(allEntries);
                setLoading(false);
              },
              error: (err: unknown) => {
                console.error("Error parsing Grand Nationals CSV:", err);
                // Still use schedule data even if GN fails
                setDanceData(scheduleEntries);
                setLoading(false);
              },
            });
          },
          error: (err: unknown) => {
            setError("Error loading schedule data");
            setLoading(false);
            console.error("Parse error:", err);
          },
        });
      })
      .catch((err) => {
        setError("Error loading schedule files");
        setLoading(false);
        console.error("Fetch error:", err);
      });
  }, []);

  // Filter data based on selected filters
  const filteredData = danceData.filter((entry) => {
    const matchesDay =
      selectedDay === "All" ||
      entry.day === selectedDay ||
      (selectedDay === "Sunday" && entry.day === "Sun") ||
      (selectedDay === "Saturday" && entry.day === "Sat") ||
      (selectedDay === "Friday" && entry.day === "Fri") ||
      (selectedDay === "Thursday" && entry.day === "Thu") ||
      (selectedDay === "Wednesday" && entry.day === "Wed") ||
      (selectedDay === "Tuesday" && entry.day === "Tue") ||
      (selectedDay === "Monday" && entry.day === "Mon");
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
      `View ${uniqueFilteredData.length} dance routines${hasActiveFilters ? ` - ${title}` : " from the competition schedule"}`,
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
      `View ${uniqueFilteredData.length} dance routines${hasActiveFilters ? ` - ${title}` : " from the competition schedule"}`,
    );
  }, [
    selectedDay,
    selectedRoom,
    selectedAgeGroup,
    uniqueFilteredData.length,
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
          copyLinkButton={
            hasActiveFilters ? <CopyLinkButton variant="compact" /> : undefined
          }
        >
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

          {/* Divider */}
          <div className="my-6 border-t border-gray-200"></div>

          {/* Dance Schedule List */}
          <div className="space-y-3">
            {uniqueFilteredData.length > 0
              ? uniqueFilteredData
                  .sort((a, b) => {
                    // Sort by day first, then by time
                    const dayIndexA = dayOrder.indexOf(normalizeDayName(a.day));
                    const dayIndexB = dayOrder.indexOf(normalizeDayName(b.day));
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

            {uniqueFilteredData.length === 0 && (
              <p className="text-gray-600 text-center py-8">
                No dances match the selected filters.
              </p>
            )}
          </div>
        </PageHeader>
      </div>
    </div>
  );
}
