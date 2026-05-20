const XLSX = require('xlsx');

// Quick inspection of the Excel file
const inspectXLSX = () => {
  console.log('Reading schedule.xlsx...');
  
  const workbook = XLSX.readFile('public/schedule.xlsx');
  console.log('Sheet names:', workbook.SheetNames);
  
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  
  console.log(`\nTotal rows: ${data.length}`);
  console.log('\nFirst 15 rows:');
  for (let i = 0; i < Math.min(15, data.length); i++) {
    console.log(`Row ${i}:`, data[i].slice(0, 10));
  }
};

inspectXLSX();
