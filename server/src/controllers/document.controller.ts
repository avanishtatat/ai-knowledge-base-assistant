import type { Request, Response } from "express";

import { processUploadedDocument } from "../services/document.service.js";
import { ApiError } from "../utils/ApiError.js";
import { createApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadDocument = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
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

        res.status(201)
            .json(
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
                            uploadedAt:
                                document.createdAt,
                        },
                    },

                ),
            );
    },
);