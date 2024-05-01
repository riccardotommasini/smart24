import mongoose, { Schema } from 'mongoose';

import { DateTime } from 'luxon';

const options = { discriminatorKey: 'kind' };

export interface ICreatePost {
    text: string;
    image?: string;
}

export interface IPost extends ICreatePost {
    text: string;
    date: DateTime;
    image?: string;
    createdBy: mongoose.Types.ObjectId;
    metrics: mongoose.Types.ObjectId;
}

const PostSchema = new Schema<IPost>(
    {
        text: { type: String, required: true },
        date: { type: Date, required: true, default: DateTime.now() },
        image: { type: String, required: false },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        metrics: { type: Schema.Types.ObjectId, ref: 'Metrics' },
    },
    options,
);

// Export model
export const Post = mongoose.model<IPost>('Post', PostSchema);
