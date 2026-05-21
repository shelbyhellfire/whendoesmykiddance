# ⚠️ IMPORTANT: How to Update the Schedule

## The Correct Way

**Edit `public/schedule.csv` directly**

This is the source of truth for your app. Edit it with any text editor or spreadsheet program.

### CSV Format

```csv
dancerName,day,time,room,routineNumber,routineName,category,ageGroup
```

### Example Entry

```csv
Sylvia Moore,Saturday,10:36 AM,Room B,1652,Always,Solo,PT 9-11
Emma Johnson,Wednesday,06:59 PM,Room A,352,Aint No Party,Musical Show,PT 9-11
```

## After Making Changes

1. Save the file
2. Refresh your browser (or restart dev server with `npm run dev`)
3. Changes appear immediately

---

## ⚠️ DO NOT USE THE EXCEL PARSER

There was a broken Excel parser that has been archived in `archive/broken-parser/`.

**DO NOT:**

- Run any parser scripts
- Use `schedule-parsed.csv`
- Use `schedule.xlsx`

These files caused major issues and assigned dances to the wrong people.

---

## File Structure

```
public/
├── schedule.csv          ← EDIT THIS FILE (the one the app uses)
└── schedule.csv.bak      ← Backup (don't edit)

archive/broken-parser/    ← DO NOT USE
├── parse-xlsx-final.js   ← Broken parser
├── schedule-parsed.csv   ← Incorrect data
└── schedule.xlsx         ← Reference only
```
