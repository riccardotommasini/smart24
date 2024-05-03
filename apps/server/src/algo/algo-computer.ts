import { Model, Types } from 'mongoose';
import { IRatings } from '../models/ratings/ratings';
import { NonStrictObjectId, StrictObjectId } from '../utils/objectid';
import _ from 'underscore';

export abstract class AlgoComputer<T> {
    abstract computeForUser(user: NonStrictObjectId): Promise<T>;

    protected async getRatedItemsForUser(
        user: NonStrictObjectId | NonStrictObjectId[],
        ratingModel: Model<IRatings> | Model<IRatings>[],
    ): Promise<Types.ObjectId[]> {
        const users = Array.isArray(user) ? user : [user];
        const models = Array.isArray(ratingModel) ? ratingModel : [ratingModel];

        const items = await Promise.all(models.map((model) => model.distinct('item', { user: { $in: users } })));

        return _.unique(items.flat());
    }

    protected async getRatingUsersForItem(
        item: StrictObjectId | StrictObjectId[],
        ratingModel: Model<IRatings> | Model<IRatings>[],
    ): Promise<Types.ObjectId[]> {
        const items = Array.isArray(item) ? item : [item];
        const models = Array.isArray(ratingModel) ? ratingModel : [ratingModel];

        const users = await Promise.all(models.map((model) => model.distinct('user', { item: { $in: items } })));

        return _.unique(users.flat());
    }
}
