import mongoose, { Schema, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    surname: string;
    birthday: Date;
    mail: string;
    username: string;
    passwordHash: string;
    factChecker: boolean;
    totalPosts: number;
    nbFactChecked: number;
    organization: string;
    posts: [{ type: Schema.Types.ObjectId; ref: 'Post' }];
    follows: [{ type: Schema.Types.ObjectId; ref: 'User' }];
    trustedUsers: [{ type: Schema.Types.ObjectId; ref: 'User' }];
    untrustedUsers: [{ type: Schema.Types.ObjectId; ref: 'User' }];
    parameters: { globalTrust: boolean; rateFactChecked: number; diversification: number };
}

export type IUserCreation = Pick<IUser, 'username' | 'mail'> & { password: string } & Partial<IUser>;

export interface IUserSession {
    user: Pick<IUser, 'mail' | 'username'> & { _id: string };
    token: string;
}

const UserSchema: Schema<IUser> = new Schema<IUser>({
    name: { type: String, required: false, maxlength: 100 },
    surname: { type: String, required: false, maxlength: 100 },
    birthday: { type: Date, required: false },
    mail: { type: String, required: true, maxLength: 100, unique: true },
    username: { type: String, required: true, maxLength: 100, unique: true },
    passwordHash: { type: String, required: true, maxLength: 256 },
    factChecker: { type: Boolean, required: false, default: false },
    totalPosts: { type: Number, required: false, default: 0 },
    nbFactChecked: { type: Number, required: false, default: 0 },
    organization: { type: String, required: false, maxLength: 100 },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    follows: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    trustedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    untrustedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    parameters: {
        globalTrust: { type: Boolean, required: false, default: false },
        rateFactChecked: { type: Number, required: false },
        diversification: { type: Number, required: false },
    },
});

const saltRounds = 8;

UserSchema.pre('save', async function (next) {
    this.passwordHash = await bcryptjs.hash(this.passwordHash, saltRounds);
    next();
});

export const User = mongoose.model<IUser>('User', UserSchema);

// Export model
export default User;
