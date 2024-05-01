import { Router } from 'express';
import { singleton } from 'tsyringe';
import { AbstractController } from './abstract-controller';
import { MetricsService } from '../services/metrics-service';
import { StatusCodes } from 'http-status-codes';
// import { body } from 'express-validator';
import { AuthRequest, auth } from '../middleware/auth';
import { PostService } from '../services/post-service/post-service';

@singleton()
export class MetricsController extends AbstractController {
    constructor(
        private readonly metricService: MetricsService,
        private readonly postService: PostService,
    ) {
        super();
    }

    protected configureRoutes(router: Router) {
        router.get('/post/:id/metrics', auth, async (req: AuthRequest<{ id: string }>, res, next) => {
            const postId = req.params.id;
            try {
                const metrics = await this.metricService.getMetricsByPostId(postId);
                return res.status(StatusCodes.OK).send(metrics);
            } catch (e) {
                next(e);
            }
        });
    }
}
