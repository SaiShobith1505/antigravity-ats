import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  metadataBase: new URL("https://boostcv.in"),
  title: "BOOSTCV — Resume Intelligence for Modern Job Seekers",
  description: "Analyze your resume against real job descriptions, identify missing skills, and compile a recruiter-approved structural format optimized for competitive hiring processes.",
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
    title: "BOOSTCV — Resume Intelligence for Modern Job Seekers",
    description: "Analyze your resume against real job descriptions, identify missing skills, and compile a recruiter-approved structural format optimized for competitive hiring processes.",
    url: "https://boostcv.in",
    siteName: "BOOSTCV",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BOOSTCV — Resume Intelligence for Modern Job Seekers"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BOOSTCV — Resume Intelligence for Modern Job Seekers",
    description: "Analyze your resume against real job descriptions, identify missing skills, and compile a recruiter-approved structural format optimized for competitive hiring processes.",
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
      className="h-full antialiased light"
    >
      <body className="min-h-full flex flex-col bg-[#F8F7F4] text-[#1C1C1C]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
