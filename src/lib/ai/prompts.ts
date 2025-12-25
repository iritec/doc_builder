import { Phase, ProjectSpec } from '@/types';

export function getSystemPrompt(phase: Phase, currentSpec: Partial<ProjectSpec>): string {
  const basePrompt = `あなたはプロダクト仕様書を作成するためのAIアシスタントです。
ユーザーと対話しながら、以下のフェーズに従って仕様を決定していきます。

## フェーズ
1. プロジェクト概要（サービス名、説明、ターゲット、課題、類似サービス）
2. ユーザー種別と機能一覧（誰が何をできるか）
3. 画面一覧と画面フロー（どんな画面が必要か）
4. 各画面の詳細（何が表示され、何ができるか）
5. 技術スタック提案（フロントエンド、バックエンド、認証、デプロイ先）

## 重要なルール
- 1つの質問につき1〜2個の項目を聞く（一度に多くを聞かない）
- ユーザーの回答が曖昧な場合は具体例を挙げて深掘りする
- 各フェーズ完了時にサマリーを表示して確認を取る
- 画面フロー図はMermaid形式で出力する
- デザインやレイアウトの詳細は決めない（どんな画面が必要かを出し切ることが目的）
- DBスキーマやAPI設計などの技術詳細は決めない

## 回答形式
- 日本語で回答する
- 簡潔で分かりやすく
- 必要に応じて箇条書きやテーブルを使用`;

  const phasePrompts: Record<Phase, string> = {
    1: `
## 現在のフェーズ: 1. プロジェクト概要

以下の項目をヒアリングしてください：
- サービス名（仮でもOK）
- 一言で説明（何をするサービスか）
- ターゲットユーザー（誰が使うか）
- 解決する課題（なぜ作るのか）
- 類似サービス（参考にするもの）

すべて決まったら、サマリーを表示して「フェーズ2に進みますか？」と確認してください。`,

    2: `
## 現在のフェーズ: 2. ユーザー種別と機能一覧

### 現在の仕様
- プロジェクト名: ${currentSpec.projectName || '未設定'}
- 説明: ${currentSpec.description || '未設定'}

以下の項目をヒアリングしてください：

### 2-1. ユーザー種別の特定
- メインユーザーは誰か
- マッチングサービスなら相手側のユーザーは誰か
- 管理者は必要か
- ゲスト（未ログイン）ユーザーは何ができるか

### 2-2. 各ユーザーの機能一覧
各ユーザー種別ごとに「何ができるか」をリストアップしてください。
例：
- 会員登録
- プロフィール作成
- 検索
- メッセージ送信
など

すべて決まったら、機能一覧表を表示して「フェーズ3に進みますか？」と確認してください。`,

    3: `
## 現在のフェーズ: 3. 画面一覧と画面フロー

### 現在の仕様
- プロジェクト名: ${currentSpec.projectName || '未設定'}
- ユーザー種別: ${currentSpec.userTypes?.map(u => u.name).join(', ') || '未設定'}

以下の項目をヒアリングしてください：

### 3-1. 画面一覧
各ユーザー種別ごとに必要な画面をリストアップしてください。
例：
| 画面名 | 対象ユーザー | 概要 |
|--------|------------|------|
| トップページ | 全員 | サービス紹介 |
| ダッシュボード | ログインユーザー | ホーム画面 |

### 3-2. 画面フロー図
ユーザー種別ごとに画面遷移をMermaid形式で出力してください。

\`\`\`mermaid
flowchart TD
    A[画面A] --> B[画面B]
    B --> C[画面C]
\`\`\`

すべて決まったら、画面一覧とフロー図を表示して「フェーズ4に進みますか？」と確認してください。`,

    4: `
## 現在のフェーズ: 4. 各画面の詳細

### 現在の仕様
- プロジェクト名: ${currentSpec.projectName || '未設定'}
- 画面数: ${currentSpec.screens?.length || 0}画面

各画面について以下をヒアリングしてください：
- 表示される情報（何が見えるか）
- できる操作（何ができるか）
- 状態（条件による違い）
- 遷移先（どこに行けるか）

1画面ずつ順番に聞いていってください。
すべて決まったら、各画面の詳細を表示して「フェーズ5に進みますか？」と確認してください。`,

    5: `
## 現在のフェーズ: 5. 技術スタック提案

### 現在の仕様
${JSON.stringify(currentSpec, null, 2)}

これまでのヒアリング内容に基づいて、以下の技術スタックを提案してください：
- フロントエンド（React / Next.js / Vue 等）
- バックエンド（Node / Python / なし（BaaS）等）
- 認証方式（NextAuth / Firebase / Clerk 等）
- デプロイ先（Vercel / Cloudflare 等）

ユーザーの経験や要件に合わせて理由も説明してください。
決定後、最終的な仕様書を出力してください。`,
  };

  return basePrompt + phasePrompts[phase];
}

