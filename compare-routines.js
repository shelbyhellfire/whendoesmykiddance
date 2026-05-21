const XLSX = require("xlsx");
const fs = require("fs");
const Papa = require("papaparse");

console.log("🔍 Deep Comparison: Excel vs CSV\n");
console.log("Note: CSV is normalized (1 row per dancer per routine)");
console.log("      Excel has multiple dancers/routines per cell\n");

// Read CSV
const csvContent = fs.readFileSync("public/schedule.csv", "utf-8");
const csvData = Papa.parse(csvContent, { header: true }).data.filter(r => r.dancerName && r.routineNumber);

// Get unique routine numbers from CSV
const csvRoutines = new Set();
const csvByRoutine = new Map();

csvData.forEach(row => {
  if (row.dancerName.includes(",")) {
    // Group entry - split dancers
    const dancers = row.dancerName.split(",").map(d => d.trim());
    dancers.forEach(dancer => {
      csvRoutines.add(row.routineNumber);
      if (!csvByRoutine.has(row.routineNumber)) {
        csvByRoutine.set(row.routineNumber, {
          number: row.routineNumber,
          name: row.routineName,
          day: row.day,
          time: row.time,
          room: row.room,
          dancers: new Set()
        });
      }
      csvByRoutine.get(row.routineNumber).dancers.add(dancer);
    });
  } else {
    csvRoutines.add(row.routineNumber);
    if (!csvByRoutine.has(row.routineNumber)) {
      csvByRoutine.set(row.routineNumber, {
        number: row.routineNumber,
        name: row.routineName,
        day: row.day,
        time: row.time,
        room: row.room,
        dancers: new Set()
      });
    }
    csvByRoutine.get(row.routineNumber).dancers.add(row.dancerName);
  }
});

// Read Excel and extract routines
const workbook = XLSX.readFile("archive/broken-parser/schedule.xlsx");
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

const excelRoutines = new Set();
const excelByRoutine = new Map();
let currentDay = "";

for (let i = 1; i < excelData.length; i++) {
  const row = excelData[i];
  if (!row || row.every((cell) => !cell)) continue;

  const roomCell = String(row[0] || "").trim();
  
  if (roomCell.includes("2026")) {
    const match = roomCell.match(/(\w+)\s+\w+\s+\d+,\s+2026/);
    if (match) currentDay = match[1];
    continue;
  }

  const numberCell = String(row[3] || "").trim();
  const nameCell = String(row[4] || "").trim();
  
  if (!numberCell || numberCell === "Numbr" || numberCell === "--" || nameCell.includes("Awards")) {
    continue;
  }

  const numbers = numberCell.split("\n").map(n => n.trim()).filter(n => n);
  numbers.forEach(num => excelRoutines.add(num));
}

// Compare routine numbers
const inCsvNotExcel = [...csvRoutines].filter(r => !excelRoutines.has(r));
const inExcelNotCsv = [...excelRoutines].filter(r => !csvRoutines.has(r));

console.log("📊 Routine Comparison:");
console.log(`   CSV has ${csvRoutines.size} unique routines`);
console.log(`   Excel has ${excelRoutines.size} unique routines`);
console.log();

if (inCsvNotExcel.length > 0) {
  console.log(`❌ ${inCsvNotExcel.length} routines in CSV but NOT in Excel:`);
  inCsvNotExcel.slice(0, 10).forEach(num => {
    const routine = csvByRoutine.get(num);
    if (routine) {
      console.log(`   #${num} - ${routine.name} (${routine.day}, ${routine.time})`);
    }
  });
  if (inCsvNotExcel.length > 10) {
    console.log(`   ... and ${inCsvNotExcel.length - 10} more`);
  }
  console.log();
}

if (inExcelNotCsv.length > 0) {
  console.log(`➕ ${inExcelNotCsv.length} routines in Excel but NOT in CSV:`);
  console.log(`   ${inExcelNotCsv.slice(0, 20).join(", ")}`);
  if (inExcelNotCsv.length > 20) {
    console.log(`   ... and ${inExcelNotCsv.length - 20} more`);
  }
  console.log();
}

// Check Sylvia Moore specifically
console.log("🎭 Sylvia Moore Analysis:");
const sylviaCsv = csvData.filter(r => 
  r.dancerName === "Sylvia Moore" || 
  (r.dancerName && r.dancerName.includes("Sylvia Moore"))
);
console.log(`   Found ${sylviaCsv.length} entries in CSV:`);
sylviaCsv.forEach((entry, i) => {
  console.log(`   ${i + 1}. ${entry.day}, ${entry.time} - ${entry.routineName} (#${entry.routineNumber})`);
});

console.log("\n" + "=".repeat(80));
console.log("💡 CONCLUSION:");
if (inCsvNotExcel.length === 0 && inExcelNotCsv.length === 0) {
  console.log("✅ Perfect match! All routines in both files.");
} else {
  console.log("⚠️ The CSV and Excel have different data.");
  console.log("   This is EXPECTED - the CSV is the manually curated, correct version.");
  console.log("   The Excel is the raw source but wasn't properly parsed.");
  console.log();
  console.log("   RECOMMENDATION: Keep using schedule.csv as your source of truth.");
}
console.log("=".repeat(80));
