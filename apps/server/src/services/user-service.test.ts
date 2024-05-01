import mongoose, { Document, Types } from 'mongoose';
import { container } from 'tsyringe';
import User, { IUser } from '../models/user';
import { DatabaseService } from './database-service/database-service';
import { PostService } from './post-service/post-service';
import { UserService } from './user-service';

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

    describe('updateUser', () => {
        let user: IUser & Document;

        beforeEach(async () => {
            user = new User(DEFAULT_USER);
            await user.save();
        });

        it('should update user', async () => {
            const updated = await userService.updateUser(user._id.toString(), {
                username: 'newusername',
                mail: 'newmail',
                passwordHash: 'newpassword',
            });

            expect(updated).toBeDefined();
            expect(updated?.username).toEqual('newusername');
            expect(updated?.mail).toEqual('newmail');
        });

        it('should not update username if already exists', async () => {
            const user2 = new User(DEFAULT_USER_2);
            await user2.save();

            return expect(
                userService.updateUser(user._id.toString(), {
                    username: DEFAULT_USER_2.username,
                    mail: 'newmail',
                    passwordHash: 'newpassword',
                }),
            ).rejects.toBeDefined();
        });

        it('should not update mail if already exists', async () => {
            const user2 = new User(DEFAULT_USER_2);
            await user2.save();

            return expect(
                userService.updateUser(user._id.toString(), {
                    username: 'newusername',
                    mail: DEFAULT_USER_2.mail,
                    passwordHash: 'newpassword',
                }),
            ).rejects.toBeDefined();
        });

        it('should not update password if not provided', async () => {
            const updated = await userService.updateUser(user._id.toString(), {
                username: 'newusername',
                mail: 'newmail',
            });

            expect(updated).toBeDefined();
            expect(updated?.passwordHash).toEqual(user.passwordHash);
        });

        it('should not add a new field if the field is not in the interface definition', async () => {
            const updated = await userService.updateUser(user._id.toString(), {
                username: 'newusername',
                mail: 'newmail',
                passwordHash: 'newpassword',
                newField: 'newField',
            });

            expect(updated).toBeDefined();
            expect(updated?.newField).toBeUndefined();
            expect(updated?.username).toEqual('newusername');
        });

        it('should update parameters', async () => {
            const updated = await userService.updateUser(user._id.toString(), {
                parameters: {
                    rateFactChecked: 5,
                    rateDiversification: 19,
                },
            });

            expect(updated).toBeDefined();
            expect(updated?.parameters.rateFactChecked).toEqual(5);
            expect(updated?.parameters.rateDiversification).toEqual(19);
        });
    });
});
