import { Types } from 'mongoose';

export type StrictObjectId = Types.ObjectId;
export type NonStrictObjectId = StrictObjectId | string;

export const toObjectId = (id: NonStrictObjectId): StrictObjectId => {
    return id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
};
