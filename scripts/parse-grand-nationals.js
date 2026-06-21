const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Parse the Grand Nationals XML file by extracting text
const parseGrandNationalsXML = () => {
  try {
    const xmlContent = fs.readFileSync("public/grand-nationals.xml", "utf-8");
    const scheduleEntries = [];

    // Extract all text content from the XML
    // Look for patterns like: A Sun 08:00 AM 1939 2 D/T 2 Musical Show M 5-8 Friendship Dance Esteem RS William Johnson,Caroline Hilson
    const textMatches = xmlContent.matchAll(/<Font[^>]*>([^<]+)<\/Font>/g);

    const lines = [];
    for (const match of textMatches) {
      const text = match[1].trim();
      if (text && text.length > 5) {
        lines.push(text);
      }
    }

    console.log(`Found ${lines.length} text lines in XML`);

    // Join consecutive lines that are part of the same entry
    let currentEntry = "";
    for (const line of lines) {
      // Check if this looks like a new entry (starts with room and day)
      if (line.match(/^[A-C]\s+\w{3}\s+\d{2}:\d{2}/)) {
        if (currentEntry && currentEntry.includes("Dance Esteem")) {
          parseEntry(currentEntry, scheduleEntries);
        }
        currentEntry = line;
      } else {
        // Continuation of previous line (likely dancer names)
        currentEntry += " " + line;
      }
    }

    // Process the last entry
    if (currentEntry && currentEntry.includes("Dance Esteem")) {
      parseEntry(currentEntry, scheduleEntries);
    }

    console.log(`\n✅ Parsed ${scheduleEntries.length} Dance Esteem entries`);
    return scheduleEntries;
  } catch (error) {
    console.error("Error parsing Grand Nationals XML:", error);
    throw error;
  }
};

function parseEntry(lineText, scheduleEntries) {
  // Clean up HTML entities
  lineText = lineText.replace(/&amp;/g, "&").replace(/&#10;/g, " ");

  // Format: A Sun 08:00 AM 1939 2 D/T 2 Musical Show M 5-8 Friendship Dance Esteem RS William Johnson,Caroline Hilson
  // More flexible pattern to handle variations
  const match = lineText.match(
    /^([A-C])\s+(\w+)\s+(\d+:\d+\s+[AP]M)\s+(\d+)\s+\d+\s+(Solo|D\/T|Sg|Lg|Line)\s+\d+\s+(.+?)\s+(M|PT|T|S)\s+(\d+-\d+)\s+(.+?)\s+Dance Esteem\s+(RS|S|NS)\s*(.*)$/,
  );

  if (!match) {
    return;
  }

  const [
    ,
    room,
    day,
    time,
    routineNumber,
    division,
    category,
    maturity,
    ageGroup,
    routineName,
    level,
    dancers,
  ] = match;

  console.log(
    `Found Dance Esteem routine: ${routineName.trim()}, dancers: "${dancers.substring(0, 50)}..."`,
  );

  // Parse dancers - they can be comma-separated
  // Clean up the dancer names - remove text after the first non-name word
  let cleanDancers = dancers.trim();

  // Remove text that looks like it's from the next row (starts with time or room)
  cleanDancers = cleanDancers.replace(/\d{2}:\d{2}\s+[AP]M.*/g, "");

  const dancerList = cleanDancers
    .split(/,/)
    .map((d) => d.trim())
    .filter(
      (d) => d && d.length > 2 && d.length < 50 && !/\d{2}:\d{2}/.test(d),
    );

  console.log(`  Parsed ${dancerList.length} dancers`);

  // Create entry for each dancer
  if (dancerList.length === 0) {
    scheduleEntries.push({
      dancerName: "",
      day: day,
      time: time,
      room: `Room ${room}`,
      routineNumber: routineNumber,
      routineName: routineName.trim(),
      category: category.trim(),
      ageGroup: `${maturity} ${ageGroup}`,
      studio: "Dance Esteem",
      level: level,
    });
  } else {
    for (const dancer of dancerList) {
      scheduleEntries.push({
        dancerName: dancer,
        day: day,
        time: time,
        room: `Room ${room}`,
        routineNumber: routineNumber,
        routineName: routineName.trim(),
        category: category.trim(),
        ageGroup: `${maturity} ${ageGroup}`,
        studio: "Dance Esteem",
        level: level,
      });
    }
  }
}

// Write the parsed data to CSV
const writeGrandNationalsCSV = async () => {
  try {
    const entries = parseGrandNationalsXML();

    const csvWriter = createCsvWriter({
      path: "public/grand-nationals-schedule.csv",
      header: [
        { id: "dancerName", title: "dancerName" },
        { id: "day", title: "day" },
        { id: "time", title: "time" },
        { id: "room", title: "room" },
        { id: "routineNumber", title: "routineNumber" },
        { id: "routineName", title: "routineName" },
        { id: "category", title: "category" },
        { id: "ageGroup", title: "ageGroup" },
        { id: "level", title: "level" },
        { id: "studio", title: "studio" },
      ],
    });

    await csvWriter.writeRecords(entries);
    console.log(
      "\n✅ Grand Nationals schedule CSV written to public/grand-nationals-schedule.csv",
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

    // Show all the routines
    const routines = [...new Set(entries.map((e) => e.routineName))];
    console.log("\n📋 Dance Esteem Routines:");
    routines.forEach((r, i) => console.log(`   ${i + 1}. ${r}`));
  } catch (error) {
    console.error("Error writing CSV:", error);
    process.exit(1);
  }
};

writeGrandNationalsCSV();
