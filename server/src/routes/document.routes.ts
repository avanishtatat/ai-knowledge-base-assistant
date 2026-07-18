import { Router } from "express";

import {
  getDocument,
  listDocuments,
  removeDocument,
  uploadDocument,
} from "../controllers/document.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { uploadDocumentFile } from "../middleware/upload.middleware.js";

const router = Router();

router.use(authenticate);

router.post(
  "/upload",
  uploadDocumentFile.single("document"),
  uploadDocument,
);

router.get("/", listDocuments);

router.get("/:documentId", getDocument);

router.delete(
  "/:documentId",
  removeDocument,
);

export default router;