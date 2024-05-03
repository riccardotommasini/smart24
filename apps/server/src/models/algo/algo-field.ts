import { Schema, Types } from 'mongoose';

export interface IAlgoFieldOther {
    user: Types.ObjectId;
    similarity: number;
}

export interface IAlgoField {
    user: Types.ObjectId;
    others: IAlgoFieldOther[];
}

export const AlgoFieldOtherSchema = new Schema<IAlgoFieldOther>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    similarity: { type: Number, required: true },
});

export const AlgoFieldSchema = new Schema<IAlgoField>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    others: [AlgoFieldOtherSchema],
});
