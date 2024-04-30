import { body } from 'express-validator';
import User, { IUser } from '../models/user';
import { Post } from '../models/post';
import { singleton } from 'tsyringe';
import { DatabaseService } from './database-service/database-service';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../utils/env';
import { HttpException } from '../models/http-exception';
import mongoose, { Document, Types } from 'mongoose';

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

    validators = [
        body('username', 'Username must not be empty.').trim().isLength({ min: 1 }).escape(),
        body('mail', 'Email must not be empty.').trim().isLength({ min: 1 }).escape(),
        body('password', 'Password must not be empty.').trim().isLength({ min: 1 }).escape(),
    ];

    public async login(username: string, password: string) {
        const foundUser = await User.findOne({ username });

        if (!foundUser) {
            throw new Error('UserName of user is not correct');
        }

        const isMatch = bcrypt.compareSync(password, foundUser.passwordHash);

        if (isMatch) {
            const token = jwt.sign({ _id: foundUser._id?.toString(), name: foundUser.name }, env.SECRET_KEY, {
                expiresIn: '2 days',
            });

            return { user: { mail: foundUser.mail, username: foundUser.username }, token: token };
        } else {
            throw new Error('Password is not correct');
        }
    }

    public async loadSession(token: string): Promise<[user: IUser & Document, decoded: JwtPayload]> {
        const decoded = jwt.verify(token, env.SECRET_KEY) as JwtPayload;

        const foundUser = await User.findById(decoded._id);

        if (!foundUser) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, 'User not found');
        }

        return [foundUser, decoded];
    }

    /*
    Test :
    curl -X POST -H "Content-Type: application/json" -d '{"username":"momo","mail":"a@gmail.com","password":"azerty"}' http://localhost:3000/user/create
    curl -X POST -H "Content-Type: application/json" -d '{"otherUserId": "6630be9d130907c60efc4aaa"}' http://localhost:3000/user/trustUser
    */

    async user_trustUser_post(userId: string, otherUserId: string) {
        const otherUserIdObject = new mongoose.Types.ObjectId(otherUserId);

        await Promise.all([
            User.updateOne(
                { _id: userId, trustedUsers: { $ne: otherUserIdObject } },
                { $push: { trustedUsers: otherUserIdObject } },
            ),
            User.updateOne({ _id: userId }, { $pull: { untrustedUsers: { $in: [otherUserIdObject] } } }),
        ]);
    }

    /*
    Test :
    curl -X POST -H "Content-Type: application/json" -d '{"username":"momo","mail":"a@gmail.com","password":"azerty"}' http://localhost:3000/user/create
    curl -X POST -H "Content-Type: application/json" -d '{"otherUserId": "6630be9d130907c60efc4aaa"}' http://localhost:3000/user/untrustUser
    */
    async user_untrustUser_post(userId: string, otherUserId: string) {
        const otherUserIdObject = new mongoose.Types.ObjectId(otherUserId);

        await Promise.all([
            User.updateOne(
                { _id: userId, untrustedUsers: { $ne: otherUserIdObject } },
                { $push: { untrustedUsers: otherUserIdObject } },
            ),
            User.updateOne({ _id: userId }, { $pull: { trustedUsers: { $in: [otherUserIdObject] } } }),
        ]);
    }

    /*
    Test :
    curl -X POST -H "Content-Type: application/json" -d '{"otherUserId": "6630be9d130907c60efc4aaa"}' http://localhost:3000/user/visitUserProfile
    */
    async user_visitUserProfile_post(otherUserId: string) {
        let otherUserInfo = new User();
        let lastPostsByUser = [];
        const otherUserIdObject = new mongoose.Types.ObjectId(otherUserId);

        //retrieve data of other user
        User.findById(otherUserId)
            .then((foundUser) => {
                if (!foundUser) {
                    return;
                }

                otherUserInfo = foundUser;

                const pipeline: mongoose.PipelineStage[] = [
                    { $match: { createdBy: otherUserIdObject } },
                    { $sort: { date: -1 } },
                    { $limit: 50 },
                ];

                return Post.aggregate(pipeline);
            })
            .then((res) => {
                if (!res) {
                    return;
                }
                lastPostsByUser = res;

                //send response
                const response = {
                    userData: otherUserInfo,
                    lastPosts: lastPostsByUser,
                };

                return response;
            });
    }

    async saveUser(
        username: string,
        mail: string,
        password: string,
        name: string,
        surname: string,
        birthday: string,
        factChecker: boolean,
        organization: string,
    ) {
        if (!factChecker && organization) {
            throw new HttpException(StatusCodes.BAD_REQUEST, 'organization must be empty for non-fact-checkers');
        } else if (factChecker && !organization) {
            throw new HttpException(StatusCodes.BAD_REQUEST, 'organization must be provided for fact-checker');
        }

        const existingUser = await User.findOne({ $or: [{ username: username }, { mail: mail }] });
        if (existingUser) {
            throw new HttpException(StatusCodes.BAD_REQUEST, 'Username or email already exists');
        }

        // const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        let birthdayDate: Date;
        if (birthday) {
            const [day, month, year] = birthday.split('/');
            birthdayDate = new Date(Number(year), Number(month) - 1, Number(day));
        }
        const user = new User({
            username: username,
            mail: mail,
            passwordHash: password,
            name: name,
            surname: surname,
            birthday: birthdayDate!,
            factChecker: factChecker,
            organization: organization,
        });

        try {
            await user.save();
        } catch (error) {
            console.error(error);
            throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, 'Error saving user');
        }
    }
}
