const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Parse the schedule CSV - it has a complex format with newlines in cells
const parseSchedule = () => {
  const content = fs.readFileSync("public/schedule.csv", "utf-8");
  const scheduleEntries = [];

  // Split into lines but handle quoted sections
  const lines = content.split("\n");

  let currentDay = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // Check if this is a day header like "Tuesday June 16, 2026"
    if (line.startsWith('"') && line.includes("2026")) {
      const dayMatch = line.match(/"(\w+)\s+\w+\s+\d+,\s+2026"/);
      if (dayMatch) {
        currentDay = dayMatch[1];
        console.log(`Found day: ${currentDay}`);
      }
      i++;
      continue;
    }

    // Skip header rows
    if (
      line.includes("Room") &&
      line.includes("Day") &&
      line.includes("Time")
    ) {
      i++;
      continue;
    }

    // Parse data lines - split by comma but respect quotes
    const parts = [];
    let currentPart = "";
    let inQuotes = false;

    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        parts.push(currentPart);
        currentPart = "";
      } else {
        currentPart += char;
      }
    }
    parts.push(currentPart);

    // Clean up parts
    const cleanParts = parts.map((p) =>
      p.trim().replace(/^"/, "").replace(/"$/, "").trim(),
    );

    const [
      room,
      day,
      time,
      routineNumber,
      routineName,
      dancers,
      level,
      age,
      division,
    ] = cleanParts;

    // Skip if this is an awards row or doesn't have essential data
    if (
      !routineNumber ||
      !routineName ||
      routineName.includes("Awards") ||
      routineName.includes("Grand National") ||
      routineNumber === "--"
    ) {
      i++;
      continue;
    }

    // Use current day if day column contains abbreviated day or is part of multi-line
    let actualDay = currentDay;
    if (day && day.length > 3 && !day.includes("\n")) {
      actualDay = day;
    }

    // Skip if we don't have required fields
    if (!actualDay || !time || !room) {
      i++;
      continue;
    }

    // Parse routines - they might be on multiple lines within the cell
    const routineNumbers = routineNumber
      .split(/[\n\s]+/)
      .filter((n) => n && n.match(/^\d+$/));
    const routineNames = routineName.split(/\n/).filter((n) => n.trim());
    const times = time.split(/\n/).filter((t) => t.trim());
    const rooms = room.split(/[\n\s]+/).filter((r) => r && r.length === 1); // A, B, C
    const levels = level ? level.split(/[\n\s]+/).filter((l) => l) : [];
    const ages = age ? age.split(/[\n\s]+/).filter((a) => a) : [];
    const divisions = division
      ? division.split(/[\n\s]+/).filter((d) => d)
      : [];

    // Parse dancers - they can be space-separated or comma-separated or newline-separated
    let dancerList = [];
    if (dancers) {
      // First try splitting by comma, then by multiple spaces
      if (dancers.includes(",")) {
        dancerList = dancers
          .split(/,/)
          .map((d) => d.trim())
          .filter((d) => d);
      } else {
        // Split by newlines and multiple spaces
        const parts = dancers.split(/\n/);
        parts.forEach((part) => {
          // Split by multiple spaces (2 or more)
          const names = part
            .split(/\s{2,}/)
            .map((n) => n.trim())
            .filter((n) => n);
          dancerList.push(...names);
        });
      }
    }

    // Process each routine
    const maxRoutines = Math.max(
      routineNumbers.length,
      routineNames.length,
      times.length,
      rooms.length,
    );

    for (let j = 0; j < maxRoutines; j++) {
      const rNum = routineNumbers[j] || routineNumbers[0];
      const rName = routineNames[j] || routineNames[0];
      const rTime = times[j] || times[0];
      const rRoom = rooms[j] || rooms[0] || room;
      const rLevel = levels[j] || levels[0] || "";
      const rAge = ages[j] || ages[0] || "";
      const rDivision = divisions[j] || divisions[0] || "";

      // If there are no dancers, create one entry
      if (dancerList.length === 0) {
        scheduleEntries.push({
          dancerName: "",
          day: actualDay,
          time: rTime,
          room: rRoom,
          routineNumber: rNum,
          routineName: rName,
          division: rDivision,
          category: "",
          ageGroup: rAge,
          studio: "",
          level: rLevel,
          groupSize: rDivision,
        });
      } else {
        // Create an entry for each dancer
        for (const dancer of dancerList) {
          scheduleEntries.push({
            dancerName: dancer,
            day: actualDay,
            time: rTime,
            room: rRoom,
            routineNumber: rNum,
            routineName: rName,
            division: rDivision,
            category: "",
            ageGroup: rAge,
            studio: "",
            level: rLevel,
            groupSize: rDivision,
          });
        }
      }
    }

    i++;
  }

  console.log(`Created ${scheduleEntries.length} schedule entries`);
  return scheduleEntries;
};

// Write the parsed data to a new CSV
const writeScheduleCSV = async () => {
  try {
    const entries = parseSchedule();

    const csvWriter = createCsvWriter({
      path: "public/schedule-parsed.csv",
      header: [
        { id: "dancerName", title: "dancerName" },
        { id: "day", title: "day" },
        { id: "time", title: "time" },
        { id: "room", title: "room" },
        { id: "routineNumber", title: "routineNumber" },
        { id: "routineName", title: "routineName" },
        { id: "division", title: "division" },
        { id: "category", title: "category" },
        { id: "ageGroup", title: "ageGroup" },
        { id: "studio", title: "studio" },
        { id: "level", title: "level" },
        { id: "groupSize", title: "groupSize" },
      ],
    });

    await csvWriter.writeRecords(entries);
    console.log(
      "✅ Schedule CSV written successfully to public/schedule-parsed.csv",
    );
    console.log(`   Total entries: ${entries.length}`);

    // Get some stats
    const uniqueDancers = new Set(
      entries.map((e) => e.dancerName).filter((d) => d),
    );
    const uniqueRoutines = new Set(entries.map((e) => e.routineNumber));
    const uniqueDays = new Set(entries.map((e) => e.day));

    console.log(`   Unique dancers: ${uniqueDancers.size}`);
    console.log(`   Unique routines: ${uniqueRoutines.size}`);
    console.log(`   Days: ${Array.from(uniqueDays).join(", ")}`);
  } catch (error) {
    console.error("Error parsing schedule:", error);
    process.exit(1);
  }
};

writeScheduleCSV();
