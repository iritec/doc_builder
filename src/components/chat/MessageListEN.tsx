'use client';

import { useEffect, useRef, useState } from 'react';
import { Message } from '@/types';
import { Bot, User, Pencil, Check, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onEdit: (message: Message) => void;
  onSaveEdit: (messageId: string, newContent: string) => void;
  onCancelEdit: () => void;
}

export function MessageListEN({
  messages,
  isLoading,
  onEdit,
  onSaveEdit,
  onCancelEdit,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (editingId && editTextareaRef.current) {
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = `${Math.min(
        editTextareaRef.current.scrollHeight,
        200
      )}px`;
      editTextareaRef.current.focus();
    }
  }, [editingId, editContent]);

  const handleStartEdit = (message: Message) => {
    setEditingId(message.id);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      onSaveEdit(editingId, editContent.trim());
      setEditingId(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
    onCancelEdit();
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground overflow-hidden px-4">
        <div className="text-center space-y-3 sm:space-y-4">
          <Bot className="w-12 h-12 sm:w-16 sm:h-16 mx-auto opacity-50" />
          <div>
            <p className="text-base sm:text-lg font-medium">
              Let&apos;s start creating specifications
            </p>
            <p className="text-xs sm:text-sm">Tell me about the service you want to build</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4" ref={scrollRef}>
      <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 sm:gap-3 group ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
                message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </div>
            <div
              className={`flex flex-col max-w-[85%] sm:max-w-[80%] ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {editingId === message.id ? (
                <>
                  <div className="w-full rounded-lg border-2 border-primary bg-background">
                    <Textarea
                      ref={editTextareaRef}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0"
                      placeholder="Edit message..."
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={!editContent.trim()}
                      className="h-7"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-7">
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={`rounded-lg px-3 py-2 sm:px-4 sm:py-3 w-full ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted border border-border'
                    }`}
                  >
                    <div
                      className={`prose prose-sm max-w-none ${
                        message.role === 'user'
                          ? 'prose-headings:text-primary-foreground prose-p:text-primary-foreground prose-strong:text-primary-foreground prose-em:text-primary-foreground prose-code:text-primary-foreground prose-pre:text-primary-foreground prose-li:text-primary-foreground'
                          : 'dark:prose-invert'
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleStartEdit(message)}
                      title="Edit and resend"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="bg-muted rounded-lg px-3 py-2 sm:px-4 sm:py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-foreground/50 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

