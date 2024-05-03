import { Document, Model } from 'mongoose';
import { IAlgoField, IAlgoFieldOther } from '../models/algo/algo-field';
import { NonStrictObjectId, toObjectId } from '../utils/objectid';
import _ from 'underscore';
import { IRatings } from '../models/ratings/ratings';
import { logger } from '../utils/logger';
import { AlgoComputer } from './algo-computer';

export class AlgoFieldComputer extends AlgoComputer<IAlgoField> {
    constructor(
        private readonly model: Model<IAlgoField>,
        private readonly positiveRatingModel: Model<IRatings>,
        private readonly negativeRatingModel: Model<IRatings>,
    ) {
        super();
    }

    async findForUser(user: NonStrictObjectId): Promise<IAlgoField[]> {
        return (await this.model.findOne({ user })) ?? [];
    }

    async computeForUser(user: NonStrictObjectId): Promise<IAlgoField & Document> {
        logger.info(this.constructor.name, 'computeForUser', 'Computing for', user);

        const positiveRatedItems = await this.getRatedItemsForUser(user, this.positiveRatingModel);
        const negativeRatedItems = await this.getRatedItemsForUser(user, this.negativeRatingModel);

        const usersWithCommonPositive = (
            await this.getRatingUsersForItem(positiveRatedItems, this.positiveRatingModel)
        ).map(String);
        const usersWithCommonNegative = (
            await this.getRatingUsersForItem(negativeRatedItems, this.negativeRatingModel)
        ).map(String);

        const usersWithCommon: string[] = [
            ...new Set([...usersWithCommonPositive.map(String), ...usersWithCommonNegative.map(String)]),
        ];
        usersWithCommon.splice(usersWithCommon.indexOf(String(user)), 1);

        const similarities = await Promise.all(
            usersWithCommon.map(
                (other): Promise<IAlgoFieldOther> =>
                    this.computeForUserPair(
                        user,
                        other,
                        positiveRatedItems.map(String),
                        negativeRatedItems.map(String),
                    ),
            ),
        );

        logger.info(this.constructor.name, 'computeForUser', 'Computed complete for', user);

        if (await this.model.exists({ user })) {
            return (await this.model.findOneAndUpdate({ user }, { others: similarities }, { new: true }))!;
        }

        return this.model.create({ user, others: similarities });
    }

    private async computeForUserPair(
        user: NonStrictObjectId,
        other: NonStrictObjectId,
        positive: string[],
        negative: string[],
    ): Promise<IAlgoFieldOther> {
        logger.debug(this.constructor.name, 'computeForUserPair', 'Computing for', user, 'and', other);

        const otherPositive = (await this.getRatedItemsForUser(other, this.positiveRatingModel)).map(String);
        const otherNegative = (await this.getRatedItemsForUser(other, this.negativeRatingModel)).map(String);

        const similarity =
            (_.intersection(positive, otherPositive).length +
                _.intersection(negative, otherNegative).length -
                _.intersection(positive, otherNegative).length -
                _.intersection(negative, otherPositive).length) /
            _.union(positive, otherPositive, negative, otherNegative).length;

        logger.debug(
            this.constructor.name,
            'computeForUserPair',
            'Computed for',
            user,
            'and',
            other,
            'similarity',
            similarity.toFixed(3),
        );

        return { user: toObjectId(other), similarity };
    }
}
