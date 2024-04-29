import { Schema } from 'mongoose';
import { DateTime } from 'luxon';
import { Post } from './post';

const CommentSchema = new Schema({
    post: { type: Schema.Types.ObjectId, ref: 'Post' }, // reference to the associated post
    text: { type: String, required: true },
    date: { type: DateTime, required: true, default: DateTime.now() },
});

// Create a Comment model that inherits from Post
const Comment = Post.discriminator('Comment', CommentSchema);

export { Comment };
