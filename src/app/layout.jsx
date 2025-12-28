import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";
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
    default: "StudySync - Your Personal Learning Hub",
    template: "%s | StudySync",
  },
  description:
    "Centralize your learning journey with StudySync. Organize YouTube playlists, PDFs, and articles in one powerful platform. Track progress, collaborate on study plans, and achieve your learning goals efficiently.",
  keywords: [
    "study management",
    "learning platform",
    "study planner",
    "YouTube learning",
    "PDF organizer",
    "progress tracking",
    "self-learning",
    "online education",
  ],
  authors: [{ name: "StudySync Team" }],
  creator: "StudySync",
  publisher: "StudySync",
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
    title: "StudySync - Your Personal Learning Hub",
    description:
      "Centralize your learning journey. Organize YouTube playlists, PDFs, and articles with smart progress tracking.",
    url: "https://thestudysync.vercel.app",
    siteName: "StudySync",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudySync - Your Personal Learning Hub",
    description:
      "Centralize your learning journey. Organize YouTube playlists, PDFs, and articles with smart progress tracking.",
    creator: "@studysync", // Update with your actual Twitter handle if you have one
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <Toaster position="top-right" />
            <Navbar />
            <main className="pt-16">{children}</main>
            <Footer />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
