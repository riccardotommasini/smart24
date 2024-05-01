import { container } from 'tsyringe';
import { PostService } from './post-service';
import { IUser, User } from '../../models/user';
import { ICreatePost, Post } from '../../models/post';
import { DatabaseService } from '../database-service/database-service';
import mongoose, { Types } from 'mongoose';
import { Metrics } from '../../models/metrics';

const DEFAULT_CREATE_POST: ICreatePost = {
    text: 'This is my post!',
};

describe('PostService', () => {
    let postService: PostService;
    let user: IUser;

    beforeEach(async () => {
        await container.resolve(DatabaseService).connect();
        postService = container.resolve(PostService);
        user = new User({
            mail: 'a@a.com',
            username: 'a',
            passwordHash: 'a',
        });

        await user.save();
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    it('should create', () => {
        expect(postService).toBeDefined();
    });

    describe('publishPost', () => {
        it('should publish post', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);

            expect((await Post.findById(post._id))?.text).toEqual(DEFAULT_CREATE_POST.text);
        });

        it('should create corresponding metrics', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);

            expect(await Metrics.countDocuments({ _id: post.metrics })).toEqual(1);
        });

        it('should not publish if user does not exists', async () => {
            return expect(
                postService.publishPost(new Types.ObjectId().toString(), DEFAULT_CREATE_POST),
            ).rejects.toBeDefined();
        });
    });

    describe('publishComment', () => {
        it('should publish comment', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);

            const comment = await postService.publishComment(user._id, {
                text: 'This is my comment',
                parentPostId: post._id,
            });

            expect((await Post.findById(comment._id))?.text).toEqual('This is my comment');
        });

        it('should create corresponding metrics', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);

            const comment = await postService.publishComment(user._id, {
                text: 'This is my comment',
                parentPostId: post._id,
            });

            expect(await Metrics.countDocuments({ _id: comment.metrics })).toEqual(1);
        });

        it('should not publish if user does not exists', async () => {
            return expect(
                postService.publishComment(new Types.ObjectId().toString(), {
                    text: 'This is my comment',
                    parentPostId: new Types.ObjectId(),
                }),
            ).rejects.toBeDefined();
        });

        it('should not publish if post does not exists', async () => {
            return expect(
                postService.publishComment(user._id, {
                    text: 'This is my comment',
                    parentPostId: new Types.ObjectId(),
                }),
            ).rejects.toBeDefined();
        });
    });

    describe('getPost', () => {
        it('should get post', async () => {
            const post = await postService.publishPost(user._id, DEFAULT_CREATE_POST);

            const foundPost = await postService.getPost(post._id);

            expect(foundPost).toBeDefined();
        });

        it('should not get post if it does not exists', async () => {
            return expect(postService.getPost(new Types.ObjectId())).rejects.toBeDefined();
        });
    });
});
