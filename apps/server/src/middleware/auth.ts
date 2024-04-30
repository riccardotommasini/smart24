import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { env } from '../utils/env'

export interface CustomRequest extends Request {
 token: string | JwtPayload;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
 try {
   const token = req.header('Authorization')?.replace('Bearer ', '');

   if (!token) {
     throw new Error();
   }

   const decoded = jwt.verify(token, env.SECRET_KEY);
   (req as CustomRequest).token = decoded;

   next();
 } catch (err) {
    next(err);
 }
};
