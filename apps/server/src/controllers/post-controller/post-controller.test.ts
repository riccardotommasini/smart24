import request from 'supertest';
import mongoose from 'mongoose';
import { container } from 'tsyringe';
import { Application } from '../../app';
import { StatusCodes } from 'http-status-codes';
import { ICreatePost, Post } from '../../models/post';
import User, { IUser } from '../../models/user';
import { Document } from 'mongoose';
import { DateTime } from 'luxon';
import { AuthService } from '../../services/auth-service/auth-service';

const DEFAULT_CREATE_POST: ICreatePost = {
    text: 'This is my post!',
};

const DEFAULT_POST = {
    text: 'This is my post!!!',
    date: DateTime.now(),
};

describe('PostController', () => {
    let app: Application;
    let user: IUser & Document;
    let token: string;

    beforeEach(async () => {
        app = container.resolve(Application);
        await app.init();
    });

    beforeEach(async () => {
        const username = 'michel';
        const passwordHash = 'yoyoyoyo';
        user = new User({
            username,
            mail: 'a',
            passwordHash,
        });

        await user.save();

        token = (await container.resolve(AuthService).login(username, passwordHash)).token;
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    describe('POST /post', () => {
        it('should create post', async () => {
            return request(app['app'])
                .post('/posts')
                .send(DEFAULT_CREATE_POST)
                .set('Authorization', 'Bearer ' + token)
                .expect(StatusCodes.CREATED)
                .then((res) => {
                    expect(res.body.text).toEqual(DEFAULT_CREATE_POST.text);
                    expect(res.body.createdBy).toEqual(user._id.toString());
                });
        });

        it('should not create if body has no text', () => {
            return request(app['app'])
                .post('/posts')
                .send({})
                .set('Authorization', 'Bearer ' + token)
                .expect(StatusCodes.BAD_REQUEST);
        });
    });

    describe('GET /posts/:id', () => {
        it('should get post', async () => {
            const post = await request(app['app'])
                .post('/posts')
                .send(DEFAULT_CREATE_POST)
                .set('Authorization', 'Bearer ' + token)
                .expect(StatusCodes.CREATED)
                .then((res) => res.body);

            return request(app['app'])
                .get(`/posts/${post._id}`)
                .set('Authorization', 'Bearer ' + token)
                .expect(StatusCodes.OK)
                .then((res) => {
                    expect(res.body.text).toEqual(DEFAULT_CREATE_POST.text);
                    expect(res.body.createdBy).toEqual(user._id.toString());
                });
        });

        it('should throw if post does not exists', async () => {
            return request(app['app'])
                .get(`/posts/${new mongoose.Types.ObjectId()}`)
                .set('Authorization', 'Bearer ' + token)
                .expect(StatusCodes.NOT_FOUND);
        });
    });

    describe('POST /post/comment', () => {
        it('should create comment', async () => {
            const post = new Post(DEFAULT_POST);
            await post.save();
            return request(app['app'])
                .post('/posts/comment')
                .send({ ...DEFAULT_CREATE_POST, parentPostId: post._id })
                .set('Authorization', 'Bearer ' + token)
                .expect(StatusCodes.CREATED)
                .then((res) => {
                    expect(res.body.text).toEqual(DEFAULT_CREATE_POST.text);
                    expect(res.body.createdBy).toEqual(user._id.toString());
                });
        });

        it('it should not post if parentPostId is wrong', async () => {
            const post = new Post(DEFAULT_POST);
            await post.save();
            return request(app['app'])
                .post('/posts/comment')
                .send({ ...DEFAULT_CREATE_POST, parentPostId: '663257b2da791bd000000000' })
                .set('Authorization', 'Bearer ' + token)
                .expect(StatusCodes.NOT_FOUND);
        });
    });
});
