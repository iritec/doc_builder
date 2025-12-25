import { generateText } from 'ai';
import { getAIProvider } from '@/lib/ai/providers';

export const maxDuration = 60;

// セクション名の定義
const SECTIONS = [
  '1. 概要',
  '2. ユーザー種別',
  '3. 機能一覧',
  '4. 画面一覧',
  '5. 画面フロー',
  '6. 各画面詳細',
  '7. 技術スタック',
  '8. 決定事項・補足情報',
];

// Markdownをセクションごとに分割
function parseMarkdownSections(markdown: string): Map<string, string> {
  const sections = new Map<string, string>();
  const lines = markdown.split('\n');
  let currentSection = '';
  let currentContent: string[] = [];
  let projectName = '';

  for (const line of lines) {
    // プロジェクト名（h1）
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      projectName = line;
      continue;
    }
    
    // セクションヘッダー（h2）
    const sectionMatch = line.match(/^## (\d+\. .+)$/);
    if (sectionMatch) {
      if (currentSection) {
        sections.set(currentSection, currentContent.join('\n').trim());
      }
      currentSection = sectionMatch[1];
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }
  
  if (currentSection) {
    sections.set(currentSection, currentContent.join('\n').trim());
  }
  
  if (projectName) {
    sections.set('projectName', projectName);
  }
  
  return sections;
}

// セクションを結合してMarkdownを生成
function buildMarkdown(sections: Map<string, string>): string {
  const projectName = sections.get('projectName') || '# プロジェクト名';
  let markdown = projectName + '\n\n';
  
  for (const sectionName of SECTIONS) {
    const content = sections.get(sectionName);
    if (content) {
      markdown += `## ${sectionName}\n\n${content}\n\n`;
    }
  }
  
  return markdown.trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      messages,
      currentMarkdown,
      apiKey,
    }: {
      messages: { role: 'user' | 'assistant'; content: string }[];
      currentMarkdown?: string;
      apiKey?: string;
    } = body;

    const model = getAIProvider(apiKey);

    // 空のメッセージをフィルタリング
    const filteredMessages = messages
      .filter((m) => m.content && m.content.trim().length > 0);

    if (filteredMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid messages provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 会話履歴をAIに渡す形式に整形
    const conversationForAI = filteredMessages
      .map((m) => `【${m.role === 'user' ? 'ユーザー' : 'AI'}】\n${m.content.trim()}`)
      .join('\n\n---\n\n');

    // 差分更新モード（既存のMarkdownがある場合）
    if (currentMarkdown && currentMarkdown.trim().length > 100) {
      const diffPrompt = `あなたは仕様書更新AIです。既存の仕様書と新しい会話を比較し、更新が必要なセクションのみを出力してください。

【重要ルール】
- 変更があるセクションのみを出力してください
- 各セクションは「## セクション名」から始めてください
- 変更がないセクションは出力しないでください
- Markdownのみを出力し、説明は不要です
- プロジェクト名が確定している場合は「# プロジェクト名」も出力してください
- 「8. 決定事項・補足情報」セクションは、会話から抽出した決定事項・要件を箇条書きで整理してください（会話ログそのままは不要）

【セクション一覧】
${SECTIONS.map(s => `- ${s}`).join('\n')}

【「5. 画面フロー」の書き方 - 重要】
画面一覧や画面遷移に関する情報がある場合、必ずMermaid形式で画面フロー図を出力してください：
\`\`\`mermaid
graph TD
    A[トップページ] --> B[ログイン]
    B --> C[ダッシュボード]
    C --> D[詳細画面]
\`\`\`
※画面情報が「（未設定）」のままになっている場合でも、会話から画面が特定できれば必ず更新してください。

【「8. 決定事項・補足情報」の書き方】
会話から抽出した以下の内容を箇条書きで記載：
- ユーザーが明示的に決定・確定した事項
- 重要な制約条件やビジネスルール
- 開発時に注意すべき補足情報
- 優先度や重要度に関する情報
- 将来的な拡張予定

【現在の仕様書】
${currentMarkdown}

【最新の会話履歴】
${conversationForAI}

変更が必要なセクションのみをMarkdown形式で出力してください。`;

      const result = await generateText({
        model,
        messages: [
          {
            role: 'user' as const,
            content: diffPrompt,
          },
        ],
      });

      // 差分をマージ
      const currentSections = parseMarkdownSections(currentMarkdown);
      const diffSections = parseMarkdownSections(result.text);
      
      // 差分を適用
      for (const [key, value] of diffSections) {
        if (value && value.trim().length > 0) {
          currentSections.set(key, value);
        }
      }
      
      const mergedMarkdown = buildMarkdown(currentSections);
      
      return new Response(
        JSON.stringify({ markdown: mergedMarkdown, isDiff: true }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // 初回生成モード
    const initialPrompt = `あなたは仕様書生成AIです。会話履歴を分析し、プロダクト仕様書をMarkdown形式で出力してください。

【重要ルール】
- 仕様書のMarkdownのみを出力してください
- 挨拶、説明、質問は一切不要です
- 会話から確定した情報のみを記載してください
- まだ議論されていない項目は「未設定」と記載してください
- 「8. 決定事項・補足情報」は会話ログではなく、抽出した決定事項を箇条書きで整理してください

【出力フォーマット】

# [プロジェクト名/サービス名]

## 1. 概要
- **サービス説明**: [会話から抽出]
- **ターゲットユーザー**: [会話から抽出]
- **解決する課題**: [会話から抽出]
- **類似サービス**: [会話から抽出]

## 2. ユーザー種別

| 種別 | 説明 |
|------|------|
| [種別] | [説明] |

## 3. 機能一覧

### [ユーザー種別]ができること
| 機能 | 説明 |
|------|------|
| [機能] | [説明] |

## 4. 画面一覧

| 画面名 | 対象ユーザー | 概要 |
|--------|------------|------|
| [画面名] | [対象] | [概要] |

## 5. 画面フロー

【重要】画面一覧に画面が存在する場合、必ずMermaid形式でフロー図を出力してください。
\`\`\`mermaid
graph TD
    A[トップページ] --> B[ログイン]
    B --> C[ダッシュボード]
    C --> D[詳細画面]
\`\`\`
※graph TDの後にサブグラフや画面ノードを追加し、画面間の遷移を矢印で表現してください。

## 6. 各画面詳細

### [画面名]
- **表示情報**: [情報]
- **操作**: [操作]
- **遷移先**: [遷移先]

## 7. 技術スタック
- **フロントエンド**: [技術]
- **バックエンド**: [技術]
- **データベース**: [技術]
- **認証**: [技術]
- **デプロイ**: [技術]

## 8. 決定事項・補足情報

以下を箇条書きで記載：
- ユーザーが明示的に決定・確定した事項
- 重要な制約条件やビジネスルール
- 開発時に注意すべき補足情報
- 優先度や重要度に関する情報
- 将来的な拡張予定

【会話履歴】
${conversationForAI}

上記フォーマットに従い、仕様書を生成してください。`;

    const result = await generateText({
      model,
      messages: [
        {
          role: 'user' as const,
          content: initialPrompt,
        },
      ],
    });

    const markdown = result.text;

    return new Response(
      JSON.stringify({ markdown, isDiff: false }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Preview API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate preview' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
