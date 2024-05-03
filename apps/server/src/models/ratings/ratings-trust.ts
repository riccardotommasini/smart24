import mongoose from 'mongoose';
import { IRatings, RatingsSchema } from './ratings';

export const RatingsTrust = mongoose.model<IRatings>('ratings-trust', RatingsSchema);
