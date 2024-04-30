import mongoose, { Schema, Document, Model } from 'mongoose';
import { DateTime } from 'luxon'

interface IUser extends Document {
    userId: Schema.Types.ObjectId,
    name: string,
    surname: string,
    birthday: DateTime,
    mail: string,
    username: string,
    passwordHash: string,
    factChecker: boolean,
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    follows: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    subscribers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    trustedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    distrustedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    parameters: {globalTrust: boolean, rateFactChecked: number, diversification: number}
}

const UserSchema: Schema = new Schema<IUser>({
    userId: { type: Schema.Types.ObjectId },
    name: {type: String, required: true, maxlength: 100},
    surname: {type: String, required: true, maxlength: 100},
    birthday: {type: DateTime, required: true},
    mail: { type: String, required: true, maxLength: 100, unique: true },
    username: { type: String, required: true, maxLength: 100, unique: true },
    passwordHash: { type: String, required: true, maxLength: 256 },
    factChecker: { type: Boolean, default: false },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    follows: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    subscribers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    trustedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    distrustedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    parameters: {globalTrust: {type: Boolean, required: true, default: false}, rateFactChecked: {type: Number, }}
});

// Export model
export default mongoose.model<IUser>("User", UserSchema);