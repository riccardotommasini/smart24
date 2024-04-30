import { Request, Router } from 'express';
import { AbstractController } from '../abstract-controller';
import { PostService } from '../../services/post-service/post-service';
import { StatusCodes } from 'http-status-codes';
import { ICreatePost } from '../../models/post';
import { body } from 'express-validator';
import { singleton } from 'tsyringe';

@singleton()
export class PostController extends AbstractController {
    constructor(private readonly postService: PostService) {
        super({ basePath: '/posts' });
    }

    protected configureRoutes(router: Router): void {
        router.post(
            '/',
            body('text', '`text` must not be empty').trim().isLength({ min: 1 }),
            body('image').trim().isURL().optional(),
            async (req: Request<object, ICreatePost>, res, next) => {
                try {
                    res.status(StatusCodes.CREATED).send(await this.postService.publishPost('', req.body));
                } catch (e) {
                    next(e);
                }
            },
        );
    }
}
