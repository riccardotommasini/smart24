import { container } from 'tsyringe';
import { DatabaseService } from './database-service';
import { Collection } from 'mongodb';

describe('DatabaseService', () => {
    let databaseService: DatabaseService;
    let testCollection: Collection;

    beforeEach(() => {
        databaseService = container.resolve(DatabaseService);
        testCollection = databaseService.db('test').collection('test');
    });

    it('should add item', async () => {
        const message = 'hello';
        await testCollection.insertOne({ message });

        const result = await testCollection.findOne();

        expect(result).not.toBeNull();
        expect(result?.message).toEqual(message);
    });
});
