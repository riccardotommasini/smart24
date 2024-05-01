import request from 'supertest';
import mongoose from 'mongoose';
import sinon from 'sinon';
import { container } from 'tsyringe';
import { Application } from '../../app';
import { StatusCodes } from 'http-status-codes';
import { ICreatePost } from '../../models/post';
import User, { IUser } from '../../models/user';
import { Document } from 'mongoose';
import { UserService } from '../../services/user-service';

const DEFAULT_CREATE_POST: ICreatePost = {
    text: 'This is my post!',
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
                .expect(StatusCodes.INTERNAL_SERVER_ERROR);
        });
    });
});
