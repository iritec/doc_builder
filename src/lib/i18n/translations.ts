export type Locale = 'ja' | 'en';

export const translations = {
  ja: {
    // Layout metadata
    title: 'DocBuilder | AI壁打ちで仕様書を作成',
    description:
      'Claude Opus 4と対話しながらプロダクトの仕様書を段階的に作成できるツール。5フェーズの構造化ヒアリングで、プロジェクト概要から技術スタックまで漏れなく整理します。',
    keywords: ['仕様書', 'AI', 'Claude', '仕様書作成', 'プロダクト開発', '要件定義', 'ドキュメント'],
    author: '入江慎吾',
    shortDescription:
      'Claude Opus 4と対話しながらプロダクトの仕様書を段階的に作成できるツール。',

    // Promotions
    promotions: [
      {
        id: 'startpack',
        message: 'Next.jsでWebサービスを高速に立ち上げるなら',
        name: 'StartPack',
        url: 'https://startpack.shingoirie.com/',
      },
      {
        id: 'pocketcorder',
        message: '開発を、ポケットに。スマホで自宅のPCをリモート操作',
        name: 'PocketCorder',
        url: 'https://pc.shingoirie.com/',
      },
      {
        id: 'solo',
        message: '自分の活動をまとめよう。プロフィール作成サービス',
        name: 'SOLO',
        url: 'https://solo.onl/',
      },
      {
        id: 'lofi',
        message: 'いつもの机を、最高の集中空間に。作業用アプリ',
        name: 'Lofi Desk',
        url: 'https://lofi.shingoirie.com/',
      },
    ],

    // Page / Navigation
    appName: 'DocBuilder',
    chat: 'チャット',
    preview: 'プレビュー',

    // Chat Container
    chatWithAI: 'AIと壁打ち',
    newProject: '新規プロジェクト',
    resetConfirm: '会話履歴とプレビューをすべてリセットします。よろしいですか？',
    errorMessage: 'エラーが発生しました。設定を確認してもう一度お試しください。',

    // Phase labels
    phaseLabels: {
      1: 'プロジェクト概要',
      2: 'ユーザー種別と機能一覧',
      3: '画面一覧と画面フロー',
      4: '各画面の詳細',
      5: '技術スタック提案',
    },
    phase: 'フェーズ',

    // Message List
    startCreatingSpec: '仕様書作成を始めましょう',
    tellAboutService: '作りたいサービスについて教えてください',
    editMessage: 'メッセージを編集...',
    save: '保存',
    cancel: 'キャンセル',
    editAndResend: '編集して再送信',

    // Input Form
    inputPlaceholder: 'メッセージを入力... (Ctrl+EnterまたはShift+Enterで送信)',

    // Spec Preview
    regenerate: '再生成',
    generatingSpec: '仕様書を生成中...',
    screenFlow: '画面フロー',

    // Export Buttons
    copy: 'コピー',
    copied: 'コピーしました',
    download: 'ダウンロード',

    // Settings Panel
    settings: '設定',
    claudeApiKey: 'Claude APIキー',
    configured: '設定済み ✓',
    securityNote: 'セキュリティについて:',
    securityItems: [
      'APIキーはこのブラウザにのみ保存されます',
      'サーバーには送信されません',
      '共有PCでは下のボタンで削除してください',
    ],
    deleteApiKey: 'APIキーを削除',
    deleteApiKeyConfirm: 'APIキーを削除しますか？再度入力が必要になります。',
    dataManagement: 'データ管理',
    resetAll: 'すべてリセット（APIキー含む）',
    resetAllConfirm: 'チャット履歴、仕様書、APIキーをすべてリセットしますか？',

    // API Key Modal
    setApiKey: 'Claude APIキーを設定',
    apiKeyRequired: 'このアプリを使用するには、Claude APIキーが必要です',
    enterApiKey: 'APIキーを入力してください',
    invalidApiKey: '有効なClaude APIキーを入力してください（sk-ant-で始まる）',
    securityItemsModal: [
      'APIキーはこのブラウザにのみ保存されます',
      'サーバーには送信されません',
      '共有PCでは使用後に設定から削除してください',
    ],
    getApiKey: 'Claude APIキーを取得する',
    saveAndStart: '保存して始める',
  },
  en: {
    // Layout metadata
    title: 'DocBuilder | Create Specifications with AI',
    description:
      'A tool to progressively create product specifications through dialogue with Claude Opus 4. Organize everything from project overview to tech stack through 5-phase structured interviews.',
    keywords: [
      'specifications',
      'AI',
      'Claude',
      'spec creation',
      'product development',
      'requirements',
      'documentation',
    ],
    author: 'Shingo Irie',
    shortDescription:
      'A tool to progressively create product specifications through dialogue with Claude Opus 4.',

    // Promotions
    promotions: [
      {
        id: 'startpack',
        message: 'Launch your web service fast with Next.js',
        name: 'StartPack',
        url: 'https://startpack.shingoirie.com/',
      },
      {
        id: 'pocketcorder',
        message: 'Development in your pocket. Remote control your PC from your phone',
        name: 'PocketCorder',
        url: 'https://pc.shingoirie.com/',
      },
      {
        id: 'solo',
        message: 'Organize your activities. Profile creation service',
        name: 'SOLO',
        url: 'https://solo.onl/',
      },
      {
        id: 'lofi',
        message: 'Turn your desk into the perfect focus space. Work app',
        name: 'Lofi Desk',
        url: 'https://lofi.shingoirie.com/',
      },
    ],

    // Page / Navigation
    appName: 'DocBuilder',
    chat: 'Chat',
    preview: 'Preview',

    // Chat Container
    chatWithAI: 'Brainstorm with AI',
    newProject: 'New Project',
    resetConfirm: 'Reset all conversation history and preview. Are you sure?',
    errorMessage: 'An error occurred. Please check your settings and try again.',

    // Phase labels
    phaseLabels: {
      1: 'Project Overview',
      2: 'User Types & Features',
      3: 'Screen List & Flow',
      4: 'Screen Details',
      5: 'Tech Stack Proposal',
    },
    phase: 'Phase',

    // Message List
    startCreatingSpec: "Let's start creating specifications",
    tellAboutService: 'Tell me about the service you want to build',
    editMessage: 'Edit message...',
    save: 'Save',
    cancel: 'Cancel',
    editAndResend: 'Edit and resend',

    // Input Form
    inputPlaceholder: 'Type a message... (Ctrl+Enter or Shift+Enter to send)',

    // Spec Preview
    regenerate: 'Regenerate',
    generatingSpec: 'Generating specification...',
    screenFlow: 'Screen Flow',

    // Export Buttons
    copy: 'Copy',
    copied: 'Copied',
    download: 'Download',

    // Settings Panel
    settings: 'Settings',
    claudeApiKey: 'Claude API Key',
    configured: 'Configured ✓',
    securityNote: 'Security Note:',
    securityItems: [
      'API key is stored only in this browser',
      'Not sent to the server',
      'Delete using the button below on shared PCs',
    ],
    deleteApiKey: 'Delete API Key',
    deleteApiKeyConfirm: 'Delete API key? You will need to enter it again.',
    dataManagement: 'Data Management',
    resetAll: 'Reset All (including API key)',
    resetAllConfirm: 'Reset all chat history, specifications, and API key?',

    // API Key Modal
    setApiKey: 'Set Claude API Key',
    apiKeyRequired: 'A Claude API key is required to use this app',
    enterApiKey: 'Please enter your API key',
    invalidApiKey: 'Please enter a valid Claude API key (starts with sk-ant-)',
    securityItemsModal: [
      'API key is stored only in this browser',
      'Not sent to the server',
      'Delete from settings after use on shared PCs',
    ],
    getApiKey: 'Get Claude API Key',
    saveAndStart: 'Save and Start',
  },
};

export type Translations = (typeof translations)['ja'];

export function getTranslations(locale: Locale): Translations {
  return translations[locale] as Translations;
}

