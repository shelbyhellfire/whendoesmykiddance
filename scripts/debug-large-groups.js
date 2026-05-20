const XLSX = require('xlsx');

const workbook = XLSX.readFile('public/schedule.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Look for rows with routines 870, 878, 880, 883, 885, 888
const targetRoutines = ['870', '878', '880', '883', '885', '888'];

console.log('Looking for large group routines...\n');
for (let i = 0; i < data.length; i++) {
  const row = data[i];
  const routineNum = String(row[3] || '').trim();
  
  if (targetRoutines.includes(routineNum)) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Row ${i}: Routine ${routineNum}`);
    console.log('Room:', row[0]);
    console.log('Day:', row[1]);
    console.log('Time:', row[2]);
    console.log('Number:', row[3]);
    console.log('Routine:', row[4]);
    console.log('Dancers (length):', String(row[5] || '').length);
    console.log('Dancers (preview):', String(row[5] || '').substring(0, 200));
    console.log('Level:', row[6]);
    console.log('Age:', row[7]);
    console.log('Division:', row[8]);
    
    // Check if dancers field has newlines
    const dancersText = String(row[5] || '');
    const lines = dancersText.split('\n');
    console.log(`\nDancers has ${lines.length} lines`);
    if (lines.length > 1) {
      console.log('First 3 lines:');
      for (let j = 0; j < Math.min(3, lines.length); j++) {
        console.log(`  Line ${j+1}: "${lines[j]}"`);
      }
    }
    
    // Check next row
    console.log(`\n  Next row (${i+1}):`, data[i+1].slice(0, 6));
  }
}
