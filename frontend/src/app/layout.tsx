import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecOps Dashboard",
  description: "Security Operations Center — Centralized security event management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
