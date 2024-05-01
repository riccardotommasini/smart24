import { ICreatePost, IPost, Post } from '../../models/post';
import { singleton } from 'tsyringe';
import { Types, Document } from 'mongoose';
import { Metrics } from '../../models/metrics';
import { UserService } from '../user-service';

@singleton()
export class PostService {
    constructor(private readonly userService: UserService) {}

    async publishPost(userId: string, newPost: ICreatePost): Promise<Document & IPost> {
        const userObjectId = new Types.ObjectId(userId);
        await this.userService.getUser(userObjectId);

        const metrics = new Metrics({});
        await metrics.save();

        const post = new Post({
            text: newPost.text,
            image: newPost.image,
            createdBy: userObjectId,
            metrics: metrics._id,
        });

        await post.save();

        return post;
    }

    async getPost(postId: string): Promise<Document & IPost> {
        const postIdObject = new Types.ObjectId(postId);
        const post = await Post.findOne({ _id: postIdObject });

        if (!post) {
            throw new Error(`No post found with ID ${postId}`);
        }

        return post;
    }
}
