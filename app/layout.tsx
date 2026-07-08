import type { Metadata } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "De Kas | Boulder Bloem",
  description: "Interne werkapplicatie van Boulder Bloem",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${fraunces.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
