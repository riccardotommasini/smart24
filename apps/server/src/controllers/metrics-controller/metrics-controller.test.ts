import request from 'supertest';
import mongoose from 'mongoose';
import { container } from 'tsyringe';
import { Application } from '../../app';
import { StatusCodes } from 'http-status-codes';
import { ICreatePost } from '../../models/post';
import User, { IUser } from '../../models/user';
import { Document } from 'mongoose';
import { AuthService } from '../../services/auth-service/auth-service';

const DEFAULT_CREATE_POST: ICreatePost = {
    text: 'This is my post!',
};

describe('MetricsController', () => {
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

    describe('GET /posts/:id/metrics', () => {
        it('should get metrics', async () => {
            const post = await request(app['app'])
                .post('/posts')
                .send(DEFAULT_CREATE_POST)
                .set('Authorization', 'Bearer ' + token)
                .expect(StatusCodes.CREATED)
                .then((res) => res.body);

            return request(app['app'])
                .get(`/posts/${post._id}/metrics`)
                .set('Authorization', 'Bearer ' + token)
                .expect(StatusCodes.OK);
        });

        it('should throw if post does not exists', async () => {
            return request(app['app'])
                .get(`/posts/${new mongoose.Types.ObjectId()}/metrics`)
                .set('Authorization', 'Bearer ' + token)
                .expect(StatusCodes.NOT_FOUND);
        });
    });
});
