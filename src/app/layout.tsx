import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poker Ranking - Sistema de Gerenciamento de Torneios",
  description: "Sistema completo para gerenciamento e exibição de ranking de poker",
  keywords: ["poker", "ranking", "torneios", "gestão", "pontuação"],
  authors: [{ name: "Sistema Poker Ranking" }],
  robots: "index, follow",
  icons: {
    icon: "/chip.png",
    shortcut: "/chip.png",
    apple: "/chip.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
            {children}
          </main>
          <Toaster />
          <SpeedInsights />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
