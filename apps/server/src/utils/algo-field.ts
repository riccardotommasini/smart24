import { Model } from 'mongoose';
import { NonStrictObjectId } from './objectid';
import { IAlgoField } from '../models/algo/algo-field';
import { logger } from './logger';

export async function getAlgoFieldEntry(
    user: NonStrictObjectId,
    algoFieldModel: Model<IAlgoField>,
): Promise<IAlgoField | null>;
export async function getAlgoFieldEntry(
    user: NonStrictObjectId,
    algoFieldModels: Model<IAlgoField>[],
): Promise<(IAlgoField | null)[]>;
export async function getAlgoFieldEntry(
    user: NonStrictObjectId,
    algoFieldModel: Model<IAlgoField> | Model<IAlgoField>[],
): Promise<IAlgoField | (IAlgoField | null)[] | null> {
    if (Array.isArray(algoFieldModel)) {
        const results = await Promise.all(algoFieldModel.map((model) => model.findOne({ user })));

        for (const result of results) {
            if (!result) {
                logger.warn('getAlgoFieldEntry', 'No entry found for', user);
            }
        }

        return results;
    } else {
        const result = await algoFieldModel.findOne({
            user,
        });

        if (!result) {
            logger.warn('getAlgoFieldEntry', 'No entry found for', user);
        }

        return result;
    }
}
