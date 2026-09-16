import { OpenRouterModel, RoutingMode } from '../types/models.js';
import { OpenRouterService } from './openrouter-client.js';
import { logger } from '../ui/logger.js';

export class ModelRouter {
  private service: OpenRouterService;

  // Curated coding hierarchy for fallback in 'auto' mode
  private preferredPaidCodingModels = [
    'anthropic/claude-3.5-sonnet',
    'qwen/qwen-2.5-coder-32b-instruct',
    'deepseek/deepseek-chat',
    'openai/gpt-4o'
  ];

  // Prioritized free coding models
  private preferredFreeCodingModels = [
    'deepseek/deepseek-r1:free',
    'deepseek/deepseek-chat:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen-2.5-coder-32b-instruct:free'
  ];

  constructor(service: OpenRouterService) {
    this.service = service;
  }

  // Resolve prioritized candidate list depending on mode
  async resolveCandidateModels(mode: RoutingMode, customModelId?: string): Promise<string[]> {
    if (mode === 'manual' && customModelId) {
      return [customModelId];
    }

    const liveModels = await this.service.getAvailableModels();
    const liveModelIds = new Set(liveModels.map((m) => m.id));

    if (mode === 'auto_free') {
      const liveFreeModels = liveModels
        .filter((m) => parseFloat(m.pricing.prompt) === 0 && parseFloat(m.pricing.completion) === 0)
        .map((m) => m.id);

      // Prioritize benchmarked free coding models first, then append other live free models
      const ordered = this.preferredFreeCodingModels.filter((id) => liveModelIds.has(id));
      for (const freeId of liveFreeModels) {
        if (!ordered.includes(freeId)) {
          ordered.push(freeId);
        }
      }
      return ordered;
    }

    // Default 'auto' mode: Prioritize top tier coding models
    const ordered = this.preferredPaidCodingModels.filter((id) => liveModelIds.has(id));
    if (ordered.length === 0 && liveModels.length > 0) {
      ordered.push(liveModels[0].id);
    }
    return ordered;
  }
}