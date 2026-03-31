import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import { LanguageProvider } from "@/lib/LanguageContext";
import { AuthProvider } from "@/lib/AuthContext";
import { CookieProvider } from "@/lib/CookieContext";
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
  title: "QuranDeck - Quran Vokabeln lernen",
  description:
    "Eine moderne Quran-Lern-App mit Wort-für-Wort Übersetzung, Vokabelspeicherung und Karteikarten-Übung.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="light" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground flex flex-col`}
      >
        <LanguageProvider>
          <CookieProvider>
            <AuthProvider>
              <Navbar />
              <EmailVerificationBanner />
              <main className="flex-1">{children}</main>
              <Footer />
              <CookieBanner />
            </AuthProvider>
          </CookieProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
