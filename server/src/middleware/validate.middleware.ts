import type { RequestHandler } from 'express';
import { validationResult } from 'express-validator';

import { ApiError } from '../utils/ApiError.js';

export const validateRequest: RequestHandler = (req, _res, next): void => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        throw new ApiError(400, 'Request validation failed', result.array().map((error) => ({
            field: error.type === 'field' ? error.path : undefined,
            message: error.msg as string,
        })))
    }
    next();
};