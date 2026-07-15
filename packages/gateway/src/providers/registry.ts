import { OllamaProvider } from "./ollama.js";
import type { LLMProvider } from "./types.js";

export class ProviderRegistry {
  private providers = new Map<string, LLMProvider>();

  constructor() {
    this.providers.set("ollama", new OllamaProvider());
  }

  get(name: string): LLMProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Unknown provider "${name}". Registered: ${[...this.providers.keys()].join(", ")}`);
    }
    return provider;
  }

  pickDefault(): LLMProvider {
    return this.get("ollama");
  }
}