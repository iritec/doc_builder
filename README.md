# Doc Builder - 仕様書ビルダー

<p align="center">
  <strong>AIで開発する際の最初の仕様書をガッツリつくれるツール</strong>
</p>

---

## 概要

**Doc Builder** は、Claude と対話しながらプロダクトの仕様書を段階的に作成できるサービスです。

バイブコーディングする際、最初にしっかり仕様書を決めている方が破綻なくスムーズに開発を行うことができます。とはいえ、最初から仕様をバッチリ決めるのは難易度が高いですよね。DocBuilder では AI が足りないところをこれでもかというくらい細かく聞いてくるので一緒に会話しながら濃密な仕様書をつくることができます。

## ✨ 特徴

- 🤖 **Claude Opus 4.5** - 高品質な対話でプロダクト仕様を整理
- 📝 **ヒアリング** - プロジェクト概要から技術スタックまで段階的に超細かく整理
- 👀 **リアルタイムプレビュー** - チャット内容がリアルタイムで仕様書に反映
- 📊 **Mermaid フロー図対応** - 画面遷移図を自動生成・表示
- 📤 **エクスポート機能** - Markdown ファイルとしてダウンロード・コピー可能
- 🔐 **セキュアな API キー管理** - API キーはブラウザのみに保存（サーバーには送信されません）

## 📸 ここからでもご利用いただけます

![Doc Builder](https://doc.shingoirie.com/)

## 🚀 クイックスタート

### 前提条件

- npm または yarn または pnpm
- Claude API キー（[console.anthropic.com](https://console.anthropic.com/) で取得）

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/iritec/doc_builder

# 依存関係をインストール
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

**初回アクセス時に Claude API キーの入力を求められます。**

## 🔐 API キーについて

### セキュリティ

- API キーは **ブラウザの localStorage** に保存されます
- サーバーには保存されません
- HTTP リクエストに自動送信されることはありません

## 📜 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](./LICENSE) をご覧ください。

## 🙏 謝辞

- [Anthropic](https://www.anthropic.com/) - Claude API
- [Vercel](https://vercel.com/) - Next.js & AI SDK
- すべてのコントリビューター

---

## 🚀 StartPack - Next.js スターターキット

<p align="center">
  <a href="https://startpack.shingoirie.com/">
    <img src="https://startpack.shingoirie.com/og-image.png" alt="StartPack" width="600">
  </a>
</p>

**Web サービスを高速に立ち上げたいですか？**

[StartPack](https://startpack.shingoirie.com/) は、SaaS、AI ツール、Web アプリを素早く Next.js で構築するためのスタートパックです。

✅ **認証** - ログイン・サインアップ実装済み  
✅ **決済** - Stripe 連携でサブスクリプション対応  
✅ **お問い合わせ** - フォーム機能を標準搭載  
✅ **データベース** - すぐに使える DB 設計

**👉 [startpack.shingoirie.com](https://startpack.shingoirie.com/)**

---

<p align="center">
  Made with ❤️ for Product Managers & Developers
</p>
