import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  themeColor: "#080809",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: {
    default: "InterviewSim — AI-Powered FAANG Interview Practice",
    template: "%s | InterviewSim",
  },
  description:
    "Master technical, behavioral, and coding interviews with AI-generated questions, real-time evaluation, and deep performance analytics. Practice like pros, land the offer.",
  keywords: [
    "interview simulator",
    "AI interview practice",
    "FAANG interview prep",
    "coding interview",
    "behavioral interview",
    "technical interview",
    "interview feedback",
  ],
  authors: [{ name: "InterviewSim" }],
  creator: "InterviewSim",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://interviewsim.ai",
    title: "InterviewSim — AI-Powered FAANG Interview Practice",
    description:
      "Master technical, behavioral, and coding interviews with AI-generated questions, real-time evaluation, and deep performance analytics.",
    siteName: "InterviewSim",
  },
  twitter: {
    card: "summary_large_image",
    title: "InterviewSim — AI-Powered FAANG Interview Practice",
    description: "Practice interviews with AI. Get hired.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} h-full`}
        style={{ colorScheme: "dark" }}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col bg-[#080809] text-[#ededf0] antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
