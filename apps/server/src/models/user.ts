import mongoose, { Schema, Document, Model } from 'mongoose';

interface IUser extends Document {
    userId: Schema.Types.ObjectId,
    username: string,
    mail: string,
    passwordHash: string,
    globalTrust: boolean,
    factChecker: boolean,
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    follows: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    subscribers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    trustedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    distrustedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}

const UserSchema: Schema = new Schema<IUser>({
    userId: { type: Schema.Types.ObjectId },
    username: { type: String, required: true, maxLength: 100, unique: true },
    mail: { type: String, required: true, maxLength: 100, unique: true },
    passwordHash: { type: String, required: true, maxLength: 256 },
    globalTrust: { type: Boolean, default: false },
    factChecker: { type: Boolean, default: false },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    follows: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    subscribers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    trustedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    distrustedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

// Export model
export default mongoose.model<IUser>("User", UserSchema);