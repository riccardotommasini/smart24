import mongoose, { Schema } from 'mongoose';

export interface ICreateFactCheck {
    postId: string;
    grade: number;
    comment?: string;
}

export interface IFactCheck {
    grade: number;
    comment?: string;
    date: Date;
    emittedBy: Schema.Types.ObjectId;
    postId: Schema.Types.ObjectId;
}

const FactCheckSchema = new Schema<IFactCheck>({
    grade: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now() },
    comment: { type: String, required: false },
    emittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
});

// Export model
export const FactCheck = mongoose.model<IFactCheck>('FactCheck', FactCheckSchema);
