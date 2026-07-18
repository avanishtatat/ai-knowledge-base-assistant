import { Types } from "mongoose";

import { ApiError } from "../utils/ApiError.js";
import { DocumentModel } from "../models/document.model.js";
import { ChunkModel } from "../models/chunk.model.js";
import { safelyDeleteFile } from "../utils/fileCleanup.js";

export async function getDocuments(
    ownerId: Types.ObjectId | string,
) {
    return DocumentModel.find({
        owner: ownerId,
    })
        .select(
            "originalName mimeType size status createdAt",
        )
        .sort({
            createdAt: -1,
        })
        .lean();
}

export async function getDocumentById(
    ownerId: Types.ObjectId | string,
    documentId: string,
) {
    if (!Types.ObjectId.isValid(documentId)) {
        throw new ApiError(
            400,
            "Invalid document id",
        );
    }

    const document =
        await DocumentModel.findOne({
            _id: documentId,
            owner: ownerId,
        });

    if (!document) {
        throw new ApiError(
            404,
            "Document not found",
        );
    }

    return document;
}

export async function deleteDocument(
    ownerId: Types.ObjectId | string,
    documentId: string,
) {
    if (!Types.ObjectId.isValid(documentId)) {
        throw new ApiError(
            400,
            "Invalid document id",
        );
    }

    const document =
        await DocumentModel.findOne({
            _id: documentId,
            owner: ownerId,
        });

    if (!document) {
        throw new ApiError(
            404,
            "Document not found",
        );
    }

    await ChunkModel.deleteMany({
        document: document._id,
    });

    await safelyDeleteFile(
        document.storagePath,
    );

    if (
        document.extractedTextPath &&
        document.extractedTextPath !==
        document.storagePath
    ) {
        await safelyDeleteFile(
            document.extractedTextPath,
        );
    }

    await document.deleteOne();
}