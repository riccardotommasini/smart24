import mongoose, { Schema } from 'mongoose';

export interface IRatingsUntrust {
    user: Schema.Types.ObjectId;
    item: Schema.Types.ObjectId;
}

const RatingsUntrustSchema = new Schema<IRatingsUntrust>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
});

RatingsUntrustSchema.index({ user: 1, item: 1 }, { unique: true });

// Export model
export const RatingsUntrust = mongoose.model<IRatingsUntrust>('ratings-untrust', RatingsUntrustSchema);
