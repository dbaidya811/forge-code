import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';

export const tokenCounter = {
  // Approximate token calculation based on average token length (~4 chars per token)
  estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  },

  // Calculate approximate context window consumption from message history
  estimateMessagesTokens(messages: ChatCompletionMessageParam[]): number {
    let total = 0;

    for (const msg of messages) {
      // 4 tokens overhead per message block (role, delimiters)
      total += 4;

      if (typeof msg.content === 'string') {
        total += this.estimateTokens(msg.content);
      } else if (Array.isArray(msg.content)) {
        for (const part of msg.content) {
          if ('text' in part && typeof part.text === 'string') {
            total += this.estimateTokens(part.text);
          }
        }
      }

      // Estimate function/tool calls payload tokens
      if ('tool_calls' in msg && Array.isArray(msg.tool_calls)) {
        for (const toolCall of msg.tool_calls) {
          if (toolCall.type === 'function') {
            total += this.estimateTokens(toolCall.function.name);
            total += this.estimateTokens(toolCall.function.arguments);
          }
        }
      }
    }

    // 2 tokens overhead for reply priming
    return total + 2;
  },

  // Format token counts into readable units (e.g., 1.2k tokens)
  formatTokenCount(tokens: number): string {
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}k tokens`;
    }
    return `${tokens} tokens`;
  }
};