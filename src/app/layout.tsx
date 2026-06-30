import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import Navigation from "@/components/navigation";

export const metadata: Metadata = {
  title: "ぴおタウン",
  description: ""
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex h-dvh flex-col overflow-hidden bg-[#f4f4f5]">
        <Header />
        <main className="mx-auto min-h-0 w-full max-w-2xl flex-1 overflow-y-auto">{children}</main>
        <Navigation />
      </body>
    </html>
  );
}
