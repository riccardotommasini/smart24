import { Router } from 'express';
import { singleton } from 'tsyringe';
import { AbstractController } from '../abstract-controller';
import { MetricsService } from '../../services/metrics-service/metrics-service';
import { StatusCodes } from 'http-status-codes';
import { AuthRequest, auth } from '../../middleware/auth';

@singleton()
export class MetricsController extends AbstractController {
    constructor(private readonly metricService: MetricsService) {
        super({ basePath: '/posts' });
    }

    protected configureRoutes(router: Router) {
        router.get('/:id/metrics', auth, async (req: AuthRequest<{ id: string }>, res, next) => {
            try {
                return res.status(StatusCodes.OK).send(await this.metricService.getMetricsByPostId(req.params.id));
            } catch (e) {
                next(e);
            }
        });

        router.post('/:id/metrics/like', auth, async (req: AuthRequest<{ id: string }>, res, next) => {
            try {
                return res.status(StatusCodes.OK).send(await this.metricService.likePost(req.user!._id, req.params.id));
            } catch (e) {
                next(e);
            }
        });

        router.post('/:id/metrics/dislike', auth, async (req: AuthRequest<{ id: string }>, res, next) => {
            try {
                return res
                    .status(StatusCodes.OK)
                    .send(await this.metricService.dislikePost(req.user!._id, req.params.id));
            } catch (e) {
                next(e);
            }
        });

        router.post('/:id/metrics/trust', auth, async (req: AuthRequest<{ id: string }>, res, next) => {
            try {
                return res
                    .status(StatusCodes.OK)
                    .send(await this.metricService.trustPost(req.user!._id, req.params.id));
            } catch (e) {
                next(e);
            }
        });

        router.post('/:id/metrics/untrust', auth, async (req: AuthRequest<{ id: string }>, res, next) => {
            try {
                return res
                    .status(StatusCodes.OK)
                    .send(await this.metricService.untrustPost(req.user!._id, req.params.id));
            } catch (e) {
                next(e);
            }
        });
    }
}
