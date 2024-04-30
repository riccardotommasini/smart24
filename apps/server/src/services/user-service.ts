import { singleton } from 'tsyringe';
import { DatabaseService } from './database-service/database-service';
import User from '../models/user';
import { StatusCodes } from 'http-status-codes';
import { DocumentDefinition } from 'mongoose';
import UserSchema, { IUser } from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env';
import { HttpException } from '../models/http-exception';

@singleton()
export class UserService {
    constructor(private readonly databaseService: DatabaseService) {}

    public async login(user: DocumentDefinition<IUser>) {
        const foundUser = await UserSchema.findOne({ username: user.username });

        if (!foundUser) {
            throw new Error('UserName of user is not correct');
        }

        const isMatch = bcrypt.compareSync(user.passwordHash, foundUser.passwordHash);

        if (isMatch) {
            const token = jwt.sign({ _id: foundUser._id?.toString(), name: foundUser.name }, env.SECRET_KEY, {
                expiresIn: '2 days',
            });

            return { user: { mail: foundUser.mail, username: foundUser.username }, token: token };
        } else {
            throw new Error('Password is not correct');
        }
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
