import crypto from 'crypto';
import { Request, Response, Router, RequestHandler, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import { singleton } from 'tsyringe';
import User from '../models/user';
import { AbstractController } from './abstract-controller';
import { StatusCodes } from 'http-status-codes';
import { UserService } from '../services/user-service';
import { getErrorMessage } from '../utils/errors';
import { auth } from '../middleware/auth';

@singleton()
export class UserController extends AbstractController {
    constructor(private readonly userService: UserService) {
        super();
    }

    protected configureRoutes(router: Router) {
        router.post('/user/create', (req, res, next) => {
            this.userService.user_create_post.forEach((handler) => handler(req, res, next));
        });
        router.post("/login", async (req, res, next) => {
            try {
                const foundUser = await this.userService.login(req.body);
                console.log('found user', foundUser.token);
                res.status(200).send(foundUser);
            } catch (error) {
                next(error)
            }
        });
    }
}
