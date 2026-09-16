import test from 'node:test';
import assert from 'node:assert/strict';
import { ModelRouter } from '../src/core/model-router.js';
import { OpenRouterService } from '../src/core/openrouter-client.js';
import { OpenRouterModel } from '../src/types/models.js';

// Mock implementation of OpenRouterService to test routing logic in isolation
class MockOpenRouterService extends OpenRouterService {
  private mockModels: OpenRouterModel[];

  constructor(mockModels: OpenRouterModel[]) {
    // Pass a dummy key to super constructor
    super('dummy-api-key');
    this.mockModels = mockModels;
  }

  override async getAvailableModels(): Promise<OpenRouterModel[]> {
    return this.mockModels;
  }
}

const sampleCatalog: OpenRouterModel[] = [
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    context_length: 200000,
    pricing: { prompt: '0.000003', completion: '0.000015' }
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    context_length: 64000,
    pricing: { prompt: '0.00000014', completion: '0.00000028' }
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (Free)',
    context_length: 64000,
    pricing: { prompt: '0', completion: '0' }
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B (Free)',
    context_length: 128000,
    pricing: { prompt: '0', completion: '0' }
  }
];

test('ModelRouter: resolves manual mode model correctly', async () => {
  const service = new MockOpenRouterService(sampleCatalog);
  const router = new ModelRouter(service);

  const candidates = await router.resolveCandidateModels('manual', 'anthropic/claude-3.5-sonnet');
  assert.deepEqual(candidates, ['anthropic/claude-3.5-sonnet']);
});

test('ModelRouter: resolves auto_free mode filtering only zero-cost models', async () => {
  const service = new MockOpenRouterService(sampleCatalog);
  const router = new ModelRouter(service);

  const candidates = await router.resolveCandidateModels('auto_free');
  assert.equal(candidates.length, 2);
  assert.ok(candidates.includes('deepseek/deepseek-r1:free'));
  assert.ok(candidates.includes('meta-llama/llama-3.3-70b-instruct:free'));
  assert.ok(!candidates.includes('anthropic/claude-3.5-sonnet'));
});

test('ModelRouter: auto mode orders models based on coding hierarchy', async () => {
  const service = new MockOpenRouterService(sampleCatalog);
  const router = new ModelRouter(service);

  const candidates = await router.resolveCandidateModels('auto');
  assert.equal(candidates[0], 'anthropic/claude-3.5-sonnet');
  assert.equal(candidates[1], 'deepseek/deepseek-chat');
});