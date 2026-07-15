export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface UnifiedCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface UnifiedCompletionResponse {
  content: string;
  provider: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  costUsd: number;
  cacheHit: boolean;
}

export interface LLMProvider {
  readonly name: string;
  complete(req: UnifiedCompletionRequest): Promise<UnifiedCompletionResponse>;
  isHealthy(): boolean;
}

export class ProviderError extends Error {
  constructor(
    public readonly provider: string,
    public readonly cause: unknown,
    message: string
  ) {
    super(message);
    this.name = "ProviderError";
  }
}