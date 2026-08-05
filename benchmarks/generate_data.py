import numpy as np

np.random.seed(42)

N = 10_000       
DIM = 128        
K = 10           

vectors = np.random.randn(N, DIM).astype(np.float32)
queries = vectors[:100]  

np.save("vectors.npy", vectors)
np.save("queries.npy", queries)

print(f"Generated {N} vectors of dimension {DIM}")
print(f"Saved {len(queries)} query vectors")

import json
with open("vectors.json", "w") as f:
    json.dump(vectors.tolist(), f)
with open("queries.json", "w") as f:
    json.dump(queries.tolist(), f)
print("Also saved JSON versions for TypeScript")