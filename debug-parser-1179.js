const XLSX = require("xlsx");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Helper to parse dancers
const parseDancers = (dancersText) => {
  if (!dancersText) return [];
  
  if (dancersText.includes(",")) {
    return dancersText
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d);
  }
  
  const words = dancersText.trim().split(/\s+/);
  const names = [];
  
  for (let i = 0; i < words.length - 1; i += 2) {
    if (words[i] && words[i + 1]) {
      names.push(`${words[i]} ${words[i + 1]}`);
    }
  }
  
  if (names.length === 0 && dancersText.trim()) {
    return [dancersText.trim()];
  }
  
  return names;
};

const workbook = XLSX.readFile("public/schedule.xlsx");
const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: "" });

console.log('Looking for routine 1179...\n');

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (!row) continue;
  
  const numberCell = String(row[3] || "").trim();
  
  if (numberCell === '1179') {
    console.log(`Found routine 1179 at row ${i}`);
    
    const roomCell = String(row[0] || "").trim();
    const timeCell = String(row[2] || "").trim();
    const nameCell = String(row[4] || "").trim();
    let dancersCell = String(row[5] || "").trim();
    
    console.log('Room:', roomCell);
    console.log('Time:', timeCell);
    console.log('Name:', nameCell);
    console.log('Initial dancers:', dancersCell);
    
    // Collect continuation rows
    let nextRowIdx = i + 1;
    let continuationsFound = 0;
    while (nextRowIdx < data.length) {
      const nextRow = data[nextRowIdx];
      if (!nextRow) break;
      
      const nextRoom = String(nextRow[0] || "").trim();
      const nextDay = String(nextRow[1] || "").trim();
      const nextTime = String(nextRow[2] || "").trim();
      const nextNumber = String(nextRow[3] || "").trim();
      const nextName = String(nextRow[4] || "").trim();
      const nextDancers = String(nextRow[5] || "").trim();
      
      if (!nextRoom && !nextDay && !nextTime && !nextNumber && !nextName && nextDancers) {
        console.log(`  Continuation row ${nextRowIdx}: "${nextDancers}"`);
        dancersCell += ", " + nextDancers;
        continuationsFound++;
        nextRowIdx++;
      } else {
        break;
      }
    }
    
    console.log(`\nCollected ${continuationsFound} continuation rows`);
    console.log('\nFinal dancers text length:', dancersCell.length);
    console.log('Final dancers text:', dancersCell);
    
    console.log('\n--- Parsing dancers ---');
    const dancers = parseDancers(dancersCell);
    console.log(`Parsed ${dancers.length} dancers:`);
    dancers.forEach((d, idx) => {
      console.log(`  ${idx + 1}. "${d}"`);
      if (d.toLowerCase().includes('lotus')) {
        console.log('     ^^^ LOTUS FOUND! ^^^');
      }
    });
    
    break;
  }
}
