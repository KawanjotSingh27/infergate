import numpy as np
from sklearn.neighbors import NearestNeighbors
import json

vectors = np.load("vectors.npy")
queries = np.load("queries.npy")
K = 10

nn = NearestNeighbors(n_neighbors=K, algorithm="brute", metric="euclidean")
nn.fit(vectors)

distances, indices = nn.kneighbors(queries)

ground_truth = {
    "k": K,
    "results": indices.tolist()
}

with open("ground_truth.json", "w") as f:
    json.dump(ground_truth, f)

print(f"Computed exact top-{K} neighbors for {len(queries)} queries")
print(f"Example - query 0's true nearest neighbors: {indices[0]}")