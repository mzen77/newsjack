import type { Metadata } from "next";
import "./globals.css";

const title = "Newsjack Web — mzen77 fork";
const description =
  "A browser workflow app built on Mike's fork of the open-source Newsjack project.";
const ogImage = {
  url: "/newsjack-og-image.png",
  width: 1497,
  height: 789,
  alt: "Newsjack Web on the mzen77 fork.",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://newsjack.sh"),
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: "Newsjack Web — mzen77 fork",
    images: [ogImage],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
