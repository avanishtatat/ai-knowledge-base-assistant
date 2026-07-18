import { ConversationModel } from "../models/conversation.model.js";

interface ConversationHistoryItem {
  id: string;
  document: {
    id: string;
    title: string;
  } | null;
  documentTitle: string;
  question: string;
  answer: string;
  createdAt: Date;
}

export async function getConversationHistory(
  ownerId: string,
): Promise<ConversationHistoryItem[]> {
  const conversations =
    await ConversationModel.find({
      owner: ownerId,
    })
      .select(
        "document documentTitle question aiResponse createdAt",
      )
      .sort({
        createdAt: -1,
      })
      .lean();

  return conversations.map(
    (conversation) => ({
      id: conversation._id.toString(),

      document: conversation.document
        ? {
            id: conversation.document.toString(),
            title: conversation.documentTitle,
          }
        : null,

      documentTitle:
        conversation.documentTitle,

      question: conversation.question,

      answer: conversation.aiResponse,

      createdAt: conversation.createdAt,
    }),
  );
}