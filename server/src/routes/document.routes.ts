import { Router } from "express";

import { uploadDocument } from "../controllers/document.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  uploadDocumentFile,
} from "../middleware/upload.middleware.js";

const router = Router();

router.post(
  "/upload",
  authenticate,
  uploadDocumentFile.single("document"),
  uploadDocument,
);

export default router;