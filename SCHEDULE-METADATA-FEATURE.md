# 🔗 Schedule Page Dynamic Metadata Feature

## ✨ What Was Done

Added dynamic Open Graph (OG) and Twitter Card metadata to the schedule page so that when users share filtered schedule links (e.g., Tuesday, Room A, Mini dances), the thumbnail and preview show the specific filters - similar to how individual dancer pages show "Lotus MacIver's Schedule".

## 🎯 Changes Made

### 1. **Split Schedule Page into Server and Client Components**
   - **`app/schedule/page.tsx`** → Server Component that exports `generateMetadata()`
   - **`app/schedule/SchedulePageClient.tsx`** → Client Component with all interactive logic
   
   This architecture allows:
   - Server-side metadata generation for social media crawlers ✅
   - Client-side interactivity with React hooks ✅
   - Best of both worlds! 🎉

### 2. **Added Dynamic Metadata Generation**
   The `generateMetadata()` function reads URL parameters and generates appropriate titles:
   
   | Filter Combination | Generated Title | Description |
   |-------------------|----------------|-------------|
   | No filters | "Browse Full Dance Schedule" | "Browse and filter all dance competition routines by day, room, and age group." |
   | Day only | "Tuesday Dances" | "View all dance competition routines for Tuesday." |
   | Day + Room | "Tuesday • Room A Dances" | "View all dance competition routines for Tuesday, Room A." |
   | Day + Room + Age | "Tuesday • Room A • Mini Dances" | "View all dance competition routines for Tuesday, Room A, Mini." |
   | Any combination | "[filters] Dances" | "View all dance competition routines for [filters]." |

### 3. **Fixed Copy Link Button Layout**
   - Moved "Copy Link" button next to "Browse Full Schedule" title
   - Prevents content from bumping down when filters are active
   - Button only appears when filters are active
   
   **PageHeader Component Enhancement:**
   - Added `copyLinkButton?: React.ReactNode` prop
   - Title and button now use flex layout for consistent spacing

## 📱 How It Works

1. **User visits schedule page with filters:**
   ```
   /schedule?day=Tuesday&room=A&age=Mini
   ```

2. **Server generates metadata:**
   ```html
   <title>Tuesday • Room A • Mini Dances</title>
   <meta property="og:title" content="Tuesday • Room A • Mini Dances"/>
   <meta property="og:description" content="View all dance competition routines for Tuesday, Room A, Mini."/>
   <meta name="twitter:title" content="Tuesday • Room A • Mini Dances"/>
   ```

3. **User clicks "Copy Link" button**
   - Copies current URL: `https://yoursite.com/schedule?day=Tuesday&room=A&age=Mini`

4. **User shares link on social media**
   - Link preview shows: **"Tuesday • Room A • Mini Dances"**
   - Description: **"View all dance competition routines for Tuesday, Room A, Mini."**

## 🌐 Social Media Platform Support

When you share a schedule link, the preview will work on:
- **Facebook** / **Messenger** 
- **Twitter** / **X**
- **LinkedIn**
- **WhatsApp**
- **iMessage** (iOS 15+)
- **Slack**
- **Discord**
- **Telegram**

## 🧪 Testing

You can test the metadata using these URLs:

```bash
# No filters
curl -s http://localhost:3000/schedule | grep "og:title"

# Day only
curl -s http://localhost:3000/schedule?day=Friday | grep "og:title"

# Day + Room
curl -s http://localhost:3000/schedule?day=Tuesday&room=A | grep "og:title"

# All filters
curl -s http://localhost:3000/schedule?day=Tuesday&room=A&age=Mini | grep "og:title"
```

## 📝 File Changes

### New Files Created:
- `app/schedule/SchedulePageClient.tsx` - Client component with interactive logic

### Modified Files:
- `app/schedule/page.tsx` - Now a server component with metadata
- `app/components/PageHeader.tsx` - Added copyLinkButton prop

## 🎨 Examples

### Filter: Tuesday + Room A + Mini
```
Title: "Tuesday • Room A • Mini Dances"
Description: "View all dance competition routines for Tuesday, Room A, Mini."
```

### Filter: Friday only
```
Title: "Friday Dances"
Description: "View all dance competition routines for Friday."
```

### No Filters
```
Title: "Browse Full Dance Schedule"
Description: "Browse and filter all dance competition routines by day, room, and age group."
```

## ✅ Benefits

1. **Better Sharing Experience** - Friends and family see exactly what they're clicking on
2. **More Clicks** - Descriptive previews increase engagement
3. **Professional Look** - Clean, informative link previews
4. **SEO Friendly** - Search engines index the dynamic titles
5. **No Content Shift** - Copy Link button doesn't bump down content

## 🚀 Future Enhancements

Potential improvements:
1. **Open Graph Images** - Custom thumbnail images for each filter combination
2. **Emoji in Titles** - Add 📅 for days, 🏠 for rooms, 👶 for age groups
3. **Count in Description** - "View 47 dance routines for Tuesday, Room A"
4. **Multiple Dancers** - Extend to compare page with dancer names

---

**Note:** The metadata is generated server-side, so social media crawlers can read it immediately when the link is shared!
