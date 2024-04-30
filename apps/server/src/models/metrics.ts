import mongoose, { Schema } from 'mongoose';

const MetricsSchema = new Schema({
    nbLikes: { type: Number, required: false, default: 0 },
    nbDislikes: { type: Number, required: false, default: 0 },
    nbTrusts: { type: Number, required: false, default: 0 },
    nbUntrusts: { type: Number, required: false, default: 0 },
    nbComments: { type: Number, required: false, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dislikedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    trustedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    untrustedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    sharedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    factCheckedBy: [{ type: Schema.Types.ObjectId, ref: 'FactCheck' }],
});

// Export model
const Metrics = mongoose.model('Metrics', MetricsSchema);
export default Metrics;
