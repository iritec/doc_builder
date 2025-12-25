'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, AlertTriangle, ExternalLink } from 'lucide-react';

export function ApiKeyModal() {
  const { settings, updateSettings, _hasHydrated } = useAppStore();
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // ハイドレーション完了後、APIキーが未設定の場合にモーダルを表示
    if (_hasHydrated && !settings.claudeApiKey) {
      setOpen(true);
    }
  }, [_hasHydrated, settings.claudeApiKey]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('APIキーを入力してください');
      return;
    }
    if (!apiKey.startsWith('sk-ant-')) {
      setError('有効なClaude APIキーを入力してください（sk-ant-で始まる）');
      return;
    }
    
    updateSettings({ 
      claudeApiKey: apiKey,
      useServiceKey: false 
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className="sm:max-w-[500px]" 
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🔑 Claude APIキーを設定
          </DialogTitle>
          <DialogDescription>
            このアプリを使用するには、Claude APIキーが必要です
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Claude API Key</label>
            <div className="flex gap-2">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError('');
                }}
                placeholder="sk-ant-api03-..."
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowKey(!showKey)}
                type="button"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>セキュリティについて:</strong></p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>APIキーはこのブラウザにのみ保存されます</li>
                <li>サーバーには送信されません</li>
                <li>共有PCでは使用後に設定から削除してください</li>
              </ul>
            </div>
          </div>

          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Claude APIキーを取得する
          </a>

          <Button onClick={handleSave} className="w-full">
            保存して始める
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

