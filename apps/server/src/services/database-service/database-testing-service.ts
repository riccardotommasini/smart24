import { MongoClient } from 'mongodb';
import { IDatabaseService } from './database-service';

export class DatabaseTestingService implements IDatabaseService {
    readonly client!: MongoClient;

    connect(): Promise<void> {
        return Promise.resolve();
    }
}
