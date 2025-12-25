export type AIProvider = 'claude';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UserType {
  id: string;
  name: string;
  description: string;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  userTypeId: string;
}

export interface Screen {
  id: string;
  name: string;
  targetUsers: string[];
  description: string;
}

export interface ScreenFlow {
  from: string;
  to: string;
  label?: string;
}

export interface ScreenDetail {
  screenId: string;
  displayInfo: string[];
  actions: string[];
  states: string[];
  transitions: string[];
}

export interface TechStack {
  frontend: string;
  backend: string;
  auth: string;
  deploy: string;
}

export interface ProjectSpec {
  // フェーズ1: プロジェクト概要
  projectName: string;
  description: string;
  targetUsers: string;
  problemToSolve: string;
  similarServices: string;
  
  // フェーズ2: ユーザー種別と機能一覧
  userTypes: UserType[];
  features: Feature[];
  
  // フェーズ3: 画面一覧と画面フロー
  screens: Screen[];
  screenFlows: ScreenFlow[];
  
  // フェーズ4: 各画面の詳細
  screenDetails: ScreenDetail[];
  
  // フェーズ5: 技術スタック
  techStack: TechStack;
}

export interface AppSettings {
  provider: AIProvider;
  claudeApiKey: string;
  geminiApiKey: string;
  useServiceKey: boolean;
}

export type Phase = 1 | 2 | 3 | 4 | 5;

export interface AppState {
  // チャット
  messages: Message[];
  isLoading: boolean;
  
  // 設定
  settings: AppSettings;
  
  // 仕様書
  spec: Partial<ProjectSpec>;
  currentPhase: Phase;
  previewMarkdown: string;
  previewMarkdownEn: string;
  
  // アクション
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, content: string) => void;
  deleteMessagesAfter: (id: string) => void;
  setLoading: (loading: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateSpec: (spec: Partial<ProjectSpec>) => void;
  setPhase: (phase: Phase) => void;
  setPreviewMarkdown: (markdown: string) => void;
  setPreviewMarkdownEn: (markdown: string) => void;
  clearMessages: () => void;
  resetSpec: () => void;
}

