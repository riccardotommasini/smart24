import { NonStrictObjectId } from '../../utils/objectid';
import { AlgoSuggestionComputer } from './algo-suggestions-computer';
import { AlgoSuggestion, IAlgoSuggestion, IAlgoSuggestionOther } from '../../models/algo/algo-suggestion';
import { AlgoSimilar } from '../../models/algo/algo-similar';
import { logger } from '../../utils/logger';
import { RatingsLikes } from '../../models/ratings/ratings-likes';
import { RatingsDislikes } from '../../models/ratings/ratings-dislikes';
import { Document, Types } from 'mongoose';
import { IAlgoFieldOther } from '../../models/algo/algo-field';
import _ from 'underscore';

export class AlgoSuggestionDefaultComputer extends AlgoSuggestionComputer {
    async computeForUser(user: NonStrictObjectId): Promise<IAlgoSuggestion & Document> {
        const similarEntry = await AlgoSimilar.findOne({ user });

        if (!similarEntry) {
            logger.warn(this.constructor.name, 'computeForUser', 'No similar entry found for', user);
            return AlgoSuggestion.create({ user, others: [] });
        } else if (!similarEntry.others.length) {
            logger.warn(this.constructor.name, 'computeForUser', 'No similar users found for', user);
            return AlgoSuggestion.create({ user, others: [] });
        }

        logger.debug(this.constructor.name, 'computeForUser', `Found ${similarEntry.others.length} similar users`);

        // Get top k similar users
        const topSimilarUsers = similarEntry?.others
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, this.config.kSimilar);

        const [likes, dislikes, allItems] = await Promise.all([
            this.getRatedItemsForUser(user, RatingsLikes),
            this.getRatedItemsForUser(user, RatingsDislikes),
            this.getRatedItemsForUser(
                topSimilarUsers.map((u) => u.user),
                [RatingsLikes, RatingsDislikes],
            ),
        ]);

        // Get items that are liked by top k similar users but not seen by user
        const items = _.difference(_.unique(allItems), likes, dislikes);

        logger.debug(this.constructor.name, 'computeForUser', `Found ${items.length} items from top users`);

        // Compute weights for each item
        const suggestions: IAlgoSuggestionOther[] = await Promise.all(
            items.map(async (item) => ({ item, weight: await this.computeWeight(item, topSimilarUsers) })),
        );

        logger.debug(this.constructor.name, 'computeForUser', 'Completed computing weights');

        return this.createOrUpdate(user, suggestions);
    }

    protected async computeWeight(item: Types.ObjectId, others: IAlgoFieldOther[]): Promise<number> {
        const [likers, dislikers] = await Promise.all([
            this.getRatingUsersForItem(item, RatingsLikes),
            this.getRatingUsersForItem(item, RatingsDislikes),
        ]);

        let numerator = 0;
        let count = 0;

        const ratersList: [raters: Types.ObjectId[], direction: number][] = [
            [likers, 1], // Likes affect positively
            [dislikers, -1], // Dislikes affect negatively
        ];

        for (const [raters, direction] of ratersList) {
            for (const other of raters) {
                const foundOther = others.find((u) => u.user.equals(other));

                if (foundOther) {
                    numerator += foundOther.similarity * direction;
                    count++;
                }
            }
        }

        logger.debug(this.constructor.name, 'computeWeight', 'Computed weight for', item, 'as', numerator / count);

        return count ? numerator / count : 0;
    }
}
