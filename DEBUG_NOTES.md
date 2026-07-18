# Debug notes

These are the five issues that had the most impact while connecting the frontend and backend.

## Multipart upload failed

### What happened

Uploading reached the backend controller without `req.file`, which returned “Please upload a document”.

### Cause

The shared Axios client globally forced:

```ts
'Content-Type': 'application/json'
```

That prevented the multipart request from receiving the browser-generated boundary.

### Fix

I removed the global content type and let Axios choose it per request. I also matched Multer's actual configuration: the frontend appends the file as `document` and posts to `/documents/upload`.

### Lesson

Do not globally force a content type when one client sends both JSON and `FormData`.

## Frontend and backend API contracts did not match

### What happened

Document links became `/documents/undefined/ask`, and the first question implementation targeted `POST /documents/:documentId/ask`.

### Cause

The document list returned lean records with `_id`, while the frontend expected `id`. The browser's ask route was also mistaken for the backend endpoint; the server actually exposes `POST /questions/ask`.

### Fix

The document API normalizes `_id` to `id` for the UI:

```ts
{ _id, ...document } → { ...document, id: _id }
```

The question API now posts `{ documentId, question }` to `/questions/ask`, while the browser route remains `/documents/:documentId/ask`.

### Lesson

Check the route, body, and response shape together before building dependent navigation.

## JWT and Express typing needed explicit boundaries

### What happened

The JWT library's decoded value was broader than the application's payload, `expiresIn` had a narrower library type, and Express did not know about `req.user`.

### Cause

Library types correctly allow more possibilities than this application accepts.

### Fix

I typed the signing options, rejected decoded values without a string `userId`, and defined an `AccessTokenPayload`. Express declaration merging adds the authenticated `req.user` shape populated by middleware.

### Lesson

A verified signature still needs application-level claim validation, and request augmentation should be typed once rather than cast in every controller.

## Conversation history had to survive document deletion

### What happened

Deleting a document needed to remove its files and retrieval chunks without erasing previous questions and answers.

### Cause

History would become unreadable if every display value depended on the live Document record.

### Fix

Conversation records store `documentTitle` separately. Before deleting a Document, matching conversations are updated to:

```ts
{ document: null }
```

The title, question, and answer remain available, and the frontend removes the ask-again action for deleted documents.

### Lesson

Historical records should retain the small snapshot of display data they need.

## Local files are not safe on ephemeral hosting

### What happened

The deployment review showed that source files and extracted text are written under `server/uploads/<userId>`.

### Cause

Local disk was the simplest storage choice for the assessment, but many hosting services clear it after restarts or deployments.

### Fix

I documented the limitation instead of introducing a late, untested storage migration. MongoDB metadata, chunks, embeddings, and conversations remain persistent, but source and extracted files require object storage for durable hosting.

### Lesson

A known limitation should be explicit. Persistent object storage is the next infrastructure change, not a last-minute patch.

