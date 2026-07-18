import bcrypt from 'bcrypt'

import { User, type UserDocument } from '../models/user.model.js'
import { ApiError } from '../utils/ApiError.js'
import { generateAccessToken } from '../utils/jwt.js'

const BCRYPT_SALT_ROUNDS = 12

interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

interface LoginInput {
    email: string;
    password: string;
}

interface PublicUser {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}

interface AuthResult {
    token: string;
    user: PublicUser;
}

function toPublicUser(user: UserDocument): PublicUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
    };
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await User.exists({ email: input.email })

    if (existingUser) {
        throw new ApiError(401, 'An account with this email already exists')
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS)

    const user = await User.create({
        name: input.name,
        email: input.email,
        passwordHash,
    })

    return { token: generateAccessToken(user.id), user: toPublicUser(user) }
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
    const user = await User.findOne({
        email: input.email,
    }).select("+passwordHash");

    if (!user) {
        throw new ApiError(
            401,
            "Invalid email or password",
        );
    }

    const isPasswordCorrect = await user.comparePassword(
        input.password,
    );

    if (!isPasswordCorrect) {
        throw new ApiError(
            401,
            'Invalid email or password'
        )
    }

    return {
        token: generateAccessToken(user.id),
        user: toPublicUser(user)
    }
}