import { GoogleGenAI } from "@google/genai";

import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const EMBEDDING_BATCH_SIZE = 20;

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!env.geminiApiKey) {
    throw new ApiError(
      503,
      "Gemini API key is not configured",
    );
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: env.geminiApiKey,
    });
  }

  return aiClient;
}

async function embedBatch(
  texts: string[],
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const ai = getAiClient();

  const response =
    await ai.models.embedContent({
      model: env.geminiEmbeddingModel,
      contents: texts,
    });

  const embeddings = response.embeddings;

  if (
    !embeddings ||
    embeddings.length !== texts.length
  ) {
    throw new ApiError(
      502,
      "Embedding provider returned an invalid response",
    );
  }

  return embeddings.map((embedding) => {
    const values = embedding.values;

    if (!values || values.length === 0) {
      throw new ApiError(
        502,
        "Embedding provider returned an empty embedding",
      );
    }

    return values;
  });
}

export async function generateEmbeddings(
  texts: string[],
): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (
    let index = 0;
    index < texts.length;
    index += EMBEDDING_BATCH_SIZE
  ) {
    const batch = texts.slice(
      index,
      index + EMBEDDING_BATCH_SIZE,
    );

    const batchEmbeddings =
      await embedBatch(batch);

    embeddings.push(...batchEmbeddings);
  }

  return embeddings;
}

export async function generateQueryEmbedding(
  question: string,
): Promise<number[]> {
  const [embedding] =
    await generateEmbeddings([question]);

  if (!embedding) {
    throw new ApiError(
      502,
      "Unable to generate question embedding",
    );
  }

  return embedding;
}