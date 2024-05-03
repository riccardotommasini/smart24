import { Document, Types } from 'mongoose';
import { singleton } from 'tsyringe';
import { RatingsDislikes, IRatingsDislikes } from '../../models/ratings/ratings-dislikes';
import { PostService } from '../post-service/post-service';
import { UserService } from '../user-service';

@singleton()
export class RatingsDislikesService {
    constructor(
        private readonly userService: UserService,
        private readonly postService: PostService,
    ) {}

    async createRatingsDislikes(userId: string, postId: string): Promise<Document & IRatingsDislikes> {
        await this.userService.getUser(userId);
        await this.postService.getPost(postId);

        const ratingsDislikes = new RatingsDislikes({
            user: new Types.ObjectId(userId),
            item: new Types.ObjectId(postId),
        });

        await ratingsDislikes.save();

        return ratingsDislikes;
    }

    async removeRatingsDislikes(userId: string, postId: string): Promise<void> {
        await this.userService.getUser(userId);
        await this.postService.getPost(postId);

        await RatingsDislikes.findOneAndDelete({
            user: new Types.ObjectId(userId),
            item: new Types.ObjectId(postId),
        });
    }

    async hasDislikedPost(userId: string, postId: string): Promise<boolean> {
        await this.userService.getUser(userId);
        await this.postService.getPost(postId);

        return !!(await RatingsDislikes.findOne({
            user: new Types.ObjectId(userId),
            item: new Types.ObjectId(postId),
        }));
    }
}
