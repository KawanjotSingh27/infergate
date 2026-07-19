import { BaseProvider } from "./baseprovider.js";
import { ProviderError, UnifiedCompletionRequest, UnifiedCompletionResponse } from "./types.js";

const PRICING = {
  "claude-haiku-4-5": { in: 1, out: 5 },
  "claude-sonnet-5": { in: 3, out: 15 },
};

export class AnthropicProvider extends BaseProvider {
  name = "anthropic";
  constructor(private apiKey: string) {
    super();
  }

  async complete(request: UnifiedCompletionRequest): Promise<UnifiedCompletionResponse> {
    try {
      const model = request.model ?? "claude-haiku-4-5";
      const systemMsg = request.messages.find((m) => m.role === "system")?.content;
      const chatMessages = request.messages.filter((m) => m.role !== "system");

      const start=performance.now();
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          system: systemMsg,
          messages: chatMessages,
          max_tokens: request.maxTokens ?? 512,
          temperature: request.temperature,
        }),
      });
      const data = await response.json();
      const end=performance.now();
      this.recordResult(true);

      const pricing = PRICING[model as keyof typeof PRICING] ?? PRICING["claude-haiku-4-5"];
      const costUsd =
        (data.usage.input_tokens / 1_000_000) * pricing.in +
        (data.usage.output_tokens / 1_000_000) * pricing.out;

      return {
        content: data.content.map((c: any) => c.text).join(""),
        provider: "anthropic",
        model: data.model,
        tokensIn: data.usage.input_tokens,
        tokensOut: data.usage.output_tokens,
        costUsd,
        latencyMs: end-start,
        cacheHit: false,
      };
    } catch (err: any) {
      this.recordResult(false);
      throw new ProviderError("anthropic", err, err.message);
    }
  }
}