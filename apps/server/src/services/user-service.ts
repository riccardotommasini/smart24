import User, { IUser, IUserCreation } from '../models/user';
import { Post } from '../models/post';
import { singleton } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from '../models/http-exception';
import mongoose, { Document, Types, UpdateQuery } from 'mongoose';

@singleton()
export class UserService {
    async getUser(userId: Types.ObjectId | string): Promise<IUser> {
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

    async updateUser(userId: string, update: UpdateQuery<IUser>): Promise<IUser | null> {
        const userObjectId = new Types.ObjectId(userId);
        const updatedUser = await User.findByIdAndUpdate(userObjectId, update, { new: true });
        return updatedUser;
    }

    async trustUser(userId: string, otherUserId: string) {
        const otherUserIdObject = new mongoose.Types.ObjectId(otherUserId);

        await Promise.all([
            User.updateOne(
                { _id: userId, trustedUsers: { $ne: otherUserIdObject } },
                { $push: { trustedUsers: otherUserIdObject } },
            ),
            User.updateOne({ _id: userId }, { $pull: { untrustedUsers: { $in: [otherUserIdObject] } } }),
        ]);
    }

    async untrustUser(userId: string, otherUserId: string) {
        const otherUserIdObject = new mongoose.Types.ObjectId(otherUserId);

        await Promise.all([
            User.updateOne(
                { _id: userId, untrustedUsers: { $ne: otherUserIdObject } },
                { $push: { untrustedUsers: otherUserIdObject } },
            ),
            User.updateOne({ _id: userId }, { $pull: { trustedUsers: { $in: [otherUserIdObject] } } }),
        ]);
    }

    async getUserProfile(otherUserId: string) {
        const otherUserIdObject = new Types.ObjectId(otherUserId);

        const userData = await this.getUser(otherUserIdObject);
        const lastPosts = await Post.aggregate([
            { $match: { createdBy: otherUserIdObject } },
            { $sort: { date: -1 } },
            { $limit: 50 },
        ]);

        return {
            userData,
            lastPosts,
        };
    }
}
