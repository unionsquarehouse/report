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
  description: "Union Square House Performance & Branding Report Dashboard",
  themeColor: "#ffffff",
  viewport: {
    width: "device-width",
    initialScale: 1,
    colorScheme: "light",
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
