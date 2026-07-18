export function cosineSimilarity(
  vectorA: number[],
  vectorB: number[],
): number {
  if (
    vectorA.length === 0 ||
    vectorB.length === 0
  ) {
    return 0;
  }

  if (vectorA.length !== vectorB.length) {
    throw new Error(
      "Embedding vectors must have the same length",
    );
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let index = 0; index < vectorA.length; index += 1) {
    const valueA = vectorA[index];
    const valueB = vectorB[index];

    if (
      valueA === undefined ||
      valueB === undefined
    ) {
      continue;
    }

    dotProduct += valueA * valueB;
    magnitudeA += valueA * valueA;
    magnitudeB += valueB * valueB;
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return (
    dotProduct /
    (Math.sqrt(magnitudeA) *
      Math.sqrt(magnitudeB))
  );
}