'use client';

import { useAppStore } from '@/store/useAppStore';
import { MessageList } from './MessageList';
import { InputForm } from './InputForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';
import { Phase, ProjectSpec } from '@/types';

export function ChatContainer() {
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
    resetSpec
  } = useAppStore();

  const phaseLabels = {
    1: 'プロジェクト概要',
    2: 'ユーザー種別と機能一覧',
    3: '画面一覧と画面フロー',
    4: '各画面の詳細',
    5: '技術スタック提案',
  };

  const handleReset = () => {
    if (window.confirm('会話履歴とプレビューをすべてリセットします。よろしいですか？')) {
      clearMessages();
      resetSpec();
    }
  };

  const handleSaveEdit = async (messageId: string, newContent: string) => {
    // メッセージを更新
    updateMessage(messageId, newContent);
    // そのメッセージ以降を削除（編集したメッセージ自体は残す）
    deleteMessagesAfter(messageId);
    
    // 更新後のメッセージリストを取得して再送信
    const updatedMessages = useAppStore.getState().messages;
    setLoading(true);

    try {
      // 設定からAPIキーを取得
      const apiKey = settings.claudeApiKey || undefined;

      // 空のメッセージをフィルタリングしてから送信
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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      // ストリーミング用の空メッセージを追加
      addMessage({ role: 'assistant', content: '' });
      
      // 最後に追加されたメッセージのIDを取得
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
                  // ストリーミング中にリアルタイムで更新
                  updateMessage(currentMessageId, assistantMessage);
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
        
        // ストリーミング完了後、AIの回答を解析
        if (assistantMessage) {
          await parseAssistantResponse(assistantMessage, newContent);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage({
        role: 'assistant',
        content: 'エラーが発生しました。設定を確認してもう一度お試しください。',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // キャンセル時は何もしない（編集モードが解除されるだけ）
  };

  // AIの回答を解析してフェーズ変更や仕様書更新を行う
  const parseAssistantResponse = async (assistantMessage: string, userMessage: string) => {
    // AIの回答から現在のフェーズを自動検出
    const detectedPhase = detectPhaseFromMessage(assistantMessage);
    if (detectedPhase && detectedPhase !== currentPhase) {
      setPhase(detectedPhase);
    }

    // ユーザーがフェーズ進行を承認したかチェック
    const proceedKeywords = ['ok', 'okです', '進む', '進みます', 'はい', 'yes', '了解', '了解です', 'お願いします', '進めて'];
    const userWantsToProceed = proceedKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword.toLowerCase())
    );

    // AIがフェーズ進行を提案しているかチェック（より柔軟なパターン）
    const phaseProposalPatterns = [
      /フェーズ\s*([2-5])\s*に進/i,
      /フェーズ\s*([2-5])\s*へ/i,
      /次のフェーズ/i,
      /フェーズ\s*([2-5])\s*に進んでも/i,
      /フェーズ\s*([2-5])\s*に進みますか/i,
    ];
    
    const hasPhaseProposal = phaseProposalPatterns.some(pattern => pattern.test(assistantMessage));
    
    // フェーズが進む場合、完了したフェーズの情報をまとめて抽出
    if (userWantsToProceed && hasPhaseProposal && currentPhase < 5) {
      // 完了したフェーズの情報をまとめて抽出
      extractPhaseSpec(currentPhase, assistantMessage);
      
      const nextPhase = (currentPhase + 1) as Phase;
      setPhase(nextPhase);
    } else {
      // フェーズが進まない場合でも、現在のフェーズの情報を抽出して差分更新
      extractCurrentPhaseSpec(assistantMessage);
    }
  };

  // AIの回答から現在のフェーズを自動検出
  const detectPhaseFromMessage = (message: string): Phase | null => {
    // より具体的なフェーズ検出パターン
    const phasePatterns: { phase: Phase; patterns: RegExp[] }[] = [
      {
        phase: 1,
        patterns: [
          /フェーズ\s*1|プロジェクト概要|フェーズ1/i,
          /サービス名|ターゲットユーザー|解決する課題|類似サービス/i,
        ],
      },
      {
        phase: 2,
        patterns: [
          /フェーズ\s*2|ユーザー種別と機能一覧|フェーズ2/i,
          /ユーザー種別|機能一覧|誰が何をできる/i,
        ],
      },
      {
        phase: 3,
        patterns: [
          /フェーズ\s*3|画面一覧と画面フロー|フェーズ3/i,
          /画面一覧|画面フロー|画面遷移/i,
        ],
      },
      {
        phase: 4,
        patterns: [
          /フェーズ\s*4|各画面の詳細|フェーズ4/i,
          /画面の詳細|表示される情報|できる操作|状態|遷移先/i,
        ],
      },
      {
        phase: 5,
        patterns: [
          /フェーズ\s*5|技術スタック提案|フェーズ5/i,
          /技術スタック|フロントエンド|バックエンド|認証|デプロイ/i,
        ],
      },
    ];

    // より具体的なパターンから順にチェック
    for (const { phase, patterns } of phasePatterns) {
      if (patterns.some(pattern => pattern.test(message))) {
        return phase;
      }
    }

    return null;
  };

  // 完了したフェーズの情報をまとめて抽出
  const extractPhaseSpec = (completedPhase: Phase, message: string) => {
    const updatedSpec: Partial<ProjectSpec> = {};

    // フェーズ1完了時: プロジェクト概要
    if (completedPhase === 1) {
      extractPhase1Spec(message, updatedSpec);
    }
    
    // フェーズ2完了時: ユーザー種別と機能一覧
    if (completedPhase === 2) {
      extractPhase2Spec(message, updatedSpec);
    }
    
    // フェーズ3完了時: 画面一覧と画面フロー
    if (completedPhase === 3) {
      extractPhase3Spec(message, updatedSpec);
    }
    
    // フェーズ4完了時: 各画面の詳細
    if (completedPhase === 4) {
      extractPhase4Spec(message, updatedSpec);
    }
    
    // フェーズ5完了時: 技術スタック
    if (completedPhase === 5) {
      extractPhase5Spec(message, updatedSpec);
    }

    // 差分があれば更新
    updateSpecIfChanged(updatedSpec, `Phase ${completedPhase} completed`);
  };

  // 現在のフェーズの情報を抽出（リアルタイム更新）
  const extractCurrentPhaseSpec = (message: string) => {
    const updatedSpec: Partial<ProjectSpec> = {};

    // 現在のフェーズに応じて情報を抽出
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

    // 差分があれば更新
    updateSpecIfChanged(updatedSpec, `Phase ${currentPhase} update`);
  };

  // 差分がある場合のみspecを更新
  const updateSpecIfChanged = (newSpec: Partial<ProjectSpec>, source: string) => {
    if (Object.keys(newSpec).length === 0) return;

    const currentSpec = useAppStore.getState().spec;
    let hasChanges = false;
    const mergedSpec: Partial<ProjectSpec> = {};

    // 各フィールドをチェックして差分があるか確認
    for (const [key, value] of Object.entries(newSpec)) {
      const currentValue = currentSpec[key as keyof ProjectSpec];
      
      // 値が異なる場合のみ更新
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

  // フェーズ1の情報を抽出
  const extractPhase1Spec = (message: string, updatedSpec: Partial<ProjectSpec>) => {
      // プロジェクト名の抽出（より柔軟なパターン）
      const projectNamePatterns = [
        /プロジェクト名[：:]\s*([^\n]+)/i,
        /サービス名[：:]\s*([^\n]+)/i,
        /^#\s*([^\n]+)/m, // マークダウンの見出し1
        /##\s*([^\n]+)/m, // マークダウンの見出し2
        /(?:プロジェクト名|サービス名)[：:]\s*([^\n]+)/i,
      ];
      
      for (const pattern of projectNamePatterns) {
        const match = message.match(pattern);
        if (match && match[1] && !match[1].includes('未設定') && !match[1].includes('プロジェクト名')) {
          const name = match[1].trim();
          if (name.length > 0 && name.length < 100) {
            updatedSpec.projectName = name;
            break;
          }
        }
      }

      // 説明の抽出
      const descPatterns = [
        /説明[：:]\s*([^\n]+)/i,
        /一言で説明[：:]\s*([^\n]+)/i,
        /サービス説明[：:]\s*([^\n]+)/i,
        /概要[：:]\s*([^\n]+)/i,
      ];
      
      for (const pattern of descPatterns) {
        const match = message.match(pattern);
        if (match && match[1] && !match[1].includes('未設定')) {
          updatedSpec.description = match[1].trim();
          break;
        }
      }

      // ターゲットユーザーの抽出
      const targetPatterns = [
        /ターゲットユーザー[：:]\s*([^\n]+)/i,
        /ターゲット[：:]\s*([^\n]+)/i,
        /対象ユーザー[：:]\s*([^\n]+)/i,
      ];
      
      for (const pattern of targetPatterns) {
        const match = message.match(pattern);
        if (match && match[1] && !match[1].includes('未設定')) {
          updatedSpec.targetUsers = match[1].trim();
          break;
        }
      }

      // 課題の抽出
      const problemPatterns = [
        /解決する課題[：:]\s*([^\n]+)/i,
        /課題[：:]\s*([^\n]+)/i,
        /解決する問題[：:]\s*([^\n]+)/i,
      ];
      
      for (const pattern of problemPatterns) {
        const match = message.match(pattern);
        if (match && match[1] && !match[1].includes('未設定')) {
          updatedSpec.problemToSolve = match[1].trim();
          break;
        }
      }

      // 類似サービスの抽出
      const similarPatterns = [
        /類似サービス[：:]\s*([^\n]+)/i,
        /参考サービス[：:]\s*([^\n]+)/i,
        /競合サービス[：:]\s*([^\n]+)/i,
      ];
      
      for (const pattern of similarPatterns) {
        const match = message.match(pattern);
        if (match && match[1] && !match[1].includes('未設定')) {
          updatedSpec.similarServices = match[1].trim();
          break;
        }
      }

      // 箇条書きやリストからも抽出を試みる
      const lines = message.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // プロジェクト名（見出しから）
        if ((line.startsWith('# ') || line.startsWith('## ')) && !line.includes('フェーズ') && !line.includes('概要') && !line.includes('プロジェクト名')) {
          const name = line.replace(/^#+\s*/, '').trim();
          if (name.length > 0 && name.length < 100 && !updatedSpec.projectName) {
            updatedSpec.projectName = name;
          }
        }
        
        // 説明（「説明:」や「概要:」の行から）
        if ((line.includes('説明') || line.includes('概要')) && (line.includes(':') || line.includes('：')) && !line.includes('未設定')) {
          const parts = line.split(/[：:]/);
          if (parts.length >= 2) {
            const value = parts.slice(1).join(':').trim();
            if (value && !value.includes('未設定') && value.length > 0) {
              if (line.includes('説明') && !updatedSpec.description) {
                updatedSpec.description = value;
              }
            }
          }
        }
        
        // ターゲットユーザー（「ターゲット:」の行から）
        if (line.includes('ターゲット') && (line.includes(':') || line.includes('：')) && !line.includes('未設定') && !updatedSpec.targetUsers) {
          const parts = line.split(/[：:]/);
          if (parts.length >= 2) {
            const value = parts.slice(1).join(':').trim();
            if (value && value.length > 0) {
              updatedSpec.targetUsers = value;
            }
          }
        }
        
        // 課題（「課題:」の行から）
        if ((line.includes('課題') || line.includes('問題')) && (line.includes(':') || line.includes('：')) && !line.includes('未設定') && !updatedSpec.problemToSolve) {
          const parts = line.split(/[：:]/);
          if (parts.length >= 2) {
            const value = parts.slice(1).join(':').trim();
            if (value && value.length > 0) {
              updatedSpec.problemToSolve = value;
            }
          }
        }
        
        // 類似サービス（「類似サービス:」の行から）
        if (line.includes('類似') && (line.includes(':') || line.includes('：')) && !line.includes('未設定') && !updatedSpec.similarServices) {
          const parts = line.split(/[：:]/);
          if (parts.length >= 2) {
            const value = parts.slice(1).join(':').trim();
            if (value && value.length > 0) {
              updatedSpec.similarServices = value;
            }
          }
        }
      }
      
      // サマリーセクションからも抽出を試みる
      const summaryMatch = message.match(/サマリー|まとめ|概要[\s\S]*?(?=フェーズ|$)/i);
      if (summaryMatch) {
        const summaryText = summaryMatch[0];
        // サマリー内から各項目を抽出
        if (!updatedSpec.projectName) {
          const nameMatch = summaryText.match(/(?:プロジェクト名|サービス名)[：:]\s*([^\n]+)/i);
          if (nameMatch && nameMatch[1] && !nameMatch[1].includes('未設定')) {
            updatedSpec.projectName = nameMatch[1].trim();
          }
        }
        if (!updatedSpec.description) {
          const descMatch = summaryText.match(/(?:説明|概要)[：:]\s*([^\n]+)/i);
          if (descMatch && descMatch[1] && !descMatch[1].includes('未設定')) {
            updatedSpec.description = descMatch[1].trim();
          }
        }
        if (!updatedSpec.targetUsers) {
          const targetMatch = summaryText.match(/(?:ターゲット|対象)[：:]\s*([^\n]+)/i);
          if (targetMatch && targetMatch[1] && !targetMatch[1].includes('未設定')) {
            updatedSpec.targetUsers = targetMatch[1].trim();
          }
        }
        if (!updatedSpec.problemToSolve) {
          const problemMatch = summaryText.match(/(?:課題|問題)[：:]\s*([^\n]+)/i);
          if (problemMatch && problemMatch[1] && !problemMatch[1].includes('未設定')) {
            updatedSpec.problemToSolve = problemMatch[1].trim();
          }
        }
        if (!updatedSpec.similarServices) {
          const similarMatch = summaryText.match(/類似[：:]\s*([^\n]+)/i);
          if (similarMatch && similarMatch[1] && !similarMatch[1].includes('未設定')) {
            updatedSpec.similarServices = similarMatch[1].trim();
          }
        }
      }
  };

  // フェーズ2の情報を抽出
  const extractPhase2Spec = (message: string, updatedSpec: Partial<ProjectSpec>) => {
    // テーブルからユーザー種別を抽出（より柔軟なパターン）
    const userTypeTablePatterns = [
      /\|.*ユーザー種別.*\|.*説明.*\|[\s\S]*?(\|.*\|[\s\S]*?)(?=\n\n|\n##|$)/i,
      /\|.*種別.*\|.*説明.*\|[\s\S]*?(\|.*\|[\s\S]*?)(?=\n\n|\n##|$)/i,
      /ユーザー種別[\s\S]*?\|.*\|[\s\S]*?(\|.*\|[\s\S]*?)(?=\n\n|\n##|$)/i,
    ];
    
    for (const pattern of userTypeTablePatterns) {
      const tableMatch = message.match(pattern);
      if (tableMatch) {
        const tableContent = tableMatch[1] || tableMatch[0];
        const rows = tableContent.split('\n').filter(row => {
          const trimmed = row.trim();
          return trimmed.startsWith('|') && !trimmed.includes('---') && trimmed.length > 3;
        });
        
        const userTypes = rows.map((row, index) => {
          const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0);
          if (cells.length >= 2) {
            return {
              id: `user-type-${Date.now()}-${index}`,
              name: cells[0],
              description: cells[1],
            };
          }
          return null;
        }).filter(Boolean) as { id: string; name: string; description: string }[];

        if (userTypes.length > 0) {
          updatedSpec.userTypes = userTypes;
          break;
        }
      }
    }
  };

  // フェーズ3の情報を抽出（画面一覧と画面フロー）
  const extractPhase3Spec = (_message: string, _updatedSpec: Partial<ProjectSpec>) => {
    // TODO: 画面一覧と画面フローの抽出ロジックを実装
  };

  // フェーズ4の情報を抽出（各画面の詳細）
  const extractPhase4Spec = (_message: string, _updatedSpec: Partial<ProjectSpec>) => {
    // TODO: 各画面の詳細の抽出ロジックを実装
  };

  // フェーズ5の情報を抽出（技術スタック）
  const extractPhase5Spec = (_message: string, _updatedSpec: Partial<ProjectSpec>) => {
    // TODO: 技術スタックの抽出ロジックを実装
  };

  const handleSubmit = async (content: string) => {
    addMessage({ role: 'user', content });
    setLoading(true);

    try {
      // 設定からAPIキーを取得
      const apiKey = settings.claudeApiKey || undefined;

      // 空のメッセージをフィルタリングしてから送信
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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      // ストリーミング用の空メッセージを追加
      addMessage({ role: 'assistant', content: '' });
      
      // 最後に追加されたメッセージのIDを取得
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
                  // ストリーミング中にリアルタイムで更新
                  updateMessage(currentMessageId, assistantMessage);
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
        
        // ストリーミング完了後、AIの回答を解析
        if (assistantMessage) {
          await parseAssistantResponse(assistantMessage, content);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage({
        role: 'assistant',
        content: 'エラーが発生しました。設定を確認してもう一度お試しください。',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-3 sm:p-4 flex items-center justify-between gap-2">
        <h2 className="font-semibold text-sm sm:text-base shrink-0">AIと壁打ち</h2>
        <div className="flex items-center gap-1 sm:gap-2">
          <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">
            <span className="hidden sm:inline">フェーズ {currentPhase}: </span>
            <span className="sm:hidden">P{currentPhase}: </span>
            {phaseLabels[currentPhase]}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isLoading}
            className="text-muted-foreground hover:text-destructive"
            title="新規プロジェクト"
          >
            <FilePlus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <MessageList 
        messages={messages} 
        isLoading={isLoading} 
        onEdit={() => {}} 
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
      />
      <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
