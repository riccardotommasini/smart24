import { Document, Types } from 'mongoose';
import { singleton } from 'tsyringe';
import { RatingsLikes, IRatingsLikes } from '../../models/ratings/ratings-likes';
import { PostService } from '../post-service/post-service';
import { UserService } from '../user-service';

@singleton()
export class RatingsLikesService {
    constructor(
        private readonly userService: UserService,
        private readonly postService: PostService,
    ) {}

    async createRatingsLikes(userId: string, postId: string): Promise<Document & IRatingsLikes> {
        await this.userService.getUser(userId);
        await this.postService.getPost(postId);

        const ratingsLikes = new RatingsLikes({
            user: new Types.ObjectId(userId),
            item: new Types.ObjectId(postId),
        });

        await ratingsLikes.save();

        return ratingsLikes;
    }
}
