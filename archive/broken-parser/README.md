# ⚠️ Broken Parser - DO NOT USE

## Files in this folder

- `parse-xlsx-final.js` - Excel parser script (HAS BUGS)
- `schedule-parsed.csv` - Output from broken parser (INCORRECT DATA)
- `schedule.xlsx` - Excel source file (kept for reference)

## Why these files are archived

### The Problem

The Excel parser has serious bugs:
- ❌ Assigns dances to wrong dancers
- ❌ Misses some entries
- ❌ Creates incorrect associations
- ❌ When used, it broke the entire app

### What Happened

1. User asked about missing "Always" entry for Sylvia Moore
2. We found it in `schedule-parsed.csv` but not in `schedule.csv`
3. We copied the parsed file over
4. **Everything broke** - all dancers had wrong routines assigned
5. Had to restore from backup

### The Solution

The working `public/schedule.csv` was manually created/curated and is **not** generated from the Excel parser. It's the source of truth.

## If you want to restore these files

You can move them back, but **DO NOT RUN THE PARSER** or use its output.

```bash
# To see the files (don't use them!)
cp archive/broken-parser/parse-xlsx-final.js ./
cp archive/broken-parser/schedule.xlsx ./public/

# But DO NOT run: node parse-xlsx-final.js
# And DO NOT copy schedule-parsed.csv anywhere!
```

## The correct way to update the schedule

Edit `public/schedule.csv` directly.

Format:
```csv
dancerName,day,time,room,routineNumber,routineName,category,ageGroup
```

Example:
```csv
Sylvia Moore,Saturday,10:36 AM,Room B,1652,Always,Solo,PT 9-11
```

---

**These files are kept for historical reference only.**
**Do not use them for production!**
