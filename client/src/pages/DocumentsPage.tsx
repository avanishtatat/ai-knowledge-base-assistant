import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import axios from "axios";
import {
  FileText,
  MessageCircleQuestion,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  deleteDocument,
  getDocuments,
  uploadDocument,
} from "../api/documents.api";
import type { Document } from "../types/document";

interface ErrorResponse {
  message?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** unitIndex;

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getReadableFileType(mimeType: string, fileName: string): string {
  const fileTypes: Record<string, string> = {
    "application/pdf": "PDF document",
    "text/markdown": "Markdown document",
    "text/plain": "Text document",
  };

  if (fileTypes[mimeType]) {
    return fileTypes[mimeType];
  }

  const extension = fileName.split(".").pop();
  return extension && extension !== fileName
    ? `${extension.toUpperCase()} file`
    : "Document";
}

function getStatusClasses(status: string): string {
  switch (status.toLowerCase()) {
    case "ready":
      return "bg-emerald-50 text-emerald-700";
    case "processing":
      return "bg-amber-50 text-amber-700";
    case "failed":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function isSupportedFile(file: File): boolean {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  return [".pdf", ".md", ".txt"].includes(extension);
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    return error.response?.data.message ?? fallback;
  }

  return fallback;
}

export function DocumentsPage() {
  const [reloadKey, setReloadKey] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadDocuments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getDocuments();

        if (isActive) {
          setDocuments(data);
        }
      } catch {
        if (isActive) {
          setError("Unable to load your documents. Please try again.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadDocuments();

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (file && !isSupportedFile(file)) {
      toast.error("Please select a PDF, Markdown, or plain text file.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a document to upload.");
      return;
    }

    if (!isSupportedFile(selectedFile)) {
      toast.error("Please select a PDF, Markdown, or plain text file.");
      return;
    }

    setIsUploading(true);

    try {
      await uploadDocument(selectedFile);
      toast.success("Document uploaded successfully");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setReloadKey((current) => current + 1);
    } catch (uploadError) {
      toast.error(
        getErrorMessage(
          uploadError,
          "Unable to upload the document. Please try again.",
        ),
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(document: Document) {
    if (deletingDocumentId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Delete “${document.originalName}”? Your conversation history will remain available.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingDocumentId(document.id);

    try {
      await deleteDocument(document.id);
      toast.success("Document deleted successfully");
      setReloadKey((current) => current + 1);
    } catch (deleteError) {
      toast.error(
        getErrorMessage(
          deleteError,
          "Unable to delete the document. Please try again.",
        ),
      );
    } finally {
      setDeletingDocumentId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Documents
        </h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Upload and manage your knowledge base files
        </p>
      </div>

      <form
        className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        onSubmit={handleUpload}
      >
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="document-file"
        >
          Choose a document
        </label>
        <p className="mt-1 text-xs text-slate-500">
          PDF, Markdown, or plain text
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            ref={fileInputRef}
            id="document-file"
            className="block min-w-0 flex-1 rounded-lg border border-slate-300 text-sm text-slate-600 file:mr-4 file:border-0 file:border-r file:border-slate-300 file:bg-slate-50 file:px-4 file:py-2.5 file:font-medium file:text-slate-700 hover:file:bg-slate-100"
            type="file"
            accept=".pdf,.md,.txt"
            disabled={isUploading}
            onChange={handleFileChange}
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isUploading}
          >
            <Upload className="size-4" aria-hidden="true" />
            {isUploading ? "Uploading…" : "Upload document"}
          </button>
        </div>
        {selectedFile && (
          <p className="mt-3 truncate text-sm text-slate-600">
            Selected:{" "}
            <span className="font-medium text-slate-900">
              {selectedFile.name}
            </span>
          </p>
        )}
      </form>

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Your documents
          </h2>
        </div>

        {isLoading && (
          <div className="p-8 text-center text-sm text-slate-600">
            Loading documents…
          </div>
        )}

        {!isLoading && error && (
          <div className="p-8 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              onClick={() => setReloadKey((current) => current + 1)}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && documents.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-600">
            No documents yet. Upload your first document to start building your
            knowledge base.
          </div>
        )}

        {!isLoading && !error && documents.length > 0 && (
          <ul className="divide-y divide-slate-200">
            {documents.map((document) => {
              const isReady = document.status.toLowerCase() === "ready";
              const isDeleting = deletingDocumentId === document.id;

              return (
                <li
                  key={document.id}
                  className="flex flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                      <FileText className="size-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {document.originalName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                        <span>
                          {getReadableFileType(
                            document.mimeType,
                            document.originalName,
                          )}
                        </span>
                        <span aria-hidden="true">•</span>
                        <span>{formatFileSize(document.size)}</span>
                        <span aria-hidden="true">•</span>
                        <span>{formatDate(document.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:pl-11 lg:pl-0">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClasses(document.status)}`}
                    >
                      {document.status}
                    </span>

                    {isReady ? (
                      <Link
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                        to={`/documents/${document.id}/ask`}
                        state={{ documentName: document.originalName }}
                      >
                        <MessageCircleQuestion
                          className="size-4"
                          aria-hidden="true"
                        />
                        Ask Question
                      </Link>
                    ) : (
                      <span
                        className="inline-flex cursor-not-allowed items-center gap-1.5 text-sm font-medium text-slate-400"
                        aria-disabled="true"
                      >
                        <MessageCircleQuestion
                          className="size-4"
                          aria-hidden="true"
                        />
                        Ask Question
                      </span>
                    )}

                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isDeleting}
                      onClick={() => void handleDelete(document)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      {isDeleting ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
