import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "./components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "When Does My Kid Dance??",
  description:
    "Easily find and share your child's dance competition schedule with times, routines, and rooms.",
  openGraph: {
    title: "When Does My Kid Dance??",
    description:
      "Easily find and share your child's dance competition schedule with times, routines, and rooms.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "When Does My Kid Dance??",
    description:
      "Easily find and share your child's dance competition schedule with times, routines, and rooms.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}
