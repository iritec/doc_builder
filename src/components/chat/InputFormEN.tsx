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

export function InputFormEN({ onSubmit, isLoading, initialValue = '' }: InputFormProps) {
  const [input, setInput] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInput(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
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
    if (e.nativeEvent.isComposing) {
      return;
    }

    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || e.shiftKey)) {
      e.preventDefault();
      handleSubmit();
      return;
    }
  };

  return (
    <div className="border-t bg-background p-2 sm:p-4">
      <div className="flex gap-1.5 sm:gap-2 items-center">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Ctrl+Enter or Shift+Enter to send)"
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

