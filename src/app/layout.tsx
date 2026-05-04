import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://grants-for-me.vercel.app"),
  title: "Grants For Me — Free Workforce Training in California",
  description:
    "Aggregated list of free workforce training grants in California for IT, Cybersecurity, Maintenance, and Healthcare fields.",
  openGraph: {
    title: "Grants For Me — Free Workforce Training in California",
    description: "Free workforce training grants in California — IT, Maintenance, Healthcare.",
    type: "website",
    url: "https://grants-for-me.vercel.app",
    // Add og:image: create public/og-image.png (1200x630) and uncomment below.
    // images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Grants For Me" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grants For Me — Free Workforce Training in California",
    description: "Free workforce training grants in California — IT, Maintenance, Healthcare.",
  },
  alternates: {
    canonical: "https://grants-for-me.vercel.app",
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
