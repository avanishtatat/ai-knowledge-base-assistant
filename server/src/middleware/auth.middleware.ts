import type { RequestHandler } from "express";

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate: RequestHandler = asyncHandler(
    async (req, _res, next): Promise<void> => {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Authentication token is required");
        }

        const token = authorizationHeader.slice("bearer ".length).trim();

        if (!token) {
            throw new ApiError(401, "Authentication token is required");
        }

        const payload = verifyAccessToken(token);

        const user = await User.findById(payload.userId);

        if (!user) {
            throw new ApiError(401, "User associated with this token no longer exists");
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
        }

        next();
})