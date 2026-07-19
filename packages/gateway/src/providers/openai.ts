import { BaseProvider } from "./baseprovider.js";
import { ProviderError, UnifiedCompletionRequest, UnifiedCompletionResponse } from "./types.js";

const PRICING = {
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
  "gpt-4o": { in: 2.5, out: 10 },
};

export class OpenAIProvider extends BaseProvider {
  name = "openai";
  constructor(private apiKey: string) {
    super();
  }

  async complete(request: UnifiedCompletionRequest): Promise<UnifiedCompletionResponse> {
    try {
      const model = request.model ?? "gpt-4o-mini";
      const start=performance.now();
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: request.messages,
          max_tokens: request.maxTokens,
          temperature: request.temperature,
        }),
      });
      const data = await response.json();
      const end=performance.now();
      this.recordResult(true);

      const pricing = PRICING[model as keyof typeof PRICING] ?? PRICING["gpt-4o-mini"];
      const costUsd =
        (data.usage.prompt_tokens / 1_000_000) * pricing.in +
        (data.usage.completion_tokens / 1_000_000) * pricing.out;

      return {
        content: data.choices[0].message.content,
        provider: "openai",
        model: data.model,
        tokensIn: data.usage.prompt_tokens,
        tokensOut: data.usage.completion_tokens,
        costUsd,
        latencyMs: end-start,
        cacheHit: false,
      };
    } catch (err: any) {
      this.recordResult(false);
      throw new ProviderError("openai", err, err.message);
    }
  }
}