import type { Metadata } from "next";
import "./globals.css";
import AuthModal from "@/components/auth/AuthModal";

export const metadata: Metadata = {
  title: "Stogie Social - Track, Review, Connect",
  description: "The premier social platform for cigar enthusiasts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <AuthModal />
      </body>
    </html>
  );
}
