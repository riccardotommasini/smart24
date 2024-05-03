import mongoose, { Schema } from 'mongoose';

export interface IRatingsLikes {
    user: Schema.Types.ObjectId;
    item: Schema.Types.ObjectId;
}

const RatingsLikesSchema = new Schema<IRatingsLikes>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
});

// Add a unique compound index on user and item
RatingsLikesSchema.index({ user: 1, item: 1 }, { unique: true });

// Export model
export const RatingsLikes = mongoose.model<IRatingsLikes>('ratings-likes', RatingsLikesSchema);
