import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFParse } from 'pdf-parse';


import { ApiError } from "./ApiError.js";
import { getExtractedTextPath, saveExtractedText } from "./fileStorage.js";

export interface ExtractedTextResult {
    text: string,
    extractedTextPath: string
}

function normalizeText(text: string): string {
    return text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

async function extractPdfText(filePath: string): Promise<string> {
    const fileBuffer = await readFile(filePath)
    const parser = new PDFParse({ data: fileBuffer })
    try {
        const result = await parser.getText()
        return result.text
    } finally {
        await parser.destroy()
    }
}

async function extractTextFile(filePath: string): Promise<string> {
    return readFile(filePath, "utf8")
}

export async function extractAndSaveText(
    sourceFilePath: string
): Promise<ExtractedTextResult> {
    const extension = path.extname(sourceFilePath).toLowerCase();

    let extractedText: string;

    switch (extension) {
        case ".pdf":
            extractedText = await extractPdfText(sourceFilePath)
            break;
        case ".md":
        case ".txt":
            extractedText = await extractTextFile(sourceFilePath)
            break;
        default:
            throw new ApiError(400, 'Unsupported document type')
    }

    const normalizedText = normalizeText(extractedText)

    if (!normalizedText) {
        throw new ApiError(422, 'The uploaded document contains no readable text')
    }

    if (extension === ".txt") {
        if (normalizedText !== extractedText) {
            await saveExtractedText(
                sourceFilePath,
                normalizedText
            )
        }
        return {
            text: normalizedText,
            extractedTextPath: sourceFilePath
        }
    }
    const extractedTextPath = getExtractedTextPath(sourceFilePath);

    await saveExtractedText(
        extractedTextPath,
        normalizedText
    )
    return {
        text: normalizedText,
        extractedTextPath
    }
}