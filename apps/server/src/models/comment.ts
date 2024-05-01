import { Schema, Types } from 'mongoose';
import { Post, IPost, ICreatePost } from './post';

export interface ICreateComment extends ICreatePost {
    parentPostId: Types.ObjectId;
}

export interface IComment extends IPost {
    parentPostId: Types.ObjectId;
}

export const CommentSchema = new Schema<IComment>({
    parentPostId: { type: Schema.Types.ObjectId, ref: 'Post' },
});

// Create a Comment model that inherits from Post
const Comment = Post.discriminator('Comment', CommentSchema);

export { Comment };
