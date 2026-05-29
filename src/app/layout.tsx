import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  metadataBase: new URL("https://boostcv.in"),
  title: "BOOSTCV — Get More Interview Calls & Placement Offers",
  description: "Analyze your resume, match it against real jobs, identify missing skills, and generate a recruiter-approved version built for placements and internships.",
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
    title: "BOOSTCV — Get More Interview Calls & Placement Offers",
    description: "Analyze your resume, match it against real jobs, identify missing skills, and generate a recruiter-approved version built for placements and internships.",
    url: "https://boostcv.in",
    siteName: "BOOSTCV",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BOOSTCV — Get More Interview Calls & Placement Offers"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BOOSTCV — Get More Interview Calls & Placement Offers",
    description: "Analyze your resume, match it against real jobs, identify missing skills, and generate a recruiter-approved version built for placements and internships.",
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
