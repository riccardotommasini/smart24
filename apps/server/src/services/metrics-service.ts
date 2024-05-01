import { singleton } from 'tsyringe';
import { Types, Document, Schema } from 'mongoose';
import { Metrics, UpdateMetrics, IMetrics } from '../models/metrics';
import { PostService } from './post-service/post-service';

@singleton()
export class MetricsService {
    constructor(private readonly postService: PostService) {}

    async getMetricsByPostId(postId: string): Promise<Document & IMetrics> {
        const postObjectId = new Types.ObjectId(postId);
        const post = await this.postService.getPost(postId);
        if (!post) {
            throw new Error(`No post found with ID ${postObjectId}`);
        }

        const metricsIdObject = post.metrics;
        const metrics = await this.findMetrics(metricsIdObject);
        return metrics;
    }

    async findMetrics(metricsId: Schema.Types.ObjectId): Promise<Document & IMetrics> {
        const metrics = await Metrics.findById(metricsId);

        if (!metrics) {
            throw new Error(`No metrics found with ID ${metricsId}`);
        }

        return metrics;
    }

    async likePost(userId: string, postId: string): Promise<Document & UpdateMetrics> {
        const metrics = await this.getMetricsByPostId(postId);

        if (!metrics) {
            const metric = new Metrics({
                likedBy: [userId],
                nbLikes: 1,
            });

            await metric.save();
        } else {
            metrics.likedBy.push(userId);
            metrics.nbLikes += 1;
            await metrics.save();
        }
        return metrics;
    }

    async dislikePost(userId: string, postId: string): Promise<Document & UpdateMetrics> {
        const metrics = await this.getMetricsByPostId(postId);

        if (!metrics) {
            const metric = new Metrics({
                dislikedBy: [userId],
                nbDislikes: 1,
            });

            await metric.save();
        } else {
            metrics.dislikedBy.push(userId);
            metrics.nbDislikes += 1;
            await metrics.save();
        }
        return metrics;
    }

    async trustPost(userId: string, postId: string): Promise<Document & UpdateMetrics> {
        const metrics = await this.getMetricsByPostId(postId);

        if (!metrics) {
            const metric = new Metrics({
                trustedBy: [userId],
                nbTrusts: 1,
            });

            await metric.save();
        } else {
            metrics.trustedBy.push(userId);
            metrics.nbTrusts += 1;
            await metrics.save();
        }
        return metrics;
    }

    async untrustPost(userId: string, postId: string): Promise<Document & UpdateMetrics> {
        const metrics = await this.getMetricsByPostId(postId);

        if (!metrics) {
            const metric = new Metrics({
                untrustedBy: [userId],
                nbUntrusts: 1,
            });

            await metric.save();
        } else {
            metrics.untrustedBy.push(userId);
            metrics.nbUntrusts += 1;
            await metrics.save();
        }
        return metrics;
    }
}
