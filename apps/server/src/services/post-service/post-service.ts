import { Document } from 'mongoose';
import { singleton } from 'tsyringe';
import { Metrics } from '../../models/metrics';
import { ICreatePost, IPost, Post } from '../../models/post';
import { UserService } from '../user-service';
import { NonStrictObjectId } from '../../utils/objectid';

@singleton()
export class PostService {
    constructor(private readonly userService: UserService) {}

    async publishPost(userId: NonStrictObjectId, newPost: ICreatePost): Promise<Document & IPost> {
        await this.userService.getUser(userId);

        const metrics = new Metrics({});
        await metrics.save();

        const post = new Post({
            text: newPost.text,
            image: newPost.image,
            createdBy: userId,
            metrics: metrics._id,
        });

        await post.save();

        return post;
    }

    async getPost(postId: NonStrictObjectId): Promise<Document & IPost> {
        const post = await Post.findOne({ _id: postId });

        if (!post) {
            throw new Error(`No post found with ID ${postId}`);
        }

        return post;
    }

    async getMetricsId(postId: NonStrictObjectId): Promise<string> {
        return (await this.getPost(postId)).metrics.toString();
    }
}
