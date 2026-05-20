const fs = require('fs');

// Read the messy awards file
const content = fs.readFileSync('public/awards.csv', 'utf-8');

// Parse awards with regex
const lines = content.split('\n');
const awards = [];

lines.forEach(line => {
  // Match pattern: Room, Day, Time, Description
  const match = line.match(/([ABC])\s+(Tue|Wed|Thu|Fri|Sat|Sun)\s+([\d:]+\s+[AP]M)\s+.*?--(Awards[^-]*)/i);
  
  if (match) {
    const room = `Room ${match[1]}`;
    const day = match[2];
    const time = match[3].trim();
    const description = match[4].trim().replace(/--$/, '').trim();
    
    // Expand day abbreviations
    const dayMap = {
      'Tue': 'Tuesday',
      'Wed': 'Wednesday',
      'Thu': 'Thursday',
      'Fri': 'Friday',
      'Sat': 'Saturday',
      'Sun': 'Sunday'
    };
    
    awards.push({
      room,
      day: dayMap[day] || day,
      time,
      description
    });
  }
});

// Create CSV
const csv = ['room,day,time,description'];
awards.forEach(award => {
  csv.push(`${award.room},${award.day},${award.time},"${award.description}"`);
});

// Write to new file
fs.writeFileSync('public/awards-clean.csv', csv.join('\n'));

console.log(`Parsed ${awards.length} award sessions`);
console.log('\nSample awards:');
awards.slice(0, 5).forEach(a => {
  console.log(`${a.day} ${a.time} - ${a.room}: ${a.description}`);
});
