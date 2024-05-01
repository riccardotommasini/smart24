import { Request, Router } from 'express';
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
    constructor(private readonly userService: UserService,
                private readonly metricsService: MetricsService
    ) {
        super();
    }

    protected configureRoutes(router: Router) {
        router.post(
            '/login',
            body('username', 'is required').trim().isLength({ min: 1 }),
            body('password', 'is required').trim().isLength({ min: 1 }),
            async (req: Request<object, object, { username: string; password: string }>, res, next) => {
                try {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        throw new HttpException(StatusCodes.BAD_REQUEST, 'Invalid request', errors);
                    }

                    res.status(StatusCodes.OK).send(await this.userService.login(req.body.username, req.body.password));
                } catch (error) {
                    next(error);
                }
            },
        );

        router.post(
            '/user/create',
            body('username', 'is required').trim().notEmpty(),
            body('mail', 'is required').trim().notEmpty(),
            body('mail', 'must be a valid email').isEmail(),
            body('password', '`password` of length >=5 is required').trim().isLength({ min: 5 }),
            body('birthday', '`birthday` must be a valid date').isISO8601().toDate().optional(),
            async (req: AuthRequest, res, next) => {
                try {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        throw new HttpException(StatusCodes.BAD_REQUEST, 'Invalid request', errors);
                    }

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
            '/user/likepost',
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
            '/user/dislikepost',
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
            '/user/trustpost',
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
            '/user/untrustpost',
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
    }
}



