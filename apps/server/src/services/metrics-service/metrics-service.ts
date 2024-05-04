import { singleton } from 'tsyringe';
import { Document, UpdateQuery } from 'mongoose';
import { Metrics, IMetrics } from '../../models/metrics';
import { PostService } from '../post-service/post-service';
import { NonStrictObjectId, toObjectId } from '../../utils/objectid';
import { RatingsLikesService } from '../ratings-services/ratings-likes-service';
import { RatingsDislikesService } from '../ratings-services/ratings-dislikes-service';
import { RatingsTrustService } from '../ratings-services/ratings-trust-service';
import { RatingsUntrustService } from '../ratings-services/ratings-untrust-service';
import { UserService } from '../user-service';

@singleton()
export class MetricsService {
    constructor(
        private readonly postService: PostService,
        private readonly ratingsLikesService: RatingsLikesService,
        private readonly ratingsDislikesService: RatingsDislikesService,
        private readonly ratingsTrustService: RatingsTrustService,
        private readonly ratingsUntrustService: RatingsUntrustService,
        private readonly userService: UserService,
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
        await this.userService.getUser(userId);
        const userIdObj = toObjectId(userId);

        if (metrics.likedBy.includes(userIdObj)) {
            metrics.likedBy = metrics.likedBy.filter((id) => !id.equals(userIdObj));
            metrics.nbLikes -= 1;
            await metrics.save();

            await this.ratingsLikesService.removeRatingsLikes(userId.toString(), postId.toString());
        } else {
            metrics.likedBy.push(userIdObj);
            metrics.nbLikes += 1;
            if (metrics.dislikedBy.includes(userIdObj)) {
                metrics.dislikedBy = metrics.dislikedBy.filter((id) => !id.equals(userIdObj));
                await this.ratingsDislikesService.removeRatingsDislikes(userId.toString(), postId.toString());
            }
            await metrics.save();

            await this.ratingsLikesService.createRatingsLikes(userId.toString(), postId.toString());
        }

        return metrics;
    }

    async dislikePost(userId: NonStrictObjectId, postId: NonStrictObjectId): Promise<Document & IMetrics> {
        const metrics = await this.getMetricsByPostId(postId);
        const userIdObj = toObjectId(userId);
        await this.userService.getUser(userId);

        if (metrics.dislikedBy.includes(userIdObj)) {
            metrics.dislikedBy = metrics.dislikedBy.filter((id) => !id.equals(userIdObj));
            metrics.nbDislikes -= 1;
            await metrics.save();

            await this.ratingsDislikesService.removeRatingsDislikes(userId.toString(), postId.toString());
        } else {
            metrics.dislikedBy.push(userIdObj);
            metrics.nbDislikes += 1;
            if (metrics.likedBy.includes(userIdObj)) {
                metrics.likedBy = metrics.likedBy.filter((id) => !id.equals(userIdObj));
                await this.ratingsLikesService.removeRatingsLikes(userId.toString(), postId.toString());
            }
            await metrics.save();

            await this.ratingsDislikesService.createRatingsDislikes(userId.toString(), postId.toString());
        }

        return metrics;
    }

    async trustPost(userId: NonStrictObjectId, postId: NonStrictObjectId): Promise<Document & IMetrics> {
        const metrics = await this.getMetricsByPostId(postId);
        const userIdObj = toObjectId(userId);
        await this.userService.getUser(userId);

        if (metrics.trustedBy.includes(userIdObj)) {
            metrics.trustedBy = metrics.trustedBy.filter((id) => !id.equals(userIdObj));
            metrics.nbTrusts -= 1;
            await metrics.save();

            await this.ratingsTrustService.removeRatingsTrust(userId.toString(), postId.toString());
        } else {
            metrics.trustedBy.push(userIdObj);
            metrics.nbTrusts += 1;
            if (metrics.untrustedBy.includes(userIdObj)) {
                metrics.untrustedBy = metrics.untrustedBy.filter((id) => !id.equals(userIdObj));
                await this.ratingsUntrustService.removeRatingsUntrust(userId.toString(), postId.toString());
            }
            await metrics.save();

            await this.ratingsTrustService.createRatingsTrust(userId.toString(), postId.toString());
        }

        return metrics;
    }

    async untrustPost(userId: NonStrictObjectId, postId: NonStrictObjectId): Promise<Document & IMetrics> {
        const metrics = await this.getMetricsByPostId(postId);
        const userIdObj = toObjectId(userId);
        await this.userService.getUser(userId);

        if (metrics.untrustedBy.includes(userIdObj)) {
            metrics.untrustedBy = metrics.untrustedBy.filter((id) => !id.equals(userIdObj));
            metrics.nbUntrusts -= 1;
            await metrics.save();

            await this.ratingsUntrustService.removeRatingsUntrust(userId.toString(), postId.toString());
        } else {
            metrics.untrustedBy.push(userIdObj);
            metrics.nbUntrusts += 1;
            if (metrics.trustedBy.includes(userIdObj)) {
                metrics.trustedBy = metrics.trustedBy.filter((id) => !id.equals(userIdObj));
                await this.ratingsTrustService.removeRatingsTrust(userId.toString(), postId.toString());
            }
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
