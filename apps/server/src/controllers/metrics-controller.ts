import { Router } from 'express';
import { singleton } from 'tsyringe';
import { AbstractController } from './abstract-controller';
import { MetricsService, likePost, dislikePost, trustPost, distrustPost } from '../services/metrics-service';
import { StatusCodes } from 'http-status-codes';

@singleton()
export class MetricsController extends AbstractController {
    constructor(private readonly metricService: MetricsService) {
        super();
    }

    protected configureRoutes(router: Router) {
        router.post('/user/likepost', async(req, res, next) => {
            const userId = req.body.userId;
            const postId = req.body.postId;
            try {
                const updatedMetrics = await likePost(userId, postId);
                if (!updatedMetrics) {
                    res.status(StatusCodes.NOT_FOUND).send('Post not found !!!');
                }
                res.status(StatusCodes.OK).send('Post liked !!!');
                res.json(updatedMetrics);
            } catch (error) {
                next(error);
            }
        });

        router.post('/user/dislikepost', async(req, res, next) => {
            const userId = req.body.userId;
            const postId = req.body.postId;
            try {
                const updatedMetrics = await dislikePost(userId, postId);
                if (!updatedMetrics) {
                    res.status(StatusCodes.NOT_FOUND).send('Post not found !!!');
                }
                res.status(StatusCodes.OK).send('Post liked !!!');
                res.json(updatedMetrics);
            } catch (error) {
                next(error);
            }
        });

        router.post('/user/trustpost', async(req, res, next) => {
            const userId = req.body.userId;
            const postId = req.body.postId;
            try {
                const updatedMetrics = await trustPost(userId, postId);
                if (!updatedMetrics) {
                    res.status(StatusCodes.NOT_FOUND).send('Post not found !!!');
                }
                res.status(StatusCodes.OK).send('Post liked !!!');
                res.json(updatedMetrics);
            } catch (error) {
                next(error);
            }
        });

        router.post('/user/distrustpost', async(req, res, next) => {
            const userId = req.body.userId;
            const postId = req.body.postId;
            try {
                const updatedMetrics = await distrustPost(userId, postId);
                if (!updatedMetrics) {
                    res.status(StatusCodes.NOT_FOUND).send('Post not found !!!');
                }
                res.status(StatusCodes.OK).send('Post liked !!!');
                res.json(updatedMetrics);
            } catch (error) {
                next(error);
            }
        });
    }
    
}