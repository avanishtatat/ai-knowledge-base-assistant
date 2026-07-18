import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';

import mongoose from 'mongoose';

import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const errorHandler: ErrorRequestHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    console.error('Error:', err);

    if (err instanceof ApiError) {
        res.status(err.statusCode).json({ success: false, message: err.message, ...(err.details !== undefined && { details: err.details }) });
        return;
    }

    if (err instanceof mongoose.Error.ValidationError) {
        res.status(400).json({ success: false, message: 'Database validation failed', details: Object.values(err.errors).map((validationError) => validationError.message) });
        return;
    }

    if (typeof err === 'object' && err !== null && 'code' in err && err.code === 11000) {
        res.status(409).json({ success: false, message: 'A record with this value already exists' });
        return;
    }

    const message = err instanceof Error ? err.message : 'An unexpected error occurred';

    res.status(500).json({
        success: false,
        message: env.nodeEnv === 'production' ? 'Internal Server Error' : message,
    })
}