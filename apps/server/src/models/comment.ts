import { Schema } from 'mongoose';
import { Post } from './post';

const CommentSchema = new Schema({
    post: { type: Schema.Types.ObjectId, ref: 'Post' }, // reference to the associated post
});

// Create a Comment model that inherits from Post
const Comment = Post.discriminator('Comment', CommentSchema);

export { Comment };
