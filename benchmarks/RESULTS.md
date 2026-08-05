# InferGate — Benchmark Results

## HNSW: Recall vs Search Latency Tradeoff

**Dataset:** 10,000 random vectors, 128 dimensions, seed=42
**Config:** M=16, efConstruction=100
**Ground truth:** exact brute-force k-NN via scikit-learn (k=10)
**Queries:** 100 (first 100 vectors of the dataset, used as queries)

| efSearch | Avg Recall@10 | Min Recall | Max Recall | Search time (100 queries) | ms/query |
|---|---|---|---|---|---|
| 50  | 69.4% | 10% | 100% | 28.75ms  | 0.29ms |
| 100 | 77.4% | 20% | 100% | 47.27ms  | 0.47ms |
| 200 | 84.4% | 20% | 100% | 88.68ms  | 0.89ms |
| 400 | 89.6% | 50% | 100% | 134.76ms | 1.35ms |

**Build time:** ~4.3–4.5s to insert 10,000 vectors (unoptimized, single-threaded, array-based heap)

**Key observation:** recall shows diminishing returns as efSearch increases (doubling efSearch 200→400 gained +5.2 points of recall for roughly 2x latency), but higher efSearch disproportionately helps worst-case queries — min recall jumped from 20% to 50% between efSearch=200 and efSearch=400, more than the average improved proportionally. This suggests efSearch tuning is most valuable for improving consistency/reliability on hard queries, not just average-case accuracy.

Plot: `recall_tradeoff.png`

---

## Rate Limiting: Token Bucket vs Sliding Window (under concurrent load)

**Test:** 15 concurrent requests fired simultaneously against a single tenant

**Token Bucket** (capacity=10, refill=1/sec): 11/15 allowed, 4/15 rejected (429).
Some refill occurred mid-burst due to real-world timing variance between "concurrent" requests — expected behavior, token bucket