import User, { IUser, IUserCreation } from '../models/user';
import { Post } from '../models/post';
import { singleton } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from '../models/http-exception';
import { Document, UpdateQuery } from 'mongoose';
import { NonStrictObjectId } from 'src/utils/objectid';

@singleton()
export class UserService {
    async getUser(userId: NonStrictObjectId): Promise<IUser> {
        const user = await User.findById(userId);

        if (!user) {
            throw new HttpException(StatusCodes.NOT_FOUND, `No user found with ID ${userId}`);
        }

        return user;
    }
  
    public async login(username: string, password: string) {
        const foundUser = await User.findOne({ username });
        console.log(foundUser);

        if (!foundUser) {
            throw new Error('UserName of user is not correct');
        }

        const isMatch = bcryptjs.compareSync(password, foundUser.passwordHash);

        if (isMatch) {
            const token = jwt.sign({ _id: foundUser._id?.toString(), name: foundUser.name }, env.SECRET_KEY, {
                expiresIn: '2 days',
            });

            return { user: { name: foundUser.name, surname: foundUser.surname, username: foundUser.username }, token: token };
        } else {
            throw new Error('Password is not correct');
        }
    }

    async signup(
        username: string,
        mail: string,
        password: string,
        name?: string,
        surname?: string,
        birthday?: Date,
        factChecker?: boolean,
        organization?: string,
    ): Promise<IUser & Document> {
        if (!factChecker && organization) {
            throw new HttpException(StatusCodes.BAD_REQUEST, 'organization must be empty for non-fact-checkers');
        } else if (factChecker && !organization) {
            throw new HttpException(StatusCodes.BAD_REQUEST, 'organization must be provided for fact-checker');
        }

        const existingUser = await User.findOne({ $or: [{ username: user.username }, { mail: user.mail }] });

        if (existingUser) {
            throw new HttpException(StatusCodes.BAD_REQUEST, 'Username or email already exists');
        }

        const newUser = new User({ ...user, passwordHash: user.password });
        await newUser.save();

        return newUser;
    }

    async updateUser(userId: NonStrictObjectId, update: UpdateQuery<IUser>): Promise<IUser | null> {
        const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true });
        return updatedUser;
    }

    async trustUser(userId: NonStrictObjectId, otherUserId: NonStrictObjectId) {
        await Promise.all([
            User.updateOne(
                { _id: userId, trustedUsers: { $ne: otherUserId } },
                { $push: { trustedUsers: otherUserId } },
            ),
            User.updateOne({ _id: userId }, { $pull: { untrustedUsers: { $in: [otherUserId] } } }),
        ]);
    }

    async untrustUser(userId: NonStrictObjectId, otherUserId: NonStrictObjectId) {
        await Promise.all([
            User.updateOne(
                { _id: userId, untrustedUsers: { $ne: otherUserId } },
                { $push: { untrustedUsers: otherUserId } },
            ),
            User.updateOne({ _id: userId }, { $pull: { trustedUsers: { $in: [otherUserId] } } }),
        ]);
    }

    async getUserProfile(otherUserId: NonStrictObjectId) {
        const userData = await this.getUser(otherUserId);
        const lastPosts = await Post.aggregate([
            { $match: { createdBy: otherUserId } },
            { $sort: { date: -1 } },
            { $limit: 50 },
        ]);

        return {
            userData,
            lastPosts,
        };
    }
}
