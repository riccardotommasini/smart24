import { Model, Types } from 'mongoose';
import { NonStrictObjectId } from './objectid';
import { IRatings } from '../models/ratings/ratings';
import _ from 'underscore';

export async function getRatedItemsForUser(
    user: NonStrictObjectId | NonStrictObjectId[],
    ratingModel: Model<IRatings> | Model<IRatings>[],
): Promise<Types.ObjectId[]> {
    const users = Array.isArray(user) ? user : [user];
    const models = Array.isArray(ratingModel) ? ratingModel : [ratingModel];

    const items = await Promise.all(models.map((model) => model.distinct('item', { user: { $in: users } })));

    return _.unique(items.flat());
}

export async function getRatingUsersForItem(
    item: NonStrictObjectId | NonStrictObjectId[],
    ratingModel: Model<IRatings> | Model<IRatings>[],
): Promise<Types.ObjectId[]> {
    const items = Array.isArray(item) ? item : [item];
    const models = Array.isArray(ratingModel) ? ratingModel : [ratingModel];

    const users = await Promise.all(models.map((model) => model.distinct('user', { item: { $in: items } })));

    return _.unique(users.flat());
}

export async function getRatingUsersFromItemWithWeights(
    item: NonStrictObjectId | NonStrictObjectId[],
    ratingModel: Model<IRatings> | Model<IRatings>[],
    direction: number | number[],
): Promise<[user: Types.ObjectId, weight: number][]> {
    const items = Array.isArray(item) ? item : [item];
    const models = Array.isArray(ratingModel) ? ratingModel : [ratingModel];
    const directions = Array.isArray(direction) ? direction : [direction];

    const users: [Types.ObjectId, number][][] = await Promise.all(
        models.map((model, i) =>
            model
                .distinct('user', { item: { $in: items } })
                .then((users) => users.map((user): [Types.ObjectId, number] => [user, directions[i]])),
        ),
    );

    return _.unique(users.flat());
}
