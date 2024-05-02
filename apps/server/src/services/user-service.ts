import User, { IUser, IUserCreation } from '../models/user';
import { Post } from '../models/post';
import { singleton } from 'tsyringe';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from '../models/http-exception';
import { Document, UpdateQuery, Types } from 'mongoose';
import { NonStrictObjectId } from 'src/utils/objectid';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env';

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

        if (!foundUser) {
            throw new Error('UserName of user is not correct');
        }

        const isMatch = bcryptjs.compareSync(password, foundUser.passwordHash);

        if (isMatch) {
            const token = jwt.sign({ _id: foundUser._id?.toString(), name: foundUser.name }, env.SECRET_KEY, {
                expiresIn: '2 days',
            });

            return {
                user: {
                    id: foundUser._id,
                    name: foundUser.name,
                    surname: foundUser.surname,
                    username: foundUser.username,
                },
                token: token,
            };
        } else {
            throw new Error('Password is not correct');
        }
    }

    async createUser(user: IUserCreation): Promise<IUser & Document> {
        const existingUser = await User.findOne({ $or: [{ username: user.username }, { mail: user.mail }] });

        if (existingUser) {
            throw new HttpException(StatusCodes.BAD_REQUEST, 'Username or mail already exists');
        }

        const newUser = new User({ ...user, passwordHash: user.password });
        await newUser.save();

        return newUser;
    }

    async updateUser(userId: string, update: UpdateQuery<IUser>): Promise<IUser | null> {
        const userObjectId = new Types.ObjectId(userId);

        if (update.username || update.mail) {
            const existingUser = await User.findOne({
                $or: [{ username: update.username }, { mail: update.mail }],
                _id: { $ne: userObjectId }, // Exclude the current user
            });

            // If a user with the same username or mail exists, throw an error
            if (existingUser) {
                throw new HttpException(StatusCodes.BAD_REQUEST, 'Username or mail already exists');
            }
        }
        const updatedUser = await User.findByIdAndUpdate(userObjectId, update, { new: true });
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
        const lastPosts = await Post.find({ createdBy: otherUserId })
            .sort({ date: -1 })
            .limit(50)
            .populate('createdBy', 'username mail')
            .populate('metrics');

        return {
            userData,
            lastPosts,
        };
    }
}
