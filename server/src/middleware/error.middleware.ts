import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';

import { env } from '../config/env.js';

export const errorHandler: ErrorRequestHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
    console.error('Error:', err);

    const message = err instanceof Error ? err.message : 'An unexpected error occurred';

    res.status(500).json({
        success: false,
        message: env.nodeEnv === 'production' ? 'Internal Server Error' : message,
    })
}