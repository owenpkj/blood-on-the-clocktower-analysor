import type { Metadata } from "next";
import { Cinzel, Libre_Baskerville, UnifrakturCook } from "next/font/google";
import "./globals.css";

const heading = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const body = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap",
});

const blackletter = UnifrakturCook({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-blackletter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "血染钟楼助手",
  description: "带你了解血染钟楼的规则、角色与玩法。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${heading.variable} ${body.variable} ${blackletter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
