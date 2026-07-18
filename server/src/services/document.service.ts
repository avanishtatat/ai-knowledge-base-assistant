import type {
  HydratedDocument,
  Types,
} from "mongoose";

import { ChunkModel } from "../models/chunk.model.js";
import {
  DocumentModel,
  type DocumentRecord,
} from "../models/document.model.js";
import { generateEmbeddings } from "./embedding.service.js";
import { extractAndSaveText } from "../utils/textExtractor.js";
import { splitTextIntoChunks } from "../utils/textSplitter.js";
import { ApiError } from "../utils/ApiError.js";
import { safelyDeleteFile } from "../utils/fileCleanup.js";

interface ProcessUploadedDocumentInput {
  ownerId: Types.ObjectId | string;
  file: Express.Multer.File;
}


export async function processUploadedDocument({
  ownerId,
  file,
}: ProcessUploadedDocumentInput) {
  if (!file) {
    throw new ApiError(
      400,
      "Document file is required",
    );
  }

  const storagePath = file.path;

  let document:
    | HydratedDocument<DocumentRecord>
    | undefined;

  let extractedTextPath: string | undefined;

  try {
    const createdDocument =
      (await DocumentModel.create({
        owner: ownerId,
        originalName: file.originalname,
        storedName: file.filename,
        storagePath,
        extractedTextPath: null,
        mimeType: file.mimetype,
        size: file.size,
        status: "processing",
        failureReason: null,
      })) as HydratedDocument<DocumentRecord>;

    /*
     * Keep this reference for the catch block.
     * If any later processing step fails, we can
     * update the same document as failed.
     */
    document = createdDocument;

    /*
     * PDF:
     *   original.pdf -> extracted.txt
     *
     * Markdown:
     *   original.md -> extracted.txt
     *
     * TXT:
     *   original.txt -> same file path
     */
    const extractedResult =
      await extractAndSaveText(storagePath);

    extractedTextPath =
      extractedResult.extractedTextPath;

    const chunks = splitTextIntoChunks(
      extractedResult.text,
    );

    if (chunks.length === 0) {
      throw new ApiError(
        422,
        "The uploaded document does not contain readable text",
      );
    }

    const embeddings = await generateEmbeddings(
      chunks.map((chunk) => chunk.text),
    );

    if (embeddings.length !== chunks.length) {
      throw new ApiError(
        502,
        "The number of generated embeddings does not match the document chunks",
      );
    }

    const chunkDocuments = chunks.map(
      (chunk, index) => {
        const embedding = embeddings[index];

        if (!embedding) {
          throw new ApiError(
            502,
            `Embedding was not generated for chunk ${index}`,
          );
        }

        return {
          document: createdDocument._id,
          owner: ownerId,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
          embedding,
        };
      },
    );

    await ChunkModel.insertMany(chunkDocuments);

    createdDocument.extractedTextPath =
      extractedTextPath;

    createdDocument.status = "ready";
    createdDocument.failureReason = null;

    await createdDocument.save();

    return createdDocument;
  } catch (error) {
    /*
     * Multer successfully saved the file, but the
     * MongoDB document record could not be created.
     */
    if (!document) {
      await safelyDeleteFile(storagePath);
      throw error;
    }

    /*
     * Remove any chunks that may have been inserted
     * before a later processing step failed.
     */
    await ChunkModel.deleteMany({
      document: document._id,
    });

    document.status = "failed";

    document.failureReason =
      error instanceof Error
        ? error.message
        : "Document processing failed";

    document.extractedTextPath =
      extractedTextPath ?? null;

    /*
     * Keep the original uploaded file so the failed
     * upload can be inspected or retried.
     *
     * Delete only the generated extracted-text file.
     */
    if (
      extractedTextPath &&
      extractedTextPath !== storagePath
    ) {
      await safelyDeleteFile(
        extractedTextPath,
      );

      document.extractedTextPath = null;
    }

    await document.save();

    throw error;
  }
}