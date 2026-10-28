import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VERIFAI | AICTE Verification Intelligence",
  description: "AI-assisted application validation and regulatory compliance for AICTE.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
