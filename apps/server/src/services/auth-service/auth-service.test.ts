import { container } from 'tsyringe';
import { DatabaseService } from '../database-service/database-service';
import { AuthService } from './auth-service';
import mongoose, { Document } from 'mongoose';
import User, { IUser } from '../../models/user';

const DEFAULT_USER = {
    username: 'joe',
    mail: 'joe@mama.com',
    passwordHash: 'hola',
};

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(async () => {
        await container.resolve(DatabaseService).connect();
        authService = container.resolve(AuthService);
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    it('should create', () => {
        expect(authService).toBeDefined();
    });

    describe('login', () => {
        it('should login', async () => {
            const user = new User(DEFAULT_USER);
            await user.save();

            const login = await authService.login(DEFAULT_USER.username, DEFAULT_USER.passwordHash);

            expect(login).toBeDefined();
            expect(login.token).toBeDefined();
            expect(login.user.username).toEqual(DEFAULT_USER.username);
        });

        it('should reject if password is invalid', async () => {
            const user = new User(DEFAULT_USER);
            await user.save();

            return expect(authService.login(DEFAULT_USER.username, 'INVALID PASSWORD')).rejects.toBeDefined();
        });

        it('should reject if username is invalid', async () => {
            const user = new User(DEFAULT_USER);
            await user.save();

            return expect(authService.login('INVALID USERNAME', DEFAULT_USER.passwordHash)).rejects.toBeDefined();
        });

        it('should reject if user does not exists', async () => {
            return expect(authService.login(DEFAULT_USER.username, DEFAULT_USER.passwordHash)).rejects.toBeDefined();
        });
    });

    describe('signup', () => {
        it('should signup user', async () => {
            await authService.signup({ ...DEFAULT_USER, password: DEFAULT_USER.passwordHash });

            expect(await User.findOne({ username: DEFAULT_USER.username, mail: DEFAULT_USER.mail })).toBeDefined();
        });

        it('should return token and user', async () => {
            const res = await authService.signup({ ...DEFAULT_USER, password: DEFAULT_USER.passwordHash });

            expect(res.token).toBeDefined();
            expect(res.user.username).toEqual(DEFAULT_USER.username);
        });

        it('should signup user with all extra info', async () => {
            const userData = {
                ...DEFAULT_USER,
                password: DEFAULT_USER.passwordHash,
                name: 'John',
                surname: 'Doe',
                birthday: new Date(2001, 6, 29),
                factChecker: true,
                organization: 'Hello',
            };

            await authService.signup(userData);

            const res = await User.findOne({ username: userData.username, mail: userData.mail });

            expect(res?.name).toEqual(userData.name);
            expect(res?.surname).toEqual(userData.surname);
            expect(res?.birthday).toEqual(userData.birthday);
            expect(res?.factChecker).toEqual(userData.factChecker);
            expect(res?.organization).toEqual(userData.organization);
        });
    });

    describe('loadSession', () => {
        let user: IUser & Document;

        beforeEach(async () => {
            user = new User(DEFAULT_USER);
            await user.save();
        });

        it('should load session', async () => {
            const login = await authService.login(DEFAULT_USER.username, DEFAULT_USER.passwordHash);
            const [sessionUser] = await authService.loadSession(login.token);

            expect(sessionUser).toBeDefined();
            expect(sessionUser.username).toEqual(DEFAULT_USER.username);
        });

        it('should not load session if token is invalid', () => {
            return expect(authService.loadSession('INVALID TOKEN')).rejects.toBeDefined();
        });

        it('should not load session if user does not exists', async () => {
            const login = await authService.login(DEFAULT_USER.username, DEFAULT_USER.passwordHash);

            await user.deleteOne();

            return expect(authService.loadSession(login.token)).rejects.toBeDefined();
        });
    });
});
