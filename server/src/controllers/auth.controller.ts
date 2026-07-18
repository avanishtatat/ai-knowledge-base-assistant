import { Request, Response } from "express";

import { loginUser, registerUser } from "../services/auth.service.js";
import { ApiError } from "../utils/ApiError.js";
import { createApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";

interface RegisterBody {
    name: string;
    email: string;
    password: string;
}

interface LoginBody {
    email: string;
    password: string;
}

export const register = asyncHandler(
    async (req: Request<object, object, RegisterBody>, res: Response): Promise<void> => {
        const result = await registerUser(req.body)

        res.status(201).json(
            createApiResponse(
                "User registered successfully",
                result
            )
        )
    }
)

export const login = asyncHandler(
    async (req: Request<object, object, LoginBody>, res: Response): Promise<void> => {
        const result = await loginUser(req.body)

        res.status(200).json(
            createApiResponse(
                "Login successful",
                result
            )
        )
    }
)

export const getCurrentUser = asyncHandler(
    async (req, res): Promise<void> => {
        if (!req.user) {
            throw new ApiError(
                401,
                "Authentication required"
            )
        }
        res.status(200).json(
            createApiResponse(
                "Current user retrieved successfully",
                {
                    user: req.user
                }
            )
        )
    }
)