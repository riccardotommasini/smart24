import { singleton } from 'tsyringe';
import { Document, UpdateQuery } from 'mongoose';
import { Metrics, IMetrics } from '../../models/metrics';
import { PostService } from '../post-service/post-service';
import { NonStrictObjectId, toObjectId } from '../../utils/objectid';
import { RatingsLikesService } from '../ratings-services/ratings-likes-service';
import { RatingsDislikesService } from '../ratings-services/ratings-dislikes-service';
import { RatingsTrustService } from '../ratings-services/ratings-trust-service';
import { RatingsUntrustService } from '../ratings-services/ratings-untrust-service';

@singleton()
export class MetricsService {
    constructor(
        private readonly postService: PostService,
        private readonly ratingsLikesService: RatingsLikesService,
        private readonly ratingsDislikesService: RatingsDislikesService,
        private readonly ratingsTrustService: RatingsTrustService,
        private readonly ratingsUntrustService: RatingsUntrustService,
    ) {}

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

        if (metrics.likedBy.includes(toObjectId(userId))) {
            console.log('User already liked the post');
        } else {
            metrics.likedBy.push(toObjectId(userId));
            metrics.nbLikes += 1;
            await metrics.save();

            await this.ratingsLikesService.createRatingsLikes(userId.toString(), postId.toString());
        }

        return metrics;
    }

    async dislikePost(userId: NonStrictObjectId, postId: NonStrictObjectId): Promise<Document & IMetrics> {
        const metrics = await this.getMetricsByPostId(postId);

        if (metrics.dislikedBy.includes(toObjectId(userId))) {
            console.log('User already disliked the post');
        } else {
            metrics.dislikedBy.push(toObjectId(userId));
            metrics.nbDislikes += 1;
            await metrics.save();

            await this.ratingsDislikesService.createRatingsDislikes(userId.toString(), postId.toString());
        }

        return metrics;
    }

    async trustPost(userId: NonStrictObjectId, postId: NonStrictObjectId): Promise<Document & IMetrics> {
        const metrics = await this.getMetricsByPostId(postId);

        if (metrics.trustedBy.includes(toObjectId(userId))) {
            console.log('User already trusted the post');
        } else {
            metrics.trustedBy.push(toObjectId(userId));
            metrics.nbTrusts += 1;
            await metrics.save();

            await this.ratingsTrustService.createRatingsTrust(userId.toString(), postId.toString());
        }

        return metrics;
    }

    async untrustPost(userId: NonStrictObjectId, postId: NonStrictObjectId): Promise<Document & IMetrics> {
        const metrics = await this.getMetricsByPostId(postId);

        if (metrics.untrustedBy.includes(toObjectId(userId))) {
            console.log('User already untrusted the post');
        } else {
            metrics.untrustedBy.push(toObjectId(userId));
            metrics.nbUntrusts += 1;
            await metrics.save();

            await this.ratingsUntrustService.createRatingsUntrust(userId.toString(), postId.toString());
        }

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

    async addFactCheck(metricsId: NonStrictObjectId, factCheckId: NonStrictObjectId, factCheckGrade: number) {
        const metrics = await this.findMetrics(metricsId);
        const scoreTen = (factCheckGrade * 10) / 2;
        const newFactCheckSCore =
            (scoreTen + metrics.factCheckScore * metrics.nbFactChecks) / (metrics.nbFactChecks + 1);
        return await this.updateMetrics(metricsId, {
            $inc: { nbFactChecks: 1 },
            $push: { factChecks: factCheckId },
            $set: { factCheckScore: newFactCheckSCore },
        });
    }
}
