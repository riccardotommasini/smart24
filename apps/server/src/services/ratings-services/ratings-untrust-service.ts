import { Document, Types } from 'mongoose';
import { singleton } from 'tsyringe';
import { PostService } from '../post-service/post-service';
import { UserService } from '../user-service';
import { RatingsUntrust } from '../../models/ratings/ratings-untrust';
import { IRatings } from '../../models/ratings/ratings';

@singleton()
export class RatingsUntrustService {
    constructor(
        private readonly userService: UserService,
        private readonly postService: PostService,
    ) {}

    async createRatingsUntrust(userId: string, postId: string): Promise<Document & IRatings> {
        await this.userService.getUser(userId);
        await this.postService.getPost(postId);

        const ratingsUntrust = new RatingsUntrust({
            user: new Types.ObjectId(userId),
            item: new Types.ObjectId(postId),
        });

        await ratingsUntrust.save();

        return ratingsUntrust;
    }

    async removeRatingsUntrust(userId: string, postId: string): Promise<void> {
        await this.userService.getUser(userId);
        await this.postService.getPost(postId);

        await RatingsUntrust.findOneAndDelete({
            user: new Types.ObjectId(userId),
            item: new Types.ObjectId(postId),
        });
    }
}
