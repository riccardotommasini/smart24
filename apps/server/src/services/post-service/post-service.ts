import { Document, Types } from 'mongoose';
import { singleton } from 'tsyringe';
import { Metrics } from '../../models/metrics';
import { ICreatePost, IPost, Post } from '../../models/post';
import { UserService } from '../user-service';
import { HttpException } from '../../models/http-exception';
import { StatusCodes } from 'http-status-codes';
import { ICreateComment, Comment } from '../../models/comment';

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

    async publishComment(userId: string, newComment: ICreateComment): Promise<Document & IPost> {
        const userObjectId = new Types.ObjectId(userId);
        await this.userService.getUser(userObjectId);
        const parentPostId = new Types.ObjectId(newComment.parentPostId.toString());
        await this.getPost(parentPostId);

        const metrics = new Metrics({});
        await metrics.save();

        const comment = new Comment({
            text: newComment.text,
            image: newComment.image,
            createdBy: userObjectId,
            metrics: metrics._id,
            parentPostId: newComment.parentPostId,
        });

        await comment.save();

        return comment;
    }

    async getPost(postId: Types.ObjectId): Promise<IPost> {
        const post = await Post.findById(postId);

        if (!post) {
            throw new HttpException(StatusCodes.NOT_FOUND, `No post found with ID ${postId}`);
        }

        return post;
    }

    async getMetricsId(postId: Types.ObjectId): Promise<string> {
        const post = await this.getPost(postId);

        return post.metrics.toString();
    }
}
