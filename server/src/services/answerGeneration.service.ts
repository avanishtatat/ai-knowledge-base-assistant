import { GoogleGenAI } from "@google/genai";

import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const ai = new GoogleGenAI({
  apiKey: env.geminiApiKey,
});

interface GenerateAnswerInput {
  question: string;
  documentTitle: string;
  contextChunks: string[];
}

export async function generateGroundedAnswer({
  question,
  documentTitle,
  contextChunks,
}: GenerateAnswerInput): Promise<string> {
  if (contextChunks.length === 0) {
    throw new ApiError(
      400,
      "No relevant document content was found",
    );
  }

  const context = contextChunks
    .map(
      (chunk, index) =>
        `[Context ${index + 1}]\n${chunk}`,
    )
    .join("\n\n");

  const prompt = `
You are an AI knowledge-base assistant.

Answer the user's question using only the supplied document context.

Rules:
1. Do not use outside knowledge.
2. If the context does not contain enough information, say:
   "I could not find enough information in the selected document to answer this question."
3. Do not invent facts.
4. Give a clear and concise answer.
5. Do not mention context numbers unless useful.
6. The selected document is "${documentTitle}".

Document context:
${context}

User question:
${question}

Answer:
`.trim();

  try {
    const response =
      await ai.models.generateContent({
        model: env.geminiGenerationModel,
        contents: prompt,
        config: {
          temperature: 0.2,
        },
      });

    const answer = response.text?.trim();

    if (!answer) {
      throw new ApiError(
        502,
        "AI provider returned an empty response",
      );
    }

    return answer;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error(
      "Gemini answer generation failed:",
      error,
    );

    throw new ApiError(
      502,
      "Failed to generate an answer",
    );
  }
}