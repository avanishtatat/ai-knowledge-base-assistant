import 'dotenv/config';

function getRequiredEnv(name: string): string {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

function getNumberEnv(name: string, fallback: number): number {
    const rawValue = process.env[name]?.trim();

    if (!rawValue) {
        return fallback;
    }

    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue)) {
        throw new Error(`Environment variable ${name} must be a valid number`)
    }

    return parsedValue;
    
}

const nodeEnv = process.env.NODE_ENV?.trim() || 'development';

if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error(`NODE_ENV must be development, test or production`);
}

export const env = {
    nodeEnv,
    port: getNumberEnv('PORT', 5000),

    mongodbUri: getRequiredEnv('MONGODB_URI'),

    jwtSecret: getRequiredEnv('JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || '7d',

    geminiApiKey: process.env.GEMINI_API_KEY?.trim() || '',
    geminiGenerationModel: process.env.GEMINI_GENERATION_MODEL?.trim() || '',
    geminiEmbeddingModel: process.env.GEMINI_EMBEDDING_MODEL?.trim() || 'gemini-embedding-001',

    clientUrl: process.env.CLIENT_URL?.trim() || 'http://localhost:5173',

    maxFileSizeMb: getNumberEnv('MAX_FILE_SIZE_MB', 5),
    chunkSize: getNumberEnv('CHUNK_SIZE', 1000),
    chunkOverlap: getNumberEnv('CHUNK_OVERLAP', 150),
    retrievalTopK: getNumberEnv('RETRIEVAL_TOP_K', 5),
} as const;