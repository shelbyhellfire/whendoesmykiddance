const Papa = require("papaparse");
const fs = require("fs");

const csvText = fs.readFileSync("./public/awards.csv", "utf-8");

Papa.parse(csvText, {
  header: false,
  skipEmptyLines: true,
  complete: (results) => {
    const entries = results.data;
    console.log("Total CSV rows:", entries.length);

    // Filter for Grand National entries
    const gns = entries
      .filter((row) => {
        const rowString = JSON.stringify(row);
        return rowString.includes("Grand National");
      })
      .map((row, index) => {
        console.log(`\n--- Row ${index + 1} ---`);
        console.log("Raw row:", row.slice(0, 10));

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
          description = descMatch ? descMatch[1].trim() : "Grand National";
        } else {
          // Format 2: Data spread across columns
          room = row[0] || "";
          day = row[4] || ""; // Day is in column 5 (index 4)
          time = row[8] || ""; // Time is in column 9 (index 8)

          console.log(`Format 2 - room: ${room}, day: ${day}, time: ${time}`);

          // Find which column has the description
          for (let i = 0; i < row.length; i++) {
            if (row[i] && String(row[i]).includes("Grand National")) {
              const descMatch = String(row[i]).match(/--(.+?)--/);
              description = descMatch ? descMatch[1].trim() : String(row[i]);
              console.log(`Found description in column ${i}: ${description}`);
              break;
            }
          }
        }

        const result = { room, day, time, description };
        console.log("Parsed:", result);
        return result;
      });

    console.log("\n\n=== SUMMARY ===");
    console.log("Grand Nationals found:", gns.length);
    gns.forEach((gn, i) => {
      console.log(
        `${i + 1}. ${gn.day} ${gn.time} - ${gn.description} (Room ${gn.room})`,
      );
    });
  },
});
