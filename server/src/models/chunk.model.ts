import {
  Schema,
  model,
  type InferSchemaType,
} from "mongoose";

const chunkSchema = new Schema(
  {
    document: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    chunkIndex: {
      type: Number,
      required: true,
      min: 0,
    },

    text: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number],
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

chunkSchema.index(
  {
    document: 1,
    chunkIndex: 1,
  },
  {
    unique: true,
  },
);

chunkSchema.index({
  owner: 1,
  document: 1,
});

export type ChunkRecord =
  InferSchemaType<typeof chunkSchema>;

export const ChunkModel = model(
  "Chunk",
  chunkSchema,
);