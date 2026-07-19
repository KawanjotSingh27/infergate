import { AnthropicProvider } from "./anthropic.js";
import { OllamaProvider } from "./ollama.js";
import { OpenAIProvider } from "./openai.js";
import type { LLMProvider } from "./types.js";

export class ProviderRegistry {
  private providers = new Map<string, LLMProvider>();

  constructor(config:{openaiKey?:string, anthropicKey?:string}) {
    this.providers.set("ollama", new OllamaProvider());
    if(config.openaiKey) this.providers.set("openai", new OpenAIProvider(config.openaiKey));
    if(config.anthropicKey) this.providers.set("anthropic", new AnthropicProvider(config.anthropicKey));
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