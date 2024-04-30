import crypto from 'crypto';
import { Request, RequestHandler, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';
import User, { IUser } from '../models/user';
import { DatabaseService } from './database-service/database-service';
import { HttpException } from '../models/http-exception';
import { Types } from 'mongoose';

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

    async saveUser(username: string, mail: string, password: string) {
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        // http://localhost:8888/user/create?username=momo&mail=a@gmail.com&password=azerty
        // Create a Book object with escaped and trimmed data.
        const user = new User({
            username: username,
            mail: mail,
            passwordHash: passwordHash,
        });

        try {
            await user.save();
        } catch (error) {
            console.error(error);
            throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, 'Error saving user');
        }
    }

    public user_create_post: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
        // Define the validation chains
        const validationChains = [
            body('username', 'Username must not be empty.').trim().isLength({ min: 1 }).escape(),
            body('mail', 'Email must not be empty.').trim().isLength({ min: 1 }).escape(),
            body('password', 'Password must not be empty.').trim().isLength({ min: 1 }).escape(),
        ];

        // Run the validations
        for (const validation of validationChains) {
            await validation.run(req);
        }

        const errors = validationResult(req);

        const passwordHash = crypto.createHash('sha256').update(req.body.password).digest('hex');
        // http://localhost:8888/user/create?username=momo&mail=a@gmail.com&password=azerty
        // Create a Book object with escaped and trimmed data.
        const user = new User({
            username: req.body.username,
            mail: req.body.mail,
            passwordHash: passwordHash,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        } else {
            // Data from form is valid. Save user.
            try {
                await user.save();
                res.status(StatusCodes.OK).send('user saved !!!');
            } catch (error) {
                console.error(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error saving user');
            }
        }
    });
}
