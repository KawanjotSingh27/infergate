export function euclideanDistance(a: Float32Array, b: Float32Array): number {
  // sqrt(sum((a[i] - b[i])^2))
  let sum=0;
  for(let i=0;i<a.length;i++) sum+=(a[i]!-b[i]!)*(a[i]!-b[i]!);
  return Math.sqrt(sum);
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  // dot(a,b) / (magnitude(a) * magnitude(b))
  let dot=0;
  let magA=0;
  let magB=0;
  for(let i=0;i<a.length;i++){
    dot+=a[i]!*b[i]!;
    magA+=a[i]!*a[i]!;
    magB+=b[i]!*b[i]!;
  }
  return dot/Math.sqrt(magA*magB);
}