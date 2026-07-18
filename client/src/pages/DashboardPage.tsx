import { useEffect, useState } from "react";
import { FileText, Files, MessageCircleQuestion } from "lucide-react";
import { Link } from "react-router-dom";
import { getDashboardData } from "../api/dashboard.api";
import type { DashboardData } from "../types/dashboard";

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
  const knownTypes: Record<string, string> = {
    "application/pdf": "PDF document",
    "application/msword": "Word document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "Word document",
    "text/plain": "Text document",
  };

  if (knownTypes[mimeType]) {
    return knownTypes[mimeType];
  }

  const extension = fileName.split(".").pop();
  return extension && extension !== fileName
    ? `${extension.toUpperCase()} file`
    : "Document";
}

export function DashboardPage() {
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);

        const dashboard = await getDashboardData();

        if (isActive) {
          setDashboard(dashboard);
        }
      } catch {
        if (isActive) {
          setError("Unable to load your dashboard. Please try again.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Overview of your knowledge base activity
        </p>
      </div>

      {isLoading && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          Loading dashboard…
        </div>
      )}

      {!isLoading && error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            onClick={() => setReloadKey((value) => value + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && dashboard && (
        <>
          <section
            className="mt-8 grid gap-4 sm:grid-cols-2"
            aria-label="Knowledge base statistics"
          >
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Documents
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {dashboard.totalDocuments.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-blue-700">
                  <Files className="size-6" aria-hidden="true" />
                </div>
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Questions
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {dashboard.totalQuestions.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-violet-50 p-3 text-violet-700">
                  <MessageCircleQuestion
                    className="size-6"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </article>
          </section>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Documents
              </h2>
            </div>

            {dashboard.recentDocuments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-600">
                  No documents uploaded yet.
                </p>
                <Link
                  className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                  to="/documents"
                >
                  Go to documents
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {dashboard.recentDocuments.map((document) => (
                  <li
                    key={document.id}
                    className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
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

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-700">
                        {document.status}
                      </span>
                      <Link
                        className="whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-700"
                        to={`/documents/${document.id}/ask`}
                        state={{ documentName: document.originalName }}
                      >
                        Ask Question
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
