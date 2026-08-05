import matplotlib.pyplot as plt

ef_search_values = [50, 100, 200, 400]
avg_recall = [0.694, 0.774, 0.844, 0.896]
ms_per_query = [0.29, 0.47, 0.89, 1.35]

fig, ax1 = plt.subplots(figsize=(8, 5))

ax1.set_xlabel("efSearch")
ax1.set_ylabel("Recall@10", color="tab:blue")
ax1.plot(ef_search_values, avg_recall, marker="o", color="tab:blue", label="Recall@10")
ax1.tick_params(axis="y", labelcolor="tab:blue")

ax2 = ax1.twinx()
ax2.set_ylabel("ms per query", color="tab:red")
ax2.plot(ef_search_values, ms_per_query, marker="s", color="tab:red", label="Latency (ms/query)")
ax2.tick_params(axis="y", labelcolor="tab:red")

plt.title("HNSW: Recall vs Search Latency Tradeoff (M=16, efConstruction=100)")
fig.tight_layout()
plt.savefig("recall_tradeoff.png", dpi=150)
print("Saved plot to recall_tradeoff.png")