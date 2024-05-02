import User, { IUser, IUserCreation, IUserSession } from '../../models/user';
import { singleton } from 'tsyringe';
import bcryptjs from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { HttpException } from '../../models/http-exception';
import { StatusCodes } from 'http-status-codes';
import { Document } from 'mongoose';
import { UserService } from '../user-service';
import { env } from '../../utils/env';

@singleton()
export class AuthService {
    constructor(private readonly userService: UserService) {}

    public async login(username: string, password: string): Promise<IUserSession> {
        const foundUser = await User.findOne({ username });

        if (!foundUser) {
            throw new Error('UserName of user is not correct');
        }

        const isMatch = bcryptjs.compareSync(password, foundUser.passwordHash);

        if (isMatch) {
            return {
                user: { _id: foundUser._id.toString(), name: foundUser.name, surname: foundUser.surname, username: foundUser.username },
                token: this.createSessionToken(foundUser),
            };
        } else {
            throw new Error('Password is not correct');
        }
    }

    async signup(user: IUserCreation): Promise<IUserSession> {
        if (!user.factChecker !== !user.organization) {
            throw new HttpException(
                StatusCodes.BAD_REQUEST,
                '`organization` is required for fact-checkers and must be empty for non-fact-checkers',
            );
        }

        const createdUser = await this.userService.createUser(user);

        return {
            user: { _id: createdUser._id.toString(), name: createdUser.name, surname: createdUser.surname, username: createdUser.username  },
            token: this.createSessionToken(createdUser),
        };
    }

    public async loadSession(token: string): Promise<[user: IUser & Document, decoded: JwtPayload]> {
        const decoded = jwt.verify(token, env.SECRET_KEY) as JwtPayload;

        const foundUser = await this.userService.getUser(decoded._id);

        return [foundUser, decoded];
    }

    private createSessionToken(user: IUser & Document) {
        return jwt.sign({ _id: user._id?.toString(), username: user.username }, env.SECRET_KEY, {
            expiresIn: '2 days',
        });
    }
}
