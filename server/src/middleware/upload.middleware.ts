import { randomUUID } from "node:crypto";
import path from "node:path";
import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";

import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { ensureUserUploadDirectory } from "../utils/fileStorage.js";

const allowedExtensions = new Set([".pdf", ".md", ".txt"]);

function isAllowedFile(file: Express.Multer.File): boolean {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.has(extension)) {
        return false;
    }

    if (extension === ".pdf") {
        return [
            "application/pdf",
            "application/octet-stream",
        ].includes(file.mimetype);
    }

    return ["text/markdown", "text/plain", "application/octet-stream"].includes(file.mimetype);
}

const storage = multer.diskStorage({
    destination: (req, _file, callback) => {
        const userId = req.user?.id

        if (!userId) {
            callback(
                new ApiError(401, 'Authentication required'),
                ""
            );
            return
        }

        ensureUserUploadDirectory(userId)
            .then((directory) => {
                callback(null, directory)
            })
            .catch((error: unknown) => {
                callback(
                    error instanceof Error ? error : new Error('Unable to create upload directory'),
                    ""
                )
            })
    },

    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const storedName = `${randomUUID()}${extension}`

        callback(null, storedName);
    },
})

function fileFilter(_req: Request, file: Express.Multer.File, callback: FileFilterCallback): void {
    if (!isAllowedFile(file)) {
        callback(new ApiError(400, 'Only PDF, Markdown and TXT files are allowed'))
        return
    }
    callback(null, true);
}

export const uploadDocumentFile = multer({
    storage,
    fileFilter,

    limits: {
        fileSize: env.maxFileSizeMb * 1024 * 1024,
        files: 1
    }
});