# Architecture

## High-level view

```text
React + TypeScript client
          |
          v
Express REST API -----------------> Local filesystem
          |                         (uploads and extracted text)
          v
MongoDB Atlas
          |
          v
Google Gemini API
```

The client and server are separate npm applications. The client communicates through the REST API; document processing, data ownership, retrieval, and Gemini calls remain on the server.

## Frontend

The frontend uses React, TypeScript, Vite, Tailwind CSS, and React Router.

- `AppRoutes` separates public authentication pages from routes protected by `ProtectedRoute` and rendered inside `AppLayout`.
- `AuthContext` restores the current user through `/auth/me` and manages login and logout state.
- A shared Axios client reads `VITE_API_BASE_URL`, attaches the bearer token, and clears it after a 401 response.
- Typed API modules support authentication, dashboard, documents, questions, and conversations.
- Document and conversation searches filter already-loaded data in the browser.
- Shared feedback and formatting utilities keep common page states consistent.

The access token is stored in `localStorage`. Frontend route protection is for navigation and usability; the server performs the real authentication and ownership checks.

Each page owns its request state rather than introducing a global data layer. Initial loaders use effect cleanup guards, while retry and refresh actions trigger the same loader through a small reload key. API mutations use toast feedback and refresh the relevant list after success.

## Backend layers

The Express backend follows a route/controller/service/model structure:

- **Routes** define endpoints and attach authentication, validation, and upload middleware.
- **Controllers** handle HTTP input and response formatting.
- **Services** contain authentication, document processing, retrieval, deletion, dashboard, and conversation logic.
- **Models** persist users, documents, chunks, and conversations in MongoDB.
- **Middleware and utilities** handle JWTs, uploads, validation, errors, files, extraction, chunking, and similarity calculations.

Controllers return a shared `{ success, message, data }` envelope. Operational and validation failures are passed to centralized error middleware, which keeps page-level API handling predictable without leaking production error details.

## Authentication flow

```text
Register or login
  → validate input
  → hash or compare password with bcrypt
  → issue JWT containing userId
  → frontend stores token
  → Axios sends Bearer token
  → backend verifies token and loads user
```

Password hashes are excluded from normal user queries. Protected API routes verify the JWT and attach a typed `req.user` value for downstream ownership checks.

## Document processing

`POST /api/v1/documents/upload` accepts one authenticated multipart field named `document`.

```text
Multer validates and saves file
  → create Document with "processing" status
  → extract and normalize PDF, Markdown, or TXT text
  → store normalized text locally
  → split text into overlapping chunks
  → generate Gemini embeddings
  → store chunks and vectors in MongoDB
  → mark Document "ready"
```

PDF extraction uses `pdf-parse`; Markdown and TXT are read as UTF-8. If processing fails, partial chunks are removed, the record is marked `failed` when available, and generated extraction output is cleaned up. The original upload is retained after a processing failure for inspection.

Documents move through `processing`, `ready`, and `failed` states. Questions are accepted only for a ready document, which prevents retrieval from running against missing or partial chunk data.

## Question answering

`POST /api/v1/questions/ask` receives `documentId` and `question`.

```text
Validate owner and ready document
  → embed question
  → compare against that document's chunk embeddings
  → select top five chunks by cosine similarity
  → send context and question to Gemini
  → store question and answer in Conversation
```

The prompt tells Gemini to answer only from the supplied context and acknowledge insufficient information. Embeddings are stored as number arrays in MongoDB and ranked in application memory rather than through a vector index.

## Conversation history and document deletion

A Conversation stores both a nullable Document reference and a separate `documentTitle` snapshot. When a document is deleted, the service removes its chunks and local files, sets matching conversation references to `null`, and then deletes the Document record.

The saved title, question, and answer remain readable. The frontend shows that the document was deleted and does not offer another-question navigation for that record.

This separates the lifecycle of a knowledge source from the lifecycle of its historical Q&A record without duplicating the full document.

## Models

- **User**: identity, normalized email, hidden password hash, timestamps
- **Document**: owner, names, local paths, MIME type, size, status, failure reason
- **Chunk**: owner, document, position, text, embedding vector
- **Conversation**: owner, nullable document, title snapshot, question, AI answer

Owner fields and indexes support per-user queries. ObjectIds are converted or normalized to frontend string IDs at API boundaries.

## Security and isolation

- Protected route groups require a valid bearer token.
- Document, chunk, and conversation queries include the authenticated owner.
- bcrypt protects passwords, and JWT claims are validated before use.
- Multer restricts extensions, compatible MIME types, file count, and configured size.
- Helmet is enabled, `x-powered-by` is disabled, CORS uses `CLIENT_URL`, and JSON bodies are limited to 1 MB.
- Central middleware handles validation, operational errors, and missing routes.
- Secrets are loaded from ignored environment files.

## Trade-offs

- Local file storage is simple but not durable on ephemeral hosting.
- MongoDB embeddings avoid another service but require loading and ranking all chunks for a selected document in memory.
- Client-side search suits the current assessment scale but depends on unpaginated list responses.
- One access token is simpler than a refresh-token flow but requires signing in again after expiry.
- Upload processing keeps the request open until extraction and embedding finish.

## Future improvements

- Persistent object storage
- Vector indexing or a dedicated vector store
- Server-side pagination and search
- Background document processing with status updates
- Streaming answers
- Refresh-token rotation and usage limits
- Document preview and controlled downloads
