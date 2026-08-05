import json

with open("ground_truth.json") as f:
    truth = json.load(f)

with open("hnsw_results.json") as f:
    hnsw = json.load(f)

k = truth["k"]
true_results = truth["results"]
hnsw_results = hnsw["results"]

assert len(true_results) == len(hnsw_results), "mismatched number of queries"

def recall_at_k(true_ids, approx_ids, k):
    true_set = set(true_ids[:k])
    approx_set = set(approx_ids[:k])
    return len(true_set & approx_set) / k

recalls = [
    recall_at_k(true_results[i], hnsw_results[i], k)
    for i in range(len(true_results))
]

avg_recall = sum(recalls) / len(recalls)

print(f"Average recall@{k} across {len(recalls)} queries: {avg_recall:.4f}")
print(f"Min recall: {min(recalls):.4f}, Max recall: {max(recalls):.4f}")