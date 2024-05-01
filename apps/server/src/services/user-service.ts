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

    async createUser(user: IUserCreation): Promise<IUser & Document> {
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
