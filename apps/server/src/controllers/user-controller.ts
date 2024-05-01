import { NextFunction, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';
import { UserService } from '../services/user-service';
import { AbstractController } from './abstract-controller';
import { MetricsService } from '../services/metrics-service/metrics-service';
import { auth, AuthRequest } from '../middleware/auth';
import { HttpException } from '../models/http-exception';
import { IUser } from 'src/models/user';

@singleton()
export class UserController extends AbstractController {
    constructor(
        private readonly userService: UserService,
        private readonly metricsService: MetricsService,
    ) {
        super({ basePath: '/user' });
    }

    protected configureRoutes(router: Router) {
        router.get(
            '/:userId',
            auth,
            async (req: AuthRequest<{ userId: string }>, res: Response, next: NextFunction) => {
                try {
                    res.status(StatusCodes.OK).send(await this.userService.getUser(req.params.userId));
                } catch (error) {
                    next(error);
                }
            },
        );

        router.get(
            '/:userId/profile',
            auth,
            async (req: AuthRequest<{ userId: string }>, res: Response, next: NextFunction) => {
                try {
                    res.status(StatusCodes.OK).send(await this.userService.getUserProfile(req.params.userId));
                } catch (error) {
                    next(error);
                }
            },
        );

        router.post(
            '/trustUser',
            auth,
            body('otherUserId', 'is required').trim().isLength({ min: 1 }),
            async (req: AuthRequest<object, { otherUserId: string }>, res: Response, next: NextFunction) => {
                try {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        throw new HttpException(StatusCodes.BAD_REQUEST, 'Invalid request', errors);
                    }

                    await this.userService.trustUser(req.user!._id, req.body.otherUserId);
                    res.status(StatusCodes.NO_CONTENT).send();
                } catch (error) {
                    next(error);
                }
            },
        );

        router.post(
            '/untrustUser',
            auth,
            body('otherUserId', 'is required').trim().isLength({ min: 1 }),
            async (req: AuthRequest<object, { otherUserId: string }>, res: Response, next: NextFunction) => {
                try {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        throw new HttpException(StatusCodes.BAD_REQUEST, 'Invalid request', errors);
                    }

                    await this.userService.untrustUser(req.user!._id, req.body.otherUserId);
                    res.status(StatusCodes.NO_CONTENT).send();
                } catch (error) {
                    next(error);
                }
            },
        );

        router.post(
            '/user/update',
            auth,
            async (req: AuthRequest<object, IUser>, res: Response, next: NextFunction) => {
                try {
                    res.status(StatusCodes.OK).send(await this.userService.updateUser(req.user?._id, req.body));
                } catch (e) {
                    next(e);
                }
            },
        );
    }
}
