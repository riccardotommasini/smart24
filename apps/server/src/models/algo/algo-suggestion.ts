import mongoose, { Schema, Types } from 'mongoose';

export interface IAlgoSuggestionOther {
    post: Types.ObjectId;
    weight: number;
}

export interface IAlgoSuggestion {
    user: Types.ObjectId;
    others: IAlgoSuggestionOther[];
}

const AlgoSuggestionOtherSchema = new Schema<IAlgoSuggestionOther>({
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    weight: { type: Number, required: true },
});

const AlgoSuggestionSchema = new Schema<IAlgoSuggestion>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    others: [AlgoSuggestionOtherSchema],
});

export const AlgoSuggestion = mongoose.model<IAlgoSuggestion>('algo-suggestion', AlgoSuggestionSchema);
