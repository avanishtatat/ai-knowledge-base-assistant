# AI-Powered Knowledge Base Assistant

This is a full-stack knowledge base application where users can register, sign in, and upload PDF, Markdown, or plain-text documents. Once a document has been processed, users can ask questions grounded in that document and review their previous conversations. The frontend also provides local search over document names and conversation questions or document titles.

## Features

- JWT access-token authentication with protected frontend and backend routes
- Password hashing with bcrypt
- PDF, Markdown, and TXT uploads with file-type and size validation
- Text extraction and normalization
- Overlapping text chunking and batched Gemini embedding generation
- Retrieval-augmented question answering against a selected document
- Conversation history that remains readable after its source document is deleted
- Document deletion with chunk and local-file cleanup
- Dashboard totals and the five most recent documents
- Client-side document and conversation search
- Responsive authenticated layout with loading, error, empty, and 404 states

## Tech stack

### Frontend

- React 19 and TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Axios
- react-hot-toast
- lucide-react

### Backend

- Node.js, Express 5, and TypeScript
- MongoDB with Mongoose
- JSON Web Tokens and bcrypt
- Multer for multipart uploads
- `pdf-parse` for PDF text extraction
- Google Gemini through `@google/genai`
- Helmet, CORS, and express-validator

## Repository structure

```text
.
├── client/
│   ├── src/api/          # Typed calls to the REST API
│   ├── src/components/   # Layout and feedback components
│   ├── src/context/      # Authentication state
│   ├── src/pages/        # Route-level UI
│   ├── src/routes/       # Public and protected routing
│   ├── src/types/        # Frontend API/domain types
│   └── src/utils/        # Storage, formatting, and API error helpers
└── server/
    ├── src/controllers/  # HTTP request/response handling
    ├── src/middleware/   # Authentication, upload, validation, and errors
    ├── src/models/       # Mongoose models
    ├── src/routes/       # Express route definitions
    ├── src/services/     # Application and RAG logic
    ├── src/utils/        # JWT, files, extraction, chunking, and similarity
    └── uploads/          # Local runtime file storage
```

## How it works

The document path is:

```text
Upload
  → local file storage
  → text extraction and normalization
  → overlapping chunks
  → Gemini embeddings
  → chunks and vectors stored in MongoDB
```

For a question, the server embeds the question, calculates cosine similarity against the selected document's stored chunk embeddings, takes the five highest-ranked chunks, and sends those chunks with the question to Gemini. The generated answer and original question are then saved as a conversation record.

## Local setup

### Prerequisites

- Node.js 20 or later with npm
- A MongoDB database
- A Gemini API key and valid generation model name

### Install

```bash
git clone <repository-url>
cd ai-knowledge-base-assistant

cd server
npm install

cd ../client
npm install
```

### Configure environment files

Copy each example file and replace its placeholders:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Run locally

In one terminal:

```bash
cd server
npm run dev
```

In another terminal:

```bash
cd client
npm run dev
```

By default, the client runs at `http://localhost:5173` and calls the API at `http://localhost:5000/api/v1`.

### Production builds

```bash
cd server
npm run build
npm start
```

```bash
cd client
npm run build
npm run preview
```

`npm run preview` serves the compiled client for local verification; production hosting still needs to serve `client/dist` and route SPA requests back to `index.html`.

## Environment variables

### `server/.env`

```dotenv
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://username:password@cluster.example.mongodb.net/database

JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=replace-with-your-gemini-api-key
GEMINI_GENERATION_MODEL=replace-with-your-generation-model
GEMINI_EMBEDDING_MODEL=gemini-embedding-001

CLIENT_URL=http://localhost:5173

MAX_FILE_SIZE_MB=5
CHUNK_SIZE=1000
CHUNK_OVERLAP=150
```

`MONGODB_URI`, `JWT_SECRET`, and `JWT_EXPIRES_IN` are checked as required at startup. A Gemini key and generation model are required for document embeddings and answers.

### `client/.env`

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Do not commit real credentials or production secrets.

## API overview

All application API routes are under `/api/v1` and return a consistent success envelope containing `success`, `message`, and `data`.

- `/auth`: registration, login, and current-user lookup
- `/documents`: upload, list, fetch by ID, and delete documents
- `/questions`: ask a question about a ready document
- `/conversations`: retrieve the authenticated user's conversation history
- `/dashboard`: retrieve document/question totals and recent documents
- `/health`: basic server health response outside the `/api/v1` prefix

The upload endpoint is `POST /api/v1/documents/upload`; its multipart field name is `document`. The question endpoint is `POST /api/v1/questions/ask` with `documentId` and `question` in the JSON body.

## Known limitations

- Original uploads and generated extracted-text files are stored on the backend's local filesystem. On a host with ephemeral storage, those files may disappear after a restart or redeployment.
- MongoDB document metadata, chunks, embeddings, and conversation history remain persistent independently of those local files.
- Document preview and download are not implemented in the submitted frontend.
- Document and conversation lists do not use pagination. Their search controls filter the already-loaded data in the browser.
- Retrieval uses in-process cosine similarity over a selected document's MongoDB-stored embeddings rather than a vector index.
- Authentication uses one access token stored in `localStorage`; there is no refresh-token flow.
- The repository does not include a provider-specific deployment manifest.

## Future improvements

- Move source and extracted files to persistent object storage
- Add document preview and controlled download support
- Add server-side pagination for larger document and conversation collections
- Add a vector index or dedicated vector store as the chunk collection grows
- Stream long AI responses
- Add refresh-token rotation and stronger per-user usage limits
