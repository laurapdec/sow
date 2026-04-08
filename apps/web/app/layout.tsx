import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});
const catchyMager = localFont({
  src: "./fonts/CatchyMager.woff",
  variable: "--font-catchy-mager",
});

export const metadata: Metadata = {
  title: "Sow",
  description: "Sharing Our Wealth - Because abundance is in community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${catchyMager.variable}`}>
        {children}
      </body>
    </html>
  );
}
