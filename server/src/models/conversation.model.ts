import {
  InferSchemaType,
  Schema,
  model,
} from "mongoose";

const conversationSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    document: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },

    documentTitle: {
      type: String,
      required: true,
      trim: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    aiResponse: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

conversationSchema.index({
  owner: 1,
  createdAt: -1,
});

conversationSchema.index({
  owner: 1,
  document: 1,
  createdAt: -1,
});

export type ConversationRecord =
  InferSchemaType<typeof conversationSchema>;

export const ConversationModel = model(
  "Conversation",
  conversationSchema,
);