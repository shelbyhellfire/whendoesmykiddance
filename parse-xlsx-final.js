const XLSX = require("xlsx");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Helper function to split a cell value by newlines and spaces
const splitCell = (value) => {
  if (!value) return [];
  return String(value)
    .split("\n")
    .map((v) => v.trim())
    .filter((v) => v);
};

// Helper function to split a cell that has space-separated values on same line
const splitSpacedCell = (value) => {
  if (!value) return [];
  const lines = String(value).split("\n");
  const result = [];
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    result.push(...parts.filter((p) => p));
  }
  return result;
};

// Parse dancer names - they can be space-separated or comma-separated
const parseDancers = (dancersText) => {
  if (!dancersText) return [];

  // If there are commas, split by comma
  if (dancersText.includes(",")) {
    return dancersText
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d);
  }

  // Otherwise, try to intelligently split by detecting name patterns
  // Names are typically "FirstName LastName" format
  const words = dancersText.trim().split(/\s+/);
  const names = [];

  for (let i = 0; i < words.length - 1; i += 2) {
    if (words[i] && words[i + 1]) {
      names.push(`${words[i]} ${words[i + 1]}`);
    }
  }

  // If we couldn't parse names, return the whole thing
  if (names.length === 0 && dancersText.trim()) {
    return [dancersText.trim()];
  }

  return names;
};

// Parse the Excel schedule
const parseXLSXSchedule = () => {
  console.log("Reading schedule.xlsx...");

  const workbook = XLSX.readFile("public/schedule.xlsx");
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
  console.log(`Read ${data.length} rows from Excel`);

  const scheduleEntries = [];
  let currentDay = "";

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    if (!row || row.every((cell) => !cell)) {
      continue;
    }

    const roomCell = String(row[0] || "").trim();
    const dayCell = String(row[1] || "").trim();
    const timeCell = String(row[2] || "").trim();
    const numberCell = String(row[3] || "").trim();
    const nameCell = String(row[4] || "").trim();
    let dancersCell = String(row[5] || "").trim();
    const levelCell = String(row[6] || "").trim();
    const ageCell = String(row[7] || "").trim();
    const divisionCell = String(row[8] || "").trim();

    // Check for day header
    if (roomCell.includes("2026")) {
      const match = roomCell.match(/(\w+)\s+\w+\s+\d+,\s+2026/);
      if (match) {
        currentDay = match[1];
        console.log(`Found day: ${currentDay}`);
      }
      continue;
    }

    // Skip header rows that appear in the middle
    if (
      roomCell === "Room" &&
      dayCell.includes("Day") &&
      numberCell === "Numbr"
    ) {
      continue;
    }

    // Skip awards and empty routines
    if (
      !numberCell ||
      nameCell.includes("Awards") ||
      nameCell.includes("Grand National") ||
      numberCell === "--"
    ) {
      continue;
    }

    // Skip if no time or room
    if (!timeCell || !roomCell) {
      continue;
    }

    // Check if the next rows contain continuation of dancer names
    // (when first 5 columns are empty but column 5 has data)
    let nextRowIdx = i + 1;
    while (nextRowIdx < data.length) {
      const nextRow = data[nextRowIdx];
      if (!nextRow) break;

      const nextRoom = String(nextRow[0] || "").trim();
      const nextDay = String(nextRow[1] || "").trim();
      const nextTime = String(nextRow[2] || "").trim();
      const nextNumber = String(nextRow[3] || "").trim();
      const nextName = String(nextRow[4] || "").trim();
      const nextDancers = String(nextRow[5] || "").trim();

      // If first 5 columns are empty but dancers column has data, it's a continuation
      if (
        !nextRoom &&
        !nextDay &&
        !nextTime &&
        !nextNumber &&
        !nextName &&
        nextDancers
      ) {
        dancersCell += ", " + nextDancers;
        nextRowIdx++;
      } else {
        break;
      }
    }

    // Skip the continuation rows we just processed
    if (nextRowIdx > i + 1) {
      i = nextRowIdx - 1;
    }

    // Split cells by newlines to get multiple routines
    const rooms = splitSpacedCell(roomCell);
    const times = splitCell(timeCell);
    const numbers = splitCell(numberCell);
    const names = splitCell(nameCell);
    const levels = splitSpacedCell(levelCell);
    const ages = splitSpacedCell(ageCell);
    const divisions = splitSpacedCell(divisionCell);

    // Find the maximum number of routines in this row
    const numRoutines = Math.max(numbers.length, names.length, times.length, 1);

    // For dancers: if there are multiple routines, split by newline
    // Otherwise use the full text (which includes continuation rows)
    const dancerGroups =
      numRoutines > 1 ? splitCell(dancersCell) : [dancersCell];

    // Process each routine
    for (let j = 0; j < numRoutines; j++) {
      const routineNumber = numbers[j] || numbers[0];
      const routineName = names[j] || names[0];
      const routineTime = times[j] || times[0];
      const routineRoom =
        rooms[j] || rooms[0] || roomCell.split("\n")[0].trim().split(" ")[0];
      const dancersText = dancerGroups[j] || dancerGroups[0] || "";
      const routineLevel = levels[j] || levels[0] || "";
      const routineAge = ages[j] || ages[0] || "";
      const routineDivision = divisions[j] || divisions[0] || "";

      // Skip if essential data is missing
      if (!routineNumber || !routineName || !routineTime) {
        continue;
      }

      // Parse individual dancers
      const dancers = parseDancers(dancersText);

      // If no dancers found, create one entry anyway
      if (dancers.length === 0) {
        dancers.push("");
      }

      // Create entry for each dancer
      for (const dancer of dancers) {
        // Debug: Log if we find Lotus
        if (dancer.toLowerCase().includes("lotus")) {
          console.log(
            `✨ Found Lotus: "${dancer}" in routine ${routineNumber} "${routineName}"`,
          );
        }

        scheduleEntries.push({
          dancerName: dancer,
          day: currentDay,
          time: routineTime,
          room: routineRoom,
          routineNumber: routineNumber,
          routineName: routineName,
          division: routineDivision,
          category: "",
          ageGroup: routineAge,
          studio: "",
          level: routineLevel,
          groupSize: routineDivision,
        });
      }
    }
  }

  console.log(`Created ${scheduleEntries.length} schedule entries`);
  return scheduleEntries;
};

// Write the CSV
const writeScheduleCSV = async () => {
  try {
    const entries = parseXLSXSchedule();

    if (entries.length === 0) {
      console.error("No entries to write!");
      return;
    }

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
    console.log("\n✅ Schedule CSV written successfully!");
    console.log(`   File: public/schedule-parsed.csv`);
    console.log(`   Total entries: ${entries.length}`);

    // Stats
    const uniqueDancers = new Set(
      entries.map((e) => e.dancerName).filter((d) => d),
    );
    const uniqueRoutines = new Set(entries.map((e) => e.routineNumber));
    const uniqueDays = new Set(entries.map((e) => e.day));
    const uniqueRooms = new Set(entries.map((e) => e.room));

    console.log(`   Unique dancers: ${uniqueDancers.size}`);
    console.log(`   Unique routines: ${uniqueRoutines.size}`);
    console.log(`   Days: ${Array.from(uniqueDays).sort().join(", ")}`);
    console.log(`   Rooms: ${Array.from(uniqueRooms).sort().join(", ")}`);

    // Sample entries
    console.log("\n📋 Sample entries:");
    for (let i = 0; i < Math.min(3, entries.length); i++) {
      console.log(`\n${i + 1}.`, JSON.stringify(entries[i], null, 2));
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

writeScheduleCSV();
