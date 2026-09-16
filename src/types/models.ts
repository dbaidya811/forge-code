export interface OpenRouterModelPricing {
  prompt: string;
  completion: string;
  request?: string;
  image?: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: OpenRouterModelPricing;
}

export type RoutingMode = 'auto' | 'auto_free' | 'manual';