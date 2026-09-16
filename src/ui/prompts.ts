import * as p from '@clack/prompts';
import { search } from '@inquirer/prompts';
import { keyStore } from '../config/key-store.js';
import { openKeysPage } from '../utils/browser.js';
import { OpenRouterService } from '../core/openrouter-client.js';
import { RoutingMode, OpenRouterModel } from '../types/models.js';
import { theme } from './theme.js';

export async function promptApiKey(): Promise<string> {
  let existingKey = keyStore.getApiKey();
  if (existingKey) {
    return existingKey;
  }

  p.intro(theme.terracotta('OpenRouter Authentication Setup'));

  const choice = await p.select({
    message: 'No OpenRouter API key detected. How would you like to proceed?',
    options: [
      { value: 'browser', label: 'Open OpenRouter in browser to generate API key' },
      { value: 'paste', label: 'I already have a key, paste it here' }
    ]
  });

  if (choice === 'browser') {
    await openKeysPage();
  }

  const keyInput = await p.text({
    message: 'Enter your OpenRouter API Key (sk-or-v1-...):',
    validate: (val) => (!val || val.length < 10 ? 'Please provide a valid API key.' : undefined)
  });

  if (p.isCancel(keyInput)) {
    process.exit(0);
  }

  const key = (keyInput as string).trim();
  keyStore.setApiKey(key);
  p.outro(theme.success('API key stored securely.'));
  return key;
}

export async function promptRoutingMode(service: OpenRouterService): Promise<{ mode: RoutingMode; manualModelId?: string }> {
  const selectedMode = await p.select({
    message: 'Choose model execution mode:',
    options: [
      { value: 'auto_free', label: 'Auto Free (Iterates across available 0-cost coding models)' },
      { value: 'auto', label: 'Auto (Best live coding models with fallback)' },
      { value: 'manual', label: 'Search & Select Model manually from live catalog' }
    ]
  });

  if (p.isCancel(selectedMode)) {
    process.exit(0);
  }

  if (selectedMode === 'manual') {
    const selectedModel = await promptSearchModel(service);
    return { mode: 'manual', manualModelId: selectedModel };
  }

  return { mode: selectedMode as RoutingMode };
}

// Keystroke-by-keystroke real-time filtering search selector
export async function promptSearchModel(service: OpenRouterService): Promise<string> {
  const s = p.spinner();
  s.start('Fetching live OpenRouter models catalog...');
  let allModels: OpenRouterModel[] = [];
  try {
    allModels = await service.getAvailableModels();
    s.stop(`Loaded ${allModels.length} models from OpenRouter.`);
  } catch {
    s.stop('Failed to load online catalog.');
    return 'deepseek/deepseek-r1:free';
  }

  try {
    const selectedModel = await search({
      message: `${theme.terracotta('Search model')} ${theme.dim('(start typing to filter live results)')}:`,
      source: async (input) => {
        const query = (input || '').trim().toLowerCase();

        // Type na korle first 20 ta model dekhabe
        if (!query) {
          return allModels.slice(0, 20).map((m) => {
            const isFree = parseFloat(m.pricing.prompt) === 0 && parseFloat(m.pricing.completion) === 0;
            const badge = isFree ? theme.success('[FREE]') : theme.dim(`[$${m.pricing.prompt}/1M]`);
            return {
              name: `${m.name} ${badge} ${theme.dim(`(${m.id})`)}`,
              value: m.id,
              description: m.description ? m.description.slice(0, 90) + '...' : undefined
            };
          });
        }

        // Live input-er sathe match kore filter kora
        const filtered = allModels.filter(
          (m) => m.id.toLowerCase().includes(query) || m.name.toLowerCase().includes(query)
        );

        return filtered.slice(0, 20).map((m) => {
          const isFree = parseFloat(m.pricing.prompt) === 0 && parseFloat(m.pricing.completion) === 0;
          const badge = isFree ? theme.success('[FREE]') : theme.dim(`[$${m.pricing.prompt}/1M]`);
          return {
            name: `${m.name} ${badge} ${theme.dim(`(${m.id})`)}`,
            value: m.id,
            description: m.description ? m.description.slice(0, 90) + '...' : undefined
          };
        });
      }
    });

    return selectedModel;
  } catch {
    // User cancels via Ctrl+C
    return allModels[0]?.id || 'deepseek/deepseek-r1:free';
  }
}