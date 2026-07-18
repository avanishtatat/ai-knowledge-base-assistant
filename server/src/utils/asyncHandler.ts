import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const asyncHandler = (controller: AsyncController): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        void Promise.resolve(controller(req, res, next)).catch(next);
    }
}