import { Db, DbOptions, MongoClient } from 'mongodb';
import { env } from '../../utils/env';
import { singleton } from 'tsyringe';

export interface IDatabaseService {
    client: MongoClient;
    connect(): Promise<void>;
}

@singleton()
export class DatabaseService implements IDatabaseService {
    readonly client: MongoClient;

    constructor() {
        this.client = new MongoClient(env.MONGO_URL, {});
    }

    db(name?: string, options?: DbOptions): Db {
        return this.client.db(name, options);
    }

    async connect() {
        await this.client.connect();
    }
}
