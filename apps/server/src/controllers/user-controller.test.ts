import request from 'supertest';
import mongoose, { Document } from 'mongoose';
import User, { IUser } from '../models/user';
import { Application } from '../app';
import { container } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/auth-service/auth-service';

const DEFAULT_USER = {
    username: 'richard',
    mail: 'richard@richard.com',
    passwordHash: 'bouetteentabarnak',
};
const DEFAULT_USER_2 = {
    username: 'joellegendre',
    mail: 'joellegendre@tva.ca',
    passwordHash: 'dansleparc',
};

describe('UserController', () => {
    let app: Application;
    let user: IUser & Document;
    let token: string;

    beforeEach(async () => {
        app = container.resolve(Application);
        await app.init();
    });

    beforeEach(async () => {
        user = new User(DEFAULT_USER);

        await user.save();

        token = (await container.resolve(AuthService).login(DEFAULT_USER.username, DEFAULT_USER.passwordHash)).token;
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    describe('POST /user/trustUser', () => {
        it('should trust user', async () => {
            const user2 = new User(DEFAULT_USER_2);
            await user2.save();

            return request(app['app'])
                .post('/user/trustUser')
                .set('Authorization', `Bearer ${token}`)
                .send({ otherUserId: user2._id })
                .expect(StatusCodes.NO_CONTENT);
        });

        it('should not trust user if body has no otherUserId', () => {
            return request(app['app'])
                .post('/user/trustUser')
                .set('Authorization', `Bearer ${token}`)
                .expect(StatusCodes.BAD_REQUEST);
        });
    });

    describe('POST /user/untrustUser', () => {
        it('should untrust user', async () => {
            const user2 = new User(DEFAULT_USER_2);
            await user2.save();

            return request(app['app'])
                .post('/user/untrustUser')
                .set('Authorization', `Bearer ${token}`)
                .send({ otherUserId: user2._id })
                .expect(StatusCodes.NO_CONTENT);
        });

        it('should not untrust user if body has no otherUserId', () => {
            return request(app['app'])
                .post('/user/untrustUser')
                .set('Authorization', `Bearer ${token}`)
                .expect(StatusCodes.BAD_REQUEST);
        });
    });

    describe('POST /user/visitUserProfile', () => {
        it('should visit user profile', async () => {
            const user2 = new User(DEFAULT_USER_2);
            await user2.save();

            return request(app['app'])
                .post('/user/visitUserProfile')
                .set('Authorization', `Bearer ${token}`)
                .send({ otherUserId: user2._id })
                .expect(StatusCodes.OK);
        });

        it('should not visit user profile if body has no otherUserId', () => {
            return request(app['app'])
                .post('/user/visitUserProfile')
                .set('Authorization', `Bearer ${token}`)
                .expect(StatusCodes.BAD_REQUEST);
        });
    });
});
