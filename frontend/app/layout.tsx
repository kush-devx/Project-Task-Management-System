import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Collab Platform",
  description: "AI Academic Collaboration Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider><Navbar />{children}</AuthProvider>
      </body>
    </html>
  );
}
