import mongoose from 'mongoose';
import { IRatings, RatingsSchema } from './ratings';

export const RatingsLikes = mongoose.model<IRatings>('ratings-likes', RatingsSchema);
