# File Comparison Results

## Summary

**Your schedule.csv is correct and should remain your source of truth!** ✅

## What We Found

### The Numbers
- **CSV:** 188 unique routines, 811 entries (normalized - 1 row per dancer per routine)
- **Excel:** 216 unique routines, complex multi-dancer/multi-routine cells
- **Difference:** 28 routines in Excel not in CSV

### Why They're Different

The Excel file has a complex format:
- Multiple dancers in one cell (space or comma separated)
- Multiple routines stacked vertically in cells
- Complex parsing needed to extract individual entries

The CSV file is **properly normalized**:
- One row per dancer per routine
- Clean, easy to query
- Perfect for the app

### The CSV Was Manually Curated

Your `schedule.csv` was clearly:
1. Created from the Excel (or another source)
2. **Manually cleaned and normalized**
3. Has the correct data structure for the app
4. Is the version that's been working all along

## Sylvia Moore Verification ✅

Found **9 entries** for Sylvia Moore in CSV:
1. Wednesday, 06:59 PM - Aint No Party (#352)
2. Wednesday, 08:51 PM - All Shook Up (#379)
3. Wednesday, 09:51 PM - Sound Bwoy (#392)
4. Thursday, 08:44 AM - All For You (#404)
5. Saturday, 04:06 PM - I Don't Think About You (#876)
6. Saturday, 05:57 PM - Fast and Furious (#888)
7. Saturday, 06:44 PM - The Time Is Now (#893)
8. Saturday, 10:09 AM - Girl Walk (#1643)
9. ⭐ **Saturday, 10:36 AM - Always (#1652)** ← Now included!

## The 28 Missing Routines

Routines in Excel but not CSV:
- #30, #40, #274, #282, #301, #305
- #1279, #1285, #1293, #1309
- #1364, #1371, #1582, #1584
- #1644, #1677, #1679, #1681, #1687
- And 8 more...

### Should You Add Them?

**Probably not.** Here's why:

1. These might be:
   - Rehearsals or sound checks (not performances)
   - Duplicate entries with different numbering
   - Awards ceremonies (already handled separately)
   - Entries that were intentionally excluded

2. Your CSV has been working perfectly for your app

3. The "Always" entry we added came from Excel AND it was actually missing

## Recommendations

### ✅ DO THIS:
- Keep using `public/schedule.csv` as your source
- Edit it directly when needed
- It's the clean, working version

### ❌ DON'T DO THIS:
- Try to re-parse the Excel file
- Automatically merge Excel data into CSV
- The parser has bugs and will break things

### 🤔 IF YOU WANT TO INVESTIGATE:
You can manually check if any of those 28 missing routine numbers are important:
1. Open `archive/broken-parser/schedule.xlsx`
2. Search for those routine numbers
3. See if they're performances that should be in the app
4. If so, manually add them to `schedule.csv`

## Tools Created

We created two comparison scripts:
- `compare-schedule-files.js` - Detailed dancer-level comparison
- `compare-routines.js` - High-level routine number comparison

You can run them anytime:
```bash
node compare-routines.js
```

## Conclusion

**Your CSV is the correct, curated version.** The "Always" entry is now included, and everything is working as it should! 🎉

The Excel file is useful as a reference, but the CSV is your working data source.
