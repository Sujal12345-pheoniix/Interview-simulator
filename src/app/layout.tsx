import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Interview Simulator — Practice & Get Hired",
  description:
    "Realistic AI-powered technical, behavioral, and coding interview practice. Get scored, get feedback, get better.",
  icons: {
    icon: [
      { url: '/file.svg', type: 'image/svg+xml', sizes: '256x256' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
    apple: [{ url: '/file.svg', sizes: '180x180' }]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} h-full`} style={{ colorScheme: "dark" }}>
        <body className="min-h-full flex flex-col bg-[#0c0c0e] text-gray-100 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
