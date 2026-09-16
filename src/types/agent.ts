import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';

export interface TokenUsageStats {
  lastPromptTokens: number;
  lastCompletionTokens: number;
  lastTotalTokens: number;
  sessionTotalTokens: number;
}

export interface AgentStatusInfo {
  activeModel: string;
  mode: string;
  tokens: TokenUsageStats;
}