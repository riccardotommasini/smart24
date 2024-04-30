import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { env } from '../utils/env';
import { HttpException } from '../models/http-exception';
import { StatusCodes } from 'http-status-codes';
import User from '../models/user';

export interface CustomRequest extends Request {
    token: string | JwtPayload;
    username: string;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, 'You must be logged in');
        }

        const decoded = jwt.verify(token, env.SECRET_KEY) as { username: string };

        const foundUser = await User.findOne({ username: decoded.username });

        if (!foundUser) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, 'User not found');
        }
        (req as CustomRequest).token = decoded;
        (req as CustomRequest).username = decoded.username;

        next();
    } catch (err) {
        next(err);
    }
};
