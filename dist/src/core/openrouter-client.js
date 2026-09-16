import OpenAI from 'openai';
export class OpenRouterService {
    client;
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: this.apiKey,
            defaultHeaders: {
                'HTTP-Referer': 'https://github.com/dbaidya811/forge-code',
                'X-Title': 'Forge Code Agent'
            }
        });
    }
    // Fetch all active models from OpenRouter
    async getAvailableModels() {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: {
                Authorization: `Bearer ${this.apiKey}`
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.statusText}`);
        }
        const data = (await response.json());
        return data.data;
    }
    getClient() {
        return this.client;
    }
}
