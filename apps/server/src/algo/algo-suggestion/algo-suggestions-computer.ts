import { AlgoSuggestion, IAlgoSuggestion, IAlgoSuggestionOther } from '../../models/algo/algo-suggestion';
import { AlgoComputer } from '../algo-computer';
import { NonStrictObjectId } from '../../utils/objectid';
import { Document, Types } from 'mongoose';
import { IAlgoFieldOther } from '../../models/algo/algo-field';

export const ALGO_SUGGESTION_TYPES = ['default'] as const;

export type AlgoSuggestionType = (typeof ALGO_SUGGESTION_TYPES)[number];
export type AlgoSuggestionsDict = { [key in AlgoSuggestionType]: AlgoSuggestionComputer };

export interface AlgoSuggestionConfig {
    kSimilar: number;
}

export const DEFAULT_ALGO_SUGGESTION_CONFIG: AlgoSuggestionConfig = {
    kSimilar: 10,
};

export abstract class AlgoSuggestionComputer extends AlgoComputer<IAlgoSuggestion> {
    protected readonly config: AlgoSuggestionConfig;

    constructor(config: Partial<AlgoSuggestionConfig> = {}) {
        super();
        this.config = { ...DEFAULT_ALGO_SUGGESTION_CONFIG, ...config };
    }

    abstract computeForUser(user: NonStrictObjectId): Promise<IAlgoSuggestion & Document>;

    protected abstract computeWeight(item: Types.ObjectId, others: IAlgoFieldOther[]): Promise<number>;

    protected async createOrUpdate(
        user: NonStrictObjectId,
        others: IAlgoSuggestionOther[],
    ): Promise<IAlgoSuggestion & Document> {
        const foundEntry = await AlgoSuggestion.findOneAndUpdate({ user }, { others }, { new: true });

        if (foundEntry) {
            return foundEntry;
        }

        return AlgoSuggestion.create({ user, others });
    }
}
