import { container } from 'tsyringe';
import { MetricsService } from './metrics-service';
import mongoose, { Types, Document } from 'mongoose';
import { DatabaseService } from '../database-service/database-service';
import { PostService } from '../post-service/post-service';
import { ICreatePost } from '../../models/post';
import { IUser, IUserCreation } from '../../models/user';
import { UserService } from '../user-service';
import { Metrics } from '../../models/metrics';

const DEFAULT_USER: IUserCreation = {
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
    let user: IUser & Document;

    beforeEach(async () => {
        await container.resolve(DatabaseService).connect();

        metricsService = container.resolve(MetricsService);
        postService = container.resolve(PostService);

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

            expect(metrics).toBeDefined();
            expect(metrics.likedBy).toContainEqual(user._id);
            expect(metrics.nbLikes).toBe(1);
        });

        it('should throw if post does not exists', () => {
            const id = new Types.ObjectId();

            return expect(metricsService.likePost(user._id, id)).rejects.toBeDefined();
        });
    });

    describe('dislikePost', () => {
        it('should dislike post', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            const metrics = await metricsService.dislikePost(user._id, post._id);

            expect(metrics).toBeDefined();
            expect(metrics.dislikedBy).toContainEqual(user._id);
            expect(metrics.nbDislikes).toBe(1);
        });

        it('should throw if post does not exists', () => {
            const id = new Types.ObjectId();

            return expect(metricsService.dislikePost(user._id, id)).rejects.toBeDefined();
        });
    });

    describe('trustPost', () => {
        it('should trust post', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            const metrics = await metricsService.trustPost(user._id, post._id);

            expect(metrics).toBeDefined();
            expect(metrics.trustedBy).toContainEqual(user._id);
            expect(metrics.nbTrusts).toBe(1);
        });

        it('should throw if post does not exists', () => {
            const id = new Types.ObjectId();

            return expect(metricsService.trustPost(user._id, id)).rejects.toBeDefined();
        });
    });

    describe('untrustPost', () => {
        it('should untrust post', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);
            const metrics = await metricsService.untrustPost(user._id, post._id);

            expect(metrics).toBeDefined();
            expect(metrics.untrustedBy).toContainEqual(user._id);
            expect(metrics.nbUntrusts).toBe(1);
        });

        it('should throw if post does not exists', () => {
            const id = new Types.ObjectId();

            return expect(metricsService.untrustPost(user._id, id)).rejects.toBeDefined();
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
