import { isValidObjectId } from "mongoose";

import { ChunkModel } from "../models/chunk.model.js";
import { ConversationModel } from "../models/conversation.model.js";
import { DocumentModel } from "../models/document.model.js";
import { ApiError } from "../utils/ApiError.js";
import { cosineSimilarity } from "../utils/cosineSimilarity.js";
import { generateGroundedAnswer } from "./answerGeneration.service.js";
import { generateQueryEmbedding } from "./embedding.service.js";

interface AskQuestionInput {
  ownerId: string;
  documentId: string;
  question: string;
}

interface AskQuestionResult {
  conversationId: string;
  document: {
    id: string;
    title: string;
  };
  question: string;
  answer: string;
  createdAt: Date;
}

interface RankedChunk {
  text: string;
  chunkIndex: number;
  similarity: number;
}

const TOP_CHUNK_COUNT = 5;

export async function askQuestion({
  ownerId,
  documentId,
  question,
}: AskQuestionInput): Promise<AskQuestionResult> {
  if (!isValidObjectId(documentId)) {
    throw new ApiError(
      400,
      "Invalid document id",
    );
  }

  const normalizedQuestion = question.trim();

  if (!normalizedQuestion) {
    throw new ApiError(
      400,
      "Question is required",
    );
  }

  const document = await DocumentModel.findOne({
    _id: documentId,
    owner: ownerId,
  })
    .select("_id originalName status")
    .lean();

  if (!document) {
    throw new ApiError(
      404,
      "Document not found",
    );
  }

  if (document.status !== "ready") {
    throw new ApiError(
      409,
      "Document is not ready for questions",
    );
  }

  const chunks = await ChunkModel.find({
    owner: ownerId,
    document: document._id,
  })
    .select("text embedding chunkIndex")
    .lean();

  if (chunks.length === 0) {
    throw new ApiError(
      404,
      "No processed content was found for this document",
    );
  }

  const questionEmbedding =
    await generateQueryEmbedding(
      normalizedQuestion,
    );

  const rankedChunks: RankedChunk[] = chunks
    .map((chunk) => ({
      text: chunk.text,
      chunkIndex: chunk.chunkIndex,
      similarity: cosineSimilarity(
        questionEmbedding,
        chunk.embedding,
      ),
    }))
    .sort(
      (first, second) =>
        second.similarity - first.similarity,
    )
    .slice(0, TOP_CHUNK_COUNT);

  const answer = await generateGroundedAnswer({
    question: normalizedQuestion,
    documentTitle: document.originalName,
    contextChunks: rankedChunks.map(
      (chunk) => chunk.text,
    ),
  });

  const conversation =
    await ConversationModel.create({
      owner: ownerId,
      document: document._id,
      documentTitle: document.originalName,
      question: normalizedQuestion,
      aiResponse: answer,
    });

  return {
    conversationId:
      conversation._id.toString(),

    document: {
      id: document._id.toString(),
      title: document.originalName,
    },

    question: conversation.question,
    answer: conversation.aiResponse,
    createdAt: conversation.createdAt,
  };
}