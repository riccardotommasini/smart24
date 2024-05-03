import { StatusCodes } from 'http-status-codes';
import { Document } from 'mongoose';
import { singleton } from 'tsyringe';
import { Comment, CommentDocument, ICreateComment } from '../../models/comment';
import { HttpException } from '../../models/http-exception';
import { Metrics } from '../../models/metrics';
import { ICreatePost, IPost, Post } from '../../models/post';
import { NonStrictObjectId } from '../../utils/objectid';
import { UserService } from '../user-service';

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

    async publishComment(userId: NonStrictObjectId, newComment: ICreateComment): Promise<Document & IPost> {
        await this.userService.getUser(userId);
        await this.getPost(newComment.parentPostId.toString());

        const metrics = new Metrics({});
        await metrics.save();

        const comment = new Comment({
            text: newComment.text,
            image: newComment.image,
            createdBy: userId,
            metrics: metrics._id,
            parentPostId: newComment.parentPostId,
        });

        await comment.save();

        return comment;
    }

    async getPost(postId: NonStrictObjectId): Promise<Document & IPost> {
        const post = await Post.findOne({ _id: postId });

        if (!post) {
            throw new HttpException(StatusCodes.NOT_FOUND, `No post found with ID ${postId}`);
        }

        return post;
    }

    async getPostComments(postId: NonStrictObjectId): Promise<(Document & CommentDocument)[]> {
        const commentsQuery = Comment.find({ parentPostId: postId })
            .sort({ date: -1 })
            .limit(50)
            .populate('createdBy', 'username _id')
            .populate('metrics');

        const res = await commentsQuery.exec();
        console.log('comments = ', res);
        console.log('length = ', res.length);
        /* const promises = res.map(async (comment: Document & CommentDocument) => {
            comment.comments = await this.getPostComments(comment._id);
            return comment;
        }); */
        for (let i = 0; i < res.length; i++) {
            res[i]['comments'] = await this.getPostComments(res[i]._id);
            console.log('commentaires = ', res[i].comments);
        }

        //await Promise.all(promises);
        console.log(res);
        return res;
    }

    async getMetricsId(postId: NonStrictObjectId): Promise<string> {
        return (await this.getPost(postId)).metrics.toString();
    }
}
