import bcrypt from 'bcrypt';

import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

export interface IUser {
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserMethods {
    comparePassword(password: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;


const userSchema = new Schema<IUser, Model<IUser>, IUserMethods>({
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: [2, 'Name must contain at least 2 characters'], maxlength: [80, 'Name cannot exceed 80 characters'] },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, maxlength: [254, 'Email is too long']},
    passwordHash: { type: String, required: true, select: false },
}, {
    timestamps: true,
    versionKey: false,
})

userSchema.method("comparePassword", async function (password: string): Promise<boolean>{
    return bcrypt.compare(password, this.passwordHash)
})

export const User = model('User', userSchema);