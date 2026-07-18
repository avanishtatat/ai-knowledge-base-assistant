import type {
    Request,
    Response,
} from "express";

import { askQuestion } from "../services/question.service.js";
import { ApiError } from "../utils/ApiError.js";
import { createApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const askDocumentQuestion =
    asyncHandler(
        async (
            req: Request,
            res: Response,
        ) => {
            if (!req.user) {
                throw new ApiError(
                    401,
                    "Authentication is required",
                );
            }

            const {
                documentId,
                question,
            } = req.body as {
                documentId: string;
                question: string;
            };

            const result = await askQuestion({
                ownerId: req.user.id,
                documentId,
                question,
            });

            res.status(201).json(
                createApiResponse(
                    "Question answered successfully",
                    result,
                ),
            );
        },
    );