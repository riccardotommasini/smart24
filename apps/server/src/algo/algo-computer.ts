import { NonStrictObjectId } from '../utils/objectid';

export abstract class AlgoComputer<T> {
    abstract computeForUser(user: NonStrictObjectId): Promise<T>;
}
