import type { Metadata } from "next";
import { Suspense } from "react";
import LoadingState from "../components/LoadingState";
import SchedulePageClient from "./SchedulePageClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate dynamic metadata for social sharing
export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const day = resolvedParams.day as string | undefined;
  const room = resolvedParams.room as string | undefined;
  const age = resolvedParams.age as string | undefined;

  // Build title based on filters
  const parts = [];
  if (day && day !== "All") parts.push(day);
  if (room && room !== "All") parts.push(`Room ${room}`);
  if (age && age !== "All") parts.push(age);

  const title =
    parts.length > 0
      ? `${parts.join(" • ")} Dances`
      : "Browse Full Dance Schedule";
  const description =
    parts.length > 0
      ? `View all dance competition routines for ${parts.join(", ")}.`
      : "Browse and filter all dance competition routines by day, room, and age group.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<LoadingState message="Loading schedule..." />}>
      <SchedulePageClient />
    </Suspense>
  );
}
