import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
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
    parameters: {globalTrust: boolean, rateFactChecked: number, diversification: number}
}

const UserSchema: Schema = new Schema<IUser>({
    userId: { type: Schema.Types.ObjectId },
    name: {type: String, required: false, maxlength: 100},
    surname: {type: String, required: false, maxlength: 100},
    birthday: {type: Date, required: false},
    mail: { type: String, required: true, maxLength: 100, unique: true },
    username: { type: String, required: true, maxLength: 100, unique: true },
    passwordHash: { type: String, required: true, maxLength: 256 },
    factChecker: { type: Boolean, default: false },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    follows: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    subscribers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    trustedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    distrustedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    parameters: {globalTrust: {type: Boolean, required: false, default: false}, rateFactChecked: {type: Number, required: false}}
});

// Export model
export default mongoose.model<IUser>("User", UserSchema);