import mongoose, { Schema } from 'mongoose';

export interface IRatingsDislikes {
    user: Schema.Types.ObjectId;
    item: Schema.Types.ObjectId;
}

const RatingsDislikesSchema = new Schema<IRatingsDislikes>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
});

// Add a unique compound index on user and item
RatingsDislikesSchema.index({ user: 1, item: 1 }, { unique: true });

// Export model
export const RatingsDislikes = mongoose.model<IRatingsDislikes>('ratings-dislikes', RatingsDislikesSchema);
