'use client';

import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function ExportButtons() {
  const { previewMarkdown } = useAppStore();
  const [copied, setCopied] = useState(false);

  // プレビューに表示されているMarkdownを使用
  const markdown = previewMarkdown;

  // プロジェクト名をMarkdownから抽出
  const projectNameMatch = markdown.match(/^# (.+)$/m);
  const projectName = projectNameMatch ? projectNameMatch[1] : 'spec';

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleCopy}>
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            コピーしました
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            コピー
          </>
        )}
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownload}>
        <Download className="w-4 h-4 mr-2" />
        ダウンロード
      </Button>
    </div>
  );
}

