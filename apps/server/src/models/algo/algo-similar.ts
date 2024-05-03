import mongoose from 'mongoose';
import { AlgoFieldSchema, IAlgoField } from './algo-field';

export const AlgoSimilar = mongoose.model<IAlgoField>('algo-similar', AlgoFieldSchema);
