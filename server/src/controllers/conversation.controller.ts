import type {
    Request,
    Response,
} from "express";

import { getConversationHistory } from "../services/conversation.service.js";
import { ApiError } from "../utils/ApiError.js";
import { createApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listConversations =
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

            const conversations =
                await getConversationHistory(
                    req.user.id,
                );

            res.status(200).json(
                createApiResponse(

                    "Conversation history fetched successfully",
                    {
                        conversations,
                    },
                ),
            );
        },
    );