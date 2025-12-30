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

export const metadata = {
  title: "USH Monthly Report - Performance Dashboard",
  description: "Union Square House Performance & Branding Report Dashboard - View comprehensive analytics, traffic sources, top performing pages, and key insights.",
  themeColor: "#ffffff",
  viewport: {
    width: "device-width",
    initialScale: 1,
    colorScheme: "light",
  },
  openGraph: {
    title: "USH Monthly Report - Performance Dashboard",
    description: "Union Square House Performance & Branding Report Dashboard - View comprehensive analytics, traffic sources, top performing pages, and key insights.",
    url: "https://monthly-report.vercel.app",
    siteName: "Union Square House",
    images: [
      {
        url: "/ush-logo.jpeg",
        width: 1200,
        height: 630,
        alt: "Union Square House Performance Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "USH Monthly Report - Performance Dashboard",
    description: "Union Square House Performance & Branding Report Dashboard - View comprehensive analytics and insights.",
    images: ["/ush-logo.jpeg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: '#ffffff', color: '#171717' }}
      >
        {children}
      </body>
    </html>
  );
}
