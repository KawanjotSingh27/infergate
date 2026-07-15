import type { LLMProvider, UnifiedCompletionRequest, UnifiedCompletionResponse } from "./types.js";

export abstract class BaseProvider implements LLMProvider {
  abstract readonly name: string;
  private recentResults: boolean[] = [];
  private readonly windowSize = 20;

  abstract complete(req: UnifiedCompletionRequest): Promise<UnifiedCompletionResponse>;

  protected recordResult(success: boolean) {
    this.recentResults.push(success);
    if (this.recentResults.length > this.windowSize) {
      this.recentResults.shift();
    }
  }

  isHealthy(): boolean {
    if (this.recentResults.length === 0) return true;
    const failures = this.recentResults.filter((r) => !r).length;
    return failures / this.recentResults.length < 0.5;
  }
}