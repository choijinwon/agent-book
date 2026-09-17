import type { Metadata } from "next";
import "./globals.css";
import {siteUrl,siteName,siteDescription,jsonLd} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {default:'에이전트북 | 도서 추천·책 검색·독서 기록',template:'%s | 에이전트북'},
  description: siteDescription,
  alternates: {canonical:'/'},
  robots: {index:true,follow:true},
  openGraph: {type:'website',locale:'ko_KR',siteName,title:'agentbook | 도서 추천과 책 검색',description:siteDescription,url:siteUrl},
  twitter: {card:'summary',title:'agentbook | 도서 추천과 책 검색',description:siteDescription},
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NAVER_SITE_VERIFICATION ? {'naver-site-verification':process.env.NAVER_SITE_VERIFICATION} : {},
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
      <body className="antialiased">{children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({"@context":"https://schema.org","@type":"WebSite",name:siteName,alternateName:["agentbook","Agent Book","에이전트북"],url:siteUrl,inLanguage:"ko"})}}/></body>
    </html>
  );
}
