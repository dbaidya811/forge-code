import open from 'open';
import { logger } from '../ui/logger.js';

const OPENROUTER_KEYS_URL = 'https://openrouter.ai/keys';

export async function openKeysPage(): Promise<void> {
  logger.info(`Opening OpenRouter keys page in your browser: ${OPENROUTER_KEYS_URL}`);
  try {
    await open(OPENROUTER_KEYS_URL);
  } catch {
    logger.error(`Could not launch browser automatically. Please visit: ${OPENROUTER_KEYS_URL}`);
  }
}