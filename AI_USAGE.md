# AI usage

## AI inside the application

The backend uses Google's `@google/genai` SDK. `GEMINI_EMBEDDING_MODEL` selects the embedding model and defaults to `gemini-embedding-001`; the answer model is configured through `GEMINI_GENERATION_MODEL`.

Uploaded text is split into overlapping chunks and embedded in batches. When a user asks a question, the backend generates a question embedding, compares it with the selected document's chunk vectors using cosine similarity, and keeps the top five chunks. Gemini receives those chunks with the question and instructions to answer only from the supplied context.

I used RAG instead of sending the whole document on every request because it keeps prompts focused, avoids repeatedly sending irrelevant content, and works better as document size grows.

## AI assistance during development

I used AI tools to plan selected implementation steps, explain unfamiliar TypeScript and backend behavior, review code, debug integration issues, and improve documentation. I still implemented the project incrementally and checked suggestions against the assessment requirements and the actual repository.

I manually tested the main registration, login, upload, question, deletion, and history flows. The code and running behavior remained the source of truth.

## Development approach

The most useful approach was to work one phase at a time, provide the existing code before requesting changes, and set strict scope limits. Before connecting frontend pages, I checked the backend routes, controllers, request bodies, and response shapes. Builds and manual flow checks were run throughout rather than left until the end.

## One concrete limitation

AI suggestions can assume a conventional contract that the project does not use. The question flow was initially assumed to call `POST /documents/:documentId/ask`, while the backend actually exposes `POST /questions/ask` with `documentId` and `question` in the body. Reviewing the route and controller corrected the frontend implementation.

