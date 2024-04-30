import mongoose, { Schema } from 'mongoose';

export interface IMetrics {
    nbLikes: number;
    nbDislikes: number;
    nbTrusts: number;
    nbUntrusts: number;
    nbComments: number;
    likedBy: Schema.Types.ObjectId[];
    dislikedBy: Schema.Types.ObjectId[];
    trustedBy: Schema.Types.ObjectId[];
    untrustedBy: Schema.Types.ObjectId[];
    sharedBy: Schema.Types.ObjectId[];
    factCheckedBy: Schema.Types.ObjectId[];
}

const MetricsSchema = new Schema<IMetrics>({
    nbLikes: { type: Number, required: false, default: 0 },
    nbDislikes: { type: Number, required: false, default: 0 },
    nbTrusts: { type: Number, required: false, default: 0 },
    nbUntrusts: { type: Number, required: false, default: 0 },
    nbComments: { type: Number, required: false, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dislikedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    trustedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    untrustedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    sharedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    factCheckedBy: [{ type: Schema.Types.ObjectId, ref: 'FactCheck' }],
});

export const Metrics = mongoose.model<IMetrics>('Metrics', MetricsSchema);
