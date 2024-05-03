import { RatingsLikes } from '../../models/ratings/ratings-likes';
import { AlgoSuggestionComputer } from './algo-suggestions-computer';
import { AlgoSuggestionDefaultComputer } from './algo-suggestions-default-computer';
import { RatingsDislikes } from '../../models/ratings/ratings-dislikes';
import { container } from 'tsyringe';
import { DatabaseService } from '../../services/database-service/database-service';
import mongoose, { Document } from 'mongoose';
import User, { IUser } from '../../models/user';
import { PostService } from '../../services/post-service/post-service';
import { MetricsService } from '../../services/metrics-service/metrics-service';
import { AlgoFieldComputer } from '../algo-field-computer';
import { AlgoSimilar } from '../../models/algo/algo-similar';
import { AlgoConfidence } from '../../models/algo/algo-confidence';
import { IPost } from '../../models/post';

const DEFAULT_USER_1 = {
    username: 'mikewards',
    mail: 'mike@leborder.com',
    passwordHash: 'ripjeremy',
    name: 'Mike',
    surname: 'Wards',
};

const DEFAULT_USER_2 = {
    username: 'jeanrene',
    mail: 'jeanrene@infoman.com',
    passwordHash: 'avertissement',
    name: 'Jean-René',
    surname: 'Dufort',
};

const DEFAULT_USER_3 = {
    username: 'jtrudeau',
    mail: 'pm@gouv.qc.ca',
    passwordHash: 'lovemacron',
    name: 'Justin',
    surname: 'Trudeau',
};

describe('AlgoSuggestionComputer', () => {
    let similarityComputer: AlgoFieldComputer;
    let confidenceComputer: AlgoFieldComputer;
    let algoSuggestionComputer: AlgoSuggestionComputer;
    let user1: IUser & Document;
    let user2: IUser & Document;
    let user3: IUser & Document;
    let post3: IPost & Document;
    let post4: IPost & Document;

    beforeEach(() => {
        similarityComputer = new AlgoFieldComputer(AlgoSimilar, RatingsLikes, RatingsDislikes);
        confidenceComputer = new AlgoFieldComputer(AlgoConfidence, RatingsLikes, RatingsDislikes);
        algoSuggestionComputer = new AlgoSuggestionDefaultComputer({
            kTopUsers: 2,
            selectUserType: 'similar',
            positiveRatingsModel: RatingsLikes,
            negativeRatingsModel: RatingsDislikes,
        });
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

        const post1 = await postService.publishPost(user3._id, { text: 'post1' });
        const post2 = await postService.publishPost(user3._id, { text: 'post2' });
        post3 = await postService.publishPost(user3._id, { text: 'post3' });
        post4 = await postService.publishPost(user3._id, { text: 'post4' });
        await postService.publishPost(user3._id, { text: 'post5' });

        await metricsService.likePost(user1._id, post1._id);
        await metricsService.likePost(user1._id, post2._id);

        await metricsService.likePost(user2._id, post1._id);
        await metricsService.likePost(user2._id, post2._id);
        await metricsService.likePost(user2._id, post3._id);

        await metricsService.likePost(user3._id, post2._id);
        await metricsService.likePost(user3._id, post3._id);
        await metricsService.likePost(user3._id, post4._id);
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    describe('computeForUser', () => {
        it('should compute suggestions for user', async () => {
            await similarityComputer.computeForUser(user1._id);
            await confidenceComputer.computeForUser(user1._id);

            const suggestions = await algoSuggestionComputer.computeForUser(user1._id);

            expect(suggestions.user).toEqual(user1._id);
            expect(suggestions.others).toHaveLength(2); // User has already seen post 1 and 2, so only posts 3 and 4 are suggested (post 5 is not suggested)
        });

        it('should compute better score for closer user', async () => {
            await similarityComputer.computeForUser(user1._id);
            await confidenceComputer.computeForUser(user1._id);

            const suggestions = await algoSuggestionComputer.computeForUser(user1._id);

            const post3Suggestions = suggestions.others.find((s) => s.item.equals(post3._id));
            const post4Suggestions = suggestions.others.find((s) => s.item.equals(post4._id));

            expect(post3Suggestions!.weight).toBeGreaterThan(post4Suggestions!.weight);
        });
    });
});
