export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly details?: unknown;

    constructor(statusCode: number, message: string, details?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.details = details;

        // Set the prototype explicitly to maintain the correct prototype chain
        Object.setPrototypeOf(this, new.target.prototype);
    }
}