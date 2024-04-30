import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';
import { HttpException } from '../models/http-exception';
import User from '../models/user';
import { DatabaseService } from './database-service/database-service';

@singleton()
export class UserService {
    constructor(private readonly databaseService: DatabaseService) {}

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

        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        const [day, month, year] = birthday.split('/');
        const birthdayDate = new Date(Number(year), Number(month) - 1, Number(day));
        const user = new User({
            username: username,
            mail: mail,
            passwordHash: passwordHash,
            name: name,
            surname: surname,
            birthday: birthdayDate,
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
