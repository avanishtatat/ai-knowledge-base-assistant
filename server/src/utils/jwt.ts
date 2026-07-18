import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env.js';
import { ApiError } from './ApiError.js';

export interface AccessTokenPayload extends JwtPayload {
    userId: string;
}

export function generateAccessToken(userId: string): string {
    const options: SignOptions = {
        expiresIn: env.jwtExpiresIn as NonNullable<SignOptions['expiresIn']>,
    };

    return jwt.sign({ userId }, env.jwtSecret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    try {
        const decoded = jwt.verify(token, env.jwtSecret);

        if (typeof decoded === 'string' || typeof decoded.userId !== 'string') {
            throw new ApiError(401, 'Invalid access token');
        }
        
        return decoded as AccessTokenPayload;
        
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        if (error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, 'Access token has expired');
        }
        throw new ApiError(401, 'Invalid access token');
    }
}