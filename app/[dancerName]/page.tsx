import type { Metadata } from "next";
import DancerScheduleClient from "./DancerScheduleClient";

interface PageProps {
  params: Promise<{ dancerName: string }>;
}

// Generate dynamic metadata for social sharing
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slugName = resolvedParams.dancerName;
  const properName = slugName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const title = `${properName}'s Schedule`;
  const description = `View ${properName}'s complete dance competition schedule with times, rooms, and routines.`;

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

export default async function DancerSchedulePage({ params }: PageProps) {
  const resolvedParams = await params;
  const slugName = resolvedParams.dancerName;
  const properName = slugName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return <DancerScheduleClient dancerName={properName} />;
}
