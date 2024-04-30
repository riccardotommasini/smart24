import mongoose, { Schema, Document } from 'mongoose';

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
    organisation: string;
    posts: [{ type: Schema.Types.ObjectId; ref: 'Post' }];
    follows: [{ type: Schema.Types.ObjectId; ref: 'User' }];
    trustedUsers: [{ type: Schema.Types.ObjectId; ref: 'User' }];
    untrustedUsers: [{ type: Schema.Types.ObjectId; ref: 'User' }];
    parameters: { globalTrust: boolean; rateFactChecked: number; diversification: number };
}

const UserSchema: Schema = new Schema<IUser>({
    name: { type: String, required: false, maxlength: 100 },
    surname: { type: String, required: false, maxlength: 100 },
    birthday: { type: Date, required: false },
    mail: { type: String, required: true, maxLength: 100, unique: true },
    username: { type: String, required: true, maxLength: 100, unique: true },
    passwordHash: { type: String, required: true, maxLength: 256 },
    factChecker: { type: Boolean, default: false },
    totalPosts: { type: Number, required: false, default: 0 },
    nbFactChecked: { type: Number, required: false, default: 0 },
    organisation: { type: String, required: false, maxLength: 100 },
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

export const User = mongoose.model<IUser>('User', UserSchema);

// Export model
export default User;
