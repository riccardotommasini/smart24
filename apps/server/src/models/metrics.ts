import mongoose, { Schema } from 'mongoose';

export interface UpdateMetrics {
    likedBy?: mongoose.Types.ObjectId[];
    dislikedBy?: mongoose.Types.ObjectId[];
    trustedBy?: mongoose.Types.ObjectId[];
    untrustedBy?: mongoose.Types.ObjectId[];
}

export interface IMetrics {
    nbLikes: number;
    nbDislikes: number;
    nbTrusts: number;
    nbUntrusts: number;
    nbComments: number;
    nbFactChecks: number;
    factCheckScore: number;
    likedBy: mongoose.Types.ObjectId[];
    dislikedBy: mongoose.Types.ObjectId[];
    trustedBy: mongoose.Types.ObjectId[];
    untrustedBy: mongoose.Types.ObjectId[];
    sharedBy: mongoose.Types.ObjectId[];
    factChecks: mongoose.Types.ObjectId[];
}

const MetricsSchema = new Schema<IMetrics>({
    nbLikes: { type: Number, required: false, default: 0 },
    nbDislikes: { type: Number, required: false, default: 0 },
    nbTrusts: { type: Number, required: false, default: 0 },
    nbUntrusts: { type: Number, required: false, default: 0 },
    nbComments: { type: Number, required: false, default: 0 },
    nbFactChecks: { type: Number, required: false, default: 0 },
    factCheckScore: { type: Number, required: false, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dislikedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    trustedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    untrustedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    sharedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    factChecks: [{ type: Schema.Types.ObjectId, ref: 'FactCheck' }],
});
export const Metrics = mongoose.model<IMetrics>('Metrics', MetricsSchema);
