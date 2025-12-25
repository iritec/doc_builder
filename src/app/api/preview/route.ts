import { generateText } from 'ai';
import { getAIProvider } from '@/lib/ai/providers';

export const maxDuration = 60;

// セクション名の定義（日本語）
const SECTIONS_JA = [
  '1. 概要',
  '2. ユーザー種別',
  '3. 機能一覧',
  '4. 画面一覧',
  '5. 画面フロー',
  '6. 各画面詳細',
  '7. 技術スタック',
  '8. 決定事項・補足情報',
];

// Section names (English)
const SECTIONS_EN = [
  '1. Overview',
  '2. User Types',
  '3. Features',
  '4. Screen List',
  '5. Screen Flow',
  '6. Screen Details',
  '7. Tech Stack',
  '8. Decisions & Notes',
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
function buildMarkdown(sections: Map<string, string>, locale: string = 'ja'): string {
  const SECTIONS = locale === 'en' ? SECTIONS_EN : SECTIONS_JA;
  const defaultProjectName = locale === 'en' ? '# Project Name' : '# プロジェクト名';
  const projectName = sections.get('projectName') || defaultProjectName;
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
      locale = 'ja',
    }: {
      messages: { role: 'user' | 'assistant'; content: string }[];
      currentMarkdown?: string;
      apiKey?: string;
      locale?: 'ja' | 'en';
    } = body;

    const model = getAIProvider(apiKey);
    const SECTIONS = locale === 'en' ? SECTIONS_EN : SECTIONS_JA;

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
    const userLabel = locale === 'en' ? 'User' : 'ユーザー';
    const aiLabel = locale === 'en' ? 'AI' : 'AI';
    const conversationForAI = filteredMessages
      .map((m) => `【${m.role === 'user' ? userLabel : aiLabel}】\n${m.content.trim()}`)
      .join('\n\n---\n\n');

    // 差分更新モード（既存のMarkdownがある場合）
    if (currentMarkdown && currentMarkdown.trim().length > 100) {
      const diffPromptJa = `あなたは仕様書更新AIです。既存の仕様書と新しい会話を比較し、更新が必要なセクションのみを出力してください。

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

      const diffPromptEn = `You are a specification update AI. Compare the existing specification with the new conversation and output only the sections that need to be updated.

【Important Rules】
- Output only sections that have changes
- Each section should start with "## Section Name"
- Do not output sections without changes
- Output only Markdown, no explanations needed
- If the project name is confirmed, also output "# Project Name"
- For "8. Decisions & Notes" section, organize extracted decisions and requirements as bullet points (no raw conversation logs)

【Section List】
${SECTIONS.map(s => `- ${s}`).join('\n')}

【How to write "5. Screen Flow" - Important】
If there is information about screen list or screen transitions, always output a screen flow diagram in Mermaid format:
\`\`\`mermaid
graph TD
    A[Top Page] --> B[Login]
    B --> C[Dashboard]
    C --> D[Detail Screen]
\`\`\`
* Even if screen information is "Not set", update it if screens can be identified from the conversation.

【How to write "8. Decisions & Notes"】
List the following content extracted from the conversation as bullet points:
- Items explicitly decided/confirmed by the user
- Important constraints or business rules
- Supplementary information to note during development
- Information about priorities or importance
- Future expansion plans

【Current Specification】
${currentMarkdown}

【Latest Conversation History】
${conversationForAI}

Output only the sections that need to be changed in Markdown format.`;

      const diffPrompt = locale === 'en' ? diffPromptEn : diffPromptJa;

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
      
      const mergedMarkdown = buildMarkdown(currentSections, locale);
      
      return new Response(
        JSON.stringify({ markdown: mergedMarkdown, isDiff: true }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // 初回生成モード
    const initialPromptJa = `あなたは仕様書生成AIです。会話履歴を分析し、プロダクト仕様書をMarkdown形式で出力してください。

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

    const initialPromptEn = `You are a specification generation AI. Analyze the conversation history and output a product specification in Markdown format.

【Important Rules】
- Output only the specification Markdown
- No greetings, explanations, or questions
- Include only information confirmed from the conversation
- Mark items not yet discussed as "Not set"
- For "8. Decisions & Notes", organize extracted decisions as bullet points, not raw conversation logs

【Output Format】

# [Project Name / Service Name]

## 1. Overview
- **Service Description**: [Extract from conversation]
- **Target Users**: [Extract from conversation]
- **Problem to Solve**: [Extract from conversation]
- **Similar Services**: [Extract from conversation]

## 2. User Types

| Type | Description |
|------|-------------|
| [Type] | [Description] |

## 3. Features

### What [User Type] can do
| Feature | Description |
|---------|-------------|
| [Feature] | [Description] |

## 4. Screen List

| Screen Name | Target Users | Overview |
|-------------|-------------|----------|
| [Screen Name] | [Target] | [Overview] |

## 5. Screen Flow

【Important】If screens exist in the screen list, always output a flow diagram in Mermaid format.
\`\`\`mermaid
graph TD
    A[Top Page] --> B[Login]
    B --> C[Dashboard]
    C --> D[Detail Screen]
\`\`\`
* Add subgraphs and screen nodes after graph TD, and express transitions between screens with arrows.

## 6. Screen Details

### [Screen Name]
- **Displayed Information**: [Information]
- **Actions**: [Actions]
- **Transitions**: [Transitions]

## 7. Tech Stack
- **Frontend**: [Technology]
- **Backend**: [Technology]
- **Database**: [Technology]
- **Authentication**: [Technology]
- **Deployment**: [Technology]

## 8. Decisions & Notes

List the following as bullet points:
- Items explicitly decided/confirmed by the user
- Important constraints or business rules
- Supplementary information to note during development
- Information about priorities or importance
- Future expansion plans

【Conversation History】
${conversationForAI}

Generate the specification according to the format above.`;

    const initialPrompt = locale === 'en' ? initialPromptEn : initialPromptJa;

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
