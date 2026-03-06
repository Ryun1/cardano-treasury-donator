import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@meshsdk/react/styles.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Cardano Treasury Donator",
  description: "Donate ADA directly to the Cardano treasury",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
