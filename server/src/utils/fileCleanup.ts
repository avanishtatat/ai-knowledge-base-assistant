import { unlink } from "node:fs/promises";

export async function safelyDeleteFile(
  filePath?: string,
): Promise<void> {
  if (!filePath) {
    return;
  }

  try {
    await unlink(filePath);
  } catch (error) {
    const nodeError =
      error as NodeJS.ErrnoException;

    if (nodeError.code !== "ENOENT") {
      console.error(
        `Unable to delete file: ${filePath}`,
        error,
      );
    }
  }
}