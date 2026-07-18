import { Router } from "express";

import { askDocumentQuestion } from "../controllers/question.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { askQuestionValidator } from "../validators/question.validator.js";

const router = Router();

router.use(authenticate);

router.post(
  "/ask",
  askQuestionValidator,
  validateRequest,
  askDocumentQuestion,
);

export default router;