import type { Metadata } from "next";
import "./globals.css";
import {siteUrl,siteName,siteDescription,jsonLd} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {default:'agentbook | 도서 추천·책 검색·독서 트렌드',template:'%s | agentbook'},
  description: siteDescription,
  alternates: {canonical:'/'},
  robots: {index:true,follow:true},
  openGraph: {type:'website',locale:'ko_KR',siteName,title:'agentbook | 도서 추천과 책 검색',description:siteDescription,url:siteUrl},
  twitter: {card:'summary',title:'agentbook | 도서 추천과 책 검색',description:siteDescription},
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
      <body className="antialiased">{children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({"@context":"https://schema.org","@type":"WebSite",name:siteName,alternateName:"에이전트북",url:siteUrl,inLanguage:"ko"})}}/></body>
    </html>
  );
}
