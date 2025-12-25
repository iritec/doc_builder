'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { FlowDiagram } from './FlowDiagram';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Components } from 'react-markdown';

export function SpecPreviewEN() {
  const { messages, settings, previewMarkdownEn, setPreviewMarkdownEn, isLoading } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const lastMessageCountRef = useRef(0);
  const markdownRef = useRef(previewMarkdownEn);
  const prevIsLoadingRef = useRef(isLoading);

  useEffect(() => {
    markdownRef.current = previewMarkdownEn;
  }, [previewMarkdownEn]);

  const generatePreview = useCallback(
    async (forceFullGenerate = false) => {
      if (messages.length === 0) return;

      setIsGenerating(true);
      try {
        const apiKey = settings.useServiceKey
          ? undefined
          : settings.provider === 'claude'
            ? settings.claudeApiKey
            : settings.geminiApiKey;

        const response = await fetch('/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messages
              .filter((m) => m.content && m.content.trim().length > 0)
              .map((m) => ({
                role: m.role,
                content: m.content.trim(),
              })),
            currentMarkdown: forceFullGenerate ? undefined : markdownRef.current,
            provider: settings.provider,
            apiKey,
            locale: 'en',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate preview');
        }

        const data = await response.json();
        if (data.markdown) {
          setPreviewMarkdownEn(data.markdown);
        }
      } catch (error) {
        console.error('Error generating preview:', error);
      } finally {
        setIsGenerating(false);
      }
    },
    [messages, settings, setPreviewMarkdownEn]
  );

  useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading && messages.length > 0) {
      const timer = setTimeout(() => {
        generatePreview(false);
      }, 500);

      prevIsLoadingRef.current = isLoading;
      return () => clearTimeout(timer);
    }

    prevIsLoadingRef.current = isLoading;
  }, [isLoading, messages.length, generatePreview]);

  useEffect(() => {
    if (messages.length === 0) return;
    if (messages.length === lastMessageCountRef.current) return;

    lastMessageCountRef.current = messages.length;
  }, [messages]);

  const handleForceRegenerate = () => {
    generatePreview(true);
  };

  const markdownComponents: Components = {
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';

      if (language === 'mermaid') {
        const chartCode = String(children).replace(/\n$/, '');
        return (
          <div className="my-4 border rounded-lg overflow-hidden not-prose">
            <div className="bg-muted px-4 py-2 text-sm font-medium border-b">Screen Flow</div>
            <FlowDiagram chart={chartCode} />
          </div>
        );
      }

      const isInline = !className;
      if (isInline) {
        return (
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
            {children}
          </code>
        );
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }) => {
      return <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto">{children}</pre>;
    },
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b p-3 sm:p-4 shrink-0 flex items-center justify-between">
        <h2 className="font-semibold text-sm sm:text-base">Preview</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleForceRegenerate}
          disabled={isGenerating || messages.length === 0}
          className="gap-1"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {isGenerating && (
          <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            Generating specification...
          </div>
        )}
        <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-base sm:prose-headings:text-lg">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {previewMarkdownEn}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

