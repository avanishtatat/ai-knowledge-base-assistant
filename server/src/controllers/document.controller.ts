import type { Request, Response } from "express";

import {
    deleteDocument,
    getDocumentById,
    getDocuments,
} from "../services/documentQuery.service.js";
import { processUploadedDocument } from "../services/document.service.js";
import { ApiError } from "../utils/ApiError.js";
import { createApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadDocument = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) {
            throw new ApiError(
                401,
                "Authentication is required",
            );
        }

        if (!req.file) {
            throw new ApiError(
                400,
                "Please upload a document",
            );
        }

        const document =
            await processUploadedDocument({
                ownerId: req.user.id,
                file: req.file,
            });

        res.status(201).json(
            createApiResponse(
                "Document uploaded and processed successfully",
                {
                    document: {
                        id: document._id,
                        originalName:
                            document.originalName,
                        mimeType: document.mimeType,
                        size: document.size,
                        status: document.status,
                        uploadedAt: document.createdAt,
                    },
                },

            ),
        );
    },
);

export const listDocuments = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) {
            throw new ApiError(
                401,
                "Authentication is required",
            );
        }

        const documents =
            await getDocuments(req.user.id);

        res.status(200).json(
            createApiResponse(

                "Documents fetched successfully",
                { documents },
            ),
        );
    },
);

export const getDocument = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) {
            throw new ApiError(
                401,
                "Authentication is required",
            );
        }

        const rawDocumentId = req.params.documentId
        if (Array.isArray(rawDocumentId) || typeof rawDocumentId !== "string") {
            throw new ApiError(400, 'Document Id is required')
        }
        const documentId = rawDocumentId

        const document =
            await getDocumentById(
                req.user.id,
                documentId,
            );

        res.status(200).json(
            createApiResponse(

                "Document fetched successfully",
                { document },
            ),
        );
    },
);

export const removeDocument = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) {
            throw new ApiError(
                401,
                "Authentication is required",
            );
        }

        const rawDocumentId = req.params.documentId
        if (Array.isArray(rawDocumentId) || typeof rawDocumentId !== "string") {
            throw new ApiError(400, 'Document Id is required')
        }
        const documentId = rawDocumentId

        await deleteDocument(
            req.user.id,
            documentId
        );

        res.status(200).json(
            createApiResponse(
                "Document deleted successfully",
                null,
            ),
        );
    },
);