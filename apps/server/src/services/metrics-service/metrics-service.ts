import { singleton } from 'tsyringe';
import { Document, UpdateQuery } from 'mongoose';
import { Metrics, IMetrics } from '../../models/metrics';
import { PostService } from '../post-service/post-service';
import { NonStrictObjectId, toObjectId } from '../../utils/objectid';

@singleton()
export class MetricsService {
    constructor(private readonly postService: PostService) {}

    async getMetricsByPostId(postId: NonStrictObjectId): Promise<Document & IMetrics> {
        const post = await this.postService.getPost(postId);
        return this.findMetrics(post.metrics);
    }

    async findMetrics(metricsId: NonStrictObjectId): Promise<Document & IMetrics> {
        const metrics = await Metrics.findById(metricsId);

        if (!metrics) {
            throw new Error(`No metrics found with ID ${metricsId}`);
        }

        return metrics;
    }

    async likePost(userId: NonStrictObjectId, postId: NonStrictObjectId): Promise<Document & IMetrics> {
        const metrics = await this.getMetricsByPostId(postId);

        metrics.likedBy.push(toObjectId(userId));
        metrics.nbLikes += 1;
        await metrics.save();

        return metrics;
    }

    async dislikePost(userId: NonStrictObjectId, postId: NonStrictObjectId): Promise<Document & IMetrics> {
        const metrics = await this.getMetricsByPostId(postId);

        metrics.dislikedBy.push(toObjectId(userId));
        metrics.nbDislikes += 1;
        await metrics.save();

        return metrics;
    }

    async trustPost(userId: NonStrictObjectId, postId: NonStrictObjectId): Promise<Document & IMetrics> {
        const metrics = await this.getMetricsByPostId(postId);

        metrics.trustedBy.push(toObjectId(userId));
        metrics.nbTrusts += 1;
        await metrics.save();

        return metrics;
    }

    async untrustPost(userId: NonStrictObjectId, postId: NonStrictObjectId): Promise<Document & IMetrics> {
        const metrics = await this.getMetricsByPostId(postId);

        metrics.untrustedBy.push(toObjectId(userId));
        metrics.nbUntrusts += 1;
        await metrics.save();

        return metrics;
    }

    async updateMetrics(metricsId: NonStrictObjectId, update: UpdateQuery<IMetrics>): Promise<Document & IMetrics> {
        await (await this.findMetrics(metricsId)).updateOne(update);
        return this.findMetrics(metricsId);
    }

    async getNbLikesPost(postId: NonStrictObjectId): Promise<number> {
        return (await this.getMetricsByPostId(postId)).nbLikes;
    }

    async getNbDislikesPost(postId: NonStrictObjectId): Promise<number> {
        return (await this.getMetricsByPostId(postId)).nbDislikes;
    }

    async getNbCommentsPost(postId: NonStrictObjectId): Promise<number> {
        return (await this.getMetricsByPostId(postId)).nbComments;
    }
}
