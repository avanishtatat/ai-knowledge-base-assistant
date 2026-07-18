import { ConversationModel } from "../models/conversation.model.js";
import { DocumentModel } from "../models/document.model.js";

interface DashboardResult {
  totalDocuments: number;
  totalQuestions: number;
  recentDocuments: Array<{
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    status: string;
    createdAt: Date;
  }>;
}

export async function getDashboardData(
  ownerId: string,
): Promise<DashboardResult> {
  const [
    totalDocuments,
    totalQuestions,
    recentDocuments,
  ] = await Promise.all([
    DocumentModel.countDocuments({
      owner: ownerId,
    }),

    ConversationModel.countDocuments({
      owner: ownerId,
    }),

    DocumentModel.find({
      owner: ownerId,
    })
      .select(
        "originalName mimeType size status createdAt",
      )
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean(),
  ]);

  return {
    totalDocuments,
    totalQuestions,

    recentDocuments:
      recentDocuments.map(
        (document) => ({
          id: document._id.toString(),
          originalName:
            document.originalName,
          mimeType: document.mimeType,
          size: document.size,
          status: document.status,
          createdAt: document.createdAt,
        }),
      ),
  };
}