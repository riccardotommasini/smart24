import { AlgoSuggestion, IAlgoSuggestion, IAlgoSuggestionOther } from '../../models/algo/algo-suggestion';
import { AlgoComputer } from '../algo-computer';
import { NonStrictObjectId } from '../../utils/objectid';
import { Document, Model, Types } from 'mongoose';
import { AlgoSimilar } from '../../models/algo/algo-similar';
import { AlgoConfidence } from '../../models/algo/algo-confidence';
import { getAlgoFieldEntry } from '../../utils/algo-field';
import { getRatedItemsForUser, getRatingUsersFromItemWithWeights } from '../../utils/ratings';
import { logger } from '../../utils/logger';
import { IAlgoField, IAlgoFieldOther } from '../../models/algo/algo-field';
import _ from 'underscore';
import { IRatings } from 'src/models/ratings/ratings';

export const ALGO_SUGGESTION_TYPES = ['default', 'reconf1', 'reconf2', 'reco-divers'] as const;

export type AlgoSuggestionType = (typeof ALGO_SUGGESTION_TYPES)[number];
export type AlgoSuggestionsDict = { [key in AlgoSuggestionType]: AlgoSuggestionComputer };

export interface AlgoSuggestionConfig {
    kTopUsers: number;
    selectUserType: 'similar' | 'confidence';
    positiveRatingsModel: Model<IRatings>;
    negativeRatingsModel: Model<IRatings>;
}

export abstract class AlgoSuggestionComputer<
    Config extends AlgoSuggestionConfig = AlgoSuggestionConfig,
> extends AlgoComputer<IAlgoSuggestion> {
    constructor(protected readonly config: Config) {
        super();
    }

    /**
     * Compute suggestions for a user and add them to the database
     * @param user ID of the user
     *
     * @returns The computed suggestions
     */
    async computeForUser(user: NonStrictObjectId): Promise<IAlgoSuggestion & Document> {
        const [similarEntry, confidenceEntry] = await getAlgoFieldEntry(user, [AlgoSimilar, AlgoConfidence]);

        if (!similarEntry || !confidenceEntry) {
            return AlgoSuggestion.create({ user, others: [] });
        }

        const topUsers = this.getTopUsers(this.config.selectUserType === 'similar' ? similarEntry : confidenceEntry);

        const [positiveRatings, negativeRatings, allItems] = await Promise.all([
            getRatedItemsForUser(user, this.config.positiveRatingsModel),
            getRatedItemsForUser(user, this.config.negativeRatingsModel),
            getRatedItemsForUser(
                topUsers.map((u) => u.user),
                [this.config.positiveRatingsModel, this.config.negativeRatingsModel],
            ),
        ]);

        // Get items that are liked by top k similar users but not seen by user
        const items = _.difference(
            _.unique(allItems.map(String)),
            positiveRatings.map(String),
            negativeRatings.map(String),
        ).map((i) => new Types.ObjectId(i));

        logger.debug(this.constructor.name, 'computeForUser', `Found ${items.length} items from top users`);

        // Compute weights for each item
        const suggestions: IAlgoSuggestionOther[] = await Promise.all(
            items.map(async (item) => ({
                item,
                weight: await this.computeWeight(item, similarEntry, confidenceEntry),
            })),
        );

        logger.debug(this.constructor.name, 'computeForUser', 'Completed computing weights');

        return this.createOrUpdate(user, suggestions);
    }

    protected async computeWeight(
        item: Types.ObjectId,
        similarEntry: IAlgoField,
        confidenceEntry: IAlgoField,
    ): Promise<number> {
        const raters = await getRatingUsersFromItemWithWeights(
            item,
            [this.config.positiveRatingsModel, this.config.negativeRatingsModel],
            [1, -1],
        );

        let numerator = 0;
        let count = 0;

        const similarOthersDict = _.indexBy(similarEntry.others, (o) => o.user.toString());
        const confidenceOthersDict = _.indexBy(confidenceEntry.others, (o) => o.user.toString());

        for (const [other, direction] of raters) {
            const weight = this.computeWeightForItem(
                similarOthersDict[other.toString()],
                confidenceOthersDict[other.toString()],
            );

            if (weight !== null) {
                numerator += weight * direction;
                count++;
            }
        }

        logger.debug(this.constructor.name, 'computeWeight', 'Computed weight for', item, 'as', numerator / count);

        return count ? numerator / count : 0;
    }

    protected abstract computeWeightForItem(
        similarOther: IAlgoFieldOther | undefined,
        confidenceOther: IAlgoFieldOther | undefined,
    ): number | null;

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getTopUsers(userEntry: IAlgoField): IAlgoFieldOther[] {
        return userEntry.others.sort((a, b) => b.score - a.score).slice(0, this.config.kTopUsers);
    }
}
