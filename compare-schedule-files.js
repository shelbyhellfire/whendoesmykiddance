const XLSX = require("xlsx");
const fs = require("fs");
const Papa = require("papaparse");

console.log("📊 Comparing schedule.xlsx with schedule.csv\n");

// Read the Excel file
const workbook = XLSX.readFile("archive/broken-parser/schedule.xlsx");
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

// Read the CSV file
const csvContent = fs.readFileSync("public/schedule.csv", "utf-8");
const csvData = Papa.parse(csvContent, { header: true }).data;

// Parse Excel to get all dancer-routine pairs
const excelEntries = new Map(); // key: "dancerName|routineNumber", value: full entry
let currentDay = "";

for (let i = 1; i < excelData.length; i++) {
  const row = excelData[i];
  if (!row || row.every((cell) => !cell)) continue;

  const roomCell = String(row[0] || "").trim();
  
  // Check for day header
  if (roomCell.includes("2026")) {
    const match = roomCell.match(/(\w+)\s+\w+\s+\d+,\s+2026/);
    if (match) {
      currentDay = match[1];
    }
    continue;
  }

  const dayCell = String(row[1] || "").trim();
  const timeCell = String(row[2] || "").trim();
  const numberCell = String(row[3] || "").trim();
  const nameCell = String(row[4] || "").trim();
  const dancersCell = String(row[5] || "").trim();

  // Skip headers, awards, empty routines
  if (!numberCell || numberCell === "Numbr" || numberCell === "--" || 
      nameCell.includes("Awards") || !timeCell) {
    continue;
  }

  // Parse dancers from the cell
  let dancers = [];
  if (dancersCell.includes(",")) {
    dancers = dancersCell.split(",").map(d => d.trim()).filter(d => d);
  } else if (dancersCell) {
    // Try to split by newlines
    dancers = dancersCell.split("\n").map(d => d.trim()).filter(d => d);
  }

  // Store each dancer-routine pair
  for (const dancer of dancers) {
    if (!dancer) continue;
    
    const key = `${dancer}|${numberCell}`;
    excelEntries.set(key, {
      dancer,
      day: currentDay,
      time: timeCell.split("\n")[0], // First time if multiple
      room: roomCell.split("\n")[0].trim(),
      number: numberCell.split("\n")[0],
      name: nameCell.split("\n")[0],
      source: "Excel"
    });
  }
}

// Parse CSV entries
const csvEntries = new Map(); // key: "dancerName|routineNumber", value: full entry
for (const row of csvData) {
  if (!row.dancerName || !row.routineNumber) continue;
  
  // Skip group entries (multiple dancers in one cell)
  if (row.dancerName.includes(",")) continue;
  
  const key = `${row.dancerName}|${row.routineNumber}`;
  csvEntries.set(key, {
    dancer: row.dancerName,
    day: row.day,
    time: row.time,
    room: row.room,
    number: row.routineNumber,
    name: row.routineName,
    source: "CSV"
  });
}

console.log(`📈 Statistics:`);
console.log(`   Excel entries: ${excelEntries.size}`);
console.log(`   CSV entries: ${csvEntries.size}`);
console.log();

// Find entries in Excel but not in CSV
const inExcelNotCsv = [];
for (const [key, entry] of excelEntries) {
  if (!csvEntries.has(key)) {
    inExcelNotCsv.push(entry);
  }
}

// Find entries in CSV but not in Excel
const inCsvNotExcel = [];
for (const [key, entry] of csvEntries) {
  if (!excelEntries.has(key)) {
    inCsvNotExcel.push(entry);
  }
}

// Report findings
if (inExcelNotCsv.length > 0) {
  console.log(`❌ ${inExcelNotCsv.length} entries in Excel but NOT in CSV:`);
  console.log("=" .repeat(80));
  inExcelNotCsv.slice(0, 20).forEach((entry, i) => {
    console.log(`${i + 1}. ${entry.dancer} - ${entry.name} (#${entry.number})`);
    console.log(`   ${entry.day}, ${entry.time}, ${entry.room}`);
  });
  if (inExcelNotCsv.length > 20) {
    console.log(`   ... and ${inExcelNotCsv.length - 20} more`);
  }
  console.log();
}

if (inCsvNotExcel.length > 0) {
  console.log(`➕ ${inCsvNotExcel.length} entries in CSV but NOT in Excel:`);
  console.log("=".repeat(80));
  inCsvNotExcel.slice(0, 20).forEach((entry, i) => {
    console.log(`${i + 1}. ${entry.dancer} - ${entry.name} (#${entry.number})`);
    console.log(`   ${entry.day}, ${entry.time}, ${entry.room}`);
  });
  if (inCsvNotExcel.length > 20) {
    console.log(`   ... and ${inCsvNotExcel.length - 20} more`);
  }
  console.log();
}

// Check specifically for Sylvia Moore's "Always" entry
const sylviaAlwaysKey = "Sylvia Moore|1652";
const inExcel = excelEntries.has(sylviaAlwaysKey);
const inCsv = csvEntries.has(sylviaAlwaysKey);

console.log("🔍 Sylvia Moore's 'Always' (#1652) Status:");
console.log(`   In Excel: ${inExcel ? "✅ YES" : "❌ NO"}`);
console.log(`   In CSV: ${inCsv ? "✅ YES" : "❌ NO"}`);
if (inExcel && inCsv) {
  console.log("   Status: ✅ MATCHED");
} else if (inExcel && !inCsv) {
  console.log("   Status: ⚠️ Missing from CSV (should be added)");
} else if (!inExcel && inCsv) {
  console.log("   Status: ℹ️ In CSV but not Excel (manually added)");
}
console.log();

// Summary
console.log("=" .repeat(80));
if (inExcelNotCsv.length === 0 && inCsvNotExcel.length === 0) {
  console.log("✅ PERFECT MATCH! Excel and CSV are identical.");
} else {
  console.log("⚠️ DIFFERENCES FOUND:");
  if (inExcelNotCsv.length > 0) {
    console.log(`   - ${inExcelNotCsv.length} entries missing from CSV`);
  }
  if (inCsvNotExcel.length > 0) {
    console.log(`   - ${inCsvNotExcel.length} entries only in CSV (manually added or different)`);
  }
}
console.log("=" .repeat(80));
