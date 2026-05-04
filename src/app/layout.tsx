import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Grants For Me — Free Workforce Training in California",
  description:
    "Aggregated list of free workforce training grants in California for IT, Cybersecurity, Maintenance, and Healthcare fields.",
  keywords: [
    "California grants",
    "free training",
    "workforce development",
    "IT training",
    "healthcare training",
    "WIOA",
    "AJCC",
    "CompTIA",
  ],
  openGraph: {
    title: "Grants For Me",
    description: "Free workforce training grants in California — IT, Maintenance, Healthcare.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
