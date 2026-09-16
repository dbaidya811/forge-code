import ora from 'ora';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';
import { OpenRouterService } from './openrouter-client.js';
import { agentToolsDefinitions, executeToolCall } from '../tools/index.js';
import { logger } from '../ui/logger.js';
import { theme } from '../ui/theme.js';
import { TokenUsageStats } from '../types/agent.js';
import { tokenCounter } from '../utils/token-counter.js';

export class AgentExecutionLoop {
  private service: OpenRouterService;
  private candidateModels: string[];
  private activeModelIndex = 0;

  // Live Token Tracker
  public tokens: TokenUsageStats = {
    lastPromptTokens: 0,
    lastCompletionTokens: 0,
    lastTotalTokens: 0,
    sessionTotalTokens: 0
  };

  constructor(service: OpenRouterService, candidateModels: string[]) {
    this.service = service;
    this.candidateModels = candidateModels;
  }

  public getActiveModel(): string {
    return this.candidateModels[this.activeModelIndex] || 'unknown';
  }

  public setModel(modelId: string): void {
    this.candidateModels = [modelId, ...this.candidateModels.filter((m) => m !== modelId)];
    this.activeModelIndex = 0;
  }

  private fallbackToNextModel(): boolean {
    if (this.activeModelIndex + 1 < this.candidateModels.length) {
      this.activeModelIndex++;
      logger.info(`Switching fallback model to: ${theme.terracotta(this.getActiveModel())}`);
      return true;
    }
    return false;
  }

  async runTask(userPrompt: string): Promise<void> {
    const openai = this.service.getClient();
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are Forge, an elite software engineering agent. 
You can create, modify, inspect files and run terminal commands. 
Execute tasks methodically: inspect existing structure, perform modifications, and verify with tests or build commands when relevant.`
      },
      {
        role: 'user',
        content: userPrompt
      }
    ];

    let iterating = true;

    while (iterating) {
      const spinner = ora({
        text: `${theme.dim('Reasoning via')} ${theme.terracotta(this.getActiveModel())}...`,
        color: 'yellow'
      }).start();

      try {
        const response = await openai.chat.completions.create({
          model: this.getActiveModel(),
          messages,
          tools: agentToolsDefinitions,
          tool_choice: 'auto'
        });

        spinner.stop();

        // 1. Capture Live Tokens from API response or estimate fallback
        if (response.usage) {
          this.tokens.lastPromptTokens = response.usage.prompt_tokens;
          this.tokens.lastCompletionTokens = response.usage.completion_tokens;
          this.tokens.lastTotalTokens = response.usage.total_tokens;
          this.tokens.sessionTotalTokens += response.usage.total_tokens;
        } else {
          // Estimated token calculation if provider omits usage
          const estPrompt = tokenCounter.estimateMessagesTokens(messages);
          const estCompletion = tokenCounter.estimateTokens(response.choices[0]?.message?.content || '');
          this.tokens.lastPromptTokens = estPrompt;
          this.tokens.lastCompletionTokens = estCompletion;
          this.tokens.lastTotalTokens = estPrompt + estCompletion;
          this.tokens.sessionTotalTokens += this.tokens.lastTotalTokens;
        }

        const choice = response.choices[0];
        const message = choice.message;
        messages.push(message);

        // Assistant reply display
        if (message.content) {
          console.log(`\n${theme.bold(theme.terracotta('Forge:'))} ${message.content}\n`);
        }

        // Execute function calls requested by the model
        if (message.tool_calls && message.tool_calls.length > 0) {
          for (const toolCall of message.tool_calls) {
            if (toolCall.type !== 'function') continue;

            const funcName = toolCall.function.name;
            const funcArgs = toolCall.function.arguments;

            logger.action(`✢ Tool Call:`, `${funcName}(${funcArgs})`);

            const result = await executeToolCall(funcName, funcArgs);

            if (result.success) {
              logger.success(result.output);
            } else {
              logger.error(`Error: ${result.error}`);
            }

            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: result.success ? result.output : `Failed: ${result.error}`
            });
          }
        } else {
          iterating = false;
        }
      } catch (err: unknown) {
        spinner.stop();
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error(`Model [${this.getActiveModel()}] error: ${errorMessage}`);

        const switched = this.fallbackToNextModel();
        if (!switched) {
          logger.error('All fallback candidate models failed.');
          break;
        }
      }
    }
  }
}