import { singleton } from 'tsyringe';
import { DatabaseService } from '../database-service/database-service';
import { Document } from 'mongodb';

@singleton()
export class DefaultService {
    constructor(private readonly databaseService: DatabaseService) {}

    getMessage() {
        return 'Hello world! ';
    }

    pingDb(): Promise<Document> {
        return this.databaseService.client.db('admin').command({ ping: 1 });
    }
}
