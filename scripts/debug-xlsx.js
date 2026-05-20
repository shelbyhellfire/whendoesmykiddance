const XLSX = require('xlsx');

const workbook = XLSX.readFile('public/schedule.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Look at rows around row 870 (Happy New Year!)
console.log('Looking for Happy New Year! routine...\n');
for (let i = 260; i < 280; i++) {
  if (data[i] && data[i][4] && String(data[i][4]).includes('Happy')) {
    console.log(`\nRow ${i}:`);
    console.log('Room:', data[i][0]);
    console.log('Day:', data[i][1]);
    console.log('Time:', data[i][2]);
    console.log('Number:', data[i][3]);
    console.log('Routine:', data[i][4]);
    console.log('Dancers:', data[i][5]);
    console.log('Level:', data[i][6]);
    console.log('Age:', data[i][7]);
    console.log('Division:', data[i][8]);
    
    // Check next few rows too
    for (let j = 1; j <= 5; j++) {
      console.log(`\nRow ${i+j} (continuation?):`);
      console.log('  Col 0-5:', data[i+j].slice(0, 6));
    }
  }
}
