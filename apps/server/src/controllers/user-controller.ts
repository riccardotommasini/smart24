import crypto from 'crypto';
import { Request, Response, Router, RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import { singleton } from 'tsyringe';
import User from '../models/user';
import { AbstractController } from './abstract-controller';
import { StatusCodes } from 'http-status-codes';
import { DefaultService } from '../services/default-service/default-service';

@singleton()
export class UserController extends AbstractController {
    private user_create_post: RequestHandler[];

    constructor(private readonly defaultService: DefaultService) {
        super({ basePath: '/user' });

        this.user_create_post = [
            // Validate and sanitize fields.
            body('username', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
            body('mail', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
            body('password', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
            // Process request after validation and sanitization.
    
            asyncHandler(async (req: Request, res: Response) => {
                // Extract the validation errors from a request.
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
                } else {
                    // Data from form is valid. Save book.
                    await user.save();
                    res.status(StatusCodes.OK).send('user saved !!!');
                    //res.redirect(user.url);
                }
            }),
        ];
    }
    
    protected configureRoutes(router: Router) {
        router.post('/create', this.user_create_post);
    }
}
