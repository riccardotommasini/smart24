import { container } from 'tsyringe';
import { UserService } from './user-service';
import mongoose, { Types, Document } from 'mongoose';
import User, { IUser } from '../models/user';
import { DatabaseService } from './database-service/database-service';
import { PostService } from './post-service/post-service';

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

        it('should reject if user does not exists', async () => {
            return expect(userService.login(DEFAULT_USER.username, DEFAULT_USER.passwordHash)).rejects.toBeDefined();
        });
    });

    describe('signup', () => {
        it('should signup user', async () => {
            await userService.signup(DEFAULT_USER.username, DEFAULT_USER.mail, DEFAULT_USER.passwordHash);

            expect(await User.findOne({ username: DEFAULT_USER.username, mail: DEFAULT_USER.mail })).toBeDefined();
        });

        it('should signup user with all extra info', async () => {
            const userData = {
                ...DEFAULT_USER,
                name: 'John',
                surname: 'Doe',
                birthday: new Date(2001, 6, 29),
                factChecker: true,
                organization: 'Hello',
            };

            await userService.signup(
                userData.username,
                userData.mail,
                userData.passwordHash,
                userData.name,
                userData.surname,
                userData.birthday,
                userData.factChecker,
                userData.organization,
            );

            const res = await User.findOne({ username: userData.username, mail: userData.mail });

            expect(res?.name).toEqual(userData.name);
            expect(res?.surname).toEqual(userData.surname);
            expect(res?.birthday).toEqual(userData.birthday);
            expect(res?.factChecker).toEqual(userData.factChecker);
            expect(res?.organization).toEqual(userData.organization);
        });

        it('should reject if username already exists', async () => {
            const user = new User(DEFAULT_USER);
            await user.save();

            return expect(
                userService.signup(DEFAULT_USER.username, 'othermail', 'otherpassword'),
            ).rejects.toBeDefined();
        });

        it('should reject if mail already exists', async () => {
            const user = new User(DEFAULT_USER);
            await user.save();

            return expect(
                userService.signup('otherusername', DEFAULT_USER.mail, 'otherpassword'),
            ).rejects.toBeDefined();
        });

        it('should reject if organization is provided for non-fact-checker', async () => {
            return expect(
                userService.signup(
                    DEFAULT_USER.username,
                    DEFAULT_USER.mail,
                    DEFAULT_USER.passwordHash,
                    undefined,
                    undefined,
                    undefined,
                    false,
                    'organization',
                ),
            ).rejects.toBeDefined();
        });

        it('should reject if organization is not provided for fact-checker', async () => {
            return expect(
                userService.signup(
                    DEFAULT_USER.username,
                    DEFAULT_USER.mail,
                    DEFAULT_USER.passwordHash,
                    undefined,
                    undefined,
                    undefined,
                    true,
                    undefined,
                ),
            ).rejects.toBeDefined();
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

    describe('trustUser', () => {
        let user1: IUser & Document;
        let user2: IUser & Document;

        beforeEach(async () => {
            user1 = new User(DEFAULT_USER);
            user2 = new User(DEFAULT_USER_2);

            await Promise.all([user1.save(), user2.save()]);
        });

        it('should trust user', async () => {
            await userService.trustUser(user1._id.toString(), user2._id.toString());

            user1 = (await User.findById(user1._id))!;

            expect(user1.trustedUsers).toContainEqual(user2._id);
        });

        it('should remove from untrusted users', async () => {
            user1.updateOne({ _id: user1._id }, { $push: { untrustedUsers: user2._id } });

            await userService.trustUser(user1._id.toString(), user2._id.toString());

            user1 = (await User.findById(user1._id))!;

            expect(user1.untrustedUsers).not.toContainEqual(user2._id);
        });
    });

    describe('untrustUser', () => {
        let user1: IUser & Document;
        let user2: IUser & Document;

        beforeEach(async () => {
            user1 = new User(DEFAULT_USER);
            user2 = new User(DEFAULT_USER_2);

            await Promise.all([user1.save(), user2.save()]);
        });

        it('should untrust user', async () => {
            await userService.untrustUser(user1._id.toString(), user2._id.toString());

            user1 = (await User.findById(user1._id))!;

            expect(user1.untrustedUsers).toContainEqual(user2._id);
        });

        it('should remove from trusted users', async () => {
            user1.updateOne({ _id: user1._id }, { $push: { trustedUsers: user2._id } });

            await userService.untrustUser(user1._id.toString(), user2._id.toString());

            user1 = (await User.findById(user1._id))!;

            expect(user1.trustedUsers).not.toContainEqual(user2._id);
        });
    });

    describe('getUserProfile', () => {
        let user1: IUser & Document;
        let user2: IUser & Document;

        beforeEach(async () => {
            user1 = new User(DEFAULT_USER);
            user2 = new User(DEFAULT_USER_2);

            await Promise.all([user1.save(), user2.save()]);
        });

        it('should get user profile', async () => {
            const profile = await userService.getUserProfile(user2._id.toString());

            expect(profile).toBeDefined();
            expect(profile.userData.username).toEqual(user2.username);
        });

        it('should return last posts', async () => {
            const posts = await Promise.all([
                container.resolve(PostService).publishPost(user2._id, { text: 'Hello' }),
                container.resolve(PostService).publishPost(user2._id, { text: 'Hola' }),
            ]);

            const profile = await userService.getUserProfile(user2._id.toString());
            const postsIds = posts.map((post) => post._id);

            expect(profile).toBeDefined();

            for (const post of posts) {
                expect(postsIds).toContainEqual(post._id);
            }
        });
    });
});
