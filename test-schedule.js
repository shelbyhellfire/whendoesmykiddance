// Test script to verify the schedule data is properly formatted
const fs = require('fs');
const csv = require('csv-parser');

const testScheduleData = () => {
  const results = [];
  
  fs.createReadStream('public/schedule.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      console.log('✅ Schedule CSV Test Results\n');
      console.log(`Total entries: ${results.length}`);
      
      // Test 1: Check for specific dancers
      const testDancers = ['Alex Davis', 'Brooklyn Brown', 'Macy Geinert', 'Oliver Rogers'];
      console.log('\n📋 Testing dancer searches:');
      testDancers.forEach(dancer => {
        const entries = results.filter(r => r.dancerName === dancer);
        console.log(`  ${dancer}: ${entries.length} routines`);
        if (entries.length > 0) {
          console.log(`    Sample: ${entries[0].routineName} on ${entries[0].day} at ${entries[0].time}`);
        }
      });
      
      // Test 2: Check days
      const days = [...new Set(results.map(r => r.day))];
      console.log('\n📅 Days found:', days.sort().join(', '));
      
      // Test 3: Check rooms
      const rooms = [...new Set(results.map(r => r.room))];
      console.log('🏠 Rooms found:', rooms.sort().join(', '));
      
      // Test 4: Check age groups
      const ages = [...new Set(results.map(r => r.ageGroup).filter(a => a))];
      console.log('👥 Age groups:', ages.sort().join(', '));
      
      // Test 5: Check divisions
      const divisions = [...new Set(results.map(r => r.division).filter(d => d))];
      console.log('🎭 Divisions:', divisions.sort().join(', '));
      
      // Test 6: Sample by day
      console.log('\n📊 Entries by day:');
      days.forEach(day => {
        const count = results.filter(r => r.day === day).length;
        console.log(`  ${day}: ${count} entries`);
      });
      
      // Test 7: Check for data quality issues
      console.log('\n🔍 Data quality checks:');
      const missingDancer = results.filter(r => !r.dancerName);
      const missingDay = results.filter(r => !r.day);
      const missingTime = results.filter(r => !r.time);
      const missingRoom = results.filter(r => !r.room);
      const missingRoutine = results.filter(r => !r.routineName);
      
      console.log(`  Entries missing dancer name: ${missingDancer.length}`);
      console.log(`  Entries missing day: ${missingDay.length}`);
      console.log(`  Entries missing time: ${missingTime.length}`);
      console.log(`  Entries missing room: ${missingRoom.length}`);
      console.log(`  Entries missing routine name: ${missingRoutine.length}`);
      
      console.log('\n✨ All tests complete!');
    });
};

testScheduleData();
