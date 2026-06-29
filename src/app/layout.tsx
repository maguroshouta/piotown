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
      <body className="min-h-full flex flex-col bg-[#f4f4f5]">
        <Header />
        <main className="mx-auto w-full max-w-2xl">{children}</main>
        <Navigation />
      </body>
    </html>
  );
}
