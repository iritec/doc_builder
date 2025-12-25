import type { Metadata } from "next";
import { Montserrat, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "DocBuilder | AI壁打ちで仕様書を作成",
  description: "Claude Opus 4と対話しながらプロダクトの仕様書を段階的に作成できるツール。5フェーズの構造化ヒアリングで、プロジェクト概要から技術スタックまで漏れなく整理します。",
  keywords: ["仕様書", "AI", "Claude", "仕様書作成", "プロダクト開発", "要件定義", "ドキュメント"],
  authors: [{ name: "入江慎吾", url: "https://shingoirie.com/" }],
  openGraph: {
    title: "DocBuilder | AI壁打ちで仕様書を作成",
    description: "Claude Opus 4と対話しながらプロダクトの仕様書を段階的に作成できるツール。5フェーズの構造化ヒアリングで、プロジェクト概要から技術スタックまで漏れなく整理します。",
    type: "website",
    locale: "ja_JP",
    siteName: "DocBuilder",
  },
  twitter: {
    card: "summary_large_image",
    title: "DocBuilder | AI壁打ちで仕様書を作成",
    description: "Claude Opus 4と対話しながらプロダクトの仕様書を段階的に作成できるツール。",
    creator: "@and_and_and",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${montserrat.variable} ${notoSansJP.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
