import { NextFunction, Response, Router } from 'express';
import { AbstractController } from '../abstract-controller';
import { PostService } from '../../services/post-service/post-service';
import { StatusCodes } from 'http-status-codes';
import { ICreatePost } from '../../models/post';
import { body, validationResult } from 'express-validator';
import { singleton } from 'tsyringe';
import { AuthRequest, auth } from '../../middleware/auth';
import { HttpException } from '../../models/http-exception';
import { ICreateComment } from '../../models/comment';

@singleton()
export class PostController extends AbstractController {
    constructor(private readonly postService: PostService) {
        super({ basePath: '/posts' });
    }

    protected configureRoutes(router: Router): void {
        router.post(
            '/',
            auth,
            body('text', 'is required').trim().isLength({ min: 1 }),
            body('image').trim().isURL().optional(),
            async (req: AuthRequest<object, ICreatePost>, res: Response, next: NextFunction) => {
                try {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        throw new HttpException(StatusCodes.BAD_REQUEST, 'Invalid request', errors);
                    }

                    res.status(StatusCodes.CREATED).send(
                        await this.postService.publishPost(req.user?._id ?? '', req.body),
                    );
                } catch (e) {
                    next(e);
                }
            },
        );
        router.post(
            '/comment',
            auth,
            body('text', 'is required').trim().isLength({ min: 1 }),
            body('image').trim().isURL().optional(),
            body('parentPostId').trim().isLength({ min: 1 }),
            async (req: AuthRequest<object, ICreateComment>, res: Response, next: NextFunction) => {
                try {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        throw new HttpException(StatusCodes.BAD_REQUEST, 'Invalid request', errors);
                    }

                    res.status(StatusCodes.CREATED).send(
                        await this.postService.publishComment(req.user?._id ?? '', req.body),
                    );
                } catch (error) {
                    next(error);
                }
            },
        );

        router.get('/post/:id', auth, async (req: AuthRequest<{ id: string }>, res, next) => {
            const postId = req.params.id;
            try {
                const post = await this.postService.getPost(postId);
                return res.status(StatusCodes.OK).send(post);
            } catch (e) {
                next(e);
            }
        });
    }
}
