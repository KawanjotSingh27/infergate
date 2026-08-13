import { HNSWIndex } from "./hnsw.js";

const index = new HNSWIndex({ M: 4, efConstruction: 20, dimensions: 2 });

const points: [number, number][] = [
  [0, 0], [1, 0], [0, 1], [1, 1],
  [10, 10], [11, 10], [10, 11], [11, 11],
  [5, 5],
];

const ids: number[] = [];
for (const [x, y] of points) {
  const id = index.insert(new Float32Array([x, y]));
  ids.push(id);
}

console.log("Inserted ids:", ids);

const query = new Float32Array([0.5, 0.5]);
const results = index.search(query, 3, 20);
console.log("Search results (should be near [0.5, 0.5]):", results);