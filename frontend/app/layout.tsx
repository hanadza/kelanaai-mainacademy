import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "KelanaAI — AI Travel Planner & Itinerary Companion",
  description: "Plan your personalized travel itineraries with AI, explore destination recommendations, and ask your virtual travel assistant.",
  keywords: ["AI Travel Planner", "Itinerary Generator", "KelanaAI", "Travel Assistant", "Indonesia Travel"],
};

import GoogleAuthProvider from "@/components/GoogleAuthProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GoogleAuthProvider>{children}</GoogleAuthProvider>
      </body>
    </html>
  );
}
