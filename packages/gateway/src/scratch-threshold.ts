import { euclideanDistance } from "@infergate/hnsw";
import { embedText } from "./lib/embeddings.js";

const pairs: [string, string][] = [
  // similar meaning, different wording
  ["What is the capital of France?", "What's France's capital city?"],
  ["How do I reset my password?", "I forgot my password, how can I reset it?"],
  ["Explain photosynthesis", "Can you explain how photosynthesis works?"],
  // unrelated
  ["What is the capital of France?", "How do I bake chocolate chip cookies?"],
  ["How do I reset my password?", "What's the weather like today?"],
  ["Explain photosynthesis", "Write a poem about the ocean"],
];

for (const [a, b] of pairs) {
  const vecA = await embedText(a);
  const vecB = await embedText(b);
  const dist = euclideanDistance(vecA, vecB);
  console.log(`dist=${dist.toFixed(3)}  |  "${a}"  vs  "${b}"`);
}