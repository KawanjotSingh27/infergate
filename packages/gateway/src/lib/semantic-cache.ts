import { HNSWIndex } from "@infergate/hnsw";
import { embedText } from "./embeddings.js";
import type { UnifiedCompletionResponse } from "../providers/types.js";

interface CacheEntry {
  prompt: string;
  response: UnifiedCompletionResponse;
}

export class SemanticCache {
  private index: HNSWIndex;
  private entries = new Map<number, CacheEntry>();

  constructor(private maxDistance: number = 15) {
    this.index = new HNSWIndex({ M: 16, efConstruction: 100, dimensions: 768 });
  }

  async lookup(prompt: string): Promise<UnifiedCompletionResponse | null> {
    if (this.entries.size === 0) return null;

    const queryVector = await embedText(prompt);
    const results = this.index.search(queryVector, 1, 50);

    if (results.length === 0) return null;

    const best = results[0]!;

    if (best.distance > this.maxDistance) {
        return null;
    }

    const entry = this.entries.get(best.id)!;
    return entry.response;
    }

  async store(prompt: string, response: UnifiedCompletionResponse): Promise<void> {
    const vector = await embedText(prompt);
    const id = this.index.insert(vector);
    this.entries.set(id, { prompt, response });
  }
}