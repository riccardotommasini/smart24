import { NextFunction, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';
import { UserService } from '../services/user-service';
import { AbstractController } from './abstract-controller';
import { MetricsService } from '../services/metrics-service';
import { auth, AuthRequest } from '../middleware/auth';
import { HttpException } from '../models/http-exception';

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
            '/likepost',
            body('userId').trim().notEmpty(),
            body('postId').trim().notEmpty(),
            auth,
            async (req, res, next) => {
                const errors = validationResult(req);
                const userId = req.body.userId;
                const postId = req.body.postId;
                if (!errors.isEmpty()) {
                    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
                }
                try {
                    const updatedMetrics = await this.metricsService.likePost(userId, postId);
                    if (!updatedMetrics) {
                        res.status(StatusCodes.NOT_FOUND).send('Post not found !!!');
                    }
                    res.json(updatedMetrics);
                } catch (e) {
                    next(e);
                }
            },
        );

        router.post(
            '/dislikepost',
            body('userId').trim().notEmpty(),
            body('postId').trim().notEmpty(),
            auth,
            async (req, res, next) => {
                const errors = validationResult(req);
                const userId = req.body.userId;
                const postId = req.body.postId;
                if (!errors.isEmpty()) {
                    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
                }
                try {
                    const updatedMetrics = await this.metricsService.dislikePost(userId, postId);
                    if (!updatedMetrics) {
                        res.status(StatusCodes.NOT_FOUND).send('Post not found !!!');
                    }
                    res.json(updatedMetrics);
                } catch (e) {
                    next(e);
                }
            },
        );

        router.post(
            '/trustpost',
            body('userId').trim().notEmpty(),
            body('postId').trim().notEmpty(),
            auth,
            async (req, res, next) => {
                const errors = validationResult(req);
                const userId = req.body.userId;
                const postId = req.body.postId;
                if (!errors.isEmpty()) {
                    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
                }
                try {
                    const updatedMetrics = await this.metricsService.trustPost(userId, postId);
                    if (!updatedMetrics) {
                        res.status(StatusCodes.NOT_FOUND).send('Post not found !!!');
                    }
                    res.json(updatedMetrics);
                } catch (e) {
                    next(e);
                }
            },
        );

        router.post(
            '/untrustpost',
            body('userId').trim().notEmpty(),
            body('postId').trim().notEmpty(),
            auth,
            async (req: AuthRequest, res: Response, next: NextFunction) => {
                const errors = validationResult(req);
                const userId = req.body.userId;
                const postId = req.body.postId;
                if (!errors.isEmpty()) {
                    return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
                }
                try {
                    const updatedMetrics = await this.metricsService.untrustPost(userId, postId);
                    if (!updatedMetrics) {
                        res.status(StatusCodes.NOT_FOUND).send('Post not found !!!');
                    }
                    res.json(updatedMetrics);
                } catch (e) {
                    next(e);
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
    }
}
