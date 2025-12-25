'use client';

import { useAppStore } from '@/store/useAppStore';
import { MessageListEN } from './MessageListEN';
import { InputFormEN } from './InputFormEN';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';
import { Phase, ProjectSpec } from '@/types';

export function ChatContainerEN() {
  const {
    messages,
    isLoading,
    currentPhase,
    settings,
    spec,
    addMessage,
    updateMessage,
    deleteMessagesAfter,
    setLoading,
    setPhase,
    updateSpec,
    clearMessages,
    resetSpec,
  } = useAppStore();

  const phaseLabels: Record<Phase, string> = {
    1: 'Project Overview',
    2: 'User Types & Features',
    3: 'Screen List & Flow',
    4: 'Screen Details',
    5: 'Tech Stack Proposal',
  };

  const handleReset = () => {
    if (window.confirm('Reset all conversation history and preview. Are you sure?')) {
      clearMessages();
      resetSpec();
    }
  };

  const handleSaveEdit = async (messageId: string, newContent: string) => {
    updateMessage(messageId, newContent);
    deleteMessagesAfter(messageId);

    const updatedMessages = useAppStore.getState().messages;
    setLoading(true);

    try {
      const apiKey = settings.claudeApiKey || undefined;

      const messagesToSend = updatedMessages
        .filter((m) => m.content && m.content.trim().length > 0)
        .map((m) => ({
          role: m.role,
          content: m.content.trim(),
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesToSend,
          apiKey,
          phase: currentPhase,
          spec,
          locale: 'en',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      addMessage({ role: 'assistant', content: '' });

      const currentMessages = useAppStore.getState().messages;
      const lastMessage = currentMessages[currentMessages.length - 1];
      const currentMessageId = lastMessage?.id || '';

      if (reader && currentMessageId) {
        let assistantMessage = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantMessage += parsed.content;
                  updateMessage(currentMessageId, assistantMessage);
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }

        if (assistantMessage) {
          await parseAssistantResponse(assistantMessage, newContent);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage({
        role: 'assistant',
        content: 'An error occurred. Please check your settings and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Do nothing (just exits edit mode)
  };

  const parseAssistantResponse = async (assistantMessage: string, userMessage: string) => {
    const detectedPhase = detectPhaseFromMessage(assistantMessage);
    if (detectedPhase && detectedPhase !== currentPhase) {
      setPhase(detectedPhase);
    }

    const proceedKeywords = [
      'ok',
      'okay',
      'proceed',
      'yes',
      'sure',
      'go ahead',
      'continue',
      'next',
      "let's go",
      'sounds good',
    ];
    const userWantsToProceed = proceedKeywords.some((keyword) =>
      userMessage.toLowerCase().includes(keyword.toLowerCase())
    );

    const phaseProposalPatterns = [
      /phase\s*([2-5])/i,
      /move to phase\s*([2-5])/i,
      /proceed to phase\s*([2-5])/i,
      /next phase/i,
    ];

    const hasPhaseProposal = phaseProposalPatterns.some((pattern) =>
      pattern.test(assistantMessage)
    );

    if (userWantsToProceed && hasPhaseProposal && currentPhase < 5) {
      extractPhaseSpec(currentPhase, assistantMessage);

      const nextPhase = (currentPhase + 1) as Phase;
      setPhase(nextPhase);
    } else {
      extractCurrentPhaseSpec(assistantMessage);
    }
  };

  const detectPhaseFromMessage = (message: string): Phase | null => {
    const phasePatterns: { phase: Phase; patterns: RegExp[] }[] = [
      {
        phase: 1,
        patterns: [
          /phase\s*1|project overview/i,
          /service name|target user|problem to solve|similar services/i,
        ],
      },
      {
        phase: 2,
        patterns: [/phase\s*2|user types and features/i, /user types|feature list/i],
      },
      {
        phase: 3,
        patterns: [/phase\s*3|screen list and flow/i, /screen list|screen flow|navigation/i],
      },
      {
        phase: 4,
        patterns: [/phase\s*4|screen details/i, /screen details|displayed information/i],
      },
      {
        phase: 5,
        patterns: [
          /phase\s*5|tech stack/i,
          /technology stack|frontend|backend|authentication|deployment/i,
        ],
      },
    ];

    for (const { phase, patterns } of phasePatterns) {
      if (patterns.some((pattern) => pattern.test(message))) {
        return phase;
      }
    }

    return null;
  };

  const extractPhaseSpec = (completedPhase: Phase, message: string) => {
    const updatedSpec: Partial<ProjectSpec> = {};

    if (completedPhase === 1) {
      extractPhase1Spec(message, updatedSpec);
    }
    if (completedPhase === 2) {
      extractPhase2Spec(message, updatedSpec);
    }
    if (completedPhase === 3) {
      extractPhase3Spec(message, updatedSpec);
    }
    if (completedPhase === 4) {
      extractPhase4Spec(message, updatedSpec);
    }
    if (completedPhase === 5) {
      extractPhase5Spec(message, updatedSpec);
    }

    updateSpecIfChanged(updatedSpec, `Phase ${completedPhase} completed`);
  };

  const extractCurrentPhaseSpec = (message: string) => {
    const updatedSpec: Partial<ProjectSpec> = {};

    if (currentPhase === 1) {
      extractPhase1Spec(message, updatedSpec);
    } else if (currentPhase === 2) {
      extractPhase2Spec(message, updatedSpec);
    } else if (currentPhase === 3) {
      extractPhase3Spec(message, updatedSpec);
    } else if (currentPhase === 4) {
      extractPhase4Spec(message, updatedSpec);
    } else if (currentPhase === 5) {
      extractPhase5Spec(message, updatedSpec);
    }

    updateSpecIfChanged(updatedSpec, `Phase ${currentPhase} update`);
  };

  const updateSpecIfChanged = (newSpec: Partial<ProjectSpec>, source: string) => {
    if (Object.keys(newSpec).length === 0) return;

    const currentSpec = useAppStore.getState().spec;
    let hasChanges = false;
    const mergedSpec: Partial<ProjectSpec> = {};

    for (const [key, value] of Object.entries(newSpec)) {
      const currentValue = currentSpec[key as keyof ProjectSpec];

      if (JSON.stringify(currentValue) !== JSON.stringify(value)) {
        (mergedSpec as Record<string, unknown>)[key] = value;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      console.log(`${source} - Spec updated:`, mergedSpec);
      updateSpec(mergedSpec);
    }
  };

  const extractPhase1Spec = (message: string, updatedSpec: Partial<ProjectSpec>) => {
    const projectNamePatterns = [
      /project name[：:]\s*([^\n]+)/i,
      /service name[：:]\s*([^\n]+)/i,
      /^#\s*([^\n]+)/m,
      /##\s*([^\n]+)/m,
    ];

    for (const pattern of projectNamePatterns) {
      const match = message.match(pattern);
      if (match && match[1] && !match[1].includes('Not set')) {
        const name = match[1].trim();
        if (name.length > 0 && name.length < 100) {
          updatedSpec.projectName = name;
          break;
        }
      }
    }

    const descPatterns = [
      /description[：:]\s*([^\n]+)/i,
      /overview[：:]\s*([^\n]+)/i,
      /summary[：:]\s*([^\n]+)/i,
    ];

    for (const pattern of descPatterns) {
      const match = message.match(pattern);
      if (match && match[1] && !match[1].includes('Not set')) {
        updatedSpec.description = match[1].trim();
        break;
      }
    }

    const targetPatterns = [
      /target users?[：:]\s*([^\n]+)/i,
      /target audience[：:]\s*([^\n]+)/i,
    ];

    for (const pattern of targetPatterns) {
      const match = message.match(pattern);
      if (match && match[1] && !match[1].includes('Not set')) {
        updatedSpec.targetUsers = match[1].trim();
        break;
      }
    }

    const problemPatterns = [
      /problem to solve[：:]\s*([^\n]+)/i,
      /problem[：:]\s*([^\n]+)/i,
      /challenge[：:]\s*([^\n]+)/i,
    ];

    for (const pattern of problemPatterns) {
      const match = message.match(pattern);
      if (match && match[1] && !match[1].includes('Not set')) {
        updatedSpec.problemToSolve = match[1].trim();
        break;
      }
    }

    const similarPatterns = [
      /similar services?[：:]\s*([^\n]+)/i,
      /competitors?[：:]\s*([^\n]+)/i,
    ];

    for (const pattern of similarPatterns) {
      const match = message.match(pattern);
      if (match && match[1] && !match[1].includes('Not set')) {
        updatedSpec.similarServices = match[1].trim();
        break;
      }
    }
  };

  const extractPhase2Spec = (message: string, updatedSpec: Partial<ProjectSpec>) => {
    const userTypeTablePatterns = [
      /\|.*user type.*\|.*description.*\|[\s\S]*?(\|.*\|[\s\S]*?)(?=\n\n|\n##|$)/i,
      /\|.*type.*\|.*description.*\|[\s\S]*?(\|.*\|[\s\S]*?)(?=\n\n|\n##|$)/i,
    ];

    for (const pattern of userTypeTablePatterns) {
      const tableMatch = message.match(pattern);
      if (tableMatch) {
        const tableContent = tableMatch[1] || tableMatch[0];
        const rows = tableContent.split('\n').filter((row) => {
          const trimmed = row.trim();
          return trimmed.startsWith('|') && !trimmed.includes('---') && trimmed.length > 3;
        });

        const userTypes = rows
          .map((row, index) => {
            const cells = row
              .split('|')
              .map((cell) => cell.trim())
              .filter((cell) => cell.length > 0);
            if (cells.length >= 2) {
              return {
                id: `user-type-${Date.now()}-${index}`,
                name: cells[0],
                description: cells[1],
              };
            }
            return null;
          })
          .filter(Boolean) as { id: string; name: string; description: string }[];

        if (userTypes.length > 0) {
          updatedSpec.userTypes = userTypes;
          break;
        }
      }
    }
  };

  const extractPhase3Spec = (_message: string, _updatedSpec: Partial<ProjectSpec>) => {
    // TODO: Implement screen list and flow extraction
  };

  const extractPhase4Spec = (_message: string, _updatedSpec: Partial<ProjectSpec>) => {
    // TODO: Implement screen details extraction
  };

  const extractPhase5Spec = (_message: string, _updatedSpec: Partial<ProjectSpec>) => {
    // TODO: Implement tech stack extraction
  };

  const handleSubmit = async (content: string) => {
    addMessage({ role: 'user', content });
    setLoading(true);

    try {
      const apiKey = settings.claudeApiKey || undefined;

      const messagesToSend = [...messages, { role: 'user' as const, content }]
        .filter((m) => m.content && m.content.trim().length > 0)
        .map((m) => ({
          role: m.role,
          content: m.content.trim(),
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesToSend,
          apiKey,
          phase: currentPhase,
          spec,
          locale: 'en',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      addMessage({ role: 'assistant', content: '' });

      const currentMessages = useAppStore.getState().messages;
      const lastMessage = currentMessages[currentMessages.length - 1];
      const currentMessageId = lastMessage?.id || '';

      if (reader && currentMessageId) {
        let assistantMessage = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantMessage += parsed.content;
                  updateMessage(currentMessageId, assistantMessage);
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }

        if (assistantMessage) {
          await parseAssistantResponse(assistantMessage, content);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage({
        role: 'assistant',
        content: 'An error occurred. Please check your settings and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-3 sm:p-4 flex items-center justify-between gap-2">
        <h2 className="font-semibold text-sm sm:text-base shrink-0">Brainstorm with AI</h2>
        <div className="flex items-center gap-1 sm:gap-2">
          <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">
            <span className="hidden sm:inline">Phase {currentPhase}: </span>
            <span className="sm:hidden">P{currentPhase}: </span>
            {phaseLabels[currentPhase]}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isLoading}
            className="text-muted-foreground hover:text-destructive"
            title="New Project"
          >
            <FilePlus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <MessageListEN
        messages={messages}
        isLoading={isLoading}
        onEdit={() => {}}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
      />
      <InputFormEN onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}

