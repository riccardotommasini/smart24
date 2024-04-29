import crypto from 'crypto';
import { Request, Response, Router, RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import { singleton } from 'tsyringe';
import User from '../models/user';
import { AbstractController } from './abstract-controller';
import { StatusCodes } from 'http-status-codes';
import { DefaultService } from '../services/user-service';

@singleton()
export class UserController extends AbstractController {
    constructor(private readonly defaultService: DefaultService) {
        super({ basePath: '/user' });
    }

    protected configureRoutes(router: Router) {
        router.post('/create', (req, res, next) => {
            this.defaultService.user_create_post.forEach((handler) => handler(req, res, next));
        });
    }
}
