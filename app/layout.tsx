import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "agent-book · 도서 최적가와 트렌드",
  description: "제목·저자·ISBN으로 책을 찾고, 가격과 베스트셀러 트렌드를 비교하세요.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
