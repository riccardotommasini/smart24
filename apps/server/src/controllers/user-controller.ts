import crypto from 'crypto';
import { Request, Response, Router, RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import { singleton } from 'tsyringe';
import User from '../models/user';
import { AbstractController } from './abstract-controller';
import { StatusCodes } from 'http-status-codes';
import { UserService } from '../services/user-service';

@singleton()
export class UserController extends AbstractController {
    constructor(private readonly userService: UserService) {
        super();
    }

    protected configureRoutes(router: Router) {
        router.post('/user/create', (req, res, next) => {
            this.userService.user_create_post.forEach((handler) => handler(req, res, next));
        });

        router.post('/user/trustUser', (req, res, next) => {
            this.userService.user_trustUser_post.forEach((handler) => handler(req, res, next));
        })

        router.post('/user/untrustUser', (req, res, next) => {
            this.userService.user_untrustUser_post.forEach((handler) => handler(req, res, next));
        })
    }
}
