'use client';

import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function ExportButtonsEN() {
  const { previewMarkdownEn } = useAppStore();
  const [copied, setCopied] = useState(false);

  const markdown = previewMarkdownEn;

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
    <div className="flex gap-1 sm:gap-2">
      <Button variant="outline" size="icon-sm" onClick={handleCopy} className="sm:hidden">
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
      <Button variant="outline" size="sm" onClick={handleCopy} className="hidden sm:inline-flex">
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Copied
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </>
        )}
      </Button>
      <Button variant="outline" size="icon-sm" onClick={handleDownload} className="sm:hidden">
        <Download className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="hidden sm:inline-flex"
      >
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>
    </div>
  );
}

