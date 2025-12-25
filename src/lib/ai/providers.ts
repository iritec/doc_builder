import { createAnthropic } from '@ai-sdk/anthropic';

export function getAIProvider(apiKey?: string) {
  const anthropic = createAnthropic({
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
  });
  return anthropic('claude-sonnet-4-20250514');
}
