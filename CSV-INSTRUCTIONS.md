# Converting starz.pdf to CSV

## Using Adobe Acrobat:

1. Open `starz.pdf` in Adobe Acrobat
2. Go to **File** → **Export To** → **Spreadsheet** → **Microsoft Excel Workbook**
3. Save as `starz.xlsx`
4. Open the Excel file
5. Clean up the data to match this format:
   - Column A: `dancerName`
   - Column B: `day` (Tuesday, Wednesday, Thursday, Friday, Saturday)
   - Column C: `time` (e.g., 11:04 AM)
   - Column D: `room` (e.g., Room A)
   - Column E: `routineNumber` (e.g., 2)
   - Column F: `routineName` (optional - e.g., Control)
6. Save as CSV: **File** → **Save As** → Choose "CSV (Comma delimited)"
7. Replace `public/schedule.csv` with your new file

## CSV Format Example:
```csv
dancerName,day,time,room,routineNumber,routineName
Nora Coole,Tuesday,11:04 AM,Room A,2,Control
Emma Smith,Friday,2:30 PM,Room B,102,Jazz Routine
```

## Tips:
- Make sure the first row has the headers exactly as shown
- Day names should be full: Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- Time format: HH:MM AM/PM
- Room format: "Room A", "Room B", "Room C"

Once your CSV is ready, just replace `public/schedule.csv` and refresh the app!
