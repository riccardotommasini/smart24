import mongoose, { Schema } from 'mongoose';

export interface UpdateMetrics {
    likedBy?: string[];
    dislikedBy?: string[];
    trustedBy?: string[];
    untrustedBy?: string[];
}


export interface IMetrics {
    nbLikes: number;
    nbDislikes: number;
    nbTrusts: number;
    nbUntrusts: number;
    nbComments: number;
    likedBy: string[];
    dislikedBy: string[];
    trustedBy: string[];
    untrustedBy: string[];
    sharedBy: string[];
    factCheckedBy: string[];
}

const MetricsSchema = new Schema<IMetrics>({
    nbLikes: { type: Number, required: false, default: 0 },
    nbDislikes: { type: Number, required: false, default: 0 },
    nbTrusts: { type: Number, required: false, default: 0 },
    nbUntrusts: { type: Number, required: false, default: 0 },
    nbComments: { type: Number, required: false, default: 0 },
    likedBy: [{ type: String, ref: 'User' }],
    dislikedBy: [{ type: String, ref: 'User' }],
    trustedBy: [{ type: String, ref: 'User' }],
    untrustedBy: [{ type: String, ref: 'User' }],
    sharedBy: [{ type: String, ref: 'User' }],
    factCheckedBy: [{ type: String, ref: 'FactCheck' }],
});

export const Metrics = mongoose.model<IMetrics>('Metrics', MetricsSchema);
