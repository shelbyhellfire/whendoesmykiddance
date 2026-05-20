ar# When Does My Kid Dance? 💃

A simple web application for dance competition parents to quickly find their child's performance schedule.

## Features

- Search for dancers by name
- View all performances for a dancer including:
  - Day
  - Time
  - Room/Studio
  - Routine Number

## Getting Started

### Prerequisites

- Node.js installed on your machine

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Adding Your Schedule Data

1. Replace the `public/schedule.csv` file with your competition schedule
2. Make sure your CSV has the following columns:
   - `dancerName` (required)
   - `day` (required)
     dancerName,day,time,room,routineNumber,routineName
     Emma Johnson,Saturday,9:30 AM,Studio A,101,Ballet Dreams
     Emma Johnson,Saturday,2:15 PM,Studio B,145,Jazz Funk
     Sophia Martinez,Saturday,10:45 AM,Studio A,115,Tap Sensation

````

### Running the App

```bash
npm run dev
````

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How Parents Use It

1. Visit the website
2. Click "Search for a Dancer"
3. Type in the dancer's name
4. View all their scheduled performances

## Deployment

You can easily deploy this app to Vercel:

1. Push your code to GitHub

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- PapaParse (CSV parsing)

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
