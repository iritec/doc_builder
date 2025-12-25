'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface FlowDiagramProps {
  chart: string;
}

export function FlowDiagram({ chart }: FlowDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!chart.trim()) {
        setSvg('');
        return;
      }

      try {
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
        setError('');
      } catch (err) {
        console.error('Mermaid error:', err);
        setError('フロー図の描画に失敗しました');
        setSvg('');
      }
    };

    renderDiagram();
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
        {error}
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        画面フローが設定されていません
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-auto p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

