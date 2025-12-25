'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Check } from 'lucide-react';

interface InputFormProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export function InputForm({ onSubmit, isLoading, initialValue = '' }: InputFormProps) {
  const [input, setInput] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInput(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // 最小40px、最大200px
      textareaRef.current.style.height = `${Math.max(40, Math.min(scrollHeight, 200))}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleOkSubmit = () => {
    if (!isLoading) {
      onSubmit('OK');
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // IME変換中は無視
    if (e.nativeEvent.isComposing) {
      return;
    }

    // Ctrl+EnterまたはShift+Enterで送信
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || e.shiftKey)) {
      e.preventDefault();
      handleSubmit();
      return;
    }
    
    // Enterのみの場合は改行（デフォルト動作）だが、フォーム送信はしない
    // ここでは何もしない（デフォルトで改行される）
  };

  return (
    <div className="border-t bg-background p-2 sm:p-4">
      <div className="flex gap-1.5 sm:gap-2 items-center">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力... (Ctrl+EnterまたはShift+Enterで送信)"
          className="min-h-10! max-h-[200px] resize-none py-2"
          disabled={isLoading}
          rows={1}
        />
        <Button
          onClick={handleOkSubmit}
          disabled={isLoading}
          variant="outline"
          className="shrink-0 gap-1 h-10"
        >
          <Check className="w-4 h-4" />
          OK
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          size="icon-lg"
          className="shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

