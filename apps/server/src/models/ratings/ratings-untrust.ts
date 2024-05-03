import mongoose from 'mongoose';
import { IRatings, RatingsSchema } from './ratings';

export const RatingsUntrust = mongoose.model<IRatings>('ratings-untrust', RatingsSchema);
