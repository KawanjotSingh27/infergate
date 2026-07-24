import { HNSWNode, createNode } from "./types.js";
import { euclideanDistance } from "./distance.js";

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

  insert(vector:Float32Array):number{
    if(this.nodes.size==0) {
        const nodeId=this.nextId++;
        this.nodes.set(nodeId,createNode(nodeId,vector,this.randomLevel()));
        this.entryPointId=nodeId;
        return nodeId;
    }
    throw new Error("insert() for non-empty index not implemented yet");
  }
  // insert() and search() go here next
}