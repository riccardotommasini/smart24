import { singleton } from 'tsyringe';
import mongoose, { Types, Document, Schema, UpdateQuery } from 'mongoose';
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
        const userIdObject = new mongoose.Types.ObjectId(userId);

        if (!metrics) {
            const metric = new Metrics({
                likedBy: [userIdObject],
                nbLikes: 1,
            });

            await metric.save();
        } else {
            metrics.likedBy.push(userIdObject);
            metrics.nbLikes += 1;
            await metrics.save();
        }
        return metrics;
    }

    async dislikePost(userId: string, postId: string): Promise<Document & UpdateMetrics> {
        const metrics = await this.getMetricsByPostId(postId);
        const userIdObject = new mongoose.Types.ObjectId(userId);

        if (!metrics) {
            const metric = new Metrics({
                dislikedBy: [userIdObject],
                nbDislikes: 1,
            });

            await metric.save();
        } else {
            metrics.dislikedBy.push(userIdObject);
            metrics.nbDislikes += 1;
            await metrics.save();
        }
        return metrics;
    }

    async trustPost(userId: string, postId: string): Promise<Document & UpdateMetrics> {
        const metrics = await this.getMetricsByPostId(postId);
        const userIdObject = new mongoose.Types.ObjectId(userId);

        if (!metrics) {
            const metric = new Metrics({
                trustedBy: [userIdObject],
                nbTrusts: 1,
            });

            await metric.save();
        } else {
            metrics.trustedBy.push(userIdObject);
            metrics.nbTrusts += 1;
            await metrics.save();
        }
        return metrics;
    }

    async untrustPost(userId: string, postId: string): Promise<Document & UpdateMetrics> {
        const metrics = await this.getMetricsByPostId(postId);
        const userIdObject = new mongoose.Types.ObjectId(userId);

        if (!metrics) {
            const metric = new Metrics({
                untrustedBy: [userIdObject],
                nbUntrusts: 1,
            });

            await metric.save();
        } else {
            await Metrics.updateOne(
                { _id: metrics._id },
                { $push: { untrustedBy: userIdObject }, $inc: { nbUntrusts: 1 } },
            );

            // metrics.untrustedBy.push(userIdObject);
            // metrics.nbUntrusts += 1;
            // await metrics.save();
        }
        return metrics;
    }

    async updateMetrics(metricsId: string, update: UpdateQuery<IMetrics>): Promise<IMetrics | null> {
        const metricsObjectId = new Types.ObjectId(metricsId);
        const updatedMetrics = await Metrics.findByIdAndUpdate(metricsObjectId, update, { new: true });
        return updatedMetrics;
    }
}
