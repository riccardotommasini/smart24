import { NextFunction, Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';
import { UserService } from '../services/user-service';
import { AbstractController } from './abstract-controller';
import { AuthRequest, auth } from '../middleware/auth';

@singleton()
export class UserController extends AbstractController {
    constructor(private readonly userService: UserService) {
        super();
    }

    protected configureRoutes(router: Router) {
        router.post(
            '/login',
            body('username', '`username` is required to login'),
            body('password', '`password` is required to login'),
            async (req: Request<object, object, { username: string; password: string }>, res, next) => {
                try {
                    const foundUser = await this.userService.login(req.body.username, req.body.password);
                    res.status(200).send(foundUser);
                } catch (error) {
                    next(error);
                }
            },
        );

        router.post(
            '/user/create',
            body('username', '`username` is required').trim().notEmpty(),
            body('mail', 'valid `mail` is required').trim().isEmail(),
            body('password', '`password` of length >=5 is required').trim().isLength({ min: 5 }),
            body('birthday', '`birthday` must be valid date').isDate().toDate().optional(),
            body('factChecker', '`factChecker` must be a valid boolean').isBoolean(),
            async (req: AuthRequest, res, next) => {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
                }
                try {
                    res.status(StatusCodes.OK).send(
                        await this.userService.signup(
                            req.body.username,
                            req.body.mail,
                            req.body.password,
                            req.body.name,
                            req.body.surname,
                            req.body.birthday,
                            req.body.factChecker,
                            req.body.organization,
                        ),
                    );
                } catch (e) {
                    next(e);
                }
            },
        );

        router.post(
            '/user/trustUser',
            auth,
            body('otherUserId', '`otherUserId` is required'),
            (req: AuthRequest<object, { otherUserId: string }>, res: Response, next: NextFunction) => {
                try {
                    this.userService.trustUser(req.user!._id, req.body.otherUserId);
                    res.status(StatusCodes.OK).send();
                } catch (error) {
                    next();
                }
            },
        );

        router.post(
            '/user/untrustUser',
            auth,
            body('otherUserId', '`otherUserId` is required'),
            (req: AuthRequest<object, { otherUserId: string }>, res: Response, next: NextFunction) => {
                try {
                    this.userService.untrustUser(req.user!._id, req.body.otherUserId);
                    res.status(StatusCodes.OK).send();
                } catch (error) {
                    next();
                }
            },
        );

        router.post(
            '/user/visitUserProfile',
            auth,
            body('otherUserId', '`otherUserId` is required'),
            (req: AuthRequest<object, { otherUserId: string }>, res: Response, next: NextFunction) => {
                try {
                    this.userService.getUserProfile(req.body.otherUserId);
                    res.status(StatusCodes.OK).send();
                } catch (error) {
                    next();
                }
            },
        );
    }
}
