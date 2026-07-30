import { HNSWNode, createNode } from "./types.js";
import { euclideanDistance } from "./distance.js";
import { MinHeap } from "./heap.js";

export interface HNSWConfig {
  M: number;              // max neighbors per node per layer
  efConstruction: number; // candidate list size during insertion
  dimensions: number;     // vector dimensionality, for validation
}

export class HNSWIndex {
  private nodes = new Map<number, HNSWNode>();
  private entryPointId: number | null = null;
  private levelMultiplier: number;
  private nextId = 0;

  constructor(private config: HNSWConfig) {
    this.levelMultiplier = 1 / Math.log(config.M);
  }

  private randomLevel(): number {
    return Math.floor(-Math.log(Math.random()) * this.levelMultiplier);
  }

  private distance(a: Float32Array, b: Float32Array): number {
    return euclideanDistance(a, b);
  }

  private greedySearchLayer(query: Float32Array, entryId: number, layer: number): number {
    let currentId = entryId;
    let currentNode = this.nodes.get(currentId)!;
    let currentDist = this.distance(query, currentNode.vector);

    while (true) {
      let closestNeighborId: number | null = null;
      let closestNeighborDist = currentDist;

      for (const neighborId of currentNode.neighbors[layer] ?? []) {
        const neighborNode = this.nodes.get(neighborId)!;
        const d = this.distance(query, neighborNode.vector);
        if (d < closestNeighborDist) {
          closestNeighborDist = d;
          closestNeighborId = neighborId;
        }
      }

      if (closestNeighborId === null) {
        return currentId;
      }

      currentId = closestNeighborId;
      currentNode = this.nodes.get(currentId)!;
      currentDist = closestNeighborDist;
    }
  }

  private searchLayerCandidates(
    query: Float32Array,
    entryId: number,
    layer: number,
    ef: number
  ): number[] {
    const entryNode = this.nodes.get(entryId)!;
    const entryDist = this.distance(query, entryNode.vector);

    const visited = new Set<number>([entryId]);

    const frontier = new MinHeap<{ id: number; dist: number }>((a, b) => a.dist - b.dist);
    frontier.push({ id: entryId, dist: entryDist });

    const best = new MinHeap<{ id: number; dist: number }>((a, b) => b.dist - a.dist); // inverted = max-heap
    best.push({ id: entryId, dist: entryDist });

    while (frontier.size > 0) {
      const current = frontier.pop()!;

      const worstInBest = best.peek();
      if (best.size >= ef && worstInBest && current.dist > worstInBest.dist) {
        break;
      }

      const currentNode = this.nodes.get(current.id)!;
      for (const neighborId of currentNode.neighbors[layer] ?? []) {
        if (visited.has(neighborId)) continue;
        visited.add(neighborId);

        const neighborNode = this.nodes.get(neighborId)!;
        const d = this.distance(query, neighborNode.vector);

        const worst = best.peek();
        if (best.size < ef || !worst || d < worst.dist) {
          frontier.push({ id: neighborId, dist: d });
          best.push({ id: neighborId, dist: d });
          if (best.size > ef) {
            best.pop();
          }
        }
      }
    }

    const result: number[] = [];
    let item;
    while ((item = best.pop())) {
      result.push(item.id);
    }
    return result.reverse();
  }

  private pruneNeighbors(node: HNSWNode, layer: number): number[] {
    const neighborIds = node.neighbors[layer];
    let worstId = neighborIds![0]!;
    let worstDist = this.distance(node.vector, this.nodes.get(worstId)!.vector);

    for (const id of neighborIds!) {
      const d = this.distance(node.vector, this.nodes.get(id)!.vector);
      if (d > worstDist) {
        worstDist = d;
        worstId = id;
      }
    }

    return neighborIds!.filter((id) => id !== worstId);
  }

  insert(vector:Float32Array):number{
    const level = this.randomLevel();
    const nodeId=this.nextId++;
    const newNode = createNode(nodeId, vector, level);

    if(this.nodes.size==0) {
      this.nodes.set(nodeId, newNode);
      this.entryPointId=nodeId;
      return nodeId;
    }

    this.nodes.set(nodeId, newNode);
    let currentEntryId = this.entryPointId!;
    const entryNode = this.nodes.get(currentEntryId)!;
    let currentLayer = entryNode.level;

    while (currentLayer > level) {
      currentEntryId = this.greedySearchLayer(vector, currentEntryId, currentLayer);
      currentLayer--;
    }

    for (let l = Math.min(level, currentLayer); l >= 0; l--) {
      const candidates = this.searchLayerCandidates(vector, currentEntryId, l, this.config.efConstruction);

      const selectedNeighbors = candidates.slice(0, this.config.M);
      newNode.neighbors[l] = selectedNeighbors;

      for (const neighborId of selectedNeighbors) {
        const neighborNode = this.nodes.get(neighborId)!;
        neighborNode.neighbors[l]!.push(nodeId);

        if (neighborNode.neighbors[l]!.length > this.config.M) {
          neighborNode.neighbors[l] = this.pruneNeighbors(neighborNode, l);
        }
      }
      
      currentEntryId = candidates[0] ?? currentEntryId;
    }

    if (level > this.nodes.get(this.entryPointId!)!.level) {
      this.entryPointId = nodeId;
    }

    return nodeId;
  }

  search(query: Float32Array, k: number, efSearch: number): number[] {
    if (this.nodes.size === 0) return [];

    const effectiveEf = Math.max(efSearch, k);

    let currId=this.entryPointId!;
    const entryNode=this.nodes.get(currId)!;
    let currLevel=entryNode.level;

    while(currLevel>0){
      currId=this.greedySearchLayer(query,currId,currLevel);
      currLevel--;
    }

    const res=this.searchLayerCandidates(query,currId,0,effectiveEf);
    return res.slice(0,k);
  }
}