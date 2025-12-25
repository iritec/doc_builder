import { streamText } from 'ai';
import { getAIProvider } from '@/lib/ai/providers';
import { getSystemPrompt } from '@/lib/ai/prompts';
import { Phase, ProjectSpec } from '@/types';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      messages, 
      apiKey,
      phase = 1,
      spec = {}
    }: {
      messages: { role: 'user' | 'assistant'; content: string }[];
      apiKey?: string;
      phase?: Phase;
      spec?: Partial<ProjectSpec>;
    } = body;

    const model = getAIProvider(apiKey);
    const systemPrompt = getSystemPrompt(phase, spec);

    // 空のメッセージをフィルタリング
    const filteredMessages = messages
      .filter((m) => m.content && m.content.trim().length > 0)
      .map((m) => ({
        role: m.role,
        content: m.content.trim(),
      }));

    if (filteredMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid messages provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = streamText({
      model,
      system: systemPrompt,
      messages: filteredMessages,
    });

    // SSE形式でストリーミングレスポンスを返す
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            const data = JSON.stringify({ content: chunk });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
