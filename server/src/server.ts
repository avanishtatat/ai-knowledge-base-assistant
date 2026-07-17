import type { Server } from 'node:http';

import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env } from './config/env.js';

let httpServer: Server | undefined;
let isShuttingDown = false;

async function startServer(): Promise<void> {
    try {
        await connectDatabase();

        httpServer = app.listen(env.port, () => {
            console.log(`Server running at http://localhost:${env.port} in ${env.nodeEnv} mode`);
        })
    } catch (error) {
        console.error('App startup failed:', error);
        process.exit(1);
    }
}

async function shutdownServer(signal: string): Promise<void> {
    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;

    console.log(`${signal} received. Shutting down gracefully...`);

    try {
        if (httpServer) {
            await new Promise<void>((resolve, reject) => {
                httpServer?.close((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                })
            })
        }

        await disconnectDatabase();

        console.log('Application shutdown successfully');
        process.exitCode = 0;
    } catch (error) {
        console.error('Graceful shutdown failed:', error);
        process.exitCode = 1;
    }
}

process.on('SIGINT', () => {
    void shutdownServer('SIGINT')
})

process.on('SIGTERM', () => {
    void shutdownServer('SIGTERM')
})

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection', reason);
    void shutdownServer('unhandledRejection')
})

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception', error);
    void shutdownServer('uncaughtException')
})

void startServer();