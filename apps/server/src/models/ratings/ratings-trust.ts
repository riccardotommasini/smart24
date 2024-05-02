import mongoose, { Schema } from 'mongoose';

export interface IRatingsTrust {
    user: Schema.Types.ObjectId;
    item: Schema.Types.ObjectId;
}

const RatingsTrustSchema = new Schema<IRatingsTrust>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
});

// Add a unique compound index on user and item
RatingsTrustSchema.index({ user: 1, item: 1 }, { unique: true });

// Export model
export const RatingsTrust = mongoose.model<IRatingsTrust>('ratings-trust', RatingsTrustSchema);
