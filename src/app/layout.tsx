import type { Metadata } from "next";
import { Quicksand, Space_Mono } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Dinner tonight",
  description: "What's for dinner?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${quicksand.variable} ${spaceMono.variable} antialiased dark`}>
        {children}
      </body>
    </html>
  );
}
