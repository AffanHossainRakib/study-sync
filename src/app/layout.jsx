import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "The Study Sync - Collaborative Study Plan Manager & Learning Hub",
    template: "%s | The Study Sync",
  },
  description:
    "Create, share, and track study plans with The Study Sync. Organize YouTube videos, PDFs, and articles in one platform. Features progress tracking, deadline reminders, collaboration tools, and multi-source resource integration for students and self-learners.",
  keywords: [
    "study management",
    "learning platform",
    "study planner",
    "collaborative learning",
    "study plan manager",
    "YouTube learning",
    "PDF organizer",
    "progress tracking",
    "self-learning",
    "online education",
    "educational app",
    "student productivity",
    "study tracker",
    "learning resources",
    "study schedule",
    "academic planner",
    "course management",
    "learning management system",
    "study notes organizer",
    "educational technology",
    "online study tools",
    "student organization",
    "study goal tracking",
    "learning progress tracker",
    "collaborative study platform",
  ],
  authors: [{ name: "The Study Sync Team" }],
  creator: "The Study Sync",
  publisher: "The Study Sync",
  applicationName: "The Study Sync",
  category: "Education",
  classification: "Educational Application",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://thestudysync.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Study Sync - Collaborative Study Plan Manager & Learning Hub",
    description:
      "Create, share, and track study plans. Organize YouTube videos, PDFs, and articles with smart progress tracking, deadline reminders, and collaboration tools for students.",
    url: "https://thestudysync.vercel.app",
    siteName: "The Study Sync",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Study Sync - Collaborative Study Plan Manager",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Study Sync - Collaborative Study Plan Manager & Learning Hub",
    description:
      "Create, share, and track study plans. Organize YouTube videos, PDFs, and articles with smart progress tracking and collaboration tools.",
    creator: "@The Study Sync",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "FEoJuVOJPe4NJ-7NlC0XByeEo5v4Rvg2JXTzA4X0e0o",
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <Toaster position="top-right" />
            <Navbar />
            <div className="flex pt-16">
              <Sidebar />
              <main className="flex-1 min-w-0">{children}</main>
            </div>
            <Footer />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
