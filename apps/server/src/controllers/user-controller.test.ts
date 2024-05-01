import request from 'supertest';
import mongoose, { Document } from 'mongoose';
import User, { IUser } from '../models/user';
import { Application } from '../app';
import { UserService } from '../services/user-service';
import { container } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';

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

        token = (await container.resolve(UserService).login(DEFAULT_USER.username, DEFAULT_USER.passwordHash)).token;
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    describe('POST /login', () => {
        it('should login', async () => {
            return request(app['app'])
                .post('/login')
                .send({ username: DEFAULT_USER.username, password: DEFAULT_USER.passwordHash })
                .expect(StatusCodes.OK)
                .then((res) => {
                    expect(res.body.token).toBeDefined();
                    expect(res.body.user.username).toEqual(DEFAULT_USER.username);
                });
        });

        it('should not login if body has no username', () => {
            return request(app['app'])
                .post('/login')
                .send({ password: DEFAULT_USER.passwordHash })
                .expect(StatusCodes.BAD_REQUEST);
        });

        it('should not login if body has no password', () => {
            return request(app['app'])
                .post('/login')
                .send({ username: DEFAULT_USER.username })
                .expect(StatusCodes.BAD_REQUEST);
        });
    });

    describe('POST /user/create', () => {
        it('should create user', async () => {
            return request(app['app'])
                .post('/user/create')
                .send({
                    username: DEFAULT_USER_2.username,
                    mail: DEFAULT_USER_2.mail,
                    password: DEFAULT_USER_2.passwordHash,
                })
                .expect(StatusCodes.OK)
                .then((res) => {
                    expect(res.body.username).toEqual(DEFAULT_USER_2.username);
                });
        });

        it('should create user with all fields', async () => {
            const userWithAllFields = {
                ...DEFAULT_USER_2,
                password: DEFAULT_USER_2.passwordHash,
                name: 'Joel',
                surname: 'Legendre',
                birthday: new Date(2001, 6, 29),
                factChecker: true,
                organization: 'Radio-Canada',
            };

            return request(app['app'])
                .post('/user/create')
                .send({ ...userWithAllFields, birthday: userWithAllFields.birthday.toISOString() })
                .expect(StatusCodes.OK)
                .then((res) => {
                    expect(res.body.username).toEqual(DEFAULT_USER_2.username);
                    expect(res.body.name).toEqual(userWithAllFields.name);
                    expect(res.body.surname).toEqual(userWithAllFields.surname);
                    expect(res.body.birthday).toEqual(userWithAllFields.birthday.toISOString());
                    expect(res.body.factChecker).toEqual(userWithAllFields.factChecker);
                    expect(res.body.organization).toEqual(userWithAllFields.organization);
                });
        });

        it('should not create if body has no username', () => {
            return request(app['app'])
                .post('/user/create')
                .send({ mail: DEFAULT_USER_2.mail, password: DEFAULT_USER_2.passwordHash })
                .expect(StatusCodes.BAD_REQUEST);
        });

        it('should not create if body has no mail', () => {
            return request(app['app'])
                .post('/user/create')
                .send({ username: DEFAULT_USER_2.username, password: DEFAULT_USER_2.passwordHash })
                .expect(StatusCodes.BAD_REQUEST);
        });

        it('should not create if body has no password', () => {
            return request(app['app'])
                .post('/user/create')
                .send({ username: DEFAULT_USER_2.username, mail: DEFAULT_USER_2.mail })
                .expect(StatusCodes.BAD_REQUEST);
        });

        it('should not create if username already exists', () => {
            return request(app['app'])
                .post('/user/create')
                .send({
                    username: DEFAULT_USER.username,
                    mail: DEFAULT_USER_2.mail,
                    password: DEFAULT_USER_2.passwordHash,
                })
                .expect(StatusCodes.BAD_REQUEST);
        });

        it('should not create if birthday is not a date', () => {
            return request(app['app'])
                .post('/user/create')
                .send({
                    username: DEFAULT_USER_2.username,
                    mail: DEFAULT_USER_2.mail,
                    password: DEFAULT_USER_2.passwordHash,
                    birthday: 'not a date',
                })
                .expect(StatusCodes.BAD_REQUEST);
        });
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

    describe('POST /user/update', () => {
        it('should update name', () => {
            return request(app['app'])
                .post('/user/update')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Richard' })
                .expect(StatusCodes.OK)
                .then((res) => {
                    expect(res.body.name).toEqual('Richard');
                });
        });
    });
});
