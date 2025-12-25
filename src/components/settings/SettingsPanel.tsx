'use client';

import { useAppStore } from '@/store/useAppStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ApiKeyInput } from './ApiKeyInput';
import { Settings, Trash2, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function SettingsPanel() {
  const { settings, updateSettings, clearMessages, resetSpec } = useAppStore();

  const handleReset = () => {
    if (confirm('チャット履歴、仕様書、APIキーをすべてリセットしますか？')) {
      clearMessages();
      resetSpec();
      updateSettings({ claudeApiKey: '' });
    }
  };

  const handleClearApiKey = () => {
    if (confirm('APIキーを削除しますか？再度入力が必要になります。')) {
      updateSettings({ claudeApiKey: '' });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Claude APIキー</span>
              {settings.claudeApiKey && (
                <span className="text-xs text-muted-foreground">設定済み ✓</span>
              )}
            </div>

            <ApiKeyInput
              label=""
              value={settings.claudeApiKey}
              onChange={(value) => updateSettings({ claudeApiKey: value })}
              placeholder="sk-ant-..."
            />

            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>セキュリティについて:</strong></p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>APIキーはこのブラウザにのみ保存されます</li>
                  <li>サーバーには送信されません</li>
                  <li>共有PCでは下のボタンで削除してください</li>
                </ul>
              </div>
            </div>

            {settings.claudeApiKey && (
              <Button
                variant="outline"
                onClick={handleClearApiKey}
                className="w-full"
              >
                APIキーを削除
              </Button>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <label className="text-sm font-medium">データ管理</label>
            <Button
              variant="destructive"
              onClick={handleReset}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              すべてリセット（APIキー含む）
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
