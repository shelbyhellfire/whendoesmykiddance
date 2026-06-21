const fs = require("fs");
const Papa = require("papaparse");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Read both CSV files
const readCSV = (filepath) => {
  const content = fs.readFileSync(filepath, "utf-8");
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data;
};

const mergeSchedules = async () => {
  try {
    // Read existing schedule
    const existingSchedule = readCSV("public/schedule.csv");
    console.log(`Existing schedule has ${existingSchedule.length} entries`);

    // Read Grand Nationals schedule
    const grandNationalsSchedule = readCSV("public/grand-nationals-schedule.csv");
    console.log(`Grand Nationals schedule has ${grandNationalsSchedule.length} entries`);

    // Merge the schedules
    const mergedSchedule = [...existingSchedule, ...grandNationalsSchedule];

    console.log(`\nMerged schedule has ${mergedSchedule.length} total entries`);

    // Write the merged schedule
    const csvWriter = createCsvWriter({
      path: "public/schedule.csv",
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

    await csvWriter.writeRecords(mergedSchedule);

    console.log("\n✅ Schedules merged successfully!");
    console.log("   Updated public/schedule.csv");

    // Show stats
    const uniqueDancers = new Set(
      mergedSchedule.map((e) => e.dancerName).filter((d) => d)
    );
    const uniqueDays = new Set(mergedSchedule.map((e) => e.day));
    const danceEsteemEntries = mergedSchedule.filter((e) => e.studio === "Dance Esteem");

    console.log(`\n📊 Stats:`);
    console.log(`   Total entries: ${mergedSchedule.length}`);
    console.log(`   Unique dancers: ${uniqueDancers.size}`);
    console.log(`   Days: ${Array.from(uniqueDays).join(", ")}`);
    console.log(`   Dance Esteem entries: ${danceEsteemEntries.length}`);

    // List Dance Esteem routines
    const danceEsteemRoutines = [...new Set(danceEsteemEntries.map((e) => e.routineName))];
    console.log(`\n📋 Dance Esteem Routines (${danceEsteemRoutines.length}):`);
    danceEsteemRoutines.forEach((r, i) => console.log(`   ${i + 1}. ${r}`));
  } catch (error) {
    console.error("Error merging schedules:", error);
    process.exit(1);
  }
};

mergeSchedules();
