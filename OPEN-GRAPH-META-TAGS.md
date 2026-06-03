# Open Graph Meta Tags Implementation

## 🎯 What Was Done

Added dynamic Open Graph (OG) and Twitter Card metadata to enable rich link previews when sharing URLs on social media platforms and messaging apps.

## ✅ Changes Made

### 1. **Individual Dancer Pages** (`app/[dancerName]/page.tsx`)
- **Split into Server & Client Components**:
  - `page.tsx` → Server Component that exports `generateMetadata()`
  - `DancerScheduleClient.tsx` → Client Component with all the interactive logic
- **Dynamic Metadata**: Title automatically includes the dancer's name
  - Example: "Lotus Maciver's Schedule"
  - Description: "View Lotus Maciver's complete dance competition schedule with times, rooms, and routines."

### 2. **Root Layout** (`app/layout.tsx`)
- Enhanced default metadata for the home page
- Added Open Graph and Twitter Card tags
- Acts as fallback for pages without specific metadata

### 3. **Compare & Search Pages**
- Removed metadata exports from Client Components (they can't export metadata)
- These pages use the default metadata from the root layout
- Could be enhanced in the future by splitting into Server/Client components if needed

## 🌐 What Platforms Support This?

When you share a link with the "Copy Link" button, the preview will work on:
- **Facebook** / **Messenger**
- **Twitter** / **X**
- **LinkedIn**
- **WhatsApp**
- **iMessage** (iOS)
- **Slack**
- **Discord**
- **Telegram**
- And many more!

## 📱 Link Preview Examples

### Individual Dancer Page
**URL**: `https://yoursite.com/lotus-maciver`
- **Title**: "Lotus Maciver's Schedule"
- **Description**: "View Lotus Maciver's complete dance competition schedule with times, rooms, and routines."

### Home Page
**URL**: `https://yoursite.com`
- **Title**: "When Does My Kid Dance??"
- **Description**: "Easily find and share your child's dance competition schedule with times, routines, and rooms."

## 🔍 How to Test

1. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
   - Paste your URL to see how it will appear on Facebook

2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
   - Check how your link will look on Twitter/X

3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
   - Verify LinkedIn link previews

4. **Real-world Test**:
   - Copy a link using the "Copy Link" button
   - Send it via WhatsApp, iMessage, or Slack
   - The preview should show the dynamic title and description

## 🎨 Technical Details

- **Server-side Rendering**: Metadata is generated on the server, so social media crawlers can see it
- **Dynamic Generation**: Uses Next.js 13+ `generateMetadata()` function
- **Type Safety**: Fully typed with TypeScript
- **SEO Friendly**: Improves search engine optimization

## 📝 Architecture Pattern

```
app/[dancerName]/
├── page.tsx                    # Server Component (exports metadata)
└── DancerScheduleClient.tsx   # Client Component (handles interactivity)
```

This pattern allows:
- Metadata export from Server Components ✅
- Client-side hooks (useState, useEffect) in Client Components ✅
- Best of both worlds! 🎉

## 🚀 Future Enhancements

If you want even better link previews, you could add:
1. **Open Graph Images**: Custom thumbnail images for each page
2. **Dynamic Compare Page Metadata**: Show dancer names in compare page titles
3. **Structured Data**: Add JSON-LD for rich search results
4. **Favicon**: Better browser tab icons

## ✨ Summary

Your "Copy Link" feature now generates beautiful link previews with:
- **Dynamic titles** based on the dancer's name
- **Descriptive text** explaining what the page contains
- **Social media optimization** for all major platforms
- **Professional appearance** when shared with friends and family

The link previews will automatically show the child's name in the title, making it crystal clear what schedule is being shared! 🎭✨
