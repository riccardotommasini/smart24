import mongoose from 'mongoose';
import { IRatings, RatingsSchema } from './ratings';

export const RatingsDislikes = mongoose.model<IRatings>('ratings-dislikes', RatingsSchema);
