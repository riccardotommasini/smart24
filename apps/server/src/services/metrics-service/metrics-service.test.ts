import { container } from 'tsyringe';
import { MetricsService } from './metrics-service';
import mongoose, { Types, Document } from 'mongoose';
import { DatabaseService } from '../database-service/database-service';
import { PostService } from '../post-service/post-service';
import { ICreatePost } from '../../models/post';
import { IUser, IUserCreation } from '../../models/user';
import { UserService } from '../user-service';
import { Metrics } from '../../models/metrics';
import { RatingsLikesService } from '../ratings-services/ratings-likes-service';
import { RatingsDislikesService } from '../ratings-services/ratings-dislikes-service';
import { RatingsTrustService } from '../ratings-services/ratings-trust-service';
import { RatingsUntrustService } from '../ratings-services/ratings-untrust-service';

const DEFAULT_USER: IUserCreation = {
    name: 'ginette',
    surname: 'reno',
    username: 'ginettereno',
    mail: 'ginette@hola.com',
    password: 'chantelhymnenational',
};

const DEFAULT_CREATE_POST: ICreatePost = {
    text: 'This is my post!',
};

describe('MetricsService', () => {
    let metricsService: MetricsService;
    let postService: PostService;
    let ratingsLikesService: RatingsLikesService;
    let ratingsDislikesService: RatingsDislikesService;
    let ratingsTrustService: RatingsTrustService;
    let ratingsUntrustService: RatingsUntrustService;
    let user: IUser & Document;

    beforeEach(async () => {
        await container.resolve(DatabaseService).connect();

        metricsService = container.resolve(MetricsService);
        postService = container.resolve(PostService);
        ratingsLikesService = container.resolve(RatingsLikesService);
        ratingsDislikesService = container.resolve(RatingsDislikesService);
        ratingsTrustService = container.resolve(RatingsTrustService);
        ratingsUntrustService = container.resolve(RatingsUntrustService);

        user = await container.resolve(UserService).createUser(DEFAULT_USER);
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    it('should create', () => {
        expect(metricsService).toBeDefined();
    });

    describe('getMetricsByPostId', () => {
        it('should get metrics', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);

            expect(await metricsService.getMetricsByPostId(post._id)).toBeDefined();
        });

        it('should throw if post does not exists', () => {
            const id = new Types.ObjectId();

            return expect(metricsService.getMetricsByPostId(id)).rejects.toBeDefined();
        });

        it('should throw if metrics does not exists', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            await Metrics.findByIdAndDelete(post.metrics);

            return expect(metricsService.getMetricsByPostId(post._id)).rejects.toBeDefined();
        });
    });

    describe('findMetrics', () => {
        it('should find metrics', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);

            expect(await metricsService.findMetrics(post.metrics)).toBeDefined();
        });

        it('should throw if metrics does not exists', () => {
            const id = new Types.ObjectId();

            return expect(metricsService.findMetrics(id)).rejects.toBeDefined();
        });
    });

    describe('likePost', () => {
        it('should like post', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            const metrics = await metricsService.likePost(user._id, post._id);
            const ratings = await ratingsLikesService.hasLikedPost(user._id, post._id);

            expect(ratings).toBe(true);
            expect(metrics).toBeDefined();
            expect(metrics.likedBy).toContainEqual(user._id);
            expect(metrics.nbLikes).toBe(1);
        });

        it('should unlike post', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            await metricsService.likePost(user._id, post._id);
            const metrics = await metricsService.likePost(user._id, post._id);
            const ratings = await ratingsLikesService.hasLikedPost(user._id, post._id);

            expect(ratings).toBe(false);
            expect(metrics).toBeDefined();
            expect(metrics.likedBy).not.toContainEqual(user._id);
            expect(metrics.nbLikes).toBe(0);
            expect(metrics.nbDislikes).toBe(0);
        });

        it('should switch from dislike to like', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            await metricsService.dislikePost(user._id, post._id);
            const metrics = await metricsService.likePost(user._id, post._id);
            const ratingsLikes = await ratingsLikesService.hasLikedPost(user._id, post._id);
            const ratingsDislikes = await ratingsDislikesService.hasDislikedPost(user._id, post._id);

            expect(ratingsDislikes).toBe(false);
            expect(ratingsLikes).toBe(true);
            expect(metrics).toBeDefined();
            expect(metrics.likedBy).toContainEqual(user._id);
            expect(metrics.dislikedBy).not.toContainEqual(user._id);
            expect(metrics.nbLikes).toBe(1);
            expect(metrics.nbDislikes).toBe(0);
        });

        it('should throw if post does not exists', () => {
            const id = new Types.ObjectId();

            return expect(metricsService.likePost(user._id, id)).rejects.toBeDefined();
        });

        it('should throw if user does not exists', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            const id = new Types.ObjectId();

            return expect(metricsService.likePost(id, post._id)).rejects.toBeDefined();
        });
    });

    describe('dislikePost', () => {
        it('should dislike post', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            const metrics = await metricsService.dislikePost(user._id, post._id);
            const ratingsDislikes = await ratingsDislikesService.hasDislikedPost(user._id, post._id);

            expect(ratingsDislikes).toBe(true);
            expect(metrics).toBeDefined();
            expect(metrics.dislikedBy).toContainEqual(user._id);
            expect(metrics.nbDislikes).toBe(1);
        });

        it('should undislike post', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            await metricsService.dislikePost(user._id, post._id);
            const metrics = await metricsService.dislikePost(user._id, post._id);
            const ratingsDislikes = await ratingsDislikesService.hasDislikedPost(user._id, post._id);

            expect(ratingsDislikes).toBe(false);
            expect(metrics).toBeDefined();
            expect(metrics.dislikedBy).not.toContainEqual(user._id);
            expect(metrics.nbDislikes).toBe(0);
            expect(metrics.nbLikes).toBe(0);
        });

        it('should switch from like to dislike', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            await metricsService.likePost(user._id, post._id);
            const metrics = await metricsService.dislikePost(user._id, post._id);
            const ratingsLikes = await ratingsLikesService.hasLikedPost(user._id, post._id);
            const ratingsDislikes = await ratingsDislikesService.hasDislikedPost(user._id, post._id);

            expect(ratingsDislikes).toBe(true);
            expect(ratingsLikes).toBe(false);
            expect(metrics).toBeDefined();
            expect(metrics.dislikedBy).toContainEqual(user._id);
            expect(metrics.likedBy).not.toContainEqual(user._id);
            expect(metrics.nbDislikes).toBe(1);
            expect(metrics.nbLikes).toBe(0);
        });

        it('should throw if post does not exists', () => {
            const id = new Types.ObjectId();

            return expect(metricsService.dislikePost(user._id, id)).rejects.toBeDefined();
        });

        it('should throw if user does not exists', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            const id = new Types.ObjectId();

            return expect(metricsService.dislikePost(id, post._id)).rejects.toBeDefined();
        });
    });

    describe('trustPost', () => {
        it('should trust post', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            const metrics = await metricsService.trustPost(user._id, post._id);
            const ratings = await ratingsTrustService.hasTrustedPost(user._id, post._id);

            expect(ratings).toBe(true);
            expect(metrics).toBeDefined();
            expect(metrics.trustedBy).toContainEqual(user._id);
            expect(metrics.nbTrusts).toBe(1);
        });

        it('should remove trust post', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            await metricsService.trustPost(user._id, post._id);
            const metrics = await metricsService.trustPost(user._id, post._id);
            const ratings = await ratingsTrustService.hasTrustedPost(user._id, post._id);

            expect(ratings).toBe(false);
            expect(metrics).toBeDefined();
            expect(metrics.trustedBy).not.toContainEqual(user._id);
            expect(metrics.nbTrusts).toBe(0);
        });

        it('should switch from untrust to trust', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            await metricsService.untrustPost(user._id, post._id);
            const metrics = await metricsService.trustPost(user._id, post._id);
            const ratingsTrust = await ratingsTrustService.hasTrustedPost(user._id, post._id);
            const ratingsUntrust = await ratingsUntrustService.hasUntrustedPost(user._id, post._id);

            expect(ratingsUntrust).toBe(false);
            expect(ratingsTrust).toBe(true);
            expect(metrics).toBeDefined();
            expect(metrics.trustedBy).toContainEqual(user._id);
            expect(metrics.untrustedBy).not.toContainEqual(user._id);
            expect(metrics.nbTrusts).toBe(1);
            expect(metrics.nbUntrusts).toBe(0);
        });

        it('should throw if post does not exists', () => {
            const id = new Types.ObjectId();

            return expect(metricsService.trustPost(user._id, id)).rejects.toBeDefined();
        });

        it('should throw if user does not exists', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            const id = new Types.ObjectId();

            return expect(metricsService.trustPost(id, post._id)).rejects.toBeDefined();
        });
    });

    describe('untrustPost', () => {
        it('should untrust post', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            const metrics = await metricsService.untrustPost(user._id, post._id);
            const ratingsUntrust = await ratingsUntrustService.hasUntrustedPost(user._id, post._id);

            expect(ratingsUntrust).toBe(true);
            expect(metrics).toBeDefined();
            expect(metrics.untrustedBy).toContainEqual(user._id);
            expect(metrics.nbUntrusts).toBe(1);
        });

        it('should remove untrust post', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            await metricsService.untrustPost(user._id, post._id);
            const metrics = await metricsService.untrustPost(user._id, post._id);
            const ratingsUntrust = await ratingsUntrustService.hasUntrustedPost(user._id, post._id);

            expect(ratingsUntrust).toBe(false);
            expect(metrics).toBeDefined();
            expect(metrics.untrustedBy).not.toContainEqual(user._id);
            expect(metrics.nbUntrusts).toBe(0);
        });

        it('should switch from trust to untrust', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            await metricsService.trustPost(user._id, post._id);
            const metrics = await metricsService.untrustPost(user._id, post._id);
            const ratingsUntrust = await ratingsUntrustService.hasUntrustedPost(user._id, post._id);
            const ratingsTrust = await ratingsTrustService.hasTrustedPost(user._id, post._id);

            expect(ratingsTrust).toBe(false);
            expect(ratingsUntrust).toBe(true);
            expect(metrics).toBeDefined();
            expect(metrics.untrustedBy).toContainEqual(user._id);
            expect(metrics.trustedBy).not.toContainEqual(user._id);
            expect(metrics.nbUntrusts).toBe(1);
            expect(metrics.nbTrusts).toBe(0);
        });

        it('should throw if post does not exists', () => {
            const id = new Types.ObjectId();

            return expect(metricsService.untrustPost(user._id, id)).rejects.toBeDefined();
        });

        it('should throw if user does not exists', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            const id = new Types.ObjectId();

            return expect(metricsService.untrustPost(id, post._id)).rejects.toBeDefined();
        });
    });

    describe('updateMetrics', () => {
        it('should update metrics', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            const metrics = await metricsService.getMetricsByPostId(post._id);

            const updatedMetrics = await metricsService.updateMetrics(metrics._id, { nbLikes: 10 });

            expect(updatedMetrics).toBeDefined();
            expect(updatedMetrics.nbLikes).toBe(10);
        });

        it('should throw if metrics does not exists', () => {
            const id = new Types.ObjectId();

            return expect(metricsService.updateMetrics(id, { nbLikes: 10 })).rejects.toBeDefined();
        });
    });
});
