import type { IUser } from '../models/user.model.js';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name: IUser['name'];
                email: IUser['email'];
            };
        }
    }
}

export {};