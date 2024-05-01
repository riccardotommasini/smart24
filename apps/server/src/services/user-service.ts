import User, { IUser } from '../models/user';
import { Post } from '../models/post';
import { singleton } from 'tsyringe';
import { DatabaseService } from './database-service/database-service';
import { StatusCodes } from 'http-status-codes';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { env } from '../utils/env';
import { HttpException } from '../models/http-exception';
import mongoose, { Document, Types, UpdateQuery } from 'mongoose';

@singleton()
export class UserService {
    constructor(private readonly databaseService: DatabaseService) {}

    async getUser(userId: Types.ObjectId): Promise<IUser> {
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

        const existingUser = await User.findOne({ $or: [{ username: username }, { mail: mail }] });
        if (existingUser) {
            throw new HttpException(StatusCodes.BAD_REQUEST, 'Username or email already exists');
        }

        const user = new User({
            username,
            mail,
            passwordHash: password,
            name,
            surname,
            birthday,
            factChecker,
            organization,
        });

        try {
            await user.save();
            return user;
        } catch (error) {
            console.error(error);
            throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, 'Error saving user');
        }
    }

    async updateUser(userId: string, update: UpdateQuery<IUser>): Promise<IUser | null> {
        const userObjectId = new Types.ObjectId(userId);
        const updatedUser = await User.findByIdAndUpdate(userObjectId, update, { new: true });
        return updatedUser;
    }

    public async loadSession(token: string): Promise<[user: IUser & Document, decoded: JwtPayload]> {
        const decoded = jwt.verify(token, env.SECRET_KEY) as JwtPayload;

        const foundUser = await User.findById(decoded._id);

        if (!foundUser) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, 'User not found');
        }

        return [foundUser, decoded];
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
