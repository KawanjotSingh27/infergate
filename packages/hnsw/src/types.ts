export interface HNSWNode {
  id: number;
  vector: Float32Array;
  level: number;                    
  neighbors: number[][];       
}

export function createNode(id: number, vector: Float32Array, level: number): HNSWNode {
  const neighbors: number[][] = [];
  for (let i = 0; i <= level; i++) {
    neighbors.push([]);
  }
  return { id, vector, level, neighbors };
}