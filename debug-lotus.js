const XLSX = require('xlsx');

const workbook = XLSX.readFile('public/schedule.xlsx');
const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: '' });

// Simulate the parser for row 37 (routine 1179)
let i = 37;
const row = data[i];

const roomCell = String(row[0] || '').trim();
const dayCell = String(row[1] || '').trim();
const timeCell = String(row[2] || '').trim();
const numberCell = String(row[3] || '').trim();
const nameCell = String(row[4] || '').trim();
let dancersCell = String(row[5] || '').trim();

console.log('=== ROW 37 (Routine 1179) ===');
console.log('Number:', numberCell);
console.log('Name:', nameCell);
console.log('Initial dancers:', dancersCell);
console.log('\nCollecting continuation rows...');

// Collect continuation rows
let nextRowIdx = i + 1;
while (nextRowIdx < data.length) {
  const nextRow = data[nextRowIdx];
  if (!nextRow) break;
  
  const nextRoom = String(nextRow[0] || '').trim();
  const nextDay = String(nextRow[1] || '').trim();
  const nextTime = String(nextRow[2] || '').trim();
  const nextNumber = String(nextRow[3] || '').trim();
  const nextName = String(nextRow[4] || '').trim();
  const nextDancers = String(nextRow[5] || '').trim();
  
  if (!nextRoom && !nextDay && !nextTime && !nextNumber && !nextName && nextDancers) {
    console.log(`  Row ${nextRowIdx}: "${nextDancers}"`);
    dancersCell += ', ' + nextDancers;
    nextRowIdx++;
  } else {
    break;
  }
}

console.log('\nFinal combined dancers text:');
console.log(dancersCell);

console.log('\nParsing dancers (comma-separated):');
const dancers = dancersCell.split(',').map(d => d.trim()).filter(d => d);
console.log(`Found ${dancers.length} dancers:`);
dancers.forEach((d, idx) => {
  console.log(`  ${idx + 1}. "${d}"`);
});

console.log('\nSearching for "Lotus":');
const lotusEntries = dancers.filter(d => d.toLowerCase().includes('lotus'));
console.log('Lotus entries:', lotusEntries);
