import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Message, AppSettings, ProjectSpec, Phase } from '@/types';

const initialSettings: AppSettings = {
  provider: 'claude',
  claudeApiKey: '',
  geminiApiKey: '',
  useServiceKey: false,
};

const initialSpec: Partial<ProjectSpec> = {
  projectName: '',
  description: '',
  targetUsers: '',
  problemToSolve: '',
  similarServices: '',
  userTypes: [],
  features: [],
  screens: [],
  screenFlows: [],
  screenDetails: [],
  techStack: {
    frontend: '',
    backend: '',
    auth: '',
    deploy: '',
  },
};

const INITIAL_PREVIEW_MARKDOWN = `# プロジェクト名

## 1. 概要
- **サービス説明**: 未設定
- **ターゲットユーザー**: 未設定
- **解決する課題**: 未設定
- **類似サービス**: 未設定

## 2. ユーザー種別

| 種別 | 説明 |
|------|------|
| - | - |

## 3. 機能一覧

（未設定）

## 4. 画面一覧

| 画面名 | 対象ユーザー | 概要 |
|--------|------------|------|
| - | - | - |

## 5. 画面フロー

（未設定）

## 6. 各画面詳細

（未設定）

## 7. 技術スタック
- **フロントエンド**: 未設定
- **バックエンド**: 未設定
- **認証**: 未設定
- **デプロイ**: 未設定

## 8. 決定事項・補足情報

（まだ決定事項がありません）
`;

export const useAppStore = create<AppState & { _hasHydrated: boolean; setHasHydrated: (state: boolean) => void }>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      settings: initialSettings,
      spec: initialSpec,
      currentPhase: 1,
      previewMarkdown: INITIAL_PREVIEW_MARKDOWN,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: crypto.randomUUID(),
              timestamp: new Date(),
            },
          ],
        })),

      updateMessage: (id, content) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, content } : msg
          ),
        })),

      deleteMessagesAfter: (id) =>
        set((state) => {
          const index = state.messages.findIndex((m) => m.id === id);
          if (index === -1) return state;
          // 指定したIDのメッセージを含めて、その後のメッセージを削除
          return {
            messages: state.messages.slice(0, index + 1),
          };
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      updateSpec: (newSpec) =>
        set((state) => ({
          spec: { ...state.spec, ...newSpec },
        })),

      setPhase: (phase) => set({ currentPhase: phase }),

      setPreviewMarkdown: (markdown) => set({ previewMarkdown: markdown }),

      clearMessages: () => set({ messages: [] }),

      resetSpec: () => set({ spec: initialSpec, currentPhase: 1, previewMarkdown: INITIAL_PREVIEW_MARKDOWN }),
    }),
    {
      name: 'spec-builder-storage',
      partialize: (state) => ({
        settings: state.settings,
        spec: state.spec,
        messages: state.messages,
        currentPhase: state.currentPhase,
        previewMarkdown: state.previewMarkdown,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

