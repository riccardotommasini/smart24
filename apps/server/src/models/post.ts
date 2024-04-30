import mongoose, { Schema } from 'mongoose';

import { DateTime } from 'luxon';

const options = { discriminatorKey: 'kind' };

const PostSchema = new Schema(
    {
        text: { type: String, required: true },
        date: { type: DateTime, required: true, default: DateTime.now() },
        image: { type: String, required: false },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        metrics: { type: Schema.Types.ObjectId, ref: 'Metrics' },
    },
    options,
);

// Export model
const Post = mongoose.model('Post', PostSchema);

export { Post };
