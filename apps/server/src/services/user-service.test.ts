import { container } from 'tsyringe';
import { UserService } from './user-service';
import mongoose, { Types, Document } from 'mongoose';
import User, { IUser } from '../models/user';
import { DatabaseService } from './database-service/database-service';

const DEFAULT_USER = {
    username: 'joe',
    mail: 'joe@mama.com',
    passwordHash: 'hola',
};
const DEFAULT_USER_2 = {
    username: 'toto',
    mail: 'toto@pasgentil.ca',
    passwordHash: 'yop',
};

describe('UserService', () => {
    let userService: UserService;

    beforeEach(async () => {
        await container.resolve(DatabaseService).connect();
        userService = container.resolve(UserService);
    });

    afterEach(async () => {
        await mongoose.connection.db.dropDatabase();
    });

    it('should create', () => {
        expect(userService).toBeDefined();
    });

    describe('getUser', () => {
        it('should get user', async () => {
            const user = new User(DEFAULT_USER);
            await user.save();

            const found = await userService.getUser(user._id);

            expect(found).toBeDefined();
            expect(found.username).toEqual(DEFAULT_USER.username);
        });

        it('should throw if user does not exists', () => {
            const id = new Types.ObjectId();

            return expect(userService.getUser(id)).rejects.toBeDefined();
        });
    });

    describe('login', () => {
        it('should login', async () => {
            const user = new User(DEFAULT_USER);
            await user.save();

            const login = await userService.login(DEFAULT_USER.username, DEFAULT_USER.passwordHash);

            expect(login).toBeDefined();
            expect(login.token).toBeDefined();
            expect(login.user.username).toEqual(DEFAULT_USER.username);
        });

        it('should reject if password is invalid', async () => {
            const user = new User(DEFAULT_USER);
            await user.save();

            return expect(userService.login(DEFAULT_USER.username, 'INVALID PASSWORD')).rejects.toBeDefined();
        });

        it('should reject if username is invalid', async () => {
            const user = new User(DEFAULT_USER);
            await user.save();

            return expect(userService.login('INVALID USERNAME', DEFAULT_USER.passwordHash)).rejects.toBeDefined();
        });
    });

    describe('loadSession', () => {
        let user: IUser & Document;

        beforeEach(async () => {
            user = new User(DEFAULT_USER);
            await user.save();
        });

        it('should load session', async () => {
            const login = await userService.login(DEFAULT_USER.username, DEFAULT_USER.passwordHash);
            const [sessionUser] = await userService.loadSession(login.token);

            expect(sessionUser).toBeDefined();
            expect(sessionUser.username).toEqual(DEFAULT_USER.username);
        });

        it('should not load session if token is invalid', () => {
            return expect(userService.loadSession('INVALID TOKEN')).rejects.toBeDefined();
        });

        it('should not load session if user does not exists', async () => {
            const login = await userService.login(DEFAULT_USER.username, DEFAULT_USER.passwordHash);

            await user.deleteOne();

            return expect(userService.loadSession(login.token)).rejects.toBeDefined();
        });
    });

    describe('user_trustUser_post', () => {
        let user1: IUser & Document;
        let user2: IUser & Document;

        beforeEach(async () => {
            user1 = new User(DEFAULT_USER);
            user2 = new User(DEFAULT_USER_2);

            await Promise.all([user1.save(), user2.save()]);
        });

        it('should trust user', async () => {
            await userService.user_trustUser_post(user1._id.toString(), user2._id.toString());

            user1 = await User.findById(user1._id);

            expect(user1.trustedUsers).toContainEqual(user2._id);
        });

        it('should remove from untrusted users', async () => {
            user1.updateOne({ _id: user1._id }, { $push: { untrustedUsers: user2._id } });

            await userService.user_trustUser_post(user1._id.toString(), user2._id.toString());

            user1 = await User.findById(user1._id);

            expect(user1.untrustedUsers).not.toContainEqual(user2._id);
        });
    });
});
