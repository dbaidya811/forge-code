import Conf from 'conf';

interface ConfigSchema {
  apiKey?: string;
  defaultMode?: string;
  lastSelectedModel?: string;
}

// Persists config in system configuration path (~/.config/forge-code on Unix or AppData on Windows)
const store = new Conf<ConfigSchema>({
  projectName: 'forge-code'
});

export const keyStore = {
  getApiKey(): string | undefined {
    return process.env.OPENROUTER_API_KEY || store.get('apiKey');
  },
  setApiKey(key: string): void {
    store.set('apiKey', key.trim());
  },
  clearApiKey(): void {
    store.delete('apiKey');
  },
  getPreferredMode(): string {
    return store.get('defaultMode') || 'auto_free';
  },
  setPreferredMode(mode: string): void {
    store.set('defaultMode', mode);
  }
};