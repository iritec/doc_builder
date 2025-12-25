'use client';

import { ChatContainer } from '@/components/chat';
import { SpecPreview, ExportButtons } from '@/components/preview';
import { SettingsPanel, ApiKeyModal } from '@/components/settings';
import { FileCode2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      {/* APIキー入力モーダル */}
      <ApiKeyModal />

      {/* Header */}
      <header className="border-b bg-background">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <FileCode2 className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">仕様書ビルダー</h1>
          </div>
          <div className="flex items-center gap-2">
            <ExportButtons />
            <SettingsPanel />
          </div>
        </div>
      </header>

      {/* Main Content - 2 Column Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Chat */}
        <div className="w-1/2 border-r flex flex-col">
          <ChatContainer />
        </div>

        {/* Right: Preview */}
        <div className="w-1/2 flex flex-col">
          <SpecPreview />
        </div>
      </main>
    </div>
  );
}
