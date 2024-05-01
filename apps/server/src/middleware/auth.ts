import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { env } from '../utils/env';
import { HttpException } from '../models/http-exception';
import { StatusCodes } from 'http-status-codes';
import User, { IUser } from '../models/user';
import { Document } from 'mongoose';

export interface AuthRequest<
    Params extends object = Record<any, any>,
    Body extends object = Record<any, any>,
    Query extends object = Record<any, any>,
> extends Request<Params, any, Body, Query> {
    token?: string | JwtPayload;
    user?: IUser & Document;
}

export const auth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, 'You must be logged in');
        }

        const decoded = jwt.verify(token, env.SECRET_KEY) as { _id: string };

        const foundUser = await User.findById(decoded._id);

        if (!foundUser) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, 'User not found');
        }
        (req as AuthRequest).token = decoded;
        (req as AuthRequest).user = foundUser;

        next();
    } catch (err) {
        next(err);
    }
};
