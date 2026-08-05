import fs from "node:fs";
import { HNSWIndex } from "./hnsw.js";

const vectors: number[][] = JSON.parse(fs.readFileSync("../../benchmarks/vectors.json", "utf-8"));
const queries: number[][] = JSON.parse(fs.readFileSync("../../benchmarks/queries.json", "utf-8"));

console.log(`Loaded ${vectors.length} vectors, ${queries.length} queries`);

const index = new HNSWIndex({ M: 16, efConstruction: 100, dimensions: 128 });

console.time("build");
const idMap: number[] = [];
for (let i = 0; i < vectors.length; i++) {
  const hnswId = index.insert(new Float32Array(vectors[i]!));
  idMap[hnswId] = i;
}
console.timeEnd("build");

const K = 10;
const EF_SEARCH = 400;

console.time("search");
const results: number[][] = [];
for (const q of queries) {
  const hnswIds = index.search(new Float32Array(q), K, EF_SEARCH);
  const originalIds = hnswIds.map((id) => idMap[id]!);
  results.push(originalIds);
}
console.timeEnd("search");

fs.writeFileSync(
  "../../benchmarks/hnsw_results.json",
  JSON.stringify({ k: K, efSearch: EF_SEARCH, M: 16, results })
);

console.log("Saved results to benchmarks/hnsw_results.json");
console.log("Example - query 0's HNSW top-10:", results[0]);