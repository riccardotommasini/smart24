import { Document, Types } from 'mongoose';
import { AlgoFieldComputer } from '../../algo/algo-field-computer';
import { AlgoConfidence } from '../../models/algo/algo-confidence';
import { AlgoSimilar } from '../../models/algo/algo-similar';
import { RatingsDislikes } from '../../models/ratings/ratings-dislikes';
import { RatingsLikes } from '../../models/ratings/ratings-likes';
import { RatingsTrust } from '../../models/ratings/ratings-trust';
import { RatingsUntrust } from '../../models/ratings/ratings-untrust';
import User from '../../models/user';
import { logger } from '../../utils/logger';
import { NonStrictObjectId } from '../../utils/objectid';
import { singleton } from 'tsyringe';
import { IAlgoField } from '../../models/algo/algo-field';
import { AlgoSuggestionType, AlgoSuggestionsDict } from '../../algo/algo-suggestion/algo-suggestions-computer';
import { AlgoSuggestionDefaultComputer } from '../../algo/algo-suggestion/algo-suggestions-default-computer';
import { AlgoSuggestionReconfComputer } from '../../algo/algo-suggestion/algo-suggestions-reconf-computer';
import { AlgoSuggestionsRecoDiversComputer } from '../../algo/algo-suggestion/algo-suggestions-reco-divers-computer';

@singleton()
export class AlgoService {
    private similarityComputer: AlgoFieldComputer;
    private confidenceComputer: AlgoFieldComputer;
    private suggestionsComputers: AlgoSuggestionsDict;

    constructor() {
        this.similarityComputer = new AlgoFieldComputer(AlgoSimilar, RatingsLikes, RatingsDislikes);
        this.confidenceComputer = new AlgoFieldComputer(AlgoConfidence, RatingsTrust, RatingsUntrust);
        this.suggestionsComputers = {
            default: new AlgoSuggestionDefaultComputer({
                kTopUsers: 10,
                positiveRatingsModel: RatingsLikes,
                negativeRatingsModel: RatingsDislikes,
                selectUserType: 'similar',
            }),
            reconf1: new AlgoSuggestionReconfComputer({
                kTopUsers: 10,
                similarityCoefficient: 1,
                confidenceCoefficient: 1,
                positiveRatingsModel: RatingsLikes,
                negativeRatingsModel: RatingsDislikes,
                selectUserType: 'similar',
            }),
            reconf2: new AlgoSuggestionReconfComputer({
                kTopUsers: 10,
                similarityCoefficient: 1,
                confidenceCoefficient: 1,
                positiveRatingsModel: RatingsTrust,
                negativeRatingsModel: RatingsUntrust,
                selectUserType: 'confidence',
            }),
            'reco-divers': new AlgoSuggestionsRecoDiversComputer({
                kTopUsers: 10,
                similarityCoefficient: 1,
                confidenceCoefficient: 1,
                positiveRatingsModel: RatingsLikes,
                negativeRatingsModel: RatingsDislikes,
                selectUserType: 'similar',
                diversityCoefficient: 0.8,
            }),
        };
    }

    async computeForAll(suggestionType: AlgoSuggestionType): Promise<PromiseRejectedResult[]> {
        logger.info(this.constructor.name, 'computeForAll', 'Computing for all users');

        const users: Types.ObjectId[] = await User.distinct('_id');

        const result = await Promise.allSettled(
            users.map(async (user) => await this.computeForUser(user, suggestionType)),
        );

        const resultCount = result.reduce(
            (acc, res) => {
                if (res.status === 'fulfilled') {
                    for (const r of res.value) {
                        acc.error.push(r);
                    }
                } else {
                    acc.error.push(res);
                }

                return acc;
            },
            {
                success: new Array<PromiseSettledResult<IAlgoField & Document>>(),
                error: new Array<PromiseRejectedResult>(),
            },
        );

        logger.info(
            this.constructor.name,
            'computeForAll',
            `Computed successfully for ${resultCount.success.length} users (${resultCount.error.length} errors)`,
        );

        return resultCount.error;
    }

    async computeForUser(
        user: NonStrictObjectId,
        suggestionType: AlgoSuggestionType,
    ): Promise<PromiseRejectedResult[]> {
        logger.info(this.constructor.name, 'computeForUser', 'Computing for', user);

        const result = await Promise.allSettled([
            this.similarityComputer.computeForUser(user),
            this.confidenceComputer.computeForUser(user),
        ]);

        const suggestions = await Promise.allSettled([this.suggestionsComputers[suggestionType].computeForUser(user)]);

        const errors = [...result, ...suggestions].filter((r): r is PromiseRejectedResult => r.status === 'rejected');

        for (const error of errors) {
            logger.error(this.constructor.name, 'computeForUser', 'Error computing for', user, error);
        }

        logger.info(this.constructor.name, 'computeForUser', 'Computed complete for', user);

        return errors;
    }
}
