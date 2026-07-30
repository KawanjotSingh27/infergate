export class MinHeap<T> {
  private items: T[] = [];

  constructor(private compare: (a: T, b: T) => number) {}

  get size(): number {
    return this.items.length;
  }

  push(item: T): void {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  pop(): T | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  peek(): T | undefined {
    return this.items[0];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.items[index]!, this.items[parentIndex]!) >= 0) break;
      [this.items[index], this.items[parentIndex]] = [this.items[parentIndex]!, this.items[index]!];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const n = this.items.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < n && this.compare(this.items[left]!, this.items[smallest]!) < 0) smallest = left;
      if (right < n && this.compare(this.items[right]!, this.items[smallest]!) < 0) smallest = right;

      if (smallest === index) break;
      [this.items[index], this.items[smallest]] = [this.items[smallest]!, this.items[index]!];
      index = smallest;
    }
  }
}