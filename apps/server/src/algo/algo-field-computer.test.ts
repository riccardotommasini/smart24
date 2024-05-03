import { AlgoSimilar } from '../models/algo/algo-similar';
import { AlgoFieldComputer } from './algo-field-computer';
import { RatingsLikes } from '../models/ratings/ratings-likes';
import { RatingsDislikes } from '../models/ratings/ratings-dislikes';
import { IUser, User } from '../models/user';
import { IPost } from '../models/post';
import mongoose, { Document } from 'mongoose';
import { container } from 'tsyringe';
import { PostService } from '../services/post-service/post-service';
import { MetricsService } from '../services/metrics-service/metrics-service';
import { DatabaseService } from '../services/database-service/database-service';

const DEFAULT_USER_1 = {
    username: 'celinedion',
    mail: 'celine@eurovision.fr',
    passwordHash: 'titanic',
    name: 'Céline',
    surname: 'Dion',
};

const DEFAULT_USER_2 = {
    username: 'ti-me',
    mail: 'ti-me@petitvie.qc.ca',
    passwordHash: 'vidanges',
    name: 'Ti-Mé',
    surname: 'Paré',
};

const DEFAULT_USER_3 = {
    username: 'dede',
    mail: 'dede@colocs.com',
    passwordHash: 'vajouerdansruelle',
    name: 'Dédé',
    surname: 'Fortin',
};

// const DEFAULT_USER_4 = {
//     username: 'mikewards',
//     mail: 'mike@leborder.com',
//     passwordHash: 'ripjeremy',
//     name: 'Mike',
//     surname: 'Wards',
// };

describe('AlgoFieldComputer', () => {
    let algoFieldComputer: AlgoFieldComputer;
    let user1: IUser & Document;
    let user2: IUser & Document;
    let user3: IUser & Document;
    let post1: IPost & Document;
    let post2: IPost & Document;
    let post3: IPost & Document;
    let post4: IPost & Document;

    beforeEach(() => {
        algoFieldComputer = new AlgoFieldComputer(AlgoSimilar, RatingsLikes, RatingsDislikes);
    });

    beforeEach(async () => {
        await container.resolve(DatabaseService).connect();
    });

    beforeEach(async () => {
        user1 = await User.create(DEFAULT_USER_1);
        user2 = await User.create(DEFAULT_USER_2);
        user3 = await User.create(DEFAULT_USER_3);

        const postService = container.resolve(PostService);
        const metricsService = container.resolve(MetricsService);

        post1 = await postService.publishPost(user3._id, { text: 'post1' });
        post2 = await postService.publishPost(user3._id, { text: 'post2' });
        post3 = await postService.publishPost(user3._id, { text: 'post3' });
        post4 = await postService.publishPost(user3._id, { text: 'post4' });

        await metricsService.likePost(user1._id, post1._id);
        await metricsService.likePost(user1._id, post2._id);
        await metricsService.likePost(user1._id, post4._id);

        await metricsService.likePost(user2._id, post1._id);
        await metricsService.likePost(user2._id, post2._id);
        await metricsService.likePost(user2._id, post3._id);

        await metricsService.likePost(user3._id, post2._id);
        await metricsService.likePost(user3._id, post3._id);
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    describe('computeForUser', () => {
        it('should compute user scores', async () => {
            await algoFieldComputer.computeForUser(user1._id);
            const scores = await AlgoSimilar.findOne({ user: user1._id });

            expect(scores?.others).toHaveLength(2); // Only users with common posts
        });

        it('should compute user scores with other user', async () => {
            await algoFieldComputer.computeForUser(user1._id);
            const scores = await AlgoSimilar.findOne({ user: user1._id });

            const similaritiesWithUser2 = scores!.others.find((other) => other.user.equals(user2._id));

            expect(similaritiesWithUser2!.score).toBeGreaterThan(0);
        });

        it('should compute greater score with user who liked the same posts', async () => {
            await algoFieldComputer.computeForUser(user1._id);
            const scores = await AlgoSimilar.findOne({ user: user1._id });

            const similaritiesWithUser2 = scores!.others.find((other) => other.user.equals(user2._id));
            const similaritiesWithUser3 = scores!.others.find((other) => other.user.equals(user3._id));

            expect(similaritiesWithUser2!.score).toBeGreaterThan(similaritiesWithUser3!.score);
        });
    });
});
