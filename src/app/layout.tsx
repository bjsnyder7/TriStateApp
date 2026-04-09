import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TriStateApp",
  description: "TriStateApp Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
