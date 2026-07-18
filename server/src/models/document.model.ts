import mongoose, { Schema, model, type InferSchemaType } from 'mongoose'

const documentStatuses = [
    "processing",
    "ready",
    "failed"
] as const

const documentSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        originalName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 255,
        },

        storedName: {
            type: String,
            required: true,
            unique: true,
        },

        storagePath: {
            type: String,
            required: true,
        },

        extractedTextPath: {
            type: String,
            default: null,
        },

        mimeType: {
            type: String,
            required: true,
        },

        size: {
            type: Number,
            required: true,
            min: 1,
        },

        status: {
            type: String,
            enum: documentStatuses,
            default: "processing",
            required: true,
        },

        failureReason: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
)

documentSchema.index({ owner: 1, createdAt: -1 })

export type DocumentRecord = InferSchemaType<typeof documentSchema>

export const DocumentModel = model('Document', documentSchema)