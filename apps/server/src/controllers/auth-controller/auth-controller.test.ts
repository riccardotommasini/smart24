import request from 'supertest';
import mongoose, { Document } from 'mongoose';
import User, { IUser } from '../../models/user';
import { Application } from '../../app';
import { container } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../../services/auth-service/auth-service';

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

describe('AuthController', () => {
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

    describe('POST /signup', () => {
        it('should create user', async () => {
            return request(app['app'])
                .post('/signup')
                .send({
                    username: DEFAULT_USER_2.username,
                    mail: DEFAULT_USER_2.mail,
                    password: DEFAULT_USER_2.passwordHash,
                })
                .expect(StatusCodes.CREATED)
                .then((res) => {
                    expect(res.body.user.username).toEqual(DEFAULT_USER_2.username);
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
                .post('/signup')
                .send({ ...userWithAllFields, birthday: userWithAllFields.birthday.toISOString() })
                .expect(StatusCodes.CREATED)
                .then(async (res): Promise<void> => {
                    expect(res.body.user.username).toEqual(DEFAULT_USER_2.username);

                    const createdUser = await User.findById(res.body.user._id);
                    expect(createdUser?.name).toEqual(userWithAllFields.name);
                    expect(createdUser?.surname).toEqual(userWithAllFields.surname);
                    expect(createdUser?.birthday.toISOString()).toEqual(userWithAllFields.birthday.toISOString());
                    expect(createdUser?.factChecker).toEqual(userWithAllFields.factChecker);
                    expect(createdUser?.organization).toEqual(userWithAllFields.organization);
                });
        });

        it('should not create if body has no username', () => {
            return request(app['app'])
                .post('/signup')
                .send({ mail: DEFAULT_USER_2.mail, password: DEFAULT_USER_2.passwordHash })
                .expect(StatusCodes.BAD_REQUEST);
        });

        it('should not create if body has no mail', () => {
            return request(app['app'])
                .post('/signup')
                .send({ username: DEFAULT_USER_2.username, password: DEFAULT_USER_2.passwordHash })
                .expect(StatusCodes.BAD_REQUEST);
        });

        it('should not create if body has no password', () => {
            return request(app['app'])
                .post('/signup')
                .send({ username: DEFAULT_USER_2.username, mail: DEFAULT_USER_2.mail })
                .expect(StatusCodes.BAD_REQUEST);
        });

        it('should not create if username already exists', () => {
            return request(app['app'])
                .post('/signup')
                .send({
                    username: DEFAULT_USER.username,
                    mail: DEFAULT_USER_2.mail,
                    password: DEFAULT_USER_2.passwordHash,
                })
                .expect(StatusCodes.BAD_REQUEST);
        });

        it('should not create if birthday is not a date', () => {
            return request(app['app'])
                .post('/signup')
                .send({
                    username: DEFAULT_USER_2.username,
                    mail: DEFAULT_USER_2.mail,
                    password: DEFAULT_USER_2.passwordHash,
                    birthday: 'not a date',
                })
                .expect(StatusCodes.BAD_REQUEST);
        });
    });

    describe('POST /loadSession', () => {
        it('should load session', async () => {
            return request(app['app'])
                .post('/loadSession')
                .set('Authorization', `Bearer ${token}`)
                .expect(StatusCodes.OK)
                .then((res) => {
                    expect(res.body.username).toEqual(DEFAULT_USER.username);
                });
        });
    });
});