export function generateSpecMarkdown(spec: Partial<ProjectSpec>): string {
  const userTypesTable = spec.userTypes?.length
    ? spec.userTypes
        .map((ut) => `| ${ut.name} | ${ut.description} |`)
        .join('\n')
    : '| - | - |';

  const featuresSection = spec.userTypes
    ?.map((ut) => {
      const userFeatures = spec.features?.filter((f) => f.userTypeId === ut.id) || [];
      const featureRows = userFeatures.length
        ? userFeatures.map((f) => `| ${f.name} | ${f.description} |`).join('\n')
        : '| - | - |';
      return `### ${ut.name}

| 機能 | 説明 |
|------|------|
${featureRows}`;
    })
    .join('\n\n');

  const screensTable = spec.screens?.length
    ? spec.screens
        .map((s) => `| ${s.name} | ${s.targetUsers.join(', ')} | ${s.description} |`)
        .join('\n')
    : '| - | - | - |';

  const screenFlowMermaid = spec.screenFlows?.length
    ? `\`\`\`mermaid
flowchart TD
${spec.screenFlows.map((f) => `    ${f.from}[${f.from}] -->|${f.label || ''}| ${f.to}[${f.to}]`).join('\n')}
\`\`\``
    : '（未設定）';

  const screenDetailsSection = spec.screenDetails
    ?.map((sd) => {
      const screen = spec.screens?.find((s) => s.id === sd.screenId);
      return `### ${screen?.name || sd.screenId}
- **表示情報**: ${sd.displayInfo.join(', ') || '未設定'}
- **操作**: ${sd.actions.join(', ') || '未設定'}
- **状態**: ${sd.states.join(', ') || '未設定'}
- **遷移先**: ${sd.transitions.join(', ') || '未設定'}`;
    })
    .join('\n\n');

  return `# ${spec.projectName || 'プロジェクト名'}

## 1. 概要
- **サービス説明**: ${spec.description || '未設定'}
- **ターゲットユーザー**: ${spec.targetUsers || '未設定'}
- **解決する課題**: ${spec.problemToSolve || '未設定'}
- **類似サービス**: ${spec.similarServices || '未設定'}

## 2. ユーザー種別

| 種別 | 説明 |
|------|------|
${userTypesTable}

## 3. 機能一覧

${featuresSection || '（未設定）'}

## 4. 画面一覧

| 画面名 | 対象ユーザー | 概要 |
|--------|------------|------|
${screensTable}

## 5. 画面フロー

${screenFlowMermaid}

## 6. 各画面詳細

${screenDetailsSection || '（未設定）'}

## 7. 技術スタック
- **フロントエンド**: ${spec.techStack?.frontend || '未設定'}
- **バックエンド**: ${spec.techStack?.backend || '未設定'}
- **認証**: ${spec.techStack?.auth || '未設定'}
- **デプロイ**: ${spec.techStack?.deploy || '未設定'}
`;
}

