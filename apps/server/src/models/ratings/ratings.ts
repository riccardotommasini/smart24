import { Schema, Types } from 'mongoose';

export interface IRatings {
    user: Types.ObjectId;
    item: Types.ObjectId;
}

export const RatingsSchema = new Schema<IRatings>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
});

RatingsSchema.index({ user: 1, item: 1 }, { unique: true });
