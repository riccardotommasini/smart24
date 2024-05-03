import mongoose from 'mongoose';
import { AlgoFieldSchema, IAlgoField } from './algo-field';

export const AlgoConfidence = mongoose.model<IAlgoField>('algo-confidence', AlgoFieldSchema);
