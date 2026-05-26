import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://boostcv.in"),
  title: "BOOSTCV — ATS Resume Optimizer",
  description: "Stop getting rejected by HR scripts. Build a single-column, recruiter-approved, highly optimized ATS resume in 5 minutes.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  openGraph: {
    title: "BOOSTCV — ATS Resume Optimizer",
    description: "Stop getting rejected by HR scripts. Build a single-column, recruiter-approved, highly optimized ATS resume in 5 minutes.",
    url: "https://boostcv.in",
    siteName: "BOOSTCV",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BOOSTCV — ATS Resume Optimizer"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BOOSTCV — ATS Resume Optimizer",
    description: "Stop getting rejected by HR scripts. Build a single-column, recruiter-approved, highly optimized ATS resume in 5 minutes.",
    images: ["/twitter-image.png"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-slate-100">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
