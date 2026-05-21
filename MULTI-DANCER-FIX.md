# Multi-Dancer Routine Display Fix

## Issue

When searching for multiple dancers (e.g., Lotus Maclver and Adelaide Anderson), routines where BOTH dancers perform together (like "All Shook Up") were only showing ONE dancer name.

## Root Cause

The deduplication logic had different implementations:

### Search Page (`app/search/page.tsx`)
✅ Was merging dancer names correctly
```javascript
if (existing.dancerName && !existing.dancerName.includes(current.dancerName)) {
  existing.dancerName = `${existing.dancerName}, ${current.dancerName}`;
}
```

### Compare Page (`app/compare/page.tsx`)
❌ Was NOT merging - just kept the first entry
```javascript
if (!existing) {
  acc.push({ ...current });
}
```

## The Fix

### 1. Fixed Compare Page Deduplication
Updated the compare page to merge dancer names just like the search page does.

### 2. Added Visual Indicators in Header
Both pages now show small colored dots in the header when multiple searched dancers are in the same routine:
- Header shows gradient background (already working)
- Header now also shows small colored dots for each dancer (NEW!)
- Expanded view shows full dancer names with badges (already working)

## Testing

To test the fix:

1. Search for "Lotus Maclver" and "Adelaide Anderson"
2. Look for "All Shook Up" (#379, Wednesday 08:51 PM)
3. You should see:
   - ✅ Gradient header (cyan + rose colors)
   - ✅ Small colored dots in the header showing both dancers
   - ✅ When expanded, both dancer names with badges

Other shared routines to check:
```bash
grep "All Shook Up" public/schedule.csv | grep -E "Lotus|Adelaide"
```

## Files Changed

- ✅ `app/search/page.tsx` - Added dancer dots in header
- ✅ `app/compare/page.tsx` - Fixed deduplication + added dancer dots in header

## Expected Behavior

**Before:**
- Routine showed only one dancer (whichever was first in the CSV)
- Confusing for parents tracking multiple kids

**After:**
- Routine merges both dancer names
- Header shows gradient + small dots for each dancer
- Expanded view clearly shows which dancers are performing
- Easy to see at a glance which routines they share

---

**Status:** ✅ FIXED

The app will now correctly display when multiple searched dancers are in the same routine!
