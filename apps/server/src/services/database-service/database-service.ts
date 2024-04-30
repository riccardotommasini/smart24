import { env } from '../../utils/env';
import { singleton } from 'tsyringe';
import mongoose from 'mongoose';

@singleton()
export class DatabaseService {
    async connect() {
        await mongoose.connect(env.MONGO_URL, {});
    }
}
