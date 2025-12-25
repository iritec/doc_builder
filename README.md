# 📋 Spec Builder - AI 仕様書ビルダー

<p align="center">
  <strong>AIと対話しながらプロダクト仕様書を作成するツール</strong>
</p>

<p align="center">
  <a href="#特徴">特徴</a> •
  <a href="#デモ">デモ</a> •
  <a href="#クイックスタート">クイックスタート</a> •
  <a href="#使い方">使い方</a> •
  <a href="#技術スタック">技術スタック</a> •
  <a href="#貢献">貢献</a>
</p>

---

## 概要

**Spec Builder** は、AI アシスタントと対話しながらプロダクトの仕様書を段階的に作成できる Web アプリケーションです。

新しいプロダクトのアイデアがあるけど、仕様書を書くのが面倒... そんな時に、AI と壁打ちしながら自然に仕様を固めていくことができます。

## ✨ 特徴

- 🤖 **マルチ AI 対応** - Claude (Anthropic) と Gemini (Google) から選択可能
- 📝 **5 フェーズの構造化ヒアリング** - プロジェクト概要から技術スタックまで段階的に整理
- 👀 **リアルタイムプレビュー** - チャット内容がリアルタイムで仕様書に反映
- 📊 **Mermaid フロー図対応** - 画面遷移図を自動生成・表示
- 📤 **エクスポート機能** - Markdown ファイルとしてダウンロード・コピー可能
- 🔐 **API キーの選択** - サービス提供の API キーまたは自分の API キーを使用可能

## 📸 デモ

![Spec Builder Demo](https://via.placeholder.com/800x400?text=Spec+Builder+Demo)

_※ 実際のスクリーンショットに置き換えてください_

## 🚀 クイックスタート

### 前提条件

- Node.js 18.x 以上
- npm または yarn または pnpm

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-username/spec-builder.git
cd spec-builder

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local
```

### 環境変数の設定

`.env.local` を編集して、API キーを設定してください：

```bash
# Anthropic Claude API Key
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Google Gemini API Key
GOOGLE_GENERATIVE_AI_API_KEY=xxxxx
```

> **Note**: API キーは以下から取得できます：
>
> - Claude: https://console.anthropic.com/
> - Gemini: https://aistudio.google.com/apikey

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### 本番ビルド

```bash
npm run build
npm start
```

## 📖 使い方

### 5 つのフェーズ

Spec Builder は、以下の 5 つのフェーズで仕様書を作成していきます：

| フェーズ | 内容                   | 決めること                                       |
| -------- | ---------------------- | ------------------------------------------------ |
| 1        | プロジェクト概要       | サービス名、説明、ターゲット、課題、類似サービス |
| 2        | ユーザー種別と機能一覧 | 誰が使うか、何ができるか                         |
| 3        | 画面一覧と画面フロー   | どんな画面が必要か、画面遷移                     |
| 4        | 各画面の詳細           | 何が表示され、何ができるか                       |
| 5        | 技術スタック提案       | フロントエンド、バックエンド、認証、デプロイ先   |

### 基本的な流れ

1. **AI プロバイダーを選択** - ヘッダーのドロップダウンから Claude または Gemini を選択
2. **チャットを開始** - 左側のチャットエリアで AI と対話を開始
3. **質問に回答** - AI からの質問に答えていく
4. **プレビューを確認** - 右側のプレビューエリアでリアルタイムに仕様書を確認
5. **エクスポート** - 完成した仕様書を Markdown でダウンロード

### 設定

右上の設定ボタンから以下の設定が可能です：

- **API キーの入力** - 自分の API キーを使用する場合
- **サービスキーの使用** - 環境変数で設定された API キーを使用

## 🛠 技術スタック

- **フレームワーク**: [Next.js 16](https://nextjs.org/) (App Router)
- **言語**: TypeScript
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/)
- **UI コンポーネント**: [Radix UI](https://www.radix-ui.com/)
- **状態管理**: [Zustand](https://zustand-demo.pmnd.rs/)
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **図表**: [Mermaid](https://mermaid.js.org/)
- **Markdown レンダリング**: react-markdown + remark-gfm

## 📁 プロジェクト構成

```
spec-builder/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/          # チャットAPI（ストリーミング対応）
│   │   │   └── preview/       # プレビューAPI
│   │   ├── page.tsx           # メインページ
│   │   └── layout.tsx         # レイアウト
│   ├── components/
│   │   ├── chat/              # チャット関連コンポーネント
│   │   ├── preview/           # プレビュー関連コンポーネント
│   │   ├── settings/          # 設定関連コンポーネント
│   │   └── ui/                # 共通UIコンポーネント
│   ├── lib/
│   │   └── ai/                # AI関連ユーティリティ
│   ├── store/                 # Zustandストア
│   └── types/                 # TypeScript型定義
├── public/                    # 静的ファイル
└── package.json
```

## 🤝 貢献

貢献を歓迎します！詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) をご覧ください。

### 開発に参加する

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### Issue

バグ報告や機能リクエストは [Issues](https://github.com/your-username/spec-builder/issues) からお願いします。

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
