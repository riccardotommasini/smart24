import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
    userId: Schema.Types.ObjectId,
    name: string,
    surname: string,
    birthday: Date,
    mail: string,
    username: string,
    passwordHash: string,
    factChecker: boolean,
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    follows: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    subscribers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    trustedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    distrustedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    parameters: { globalTrust: boolean, rateFactChecked: number, diversification: number }
}


const UserSchema: Schema<IUser> = new Schema<IUser>({
    userId: { type: Schema.Types.ObjectId },
    name: { type: String, required: false, maxlength: 100 },
    surname: { type: String, required: false, maxlength: 100 },
    birthday: { type: Date, required: false },
    mail: { type: String, required: true, maxLength: 100, unique: true },
    username: { type: String, required: true, maxLength: 100, unique: true },
    passwordHash: { type: String, required: true, maxLength: 256 },
    factChecker: { type: Boolean, default: false },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    follows: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    subscribers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    trustedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    distrustedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    parameters: { globalTrust: { type: Boolean, required: false, default: false }, rateFactChecked: { type: Number, required: false } }
});

const saltRounds = 8;

UserSchema.pre('save', async function (next) {
    const user = this;
    user.passwordHash = await bcrypt.hash(user.passwordHash, saltRounds);
    next();
});

// Export model
export default mongoose.model<IUser>("User", UserSchema);