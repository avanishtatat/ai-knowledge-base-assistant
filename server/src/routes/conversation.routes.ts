import { Router } from "express";

import { listConversations } from "../controllers/conversation.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", listConversations);

export default router;