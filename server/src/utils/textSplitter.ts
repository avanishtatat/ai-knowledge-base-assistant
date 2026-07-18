import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";

export interface TextChunk {
  chunkIndex: number;
  text: string;
}

export function splitTextIntoChunks(
  text: string,
): TextChunk[] {
  const chunkSize = env.chunkSize;
  const chunkOverlap = env.chunkOverlap;

  if (chunkSize <= 0) {
    throw new ApiError(
      500,
      "CHUNK_SIZE must be greater than zero",
    );
  }

  if (
    chunkOverlap < 0 ||
    chunkOverlap >= chunkSize
  ) {
    throw new ApiError(
      500,
      "CHUNK_OVERLAP must be smaller than CHUNK_SIZE",
    );
  }

  const normalizedText = text.trim();

  if (!normalizedText) {
    return [];
  }

  const chunks: TextChunk[] = [];
  const step = chunkSize - chunkOverlap;

  for (
    let start = 0;
    start < normalizedText.length;
    start += step
  ) {
    const end = Math.min(
      start + chunkSize,
      normalizedText.length,
    );

    let chunkText = normalizedText
      .slice(start, end)
      .trim();

    /*
     * Avoid cutting the final word when possible.
     */
    if (
      end < normalizedText.length &&
      chunkText.includes(" ")
    ) {
      const lastSpaceIndex =
        chunkText.lastIndexOf(" ");

      const minimumUsefulLength =
        Math.floor(chunkSize * 0.7);

      if (
        lastSpaceIndex >= minimumUsefulLength
      ) {
        chunkText = chunkText
          .slice(0, lastSpaceIndex)
          .trim();
      }
    }

    if (chunkText) {
      chunks.push({
        chunkIndex: chunks.length,
        text: chunkText,
      });
    }

    if (end === normalizedText.length) {
      break;
    }
  }

  return chunks;
}