import { Document, Types } from 'mongoose';
import { singleton } from 'tsyringe';
import { RatingsUntrust, IRatingsUntrust } from '../../models/ratings/ratings-untrust';
import { PostService } from '../post-service/post-service';
import { UserService } from '../user-service';

@singleton()
export class RatingsUntrustService {
    constructor(
        private readonly userService: UserService,
        private readonly postService: PostService,
    ) {}

    async createRatingsUntrust(userId: string, postId: string): Promise<Document & IRatingsUntrust> {
        await this.userService.getUser(userId);
        await this.postService.getPost(postId);

        const ratingsUntrust = new RatingsUntrust({
            user: new Types.ObjectId(userId),
            item: new Types.ObjectId(postId),
        });

        await ratingsUntrust.save();

        return ratingsUntrust;
    }
}
