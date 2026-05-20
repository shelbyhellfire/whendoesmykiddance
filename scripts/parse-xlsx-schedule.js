const XLSX = require("xlsx");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Parse the Excel schedule
const parseXLSXSchedule = () => {
  console.log("Reading schedule.xlsx...");

  // Read the Excel file
  const workbook = XLSX.readFile("public/schedule.xlsx");
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON with header row
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

  console.log(`Read ${data.length} rows from Excel`);

  const scheduleEntries = [];
  let currentDay = "";

  // The first row contains the header in the first cell
  // We'll skip it and start from row 1
  let headerRowIndex = 0;

  // Process data rows starting from row 1
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Skip completely empty rows
    if (!row || row.every((cell) => !cell || cell === "")) {
      continue;
    }

    const room = String(row[0] || "").trim();
    const day = String(row[1] || "").trim();
    const time = String(row[2] || "").trim();
    const routineNumber = String(row[3] || "").trim();
    const routineName = String(row[4] || "").trim();
    const dancers = String(row[5] || "").trim();
    const level = String(row[6] || "").trim();
    const age = String(row[7] || "").trim();
    const division = String(row[8] || "").trim();

    // Check if this is a day header (e.g., "Tuesday June 16, 2026")
    if (room && room.includes("2026")) {
      const dayMatch = room.match(/(\w+)\s+\w+\s+\d+,\s+2026/);
      if (dayMatch) {
        currentDay = dayMatch[1];
        console.log(`Found day: ${currentDay}`);
      }
      continue;
    }

    // Skip awards and grand nationals
    if (
      routineName.includes("Awards") ||
      routineName.includes("Grand National") ||
      routineNumber === "--" ||
      routineNumber === ""
    ) {
      continue;
    }

    // Use current day if day field is abbreviated (Tue, Wed, etc) or empty
    let actualDay = currentDay;
    if (
      day &&
      day.length > 3 &&
      !["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"].includes(day)
    ) {
      actualDay = day;
    }

    // Skip if we don't have essential data
    if (!actualDay || !time || !room || !routineNumber || !routineName) {
      continue;
    }

    // Split multi-line data within cells
    const rooms = room
      .split("\n")
      .map((r) => r.trim())
      .filter((r) => r);
    const times = time
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t);
    const routineNumbers = routineNumber
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n);
    const routineNames = routineName
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n);
    const dancerGroups = dancers
      .split("\n")
      .map((d) => d.trim())
      .filter((d) => d);
    const levels = level
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l);
    const ages = age
      .split("\n")
      .map((a) => a.trim())
      .filter((a) => a);
    const divisions = division
      .split("\n")
      .map((d) => d.trim())
      .filter((d) => d);

    // Determine how many routines are in this row
    const numRoutines = Math.max(
      routineNumbers.length,
      routineNames.length,
      times.length,
      1,
    );

    // Process each routine in the row
    for (let j = 0; j < numRoutines; j++) {
      const rRoom = rooms[j] || rooms[rooms.length - 1] || room;
      const rTime = times[j] || times[times.length - 1] || time;
      const rNumber = routineNumbers[j] || routineNumbers[0];
      const rName = routineNames[j] || routineNames[0];
      const rDancers = dancerGroups[j] || dancerGroups[0] || "";
      const rLevel = levels[j] || levels[0] || "";
      const rAge = ages[j] || ages[0] || "";
      const rDivision = divisions[j] || divisions[0] || "";

      // Parse individual dancers from this routine
      // Dancers can be space-separated or comma-separated
      let dancerList = [];
      if (rDancers) {
        if (rDancers.includes(",")) {
          dancerList = rDancers
            .split(",")
            .map((d) => d.trim())
            .filter((d) => d);
        } else {
          // Split by multiple spaces (2 or more) to separate names
          dancerList = rDancers
            .split(/\s{2,}/)
            .map((d) => d.trim())
            .filter((d) => d);

          // If we only got one result, it might be a single dancer or poorly separated
          // Check if it looks like multiple names (has multiple capital letters)
          if (dancerList.length === 1) {
            const single = dancerList[0];
            // Try to split by detecting capital letters (FirstName LastName pattern)
            const words = single.split(/\s+/);
            if (words.length > 2) {
              // Group words into pairs (first name + last name)
              const names = [];
              for (let k = 0; k < words.length - 1; k += 2) {
                names.push(`${words[k]} ${words[k + 1]}`);
              }
              if (names.length > 1) {
                dancerList = names;
              }
            }
          }
        }
      }

      // If no dancers, create one entry with empty dancer name
      if (dancerList.length === 0) {
        dancerList = [""];
      }

      // Create an entry for each dancer
      for (const dancer of dancerList) {
        scheduleEntries.push({
          dancerName: dancer,
          day: actualDay,
          time: rTime,
          room: rRoom,
          routineNumber: rNumber,
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

  console.log(`Created ${scheduleEntries.length} schedule entries`);
  return scheduleEntries;
};

// Write the parsed data to CSV
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
    console.log(
      "\n✅ Schedule CSV written successfully to public/schedule-parsed.csv",
    );
    console.log(`   Total entries: ${entries.length}`);

    // Get some stats
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

    // Show a sample entry
    console.log("\n📋 Sample entry:");
    console.log(JSON.stringify(entries[0], null, 2));
  } catch (error) {
    console.error("Error parsing schedule:", error);
    process.exit(1);
  }
};

writeScheduleCSV();
