import type {
    Request,
    Response,
} from "express";

import { getDashboardData } from "../services/dashboard.service.js";
import { ApiError } from "../utils/ApiError.js";
import { createApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboard =
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

            const dashboard =
                await getDashboardData(
                    req.user.id,
                );

            res.status(200).json(
                createApiResponse(
                    "Dashboard data fetched successfully",
                    dashboard,
                ),
            );
        },
    );