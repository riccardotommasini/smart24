import request from 'supertest';
import mongoose from 'mongoose';
import sinon from 'sinon';
import { container } from 'tsyringe';
import { Application } from '../../app';
import { StatusCodes } from 'http-status-codes';
import { PostService } from '../../services/post-service/post-service';
import { ICreatePost } from '../../models/post';
import User, { IUser } from '../../models/user';
import { Document } from 'mongoose';
import { UserService } from '../../services/user-service';

const DEFAULT_CREATE_POST: ICreatePost = {
    text: 'This is my post!',
};

describe('PostController', () => {
    let app: Application;
    let postService: PostService;
    let user: IUser & Document;
    let token: string;

    beforeEach(async () => {
        app = container.resolve(Application);
        postService = container.resolve(PostService);

        await app.init();
    });

    beforeEach(async () => {
        const username = 'fuckyou';
        const passwordHash = 'yoyoyoyo';
        user = new User({
            username,
            mail: 'a',
            passwordHash,
        });

        await user.save();

        token = (await container.resolve(UserService).login(username, passwordHash)).token;
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
        sinon.restore();
    });

    describe('POST /post', () => {
        it('should call publishPost', () => {
            const mock = sinon.mock(postService);
            mock.expects('publishPost').once();

            return request(app['app'])
                .post('/posts')
                .send(DEFAULT_CREATE_POST)
                .set('Authorization', 'Bearer ' + token)
                .expect(StatusCodes.CREATED)
                .then(() => mock.verify());
        });

        it('should not create if body has no text', () => {
            sinon.mock(postService);

            return request(app['app'])
                .post('/posts')
                .send({})
                .set('Authorization', 'Bearer ' + token)
                .expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });
});
