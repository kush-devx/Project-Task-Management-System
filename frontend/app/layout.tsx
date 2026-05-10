import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "../context/AuthContext";

export const metadata: Metadata = {
  title: "ProjectFlow",
  description: "AI-assisted project collaboration platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="app-shell">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
