const fs = require('fs');
const Papa = require('papaparse');

/**
 * Validates CSV file for common issues
 */
function validateCSV(filePath) {
  console.log(`\n🔍 Validating ${filePath}...\n`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let issues = [];
  let warnings = [];

  // Check 1: Line breaks within quoted fields that break dancer names
  lines.forEach((line, index) => {
    // Check if line ends with a comma after a name (potential split name)
    if (line.match(/,[A-Z][a-z]+$/) && index < lines.length - 1) {
      const nextLine = lines[index + 1];
      if (nextLine.match(/^[A-Z][a-z]+,/)) {
        issues.push({
          line: index + 1,
          issue: 'Name appears to be split across lines',
          content: `${line.slice(-30)}... → ${nextLine.slice(0, 30)}...`
        });
      }
    }
  });

  // Check 2: Parse the CSV and validate structure
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true
  });

  if (result.errors.length > 0) {
    result.errors.forEach(error => {
      issues.push({
        line: error.row || 'unknown',
        issue: `Parse error: ${error.message}`,
        content: error.type
      });
    });
  }

  // Check 3: Validate required fields
  result.data.forEach((row, index) => {
    if (!row.dancerName || !row.routineName) {
      warnings.push({
        line: index + 2, // +2 for header and 0-index
        issue: 'Missing required field',
        content: `Dancer: ${row.dancerName || 'MISSING'}, Routine: ${row.routineName || 'MISSING'}`
      });
    }

    // Check for suspicious commas in names
    if (row.dancerName && row.dancerName.includes('\n')) {
      issues.push({
        line: index + 2,
        issue: 'Newline character in dancer name',
        content: row.dancerName
      });
    }
  });

  // Check 4: Look for unescaped quotes
  const unescapedQuotes = content.match(/(?<!^|,)"(?!$|,)/g);
  if (unescapedQuotes) {
    warnings.push({
      line: 'multiple',
      issue: 'Potentially unescaped quotes found',
      content: `Found ${unescapedQuotes.length} occurrences`
    });
  }

  // Report results
  console.log('📊 Validation Results:');
  console.log(`   Total rows: ${result.data.length}`);
  console.log(`   Issues: ${issues.length}`);
  console.log(`   Warnings: ${warnings.length}\n`);

  if (issues.length > 0) {
    console.log('❌ ISSUES FOUND:\n');
    issues.forEach(issue => {
      console.log(`   Line ${issue.line}: ${issue.issue}`);
      console.log(`   → ${issue.content}\n`);
    });
  }

  if (warnings.length > 0 && warnings.length < 10) {
    console.log('⚠️  WARNINGS:\n');
    warnings.forEach(warning => {
      console.log(`   Line ${warning.line}: ${warning.issue}`);
      console.log(`   → ${warning.content}\n`);
    });
  }

  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ No issues found! CSV is clean.\n');
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    totalRows: result.data.length
  };
}

// Run validation
const results = validateCSV('./public/schedule.csv');

// Exit with error code if issues found
if (!results.valid) {
  console.log('❌ Validation failed. Please fix the issues above.\n');
  process.exit(1);
} else {
  console.log('✅ Validation passed!\n');
  process.exit(0);
}
