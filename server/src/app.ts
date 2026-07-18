import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

import { authRouter } from './routes/auth.routes.js';
import documentRouter from "./routes/document.routes.js";
import questionRoutes from "./routes/question.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

export const app = express();

app.disable('x-powered-by');

app.use(helmet());
app.use(cors(
    {
        origin: env.clientUrl,
        credentials: true,
    }
))
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/documents', documentRouter)
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/conversations", conversationRoutes);
app.use("/api/v1/dashboard", dashboardRoutes)

app.get('/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'Server is healthy', environment: env.nodeEnv, timestamp: new Date().toISOString() });
})

app.use(notFoundHandler);
app.use(errorHandler);