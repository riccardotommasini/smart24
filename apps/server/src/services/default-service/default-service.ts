import { singleton } from 'tsyringe';
import { DatabaseService } from '../database-service/database-service';
import mongoose from 'mongoose';

@singleton()
export class DefaultService {
    constructor(private readonly databaseService: DatabaseService) {}

    getMessage() {
        return 'Hello world!';
    }

    async pingDb(): Promise<boolean> {
        return mongoose.connection.readyState === 1;
    }
}
