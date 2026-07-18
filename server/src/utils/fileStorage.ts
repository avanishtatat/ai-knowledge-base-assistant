import { dir } from "node:console";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const uploadsRoot = path.resolve('uploads')

export function getUserUploadDirectory(userId: string): string {
    return path.join(uploadsRoot, userId)
}

export async function ensureUserUploadDirectory(userId: string): Promise<string> {
    const directory = getUserUploadDirectory(userId)

    await mkdir(directory, {
        recursive: true
    })

    return directory
}

export function getExtractedTextPath(
    sourceFilePath: string
): string {
    const parsedPath = path.parse(sourceFilePath)

    return path.join(parsedPath.dir, `${parsedPath.name}.txt`)
}

export async function saveExtractedText(
    filePath: string,
    text: string
): Promise<void> {
    await writeFile(filePath, text, "utf-8")
}

export async function deleteFileIfExists(filePath: string | null | undefined): Promise<void> {
    if (!filePath) {
        return
    }

    await rm(filePath, {
        force: true
    });
}